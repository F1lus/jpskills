function kiir(){
    var date = new Date();
    var h = date.getHours()+"";
    var m = date.getMinutes()+"";
    var s = date.getSeconds()+"";
    h = check(h);
    m = check(m);
    s = check(s);
    if(document.getElementById("ido") != null){
        document.getElementById("h1").innerHTML = h[0];
        document.getElementById("h2").innerHTML = h[1];
        document.getElementById("m1").innerHTML = m[0];
        document.getElementById("m2").innerHTML = m[1];
        document.getElementById("s1").innerHTML = s[0];
        document.getElementById("s2").innerHTML = s[1];
        
    }
}

const check = (i) => {
    if(i<10){
        i = "0"+i;
    }
    return i;
}


setInterval(kiir,1000);