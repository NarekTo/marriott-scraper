const AWS = require('aws-sdk');

function getS3Client(options) {
    return new AWS.S3(
        {
            accessKeyId: options.awsS3AccessKey,
            secretAccessKey: options.awsS3SecretKey,
            region: options.awsS3Region,
            endpoint: options.awsS3Endpoint,
            numWorkers: options.numWorkers,
            workerIndex: options.workerIndex,
            s3ForcePathStyle: true,
            httpOptions: {
                timeout: 12 * 3600 * 1000, // This avoids timeout errors (12 hours)
            },
        },
    )
}
module.exports = getS3Client;