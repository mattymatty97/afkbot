//this module exposes functions and variables to control the HTTP server.
const http = require('http'); //to serve the pages
const fs = require('fs'); //to read the webpages from disk
const CircularBuffer = require('circular-buffer');

function bufferToString(buffer) {
    let text = ""
    buffer.toarray().forEach((msg) => {
        text = text.concat("<tr><td>").concat(msg).concat("</td></tr>")
    })
    return text
}

module.exports = {
    createServer: (port) => {
        http.createServer((req, res) => {
            if (req.url === "/") {
                res.writeHead(200, {'Content-type': 'text/html'});
                res.write(fs.readFileSync('index.html'));
                res.end();
            } else if (req.url === "/index.css") {
                res.writeHead(200, {'Content-type': 'text/css'});
                res.write(fs.readFileSync('index.css'));
                res.end();
            } else if (req.url === "/script.js") {
                res.writeHead(200, {'Content-type': 'text/javascript'});
                res.write(fs.readFileSync('script.js'));
                res.end();
            } else if (req.url === "/utils.js") {
                res.writeHead(200, {'Content-type': 'text/javascript'});
                res.write(fs.readFileSync('utils.js'));
                res.end();
            } else if (module.exports.password === "" || req.headers.xpassword === module.exports.password) {
                if (req.url === "/update") {
                    if (req.headers.hasOwnProperty("XTarget"))
                        switch (req.headers.XTarget) {
                            case "tablist": {
                                res.writeHead(200, {'Content-type': 'text/json'});
                                res.write(JSON.stringify({
                                    tablist: module.exports.tablist
                                }))
                            }
                                break;
                            case "scoreboard": {
                                res.writeHead(200, {'Content-type': 'text/json'});
                                res.write(JSON.stringify({
                                    scoreboard: module.exports.scoreboard
                                }))
                            }
                                break;
                            case "chat": {
                                res.writeHead(200, {'Content-type': 'text/json'});
                                res.write(JSON.stringify({
                                    chat: module.exports.chat.toarray()
                                }))
                            }
                                break;
                            case "log": {
                                res.writeHead(200, {'Content-type': 'text/json'});
                                res.write(JSON.stringify({
                                    log: module.exports.log.toarray()
                                }))
                            }
                                break;
                            case "console": {
                                res.writeHead(200, {'Content-type': 'text/json'});
                                res.write(JSON.stringify({
                                    console: module.exports.console.toarray()
                                }))
                            }
                                break;
                            case "username": {
                                res.writeHead(200, {'Content-type': 'text/json'});
                                res.write(JSON.stringify({
                                    username: module.exports.username
                                }))
                            }
                                break;
                            case "connected": {
                                res.writeHead(200, {'Content-type': 'text/json'});
                                res.write(JSON.stringify({
                                    connected: module.exports.isConnected
                                }))
                            }
                                break;
                            case "restart": {
                                res.writeHead(200, {'Content-type': 'text/json'});
                                res.write(JSON.stringify({
                                    restart: module.exports.restart
                                }))
                            }
                                break;
                            default:
                                res.writeHead(404);
                        } else {
                        res.writeHead(200, {'Content-type': 'text/json'});
                        res.write(JSON.stringify({
                                tablist: module.exports.tablist,
                                scoreboard: module.exports.scoreboard,
                                chat: module.exports.chat.toarray(),
                                log: module.exports.log.toarray(),
                                console: module.exports.console.toarray(),
                                username: module.exports.username,
                                connected: module.exports.isConnected,
                                restart: module.exports.restart
                            })
                        )
                    }
                    res.end();
                } else if (req.url === "/start") { //API endpoint to start queuing
                    res.writeHead(200);
                    res.end();
                    module.exports.onstartcallback();
                } else if (req.url === "/stop") { //API endpoint to stop queuing
                    res.writeHead(200);
                    res.end();
                    module.exports.onstopcallback();
                } else if (req.url === "/restart") {
                    if(req.headers.hasOwnProperty("XRestart")) {
                        res.writeHead(200);
                        module.exports.restart = req.headers.XRestart
                        res.end();
                    }else{
                        res.writeHead(400);
                        res.end()
                    }
                } else if (req.url === "/send") {
                    if (req.headers.hasOwnProperty("xchat") && req.headers.hasOwnProperty("xtext")) {
                        if (req.headers.xchat) {
                            module.exports.onchatcallback(req.headers.xtext)
                        } else {
                            module.exports.onconsolecallback(req.headers.xtext)
                        }
                        res.writeHead(200);
                    }else {
                        res.writeHead(400)
                    }
                    res.end();
                } else {
                    res.writeHead(404);
                    res.end();
                }
            } else {
                res.writeHead(403);
                res.end()
            }
        }).listen(port);
    },
    onstart: (callback) => { //function to set the action to do when starting
        module.exports.onstartcallback = callback;
    },
    onstop: (callback) => { //same but to stop
        module.exports.onstopcallback = callback;
    },
    onchat: (callback) => { //function to set the action to do when starting
        module.exports.onchatcallback = callback;
    },
    onconsole: (callback) => { //same but to stop
        module.exports.onconsolecallback = callback;
    },
    isConnected: false, //are we connected
    restart: false, //when at the end of the queue, restart if no client is connected?
    tablist: {},
    scoreboard: {},
    username: "NOT CONNECTED",
    chat: new CircularBuffer(70),
    log: new CircularBuffer(100),
    console: new CircularBuffer(200),
    onstartcallback: null, //a save of the action to start
    onstopcallback: null, //same but to stop
    onchatcallback: null,
    onconsolecallback: null,
    password: "" //the password to use for the webapp
};

