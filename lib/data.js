/*
 * Title: data handler
 * Description: data read & write handler
 * Author: Mohi Uddin Mahim
 * Date: 03-07-22
 */

// dependencies
const fs = require('fs');
const path = require('path');

// module scaffolding
const lib = {};

// base directory to the data folder
lib.basedir = path.join(__dirname, '/../.data/');

// write data to file
lib.create = (dir, file, data, callback) => {
    // creating directory if not exists
    try {
        if (
            fs.access(`${lib.basedir + dir}`, fs.constants.W_OK && fs.constants.R_OK, (err6) => {
                if (err6) {
                    console.log('failed');
                } else {
                    console.log('success');
                }
            })
        ) {
            console.log('file found');
        } else {
            fs.mkdir(`${lib.basedir + dir}`, { recursive: true }, (err5) => {
                if (err5) {
                    console.log('directory creation failed');
                } else {
                    console.log('directory created');
                }
            });
        }
    } catch (e) {
        console.log(e);
    }

    // open file for writing
    fs.open(`${lib.basedir + dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // convert data to string
            const stringData = JSON.stringify(data);

            // write data to file and close it
            fs.writeFile(fileDescriptor, stringData, (err2) => {
                if (!err2) {
                    fs.close(fileDescriptor, (error) => {
                        if (!error) {
                            callback(false);
                        } else {
                            callback('Error closing the new file');
                        }
                    });
                } else {
                    callback('error writing to new file!');
                }
            });
        } else {
            callback('There was an error file may already exist');
        }
    });
};

// read data from file
lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.basedir + dir}/${file}.json`, 'utf8', (err, data) => {
        callback(err, data);
    });
};

// update existing file
lib.update = (dir, file, data, callback) => {
    // file open for writing
    fs.open(`${lib.basedir + dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // convert data to string
            const stringData = JSON.stringify(data);

            // truncate file
            fs.ftruncate(fileDescriptor, (err1) => {
                if (!err1) {
                    // write file
                    fs.writeFile(fileDescriptor, stringData, (err2) => {
                        if (!err2) {
                            // closing file
                            fs.close(fileDescriptor, (err3) => {
                                if (!err3) {
                                    callback(false);
                                } else {
                                    callback('Error closing file!');
                                }
                            });
                        } else {
                            callback('error writing to file');
                        }
                    });
                } else {
                    callback('error truncating file');
                }
            });
        } else {
            callback('Error updating file may not exist');
        }
    });
};

// delete existing file
lib.delete = (dir, file, callback) => {
    // unlink
    fs.unlink(`${lib.basedir + dir}/${file}.json`, (err) => {
        if (!err) {
            callback(false);
        } else {
            callback('error deleting file');
        }
    });
};

module.exports = lib;
