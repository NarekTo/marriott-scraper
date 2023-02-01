const getInputData = require('./input-data');
const options = require('./config');
const getS3Client = require('./s3-client');
const Stream = require('stream');
const { createGzip } = require('zlib');
const csvWriteStream = require('csv-write-stream');

const s3Client = getS3Client(options);

const requestDataPaths = {
    _check_in_date: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div > div:nth-child(1) > div > div > div > div > div > div > div > div > div> div:nth-child(1)  > span > div:nth-child(2)',
    _check_out_date: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div > div > div> div > div> div > div > div > div:nth-child(4)> span > div:nth-child(2)',
    _price_per_night_brut: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div:nth-child(1)> div:nth-child(1) > div:nth-child(2)>div>div>div:nth-child(1)',
    _security_deposit_brut: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div:nth-child(1)> div:nth-child(1) > div:nth-child(2)>div>div>div:nth-child(2)',
    _cleaning_fee_brut: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div:nth-child(1)> div:nth-child(1) > div:nth-child(2)>div>div>div:nth-child(3)',
    _taxes_fee_brut: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div:nth-child(1)> div:nth-child(1) > div:nth-child(2)>div>div>div:nth-child(4)',
    _total_amount_brut: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div:nth-child(1)> div:nth-child(1) > div:nth-child(2)>div>div>div:nth-child(5)'
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
            await newPage.setDefaultNavigationTimeout(100000);
            await newPage.goto(urls[chunckCounter], {waitUntil: "networkidle2"});
            await newPage.waitForSelector('#__next');
            await uploadScreenshot(newPage, chunckCounter);
            
            const check_in_date =  await newPage.$eval(requestDataPaths._check_in_date, text => text.textContent) ?? "no check_in_date";
            const check_out_date = await newPage.$eval(requestDataPaths._check_out_date, text => text.textContent) ?? "no check_out_date";
            const price_per_night_brut = await newPage.$(requestDataPaths._price_per_night_brut) !== null ? await newPage.$eval(requestDataPaths._price_per_night_brut, text => text.textContent) : "no price_per_night_brut";
            const security_deposit_brut = await newPage.$(requestDataPaths._security_deposit_brut) !== null ? await newPage.$eval(requestDataPaths._security_deposit_brut, text => text.textContent) : "no security_deposit_brut";
            const cleaning_fee_brut = await newPage.$(requestDataPaths._cleaning_fee_brut) !== null ? await newPage.$eval(requestDataPaths._cleaning_fee_brut, text => text.textContent) : "no cleaning_fee_brut";
            const taxes_fee_brut = await newPage.$(requestDataPaths._taxes_fee_brut) !== null ? await newPage.$eval(requestDataPaths._taxes_fee_brut, text => text.textContent) : "no taxes_fee_brut";
            const total_amount_brut = await newPage.$(requestDataPaths._total_amount_brut) !== null ? await newPage.$eval(requestDataPaths._total_amount_brut, text => text.textContent) : "no total_amount_brut";

            // checking different configurations 
            // 1) security deposit identification -------------------------------------------------------------------------------------------

            if (security_deposit_brut.startsWith('Secur')) {
                security_deposit = security_deposit_brut.slice(26,)
            }
            else if (cleaning_fee_brut.startsWith('Secur')) {
                security_deposit = cleaning_fee_brut.slice(12,)
            }
            else if (taxes_fee_brut.startsWith('Secur')) {
                security_deposit = taxes_fee_brut.slice(5,)
            }
            else if (total_amount_brut.startsWith('Secur')) {
                security_deposit = total_amount_brut.slice(5,)
            }
            else {
                security_deposit = 'no security deposit'
            }
            // 2) cleaning fee identification -------------------------------------------------------------------------------------------
            if (security_deposit_brut.startsWith('Clean')) {
                cleaning_fee = security_deposit_brut.slice(12,)
            }
            else if (cleaning_fee_brut.startsWith('Clean')) {
                cleaning_fee = cleaning_fee_brut.slice(12,)
            }
            else if (taxes_fee_brut.startsWith('Clean')) {
                cleaning_fee = taxes_fee_brut.slice(12,)
            }
            else if (total_amount_brut.startsWith('Clean')) {
                cleaning_fee = total_amount_brut.slice(12,)
            }
            else {
                cleaning_fee = 'no cleaning fee'
            }
            // 3) taxes fee identification -------------------------------------------------------------------------------------------
            if (security_deposit_brut.startsWith('Taxes')) {
                taxes_fee = security_deposit_brut.slice(5,)
            }
            else if (cleaning_fee_brut.startsWith('Taxes')) {
                taxes_fee = cleaning_fee_brut.slice(5,)
            }
            else if (taxes_fee_brut.startsWith('Taxes')) {
                taxes_fee = taxes_fee_brut.slice(5,)
            }
            else if (total_amount_brut.startsWith('Taxes')) {
                taxes_fee = total_amount_brut.slice(5,)
            }
            else {
                taxes_fee = 'no taxes fee'
            }
            // 4) total amount identification -------------------------------------------------------------------------------------------
            if (security_deposit_brut.startsWith('Total')) {
                total_amount = security_deposit_brut.slice(5,)
            }
            else if (cleaning_fee_brut.startsWith('Total')) {
                total_amount = cleaning_fee_brut.slice(5,)
            }
            else if (taxes_fee_brut.startsWith('Total')) {
                total_amount = taxes_fee_brut.slice(5,)
            }
            else if (total_amount_brut.startsWith('Total')) {
                total_amount = total_amount_brut.slice(5,)
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
                price_per_night: price_per_night_brut.split(' ')[0],
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