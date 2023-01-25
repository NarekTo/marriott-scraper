const puppeteer = require('puppeteer');

async function startBrowser() {
	let browser;
	try {
		console.log("Browser file: opening the browser......");
		browser = await puppeteer.launch({
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-gpu',
			],
			devtools: false, 
			headless: true, 
			dumpio:true, 
			ignoreDefaultArgs: ['--disable-extensions'],
			'ignoreHTTPSErrors': true
		});
		console.log("the browser is opened......");
	} catch (err) {
		console.log("Could not create a browser instance => : ", err);
		throw err
	}

	return browser;
}
module.exports = {
	startBrowser
};
