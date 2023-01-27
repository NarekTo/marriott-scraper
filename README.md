. Marriott luxury homes rateshops scraper from https://homes-and-villas.marriott.com/ platform


This module is automatically and dynamically getting the input inting urls from MINIO server, which was previously uploaded to MINIO with a CSV format file.
Then by scraping the rateshops and registring the screenshot from each listing, it is storing in the MINIO server as a CSV file for the metrics and png images for the screenshots.

As the puppeteer library is hardly configurable and not always compatible with different OS versions (especially with MAC OS), for this reason there is not any docker and kubernetes configurations in this repo, thus we will configure the bastion deployment. 

. Characteristics

scraping rateshops by using streams, which lets us to make run the application with service workers
for a number of worker 4 the application can be run with 4 different worker indexes, thus creating 4 different CSV output files and parallelly store the screenshots in 4 defferent folders : each output file and output folder named according to the worker index 

running application, usage example by this command: 

 npm run start -- --worker-index 1 

will run the application and scrap the second chunck of the input file 


. Configuration

AWS_S3_ACCESS_KEY : minio username 
AWS_S3_SECRET_KEY : minio user password
AWS_S3_REGION : trans-fr-00
AWS_S3_INPUT_PATH : minio input csv file, exemple s3://BUCKET_NAME/INPUT_FILE_NAME.csv.gz
AWS_S3_OUTPUT_FILE_PATH : minio output csv file with .csv.gz including the bucket name , exemple s3://BUCKET_NAME/OUTPUT_FILE_NAME.csv.gz
AWS_S3_OUTPUT_SCREENSHOTS_PATH : listing screenshots folder name including the bucket name , exemple s3://BUCKET_NAME/FOLDER_NAME.csv.gz
AWS_S3_ENDPOINT : https://minio.pltp.us

in the config.js file we can set the number of workers (4 by default)