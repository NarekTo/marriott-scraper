const puppeteer = require('puppeteer');

async function startBrowser() {
	let browser;
	try {
		browser = await puppeteer.launch({
			headless: true,
			args: [
				'--no-sandbox',
			]
		});
	} catch (err) {
		throw err
	}
	return browser;
}
module.exports = {
	startBrowser
};
