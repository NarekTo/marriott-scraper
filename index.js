const scraper = require('./scraper-marriott');
const browserObject = require('./browser');
const options = require('./config');

scraper(browserObject.startBrowser(options))
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        console.error('[ERROR]', err);
        process.exit(1);
    });