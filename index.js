/*
 * Title: Uptime Monitoring Application
 * Description: A RESrFul API to monitor up or down time of user defined links
 * Author: Mohi Uddin Mahim
 * Date: 03-07-22
 */
// dependencies
const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');
const environment = require('./helpers/environments');
// const data = require('./lib/data');

// app object - module scaffolding
const app = {};

// create server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(environment.port, () => {
        console.log(`env var is ${process.env.NODE_ENV}`);
        console.log(`listening to port ${environment.port}`);
    });
};

// handle Request and Response
app.handleReqRes = handleReqRes;

// start the server
app.createServer();
