const Session = require('./Session.js');
const assign = require('assign-deep');

class Instance {
    constructor(options) {
        this.options = options
        this.sessions = []
        let sessions = options.sessions
        Object.keys(sessions).forEach(key => {
            let session_opt = assign({
                    config: {
                        server: {
                            ip: "example.com",
                            port: 25565
                        },
                        timeout : 20000
                    },
                    secrets: {
                        username: "example",
                        password: "example"
                    }
                },
                sessions[key]);
            this.sessions[this.sessions.length] = new Session(session_opt)
        })
    }

    getPassword() {
        return this.options.password
    }
}

module.exports = Instance