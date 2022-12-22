const AWS = require('aws-sdk');
const options = require('./config');


let s3Client = new AWS.S3(
    {
        accessKeyId: options.awsS3AccessKey,
        secretAccessKey: options.awsS3SecretKey,
        region: options.awsS3Region,
        endpoint: options.awsS3Endpoint,
        s3ForcePathStyle: true,
        httpOptions: {
            timeout: 12 * 3600 * 1000, // This avoids timeout errors (12 hours)
        },
    },
)
module.exports = s3Client;
