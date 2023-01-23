const puppeteer = require('puppeteer');
// import chromium from "chrome-aws-lambda";

async function startBrowser() {
	let browser;
	try {
		console.log("Opening the browser......");
		browser = await puppeteer.launch({
		// browser = await chromium.puppeteer.launch({
			headless: true,
			args: [
				'--no-sandbox',
				"--disable-setuid-sandbox",
				"--disable-dev-shm-usage",
				'--disable-gpu',
				'--disable-dev-shm-usage',
				'--no-first-run',
				'--no-zygote',
				'--deterministic-fetch',
				'--disable-features=IsolateOrigins',
				'--disable-site-isolation-trials'
			],
			'ignoreHTTPSErrors': true
		});
		console.log("the browser is opened......");
	} catch (err) {
		console.log("Could not create a browser instance => : ", err);
	}
	return browser;
}
module.exports = {
	startBrowser
};
