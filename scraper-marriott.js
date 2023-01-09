const getInputData = require('./input-data');
const options = require('./config');
const s3Client = require('./s3-client');
const Stream = require('stream');
const { createGzip } = require('zlib');
const csvWriteStream = require('csv-write-stream');
const requestDataPaths = {
    check_in_date: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div > div:nth-child(1) > div > div > div > div > div > div > div > div > div> div:nth-child(1)  > span > div:nth-child(2)',
    check_out_date: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div > div > div> div > div> div > div > div > div:nth-child(4)> span > div:nth-child(2)',
    price_per_night: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div:nth-child(1)> div:nth-child(1) > div:nth-child(2)>div>div>div:nth-child(1)',
    security_deposit_brut_not_sliced: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div:nth-child(1)> div:nth-child(1) > div:nth-child(2)>div>div>div:nth-child(2)',
    cleaning_fee_brut_not_sliced: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div:nth-child(1)> div:nth-child(1) > div:nth-child(2)>div>div>div:nth-child(3)',
    taxes_fee_brut_not_sliced: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div:nth-child(1)> div:nth-child(1) > div:nth-child(2)>div>div>div:nth-child(4)',
    total_amount_brut_not_sliced: '#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div:nth-child(1)> div:nth-child(1) > div:nth-child(2)>div>div>div:nth-child(5)'
}


async function getScreenshots(newPage, screenshotNumber) {
    screenshot = await newPage.screenshot({
        path: 'screenshot-' + screenshotNumber + '.png',
        fullPage: true
    });

    await s3Client.upload({
        Key: options.awsS3OutputScreenshotsKey + '/screenshot-' + screenshotNumber + '.png',
        Bucket: options.awsS3OutputScreenshotsBucket,
        Body: screenshot
    }).promise()
}

async function getData(browser, urls, writeStream) {
    for (i = 0; i <= urls.length; i++) {
        try {
            let newPage = await browser.newPage();
            await newPage.setDefaultNavigationTimeout(0);
            console.log('navigation to the current search_page  : ', urls[i]);

            await newPage.goto(urls[i]);
            await newPage.waitForSelector('#__next');

            let dataObj = {};
            await newPage.$('#__next');

            // calling the function to get the the screenshot for 
            // the current listing and uload it on minio

            await getScreenshots(newPage, i);

            console.log('the results are ...');
            dataObj['URL'] = await newPage.url();

            check_in_date = await newPage.$(requestDataPaths.check_in_date) !== null ? await newPage.$eval(requestDataPaths.check_in_date, text => text.textContent) : "no check_in_date";
            check_out_date = await newPage.$(requestDataPaths.check_out_date) !== null ? await newPage.$eval(requestDataPaths.check_out_date, text => text.textContent) : "no check_out_date";
            price_per_night = await newPage.$(requestDataPaths.price_per_night_brut) !== null ? await newPage.$eval(requestDataPaths.price_per_night_brut, text => text.textContent) : "no price_per_night_brut";
            security_deposit_brut_not_sliced = await newPage.$(requestDataPaths.security_deposit_brut_not_sliced) !== null ? await newPage.$eval(requestDataPaths.security_deposit_brut_not_sliced, text => text.textContent) : "no security_deposit_brut_not_sliced";
            security_deposit_brut = security_deposit_brut_not_sliced.slice(0, 5);
            cleaning_fee_brut_not_sliced = await newPage.$(requestDataPaths.cleaning_fee_brut_not_sliced) !== null ? await newPage.$eval(requestDataPaths.cleaning_fee_brut_not_sliced, text => text.textContent) : "no cleaning_fee_brut_not_sliced";
            cleaning_fee_brut = cleaning_fee_brut_not_sliced.slice(0, 5);
            taxes_fee_brut_not_sliced = await newPage.$(requestDataPaths.taxes_fee_brut_not_sliced) !== null ? await newPage.$eval(requestDataPaths.taxes_fee_brut_not_sliced, text => text.textContent) : "no taxes_fee_brut_not_sliced";
            taxes_fee_brut = cleaning_fee_brut_not_sliced.slice(0, 5);
            total_amount_brut_not_sliced = await newPage.$(requestDataPaths.total_amount_brut_not_sliced) !== null ? await newPage.$eval(requestDataPaths.total_amount_brut_not_sliced, text => text.textContent) : "no total_amount_brut_not_sliced";
            total_amount_brut = total_amount_brut_not_sliced.slice(0, 5);

            // checking different configurations to get the correct data
            // whenever there are deposit fee or not 

            // 1) security deposit identification -------------------------------------------------------------------------------------------

            if (security_deposit_brut == 'Secur') {
                security_deposit = dataObj['security_deposit_brut']
            }
            else if (cleaning_fee_brut == 'Secur') {
                security_deposit = dataObj['cleaning_fee_brut']
            }
            else if (taxes_fee_brut == 'Secur') {
                taxes_fee = dataObj['taxes_fee_brut']
            }
            else if (total_amount_brut == 'Secur') {
                total_amount = dataObj['total_amount_brut']
            }
            else {
                security_deposit = 'no security deposit'
            }
            // 2) cleaning fee identification -------------------------------------------------------------------------------------------

            if (cleaning_fee_brut == 'Clean') {
                cleaning_fee = dataObj['cleaning_fee_brut']
            }
            else if (taxes_fee_brut == 'Clean') {
                cleaning_fee = dataObj['taxes_fee_brut']
            }
            else if (total_amount_brut == 'Clean') {
                cleaning_fee = dataObj['total_amount_brut']
            }
            else {
                cleaning_fee = 'no cleaning fee'
            }
            // 3) taxes fee identification -------------------------------------------------------------------------------------------

            if (taxes_fee_brut == 'Taxes') {
                taxes_fee = dataObj['taxes_fee_brut']
            }
            else if (total_amount_brut == 'Taxes') {
                taxes_fee = dataObj['total_amount_brut']
            }
            else {
                taxes_fee = 'no taxes fee'
            }

            // 4) total amount identification -------------------------------------------------------------------------------------------

            if (total_amount_brut == 'Total') {
                total_amount = dataObj['total_amount_brut']
            }
            else {
                total_amount = 'no total amount'
            }

            const result =
            {
                outputFile: options.awsS3OutputKey,
                search_URL: `${dataObj['URL']}`,
                check_in_date: check_in_date,
                check_out_date: check_out_date,
                price_per_night: price_per_night,
                security_deposit: security_deposit,
                cleaning_fee: cleaning_fee,
                taxes_fee: taxes_fee,
                total_amount: total_amount,
            };
            console.log('pushing result', result)
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
    const writeStream = csvWriteStream({ separator: ',', enclose: true });
    const outStream = new Stream.PassThrough();
    const urls = await getInputData(options);

    console.log('workerindex urls are : ', urls);
    let browser;
    try {
        writeStream
            .pipe(createGzip())
            .pipe(outStream);
        browser = await browserInstance;

        await getData(browser, urls, writeStream);

        console.log('ending');
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