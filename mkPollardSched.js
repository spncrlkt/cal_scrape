var moment = require('moment');
var fs = require('fs');

// create test file by running `node mkPollardSched.js test`
var TEST_ENV = false;
if (process.argv.length > 2) {
  if (process.argv[2] == 'test') {
    TEST_ENV = true;
  }
}

var showSched = require('./showSchedule.json');
var cleanSched = [];

var dayOfWk = [
  "SUN",
  "MON",
  "TUE",
  "WED",
  "THR",
  "FRI",
  "SAT",
];

var noShowID = [];

// clean'n'sort calendar event data from showScehdule.json
for (var idx = 0; idx < showSched.length; idx++) {
  var show = showSched[idx];

  var showClean = {
    showName: show.location,
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

  // get show id from show.summary
  var showID = "TBA";
  if (show.summary) {
    showID = getShowID(show.summary);
  }

  if (showID == 'TBA') {
    if (TEST_ENV) {
      // to build a fake testing schedule
      var fakeID = Math.floor(Math.random() * 99999);
      fakeID = ('000000000' + fakeID).substr(-5);
      showID = "[KFFP" + fakeID + "]";
    } else {
      noShowID.push(showClean);
    }
  }


  showClean.showID = showID;
  showClean.startDay = startDay;
  showClean.startHour = startHour;
  showClean.endDay = endDay;
  showClean.endHour = endHour;
  showClean.startTimeFmtdStr = startTimeFmtdStr;
  showClean.djEmail = getCleanDJEmail(show.attendees);
  cleanSched.push(showClean);
}

fs.writeFile('pollardSched.json', JSON.stringify(cleanSched, null, 2), function(err) {
  if (err) throw err;
  fs.writeFile('pollardSchedBadShows.json', JSON.stringify(noShowID, null, 2), function(err) {
    if (err) throw err;
      process.exit();
  });
});

function getCleanDJEmail(attendees) {
  if (attendees && attendees.length > 0) {
    return attendees[0].email;
  } else {
    return "NO DJ EMAIL FOUND";
  }
}

function getShowID(summary) {
  var showID = "TBA";
  var matches = summary.match(/\[.*\]/);
  if (matches) {
    showID = matches[0];
  }
  return showID;
}

