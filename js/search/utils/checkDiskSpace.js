const { exec } = require('child_process');
const { isMac } = require('../../utils/misc');
const searchConfig = require('../searchConfig.js');
const log = require('../../log.js');
const logLevels = require('../../enums/logLevels.js');

function checkDiskSpace(path, resolve, reject) {
    if (!path) {
        return reject(false);
    }

    if (isMac) {
        exec("df -k '" + path.replace(/'/g,"'\\''") + "'", (error, stdout, stderr) => {
            if (error) {
                if (stderr.indexOf(searchConfig.MAC_PATH_ERROR) !== -1) {
                    return reject(false);
                }
                return reject(false);
            }

            let data = stdout.trim().split("\n");

            let disk_info_str = data[data.length - 1].replace( /[\s\n\r]+/g,' ');
            let freeSpace = disk_info_str.split(' ');
            let space = freeSpace[3] * 1024;
            return resolve(space >= searchConfig.MINIMUM_DISK_SPACE);
        });
    } else {
        exec(`"${searchConfig.LIBRARY_CONSTANTS.FREE_DISK_SPACE}" ${path}`, (error, stdout, stderr) => {

            if (error) {
                log.send(logLevels.ERROR, `Error retrieving free disk space : ${error}`);
                log.send(logLevels.ERROR, `Error stderr: ${stderr}`);
            }

            let data = stdout.trim().split(",");

            if (data[ 1 ] === searchConfig.DISK_NOT_READY) {
                return reject(false);
            }

            if (data[ 1 ] === searchConfig.DISK_NOT_FOUND) {
                return reject(false);
            }

            let disk_info_str = data[ 0 ];
            return resolve(disk_info_str >= searchConfig.MINIMUM_DISK_SPACE);
        });
    }

    return null;
}

module.exports = {
    checkDiskSpace: checkDiskSpace
};
