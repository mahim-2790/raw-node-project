/*
 * Title: Check Handler
 * Description: user routes to handle check related routes
 * Author: Mohi Uddin Mahim
 * Date: 20-07-22
 */

// dependencies
const data = require('../../lib/data');
const { hash, parseJSON, createRandomString } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
const { maxChecks } = require('../../helpers/environments');

// module scaffold
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._check[requestProperties.method](requestProperties, callback);
    } else {
        callback(405, {
            message: "You don't have access",
        });
    }
};

handler._check = {};

handler._check.post = (requestProperties, callback) => {
    // validate inputs
    const protocol =
        typeof requestProperties.body.protocol === 'string' &&
        ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
            ? requestProperties.body.protocol
            : false;

    const url =
        typeof requestProperties.body.url === 'string' &&
        requestProperties.body.url.trim().length > 0
            ? requestProperties.body.url
            : false;

    const method =
        typeof requestProperties.body.method === 'string' &&
        ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
            ? requestProperties.body.method
            : false;

    const successCodes =
        typeof requestProperties.body.successCodes === 'object' &&
        requestProperties.body.successCodes instanceof Array
            ? requestProperties.body.successCodes
            : false;

    const timeoutSeconds =
        typeof requestProperties.body.timeoutSeconds === 'number' &&
        requestProperties.body.timeoutSeconds % 1 === 0 &&
        requestProperties.body.timeoutSeconds >= 1 &&
        requestProperties.body.timeoutSeconds <= 5
            ? requestProperties.body.timeoutSeconds
            : false;

    if (protocol && url && method && successCodes && timeoutSeconds) {
        const token =
            typeof requestProperties.headersObject.token === 'string'
                ? requestProperties.headersObject.token
                : false;

        // loo0k up the user phone number
        data.read('tokens', token, (err1, tokenData) => {
            if (!err1 && tokenData) {
                const userPhone = parseJSON(tokenData).phone;
                data.read('users', userPhone, (err2, userData) => {
                    if (!err2 && userData) {
                        tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                const userObj = parseJSON(userData);
                                const userChecks =
                                    typeof userObj.checks === 'object' &&
                                    userObj.checks instanceof Array
                                        ? userObj.checks
                                        : [];
                                if (userChecks.length < maxChecks) {
                                    const checkId = createRandomString(20);
                                    const checkObj = {
                                        id: checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds,
                                    };
                                    data.create('checks', checkId, checkObj, (err3) => {
                                        if (!err3) {
                                            userObj.checks = userChecks;
                                            userObj.checks.push(checkId);

                                            data.update('users', userPhone, userObj, (err4) => {
                                                if (!err4) {
                                                    callback(200, checkObj);
                                                } else {
                                                    callback(500, {
                                                        error: 'Server time out',
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                error: 'Server time out',
                                            });
                                        }
                                    });
                                } else {
                                    callback(401, {
                                        error: 'Reached max check limit',
                                    });
                                }
                            } else {
                                callback(403, {
                                    error: 'authentication failed',
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            error: 'User not found',
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Unauthorized ',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};

handler._check.get = (requestProperties, callback) => {};

handler._check.put = (requestProperties, callback) => {};

handler._check.delete = (requestProperties, callback) => {};

module.exports = handler;
