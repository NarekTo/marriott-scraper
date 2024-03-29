const config = require('@trans/config');
const moment = require('moment');
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
        name: 'aws-s3-output-screenshots-path',
        type: String,
        description: 'folder where the screenshots will be uploaded while scraping the listings',
    },
    {
        name: 'aws-s3-output-screenshots-path-format',
        type: String,
        description: '(optional) Full S3 URI of the .csv.gz file where the file will be written, formatted with a moment.js format',
    },
    {
        name: 'aws-s3-output-screenshots-bucket',
        type: String,
        description: '(optional) Full S3 URI of the screenshots where the file will be written',
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
    },
    {
        name: 'proxy-hosts',
        type: String,
        description: 'Proxy server'
    },
    {
        name: 'proxy-username',
        type: String,
        description: 'Proxy username'
    },
    {
        name: 'proxy-password',
        type: String,
        description: 'Proxy password'
    }
];

const rawOptions = config.env.getArguments(cliArguments, process.argv, {
    handleHelp: true,
    handleUnknown: true,
});

function parseOptions(rawOptions) {
    const awsS3AccessKey = rawOptions['aws-s3-access-key'];
    const awsS3SecretKey = rawOptions['aws-s3-secret-key'];
    const awsS3Region = rawOptions['aws-s3-region'];
    const awsS3InputFilePath = rawOptions['aws-s3-input-path'];
    let awsS3OutputFilePath = '';
    const awsS3OutputFilePathFormat = rawOptions['aws-s3-output-path-file-format'];
    let awsS3OutputScreenshotsPath = '';
    const awsS3OutputScreenshotsPathFormat = rawOptions['aws-s3-output-screenshots-path-format'];
    const numWorkers = rawOptions['num-workers'];
    const workerIndex = rawOptions['worker-index'];
    const awsS3Endpoint = rawOptions['aws-s3-endpoint'];
    const proxyHosts = rawOptions['proxy-hosts'];
    const proxyUsername = rawOptions['proxy-username'];
    const proxyPassword = rawOptions['proxy-password'];

    assert(rawOptions['aws-s3-access-key'], '--aws-s3-access-key is required');
    assert(rawOptions['aws-s3-secret-key'], '--aws-s3-secret-key is required');

    const historicSupplyMonth = moment.utc().startOf('month').format('YYYY-MM');

    if (rawOptions['aws-s3-output-file-path']) {
        assert(!rawOptions['aws-s3-output-file-path-format'], 'You must not set both --aws-s3-output-file-path and --aws-s3-output-file-path-format');
        awsS3OutputFilePath = rawOptions['aws-s3-output-file-path'];
    } else {
        assert(rawOptions['aws-s3-output-file-path-format'], 'You must set either --aws-s3-output-file-path or --aws-s3-output-file-path-format');
        const mDate = historicSupplyMonth ? moment.utc(`${historicSupplyMonth}-01`) : moment.utc();
        awsS3OutputFilePath = mDate.format(rawOptions['aws-s3-output-file-path-format']);
    }

    if (rawOptions['aws-s3-output-screenshots-path']) {
        assert(!rawOptions['aws-s3-output-screenshots-path-format'], 'You must not set both --aws-s3-output-screenshots-path and --aws-s3-output-screenshots-path-format');
        awsS3OutputScreenshotsPath = rawOptions['aws-s3-output-screenshots-path'];
    } else {
        assert(rawOptions['aws-s3-output-screenshots-path-format'], 'You must set either --aws-s3-output-screenshots-path or --aws-s3-output-screenshots-path-format');
        const mDate = historicSupplyMonth ? moment.utc(`${historicSupplyMonth}-01`) : moment.utc();
        awsS3OutputScreenshotsPath = mDate.format(rawOptions['aws-s3-output-screenshots-path-format']);
    }


    assert(rawOptions['aws-s3-input-path'], 'aws-s3-input-path should be set');

    const partsInput = /^s3:\/\/([^\/]+)\/((?:[^\/]+\/)*[^\/]+\.csv)$/.exec(rawOptions['aws-s3-input-path']);

    assert(partsInput && partsInput.length === 3, '--aws-s3-input-path should be a valid S3 location for a .csv file: s3://bucket/folder/input.csv');
    const awsS3InputBucket = partsInput[1];
    const awsS3InputKey = partsInput[2];

    const partsOutput = /^s3:\/\/([^\/]+)\/((?:[^\/]+\/)*[^\/]+\.csv\.gz)$/.exec(awsS3OutputFilePath);

    assert(partsOutput && partsOutput.length === 3, '--aws-s3-output-path should be a valid S3 location for a .csv.gz file: s3://bucket/folder/file.csv.gz');
    const awsS3OutputBucket = partsOutput[1];
    const awsS3OutputKey = numWorkers > 0 ? `${partsOutput[2].split('.csv.gz')[0]}.worker-${workerIndex}.csv.gz` : null;

    const partsOutputScreenshots = /^s3:\/\/([^\/]+)\/((?:[^\/]+\/)*[^\/]+)/.exec(awsS3OutputScreenshotsPath);

    assert(partsOutputScreenshots && partsOutputScreenshots.length === 3, '--aws-s3-output-screenshots-path should be a valid folder: s3://bucket/folder/');
    const awsS3OutputScreenshotsBucket = partsOutputScreenshots[1];
    const awsS3OutputScreenshotsKey = numWorkers > 0 ? `${partsOutputScreenshots[2]}` : null;

    const options = {
        awsS3AccessKey,
        awsS3SecretKey,
        awsS3Region,
        awsS3InputBucket,
        awsS3InputKey,
        awsS3OutputBucket,
        awsS3OutputKey,
        awsS3OutputScreenshotsBucket,
        awsS3OutputScreenshotsKey,
        awsS3InputFilePath,
        awsS3OutputFilePath,
        awsS3OutputFilePathFormat,
        awsS3OutputScreenshotsPath,
        awsS3OutputScreenshotsPathFormat,
        numWorkers,
        workerIndex,
        awsS3Endpoint,
        proxyHosts,
        proxyUsername,
        proxyPassword,
    }
    return options;
}
module.exports = parseOptions(rawOptions);