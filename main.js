const webserver = require('./classes/webserver.js'); // to serve the webserver
const opn = require('opn'); //to open a browser window
const config = require('./configs/config.json'); // read the config
const instances = require('./configs/instances.json'); // read the config
const Instance = require('./classes/Instance.js');

webserver.createServer(config.ports.web); // create the webserver

if (config.openBrowserOnStart) {
    opn('http://localhost:' + config.ports.web); //open a browser window
}

let instance = new Instance(instances["mattymatty"])

webserver.instances["mattymatty"] = instance
