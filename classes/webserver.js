//this module exposes functions and variables to control the HTTP server.
const http = require('http'); //to serve the pages
const fs = require('fs'); //to read the webpages from disk

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
            }else if (req.url === "/instance") {
                res.writeHead(200, {'Content-type': 'text/html'});
                res.write(fs.readFileSync('webfiles/instance/index.html'));
                res.end();
            } else if (req.url === "/instance/index.css") {
                res.writeHead(200, {'Content-type': 'text/css'});
                res.write(fs.readFileSync('webfiles/instance/index.css'));
                res.end();
            } else if (req.url === "/instance/script.js") {
                res.writeHead(200, {'Content-type': 'text/javascript'});
                res.write(fs.readFileSync('webfiles/instance/script.js'));
                res.end();
            } else if (req.url === "/instance/utils.js") {
                res.writeHead(200, {'Content-type': 'text/javascript'});
                res.write(fs.readFileSync('webfiles/instance/utils.js'));
                res.end();
            } else if (req.url === "/login"){
                if (req.headers.hasOwnProperty("xuser") && req.headers.hasOwnProperty("xpassword")){
                    let instance = getInstance(req.headers.xuser,req.headers.xpassword)
                    if(instance !== undefined){
                        res.writeHead(200)
                    }else{
                        res.writeHead(401)
                    }
                }else{
                    res.writeHead(401)
                }
                res.end();
            }else if (req.headers.hasOwnProperty("xuser") && req.headers.hasOwnProperty("xpassword")){
                let instance = getInstance(req.headers.xuser,req.headers.xpassword)
                if (instance !== undefined) {
                    if (req.url === "/update") {
                        if (req.headers.hasOwnProperty("xtarget"))
                            switch (req.headers.XTarget) {
                                case "tablist": {
                                    res.writeHead(200, {'Content-type': 'text/json'});
                                    res.write(JSON.stringify({
                                        tablist: instance.sessions[0].tablist
                                    }))
                                }
                                    break;
                                case "scoreboard": {
                                    res.writeHead(200, {'Content-type': 'text/json'});
                                    res.write(JSON.stringify({
                                        scoreboard: instance.sessions[0].scoreboard
                                    }))
                                }
                                    break;
                                case "chat": {
                                    res.writeHead(200, {'Content-type': 'text/json'});
                                    res.write(JSON.stringify({
                                        chat: instance.sessions[0].chat.toarray()
                                    }))
                                }
                                    break;
                                case "log": {
                                    res.writeHead(200, {'Content-type': 'text/json'});
                                    res.write(JSON.stringify({
                                        log: instance.sessions[0].log.toarray()
                                    }))
                                }
                                    break;
                                case "console": {
                                    res.writeHead(200, {'Content-type': 'text/json'});
                                    res.write(JSON.stringify({
                                        console: instance.sessions[0].console.toarray()
                                    }))
                                }
                                    break;
                                case "username": {
                                    res.writeHead(200, {'Content-type': 'text/json'});
                                    res.write(JSON.stringify({
                                        username: instance.sessions[0].username
                                    }))
                                }
                                    break;
                                case "connected": {
                                    res.writeHead(200, {'Content-type': 'text/json'});
                                    res.write(JSON.stringify({
                                        connected: instance.sessions[0].connected
                                    }))
                                }
                                    break;
                                case "restart": {
                                    res.writeHead(200, {'Content-type': 'text/json'});
                                    res.write(JSON.stringify({
                                        restart: instance.sessions[0].restart
                                    }))
                                }
                                    break;
                                case "options": {
                                    res.writeHead(200, {'Content-type': 'text/json'});
                                    res.write(JSON.stringify({
                                        options: instance.sessions[0].options
                                    }))
                                }
                                    break;
                                default:
                                    res.writeHead(404);
                            } else {
                            res.writeHead(200, {'Content-type': 'text/json'});
                            res.write(JSON.stringify({
                                    tablist: instance.sessions[0].tablist,
                                    scoreboard: instance.sessions[0].scoreboard,
                                    chat: instance.sessions[0].chat.toarray(),
                                    log: instance.sessions[0].log.toarray(),
                                    console: instance.sessions[0].console.toarray(),
                                    username: instance.sessions[0].username,
                                    connected: instance.sessions[0].connected,
                                    restart: instance.sessions[0].restart,
                                    options: instance.sessions[0].options
                                })
                            )
                        }
                        res.end();
                    } else if (req.url === "/start") { //API endpoint to start queuing
                        res.writeHead(200);
                        res.end();
                        instance.sessions[0].start();
                    } else if (req.url === "/stop") { //API endpoint to stop queuing
                        res.writeHead(200);
                        res.end();
                        instance.sessions[0].stop();
                    } else if (req.url === "/restart") {
                        if (req.headers.hasOwnProperty("xrestart")) {
                            res.writeHead(200);
                            instance.sessions[0].restart = (req.headers.xrestart === 'true')
                            res.end();
                        } else {
                            res.writeHead(400);
                            res.end()
                        }
                    } else if (req.url === "/options") {
                        if (req.headers.hasOwnProperty("xoptions")) {
                            res.writeHead(200);
                            instance.sessions[0].options = JSON.parse(req.headers.xoptions)
                            res.end();
                        } else {
                            res.writeHead(400);
                            res.end()
                        }
                    } else if (req.url === "/send") {
                        if (req.headers.hasOwnProperty("xchat") && req.headers.hasOwnProperty("xtext")) {
                            if (req.headers.xchat === 'true') {
                                instance.sessions[0].sendChat(req.headers.xtext)
                            } else {
                                instance.sessions[0].execConsole(req.headers.xtext)
                            }
                            res.writeHead(200);
                        } else {
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
            }
        }).listen(port);
    },
    instances: {}
};

function getInstance(user,password) {
    let instance = module.exports.instances[user]
    if(instance !== undefined && instance.getPassword() === password){
        return instance
    }else
        return undefined
}
