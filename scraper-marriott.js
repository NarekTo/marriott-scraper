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
    _security_deposit_label: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div> div > div> div > div > div:nth-child(2) > span:nth-child(1)',
    _security_deposit_value: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div> div > div> div > div > div:nth-child(2) > span:nth-child(2)> span:nth-child(2)',
    _cleaning_fee_label: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div> div > div> div > div > div:nth-child(3) > span:nth-child(1)',
    _cleaning_fee_value: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div> div > div> div > div > div:nth-child(3) > span:nth-child(2)',
    _taxes_fee_label: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div>div:nth-child(1) > div > div > div > div> div > div > div:nth-child(4) > span:nth-child(1)',
    _taxes_fee_value: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div>div:nth-child(1) > div > div > div > div> div > div > div:nth-child(4) > span:nth-child(2)',
    _total_amount_label: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div> div > div> div > div > div> div > span:nth-child(1)',
    _total_amount_value: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div> div > div> div > div > div> div > span:nth-child(2)'
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
            const listingURL = await newPage.url();
            await newPage.setDefaultNavigationTimeout(10000);
            await newPage.goto(urls[chunckCounter], { waitUntil: "networkidle2" });
            await newPage.waitForSelector('#__next');
            await newPage.$('#__next');
            await uploadScreenshot(newPage, chunckCounter);

            const check_in_date = await newPage.$eval(requestDataPaths._check_in_date, text => text.textContent) ?? "no check_in_date";
            const check_out_date = await newPage.$eval(requestDataPaths._check_out_date, text => text.textContent) ?? "no check_out_date";
            const price_per_night_value = await newPage.$eval(requestDataPaths._price_per_night_value, text => text.textContent) ?? "no price_per_night_value";
            const security_deposit_value = await newPage.$(requestDataPaths._security_deposit_value) !== null ? await newPage.$eval(requestDataPaths._security_deposit_value, text => text.textContent) : "no security_deposit_value";
            const security_deposit_label = await newPage.$(requestDataPaths._security_deposit_label) !== null ? await newPage.$eval(requestDataPaths._security_deposit_label, text => text.textContent) : "no security_deposit_label";
            const cleaning_fee_value = await newPage.$(requestDataPaths._cleaning_fee_value) !== null ? await newPage.$eval(requestDataPaths._cleaning_fee_value, text => text.textContent) : "no cleaning_fee_value";
            const cleaning_fee_label = await newPage.$(requestDataPaths._cleaning_fee_label) !== null ? await newPage.$eval(requestDataPaths._cleaning_fee_label, text => text.textContent) : "no cleaning_fee_label";
            const taxes_fee_value = await newPage.$(requestDataPaths._taxes_fee_value) !== null ? await newPage.$eval(requestDataPaths._taxes_fee_value, text => text.textContent) : "no taxes_fee_value";
            const taxes_fee_label = await newPage.$(requestDataPaths._taxes_fee_label) !== null ? await newPage.$eval(requestDataPaths._taxes_fee_label, text => text.textContent) : "no taxes_fee_label";
            const total_amount_value = await newPage.$(requestDataPaths._total_amount_value) !== null ? await newPage.$eval(requestDataPaths._total_amount_value, text => text.textContent) : "no total_amount_value";
            const total_amount_label = await newPage.$(requestDataPaths._total_amount_label) !== null ? await newPage.$eval(requestDataPaths._total_amount_label, text => text.textContent) : "no total_amount_label";

            // checking different configurations 
            // 1) security deposit identification -------------------------------------------------------------------------------------------

            if (security_deposit_label.startsWith('Secur')) {
                security_deposit = security_deposit_value
            }
            else if (cleaning_fee_label.startsWith('Secur')) {
                security_deposit = cleaning_fee_value
            }
            else if (taxes_fee_label.startsWith('Secur')) {
                security_deposit = taxes_fee_value
            }
            else if (total_amount_label.startsWith('Secur')) {
                security_deposit = total_amount_value
            }
            else {
                security_deposit = 'no security deposit'
            }
            // 2) cleaning fee identification -------------------------------------------------------------------------------------------
            if (security_deposit_label.startsWith('Clean')) {
                cleaning_fee = security_deposit_value
            }
            else if (cleaning_fee_label.startsWith('Clean')) {
                cleaning_fee = cleaning_fee_value
            }
            else if (taxes_fee_label.startsWith('Clean')) {
                cleaning_fee = taxes_fee_value
            }
            else if (total_amount_label.startsWith('Clean')) {
                cleaning_fee = total_amount_value
            }
            else {
                cleaning_fee = 'no cleaning fee'
            }
            // 3) taxes fee identification -------------------------------------------------------------------------------------------
            if (security_deposit_label.startsWith('Taxes')) {
                taxes_fee = security_deposit_value
            }
            else if (cleaning_fee_label.startsWith('Taxes')) {
                taxes_fee = cleaning_fee_value
            }
            else if (taxes_fee_label.startsWith('Taxes')) {
                taxes_fee = taxes_fee_value
            }
            else if (total_amount_label.startsWith('Taxes')) {
                taxes_fee = total_amount_value
            }
            else {
                taxes_fee = 'no taxes fee'
            }
            // 4) total amount identification -------------------------------------------------------------------------------------------
            if (security_deposit_label.startsWith('Total')) {
                total_amount = security_deposit_value
            }
            else if (cleaning_fee_label.startsWith('Total')) {
                total_amount = cleaning_fee_value
            }
            else if (taxes_fee_label.startsWith('Total')) {
                total_amount = taxes_fee_value
            }
            else if (total_amount_label.startsWith('Total')) {
                total_amount = total_amount_value
            }
            else {
                total_amount = 'no total amount'
            }
            const result =
            {
                listingNumber: `listing-${chunckCounter}-worker-index-${options.workerIndex}`,
                outputFile: options.awsS3OutputKey,
                listingURL: listingURL,
                check_in_date: check_in_date,
                check_out_date: check_out_date,
                price_per_night: price_per_night_value.split(' ')[0],
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