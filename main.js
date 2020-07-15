const webserver = require('./classes/webserver.js'); // to serve the webserver
const opn = require('opn'); //to open a browser window
const secrets = require('./configs/secrets.json'); // read the creds
const config = require('./configs/config.json'); // read the config
const Session = require('./classes/Session.js');

webserver.createServer(config.ports.web); // create the webserver
webserver.password = config.password

if (config.openBrowserOnStart) {
    opn('http://localhost:' + config.ports.web); //open a browser window
}

let session = new Session({
	config: {
		server: {
			ip: config.server.ip,
			port: config.server.port
		},
		timeout: config.reconnectTimeout
	},
	secrets: secrets
})

webserver.session = session
