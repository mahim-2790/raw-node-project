/*
 * Title: workers lib
 * Description: workers related file
 * Author: Mohi Uddin Mahim
 * Date: 03-07-22
 */
// dependencies
const url = require('url');
const http = require('http');
const https = require('https');
const data = require('./data');
const { parseJSON } = require('../helpers/utilities');
const { sendTwilioSms } = require('../helpers/notifications');

// app object - module scaffolding
const worker = {};

// gather all checks
worker.gatherAllChecks = () => {
    // gather all the checks
    data.list('checks', (err, checks) => {
        if (!err && checks && checks.length > 0) {
            checks.forEach((check) => {
                data.read('checks', check, (err2, originalCheckData) => {
                    if (!err2 && originalCheckData) {
                        // pass the data to the check validator
                        worker.validateCheckData(parseJSON(originalCheckData));
                    } else {
                        console.log('Error reading one of the checks data');
                    }
                });
            });
        } else {
            console.log(`error could not find any checks to process`);
        }
    });
};

// validate each check data
worker.validateCheckData = (checkData) => {
    const originalCheckData = { ...checkData };
    if (originalCheckData && originalCheckData.id) {
        originalCheckData.state =
            typeof originalCheckData.state === 'string' &&
            ['up', 'down'].indexOf(originalCheckData.state) > -1
                ? originalCheckData.sate
                : 'down';
        originalCheckData.lastChecked =
            typeof originalCheckData.lastChecked === 'number' && originalCheckData.lastChecked > 0
                ? originalCheckData
                : false;
        // pass to the next process
        worker.performCheck(originalCheckData);
    } else {
        console.log(`Error: check data was invalid or not properly formatted`);
    }
};

// perform check
worker.performCheck = (originalCheckData) => {
    // prepare the initial check outcome
    let checkOutcome = {
        error: false,
        responseCode: false,
    };

    // mark the out come has not been sent yet
    let outComeSent = false;

    // parse the original data
    const parsedUrl = url.parse(`${originalCheckData.protocol}://${originalCheckData.url}`, true);
    const hostName = parsedUrl.hostname;
    const { path } = parsedUrl;

    // constract the request
    const requestDetails = {
        protocol: `${originalCheckData.protocol}:`,
        hostname: hostName,
        method: originalCheckData.method.toUpperCase(),
        path,
        timeout: originalCheckData.timeoutSeconds * 1000,
    };
    const protocolToUse = originalCheckData.protocol === 'http' ? http : https;
    const req = protocolToUse.request(requestDetails, (res) => {
        // grab the status of the response
        const status = res.statusCode;

        // update the check outcome
        checkOutcome.responseCode = status;
        if (!outComeSent) {
            worker.processCheckOutCome(originalCheckData, checkOutcome);
            outComeSent = true;
        }
    });

    req.on('error', (e) => {
        checkOutcome = {
            error: true,
            value: e,
        };
        if (!outComeSent) {
            worker.processCheckOutCome(originalCheckData, checkOutcome);
            outComeSent = true;
        }
    });
    req.on('timeout', (e) => {
        checkOutcome = {
            error: true,
            value: 'timeout',
            errorS: e,
        };
        if (!outComeSent) {
            worker.processCheckOutCome(originalCheckData, checkOutcome);
            outComeSent = true;
        }
    });

    req.end();
};

// worker process check out come
worker.processCheckOutCome = (originalCheckData, checkOutcome) => {
    // check out come if up or down
    const state =
        !checkOutcome.error &&
        checkOutcome.responseCode &&
        originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1
            ? 'up'
            : 'down';

    // decide whether we should alert or not

    const alertWanted = !!(originalCheckData.lastChecked && originalCheckData.state !== state);

    // update the check data
    const newCheckData = originalCheckData;
    newCheckData.sate = state;
    newCheckData.lastChecked = Date.now();

    // updating on data base
    data.update('checks', newCheckData.id, newCheckData, (err) => {
        if (!err) {
            if (alertWanted) {
                // sent for alert
                worker.alertUserToStatusChange(newCheckData);
            } else {
                console.log('alert is not needed for one check');
            }
        } else {
            console.log('error trying to save check data of one of the checks', newCheckData.id);
        }
    });
};

// sent notification to user if state changes
worker.alertUserToStatusChange = (newCheckData) => {
    const message = `Alert: You check for ${newCheckData.method.toUpperCase()} ${
        newCheckData.protocol
    }://${newCheckData.url} i currently ${newCheckData.state}`;

    sendTwilioSms(newCheckData.userPhone, message, (err) => {
        if (!err) {
            console.log(`user was alerted to a status change via sms: ${message}`);
        } else {
            console.log('There was problem sending sms to one of the user');
        }
    });
};

// timer to execute the worker process once per min
worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 1000 * 60);
};
// start the workers
worker.init = () => {
    // execute all the checks
    worker.gatherAllChecks();
    // looping
    worker.loop();
};

module.exports = worker;
