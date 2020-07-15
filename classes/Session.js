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


    updateScoreboard(scoreboard, update) {
        if(this.bot.scoreboard["sidebar"] === scoreboard) {
            this.scoreboard = {};
            this.scoreboard["title"]=scoreboard.title
            this.scoreboard["entries"]={}
            for (let item in scoreboard.items.slice(15) ) {
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
        if ( this.bot === undefined ) {
            this.log.push({
                text: "Connecting to "+this.options.config.server.ip+":"+this.options.config.server.port,
                color: null
            })
            this.bot = mineflayer.createBot({
                host: this.options.config.server.ip,
                port: this.options.config.server.port,
                username: this.options.secrets.username,
                password: this.options.secrets.password
            });

            this.bot.on("error", (error => {
                this.log.push({
                    text : "Error:",
                    color: "#f32727"
                })
                this.log.push({
                    text : error.toString(),
                    color: null
                })
                this.connected = false;
                console.log(error)
                this.bot = undefined;
            }))

            this.bot.on("message",(jsonMessage)=>{
                //const ChatMessage = require('mineflayer/lib/chat_message')(bot.version);
                //let message = new ChatMessage(jsonMessage)
                this.chat.push(jsonMessage.toMotd())
            })

            this.bot.on("login", client => {
                this.connected = true;
                this.username = this.bot.username;
                this.log.push({
                    text: "Connected",
                    color: null
                })
            })

            this.bot.on("spawn", this.updateTablist)

            this.bot.on("playerJoined",this.updateTablist)
            this.bot.on("playerLeft",this.updateTablist)

            this.bot.on("end", (ignored) => {
                this.log.push({
                    text: "Disconnected"
                })
                this.connected = false
                this.tablist = this.scoreboard = {}
                this.username = "NOT CONNECTED"
                this.bot = undefined
                if (this.restart){
                    this.log.push({
                        text: "Reconnect in " + this.options.config.timeout + " ms"
                    })
                    setTimeout(start,this.options.config.timeout)
                }
                if(this.reset){
                    this.reset=false
                    this.restart=true
                }
            });

            this.bot.on("scoreboardPosition",()=>{
                if (this.bot.scoreboard["sidebar"] === undefined){
                    this.scoreboard = {};
                }else{
                    updateScoreboard()
                }
            })

            this.bot.on("scoreUpdated",updateScoreboard)
            this.bot.on("scoreRemoved",updateScoreboard)
            this.bot.on("scoreboardTitleChanged",updateScoreboard)

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