
var google = require('googleapis');
var readline = require('readline');
var jsonfile = require('jsonfile')
var rimraf = require('rimraf');

var secrets = require('./secrets.json');

var OAuth2Client = google.auth.OAuth2;
var cal = google.calendar('v3');

// Client ID and client secret are available at
// https://code.google.com/apis/console
var CLIENT_ID = secrets.installed.client_id;
var CLIENT_SECRET = secrets.installed.client_secret;
var REDIRECT_URL = secrets.installed.redirect_uris[0];

// var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, 'oob');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getAccessToken(oauth2Client, callback) {
  // generate consent page url
  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // will return a refresh token
    scope: 'https://www.google.com/calendar/feeds/' // can be a space-delimited string or an array of scopes
  });

  console.log('Visit the url: ', url);
  rl.question('Enter the code here:', function(code) {
    // request access token
    oauth2Client.getToken(code, function(err, tokens) {
      // set tokens to the client
      // TODO: tokens should be set by OAuth2 client.
      oauth2Client.setCredentials(tokens);
      callback();
    });
  });
}

// retrieve an access token
getAccessToken(oauth2Client, function() {
  // set start time and end time to only get one week's worth of data
  var timeMin = "2016-03-06T00:00:00-07:00";
  var timeMax = "2016-03-13T00:00:00-07:00";

  var eventListCfg = {
    calendarId: secrets.installed.calendar_id,
    auth: oauth2Client,
    timeMin: timeMin,
    timeMax: timeMax,
  };
  cal.events.list(eventListCfg, function(err, res) {
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
