//this module exposes functions and variables to control the HTTP server.
const http = require('http'); //to serve the pages
const fs = require('fs'); //to read the webpages from disk
const CircularBuffer = require('circular-buffer');

function bufferToString(buffer) {
    let text = ""
    buffer.toarray().forEach((msg)=>{
        text = text.concat("<tr><td>").concat(msg).concat("</td></tr>")
    })
    return text
}

module.exports = {
    createServer : (port) => {
        http.createServer((req, res) => {
            if (req.url === "/") { //main page of the web app
                res.writeHead(200, {'Content-type': 'text/html'});
                res.write(fs.readFileSync('index.html'));
                res.end();
            } else if(req.url === "/index.css") { //css file to make it not look like too much shit
                res.writeHead(200, {'Content-type': 'text/css'});
                res.write(fs.readFileSync('index.css'));
                res.end();
            } else if (module.exports.password == "" || req.headers.xpassword == module.exports.password) { //before doing any action, test if the provided password is correct.
                if(req.url === "/update") { //API endpoint to get position, ETA, and status in JSON format      
                    res.writeHead(200, {'Content-type': 'text/json'});
                    let chattext = bufferToString(module.exports.chat);
                    let logtext = bufferToString(module.exports.log);
                    let consoletext = bufferToString(module.exports.console);
                    res.write(
                        "{" +
                        " \"username\": \""+ module.exports.username +"\"," +
                        " \"connected\": " + module.exports.isConnected+"," +
                        " \"restart\": "+ module.exports.restart + "," +
                        " \"tablist\": \"" + module.exports.tablist + "\"," +
                        " \"scoreboard\": \"" + module.exports.scoreboard + "\"," +
                        " \"chat\": \""+ chattext +"\"," +
                        " \"log\": \""+ logtext +"\"," +
                        " \"console\": \""+ consoletext +"\"" +
                        "}"
                    )
                    res.end();
                } else if(req.url === "/start") { //API endpoint to start queuing
                    res.writeHead(200);
                    res.end();
                    module.exports.onstartcallback();
                } else if(req.url === "/stop") { //API endpoint to stop queuing
                    res.writeHead(200);
                    res.end();
                    module.exports.onstopcallback();
                } else if(req.url === "/togglerestart"){
                    res.writeHead(200);
                    res.end();
                    module.exports.restart = !module.exports.restart
                } else if(req.url === "/send"){
                    if(req.headers.xchat){
                        module.exports.onchatcallback(req.headers.xtext)
                    }else{
                        module.exports.onconsolecallback(req.headers.xtext)
                    }
                    res.writeHead(200);
                    res.end();
                } else {
                    res.writeHead(404);
                    res.end();
                }
            }else{
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
    tablist: "<tr><td><a>Nothing to show</a></td></tr>",
    scoreboard: "<tr><td><a>Nothing to show</a></td></tr>",
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

