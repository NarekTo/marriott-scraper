const zlib = require('zlib');
const Readable = require('stream');
const util = require('util');
const pageScraper = require('./scraper');
const csv = require('csv-parser');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
let counter = 32;
const getInputData = require('../input-data');
const options = require('./config');


const csvWriter = createCsvWriter({

    path: '/outputs/data-output-1-v-6.csv',
    header: [
        { id: 'counter', title: 'counter' },
        { id: 'search_URL', title: 'search_URL' },
        { id: 'check_in_date', title: 'check_in_date' },
        { id: 'check_out_date', title: 'check_out_date' },

        { id: 'price_per_night', title: 'price_per_night' },

        { id: 'security_deposit', title: 'security_deposit' },

        { id: 'cleaning_fee', title: 'cleaning_fee' },

        { id: 'taxes_fee', title: 'taxes_fee' },

        { id: 'total_amount', title: 'total_amount' },
    ]
});


async function scrapeAll(browserInstance) {
    let fs = require('fs');



    // const chunks = _.chunk(urls, 1000);
    // const chunkToProcess = process.env.CHUNK_NUMBER;
    // const chunk = chunks[chunkToProcess];

    // options.numWorkers = options.inputS3FilePath;
    // const chunks = options.numWorkers;
    // const chunkToProcess = options.workerIndex;
    // const chunk = chunks[chunkToProcess];

    const urls = await getInputData(options);
    // fs.readFileSync(options.inputS3Path)
    //     .toString().split('\n').map(e => e.trim());;

    console.log(urls);
    number_of_urls = urls.length;
    let browser = await browserInstance;
    // for (i = 32; i <= chunk; i++)     
    for (i = 1; i <= 10; i++) {
        {
            try {
                let newPage = await browser.newPage();
                await newPage.setDefaultNavigationTimeout(0);
                await newPage.goto(urls[i]);
                console.log('navigation to the current search_page  : ', urls[i]);

                await newPage.goto(urls[i]);
                console.log('avant next');
                await newPage.waitForSelector('#__next');

                let dataObj = {};
                await newPage.$('#__next');
                let path = '/outputs/screenshot-' + counter + '.png';
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


                const records = [
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
                    },
                ];
                csvWriter.writeRecords(records)
                    .then(() => {
                        console.log('...Done for counter', counter);
                    });
                counter++;
                await newPage.close();
            }
            catch (err) {
                console.log("Could not resolve the browser instance => ", err);
            }
        }
        await browser.close();
    }
}

module.exports = (browserInstance) => scrapeAll(browserInstance)