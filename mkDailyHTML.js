var readline = require('readline');
var jsonfile = require('jsonfile')
var rimraf = require('rimraf');
var moment = require('moment');
var fs = require('fs');

var showSched = require('./showSchedule.json');
var cleanSched = [];
var timeSlots = [
  [],
  [],
  [],
  [],
  [],
  [],
  [],
];

var dayOfWk = [
  "SUN",
  "MON",
  "TUE",
  "WED",
  "THR",
  "FRI",
  "SAT",
];

// clean'n'sort calendar event data from showScehdule.json
for (var idx = 0; idx < showSched.length; idx++) {
  var show = showSched[idx];

  // strip show id from showname
  if (show.location) {
    var showName = show.location.replace(/ *\[.+ */g, "").trim()
  } else {
    var showName = "TBA";
  }

  var showClean = {
    showName: showName,
    dj: show.summary,
    description: show.description,
    startTimeRaw: show.start.dateTime,
  };

  // sort by show start time
  var startMoment = moment(show.start.dateTime);
  var startDay = startMoment.day();
  var startHour = startMoment.hour();

  var endMoment = moment(show.end.dateTime);
  var endDay = endMoment.day();
  var endHour = endMoment.hour();

  var startTimeFmtdStr = "STARTS: " +
    dayOfWk[startDay] + " " +
    startMoment.month() + "/" + startMoment.date() +  "/" + startMoment.year() + " - " + 
    dayOfWk[endDay] + " " +
    endMoment.month() + "/" + endMoment.date() +  "/" + endMoment.year() + " @ " + 
    startHour + "00 - " +
    endHour + "00";


  showClean.startDay = dayOfWk[startDay];
  showClean.startHour = startHour;
  showClean.endHour = endHour;
  showClean.startTimeFmtdStr = startTimeFmtdStr;
  cleanSched.push(showClean);

  var timeSlot = Math.floor(startHour/2);

  // push into timeSlots struct
  if (timeSlots[startDay][timeSlot]) {
    var currentShows = timeSlots[startDay][timeSlot];
    currentShows.push(showClean);
    timeSlots[startDay][timeSlot] = currentShows;
  } else {
    timeSlots[startDay][timeSlot] = [showClean];
  }
}

var html = "<div class='daily-schedule-container'>";
var log = '';

for (var day = 0; day < 7; day++) {
  html += "<div id='" + dayOfWk[day] + "' class='day-container'>";
  html += "<div class='daily-week-day'>" + dayOfWk[day] + "</div><ul>";
  for (var block = 0; block < 12; block++) {
    log += checkForDoubleBookingErrors(timeSlots[day][block]);
    html += makeTimeSlotLi(timeSlots[day][block], block);
  }
  html += "</ul></div>";
}
html += "</div>";

fs.writeFile('daily.html', html, function(err) {
  if (err) throw err;
  fs.writeFile('daily.log', log, function(err) {
    console.log('IM DONE U MFER');
    process.exit()
  });
});

function ifExistsElseTBA(val) {
  return val ? val : 'TBA';
}


function makeTimeSlotLi(timeSlot, timeSlotIdx) {
  var timeSlotTimes = [
    "12A-2A",
    "2A-4A",
    "4A-6A",
    "6A-8A",
    "8A-10A",
    "10A-12P",
    "12P-2P",
    "2P-4P",
    "4P-6P",
    "6P-8P",
    "8P-10P",
    "10P-12A",
  ];

  var li = '';
  li += "<li class='daily-show-slot'>";
  li += "<div class='daily-air-time'>" + timeSlotTimes[timeSlotIdx] + "</div>";
  if (timeSlot.length == 1) {
    li += makeTimeslotDiv(timeSlot[0]);
  } else if (timeSlot.length == 2 && !hasTimeOverlap(timeSlot[0], timeSlot[1])) {
    if (timeSlot[0].startHour < timeSlot[1].startHour) {
      li += makeTimeslotDiv(timeSlot[0]);
      li += makeTimeslotDiv(timeSlot[1]);
    } else {
      li += makeTimeslotDiv(timeSlot[1]);
      li += makeTimeslotDiv(timeSlot[0]);
    }
  }
  li += "</li>\n";
  return li;
}

function makeTimeslotDiv(timeSlot) {
  var div = "<div class='daily-show'>";
  var showName = ifExistsElseTBA(timeSlot.showName);
  div += "<div class='daily-showName'>" + escapeHtml(showName) + "</div>";
  var dj = cleanDJName(ifExistsElseTBA(timeSlot.dj));
  div += "<div class='daily-dj'>" + escapeHtml(dj) + "</div>";
  div += "</div>";
  return div;
}

function cleanDJName(djName) {
  var regExp = /\(([^)]+)\)/;
  var matches = regExp.exec(djName);

  if (matches && matches[1]) {
    return matches[1];
  } else {
    return djName;
  }
}

var entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

function escapeHtml (string) {
  var mystr = string;
  return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap (s) {
    try {
      return entityMap[s];
    } catch (err) {
      return '';
      // whatchu gunna do abt it
    }
  });
}



function checkForDoubleBookingErrors(timeSlot) {
  var log = '';
  if (timeSlot.length > 1) {
    if (timeSlot.length > 2) {
      log += "Looks like an overlap here:\n";
      for (var tripleBkngIdx = 0; tripleBkngIdx < timeSlot.length; tripleBkngIdx++) {
        log += ifExistsElseTBA(timeSlot[tripleBkngIdx].showName) + " w/ " +
          cleanDJName(ifExistsElseTBA(timeSlot[tripleBkngIdx].dj)) + " " +  timeSlot[tripleBkngIdx].startTimeFmtdStr + "\n";
      }
    } else if (hasTimeOverlap(timeSlot[0], timeSlot[1])) {
      log += "Looks like an overlap here:\n";
      log += ifExistsElseTBA(timeSlot[0].showName) + " w/ " +
        cleanDJName(ifExistsElseTBA(timeSlot[0].dj)) + " " +  timeSlot[0].startTimeFmtdStr + "\n";
      log += ifExistsElseTBA(timeSlot[1].showName) + " w/ " +
        cleanDJName(ifExistsElseTBA(timeSlot[1].dj)) + " " +  timeSlot[1].startTimeFmtdStr + "\n";
    }
  }
  return log;
}

function hasTimeOverlap(timeSlot_0, timeSlot_1) {
  return ((timeSlot_0.startHour != timeSlot_1.endHour) &&
          (timeSlot_0.endHour != timeSlot_1.startHour));
}


