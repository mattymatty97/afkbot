const Session = require('./Session.js');


class Instance {
    constructor(options) {
        this.options = options
        this.sessions = []
        let sessions = options.sessions
        Object.keys(sessions).forEach(key => {
            let session_opt = sessions[key]
            this.sessions[this.sessions.length] = new Session(session_opt)
        })
    }

    getPassword() {
        return this.options.password
    }
}

module.exports = Instance