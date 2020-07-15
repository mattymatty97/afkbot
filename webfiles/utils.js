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

const MotdCodes = {
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
function ChatToHtml(message) {
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
        return module.exports.MotdToHtml(text)
    }

    function MotdToHtml(message) {
        let list = message.split('§')
        let text = list[0]
        let color = null;
        let bold = false
        let italic = false
        let underline = false
        let strike = false
        let obfuscated = false
        let tail = ""
        let head = ""
        for (let i=1 ; i<list.length ; i++){
            let modifier = list[i][0]
            let msg = list[i].slice(1)
            if( MotdCodes.color[modifier] !== undefined ){
                if (color !== MotdCodes.color[modifier]){
                    let oldColor = color

                    if(oldColor !== null){
                        text = text.concat(tail)
                    }

                    color = MotdCodes.color[modifier]
                    text = text.concat("<a style='color: ").concat(codes[color]).concat("'>")

                    if(oldColor !== null){
                        text = text.concat(head)
                    }else{
                        tail = "</a>".concat(tail)
                    }
                }
            }else{
                switch (MotdCodes[modifier]) {
                    case 'bold':
                        text = text.concat("<b>")
                        head = head.concat("<b>")
                        tail = "</b>".concat(tail)
                        break;
                    case 'italic':
                        text = text.concat("<i>")
                        head = head.concat("<i>")
                        tail = "</i>".concat(tail)
                        break;
                    case 'underline':
                        text = text.concat("<u>")
                        head = head.concat("<u>")
                        tail = "</u>".concat(tail)
                        break;
                    case 'strike':
                        text = text.concat("<s>")
                        head = head.concat("<s>")
                        tail = "</s>".concat(tail)
                        break;
                    case 'obfuscated':
                        /*if(!obfuscated) {
                            obfuscated = true;
                            text = text.concat("<idk>")
                        }*/
                        break;
                    case 'reset':
                        text = text.concat(tail)
                        color = null
                        tail = ""
                        head = ""
                        break;
                }
            }
            text = text.concat(msg)
        }
        return text
    }

    function escapeHtml (msg) {
        return msg.replace(/"/gi,"&quot;")
            .replace(/&/gi,"&amp;")
            .replace(/</gi,"&lt;")
            .replace(/>/gi,"&gt;")
    }