const getInputData = require('./input-data');
const options = require('./config');
const s3Client = require('./s3Client');
const Stream = require('stream');
const { createGzip } = require('zlib');
const csvWriteStream = require('csv-write-stream');

let counter = 25;

async function scrapeAll(browserInstance) {

    const writeStream = csvWriteStream({ separator: ',', enclose: true });
    const outStream = new Stream.PassThrough();


    try {
        writeStream
            .pipe(createGzip())
            .pipe(outStream);


        const urls = await getInputData(options);
        // console.log(urls);
        number_of_urls = urls.length;
        let browser = await browserInstance;
        for (i = counter; i <= 31; i++) {
            {
                try {
                    let newPage = await browser.newPage();
                    await newPage.setDefaultNavigationTimeout(0);
                    // await newPage.goto(urls[i]);
                    console.log('navigation to the current search_page  : ', urls[i]);

                    await newPage.goto(urls[i]);
                    console.log('avant next');
                    await newPage.waitForSelector('#__next');

                    let dataObj = {};
                    await newPage.$('#__next');
                    let path = 'screenshot-' + counter + '.png';
                    dataObj['screenshots'] = await newPage.screenshot({
                        path: path,
                        fullPage: true
                    });

                    console.log('the results are ...');
                    dataObj['URL'] = await newPage.url();

                    dataObj['check_in_date'] = await newPage.$('#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div > div:nth-child(1) > div > div > div > div > div > div > div > div > div> div:nth-child(1)  > span > div:nth-child(2)') !== null ?
                        await newPage.$eval('#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div > div:nth-child(1) > div > div > div > div > div > div > div > div > div> div:nth-child(1)  > span > div:nth-child(2)', text => text.textContent) :
                        "no check_in_date";

                    dataObj['check_out_date'] = await newPage.$(' #pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div > div > div> div > div> div > div > div > div:nth-child(4)> span > div:nth-child(2)') !== null ?
                        await newPage.$eval('#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div > div > div> div > div> div > div > div > div:nth-child(4)> span > div:nth-child(2)', text => text.textContent) :
                        "no check_in_date";

                    dataObj['price_per_night_brut'] = await newPage.$('#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div:nth-child(1)> div:nth-child(1) > div:nth-child(2)>div>div>div:nth-child(1)') !== null ?
                        await newPage.$eval('#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div:nth-child(1)> div:nth-child(1) > div:nth-child(2)>div>div>div:nth-child(1)', text => text.textContent) :
                        "no check_out_date";

                    dataObj['security_deposit_brut'] = await newPage.$('#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div:nth-child(1)> div:nth-child(1) > div:nth-child(2)>div>div>div:nth-child(2)') !== null ?
                        await newPage.$eval('#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div:nth-child(1)> div:nth-child(1) > div:nth-child(2)>div>div>div:nth-child(2)', text => text.textContent) :
                        "no security_deposit";

                    security_deposit_brut = dataObj['security_deposit_brut'].slice(0, 5);

                    dataObj['cleaning_fee_brut'] = await newPage.$('#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div:nth-child(1)> div:nth-child(1) > div:nth-child(2)>div>div>div:nth-child(3)') !== null ?
                        await newPage.$eval('#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div:nth-child(1)> div:nth-child(1) > div:nth-child(2)>div>div>div:nth-child(3)', text => text.textContent) :
                        "no cleaning_fee";
                    cleaning_fee_brut = dataObj['cleaning_fee_brut'].slice(0, 5);

                    dataObj['taxes_fee_brut'] = await newPage.$('#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div:nth-child(1)> div:nth-child(1) > div:nth-child(2)>div>div>div:nth-child(4)') !== null ?
                        await newPage.$eval('#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div:nth-child(1)> div:nth-child(1) > div:nth-child(2)>div>div>div:nth-child(4)', text => text.textContent) :
                        "no taxes_fee";
                    taxes_fee_brut = dataObj['taxes_fee_brut'].slice(0, 5);

                    dataObj['total_amount_brut'] = await newPage.$('#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div:nth-child(1)> div:nth-child(1) > div:nth-child(2)>div>div>div:nth-child(5)') !== null ?
                        await newPage.$eval('#pdp-103-bleed-0-pdphomesummary > div > div > div > div > div:nth-child(2) > div> div:nth-child(1) > div > div:nth-child(1)> div:nth-child(1) > div:nth-child(2)>div>div>div:nth-child(5)', text => text.textContent) :
                        "no total_amount";
                    total_amount_brut = dataObj['total_amount_brut'].slice(0, 5);

                    // security deposit identification -------------------------------------------------------------------------------------------

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
                    // cleaning fee identification -------------------------------------------------------------------------------------------

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
                    // taxes fee identification -------------------------------------------------------------------------------------------

                    if (taxes_fee_brut == 'Taxes') {
                        taxes_fee = dataObj['taxes_fee_brut']
                    }
                    else if (total_amount_brut == 'Taxes') {
                        taxes_fee = dataObj['total_amount_brut']
                    }
                    else {
                        taxes_fee = 'no taxes fee'
                    }

                    // total amount identification -------------------------------------------------------------------------------------------

                    if (total_amount_brut == 'Total') {
                        total_amount = dataObj['total_amount_brut']
                    }
                    else {
                        total_amount = 'no total amount'
                    }


                    const result =
                    {
                        counter: counter,
                        search_URL: `${dataObj['URL']}`,
                        check_in_date: dataObj['check_in_date'],
                        check_out_date: dataObj['check_out_date'],
                        price_per_night: dataObj['price_per_night'],
                        security_deposit: security_deposit,
                        cleaning_fee: cleaning_fee,
                        taxes_fee: taxes_fee,
                        total_amount: total_amount,
                    };
                    console.log('pushing result', result)
                    writeStream.write(result)
                    counter++;
                    await newPage.close();
                }
                catch (err) {
                    console.log("Could not resolve the browser instance => ", err);
                }
            }
        }

        console.log('ending');
        writeStream.end();

        await s3Client.upload({
            Key: options.awsS3OutputKey,
            Bucket: options.awsS3OutputBucket,
            Body: outStream
        }).promise()

        await browser.close();
    } catch (error) {
        console.error(error);
        throw error;
    }

}
module.exports = (browserInstance) => scrapeAll(browserInstance)