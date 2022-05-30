const fs = require('fs');
const pageScraper = require('./pageScraper');
async function scrapeAll(browserInstance) {
	//parsing the csv file
	let fs = require('fs');
	let urls = fs.readFileSync('marriott-input-url.csv').toString().split('\n').map(e => e.trim());
	console.log(urls);
	let browser;
	//iterate each url
	for (let url in urls) {
		try {
			browser = await browserInstance;
			await pageScraper.scraper(browser, urls[url]);
			// await pageScraper.scraper(browser, url);
			await browser.close();
			console.log(scrapedData)
		}
		catch (err) {
			console.log("Could not resolve the browser instance => ", err);
		}
	}
	//try catch
}
module.exports = (browserInstance) => scrapeAll(browserInstance)