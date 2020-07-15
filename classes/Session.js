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


    updateScoreboard(session, scoreboard) {
        if(session.bot.scoreboard["sidebar"] === scoreboard) {
            session.scoreboard = {};
            session.scoreboard["title"]=scoreboard.title
            session.scoreboard["entries"]={}
            for (let item in scoreboard.items.slice(15) ) {
                session.scoreboard["entries"][item.name]=item.value;
            }
        }else if(session.bot.scoreboard["list"] === scoreboard){
            this.updateTablist()
        }
    }

    updateTablist(session) {
        let listScore = session.bot.scoreboard["list"];
        let tablist = {}
        for (let pl in session.bot.players) {
            tablist[session.bot.players[pl].displayName.toMotd()] = (listScore !== undefined && listScore.itemsMap[pl] !== undefined)?listScore.itemsMap[pl].value:null
        }
        session.tablist = tablist;
    }

    start() {
        let session = this
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
                //const ChatMessage = require('mineflayer/lib/chat_message')(bot.version);
                //let message = new ChatMessage(jsonMessage)
                session.chat.push(jsonMessage.toMotd())
            })

            session.bot.on("login", client => {
                session.connected = true;
                session.username = session.bot.username;
                session.log.push({
                    text: "Connected",
                    color: null
                })
            })

            session.bot.on("spawn", ()=>{
                session.updateTablist(session)
            })

            session.bot.on("playerJoined",()=>{
                session.updateTablist(session)
            })
            session.bot.on("playerLeft",()=>{
                session.updateTablist(session)
            })

            session.bot.on("end", (ignored) => {
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
                    setTimeout(start,session.options.config.timeout)
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
                    session.updateScoreboard(session,scoreboard)
                }
            })

            session.bot.on("scoreUpdated",(scoreboard)=>{
                session.updateScoreboard(session,scoreboard)
            })
            session.bot.on("scoreRemoved",(scoreboard)=>{
                session.updateScoreboard(session,scoreboard)
            })
            session.bot.on("scoreboardTitleChanged",(scoreboard)=>{
                session.updateScoreboard(session,scoreboard)
            })

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

}

module.exports = Session