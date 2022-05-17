'use strict';
require('dotenv').config();

const axios = require('axios');
const moment = require('moment');
const schedule = require('node-schedule');
const Crawler = require('crawler');
const HTMLParser = require('node-html-parser');

const c = new Crawler({
    maxConnections: 1,
    // This will be called for each crawled page
	  rateLimit: 500,
});

function parsePtt(content) {
  const root = HTMLParser.parse(content);
  const nextPages = root.querySelectorAll('.btn-group-paging > a');
  const nextPage = nextPages.find(elem => elem.text.includes('上頁'));

  const posts = root.querySelectorAll('.r-ent');
  const targets = posts.reduce((accu, post) => {
    const title = post.querySelector('.title > a');
    const titleText = title?.text;

    if (titleText?.includes('[標的]')) {
      const titleUrl = title?.getAttribute('href');
      const rank = post.querySelector('.nrec > span');
      accu.push({
        rank: rank?.text,
        url: titleUrl,
        title: titleText,
      });
    }
    return accu;
  }, []);

  return {
    nextUrl: `https://www.ptt.cc${nextPage.getAttribute('href')}`,
    targets,
  }
}

function handleCrawl(uri) {
  return new Promise((resolve, reject) => {
    c.direct({
      uri,
      skipEventRequest: false,
      callback: (error, res) => {
        if (error) reject(error);
        else resolve(parsePtt(res.body));
      },
    });
  });
}

function sendMessage(message) {
  axios.post(
    `https://maker.ifttt.com/trigger/${process.env.event}/with/key/${process.env.token}`,
    { value1: message },
  );
}

async function main() {
  let url = 'https://www.ptt.cc/bbs/Stock/index.html';

  const result = [];

  while(result.length < 10) {
    const content = await handleCrawl(url);

    url = content.nextUrl;
    result.push(...content.targets);
  }

  const message = result.map(item => `[${item?.rank}] ${item.title}: ${item.url}<br/>`).join('<br/>');
  sendMessage(message);
}

const job = schedule.scheduleJob('0 0/30 9-14 ? * 1-5', () => {
  console.log('job scheduleJob', moment());
  main();
});

