/*
 * Title: handle request response
 * Description: handle request response
 * Author: Mohi Uddin Mahim
 * Date: 03-07-22
 */
// dependencies
const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../routes');
const { notFoundHandler } = require('../handlers/routeHandlers/notFoundHandler');
const { parseJSON } = require('./utilities');

// module scaffold
const handler = {};

// handle request response
handler.handleReqRes = (req, res) => {
    // request handling
    // get the url and parse it
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const queryStringObject = parsedUrl.query;
    const headersObject = req.headers;

    const requestProperties = {
        parsedUrl,
        path,
        trimmedPath,
        method,
        queryStringObject,
        headersObject,
    };

    const decoder = new StringDecoder('utf-8');
    let realData = '';

    const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;
    req.on('data', (buffer) => {
        realData += decoder.write(buffer);
    });

    req.on('end', () => {
        realData += decoder.end();
        requestProperties.body = parseJSON(realData);

        chosenHandler(requestProperties, (statusCode, payLoad) => {
            const gottenStatus = typeof statusCode === 'number' ? statusCode : 500;
            const gottenPayLoad = typeof payLoad === 'object' ? payLoad : {};

            const payLoadString = JSON.stringify(gottenPayLoad);

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(gottenStatus);
            res.end(payLoadString);
        });

        // response handle
        // res.end('hello programmers');
    });
};

module.exports = handler;
