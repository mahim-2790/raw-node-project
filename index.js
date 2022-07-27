/*
 * Title: Uptime Monitoring Application initial app
 * Description: initializing the project
 * Author: Mohi Uddin Mahim
 * Date: 03-07-22
 */
// dependencies
const server = require('./lib/server');
const worker = require('./lib/workers');

// app object - module scaffolding
const app = {};

app.init = () => {
    // starting the server
    server.init();

    // starting the workers
    worker.init();
};

// create server
// app.createServer = () => {
//     const server = http.createServer(app.handleReqRes);
//     server.listen(environment.port, () => {
//         console.log(`env var is ${process.env.NODE_ENV}`);
//         console.log(`listening to port ${environment.port}`);
//     });
// };

// // handle Request and Response
// app.handleReqRes = handleReqRes;

// start the server
app.init();

module.exports = app;
