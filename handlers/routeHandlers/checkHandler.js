/*
 * Title: Check Handler
 * Description: user routes to handle check related routes
 * Author: Mohi Uddin Mahim
 * Date: 20-07-22
 */

// dependencies
const data = require('../../lib/data');
const { hash, parseJSON } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');

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
    const firstName =
        typeof requestProperties.body.firstName === 'string' &&
        requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName
            : false;

    const lastName =
        typeof requestProperties.body.lastName === 'string' &&
        requestProperties.body.lastName.trim().length > 0
            ? requestProperties.body.lastName
            : false;

    const phone =
        typeof requestProperties.body.phone === 'string' &&
        requestProperties.body.phone.trim().length === 11
            ? requestProperties.body.phone
            : false;

    const password =
        typeof requestProperties.body.password === 'string' &&
        requestProperties.body.password.trim().length > 0
            ? requestProperties.body.password
            : false;

    const tosAgreement =
        typeof requestProperties.body.tosAgreement === 'boolean' &&
        requestProperties.body.tosAgreement
            ? requestProperties.body.tosAgreement
            : false;

    if (firstName && lastName && password && phone && tosAgreement) {
        // make sure that user dose not exist
        data.read('users', phone, (err) => {
            if (err) {
                const userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement,
                };

                // store the user
                data.create('users', phone, userObject, (err1) => {
                    const user = { ...userObject };
                    delete user.password;
                    if (!err1) {
                        callback(200, {
                            message: 'user was created successfully',
                            user,
                        });
                    } else {
                        callback(500, { error: 'could not create user!' });
                    }
                });
            } else {
                callback(500, {
                    error: 'User already exist.',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};

handler._check.get = (requestProperties, callback) => {
    // check the phone number is valid
    const phone =
        typeof requestProperties.queryStringObject.phone === 'string' &&
        requestProperties.queryStringObject.phone.trim().length === 11
            ? requestProperties.queryStringObject.phone
            : false;
    if (phone) {
        // verify token
        const token =
            typeof requestProperties.headersObject.token === 'string'
                ? requestProperties.headersObject.token
                : false;

        tokenHandler._token.verify(token, phone, (tokenId) => {
            // token id is the status of token in bool
            if (tokenId) {
                // look up the user
                data.read('users', phone, (err, u) => {
                    const user = { ...parseJSON(u) };
                    if (!err && user) {
                        delete user.password;
                        callback(200, user);
                    } else {
                        callback(404, {
                            message: 'User not found.',
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Authentication failed',
                });
            }
        });
    } else {
        callback(404, {
            message: 'User not found.',
        });
    }
};

handler._check.put = (requestProperties, callback) => {
    const firstName =
        typeof requestProperties.body.firstName === 'string' &&
        requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName
            : false;

    const lastName =
        typeof requestProperties.body.lastName === 'string' &&
        requestProperties.body.lastName.trim().length > 0
            ? requestProperties.body.lastName
            : false;

    const phone =
        typeof requestProperties.body.phone === 'string' &&
        requestProperties.body.phone.trim().length === 11
            ? requestProperties.body.phone
            : false;

    const password =
        typeof requestProperties.body.password === 'string' &&
        requestProperties.body.password.trim().length > 0
            ? requestProperties.body.password
            : false;

    if (phone) {
        // verify token
        const token =
            typeof requestProperties.headersObject.token === 'string'
                ? requestProperties.headersObject.token
                : false;

        tokenHandler._token.verify(token, phone, (tokenId) => {
            // token id is the status of token in bool
            if (tokenId) {
                if (firstName || lastName || password) {
                    data.read('users', phone, (err, uData) => {
                        const userData = { ...parseJSON(uData) };

                        if (!err && userData) {
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            if (password) {
                                userData.password = hash(password);
                            }
                            // store in data base
                            data.update('users', phone, userData, (err2) => {
                                const user = { ...userData };
                                delete user.password;
                                if (!err2) {
                                    callback(200, {
                                        message: 'user was updated successfully',
                                        user,
                                    });
                                }
                            });
                        } else {
                            callback(400, {
                                error: 'You have a problem in your request',
                            });
                        }
                    });
                } else {
                    callback(400, {
                        error: 'You have a problem in your request',
                    });
                }
            } else {
                callback(403, {
                    error: 'Authentication failed',
                });
            }
        });
    } else {
        callback(400, {
            error: 'Invalid phone number',
        });
    }
};

handler._check.delete = (requestProperties, callback) => {
    // check the phone number is valid
    const phone =
        typeof requestProperties.queryStringObject.phone === 'string' &&
        requestProperties.queryStringObject.phone.trim().length === 11
            ? requestProperties.queryStringObject.phone
            : false;

    if (phone) {
        // verify token
        const token =
            typeof requestProperties.headersObject.token === 'string'
                ? requestProperties.headersObject.token
                : false;

        tokenHandler._token.verify(token, phone, (tokenId) => {
            // token id is the status of token in bool
            if (tokenId) {
                data.read('users', phone, (err, userData) => {
                    if (!err && userData) {
                        data.delete('users', phone, (err1) => {
                            if (!err1) {
                                callback(200, {
                                    message: 'user was successfully deleted',
                                });
                            } else {
                                callback(500, {
                                    error: 'Internal server error',
                                });
                            }
                        });
                    } else {
                        callback(404, {
                            error: 'user not found',
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Authentication failed',
                });
            }
        });
    } else {
        callback(400, { error: 'There is a problem with req' });
    }
};

module.exports = handler;
