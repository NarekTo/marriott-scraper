const puppeteer = require('puppeteer');

async function startBrowser() {
	let browser;
	try {
		console.log("Browser file: opening the browser......");
		browser = await puppeteer.launch({
			pipe: true,
			headless: true,
			ignoreHTTPSErrors: true,
			dumpio: true,
			args: ['--ignore-certificate-errors',
				'--disable-gpu',
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage',
				'--single-process',
			]
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
