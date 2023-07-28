const fs = require('fs');
const path = require('path');
const moment = require("moment");

const SOURCE_FOLDER = '.mytemp/origin';
const DESTINATION_FOLDER = '.mytemp/destination';

const getDestinationFolder = (date) => {
  const year = date.slice(0, 4);
  const month = date.slice(5, 7);
  return path.join(DESTINATION_FOLDER, year, month);
}

const getDateTaken = (filepath) => {
  const stats = fs.statSync(filepath);
  return moment(stats.birthtime).format();
}

const generateNewFilename = (file, counter) => {
  const parts = file.filename.split('.');
  const name = parts[0];
  const extension = parts[1];
  return `${path.join(file.target, name)} (${counter}).${extension}`;
}

const processFiles = (folderPath) => {
  const files = fs.readdirSync(folderPath);

  const result = [];

  for (const file of files) {
    const filepath = path.join(folderPath, file);

    let date = getDateTaken(filepath);

    result.push({
      source: filepath,
      target: getDestinationFolder(date),
      filename: file
    })
  }
  console.log(`Processing folder ${folderPath} with ${result.length} files found`);
  for(const file of result) {
    fs.mkdirSync(file.target, { recursive: true });
    let destinationFile = path.join(file.target, file.filename);
    
    let counter = 0;
    while (fs.existsSync(destinationFile)) {
      const file1 = fs.readFileSync(file.source);
      const file2 = fs.readFileSync(destinationFile);

      if (file1.equals(file2)) {
        console.log(`Found same file ${file.source} in ${file.target}`);
        break;
      } else {
        destinationFile = generateNewFilename(file, ++counter);
        console.log('The files are not the same. Generating new filename: ', destinationFile);
      }
    }

    if(!fs.existsSync(destinationFile)) {
      fs.copyFileSync(file.source, destinationFile);
    }
  }
}

// START HERE
const folders = fs.readdirSync(SOURCE_FOLDER);

// iterate through the main folder
for (const folder of folders) {
  const folderPath = path.join(SOURCE_FOLDER, folder);
  if (fs.statSync(folderPath).isDirectory()) {
    processFiles(folderPath);
  }
}