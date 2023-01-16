const getInputData = require('./input-data');
const options = require('./config');
const s3Client = require('./s3-client');
const Stream = require('stream');
const { createGzip } = require('zlib');
const csvWriteStream = require('csv-write-stream');

const requestDataPaths = {
    _check_in_date: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div > div:nth-child(1) > div > div > div > div > div > div > div > div > div> div:nth-child(1)  > span > div:nth-child(2)',
    _check_out_date: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div > div > div> div > div> div > div > div > div:nth-child(4)> span > div:nth-child(2)',
    _price_per_night_brut: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div:nth-child(1)> div:nth-child(1) > div:nth-child(2)>div>div>div:nth-child(1)',
    _security_deposit_brut_not_sliced: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div:nth-child(1)> div:nth-child(1) > div:nth-child(2)>div>div>div:nth-child(2)',
    _cleaning_fee_brut_not_sliced: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div:nth-child(1)> div:nth-child(1) > div:nth-child(2)>div>div>div:nth-child(3)',
    _taxes_fee_brut_not_sliced: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div:nth-child(1)> div:nth-child(1) > div:nth-child(2)>div>div>div:nth-child(4)',
    _total_amount_brut_not_sliced: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div:nth-child(1)> div:nth-child(1) > div:nth-child(2)>div>div>div:nth-child(5)'
}

async function getScreenshots(newPage, screenshotNumber) {
    screenshot = await newPage.screenshot({
        fullPage: true
    });
    await s3Client.upload({
        Key: options.awsS3OutputScreenshotsKey + '/screenshot-' + screenshotNumber + '-of-worker-number-' + options.workerIndex + '.png',
        Bucket: options.awsS3OutputScreenshotsBucket,
        Body: screenshot
    }).promise()
}

async function getData(browser, urls, writeStream) {
    for (chunckCounter = 0; chunckCounter < urls.length; chunckCounter++) {
        try {
            const newPage = await browser.newPage();
            await newPage.setDefaultNavigationTimeout(0);
            await newPage.goto(urls[chunckCounter]);
            await newPage.waitForSelector('#__next');
            await newPage.$('#__next');
            await getScreenshots(newPage, chunckCounter);

            const listingURL = await newPage.url();
            const check_in_date = await newPage.$(requestDataPaths._check_in_date) !== null ? await newPage.$eval(requestDataPaths._check_in_date, text => text.textContent) : "no check_in_date";
            const check_out_date = await newPage.$(requestDataPaths._check_out_date) !== null ? await newPage.$eval(requestDataPaths._check_out_date, text => text.textContent) : "no check_out_date";
            const price_per_night = await newPage.$(requestDataPaths._price_per_night_brut) !== null ? await newPage.$eval(requestDataPaths._price_per_night_brut, text => text.textContent) : "no price_per_night_brut";
            const security_deposit_brut_not_sliced = await newPage.$(requestDataPaths._security_deposit_brut_not_sliced) !== null ? await newPage.$eval(requestDataPaths._security_deposit_brut_not_sliced, text => text.textContent) : "no security_deposit_brut_not_sliced";
            const security_deposit_brut = security_deposit_brut_not_sliced.slice(0, 5);
            const cleaning_fee_brut_not_sliced = await newPage.$(requestDataPaths._cleaning_fee_brut_not_sliced) !== null ? await newPage.$eval(requestDataPaths._cleaning_fee_brut_not_sliced, text => text.textContent) : "no cleaning_fee_brut_not_sliced";
            const cleaning_fee_brut = cleaning_fee_brut_not_sliced.slice(0, 5);
            const taxes_fee_brut_not_sliced = await newPage.$(requestDataPaths._taxes_fee_brut_not_sliced) !== null ? await newPage.$eval(requestDataPaths._taxes_fee_brut_not_sliced, text => text.textContent) : "no taxes_fee_brut_not_sliced";
            const taxes_fee_brut = taxes_fee_brut_not_sliced.slice(0, 5);
            const total_amount_brut_not_sliced = await newPage.$(requestDataPaths._total_amount_brut_not_sliced) !== null ? await newPage.$eval(requestDataPaths._total_amount_brut_not_sliced, text => text.textContent) : "no total_amount_brut_not_sliced";
            const total_amount_brut = total_amount_brut_not_sliced.slice(0, 5);

            // checking different configurations to get the correct data whenever there are deposit fee or not 

            // 1) security deposit identification -------------------------------------------------------------------------------------------

            if (security_deposit_brut == 'Secur') {
                security_deposit = security_deposit_brut
            }
            else if (cleaning_fee_brut == 'Secur') {
                security_deposit = cleaning_fee_brut
            }
            else if (taxes_fee_brut == 'Secur') {
                taxes_fee = taxes_fee_brut
            }
            else if (total_amount_brut == 'Secur') {
                total_amount = total_amount_brut
            }
            else {
                security_deposit = 'no security deposit'
            }
            // 2) cleaning fee identification -------------------------------------------------------------------------------------------
            if (cleaning_fee_brut == 'Clean') {
                cleaning_fee = cleaning_fee_brut
            }
            else if (taxes_fee_brut == 'Clean') {
                cleaning_fee = taxes_fee_brut
            }
            else if (total_amount_brut == 'Clean') {
                cleaning_fee = total_amount_brut
            }
            else {
                cleaning_fee = 'no cleaning fee'
            }
            // 3) taxes fee identification -------------------------------------------------------------------------------------------
            if (taxes_fee_brut == 'Taxes') {
                taxes_fee = taxes_fee_brut
            }
            else if (total_amount_brut == 'Taxes') {
                taxes_fee = total_amount_brut
            }
            else {
                taxes_fee = 'no taxes fee'
            }
            // 4) total amount identification -------------------------------------------------------------------------------------------

            if (total_amount_brut == 'Total') {
                total_amount = total_amount_brut
            }
            else {
                total_amount = 'no total amount'
            }
            const result =
            {
                outputFile: options.awsS3OutputKey,
                listingURL: listingURL,
                check_in_date: check_in_date,
                check_out_date: check_out_date,
                price_per_night: price_per_night,
                security_deposit: security_deposit,
                cleaning_fee: cleaning_fee,
                taxes_fee: taxes_fee,
                total_amount: total_amount,
            };
            writeStream.write(result)
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
        writeStream
            .pipe(createGzip())
            .pipe(outStream);
        await getData(browser, urlsList, writeStream);
        writeStream.end();

        await s3Client.upload({
            Key: options.awsS3OutputKey,
            Bucket: options.awsS3OutputBucket,
            Body: outStream
        }).promise()
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