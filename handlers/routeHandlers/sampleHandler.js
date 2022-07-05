/*
 * Title: sample handler
 * Description: sample handler
 * Author: Mohi Uddin Mahim
 * Date: 03-07-22
 */

// module scaffolding
const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
    callback(200, {
        message: 'this is a sample url',
    });
};

module.exports = handler;
