const scraper = require('./scraper-marriott');
const browserObject = require('./browser');
scraper(browserObject.startBrowser());