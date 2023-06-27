const getInputData = require('./input-data');
const options = require('./config');
const getS3Client = require('./s3-client');
const Stream = require('stream');
const { createGzip } = require('zlib');
const csvWriteStream = require('csv-write-stream');

const s3Client = getS3Client(options);

const requestDataPaths = {
    _check_in_date: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div > div > div > div > div > div > div > div> div:nth-child(1)  > span > div:nth-child(2)',
    _check_out_date: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div > div > div> div > div> div > div > div > div:nth-child(4)> span > div:nth-child(2)',
    _price_per_night_value: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div > div > div> div > div> div > div > div> span:nth-child(1)> span',
    _price_per_night: '[data-locator="nightly-rate-label"]',
    _discount: '[data-locator="discount-price-amount"]',
    _security_deposit: '[data-locator="security-deposit-amount"]',
    _cleaning_fee: '[data-locator="cleaning-fee-amount"]',
    _taxes_fee: '[data-locator="tax-fee-amount"]',
    _total_amount: '[data-locator="data-labels-currency-symbol-quote-total"]',
}

async function uploadScreenshot(newPage, screenshotNumber) {
    screenshot = await newPage.screenshot({
        fullPage: true
    });
    await s3Client.upload({
        Key: `${options.awsS3OutputScreenshotsKey}/screenshot-${screenshotNumber}-of-worker-number-${options.workerIndex}.png`,
        Bucket: options.awsS3OutputScreenshotsBucket,
        Body: screenshot
    }).promise()
}

async function getData(browser, urls, writeStream) {
    for (chunckCounter = 0; chunckCounter < urls.length; chunckCounter++) {
        try {
            const newPage = await browser.newPage();
            await newPage.setDefaultNavigationTimeout(10000);
            console.log(`The URL before opening is : `, urls[chunckCounter])
            await newPage.goto(urls[chunckCounter], { waitUntil: "networkidle2" });
            await newPage.waitForSelector('#__next');
            await newPage.$('#__next');
            await uploadScreenshot(newPage, chunckCounter);

            const check_in_date = await newPage.$(requestDataPaths._check_in_date) !== null ? await newPage.$eval(requestDataPaths._check_in_date, text => text.textContent) : "no check_in_date";
            const check_out_date = await newPage.$(requestDataPaths._check_out_date) !== null ? await newPage.$eval(requestDataPaths._check_out_date, text => text.textContent) : "no check_out_date";
            const price_per_night = await newPage.$(requestDataPaths._price_per_night) !== null ? await newPage.$eval(requestDataPaths._price_per_night, text => text.textContent) : "no price_per_night_value";
            const price_per_night_value = await newPage.$(requestDataPaths._price_per_night_value) !== null ? await newPage.$eval(requestDataPaths._price_per_night_value, text => text.textContent) : "no price_per_night_value";
            const discount = await newPage.$(requestDataPaths._discount) !== null ? await newPage.$eval(requestDataPaths._discount, text => text.textContent) : "no discount_value";
            const security_deposit = await newPage.$(requestDataPaths._security_deposit) !== null ? await newPage.$eval(requestDataPaths._security_deposit, text => text.textContent) : "no security_deposit_value";
            const cleaning_fee = await newPage.$(requestDataPaths._cleaning_fee) !== null ? await newPage.$eval(requestDataPaths._cleaning_fee, text => text.textContent) : "no cleaning_fee_value";
            const taxes_fee = await newPage.$(requestDataPaths._taxes_fee) !== null ? await newPage.$eval(requestDataPaths._taxes_fee, text => text.textContent) : "no taxes_fee_value";
            const total_amount = await newPage.$(requestDataPaths._total_amount) !== null ? await newPage.$eval(requestDataPaths._total_amount, text => text.textContent) : "no total_amount_value";

            const result =
            {
                listingNumber: `listing-${chunckCounter}-worker-index-${options.workerIndex}`,
                outputFile: options.awsS3OutputKey,
                listingURL: urls[chunckCounter],
                check_in_date: check_in_date,
                check_out_date: check_out_date,
                price_per_night: price_per_night.split(' ')[0],
                price_per_night_value:price_per_night_value.split(' ')[0],
                discount: discount.split('')[0],
                security_deposit: security_deposit.split(' ')[0],
                cleaning_fee: cleaning_fee.split(' ')[0],
                taxes_fee: taxes_fee.split(' ')[0],
                total_amount: total_amount.split(' ')[0],
                currency: total_amount.split(' ')[1]
            };

            writeStream.write(result)
            console.log(`the listing number: ${chunckCounter} from the worker number: ${options.workerIndex} was successfully scraped`)
            await newPage.close();
        }
        catch (error) {
            console.error(error);
            throw error
        }
    }
}
async function scrapeAll(browserInstance) {

    const outStream = new Stream.PassThrough();
    const urlsList = await getInputData(options);
    const writeStream = csvWriteStream({ separator: ',', enclose: true });
    let browser;
    try {
        browser = await browserInstance;
        const upload = s3Client.upload({
            Key: options.awsS3OutputKey,
            Bucket: options.awsS3OutputBucket,
            Body: outStream
        }).promise()

        writeStream
            .pipe(createGzip())
            .pipe(outStream);

        await getData(browser, urlsList, writeStream);

        writeStream.end();

        await upload;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
    finally {
        await browser.close();
    }
}
module.exports = (browserInstance) => scrapeAll(browserInstance)