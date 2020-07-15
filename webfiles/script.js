setInterval(updateAll, 1000);

function start() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/start", true);
    xhr.setRequestHeader('XPassword', document.getElementsByClassName('password')[0].value)
    xhr.send();
}

function stop() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/stop", true);
    xhr.setRequestHeader('XPassword', document.getElementsByClassName('password')[0].value)
    xhr.send();
}

function toggleRestartQueue() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/restart", true);
    xhr.setRequestHeader('XPassword', document.getElementsByClassName('password')[0].value)
    xhr.setRequestHeader('XRestart', document.getElementsByClassName('restart')[0].checked)
    xhr.send();
}

function sendChat() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/send", true);
    xhr.setRequestHeader('XPassword', document.getElementsByClassName('password')[0].value)
    xhr.setRequestHeader('XChat', true)
    xhr.setRequestHeader('XText', document.getElementsByClassName('chatInput')[0].value)
    xhr.send();
    document.getElementsByClassName('chatInput')[0].value = ""
}

function sendConsole() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/send", true);
    xhr.setRequestHeader('XPassword', document.getElementsByClassName('password')[0].value)
    xhr.setRequestHeader('XChat', false)
    xhr.setRequestHeader('XText', document.getElementsByClassName('consoleInput')[0].value)
    xhr.send();
    document.getElementsByClassName('consoleInput')[0].value = ""
}

function updateTabList() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/update", true);
    xhr.setRequestHeader('XTarget', "tablist")
    xhr.onreadystatechange = function () {
        updatePageComponents(this)
    }
    xhr.setRequestHeader('XPassword', document.getElementsByClassName('password')[0].value)
    xhr.send();
}

function updateScoreboard() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/update", true);
    xhr.setRequestHeader('XTarget', "scoreboard")
    xhr.onreadystatechange = updatePageComponents()
    xhr.setRequestHeader('XPassword', document.getElementsByClassName('password')[0].value)
    xhr.send();
}

function updateChat() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/update", true);
    xhr.setRequestHeader('XTarget', "chat")
    xhr.onreadystatechange = updatePageComponents()
    xhr.setRequestHeader('XPassword', document.getElementsByClassName('password')[0].value)
    xhr.send();
}

function updateLog() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/update", true);
    xhr.setRequestHeader('XTarget', "log")
    xhr.onreadystatechange = updatePageComponents()
    xhr.setRequestHeader('XPassword', document.getElementsByClassName('password')[0].value)
    xhr.send();
}

function updateConsole() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/update", true);
    xhr.setRequestHeader('XTarget', "console")
    xhr.onreadystatechange = updatePageComponents()
    xhr.setRequestHeader('XPassword', document.getElementsByClassName('password')[0].value)
    xhr.send();
}

function updateOptions() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/update", true);
    xhr.setRequestHeader('XTarget', "options")
    xhr.onreadystatechange = updatePageComponents()
    xhr.setRequestHeader('XPassword', document.getElementsByClassName('password')[0].value)
    xhr.send();
}

function updateAll() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/update", true);
    xhr.onreadystatechange = function () {
        updatePageComponents(this)
    }
    xhr.setRequestHeader('XPassword', document.getElementsByClassName('password')[0].value)
    xhr.send();
}

let old_tablist = {}
let old_scoreboard = {}
let old_chat = {}
let old_log = {}
let old_console = {}
let old_options = {}
let old_uname = "NOT CONNECTED"

function updatePageComponents(req) {
    if (req.readyState === 4 && req.status === 200) {
        const response = JSON.parse(req.responseText);
        if (response.hasOwnProperty("tablist")) {
            let tablist = response.tablist
            let new_html = ""
            if(JSON.stringify(old_tablist) !== JSON.stringify(tablist)){
                if(JSON.stringify(tablist) === JSON.stringify({})) {
                new_html = "<tr><td><a>Nothing to Show</a></td></tr>"
                } else {
                    Object.keys(tablist).forEach((key) => {
                        let value = tablist[key]
                        if (typeof (key) === "string")
                            new_html = new_html.concat("<tr><td><a style='text-align: left'>").concat(
                                MotdToHtml(escapeHtml(key))
                            ).concat("</a></td>")
                                .concat("<a style='text-align: right'>").concat((value !== null) ? value : "").concat("</a></td></tr>")
                    })
                }
                let element = document.getElementsByClassName("tab_list_content")[0]
                element.innerHTML = new_html;
                old_tablist = tablist
            }

        }
        if (response.hasOwnProperty("scoreboard")) {
            let scoreboard = response.scoreboard
            let new_html = ""
            if (JSON.stringify(old_scoreboard) !== JSON.stringify(scoreboard)) {
                if (JSON.stringify(scoreboard) === JSON.stringify({})) {
                    new_html = "<tr><td><a>Nothing to Show</a></td></tr>"
                } else {
                    new_html = new_html.concat("<th><a>").concat(scoreboard.title).concat("</a></th>")
                    Object.keys(scoreboard.entries).forEach((key) => {
                        let value = scoreboard.entries[key]
                        if (typeof (value) === "string" && typeof (key) === "string")
                            new_html = new_html.concat("<tr><td><a style='text-align: left'>").concat(key).concat("</a></td>")
                                .concat("<a style='text-align: right'>").concat(value).concat("</a></td></tr>")
                    })
                }
                let element = document.getElementsByClassName("scoreboard_content")[0]
                element.innerHTML = new_html;
                old_scoreboard = scoreboard
            }
        }
        if (response.hasOwnProperty("chat")) {
            let chat = response.chat
            let new_html = ""
            if(JSON.stringify(old_chat) !== JSON.stringify(chat)) {
                if (JSON.stringify(chat) === JSON.stringify({})) {
                    new_html = ""
                } else {
                    Object.keys(chat).forEach((key) => {
                        let value = chat[key]
                        if (typeof (value) === "string")
                            new_html = new_html.concat("<tr><td><pre>").concat(MotdToHtml(escapeHtml(value))).concat("</pre></td></tr>")
                    })
                }
                let element = document.getElementsByClassName("chat")[0]
                element.innerHTML = new_html;
                old_chat = chat
            }
        }
        if (response.hasOwnProperty("log")) {
            let log = response.log
            let new_html = ""
            if(JSON.stringify(old_log) !== JSON.stringify(log)) {
                if (JSON.stringify(log) === JSON.stringify({})) {
                    new_html = ""
                } else {
                    Object.keys(log).forEach((key) => {
                        let value = log[key]
                        new_html = new_html.concat("<tr><td><pre>").concat(value.text).concat("</pre></td></tr>")
                    })
                }
                let element = document.getElementsByClassName("log")[0]
                element.innerHTML = new_html;
                old_log = log
            }
        }
        if (response.hasOwnProperty("console")) {
            let console = response.console
            let new_html = ""
            if(JSON.stringify(old_console) !== JSON.stringify(console)) {
                if (JSON.stringify(console) === JSON.stringify({})) {
                    new_html = ""
                } else {
                    Object.keys(console).forEach((key) => {
                        let value = console[key]
                        new_html = new_html.concat("<tr><td><pre>").concat(MotdToHtml(escapeHtml(value))).concat("</pre></td></tr>")
                    })
                }
                let element = document.getElementsByClassName("console")[0]
                element.innerHTML = new_html;
                old_console = console
            }
        }
        if (response.hasOwnProperty("options")) {
            parseOptions(response);
        }
        if (response.hasOwnProperty("username")) {
            let username = response.username
            if(old_uname !== username) {
                let element = document.getElementsByClassName("uname")[0]
                element.innerHTML = username;
                old_uname = username
            }
        }
        if (response.hasOwnProperty("restart")) {
            let restart = response.restart
            let element = document.getElementsByClassName("restart")[0]
            if (element.checked !== restart)
                element.checked = restart;
        }
        if (response.hasOwnProperty("connected")) {
            let mainButton = document.getElementById('mainButton');
            if (response.connected) {
                mainButton.innerHTML = "Disconnect";
                mainButton.setAttribute('onclick', 'stop()');
                mainButton.className = 'stop';
            } else {
                mainButton.innerHTML = "Connect";
                mainButton.setAttribute('onclick', 'start()');
                mainButton.className = 'start';
            }
        }
    }
}


function makeOtpLine(obj, root) {
    let html = ""
    Object.keys(obj).forEach((key)=>{
        let value = obj[key]
        if (typeof (value) !== "object") {
            html = html
                .concat("<tr><td>").concat(key).concat(":</td><td>").concat(makeInput(value,root + key)).concat("</td></td></tr>")
        }else{
            html = html.concat("<tr><td>").concat(key).concat(": </td><td><table>").concat(makeOtpLine(value,root + key + ".")).concat("</table></td>")
        }
    })
    return html;
}

function parseOptions(response) {
    let options = response.options
    let new_html = ""
    if (JSON.stringify(old_options) !== JSON.stringify(options)) {
        if (JSON.stringify(options) === JSON.stringify({})) {
            new_html = ""
        } else {
            new_html = new_html.concat(makeOtpLine(options,""))
        }
        let element = document.getElementsByClassName("options")[0]
        element.innerHTML = new_html;
        old_options = options
    }
}

function makeInput(value,key) {
    switch (typeof value) {
        case "string":
            if(key.includes("password"))
                return "<input id='"+key+"' type='password' value='"+value+"' onchange='updateOpt(\""+key+"\")'>"
            return "<input id='"+key+"' type='text' value='"+value+"' onchange='updateOpt(\""+key+"\")'>"
        case "boolean":
            return "<input id='"+key+"' type='checkbox' checked='"+value+"' onchange='updateOpt(\""+key+"\")'>"
        case "number":
            return "<input id='"+key+"' type='number' value='"+value+"' onchange='updateOpt(\""+key+"\")'>"
    }
}

function updateOpt(id) {
    let new_opt = JSON.parse(JSON.stringify(old_options))
    let element = document.getElementById(id)
    set(new_opt,id,element.value)

    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/options", true);
    xhr.setRequestHeader('XPassword', document.getElementsByClassName('password')[0].value)
    xhr.setRequestHeader('XOptions', JSON.stringify(new_opt))
    xhr.send();
}

function set(obj, path, value) {
    var schema = obj;  // a moving reference to internal objects within obj
    var pList = path.split('.');
    var len = pList.length;
    for(var i = 0; i < len-1; i++) {
        var elem = pList[i];
        if( !schema[elem] ) schema[elem] = {}
        schema = schema[elem];
    }

    schema[pList[len-1]] = value;
}