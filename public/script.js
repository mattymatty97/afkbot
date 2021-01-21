function login() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", window.location.origin + "/login", true);
    xhr.setRequestHeader('XPassword', document.getElementsByClassName('password')[0].value)
    xhr.setRequestHeader('XUser', document.getElementsByClassName('userid')[0].value)
    xhr.onreadystatechange = function () {
        if (this.readyState === 4){
            if (this.status === 200) {
                window.location.href = window.location.origin + "/instance";
            }else{
            document.getElementById("error").innerHTML = "<a>Error:<br><br>Wrong UserId or Password</a>"
            }
        }
    }
    xhr.send();
}
