"use strict";


var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();
var myid;
var groupid;
var lastmsg;
var micleveltimeout;
var groups = [];
var curgroupindex = -1;
var chatviewActive = true;
var onwindowvisible = null;
var windowVisible = true;
var mutedids = [];
var monthlystats = null;
var totalchats = null;
var totalintruders = null;
var totalmessages = null;
connection.on("ReceiveMessage", function (groupID, user, message, msgid) {
    putgrouptofirst(groupID);
    if (curgroupindex == -1 || groups[curgroupindex].id != groupID) {
        if (mutedids.indexOf(groupID)==-1)
            changeGroupdata(groupID);
    }
    var itm = groups.find(x => x.id == groupID);
    if (itm.msgloaded == false) {
        document.querySelector("#newnotaudio").play();
        return;
    }
    itm.messages.push({
        "msgType": 0,
        "userid": user==myid?user:null,
        "message": message,
        "anonuserid": msgid
    });
    for (var i = 0; i < message.length - 2; i++) {
        if (message[i] == '\n')
            message = message.slice(0, i - 1) + "<br>" + message.slice(i + 1, message.length - 1);
    }
    //message = message.replace(/(?:\r\n|\r|\n)/g, '<br>');

    if (groups[curgroupindex].id == groupID)
        msgbox.addData(user, message, msgid);
    checkforviewed(msgid);
});
connection.on("yourid", function (id) {
    myid = id;
});
connection.on("totalmessage", function (id) {
    totalmessages = id;
    document.querySelector("#totalmsgs").innerHTML = totalmessages;
});
connection.on("totalchats", function (id) {
    totalchats = id;
    document.querySelector("#totalchatval").innerHTML = totalchats;
});
connection.on("canneds", function (id) {
    msgbox.canneds = id;
});
connection.on("userdeleted", function (id) {
    curgroupindex = -1;
    document.querySelector(".singleMessageContainer").innerHTML = "<div class='singleMessage anotheruser' id='istypingmsg'><div class='userpic'></div><div class='actualmessage'><div class='nametag'>Nabin</div><div class='typing' id='istypingbox'><div class='first'></div><div class='second'></div><div class='third'></div></div></div></div>";
    document.querySelector("#curusername").innerHTML = "";
    document.querySelector("#curuserstatus").innerHTML = "";
    document.querySelector("#curuseremail").innerHTML = "";
    document.querySelector("#curuserid").innerHTML = "";
    document.querySelector("#curuserphone").innerHTML = "";
    document.querySelector("#curusercountry").innerHTML = "";
    document.querySelector("#curusercity").innerHTML = "";
    document.querySelector("#curuserip").innerHTML = "";
    groups.splice(groups.indexOf(groups.find(x => x.id == id)), 1);
    document.querySelector("#chatdata").removeChild(document.querySelector("#chatdata").querySelector("[data='" + id + "']"));
});
connection.on("totalintruders", function (id) {
    totalintruders = id;
    document.querySelector("#totalvisits").innerHTML = totalintruders;
});
connection.on("monthlydata", function (id) {
    monthlystats = JSON.parse(id);
    var dataPoints= [];
    for (var i = 0; i < monthlystats.length; i++) {
        dataPoints.push({ x: new Date(monthlystats[i].Year, monthlystats[i].Month), y: monthlystats[i].Total })
    }
    var chart = new CanvasJS.Chart("chartContainer",
        {
            title: {
                text: "Views"
            },
            axisX: {
                title: "Timeline",
                gridThickness: 2
            },
            axisY: {
                title: "No of viewers"
            },
            data: [
                {
                    type: "area",
                    dataPoints: dataPoints

                }
            ]
        });

    chart.render();
});

connection.on("istypingres", function (id, grpid) {
    if (curgroupindex == -1)
        return;
    if (id != myid && chatviewActive == true && grpid == groups[curgroupindex].id) {
        document.querySelector("#istypingmsg").style.display = "flex";
        groups[curgroupindex].typing = true;
        msgbox.typingseen = true;
        msgbox.showistyping();
    }
});
connection.on("istypingstoppedres", function (id, grpid) {
    if (curgroupindex == -1)
        return;
    if (id != myid && chatviewActive == true && grpid == groups[curgroupindex].id) {
        document.querySelector("#istypingmsg").style.display = "none";
        groups[curgroupindex].typing = false;
        msgbox.typingseen = false;
        msgbox.showistyping();
    }
});
connection.on("groupfilemsg", function (groupID, user, link, filename, msgid) {
    putgrouptofirst(groupID);
    if (curgroupindex == -1 || groups[curgroupindex].id != groupID) {
        if (mutedids.indexOf(groupID) == -1)
            changeGroupdata(groupID);
    }
    var itm = groups.find(x => x.id == groupID);
    if (itm.msgloaded == false) {
        document.querySelector("#newnotaudio").play();
        return;
    }
    itm.messages.push({
        "msgType": 1,
        "userid": user == myid ? user : null,
        "anonuserid": groupID,
        "message": link,
        "filename": filename,
        "id": msgid
    });
    if (groups[curgroupindex].id == groupID)
        msgbox.addfileData(user, link, filename, msgid);
    checkforviewed(msgid);

});
connection.on("msgseenbyAnons", function (uid, msg) {
    if(curgroupindex==-1)
        return;
    if (groups[curgroupindex].id == uid && chatviewActive==true)
        msgbox.messageseenchanged(msg);
});
connection.on("usernotactive", function (uid) {
    groups.find(x => x.id == uid).active = false;
    if (curgroupindex != -1 && groups[curgroupindex].id == uid) {
        document.querySelector("#curuserstatus").innerHTML = "just before";
        groups[curgroupindex].active = false;
        changeGroupdata(uid);
    }
});
connection.on("groupaudiomsg", function (groupID, user, link, msgid) {
    putgrouptofirst(groupID);
    if (curgroupindex == -1 || groups[curgroupindex].id != groupID) {
        if (mutedids.indexOf(groupID) == -1)
            changeGroupdata(groupID);
    }
    var itm = groups.find(x => x.id == groupID);
    if (itm.msgloaded == false) {
        document.querySelector("#newnotaudio").play();
        return;
    }
    itm.messages.push({

        "msgType":2,
        "userid": user == myid ? user : null,
        "anonuserid": groupID,
        "message": link,
        "id": msgid
    });
    if (curgroupindex!=-1&&groups[curgroupindex].id == groupID)
        msgbox.addaudiofileData(user, link, msgid);
    checkforviewed(msgid);

});
connection.on("newGroup", function (data) {
    var data = JSON.parse(data);

    groups.push({
        "id": data.anonid,
        "name": data.name,
        "IP": data.IP,
        "country": data.country,
        "email": data.email,
        "phone": data.phone,
        "city": data.city,
        "active": data.active,
        "lastTime": data.lastTime,
        "messages": [],
        "msgloaded": false
    });
    displayAnonymUsers(data.anonid, data.name, data.IP, data.country, data.city, data.active, data.lastTime);
});
connection.on("givengroupmessage", function (data,id) {
    var data = JSON.parse(data);
    var itm = groups.find(x => x.id == id);
    itm.messages = data;
    itm.msgloaded = true;
    if (curgroupindex!=-1&&groups[curgroupindex].id == id) {
        showmsgs();
    }
    if(data.length!=0)
    checkforviewed(groups[curgroupindex].messages[groups[curgroupindex].messages.length - 1].id);
});
connection.on("getGroups", function (data) {
    var data = JSON.parse(data);
    for (var i = 0; i < data.length; i++) {
        displayAnonymUsers(data[i].anonid, data[i].name, data[i].IP, data[i].country, data[i].city, data[i].active, data[i].lastTime);
        groups.push({
            "id": data[i].anonid,
            "name": data[i].name,
            "IP": data[i].IP,
            "country": data[i].country,
            "email": data[i].email,
            "phone": data[i].phone,
            "city": data[i].city,
            "active": data[i].active,
            "lastTime": data[i].lastTime,
            "messages": [],
            "msgloaded":false
        });
    }
});

function changeGroupdata(uid) {
    const elem = document.querySelector("#chatdata").querySelector("[data='" + uid + "']");
    var id = groups.indexOf(groups.find(x=>x.id==uid));
    var activetext;
    if (groups[id].active == true) {
        activetext = "<i class='fas fa-dot-circle'></i>  Active";
    }
    else {
        activetext = groups[id].lastTime;
    }
    var nam = groups[id].name;
    if (curgroupindex==-1||groups[curgroupindex].id != uid) {
        nam += "<span class='newMessage'>New Message</span>";
    }
    elem.innerHTML = elem.innerHTML = "<div class='chatname'>" + nam + "</div><div class='chatstatus'>" + activetext + "</div>";
}

connection.start().catch(function (err) {
    return console.log(err.toString());
}).then(function () {
    loaddata();
});

document.addEventListener("visibilitychange", () =>
{
    if (document.visibilityState == "visible") {
        if (onwindowvisible != null) {
            onwindowvisible();
        }
        windowVisible = true;
    }
    else
        windowVisible = false;
});

function groupIDChanged() {
    if(document.querySelector(".msgboxInputcontainer").classList.contains("inactive")){
        document.querySelector(".msgboxInputcontainer").classList.remove("inactive");
    }
    document.querySelector("#seentags").children[0].style.display = "none";
    document.querySelector("#seentags").children[0].style.top = "0px";

    var len = document.querySelector("#chatdata").children.length;
    changeGroupdata(groups[curgroupindex].id);
    for (var i = 0; i < len; i++) {
        if (groups[curgroupindex].id == document.querySelector("#chatdata").children[i].getAttribute("data")) {
            if (!document.querySelector("#chatdata").children[i].classList.contains("selected"))
                document.querySelector("#chatdata").children[i].classList += " selected";
        }
        else {
            if (document.querySelector("#chatdata").children[i].classList.contains("selected"))
                document.querySelector("#chatdata").children[i].classList.remove("selected");
        }
    }
    if (document.querySelector(".msgboxInputcontainer").classList.contains("inactive"))
        document.querySelector(".msgboxInputcontainer").classList.remove("inactive");
    var activetext;
    if (groups[curgroupindex].active == true) {
        activetext = "<i class='fas fa-dot-circle'></i>  Active";
    }
    else {
        activetext = groups[curgroupindex].lastTime;
    }
    document.querySelector(".singleMessageContainer").innerHTML = "<div class='singleMessage anotheruser' id='istypingmsg'><div class='userpic'></div><div class='actualmessage'><div class='nametag'>Nabin</div><div class='typing' id='istypingbox'><div class='first'></div><div class='second'></div><div class='third'></div></div></div></div>";
    document.querySelector("#curusername").innerHTML = groups[curgroupindex].name;
    document.querySelector("#curuserstatus").innerHTML = activetext;
    document.querySelector("#curuseremail").innerHTML = groups[curgroupindex].email;
    document.querySelector("#curuserid").innerHTML = groups[curgroupindex].id;
    document.querySelector("#curuserphone").innerHTML = groups[curgroupindex].phone;
    document.querySelector("#curusercountry").innerHTML = groups[curgroupindex].country;
    document.querySelector("#curusercity").innerHTML = groups[curgroupindex].city;
    document.querySelector("#curuserip").innerHTML = groups[curgroupindex].IP;
    if (mutedids.indexOf(groups[curgroupindex].id) != -1)
        document.querySelector(".mutebtn").innerHTML = "Unmute this conversation";
    else
        document.querySelector(".mutebtn").innerHTML = "Mute this conversation";
    if (groups[curgroupindex].msgloaded == false)
        loadmsgs(groups[curgroupindex].id);
    else {
        showmsgs();
        if (groups[curgroupindex].messages.length != 0)
            checkforviewed(groups[curgroupindex].messages[groups[curgroupindex].messages.length - 1].id);
    }
}
function loadmsgs(id) {
    connection.invoke("getMessageof", id).catch(function (err) {
        return console.error(err.toString());
    })
}
function putgrouptofirst(id) {
    var mydiv=document.querySelector("#chatdata").querySelector("[data='" + id + "']");
    if (mydiv != document.querySelector("#chatdata")) {
        document.querySelector("#chatdata").insertBefore(mydiv, document.querySelector("#chatdata").firstChild);
    }
}
function showmsgs() {

    for (var i = 0; i < groups[curgroupindex].messages.length; i++) {
        var msg = groups[curgroupindex].messages[i];
        var id = msg.userid;
        if (id != null) {
            id = myid;
        }
        switch (msg.msgType) {
            case 0:
                msgbox.addData(id, msg.message, msg.id);
                break;
            case 1:
                msgbox.addfileData(id, msg.message, msg.filename, msg.id);
                break;
            case 2:
                msgbox.addaudiofileData(id, msg.message, msg.id);
                break;
        }
    }
}

function checkforviewed(msg) {
    if (windowVisible) {
        connection.invoke("seenbyUser", msg, groups[curgroupindex].id).catch(function (err) {
            return console.error(err.toString());
        });
    }
    else {
        document.querySelector("#newnotaudio").play();
        lastmsg = msg;
        onwindowvisible = () => {
                    connection.invoke("seenbyUser", lastmsg, groups[curgroupindex].id).catch(function (err) {
                        return console.error(err.toString());
                    });

        };
    }
}

function displayAnonymUsers(id, name,ip,country,city,active,lasttime,msgseen,newuser) {
    const elem = document.createElement("div");
    elem.classList = "singlechatlistitem";

    elem.setAttribute("data", id);
    var activetext;
    if (active == true) {
        activetext = "<i class='fas fa-dot-circle'></i>  Active";
    }
    else {
        activetext = lasttime;
    }
    var nam = name;
    if (newuser == true) {
        nam += "<span class='newUser'>New User</span>";
    }
    else if (msgseen == false) {
        nam += "<span class='newMessage'>New Message</span>";
    }
    elem.innerHTML += "<div class='chatname'>" + name + "</div><div class='chatstatus'>" + activetext + "</div>";
    elem.addEventListener("click", function (e) {
        for (var i = 0; i < groups.length; i++){
            if (elem.getAttribute("data") == groups[i].id) {
                curgroupindex = i;
                break;
            }
        }
        groupIDChanged();


    });
    document.querySelector("#chatdata").insertBefore(elem, document.querySelector("#chatdata").firstChild);
}

function loaddata() {
    connection.invoke("getcanneds").catch(function (err) {
        return console.error(err.toString());
    })
    connection.invoke("GetAllAnonymousUserGroup").catch(function (err) {
        return console.error(err.toString());
    }).then(() => {
        connection.invoke("Getmyid").catch(function (err) {
            return console.error(err.toString());
        })
    });
}



class Scrollbar {
    //var cursor;
    //var scrollarea;
    //var scrollbar;
    //Mouse position on first click on cursor
    //var initialmousepos;
    //Bool to find whether cursor is dragged
    //var thumbdrag;
    //Global mousedown variable to handle dragout
    //var mouseup=true;
    //cursor position
    //var curpos;
    //height of cursor
    //var cursorheight;
    //scrollable seen height
    //var seenscrollheight;
    //scroll top position
    //var scrollTopPos;
    //total scrollable height
    //var totalscroll;
    setvariables() {
        this.totalscroll = this.scrollarea.scrollHeight;
        this.scrollTopPos = this.scrollarea.scrollTop;
        this.seenscrollheight = this.scrollarea.getBoundingClientRect().height;
        this.cursorheight = this.seenscrollheight / this.totalscroll * this.seenscrollheight;
        this.curpos = ((this.scrollTopPos) / (this.totalscroll - this.seenscrollheight) * (this.seenscrollheight - this.cursorheight));
    }
    setcursor() {
        this.cursor.style.top = this.curpos + 'px';
    }
    drawcursor() {
        if (this.cursorheight > (this.seenscrollheight - 1) && this.cursorheight < (this.seenscrollheight + 1)) {
            this.scrollbar.style.display = 'none';
        }
        else {
            this.scrollbar.style.display = 'block';
            this.cursor.style.height = this.cursorheight + 'px';
        }
    }
    redo() {
        this.setvariables();
        this.scrollarea.scrollTop = this.scrollarea.scrollHeight;
        this.drawcursor();
        this.setcursor();
    }
    constructor(_scrollbar, _scrollarea, _cursor) {
        var _that = this;
        _that.mouseup = true;
        window.addEventListener("resize", function () {
            _that.setvariables();
            _that.drawcursor();
            _that.setcursor();
        });
        if (_scrollarea) {
            //objects initializing
            _that.scrollbar = _scrollbar;
            _that.scrollarea = _scrollarea;
            _that.cursor = _cursor;
            // javascript variable initializing 
            _that.curpos = 0;
            _that.setvariables();
            //rendering objects
            _that.setcursor();
            _that.drawcursor();
            //Adding events
            _that.cursor.addEventListener("mousedown", function (e) {
                _that.mouseup = false;
                if (_that.thumbdrag == true)
                    return;
                _that.thumbdrag = true;
                if (!_that.cursor.classList.contains("active"))
                    _that.cursor.classList.toggle("active");
                _that.initialmousepos = e.clientY;
                document.addEventListener("mousemove", function (e) {
                    if (_that.mouseup == true) {
                        return;
                    }
                    e = e || window.event;
                    window.getSelection().removeAllRanges();
                    if (_that.initialmousepos == e.clientY)
                        return;
                    _that.curpos += e.clientY - _that.initialmousepos;
                    if (_that.curpos < 0)
                        _that.curpos = 0;
                    if ((_that.curpos) > (_that.seenscrollheight - _that.cursorheight)) {
                        _that.curpos = _that.seenscrollheight - _that.cursorheight;
                    }
                    _that.setcursor();
                    _that.scrollarea.scrollTop += (e.clientY - _that.initialmousepos) * _that.seenscrollheight / _that.cursorheight;
                    //Here starts my trust issue with transform
                    //cursor.setAttribute("style","transform:translateY("+curpos+"px");
                    _that.initialmousepos = e.clientY;
                });
                document.addEventListener("mouseup", function (e) {
                    if (_that.mouseup == false) {
                        document.onmousemove = null;
                        document.onmouseup = null;
                        _that.thumbdrag = false;
                        _that.mouseup = true;
                        if (_that.cursor.classList.contains("active"))
                            _that.cursor.classList.remove("active");
                    }
                });
            });
            this.scrollarea.addEventListener("scroll", function () {
                _that.scrollTopPos = _scrollarea.scrollTop;
                _that.curpos = ((_that.scrollTopPos) / (_that.totalscroll - _that.seenscrollheight) * (_that.seenscrollheight - _that.cursorheight));
                _that.setcursor();
            });
        }
    }
}
class Messagebox {
    loadInitialData() {

    }
    reloadforuser(userid) {
        var user = this.usersStack.find(x => x.userid == userid);
        var allmsgs = this.singleMessageContainer.querySelectorAll("[userid='" + userid + "']");
        for (var i = 0; i < allmsgs; i++) {
            allmsgs.querySelector("img").setAttribute("src",user.imageloc);
            allmsgs.querySelector(".nametag").innerHTML = user.username;
        }
    }
    showistyping() {
    }
    addaudiofileData(user, link,msgid) {
        var itm = document.createElement("div");
        itm.setAttribute("msgid",msgid);
        var username = groups[curgroupindex].name;
        var userpic = "/images/defaultuserpic.png";
        itm.setAttribute("userid", user);

        if (user == myid) {
            itm.classList = "singleMessage currentuser";
            itm.innerHTML = "<img class='userpic' src='" + userpic + "'></img><div class='actualmessage'><div id='playctrls'><i id='playbtn' class='fas fa-play'></i><i id='pausebtn' class='fas fa-pause'></i></div><div class='info'></div><audio src=" + link + "></audio></div>";
        }
        else {
            itm.classList = "singleMessage anotheruser";

            if (username == null)
                itm.innerHTML = "<img class='userpic' src='" + userpic + "'></img><div class='nametag'>" + user + "</div><div class='actualmessage'><div id='playctrls'><i id='playbtn' class='fas fa-play'></i><i id='pausebtn' class='fas fa-pause'></i></div><div class='info'></div><audio src=" + link + "></audio></div>";
            else
                itm.innerHTML = "<img class='userpic' src='" + userpic + "'></img><div class='nametag'>" + username + "</div><div class='actualmessage'><div id='playctrls'><i id='playbtn' class='fas fa-play'></i><i id='pausebtn' class='fas fa-pause'></i></div><div class='info'></div><audio src=" + link + "></audio></div>";
        }
        var timeout = null;

        itm.querySelector("audio").addEventListener("loadedmetadata", () => {
            itm.querySelector("#playctrls").addEventListener("click", function (e) {
                console.log(itm);
                if (itm.querySelector("audio").duration > 0 && itm.querySelector("audio").paused) {
                    itm.querySelector("audio").play();
                    itm.querySelector('.info').innerHTML = parseInt(itm.querySelector("audio").currentTime / 60) + ":" + parseInt(itm.querySelector("audio").currentTime % 60) + " / " + parseInt(itm.querySelector("audio").duration / 60) + ":" + parseInt(itm.querySelector("audio").duration % 60);
                    itm.querySelector("#pausebtn").style.display = "block";
                    itm.querySelector("#playbtn").style.display = "none";
                }
                else {
                    itm.querySelector('.info').innerHTML = parseInt(itm.querySelector("audio").currentTime / 60) + ":" + parseInt(itm.querySelector("audio").currentTime % 60) + " / " + parseInt(itm.querySelector("audio").duration / 60) + ":" + parseInt(itm.querySelector("audio").duration % 60);
                    if (timeout != null)
                        clearInterval(timeout);
                    itm.querySelector("audio").pause();
                    itm.querySelector("#pausebtn").style.display = "none";
                    itm.querySelector("#playbtn").style.display = "block";
                }
            });
            itm.querySelector("audio").addEventListener("timeupdate", function (e) {
                itm.querySelector('.info').innerHTML = parseInt(itm.querySelector("audio").currentTime / 60) + ":" + parseInt(itm.querySelector("audio").currentTime % 60) + " / " + parseInt(itm.querySelector("audio").duration / 60) + ":" + parseInt(itm.querySelector("audio").duration % 60);
            });
            itm.querySelector("audio").addEventListener("ended", function (e) {
                itm.querySelector('.info').innerHTML = parseInt(itm.querySelector("audio").duration / 60) + ":" + parseInt(itm.querySelector("audio").duration % 60);
                itm.querySelector("#pausebtn").style.display = "none";
                itm.querySelector("#playbtn").style.display = "block";
            });
            itm.querySelector('.info').innerHTML = parseInt(itm.querySelector("audio").duration / 60) + ":" + parseInt(itm.querySelector("audio").duration % 60);
            itm.querySelector("#pausebtn").style.display = "none";
            itm.querySelector("#playbtn").style.display = "block";
        }, false);
        document.querySelector(".singleMessageContainer").insertBefore(itm, document.querySelector(".singleMessageContainer").lastChild);
        scroller.redo();
    }
    addData(user, message,msgid) {
        var itm = document.createElement("div");
        itm.setAttribute("msgid",msgid);
        var username = groups[curgroupindex].name;
        var userpic = "/images/defaultuserpic.png";
        username = groups[curgroupindex].name;
        itm.setAttribute("userid", user);
        if (user == myid) {
            itm.classList = "singleMessage currentuser";
            itm.innerHTML = "<img class='userpic' src='" + userpic + "'></img><div class='nametag'></div><div class='actualmessage'>" + message + "</div>";
        }
        else {
            itm.classList = "singleMessage anotheruser";
            if (username == null)
                itm.innerHTML = "<img class='userpic' src='" + userpic + "'></img><div class='nametag'>" + user + "</div><div class='actualmessage'>" + message + "</div>";
            else
                itm.innerHTML = "<img class='userpic' src='" + userpic + "'></img><div class='nametag'>" + username + "</div><div class='actualmessage'>" + message + "</div>";
        }
        document.querySelector(".singleMessageContainer").insertBefore(itm, document.querySelector(".singleMessageContainer").lastChild);

        scroller.redo();
        this.inputbox.editor.blur();
    }
    addfileData(user, link, filename, msgid) {
        var itm = document.createElement("div");
        itm.setAttribute("msgid", msgid);
        var username = groups[curgroupindex].name;
        var userpic = "/images/defaultuserpic.png";
        itm.setAttribute("userid", user);

        var ext = filename.slice(filename.length - 4, filename.length);
        var imgview = "";
        if (ext == ".jpg" || ext == ".png" || ext == ".bmp") {
            imgview = "<img class='picloc' src='" + link + "'/><br/>";
            itm.addEventListener("click", function () {
                document.querySelector("#bigimage").querySelector("img").setAttribute("src", itm.querySelector(".picloc").getAttribute("src"));
                document.querySelector("#bigimage").style.display = "flex";
            });
        }
        else
            imgview = "<a target='_blank' rel='noopener noreferrer' href=" + link + ">" + filename + "</a>";
        if (user == myid) {
            itm.classList = "singleMessage currentuser";
            itm.innerHTML = "<img class='userpic' src='" + userpic + "'></img><div class='actualmessage'>" + imgview + "</div>";
        }
        else {
            itm.classList = "singleMessage anotheruser";

            if (username == null)
                itm.innerHTML = "<img class='userpic' src='" + userpic + "'></img><div class='nametag'>" + user + "</div><div class='actualmessage'>" + imgview + "</div>";
            else
                itm.innerHTML = "<img class='userpic' src='" + userpic + "'></img><div class='nametag'>" + username + "</div><div class='actualmessage'>" + imgview + "</div>";
        }
        document.querySelector(".singleMessageContainer").insertBefore(itm, document.querySelector(".singleMessageContainer").lastChild);

        scroller.redo();
    }
    getfromlastData(count) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "api/userMessage/1/" + count);
        var that = this;
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status == 200) {
                    console.log(xhr.response);
                }
            }
        }
        xhr.send();
    }
    sendTextMessage(text) {
        connection.invoke("SendMessage", text, groups[curgroupindex].id).catch(function (err) {
            return console.error(err.toString());
        });
    }
    messageseenchanged(msg) {
        if (document.querySelector("#seentags").children[0].style.display == "none") {
            document.querySelector("#seentags").children[0].style.display == "block";
        }
        var msgdiv = document.querySelector("[msgid='" + msg + "']");
        if (msgdiv == null)
            return;
        var bdy = document.querySelector(".singleMessageContainer");
        var msgdivheight = msgdiv.getBoundingClientRect().bottom - bdy.getBoundingClientRect().top;
        var tag = document.querySelector("#seentags").children[0];
        document.querySelector("#seentags").children[0].style.display = "block";
        var top = parseInt(tag.style.top.slice(0, tag.style.top.length - 2));
            if (top < msgdivheight) {
                tag.style.top = msgdivheight + "px";
            }
    }
    constructor(bodybox, messagebox, id, inputbox) {
        this.bodybox = bodybox;
        this.usersStack = [];
        this.messagebox = messagebox;
        this.width = this.messagebox.getBoundingClientRect().width;
        this.mainpictre = this.messagebox.querySelector("#UserHeaderImage");
        this.singleMessageContainer = this.messagebox.querySelector(".singleMessageContainer");
        this.id = id;
        this.x = this.messagebox.getBoundingClientRect().x;
        this.y = this.messagebox.getBoundingClientRect().y;
        this.lastAddedID = null;
        var _that = this;
        this.imagedata = this.messagebox.querySelector(".imagedata");
        this.filedata = this.messagebox.querySelector(".filedata");
        this.inputbox = inputbox;
        this.iamtyping = false;
        this.canneds = [];
        this.recordbuttonexit = this.messagebox.querySelector(".recordbuttonexit");
        this.reorderbox = this.messagebox.querySelector(".reorderbox");
        this.soundInput = this.messagebox.querySelector("#soundInput");
        this.recordbutton = this.messagebox.querySelector("#recordbutton");
        this.recordstopbutton = this.messagebox.querySelector("#recordstopbutton");
        this.namecont = this.messagebox.querySelector(".namecont");
        this.thisusernameinput = this.messagebox.querySelector("#thisusernameinput");
        this.thisuserimageinput = this.messagebox.querySelector("#newimginput");
        this.cannedselectindex = 0;
        this.cannedseen = [];
        this.recordbuttonexit.addEventListener("click", function (e) {
            _that.reorderbox.style.display = "none";
            if (audisrecording != null) {
                stopRecording();
                if (_that.recordbutton.classList.contains("isrecording")) {
                    _that.recordbutton.classList.remove("isrecording");
                }
                if (_that.reorderbox.classList.contains("isrecording")) {
                    _that.reorderbox.classList.remove("isrecording");
                }
                _that.reorder = null;
                _that.audio = null;
            }
        });
        this.soundInput.addEventListener("click", function (e) {
            _that.reorderbox.style.display = "flex";
        });
        this.recordbutton.addEventListener("click", (e) => {
            if (!_that.recordbutton.classList.contains("isrecording")) {
                _that.recordbutton.classList += " isrecording";
                _that.reorderbox.classList += " isrecording";
                _that.recordstopbutton.classList += " isrecording";
                if (audsetup == false)
                    setupaud();

                startRecording();
            }
        });
        this.recordstopbutton.addEventListener("click", (e) => {
            if (_that.reorderbox.classList.contains("isrecording")) {
                _that.recordstopbutton.classList.remove("isrecording");
                stopRecording();
                _that.recordbutton.classList.remove("isrecording");
                clearInterval(micleveltimeout);

                /*

                */
            }
        });
        this.imagedata.addEventListener("change", function (e) {
            let formData = new FormData();
            formData.append("files", e.target.files[0]);
            formData.append("uid", myid);
            formData.append("anonid", groups[curgroupindex].id);
            fetch('/Group/fileupload', { method: "POST", body: formData });
        });
        this.inputbox.on("keyup", function (b, e) {
            _that.draghandled = false;
            var val = _that.inputbox.getText();
            var slashpos = -1;
            for (var i = val.length - 1; i >= 0; i--) {
                if (val[i] == "/") {
                    slashpos = i;
                    break;
                }
            }
            if (slashpos != -1) {
                if (e.keyCode == 13) {
                    _that.inputbox.setText(val.slice(0, slashpos) + _that.canneds[_that.cannedselectindex].longform);
                    document.querySelector("#cannedcont").innerHTML = "";
                    placeCaretAtEnd(e.target);
                    return;
                }
                else if (e.keyCode == 38) {
                    if (_that.cannedselectindex != 0) {
                        _that.cannedselectindex--;
                        var childlength = document.querySelector("#cannedcont").children.length;
                        for (var i = 0; i < childlength; i++) {
                            if (_that.cannedselectindex == i)
                                document.querySelector("#cannedcont").children[i].classList += " canselected";
                            else {
                                if (document.querySelector("#cannedcont").children[i].classList.contains("canselected"))
                                    document.querySelector("#cannedcont").children[i].classList.remove("canselected");
                            }
                        }
                    }
                    return;
                }
                else if (e.keyCode == 40) {
                    if (_that.cannedselectindex != _that.cannedseen.length - 1) {
                        _that.cannedselectindex++;
                        var childlength = document.querySelector("#cannedcont").children.length;

                        for (var i = 0; i < childlength; i++) {
                            if (_that.cannedselectindex == i)
                                document.querySelector("#cannedcont").children[i].classList += " canselected";
                            else {
                                if (document.querySelector("#cannedcont").children[i].classList.contains("canselected"))
                                    document.querySelector("#cannedcont").children[i].classList.remove("canselected");
                            }
                        }

                    }
                    return;
                }
                document.querySelector("#cannedcont").innerHTML = "";

                var mytexts = val.slice(i, val.length);
                for (var i = 0; i < _that.canneds.length; i++) {
                    if (_that.canneds[i].length < mytexts.length)
                        continue;
                    var j = 0;
                    for (j = 0; j < mytexts.length; j++) {
                        if (mytexts[j].toLowerCase() != _that.canneds[i].shortform[j].toLowerCase())
                            break;
                    }
                    if (j == mytexts.length) {
                        _that.cannedseen.push(i);
                        document.querySelector("#cannedcont").style.display = "block";
                        const ndiv = document.createElement("div");
                        ndiv.classList += "singlecan";
                        ndiv.setAttribute("data", i);
                        ndiv.setAttribute("data-pos", slashpos);
                        ndiv.addEventListener("click", function (ee) {
                            console.log(ee.target);
                            var txt = _that.inputbox.getText();
                            var ind = parseInt(ee.target.getAttribute("data"));
                            var splash = parseInt(ee.target.getAttribute("data-pos"));
                            _that.inputbox.setText(txt.slice(0, splash) + _that.canneds[ind].longform);
                            document.querySelector("#cannedcont").innerHTML = "";
                            placeCaretAtEnd(e.target);
                        });
                        ndiv.innerHTML = "<div class='cannedshort'>" + _that.canneds[i].shortform + "</div><div class='cannedlong'>" + _that.canneds[i].longform + "</div>";
                        document.querySelector("#cannedcont").appendChild(ndiv);
                    }

                }
                for (var i = 0; i < document.querySelector("#cannedcont").children.length; i++) {
                    if (_that.cannedselectindex == i)
                        document.querySelector("#cannedcont").children[i].classList += " canselected";
                    else {
                        if (document.querySelector("#cannedcont").children[i].classList.contains("canselected"))
                            document.querySelector("#cannedcont").children[i].classList.remove("canselected");
                    }
                }
            }
            else {
                _that.cannedselectindex = 0;
                document.querySelector("#cannedcont").innerHTML = "";
                document.querySelector("#cannedcont").display = "none";
            }

            if (e.key == "Enter") {
                if (e.shiftKey) {
                    //e.preventDefault();
                    //placeCaretAtEnd(e.target);
                    return;
                }

                console.log("text " + _that.inputbox.getText());
                _that.sendTextMessage(_that.inputbox.getText());
                _that.inputbox.setText("");
            }
        });
        this.inputbox.on("focus", function (b, e) {
            if (_that.iamtyping == false) {
                _that.iamtyping = true;
                connection.invoke("isTyping", groups[curgroupindex].id).catch(function (err) {
                    return console.error(err.toString());
                });
            }
        });
        this.inputbox.on("blur", function (b, e) {
            if (_that.iamtyping == true) {
                _that.iamtyping = false;
                connection.invoke("stoppedTyping", groups[curgroupindex].id).catch(function (err) {
                    return console.error(err.toString());
                });
            }
        });
        this.loadInitialData();

       
    }

}
var msgbox, scroller;
document.addEventListener("DOMContentLoaded", function () {
    $("#textInput").emojioneArea({
        pickerPosition: "top",
        tonesStyle: "bullet",
        left: "100px"
    });
    msgbox = new Messagebox(document.querySelector("#overlaywrapper"), document.querySelector("#MessageboxMainContainer"), "2", $("#textInput")[0].emojioneArea);
    scroller = new Scrollbar(msgbox.messagebox.querySelector(".scrollbarcontainer"), msgbox.messagebox.querySelector(".singleMessageScroller"), msgbox.messagebox.querySelector(".scrollbar"));
    window.addEventListener("dragover", function (e) {
        e = e || event;
        e.preventDefault();
    }, false);
    window.addEventListener("drop", function (e) {
        e = e || event;
        e.preventDefault();
    }, false);
    document.querySelector("body").addEventListener("dragover", function (e) {
        document.querySelector(".addFileOVerlay").style.display = "flex";
        if (e.x > document.querySelector(".addFileOVerlay").getBoundingClientRect().left &&
            e.x < document.querySelector(".addFileOVerlay").getBoundingClientRect().right &&
            e.y > document.querySelector(".addFileOVerlay").getBoundingClientRect().top &&
            e.y < document.querySelector(".addFileOVerlay").getBoundingClientRect().bottom) {
            document.querySelector(".addFileOVerlay").innerHTML = "Now drop it!";
        }
        else {
        }
        document.querySelector("body").addEventListener("dragleave", function () {
            setTimeout(() => {
                document.querySelector(".addFileOVerlay").style.display = "none";
                document.querySelector(".addFileOVerlay").innerHTML = "Drop file(s) here!";
            }, 1000);
        });
    });
    document.querySelector("#seentags").children[0].style.top = "0px";
    document.querySelector(".addFileOVerlay").addEventListener("drop", dropHandler);
    //document.querySelector("#bigimagecross").addEventListener("click", function () {
    //    document.querySelector("#bigimage").style.display = "none";
    //});
    //document.querySelector("#chatsviewbutton").addEventListener("click", function () {
    //    document.querySelector(".chatview").style.display = "none";
    //    document.querySelector("#seentags").children[0].style.top = "0px";
    //    document.querySelector("#seentags").children[0].style.display = "none";
    //    curgroupindex = -1;
    //    document.querySelector(".chatsview").style.display = "block";
    //});
    document.querySelector(".mutebtn").addEventListener("click", function () {
        if (curgroupindex == -1)
            return;
        if (mutedids.indexOf(groups[curgroupindex].id) == -1) {
            mutedids.push(groups[curgroupindex].id);
            document.querySelector(".mutebtn").innerHTML = "Unmute this conversation";

        } else {
            mutedids.splice(mutedids.indexOf(groups[curgroupindex].id), 1);
            document.querySelector(".mutebtn").innerHTML = "Mute this conversation";

        }
    });
    document.querySelector(".deletebtn").addEventListener("click", function () {
        if (curgroupindex == -1)
            return;
        if(!document.querySelector(".msgboxInputcontainer").classList.contains("inactive")){
            document.querySelector(".msgboxInputcontainer").classList+=" inactive";
        }
        connection.invoke("deleteUser", groups[curgroupindex].id).catch(function (err) {
            return console.error(err.toString());
        });
    });
    document.querySelector("#chartshowbtn").addEventListener("click", function () {
        connection.invoke("getMessageCount").catch(function (err) {
            return console.error(err.toString());
        });
        connection.invoke("getIntrudersCount").catch(function (err) {
            return console.error(err.toString());
        });
        connection.invoke("getChatsCount").catch(function (err) {
            return console.error(err.toString());
        });
        connection.invoke("getMonthlyData").catch(function (err) {
            return console.error(err.toString());
        });
        document.querySelector(".statscont").style.display = "block";
    });
    document.querySelector(".statscont").addEventListener("click", function (e) {
        if (e.target == document.querySelector(".statscont")) {
            document.querySelector(".statscont").style.display = "none";
        }
    });
    document.querySelector("#bigimage").addEventListener("click", function (e) {
        if (e.target == document.querySelector("#bigimage")) {
            document.querySelector("#bigimage").style.display = "none";
        }
    });

});
function dropHandler(ev) {
    console.log('File(s) dropped');

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (var i = 0; i < ev.dataTransfer.items.length; i++) {
            // If dropped items aren't files, reject them
            if (ev.dataTransfer.items[i].kind === 'file') {
                var file = ev.dataTransfer.items[i].getAsFile();
                let formData = new FormData();
                formData.append("files", file);
                formData.append("uid", myid);
                formData.append("anonid", groups[curgroupindex].id);
                fetch('/Group/fileupload', { method: "POST", body: formData });
            }
        }
    } else {
        // Use DataTransfer interface to access the file(s)
        for (var i = 0; i < ev.dataTransfer.files.length; i++) {
            console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
        }
    }
    document.querySelector(".addFileOVerlay").style.display = "none";

}

let gumStream, rec, input, URL, audioContext, audisrecording = false, audsetup=false;
function setupaud() {
    audsetup = true;
    URL = window.URL || window.webkitURL;
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext;
}

function startRecording() {
    audisrecording = true;
    var constraints = {
        audio: true,
        video: false
    }

    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        console.log("getUserMedia() success, stream created, initializing Recorder.js ...");
        /* assign to gumStream for later use */
        gumStream = stream;
        /* use the stream */
        input = audioContext.createMediaStreamSource(stream);
        /* Create the Recorder object and configure to record mono sound (1 channel) Recording 2 channels will double the file size */
        rec = new Recorder(input, {
            numChannels: 1
        })
        //start the recording process 
        rec.record()
        console.log("Recording started");
    }).catch(function (err) {
    });
}
function stopRecording() {
    audisrecording = false;

    console.log("stopButton clicked");
    rec.stop(); //stop microphone access 
    gumStream.getAudioTracks()[0].stop();
    rec.exportWAV(createDownloadLink);
}

function createDownloadLink(blob) {
    var url = URL.createObjectURL(blob);
    var au = document.createElement('audio');
    var li = document.createElement('li');
    var link = document.createElement('a');
    //add controls to the <audio> element 
    au.controls = true;
    au.src = url;
    //link the a element to the blob 
    link.href = url;
    link.download = new Date().toISOString() + '.wav';
    link.innerHTML = link.download;
    //add the new audio and a elements to the li element 
    li.appendChild(au);
    li.appendChild(link);
    //add the li element to the ordered list 
    var filename = new Date().toISOString();
    //filename to send to server without extension 
    //upload link 
    var upload = document.createElement('a');
    upload.href = "#";
    upload.innerHTML = "Upload";
    let formData = new FormData();
    formData.append("files", blob, filename);
    formData.append("uid", myid);
    formData.append("anonid", groups[curgroupindex].id);
    fetch('/Group/audioupload', { method: "POST", body: formData }).then(() => {
        msgbox.reorder = null;
        msgbox.audio = null;
        if (msgbox.reorderbox.classList.contains("isrecording")) {
            msgbox.reorderbox.classList.remove("isrecording");
        }
    });
    li.appendChild(document.createTextNode(" ")) //add a space in between 
    li.appendChild(upload) //add the upload link to li
    //recordingsList.appendChild(li);
}
function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined"
        && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}