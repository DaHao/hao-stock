'use strict';
require('dotenv').config();

const Crawler = require('crawler');
const HTMLParser = require('node-html-parser');
const axios = require('axios');

const c = new Crawler({
    maxConnections: 1,
    // This will be called for each crawled page
	  rateLimit: 500,
});

function parsePtt(content) {
  const root = HTMLParser.parse(content);
  const nextPages = root.querySelectorAll('.btn-group-paging > a');
  const nextPage = nextPages.find(elem => elem.text.includes('上頁'));
  const titles = root.querySelectorAll('.title > a');

  return {
    nextUrl: `https://www.ptt.cc${nextPage.getAttribute('href')}`,
    targets: titles.reduce((accu, t) => {
      if (t.text?.includes('[標的]')) {
        const url = `https://www.ptt.cc${t.getAttribute('href')}`;
        accu.push({ url, title: t.text });
      }
      return accu;
    }, []),
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

  const message = result.map(item => `${item.title}: ${item.url}<br/>`).join('<br/>');
  // sendMessage(message);
}

main();
