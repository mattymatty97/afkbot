//this module exposes functions and variables to control the HTTP server.
const express = require('express')
const https = require('https');
const http = require('http');
const fs = require('fs');

module.exports = {
    createServer: (port) => {
        let app = express()

        app.use(express.static('public'))

        app.get('/login',function (req,res) {
                let instance = getInstance(req.headers.xuser,req.headers.xpassword)
                if(instance !== undefined){
                    res.writeHead(200)
                }else{
                    res.writeHead(401)
                }
                res.end();
        })
        app.get('/start',function (req,res) {
                let instance = getInstance(req.headers.xuser,req.headers.xpassword)
                if(instance !== undefined){
                    res.writeHead(200)
                    instance.sessions[0].start();
                }else{
                    res.writeHead(401)
                }
                res.end();
        })
        app.get('/stop',function (req,res) {
                let instance = getInstance(req.headers.xuser,req.headers.xpassword)
                if(instance !== undefined){
                    res.writeHead(200)
                    instance.sessions[0].stop();
                }else{
                    res.writeHead(401)
                }
                res.end();
        })
        app.get('/restart',function (req,res) {
                let instance = getInstance(req.headers.xuser,req.headers.xpassword)
                if(instance !== undefined){
                    if(req.headers.hasOwnProperty('xrestart')) {
                        res.writeHead(200)
                        instance.sessions[0].restart = (req.headers.xrestart === 'true')
                    }else
                        res.writeHead(400)
                }else{
                    res.writeHead(401)
                }
                res.end();
        })
        app.get('/disconnect',function (req,res) {
                let instance = getInstance(req.headers.xuser,req.headers.xpassword)
                if(instance !== undefined){
                    if(req.headers.hasOwnProperty('xdisconnect')) {
                        res.writeHead(200)
                        instance.sessions[0].disconnect = (req.headers.xdisconnect === 'true')
                    }else
                        res.writeHead(400)
                }else{
                    res.writeHead(401)
                }
                res.end();
        })
        app.get('/option',function (req,res) {
                let instance = getInstance(req.headers.xuser,req.headers.xpassword)
                if(instance !== undefined){
                    if(req.headers.hasOwnProperty('xoption')) {
                        let option = JSON.parse(req.headers.xoption)
                        res.writeHead(200)
                        set(instance.sessions[0].options,option.path,option.value)
                    }else
                        res.writeHead(400)
                }else{
                    res.writeHead(401)
                }
                res.end();
        })
        app.get('/send', function (req,res) {
                let instance = getInstance(req.headers.xuser,req.headers.xpassword)
                if(instance !== undefined){
                    if(req.headers.hasOwnProperty("xchat") && req.headers.hasOwnProperty("xtext")) {
                        if (req.headers.xchat === 'true') {
                            instance.sessions[0].sendChat(req.headers.xtext)
                        } else {
                            instance.sessions[0].execConsole(req.headers.xtext)
                        }
                        res.writeHead(200)
                    }else
                        res.writeHead(400)
                }else{
                    res.writeHead(401)
                }
                res.end();
        })

        app.get('/update',function (req,res) {
                let instance = getInstance(req.headers.xuser,req.headers.xpassword)
                if(instance !== undefined){
                    let update = getUpdate(instance)
                    if (req.headers.hasOwnProperty("xtarget")){
                        if(update.hasOwnProperty(req.headers.xtarget)) {
                            res.writeHead(200, {'Content-type': 'text/json'});
                            let out = {}
                            out[req.headers.xtarget] = update[req.headers.xtarget]
                            res.write(JSON.stringify(out))
                        }
                        else
                            res.writeHead(400)
                    }else{
                        res.writeHead(200, {'Content-type': 'text/json'});
                        res.write(JSON.stringify(update))
                    }
                }else{
                    res.writeHead(401)
                }
                res.end();
        })



        let webserver;

        try {
            let privateKey = fs.readFileSync('configs/privkey.pem');
            let certificate = fs.readFileSync('configs/cert.pem');
            let options = {key: privateKey, cert: certificate};

            webserver = https.createServer(options, app);
        }catch (err){
            console.log(err);
            webserver = http.createServer(app);
        }finally {
            webserver.listen(port)
        }

    },
    instances: {}
};

function getInstance(user,password) {
    if(user !== undefined && password !== undefined) {
        let instance = module.exports.instances[user]
        if (instance !== undefined && instance.getPassword() === password) {
            return instance
        }
    }
    return undefined
}

function getUpdate(instance) {
    return {
        tablist: instance.sessions[0].tablist,
        scoreboard: instance.sessions[0].scoreboard,
        chat: instance.sessions[0].chat.toarray(),
        log: instance.sessions[0].log.toarray(),
        console: instance.sessions[0].console.toarray(),
        username: { value: instance.sessions[0].username },
        connected: { value: instance.sessions[0].connected },
        restart: { value: instance.sessions[0].restart },
        disconnect: { value: instance.sessions[0].disconnect },
        options: instance.sessions[0].options
    }
}

function set(obj, path, value) {
    var schema = obj;  // a moving reference to internal objects within obj
    var pList = path.split('.');
    var len = pList.length;
    for(var i = 0; i < len-1; i++) {
        var elem = pList[i];
        if( !schema[elem] ) schema[elem] = {}
        schema = schema[elem];
    }

    schema[pList[len-1]] = value;
}