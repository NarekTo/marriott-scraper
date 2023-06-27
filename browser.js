const puppeteer = require('puppeteer');

async function startBrowser(options) {
	let browser;
	const args = [
		`--no-sandbox`,
		`--disable-setuid-sandbox`,
	];
	if (options.proxyHosts) {
		console.log('Using proxy', options.proxyHosts);
		args.push(`--proxy-server=${options.proxyHosts}`);
	}
	try {
		browser = await puppeteer.launch({
			args,
			headless: true,
		});
	} catch (err) {
		throw err
	}
	return browser;
}
module.exports = {
	startBrowser
};
