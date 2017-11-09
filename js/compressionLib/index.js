const electron = require('electron');
const fs = require('fs');
const tar = require('tar');
const lz4 = require('lz4');
const app = electron.app;

const path = require('path');
const userData = path.join(app.getPath('userData'));
const isDevEnv = require('../utils/misc.js').isDevEnv;
const DATA_FOLDER_PATH = isDevEnv ? path.join(__dirname, '..', '..') : userData;

/**
 * Using the child process to execute the tar and lz4
 * compression and the final output of this function
 * will be compressed file with ext: .tar.lz4
 * @param folderName
 * @param callback
 */
function compression(folderName, callback) {
    let pathToFolder = `${DATA_FOLDER_PATH}/data/${folderName}`;
    let outputPath = `${DATA_FOLDER_PATH}/${folderName}`;
    tar.c({file: `${outputPath}.tar`}, [pathToFolder])
        .then(() => {
            let encoder = lz4.createEncoderStream();

            let input = fs.createReadStream(`${outputPath}.tar`);
            let output = fs.createWriteStream(`${outputPath}.tar.lz4`);

            let pipeOut = input.pipe(encoder).pipe(output);

            pipeOut.on('finish', function () {
                fs.unlinkSync(`${outputPath}.tar`);
                return callback(null, 'success');
            });
        })
        .catch((error) => {
            return callback(new Error(error), null);
        })
}

/**
 * This function decompress the file
 * and the ext should be .tar.lz4
 * the output will be the user index folder
 * @param fileName
 * @param callback
 */
function deCompression(fileName, callback) {
    let inputPath = `${DATA_FOLDER_PATH}/${fileName}`;
    let outputPath = `${DATA_FOLDER_PATH}/uncompressed.tar`;

    let decoder = lz4.createDecoderStream();

    let input = fs.createReadStream(inputPath);
    let output = fs.createWriteStream(outputPath);

    input.pipe(decoder).pipe(output).on('finish', () => {
        tar.x({file: outputPath})
            .then(() => {
                fs.unlinkSync(outputPath);
                return callback(null, 'success')
            })
            .catch((error) => {
                return callback(new Error(error), null)
            });
    });
}

module.exports = {
    compression,
    deCompression
};
