const fs = require('fs');
const path = require('path');
const moment = require("moment");

const SOURCE_FOLDER = './original';
const DESTINATION_FOLDER = './destination';

const getDestinationFolder = (date) => {
  const year = date.slice(0, 4);
  const month = date.slice(5, 7);
  const day = date.slice(8, 10);
  return path.join(DESTINATION_FOLDER, year, month, day);
}

const getDateTaken = (filepath) => {
  const stats = fs.statSync(filepath);
  return moment(stats.birthtime).format();
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

  for(const file of result) {
    fs.mkdirSync(file.target, { recursive: true });
    fs.copyFileSync(file.source, path.join(file.target, file.filename));
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