const AWS = require('aws-sdk');
const s3Client = require('./s3Client');
const options = require('./config');
const createGzip = require('zlib');
// const { numWorkers } = require('./config');

async function getInputData(options) {
    const csvContent = await s3Client.getObject({
        Bucket: options.awsS3InputBucket,
        Key: options.awsS3InputKey,
    }).promise();

    const numWorkers = options.numWorkers;
    const workerIndex = options.workerIndex;
    const allUrls = csvContent.Body.toString().split('\n').map(e => e.trim());


    function sliceIntoChunks(arr, chunkSize) {
        const res = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            const chunk = arr.slice(i, i + chunkSize);
            res.push(chunk);
        }
        return res;
    }    

    chunkUrls = sliceIntoChunks(allUrls, numWorkers)
    return chunkUrls[workerIndex];
}

module.exports = getInputData;