# cal_scrape
kffp google calendar scrape

# INSTALL
- `npm install`
- `cp secrets.json.template secrets.json` && fill in w/ appropriate data

# RUN
- `node scrapeSchedGoogCal.js` => showSchedule.json
- `node mkTableHTML.js` => table.html
- `node mkDailyHTML.js` => daily.html
- `node mkPollardSched.js` => pollardSched.json && pollardSchedBadShows.json

# WHAT IT DOES
We want to store all of kffp's schedule data in Google Calendar. This
set of command line scripts scrapes Google Calendar, and formats the
data a couple of ways:
- Full HTML Table
- Daily schedule
- JSON data for the playlist app
