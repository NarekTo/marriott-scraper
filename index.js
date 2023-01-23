const scraper = require('./scraper-marriott');
const browserObject = require('./browser');

console.log(" the index file is calling the scraper......");

scraper(browserObject.startBrowser())
    .then(() => {
        console.log('ALL LISTINGS SCRAPED');
        process.exit(0);
    })
    .catch((err) => {
        console.error('[ERROR]', err);
        process.exit(1);
    });