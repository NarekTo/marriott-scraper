const getInputData = require('./input-data');
const options = require('./config');
const s3Client = require('./s3-client');
const Stream = require('stream');
const { createGzip } = require('zlib');
const csvWriteStream = require('csv-write-stream');

console.log("scraper-marriott file is opening......");


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
    console.log("scraper-marriott file after screenshots......");

    await s3Client.upload({
        Key: options.awsS3OutputScreenshotsKey + '/screenshot-' + screenshotNumber + '-of-worker-number-' + options.workerIndex + '.png',
        Bucket: options.awsS3OutputScreenshotsBucket,
        Body: screenshot
    }).promise()
}
async function getData(browser, urls, writeStream) {
    console.log("getData function before the for loop...... ");
    console.log("getData function before the for loop the URLS...... ", urls);
    for (chunckCounter = 0; chunckCounter < urls.length; chunckCounter++) {
        console.log("getData function before the for loop the chunks URLS...... ", urls[chunckCounter]);
        try {
            const newPage = await browser.newPage();
            console.log("scraper-marriott file after uploadScreenshot(newPage, chunckCounter)...... and newPage value");

            await newPage.setDefaultNavigationTimeout(100000);
            await newPage.goto(urls[chunckCounter]);
            // console.log("scraper-marriott file after ...... and urls[chunckCounter] value", urls[chunckCounter]);
            await newPage.waitForSelector('#__next');
            await newPage.$('#__next');
            await uploadScreenshot(newPage, chunckCounter);

            // console.log("scraper-marriott file after uploadScreenshot(newPage, chunckCounter)...... and chunckCounter value", chunckCounter);


            const listingURL = await newPage.url();
            const check_in_date = await newPage.$(requestDataPaths._check_in_date) !== null ? await newPage.$eval(requestDataPaths._check_in_date, text => text.textContent) : "no check_in_date";
            const check_out_date = await newPage.$(requestDataPaths._check_out_date) !== null ? await newPage.$eval(requestDataPaths._check_out_date, text => text.textContent) : "no check_out_date";
            const price_per_night_brut = await newPage.$(requestDataPaths._price_per_night_brut) !== null ? await newPage.$eval(requestDataPaths._price_per_night_brut, text => text.textContent) : "no price_per_night_brut";
            const security_deposit_brut = await newPage.$(requestDataPaths._security_deposit_brut) !== null ? await newPage.$eval(requestDataPaths._security_deposit_brut, text => text.textContent) : "no security_deposit_brut";
            const cleaning_fee_brut = await newPage.$(requestDataPaths._cleaning_fee_brut) !== null ? await newPage.$eval(requestDataPaths._cleaning_fee_brut, text => text.textContent) : "no cleaning_fee_brut";
            const taxes_fee_brut = await newPage.$(requestDataPaths._taxes_fee_brut) !== null ? await newPage.$eval(requestDataPaths._taxes_fee_brut, text => text.textContent) : "no taxes_fee_brut";
            const total_amount_brut = await newPage.$(requestDataPaths._total_amount_brut) !== null ? await newPage.$eval(requestDataPaths._total_amount_brut, text => text.textContent) : "no total_amount_brut";

            console.log("the total_amount_brut ......", total_amount_brut);

            // checking different configurations to get the correct data whenever there are deposit fee or not 
            // 1) security deposit identification -------------------------------------------------------------------------------------------

            if (security_deposit_brut.slice(0, 5) == 'Secur') {
                security_deposit = security_deposit_brut.slice(26,)
            }
            else if (cleaning_fee_brut.slice(0, 5) == 'Secur') {
                security_deposit = cleaning_fee_brut.slice(12,)
            }
            else if (taxes_fee_brut.slice(0, 5) == 'Secur') {
                security_deposit = taxes_fee_brut.slice(5,)
            }
            else if (total_amount_brut.slice(0, 5) == 'Secur') {
                security_deposit = total_amount_brut.slice(5,)
            }
            else {
                security_deposit = 'no security deposit'
            }
            // 2) cleaning fee identification -------------------------------------------------------------------------------------------
            if (security_deposit_brut.slice(0, 5) == 'Clean') {
                cleaning_fee = security_deposit_brut.slice(12,)
            }
            else if (cleaning_fee_brut.slice(0, 5) == 'Clean') {
                cleaning_fee = cleaning_fee_brut.slice(12,)
            }
            else if (taxes_fee_brut.slice(0, 5) == 'Clean') {
                cleaning_fee = taxes_fee_brut.slice(12,)
            }
            else if (total_amount_brut.slice(0, 5) == 'Clean') {
                cleaning_fee = total_amount_brut.slice(12,)
            }
            else {
                cleaning_fee = 'no cleaning fee'
            }
            // 3) taxes fee identification -------------------------------------------------------------------------------------------
            if (security_deposit_brut.slice(0, 5) == 'Taxes') {
                taxes_fee = security_deposit_brut.slice(5,)
            }
            else if (cleaning_fee_brut.slice(0, 5) == 'Taxes') {
                taxes_fee = cleaning_fee_brut.slice(5,)
            }
            else if (taxes_fee_brut.slice(0, 5) == 'Taxes') {
                taxes_fee = taxes_fee_brut.slice(5,)
            }
            else if (total_amount_brut.slice(0, 5) == 'Taxes') {
                taxes_fee = total_amount_brut.slice(5,)
            }
            else {
                taxes_fee = 'no taxes fee'
            }
            // 4) total amount identification -------------------------------------------------------------------------------------------
            if (security_deposit_brut.slice(0, 5) == 'Total') {
                total_amount = security_deposit_brut.slice(5,)
            }
            else if (cleaning_fee_brut.slice(0, 5) == 'Total') {
                total_amount = cleaning_fee_brut.slice(5,)
            }
            else if (taxes_fee_brut.slice(0, 5) == 'Total') {
                total_amount = taxes_fee_brut.slice(5,)
            }
            else if (total_amount_brut.slice(0, 5) == 'Total') {
                total_amount = total_amount_brut.slice(5,)
            }
            else {
                total_amount = 'no total amount'
            }

            const result =
            {
                listingNumber: 'listing-' + chunckCounter + '-worker-index-' + options.workerIndex,
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
            console.log("the result of this worker is scraper ......", result);
            writeStream.write(result)
            // await newPage.close();
        }
        catch (error) {
            console.error(error);
            throw error
        }
        console.log('the listing number ' + chunckCounter + ' from workerIndex ' + options.workerIndex + ' is correctly scraped')
    }
}

async function scrapeAll(browserInstance) {

    console.log("scraper-marriott file scrapeAll function beginning......");

    const outStream = new Stream.PassThrough();

    console.log("scraper-marriott file scrapeAll function after outStream initiating......");

    const urlsList = await getInputData(options);

    console.log("scraper-marriott file scrapeAll function after urlsList = await getInputData(options)......");

    const writeStream = csvWriteStream({ separator: ',', enclose: true });

    console.log("scraper-marriott file scrapeAll function after const writeStream = csvWriteStream({ separator: ',', enclose: true })......");
    let browser;

    try {
        browser = await browserInstance;

        const upload = s3Client.upload({
            Key: options.awsS3OutputKey,
            Bucket: options.awsS3OutputBucket,
            Body: outStream
        }).promise()

        console.log("scraper-marriott file scrapeAll function after const upload = s3Client.upload......");

        writeStream
            .pipe(createGzip())
            .pipe(outStream);

        console.log("scraper-marriott file scrapeAll function after writeStream......");

        await getData(browser, urlsList, writeStream);

        console.log("scraper-marriott file scrapeAll function after getData calling......");
        writeStream.end();
        console.log("scraper-marriott file scrapeAll function after writeStream.end()......");

        await upload;
        console.log("scraper-marriott file scrapeAll function after upload ......");


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