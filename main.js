const webserver = require('./webserver.js'); // to serve the webserver
const config = require('./configs/config.json'); // read the config
const instances = require('./configs/instances.json'); // read the config
const Instance = require('./classes/Instance.js');
const assign = require('assign-deep');

webserver.createServer(config.ports.web); // create the webserver

Object.keys(instances).forEach(key=>{
    webserver.instances[key] = new Instance(assign({
        password: key,
        sessions: [{}]
    },instances[key]))
})


