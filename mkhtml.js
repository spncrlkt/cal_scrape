var readline = require('readline');
var jsonfile = require('jsonfile')
var rimraf = require('rimraf');
var moment = require('moment');

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

for (var idx = 0; idx < showSched.length; idx++) {
  var show = showSched[idx];

  var showClean = {
    showName: show.location,
    dj: show.summary,
    description: show.description,
    startTimeRaw: show.start.dateTime,
    endTimeRaw: show.end.dateTime,
  };

  // var endMoment = moment(showClean.endTimeRaw);
  var startMoment = moment(showClean.startTimeRaw);
  var startDay = startMoment.day();
  var startHour = startMoment.hour();

  cleanSched.push(showClean);

  var timeSlot = Math.floor(startHour/2);

  if (timeSlots[startDay][timeSlot]) {
    if (startDay == 5) {debugger;}
    var currentShows = timeSlots[startDay][timeSlot];
    currentShows.push(showClean);
    timeSlots[startDay][timeSlot] = currentShows;
  } else {
    timeSlots[startDay][timeSlot] = [showClean];
  }
}

debugger;

/*
console.log(showSched.length);
console.log(cleanSched.length);
*/


/*
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('SUP:', function(code) {
  console.log(code);
});
*/

/*
getAccessToken(oauth2Client, function() {
    cal.events.list({calendarId: secrets.installed.calendar_id, auth: oauth2Client}, function(err, res) {
    if (err) {
      console.error('****ERRRORRRRR****: ' + err);
      return;
    }

    var file = './showSchedule.json'
    rimraf(file, function(err) {
      if (err) console.error('Error rimraffing: ' + err);

      jsonfile.writeFile(file, res['items'], {spaces: 2}, function(err) {
        if (err) console.error(err);
        console.log('Succesful!');
        return;
      })
    });
  });
});
*/
