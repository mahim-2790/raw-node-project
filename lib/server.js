/*
 * Title: server lib
 * Description: server related file
 * Author: Mohi Uddin Mahim
 * Date: 03-07-22
 */
// dependencies
const http = require('http');
const { handleReqRes } = require('../helpers/handleReqRes');
const environment = require('../helpers/environments');

// app object - module scaffolding
const server = {};

// create server
server.createServer = () => {
    const createServerVariable = http.createServer(server.handleReqRes);
    createServerVariable.listen(environment.port, () => {
        console.log(`env var is ${process.env.NODE_ENV}`);
        console.log(`listening to port ${environment.port}`);
    });
};

// handle Request and Response
server.handleReqRes = handleReqRes;

// start the server
server.init = () => {
    server.createServer();
};

module.exports = server;
