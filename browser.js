const puppeteer = require('puppeteer');
const proxyUrl = `brd.superproxy.io:22225`;

async function startBrowser() {
	let browser;
	try {
		browser = await puppeteer.launch({
			headless: true,
			args: [
				`--proxy-server=${proxyUrl}`,
				`--no-sandbox`,
				`--disable-setuid-sandbox`,
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
