const s3Client = require('./s3-client');

const getInputChunks = (inputUrls=[], numberChunks) => {
   const chunks = [];
   while(inputUrls.length) {
      const chunkSize = Math.ceil(inputUrls.length/numberChunks--);
      const chunk = inputUrls.slice(0, chunkSize);
      chunks.push(chunk);
      inputUrls = inputUrls.slice(chunkSize);
   };
   return chunks;
};

async function getInputData(options) {
    const csvContent = await s3Client.getObject({
        Bucket: options.awsS3InputBucket,
        Key: options.awsS3InputKey,
    }).promise();

    console.log('csvContent',csvContent)
    const allUrls = csvContent.Body.toString().split('\n').map(e => e.trim());
    console.log('urls from minio',allUrls)


    let fs = require('fs');

    // let allUrlsCopy = fs.readFileSync('input-13-listings-for-16-jan-2022 copy.csv').toString().split('\n').map(e => e.trim());
    // console.log('urls from the local file',allUrlsCopy)

    // let allUrlsNew = fs.readFileSync('input-13-listings-for-16-jan-2022.csv').toString().split('\n').map(e => e.trim());
    // console.log('allUrlsNew',allUrlsNew)

    const result = getInputChunks(allUrls, options.numWorkers);
    // const result = allUrlsNew;

    return result[options.workerIndex];
    // return result;
}
module.exports = getInputData;