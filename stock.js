'use strict';
// const crawler = require('@waynechang65/ptt-crawler');
// const crawler = require('./crawler');
const Crawler = require('crawler');
const HTMLParser = require('node-html-parser');

const c = new Crawler({
    maxConnections: 1,
    // This will be called for each crawled page
	  rateLimit: 500,
});

function ParsePtt(error, res, done) {
    if (error) return error;

    const root = HTMLParser.parse(res.body);
    const titles = root.querySelectorAll('.title > a');
    titles.forEach(t => console.log(t.toString()));
    console.log('------------------');

    done();
}

function handleCrawl(uri) {
  return new Promise((resolve, reject) => {
    c.direct({
      uri,
      skipEventRequest: false,
      callback: (error, res) => {
        const root = HTMLParser.parse(res.body);
        const titles = root.querySelectorAll('.title > a');
        titles.forEach(t => console.log(t.toString()));
      },
    });
  });
}

handleCrawl('https://www.ptt.cc/bbs/Stock/index.html');

// Queue just one URL, with default callback
/*
c.queue([
  'https://www.ptt.cc/bbs/Stock/index.html',
]);
*/

// Queue a list of URLs
// c.queue(['http://www.google.com/','http://www.yahoo.com']);

// Queue URLs with custom callbacks & parameters
/*
c.queue([{
    uri: 'https://www.ptt.cc/bbs/Stock/index.html',
    jQuery: false,

    // The global callback won't be called
    callback: (error, res, done) => {
        if (error) {
            console.log(error);
        } else {
          // console.log('Grabbed', res.body);
          const root = HTMLParser.parse(res.body);
          console.log(root.toString());
          const titles = root.querySelectorAll('.title > a');
          titles.forEach(t => console.log(t.toString()));
          const soup = new JSSoup(res.body);
          const elements = soup.select('div > .class1');
          // const aTag = soup.findAll('a');
          elements.forEach(t => console.log(t.text));
        }
        done();
    }
}]);
*/

async function getPttStock() {
	await crawler.initialize();

	const board = 'Stock';
	const pages = 2;

	const ptt = await crawler.getResults({
		board,
		pages,
		skipPBs: true,
	});

	console.log(ptt);
}
