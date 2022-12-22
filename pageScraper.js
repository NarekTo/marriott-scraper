let browser;

const scraperObject = {
	async scraper(browser, url) {
		let page = await browser.newPage();
		console.log(`Navigating to ${url}...`);
		// Navigate to the selected page
		await page.goto(url);

		let scrapedData = [];

		link = this.url;

		async function scrapeCurrentPage() {
			await page.waitForSelector('#__next');

			let pagePromise = (url) => new Promise(async (resolve, reject) => {
				let dataObj = {};
				let newPage = await browser.newPage();
				await newPage.goto(url);
				dataObj['Nightly_base_price_per_number_of_nights'] = await newPage.$eval('#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div> div > div:nth-child(2) > div > div > div:nth-child(1)> span:nth-child(1)', text => text.textContent);
				dataObj['total_base_price'] = await newPage.$eval('#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div> div > div > div > div > div:nth-child(1) > span:nth-child(2)> span', text => text.textContent);
				dataObj['cleaning_fee'] = await newPage.$eval('#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div> div > div > div > div > div:nth-child(2) > span > span:nth-child(2)', text => text.textContent);
				dataObj['taxes'] = await newPage.$eval('#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div> div > div> div > div > div> div > span:nth-child(2)', text => text.textContent);
				dataObj['total'] = await newPage.$eval('#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div> div > div> div > div > div> div > span:nth-child(2)', text => text.textContent);

				resolve(dataObj);
				console.log('Nightly_base_price_per_number_of_nights\ttotal_base_price\tcleaning_fee\ttaxes\ttotal');
				for (let index = 0; index <= 4; index++) {
					console.log(dataObj['Nightly_base_price_per_number_of_nights'], '\t', dataObj['total_base_price'], '\t', dataObj['cleaning_fee'], '\t', dataObj['taxes'], '\t', dataObj['total']);
				}
				await newPage.close();
			});


			// let urls = csvToJson.getJsonFromCsv("marriott-input-url.csv");


			// for(link in urls){
			// let currentPageData = await pagePromise(urls[link]);
			// scrapedData.push(currentPageData);
			// // console.log(currentPageData);
			// }


			let currentPageData = await pagePromise(url);
			scrapedData.push(currentPageData);

			await page.close();
			return scrapedData;
		}
		let data = await scrapeCurrentPage();
		console.log(data);
		return data;
	}
}

module.exports = scraperObject;
