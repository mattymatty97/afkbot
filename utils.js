const mineflayer = require('mineflayer');
const Queue = require('queue');

const codes = {
        black: '#000000',
        dark_blue: '#0000AA',
        dark_green: '#00AA00',
        dark_aqua: '#00AAAA',
        dark_red: '#AA0000',
        dark_purple: '#AA00AA',
        gold: '#FFAA00',
        gray: '#AAAAAA',
        dark_gray: '#555555',
        blue: '#5555FF',
        green: '#55FF55',
        aqua: '#55FFFF',
        red: '#FF5555',
        light_purple: '#FF55FF',
        yellow: '#FFFF55',
        white: '#FFFFFF'
}

const oldCodes = {
    color: {
        '0': 'black',
        '1': 'dark_blue',
        '2': 'dark_green',
        '3': 'dark_aqua',
        '4': 'dark_red',
        '5': 'dark_purple',
        '6': 'gold',
        '7': 'gray',
        '8': 'dark_gray',
        '9': 'blue',
        'a': 'green',
        'b': 'aqua',
        'c': 'red',
        'd': 'light_purple',
        'e': 'yellow',
        'f': 'white'
    },
    'l': 'bold',
    'o': 'italic',
    'n': 'underline',
    'm': 'strike',
    'k': 'obfuscated',
    'r': 'reset'
}

module.exports = {
    ChatToHtml: (message) => {
        let chatMsg = message
        let text = ""
        if(message.hasOwnProperty("translate")){
            if(message.translate === "chat.type.text") {
                text = text.concat("&lt ").concat(module.exports.ChatToHtml(message.with[0]))
                    .concat(" &gt ").concat(module.exports.ChatToHtml(message.with[1]))
            }else{
                text = escapeHtml(message.translate)
            }
        }else {
            let tail = ""
            if (chatMsg.color != null) {
                text = text.concat("<a style='color: ").concat(codes[chatMsg.color]).concat("'>")
                tail = "</a>".concat(tail)
            }
            if (chatMsg.bold) {
                text = text.concat("<b>")
                tail = "</b>".concat(tail)
            }
            if (chatMsg.italic) {
                text = text.concat("<i>")
                tail = "</i>".concat(tail)
            }
            if (chatMsg.underlined) {
                text = text.concat("<u>")
                tail = "</u>".concat(tail)
            }
            if (chatMsg.strikethrough) {
                text = text.concat("<s>")
                tail = "</s>".concat(tail)
            }

            if(chatMsg.text !== undefined && chatMsg.text !== "") {
                text = text.concat(escapeHtml(chatMsg.text))
            }

            if (chatMsg.hasOwnProperty("extra")) {
                chatMsg.extra.forEach((extra) => {
                    text = text.concat(module.exports.ChatToHtml(extra))
                })
            }
            text = text.concat(tail)
        }
        return module.exports.OldChatToHtml(text)
    },

    OldChatToHtml: (message) =>{
        let list = message.split('§')
        let text = list[0]
        let color = null;
        let tail = Queue()
        let obfuscate = false;
        for (let i=1 ; i<list.length ; i++){
            let modifier = list[i][0]
            let msg = list[i].slice(1)
            if( oldCodes.color[modifier] !== undefined ){
                if (color !== oldCodes.color[modifier]){
                    while(tail.length>0){
                        text = text.concat(tail.pop())
                    }
                    color = oldCodes.color[modifier]
                    text = text.concat("<a style='color: ").concat(codes[color]).concat("'>")
                    tail.push("</a>")
                }
            }else{
                switch (oldCodes[modifier]) {
                    case 'bold':
                        text = text.concat("<b>")
                        tail.push("</b>")
                        break;
                    case 'italic':
                        text = text.concat("<i>")
                        tail.push("</i>")
                        break;
                    case 'underline':
                        text = text.concat("<u>")
                        tail.push("</u>")
                        break;
                    case 'strike':
                        text = text.concat("<s>")
                        tail.push("</s>")
                        break;
                    case 'obfuscated':
                        /*if(!obfuscated) {
                            obfuscated = true;
                            text = text.concat("<idk>")
                        }*/
                        break;
                    case 'reset':
                        while(tail.length>0){
                            text = text.concat(tail.pop())
                        }
                        break;
                }
            }
            text = text.concat(msg)
        }
        return text
    },
    escapeHtml: (msg) =>{
        return msg.replace(/"/gi,"&quot")
            .replace(/&/gi,"&amp")
            .replace(/</gi,"&lt")
            .replace(/>/gi,"&gt")
    }
}

function escapeHtml(msg) {
 return module.exports.escapeHtml(msg)
}