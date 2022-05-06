const CircularBuffer = require('circular-buffer');
const mineflayer = require('mineflayer');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const { GoalNear, GoalBlock, GoalXZ, GoalY, GoalInvert, GoalFollow } = require('mineflayer-pathfinder').goals;

class Session{

    constructor(options) {
        this.options = options
        this.botOptions = {};
        this.bot = undefined;

        this.restart = false;
        this.disconnect = false;

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
            if(this.bot !== undefined)
                this.updateScoreboard(scoreboard)
        }
        let onTabList = ()=>{
            if(this.bot !== undefined)
                this.updateTablist()
        }
        let onRestart = ()=>{
            this.start()
        }
        if ( session.bot === undefined ) {
            session.log.push({
                text: "Connecting to "+session.options.config.server.ip+":"+session.options.config.server.port,
                color: null,
                timestamp: Date.now()
            })

            this.botOptions['host']=session.options.config.server.ip
            this.botOptions['port']=session.options.config.server.port

            if(this.botOptions['username'] !== session.options.secrets.username){
                this.botOptions['username']=session.options.secrets.username;
                delete this.botOptions['clientToken']
                delete this.botOptions['accessToken']
            }

            if(this.botOptions['password']!==session.options.secrets.password){
                this.botOptions['password']=session.options.secrets.password;
                delete this.botOptions['clientToken']
                delete this.botOptions['accessToken']
            }

            session.bot = mineflayer.createBot(this.botOptions);

            session.bot.on("error", (error => {
                session.log.push({
                    text : error.toString(),
                    color: "#f32727",
                    timestamp: Date.now()
                })
                session.connected = false;
                console.log(error)
                session.bot = undefined;
                delete this.botOptions['clientToken']
                delete this.botOptions['accessToken']
            }))

            session.bot.loadPlugin(pathfinder);

            session.bot.on("message",(jsonMessage)=>{
                session.chat.push({
                    text: jsonMessage.toMotd(),
                    timestamp: Date.now()
                })
            })

            session.bot.on("login", () => {
                session.connected = true;
                session.username = session.bot.username;
                session.log.push({
                    text: "Connected",
                    color: null,
                    timestamp: Date.now()
                })
				this.bot.physicsEnabled = (this.bot.gamemode == 'spectator');
            })

            session.bot.on("game", ()=>{
					this.bot.physicsEnabled = (this.bot.gamemode == 'spectator');
			});
			
            session.bot.on("spawn", onTabList);
            session.bot.on("spawn", ()=>{
                const mcData = require('minecraft-data')(session.bot.version);
                const defaultMove = new Movements(session.bot, mcData);
                session.bot.pathfinder.setMovements(defaultMove);

            });

            session.bot.on("playerJoined",onTabList)
            session.bot.on("playerLeft",onTabList)

            session.bot.on('death',()=>{
                if(this.disconnect)
                    this.stop("Death");
            })

            session.bot.on("end", () => {
                session.log.push({
                    text: "Disconnected",
                    timestamp: Date.now()
                })
                session.connected = false
                session.tablist = session.scoreboard = {}
                session.username = "NOT CONNECTED"
                session.bot = undefined
                if (session.restart){
                    session.log.push({
                        text: "Reconnect in " + session.options.config.timeout + " ms",
                        timestamp: Date.now()
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

            this.pushFunc = (entity)=>{
                if(session.bot !== undefined) {
                    if (entity.id !== session.bot.entity.id) {
                        if (Math.abs(entity.position.x - session.bot.entity.position.x) < 1)
                            if (Math.abs(entity.position.z - session.bot.entity.position.z) < 1)
                                if (Math.sqrt(Math.pow(entity.position.x - session.bot.entity.position.x, 2) + Math.pow(entity.position.z - session.bot.entity.position.z, 2)) < 0.8) {
                                    let dx = session.bot.entity.position.x - entity.position.x;
                                    let dz = session.bot.entity.position.z - entity.position.z;
                                    let normalize = Math.sqrt(Math.pow(dx, 2) + Math.pow(dz, 2));
                                    let velx = (dx / normalize) * 0.001;
                                    let velz = (dz / normalize) * 0.001;

                                    session.bot.entity.velocity.x += velx;
                                    session.bot.entity.velocity.z += velz;

                                    /*
                                    session.log.push({
                                        text: "Pushed by entity: "+ entity.id,
                                        color: "#e75e00",
                                        timestamp: Date.now()
                                    })*/

                                    setTimeout(() => session.pushFunc(entity), 500);
                                }
                    }
                }
            };

            session.bot.on('entityMoved',session.pushFunc);

        }
    }

    stop(reason="Button"){
        if(this.bot !== undefined) {
            this.connected = false;
            if (this.restart) {
                this.reset = true;
                this.restart = false;
            }
            this.bot.quit(reason);
        }
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
