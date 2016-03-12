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

var dayTr = "<th><td>SUN</td><td>MON</td><td>TUE</td><td>WED</td><td>THU</td><td>FRI</td><td>SAT</td></th>\n";
var timeSlotTd = [
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

var styles = "<style> tr:nth-child(even) {background-color: #f2f2f2} .timeSlot {width: 72px} .show {width: 200px} </style>";

// loop over 2-hr blocks grabbing show data foreach day for to build <tr>s full of <td>s(nutz)
// S M T W R F S <- days
// 0 1 2 3 4 5 6 <- index
// 7 8 9 A B C D ... etc
var html = styles + "\n";
html += "<table>\n";
html += dayTr;

var rawDblBkng = "";
var refinedDblBkng = "";

for (var block = 0; block < 12; block++) {
  html += "<tr>\n"
  html += "<td class='timeSlot'>" + timeSlotTd[block]+ "</td>\n";
  for (var day = 0; day < 7; day++) {
    // check for double bookings
    if (timeSlots[day][block].length > 1) {
      rawDblBkng += '\n*************************';
      rawDblBkng += 'double bucked muthafucka!';
      rawDblBkng += '*************************';
      rawDblBkng += JSON.stringify(timeSlots[day][block], null, 2);
      rawDblBkng += '*************************\n';
      if (timeSlots[day][block].length > 2) {
        refinedDblBkng += "Looks like an overlap here:\n";
        for (var tripleBkngIdx = 0; tripleBkngIdx < timeSlots[day][block].length; tripleBkngIdx++) {
          refinedDblBkng += ifExistsElseTBA(timeSlots[day][block][tripleBkngIdx].showName) + " w/ " +
            cleanDJName(ifExistsElseTBA(timeSlots[day][block][tripleBkngIdx].dj)) + " " +  timeSlots[day][block][tripleBkngIdx].startTimeFmtdStr + "\n";
        }
      } else if (
        (timeSlots[day][block][0].startHour != timeSlots[day][block][1].endHour) &&
        (timeSlots[day][block][0].endHour != timeSlots[day][block][1].startHour)
      ) {
        refinedDblBkng += "Looks like an overlap here:\n";
        refinedDblBkng += ifExistsElseTBA(timeSlots[day][block][0].showName) + " w/ " +
          cleanDJName(ifExistsElseTBA(timeSlots[day][block][0].dj)) + " " +  timeSlots[day][block][0].startTimeFmtdStr + "\n";
        refinedDblBkng += ifExistsElseTBA(timeSlots[day][block][1].showName) + " w/ " +
          cleanDJName(ifExistsElseTBA(timeSlots[day][block][1].dj)) + " " +  timeSlots[day][block][1].startTimeFmtdStr + "\n";
      }
    }
    html += "<td class='show'>";
    var showName = ifExistsElseTBA(timeSlots[day][block][0].showName);
    html += "<div class='showName'>" + escapeHtml(showName) + "</div>";
    var dj = cleanDJName(ifExistsElseTBA(timeSlots[day][block][0].dj));
    html += "<div class='dj'>" + escapeHtml(dj) + "</div>";
    html += "</td>\n";
  }
  html += "</tr>\n"
}
html += "</table>\n";

function ifExistsElseTBA(val) {
  return val ? val : 'TBA';
}


fs.writeFile('table.html', html, function(err) {
  if (err) throw err;
  console.log(refinedDblBkng);
  fs.writeFile('table.log', refinedDblBking, function(err) {
    if (err) throw err;
    console.log('IM DONE U MFER');
    process.exit();
  });
});


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
