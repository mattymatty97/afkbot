updateAll()

function logout() {
    document.cookie = "user="
    document.cookie = "password="
    window.location.href = window.location.href.replace("/instance","/")
}

function start() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/start", true);
    setHeaders(xhr)
    xhr.send();
    updateAll()
}

function stop() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/stop", true);
    setHeaders(xhr)
    xhr.send();
    updateAll()
}

function toggleRestartQueue() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/restart", true);
    setHeaders(xhr)
    xhr.setRequestHeader('XRestart', document.getElementsByClassName('restart')[0].checked)
    xhr.send();
}

function sendChat() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/send", true);
    setHeaders(xhr)
    xhr.setRequestHeader('XChat', true)
    xhr.setRequestHeader('XText', document.getElementsByClassName('chatInput')[0].value)
    xhr.send();
    document.getElementsByClassName('chatInput')[0].value = ""
    resetComponentTime('chat')
    updateComponent('chat')
}

function sendConsole() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/send", true);
    setHeaders(xhr)
    xhr.setRequestHeader('XChat', false)
    xhr.setRequestHeader('XText', document.getElementsByClassName('consoleInput')[0].value)
    xhr.send();
    document.getElementsByClassName('consoleInput')[0].value = ""
    resetComponentTime('console')
    updateComponent('console')
}

let components = {
    min_time: 20,
    max_time: 20000
}

function updateComponent(target) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/update", true);
    xhr.setRequestHeader('xtarget',target)
    xhr.onreadystatechange =  () => {
        updatePageComponents(xhr)

        if (xhr.readyState === 4 && xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);

            let component = components[target]

            let act = false
            let string = JSON.stringify(response[target])
            let new_time = component['time']
            if(component['old'] !== string){
                act = true
                component['old'] = string
            }
            if(component['prev'] !== null)
                if(act && component['prev']){
                     new_time = Math.max(new_time/2,components.min_time)
                }else if(!act && !component['prev']){
                     new_time = Math.min(new_time*2,components.max_time)
                }
            if(component['time'] !== new_time && !isNaN(new_time)){
                component['time'] = new_time
                console.log(target + " time: " + new_time)
            }
            clearTimeout(component['timeout'])
            component['timeout'] = setTimeout(updateComponent,component['time'],target)

            component['prev'] = act

            components[target] = component

        }
    }
    setHeaders(xhr)
    xhr.send();
}

function resetComponentTime(target) {
    let component = components[target]
    if(component!==undefined){
        component['time'] = 1000;
        if(component.hasOwnProperty('timeout'))
            clearInterval(component['timeout'])
        component['timeout'] = setTimeout(updateComponent,component['time'],target)
    }
}

function updateAll() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/update", true);
    xhr.onreadystatechange = function () {
        updatePageComponents(this);

        if (this.readyState === 4 && this.status === 200) {
            const response = JSON.parse(this.responseText);

            Object.keys(response).forEach(key=>{

                let component = components[key] || {}

                component['old'] = JSON.stringify(response[key])
                component['prev'] = null
                component['time'] = 1000
                console.log(key + " time: " + 1000)
                if(component.hasOwnProperty('timeout'))
                    clearTimeout(component['timeout'])
                component['timeout'] = setTimeout(updateComponent,component['time'],key)

                components[key] = component

            })

        }

    }
    setHeaders(xhr)
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
                                .concat("<td><a style='text-align: right; color: yellow'>").concat((value !== null) ? value : "").concat("</a></td></tr>")
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
            let title = "SCOREBOARD"
            if (JSON.stringify(old_scoreboard) !== JSON.stringify(scoreboard)) {
                if (JSON.stringify(scoreboard) === JSON.stringify({})) {
                    new_html = "<tr><td><a>Nothing to Show</a></td></tr>"
                    title = "SCOREBOARD"
                } else {
                    title = scoreboard.title
                    Object.keys(scoreboard.entries).forEach((key) => {
                        let value = scoreboard.entries[key]
                        if (typeof (value) === "number"  && typeof (key) === "string")
                            new_html = new_html.concat("<tr><td><a style='text-align: left'>").concat(key).concat("</a></td>")
                                .concat("<td><a style='text-align: right; color: #f32727'>").concat(value).concat("</a></td></tr>")
                    })
                }
                document.getElementsByClassName("scoreboard_content")[0].innerHTML = new_html;
                document.getElementById("scoreboard_title").innerHTML = title;
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
                        let value = chat[key].text
                        let time = chat[key].timestamp
                        let date = new Date(time)
                        if (typeof (value) === "string")
                            new_html = new_html.concat("<tr><td><pre>[").concat(date.toLocaleTimeString()).concat("] ").concat(MotdToHtml(escapeHtml(value))).concat("</pre></td></tr>")
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
                        let time = value.timestamp
                        let date = new Date(time)
                        new_html = new_html.concat("<tr><td><pre>[").concat(date.toLocaleTimeString()).concat("] ").concat(value.text).concat("</pre></td></tr>")
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
                        new_html = new_html.concat("<tr><td><pre>").concat(value).concat("</pre></td></tr>")
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
            let username = response.username.value
            if(old_uname !== username) {
                let element = document.getElementsByClassName("uname")[0]
                element.innerHTML = username;
                old_uname = username
            }
        }
        if (response.hasOwnProperty("restart")) {
            let restart = response.restart.value
            let element = document.getElementsByClassName("restart")[0]
            if (element.checked !== restart)
                element.checked = restart;
        }
        if (response.hasOwnProperty("connected")) {
            let mainButton = document.getElementById('mainButton');
            if (response.connected.value) {
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
    let json = {
        path: id
    }

    let element = document.getElementById(id)
    if(element.type === 'number'){
        json['value'] = Number(element.value)
    }else if(element.type === 'checkbox'){
        json['value'] = Boolean(element.value)
    }else{
        json['value'] = element.value
    }

    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/option", true);
    setHeaders(xhr)
    xhr.setRequestHeader('XOption', JSON.stringify(json))
    xhr.send();
}


function setHeaders(req) {
    req.setRequestHeader('XPassword', getCookie("password"))
    req.setRequestHeader('XUser', getCookie("user"))
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}