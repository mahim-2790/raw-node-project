/*
 * Title: Routes
 * Description: application routes
 * Author: Mohi Uddin Mahim
 * Date: 03-07-22
 */

// dependencies
const { sampleHandler } = require('./handlers/routeHandlers/sampleHandler');
const { userHandler } = require('./handlers/routeHandlers/userHandler');

const routes = {
    sample: sampleHandler,
    user: userHandler,
};

module.exports = routes;
