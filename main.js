const mineflayer = require('mineflayer');
const webserver = require('./webfiles/webserver.js'); // to serve the webserver
const opn = require('opn'); //to open a browser window
const secrets = require('./configs/secrets.json'); // read the creds
const config = require('./configs/config.json'); // read the config
const utils = require('./webfiles/utils.js');

webserver.createServer(config.ports.web); // create the webserver
webserver.password = config.password
webserver.onstart(() => { // set up actions for the webserver
	start();
});
webserver.onstop(() => {
	stop();
});
webserver.onchat((chat)=>{
	if(bot!==undefined){
		bot.chat(chat);
	}
})

if (config.openBrowserOnStart) {
    opn('http://localhost:' + config.ports.web); //open a browser window
}

let bot = undefined; // the client to connect

let restart = false;

let _chat = webserver.chat
let _log = webserver.log
let _console = webserver.console

function updateScoreboard(scoreboard, update) {
	if(bot.scoreboard["sidebar"] === scoreboard) {
		webserver.scoreboard = {};
		webserver.scoreboard["title"]=scoreboard.title
		webserver.scoreboard["entries"]={}
		let scoreboard_txt = "<th><a>" +  + "</a></th>";
		for (let item in scoreboard.items.slice(15) ) {
			webserver.scoreboard["entries"][item.name]=item.value;
			/*scoreboard_txt += "<tr><td><a>" + item.name + "</a></td><td><a>" + item.value + "</a></td></tr>";*/
		}
	}else if(bot.scoreboard["list"] === scoreboard){
		updateTablist()
	}
}

function updateTablist() {
	let listScore = bot.scoreboard["list"];
	let tablist = {}
	for (let pl in bot.players) {
		tablist[bot.players[pl].displayName.toMotd()] = (listScore !== undefined && listScore.itemsMap[pl] !== undefined)?listScore.itemsMap[pl].value:null
		/*tablist += "<tr><td><pre>" + utils.ChatToHtml(bot.players[pl].displayName) + "</pre></td>"
		tablist += (listScore !== undefined && listScore.itemsMap[pl] !== undefined)?("<td><pre style='color: #e0e01f'>"+listScore.itemsMap[pl].value+"</pre></td>"):""
		tablist += "</tr>"*/
	}
	webserver.tablist = tablist;
}

// function to connect to the server
function start() {
	if ( bot === undefined ) {
		restart = webserver.restart;
		_log.push({
			text: "Connecting to "+config.server.ip+":"+config.server.port,
			color: null
		})
		bot = mineflayer.createBot({
			host: config.server.ip,
			port: config.server.port,
			username: secrets.username,
			password: secrets.password
		});

		bot.on("error", (error => {
			_log.push({
				text : "Error:",
				color: "#f32727"
			})
			_log.push({
				text : error.toString(),
				color: null
			})
			webserver.isConnected = false;
			console.log(error)
			bot = undefined;
		}))

		bot.on("message",(jsonMessage)=>{
			//const ChatMessage = require('mineflayer/lib/chat_message')(bot.version);
			//let message = new ChatMessage(jsonMessage)
			_chat.push(jsonMessage.toMotd())
		})

		bot.on("login", client => {
			webserver.isConnected = true;
			webserver.username = bot.username;
			_log.push({
				text: "Connected",
				color: null
			})
		})

		bot.on("spawn", updateTablist)

		bot.on("playerJoined",updateTablist)
		bot.on("playerLeft",updateTablist)

		bot.on("end", (ignored) => {
			_log.push({
				text: "Disconnected"
			})
			webserver.isConnected = false
			webserver.tablist = webserver.scoreboard = {}
			webserver.username = "NOT CONNECTED"
			bot = undefined
			if (restart){
				_log.push({
					text: "Reconnect in " + config.reconnectTimeout + " ms"
				})
				setTimeout(start,config.reconnectTimeout)
			}
		});

		bot.on("scoreboardPosition",()=>{
			if (bot.scoreboard["sidebar"] === undefined){
				webserver.scoreboard = {};
			}else{
				updateScoreboard()
			}
		})

		bot.on("scoreUpdated",updateScoreboard)
		bot.on("scoreRemoved",updateScoreboard)
		bot.on("scoreboardTitleChanged",updateScoreboard)

	}
}

// function to disconnect from the server
function stop(){
	webserver.isConnected = false;
	restart = false;
	bot.quit("disconnect");
}
