const config = require('@trans/config');
const moment = require('moment');
const AWS = require('aws-sdk');
const assert = require('assert');


config.env.load();

const cliArguments = [
    {
        name: 'aws-s3-access-key',
        type: String,
        description: '(required) AWS S3 Access key',
    },
    {
        name: 'aws-s3-secret-key',
        type: String,
        description: '(required) AWS S3 Secret key',
    },
    {
        name: 'aws-s3-region',
        type: String,
        description: '(optional) AWS S3 Region',
        defaultValue: 'eu-central-1',
    },
    {
        name: 'aws-s3-endpoint',
        type: String,
        description: '(optional) AWS S3 Region',
        defaultValue: 'eu-central-1',
    },
    {
        name: 'aws-s3-input-path',
        type: String,
        description: `(optional) MinIo/AWS S3 endpoint. When points to a MinIO service the rest of associated parameters
             (access key, secret key and region) must be the equivalent concept for MinIO. When not set it points to S3`,
        defaultValue: null,
    },
    {
        name: 'aws-s3-output-file-path-format',
        type: String,
        description: '(optional) Full S3 URI of the .csv.gz file where the file will be written, formatted with a moment.js format',
    },
    {
        name: 'aws-s3-output-file-path',
        type: String,
        description: '(optional) Full S3 URI of the .csv.gz file where the file will be written',
    },
    {
        name: 'aws-s3-output-bucket',
        type: String,
        description: '(optional) Full S3 URI of the .csv.gz file where the file will be written',
    },

    {
        name: 'num-workers',
        type: Number,
        description: 'Number of concurrent processes that will run the export',
        defaultValue: 4,
    },
    {
        name: 'worker-index',
        type: Number,
        description:
            'Having multiple workers (num-workers greater than 1), ' +
            'worker-index identify this worker as index in workers array',
        defaultValue: 0,
    }
];

const rawOptions = config.env.getArguments(cliArguments, process.argv, {
    handleHelp: true,
    handleUnknown: true,
});

function parseOptions(rawOptions) {
    let awsS3AccessKey = rawOptions['aws-s3-access-key'];
    let awsS3SecretKey = rawOptions['aws-s3-secret-key'];
    let awsS3InputBucket;
    let awsS3InputKey;
    let awsS3OutputBucket;
    let awsS3OutputKey = [];
    let awsS3Region = rawOptions['aws-s3-region'];
    let awsS3InputFilePath = rawOptions['aws-s3-input-path'];
    let awsS3OutputFilePath = rawOptions['aws-s3-output-file-path'];
    let awsS3OutputFilePathFormat = rawOptions['aws-s3-output-path-file-format'];
    let numWorkers = rawOptions['num-workers'];
    let workerIndex = rawOptions['worker-index'];
    let awsS3Endpoint = rawOptions['aws-s3-endpoint'];


    assert(rawOptions['aws-s3-access-key'], '--aws-s3-access-key is required');
    assert(rawOptions['aws-s3-secret-key'], '--aws-s3-secret-key is required');

    const historicSupplyMonth = moment.utc().startOf('month').subtract(1, 'month').format('YYYY-MM');

    if (rawOptions['aws-s3-output-file-path']) {
        assert(!rawOptions['aws-s3-output-file-path-format'], 'You must not set both --aws-s3-output-file-path and --aws-s3-output-file-path-format');
        awsS3OutputFilePath = rawOptions['aws-s3-output-file-path'];
    } else {
        assert(rawOptions['aws-s3-output-file-path-format'], 'You must set either --aws-s3-output-file-path or --aws-s3-output-file-path-format');
        const mDate = historicSupplyMonth ? moment.utc(`${historicSupplyMonth}-01`) : moment.utc();
        awsS3OutputFilePath = mDate.format(rawOptions['aws-s3-output-file-path-format']);
    };

    assert(rawOptions['aws-s3-input-path'], 'aws-s3-input-path should be set');

    const partsInput = /^s3:\/\/([^\/]+)\/((?:[^\/]+\/)*[^\/]+\.csv)$/.exec(rawOptions['aws-s3-input-path']);
    assert(partsInput && partsInput.length === 3, '--aws-s3-input-path should be a valid S3 location for a .csv file');
    awsS3InputBucket = partsInput[1];
    awsS3InputKey = partsInput[2];

    const partsOutput = /^s3:\/\/([^\/]+)\/((?:[^\/]+\/)*[^\/]+\.csv\.gz)$/.exec(awsS3OutputFilePath);

    assert(partsOutput && partsOutput.length === 3, '--aws-s3-output-path should be a valid S3 location for a .csv file');
    awsS3OutputBucket = partsOutput[1];
    console.log('awsS3OutputBucket', awsS3OutputBucket);
    // console.log('awsS3OutputKey', awsS3OutputKey);

    function getS3OutputFilename(workerIndex) {
    return numWorkers > 1 ? `${partsOutput[2]}.worker-${workerIndex}.csv.gz` : null
    }
    let i = workerIndex + 1;

    const options = {
        awsS3AccessKey,
        awsS3SecretKey,
        awsS3Region,
        awsS3InputBucket,
        awsS3InputKey,
        awsS3OutputBucket,
        // awsS3OutputKey,
        awsS3InputFilePath,
        awsS3OutputFilePath,
        awsS3OutputFilePath,
        awsS3OutputFilePathFormat,
        numWorkers,
        workerIndex,
        awsS3Endpoint,
        getS3OutputFilename
    }
    console.log('these are the options', options);
    return options;
}
module.exports = parseOptions(rawOptions);