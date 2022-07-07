/*
 * Title: Token handler
 * Description: handle token related routes
 * Author: Mohi Uddin Mahim
 * Date: 06-07-22
 */

// dependencies
const data = require('../../lib/data');
const { hash, createRandomString, parseJSON } = require('../../helpers/utilities');

// module scaffold
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._token[requestProperties.method](requestProperties, callback);
    } else {
        callback(405, {
            message: "You don't have access",
        });
    }
};

handler._token = {};

handler._token.post = (requestProperties, callback) => {
    // validation
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

    // compare
    if (phone && password) {
        data.read('users', phone, (err, userData) => {
            if (!err && userData) {
                const hashedPassword = hash(password);
                if (hashedPassword === parseJSON(userData).password) {
                    const tokenId = createRandomString(20);
                    const expires = Date.now() + 60 * 60 * 1000;
                    const tokenObject = {
                        phone,
                        id: tokenId,
                        expires,
                    };

                    // store token
                    data.create('tokens', tokenId, tokenObject, (err2) => {
                        if (!err2) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, {
                                error: 'There was an error in server.',
                            });
                        }
                    });
                } else {
                    callback(400, {
                        error: 'Password is not valid',
                    });
                }
            } else {
                callback(400, {
                    error: 'User not found',
                });
            }
        });
    } else {
        callback(400, {
            error: 'Problem in request',
        });
    }
};

handler._token.get = (requestProperties, callback) => {
    // check the id number is valid
    const id =
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;
    if (id) {
        // look up the user
        data.read('tokens', id, (err, tokenData) => {
            const token = { ...parseJSON(tokenData) };
            if (!err && token) {
                delete token.password;
                callback(200, token);
            } else {
                callback(404, {
                    message: 'Requested token not found.',
                });
            }
        });
    } else {
        callback(404, {
            message: 'User not found.',
        });
    }
};

handler._token.put = (requestProperties, callback) => {
    // id validation
    const id =
        typeof requestProperties.body.id === 'string' &&
        requestProperties.body.id.trim().length === 20
            ? requestProperties.body.id
            : false;

    const extend = !!(
        typeof requestProperties.body.extend === 'boolean' && requestProperties.body.extend === true
    );

    if (id && extend) {
        data.read('tokens', id, (err, tokenData) => {
            console.log({ tokenData }, { err });
            if (!err && tokenData) {
                const tokenObject = parseJSON(tokenData);
                if (tokenObject.expires > Date.now()) {
                    tokenObject.expires = Date.now() + 60 * 60 * 1000;
                    // store token
                    data.update('tokens', id, tokenObject, (err2) => {
                        if (!err2) {
                            callback(200, {
                                message: 'Token updated',
                            });
                        } else {
                            callback(500, {
                                error: 'Server side error',
                            });
                        }
                    });
                } else {
                    callback(400, {
                        error: 'token already expired',
                    });
                }
            } else {
                callback(400, {
                    error: 'Bad request',
                });
            }
        });
    } else {
        callback(400, {
            error: 'Bad request',
        });
    }
};

handler._token.delete = (requestProperties, callback) => {
    // check the id is valid
    const id =
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;

    if (id) {
        data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                data.delete('tokens', id, (err1) => {
                    if (!err1) {
                        callback(200, {
                            message: 'user was successfully logged out',
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
        callback(400, { error: 'There is a problem with req' });
    }
};

module.exports = handler;
