const schedule = require('node-schedule');
const moment = require('moment');

const job = schedule.scheduleJob('0 0/30 9-14 ? * 1-5', () => {
  console.log('job scheduleJob', moment());
});
