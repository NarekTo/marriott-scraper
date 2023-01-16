const scraper = require('./scraper-marriott');
const browserObject = require('./browser');

scraper(browserObject.startBrowser())
    .then(() => {
        console.log('[all listings from this worker are correctly scraped]');
        process.exit(0);
    })
    .catch((err) => {
        console.error('[ERROR]', err);
        process.exit(1);
    });