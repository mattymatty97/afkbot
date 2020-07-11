const mineflayer = require('mineflayer');
const webserver = require('./webserver.js'); // to serve the webserver
const opn = require('opn'); //to open a browser window
const secrets = require('./secrets.json'); // read the creds
const config = require('./config.json'); // read the config
const utils = require('./utils.js');

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
		let scoreboard_txt = "<th><a>" + scoreboard.title + "</a></th>";
		for (let item in scoreboard.items.slice(15) ) {
			scoreboard_txt += "<tr><td><a>" + item.name + "</a></td><td><a>" + item.value + "</a></td></tr>";
		}
		webserver.scoreboard = scoreboard_txt;
	}else if(bot.scoreboard["list"] === scoreboard){
		updateTablist()
	}
}

function updateTablist() {
	let listScore = bot.scoreboard["list"];
	let tablist = ""
	for (let pl in bot.players) {
		tablist += "<tr><td><a>" + utils.ChatToHtml(bot.players[pl].displayName) + "</a></td>"
		tablist += (listScore !== undefined && listScore.itemsMap[pl] !== undefined)?("<td style='color: #e0e01f'>"+listScore.itemsMap[pl].value+"</td>"):""
		tablist += "</tr>"
	}
	webserver.tablist = tablist;
}

// function to connect to the server
function start() {
	if ( bot === undefined ) {
		restart = webserver.restart;
		_log.push("<a>Connecting to "+config.server.ip+":"+config.server.port+"</a>")
		bot = mineflayer.createBot({
			host: config.server.ip,
			port: config.server.port,
			username: secrets.username,
			password: secrets.password
		});

		bot.on("error", (error => {
			_log.push("<a style='color: #f32727'>Error: </a><br><a>"+error+"</a>")
			webserver.isConnected = false;
			console.log(error)
			bot = undefined;
		}))

		bot.on("message",(jsonMessage)=>{
			const ChatMessage = require('mineflayer/lib/chat_message')(bot.version);
			let message = new ChatMessage(jsonMessage)
			_chat.push(utils.ChatToHtml(message))
		})

		bot.on("login", client => {
			webserver.isConnected = true;
			webserver.username = bot.username;
			_log.push("<a>Connected</a>")
		})

		bot.on("spawn", updateTablist)

		bot.on("playerJoined",updateTablist)
		bot.on("playerLeft",updateTablist)

		bot.on("end", (ignored) => {
			_log.push("<a>Disconnected</a>")
			webserver.isConnected = false
			webserver.tablist = webserver.scoreboard = "<tr><td><a>Nothing to Show</a></td></tr>";
			webserver.username = "NOT CONNECTED"
			bot = undefined
			if (restart){
				_log.push("<a>Reconnect in "+config.reconnectTimeout+" ms</a>")
				setTimeout(start,config.reconnectTimeout)
			}
		});

		bot.on("scoreboardPosition",()=>{
			if (bot.scoreboard["sidebar"] === undefined){
				webserver.scoreboard = "<tr><td><a>Nothing to Show</a></td></tr>";
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
