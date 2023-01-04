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

    const equalChunks = (arr, n) => {
        const size = Math.ceil(arr.length / n);
        return Array.from({ length: n }, (v, i) =>
            arr.slice(i * size, i * size + size)
        );
    }

    const result = equalChunks(allUrls, options.numWorkers);
    console.log('chunks are : ', result)
    return result[workerIndex];
}

module.exports = getInputData;