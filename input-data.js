const AWS = require('aws-sdk');
const s3Client = require('./s3Client');
// const options = require('./config');
const createGzip = require('zlib');

async function getInputData(options) {
    const csvContent = await s3Client.getObject({
        Bucket: options.awsS3InputBucket,
        Key: options.awsS3InputKey,
    }).promise();

    return csvContent.Body.toString().split('\n').map(e => e.trim());
}

module.exports = getInputData;