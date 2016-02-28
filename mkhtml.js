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
    var currentShows = timeSlots[startDay][timeSlot];
    currentShows.push(showClean);
    timeSlots[startDay][timeSlot] = currentShows;
  } else {
    timeSlots[startDay][timeSlot] = [showClean];
  }
}

var dayTr = "<tr><td></td><td>SUN</td><td>MON</td><td>TUE</td><td>WED</td><td>THU</td><td>FRI</td><td>SAT</td></tr>\n";
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

// loop over 2-hr blocks grabbing days
var html = "\n";
html += "<table>\n";
html += dayTr;
for (var block = 0; block < 12; block++) {
  html += "<tr>\n"
  html += "<td>" + timeSlotTd[block]+ "</td>\n";
  for (var day = 0; day < 7; day++) {
    html += "<td>";
    var showName = timeSlots[day][block][0].showName ? timeSlots[day][block][0].showName : 'TBA';
    html += escapeHtml(showName);
    html += "</td>\n";
  }
  html += "</tr>\n"
}
html += "</table>\n";


console.log(html);
fs.writeFile('table.html', html, function(err) {
  if (err) throw err;
  console.log('IM DONE U MFER');
});

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
