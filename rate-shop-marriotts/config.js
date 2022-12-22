const config = require('@trans/config');
const moment = require('moment');
const AWS = require('aws-sdk');


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
    // {
    //     name: 'aws-s3-bucket',
    //     type: String,
    //     description: '(optional) AWS S3 Bucket',
    //     defaultValue: 'eu-central-1',
    // },
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
        name: 'num-workers',
        type: Number,
        description: 'Number of concurrent processes that will run the export',
        defaultValue: 1,
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

// export function buildCliArguments() {
// }


const rawOptions = config.env.getArguments(cliArguments, process.argv, {
    handleHelp: true,
    handleUnknown: true,
});

function parseOptions(rawOptions) {

    let awsS3AccessKey = rawOptions['aws-s3-access-key'];
    let awsS3SecretKey = rawOptions['aws-s3-secret-key'];
    let awsS3Bucket = rawOptions['aws-s3-bucket'];
    let awsS3Region = rawOptions['aws-s3-region'];
    let inputS3FilePath = rawOptions['aws-s3-input-path'];
    let awsS3OutputFilePath = rawOptions['aws-s3-output-path'];
    let awsS3OutputFilePathFormat = rawOptions['aws-s3-output-path-format'];
    let numWorkers = rawOptions['num-workers'];
    let workerIndex = rawOptions['worker-index'];

    console.assert(rawOptions['aws-s3-access-key'], '--aws-s3-access-key is required');
    console.assert(rawOptions['aws-s3-secret-key'], '--aws-s3-secret-key is required');

    const historicSupplyMonth = moment.utc().startOf('month').subtract(1, 'month').format('YYYY-MM');

    if (rawOptions['aws-s3-output-file-path']) {
        console.assert(!rawOptions['aws-s3-output-file-path-format'], 'You must not set both --aws-s3-output-file-path and --aws-s3-output-file-path-format');
        outputS3FilePath = rawOptions['aws-s3-output-file-path'];
    } else {
        console.assert(rawOptions['aws-s3-output-file-path-format'], 'You must set either --aws-s3-output-file-path or --aws-s3-output-file-path-format');
        const mDate = historicSupplyMonth ? moment.utc(`${historicSupplyMonth}-01`) : moment.utc();
        outputS3FilePath = mDate.format(rawOptions['aws-s3-output-file-path-format']);
    }

    const options = {
        awsS3AccessKey,
        awsS3SecretKey,
        awsS3Region,
        inputS3FilePath,
        outputS3FilePath,
        numWorkers,
        workerIndex,
        // parts
        //bucket
        //filaname
    }
    console.log(options);
    return options;
}

module.exports = parseOptions(rawOptions);

// For the input, the script shall receive a INPUT_S3_PATH, as a string. 
// Add validation for this parameter to be mandatory for the script to work. 
// Throw an error with a descriptive message if it is not set. 
// For inspiration, check @trans/crons::src/normal-supply-export/config.ts

// To handle concurrency, the script shall receive NUM_WORKERS and WORKER_INDEX params, both integers. 
// For inspiration, check @trans/crons::src/bsc/config.ts


// assert(rawOptions['aws-s3-access-key'], '--aws-s3-access-key is required');
// assert(rawOptions['aws-s3-secret-key'], '--aws-s3-secret-key is required');
// let outputS3FilePath;
// if (rawOptions['output-s3-file-path']) {
//   assert(!rawOptions['output-s3-file-path-format'], 'You must not set both --output-s3-file-path and --output-s3-file-path-format');
//   outputS3FilePath = rawOptions['output-s3-file-path'];
// } else {
//   assert(rawOptions['output-s3-file-path-format'], 'You must set either --output-s3-file-path or --output-s3-file-path-format');
//   const mDate = historicSupplyMonth ? moment.utc(`${historicSupplyMonth}-01`) : moment.utc();
//   outputS3FilePath = mDate.format(rawOptions['output-s3-file-path-format']);
// }
// const parts = outputS3FilePath.match(/^s3:\/\/([^\/]+)\/((?:[^\/]+\/)*[^\/]+\.csv\.gz)$/);
// assert(_.isArray(parts) && parts.length >= 3, 'The output S3 file path should be a full S3 URI finished in ".csv.gz"');
// const awsS3Bucket = parts[1];
// const awsS3RelativeFilePath = parts[2];


//return the file path 
