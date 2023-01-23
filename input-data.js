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
    const allUrls = csvContent.Body.toString().split('\n').map(e => e.trim());
    const result = getInputChunks(allUrls, options.numWorkers);
    console.log("the input data file is opening......");
    console.log("the input data file and its results......", result);

    return result[options.workerIndex];

}
module.exports = getInputData;