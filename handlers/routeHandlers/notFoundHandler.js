/*
 * Title: not found handler
 * Description: 404 not found handler
 * Author: Mohi Uddin Mahim
 * Date: 03-07-22
 */

// module scaffolding
const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
    callback(404, {
        message: 'Your requested url was not found',
    });
};

module.exports = handler;
