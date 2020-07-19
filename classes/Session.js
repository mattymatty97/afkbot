const CircularBuffer = require('circular-buffer');
const mineflayer = require('mineflayer');

class Session{

    constructor(options) {
        this.options = options
        this.bot = undefined; // the client to connect

        this.restart = false;

        this.chat = new CircularBuffer(70)
        this.log = new CircularBuffer(100)
        this.console = new CircularBuffer(200)
        
        this.scoreboard = {}
        this.tablist = {}
        this.connected = false
        this.username = "NOT CONNECTED"
    }


    updateScoreboard(scoreboard) {
        if(this.bot.scoreboard["sidebar"] === scoreboard) {
            this.scoreboard = {};
            this.scoreboard["title"]=scoreboard.title
            this.scoreboard["entries"]={}
            for (let i=0; i<scoreboard.items.length && i<15; i++ ) {
                let item = scoreboard.items[i]
                this.scoreboard["entries"][item.name]=item.value;
            }
        }else if(this.bot.scoreboard["list"] === scoreboard){
            this.updateTablist()
        }
    }

    updateTablist() {
        let listScore = this.bot.scoreboard["list"];
        let tablist = {}
        for (let pl in this.bot.players) {
            tablist[this.bot.players[pl].displayName.toMotd()] = (listScore !== undefined && listScore.itemsMap[pl] !== undefined)?listScore.itemsMap[pl].value:null
        }
        this.tablist = tablist;
    }

    start() {
        let session = this
        let onScoreBaord = (scoreboard)=>{
            this.updateScoreboard(scoreboard)
        }
        let onTabList = ()=>{
            this.updateTablist()
        }
        let onRestart = ()=>{
            this.start()
        }
        if ( session.bot === undefined ) {
            session.log.push({
                text: "Connecting to "+session.options.config.server.ip+":"+session.options.config.server.port,
                color: null
            })
            session.bot = mineflayer.createBot({
                host: session.options.config.server.ip,
                port: session.options.config.server.port,
                username: session.options.secrets.username,
                password: session.options.secrets.password
            });

            session.bot.on("error", (error => {
                session.log.push({
                    text : "Error:",
                    color: "#f32727"
                })
                session.log.push({
                    text : error.toString(),
                    color: null
                })
                session.connected = false;
                console.log(error)
                session.bot = undefined;
            }))

            session.bot.on("message",(jsonMessage)=>{
                session.chat.push(jsonMessage.toMotd())
            })

            session.bot.on("login", () => {
                session.connected = true;
                session.username = session.bot.username;
                session.log.push({
                    text: "Connected",
                    color: null
                })
            })

            session.bot.on("spawn", onTabList)

            session.bot.on("playerJoined",onTabList)
            session.bot.on("playerLeft",onTabList)

            session.bot.on("end", () => {
                session.log.push({
                    text: "Disconnected"
                })
                session.connected = false
                session.tablist = session.scoreboard = {}
                session.username = "NOT CONNECTED"
                session.bot = undefined
                if (session.restart){
                    session.log.push({
                        text: "Reconnect in " + session.options.config.timeout + " ms"
                    })
                    setTimeout(onRestart,session.options.config.timeout)
                }
                if(session.reset){
                    session.reset=false
                    session.restart=true
                }
            });

            session.bot.on("scoreboardPosition",(scoreboard)=>{
                if (session.bot.scoreboard["sidebar"] === undefined){
                    session.scoreboard = {};
                }else{
                    onScoreBaord(scoreboard)
                }
            })

            session.bot.on("scoreUpdated",onScoreBaord)
            session.bot.on("scoreRemoved",onScoreBaord)
            session.bot.on("scoreboardTitleChanged",onScoreBaord)

        }
    }

    stop(){
        this.connected = false;
        if (this.restart) {
            this.reset = true;
            this.restart = false;
        }
        this.bot.quit("Button");
    }

    sendChat(msg){
        if(this.bot!==undefined){
            this.bot.chat(msg);
        }
    }

    execConsole(console){
        try {
            let result = eval(console)
            if (result !== undefined)
                this.console.push(result.toString())
            else
                this.console.push("executed: \""+console+"\"")
        }catch (e) {
            this.console.push("Exception: " + e.toString())
        }
    }

}

module.exports = Session
