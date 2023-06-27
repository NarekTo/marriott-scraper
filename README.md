## Marriott luxury homes rateshops scraper from https://homes-and-villas.marriott.com/  platform

This repository contains the script that receives input listing urls from a `MinIo` address, on CSV fomat. Example:
```
https://homes-and-villas.marriott.com/en/properties/40172095?start_date=2023-10-09&number_of_guests=1&nights=4&showPriceInHomeCurrency=false&currency=USD5&showPriceInHomeCurrency=false&currency=USD
https://homes-and-villas.marriott.com/en/properties/40172121?start_date=2023-10-09&number_of_guests=1&nights=4&showPriceInHomeCurrency=false&currency=USD5&showPriceInHomeCurrency=false&currency=USD
https://homes-and-villas.marriott.com/en/properties/40172139?start_date=2023-10-09&number_of_guests=1&nights=4&showPriceInHomeCurrency=false&currency=USD5&showPriceInHomeCurrency=false&currency=USD
https://homes-and-villas.marriott.com/en/properties/40068457?start_date=2023-10-09&number_of_guests=1&nights=4&showPriceInHomeCurrency=false&currency=USD5&showPriceInHomeCurrency=false&currency=USD
```

Then by scraping the rateshops and registring the screenshot of each listing, it is storing in the `minio` server as a `csv` file : `csv` for the metrics and `png` for the screenshots images.

As the `puppeteer` library is hardly configurable and not always compatible with different OS versions (especially with MAC OS), there is no docker and kubernetes configurations, thus the deployment happens on the bastion servers. 

## Characteristics

Scraping rateshops by using worker processes in order to run the module in parallely for several chuncks of input URLs. 

For exemple as a number of worker 4 the application will run with 4 different worker indexes, thus creating 4 different `csv` output files and storing the screenshots in 4 different folders : each output file and output folder named according to its worker index. 

## Running application, usage example by this command: 
For instance, in order to scrap all the metrics from an input file for a total `num-worker` = 4 configuration, we should run these commands :  
```sh
npm run start -- --worker-index 0 // to scrap the first chunck from the input file urls
npm run start -- --worker-index 1 // to scrap the second chunck from the input file urls
npm run start -- --worker-index 2 // to scrap the third chunck from the input file urls
npm run start -- --worker-index 3 // to scrap the forth chunck from the input file urls 
```

## Configuration

- **--aws-s3-acces-key** : minio username 
- **--aws-s3-secret-key** : minio user password
- **--aws-s3-region** : `trans-fr-00`
- **--aws-s3-input-path** : minio input csv file, exemple `s3://BUCKET_NAME/INPUT_FILE_NAME.csv.gz`
- **--aws-s3-output-file-path** : minio output csv file with `.csv.gz` including the bucket name , exemple `s3://BUCKET_NAME/OUTPUT_FILE_NAME.csv.gz`
- **--aws-s3-output-file-path-format** :  <a href="https://momentjs.com/docs/#/parsing/string-format/">The time</a>   configurable output csv file to take into account the iteration of scrapings with `.csv.gz` including the bucket name , exemple `s3://BUCKET_NAME/output/]YYYY-MM[/OUTPUT_FILE_NAME]`

- **--aws-s3-output-screenshots-path** : listing screenshots folder name including the bucket name , exemple : `s3://BUCKET_NAME/FOLDER_NAME`
- **--aws-s3-endpoint** : `https://minio.pltp.us`

### In the `config.js` file we can set the number of workers (4 by default)