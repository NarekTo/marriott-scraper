const AWS = require('aws-sdk');
const s3Client = require('./s3Client');
const options = require('./config');

async function getInputData(options) {
    const csvContent = await s3Client.getObject({
        Bucket: options.awsS3InputBucket,
        Key: options.awsS3InputKey,
    }).promise();

    const numWorkers = options.numWorkers;
    const workerIndex = options.workerIndex;
    const allUrls = csvContent.Body.toString().split('\n').map(e => e.trim());

    const equalChunks = (inputUrls, numberChunks) => {
        const size = Math.ceil(inputUrls.length / numberChunks);
        return Array.from({ length: numberChunks }, (v, i) =>
        inputUrls.slice(i * size, i * size + size)
        );
    }

    const result = equalChunks(allUrls, options.numWorkers);
    console.log('chunks are : ', result)
    return result[workerIndex];
}

module.exports = getInputData;