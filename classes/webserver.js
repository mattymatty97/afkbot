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
                res.write(fs.readFileSync('webfiles/index.html'));
                res.end();
            } else if (req.url === "/index.css") {
                res.writeHead(200, {'Content-type': 'text/css'});
                res.write(fs.readFileSync('webfiles/index.css'));
                res.end();
            } else if (req.url === "/script.js") {
                res.writeHead(200, {'Content-type': 'text/javascript'});
                res.write(fs.readFileSync('webfiles/script.js'));
                res.end();
            } else if (req.url === "/utils.js") {
                res.writeHead(200, {'Content-type': 'text/javascript'});
                res.write(fs.readFileSync('webfiles/utils.js'));
                res.end();
            } else if (module.exports.password === "" || req.headers.xpassword === module.exports.password) {
                if (req.url === "/update") {
                    if (req.headers.hasOwnProperty("xtarget"))
                        switch (req.headers.XTarget) {
                            case "tablist": {
                                res.writeHead(200, {'Content-type': 'text/json'});
                                res.write(JSON.stringify({
                                    tablist: module.exports.session.tablist
                                }))
                            }
                                break;
                            case "scoreboard": {
                                res.writeHead(200, {'Content-type': 'text/json'});
                                res.write(JSON.stringify({
                                    scoreboard: module.exports.session.scoreboard
                                }))
                            }
                                break;
                            case "chat": {
                                res.writeHead(200, {'Content-type': 'text/json'});
                                res.write(JSON.stringify({
                                    chat: module.exports.session.chat.toarray()
                                }))
                            }
                                break;
                            case "log": {
                                res.writeHead(200, {'Content-type': 'text/json'});
                                res.write(JSON.stringify({
                                    log: module.exports.session.log.toarray()
                                }))
                            }
                                break;
                            case "console": {
                                res.writeHead(200, {'Content-type': 'text/json'});
                                res.write(JSON.stringify({
                                    console: module.exports.session.console.toarray()
                                }))
                            }
                                break;
                            case "username": {
                                res.writeHead(200, {'Content-type': 'text/json'});
                                res.write(JSON.stringify({
                                    username: module.exports.session.username
                                }))
                            }
                                break;
                            case "connected": {
                                res.writeHead(200, {'Content-type': 'text/json'});
                                res.write(JSON.stringify({
                                    connected: module.exports.session.connected
                                }))
                            }
                                break;
                            case "restart": {
                                res.writeHead(200, {'Content-type': 'text/json'});
                                res.write(JSON.stringify({
                                    restart: module.exports.session.restart
                                }))
                            }
                                break;
                            case "options": {
                                res.writeHead(200, {'Content-type': 'text/json'});
                                res.write(JSON.stringify({
                                    options: module.exports.session.options
                                }))
                            }
                                break;
                            default:
                                res.writeHead(404);
                        } else {
                        res.writeHead(200, {'Content-type': 'text/json'});
                        res.write(JSON.stringify({
                                tablist: module.exports.session.tablist,
                                scoreboard: module.exports.session.scoreboard,
                                chat: module.exports.session.chat.toarray(),
                                log: module.exports.session.log.toarray(),
                                console: module.exports.session.console.toarray(),
                                username: module.exports.session.username,
                                connected: module.exports.session.connected,
                                restart: module.exports.session.restart,
                                options: module.exports.session.options
                            })
                        )
                    }
                    res.end();
                } else if (req.url === "/start") { //API endpoint to start queuing
                    res.writeHead(200);
                    res.end();
                    module.exports.session.start();
                } else if (req.url === "/stop") { //API endpoint to stop queuing
                    res.writeHead(200);
                    res.end();
                    module.exports.session.stop();
                } else if (req.url === "/restart") {
                    if(req.headers.hasOwnProperty("xrestart")) {
                        res.writeHead(200);
                        module.exports.session.restart = (req.headers.xrestart === 'true')
                        res.end();
                    }else{
                        res.writeHead(400);
                        res.end()
                    }
                } else if (req.url === "/options") {
                    if(req.headers.hasOwnProperty("xoptions")) {
                        res.writeHead(200);
                        module.exports.session.options = JSON.parse(req.headers.xoptions)
                        res.end();
                    }else{
                        res.writeHead(400);
                        res.end()
                    }
                } else if (req.url === "/send") {
                    if (req.headers.hasOwnProperty("xchat") && req.headers.hasOwnProperty("xtext")) {
                        if (req.headers.xchat === 'true') {
                            module.exports.session.sendChat(req.headers.xtext)
                        } else {
                            module.exports.session.execConsole(req.headers.xtext)
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
    session: null,
    password: "" //the password to use for the webapp
};

