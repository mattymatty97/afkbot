function login() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/login", true);
    xhr.setRequestHeader('XPassword', document.getElementsByClassName('password')[0].value)
    xhr.setRequestHeader('XUser', document.getElementsByClassName('userid')[0].value)
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            document.cookie = "user=" + document.getElementsByClassName('userid')[0].value +";samesite=strict"
            document.cookie = "password=" + document.getElementsByClassName('password')[0].value +";samesite=strict"
            window.location.href = window.location.href + "instance";
        }else{
            document.getElementById("error").innerHTML = "<a>Error:<br><br>Wrong UserId or Password</a>"
        }
    }
    xhr.send();
}