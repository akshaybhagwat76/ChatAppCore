"use strict";


var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();
var myid;
var groupid;
var micleveltimeout;
var lastmsg;
var initialized = false;
var windowVisible = true;
var onwindowvisible = null;
connection.on("ReceiveMessage", function (group, user, message, msgid) {
    for (var i = 0; i < message.length - 2; i++) {
        if (message[i] == '\n')
            message = message.slice(0, i - 1) + "<br>" + message.slice(i + 1, message.length - 1);
    }
    //message = message.replace(/(?:\r\n|\r|\n)/g, '<br>');
    msgbox.addData(user, message, msgid);
    checkforviewed(msgid);
});
connection.on("yourid", function (id) {
    myid = id;
});
connection.on("Getgrpid", function (id) {
    groupid = id;
});
connection.on("adminstatus", function (id) {
    if (id == true) {
        document.querySelector(".Username").innerHTML = "Online";
        document.querySelector(".UserActiveStatus").innerHTML = "";
    }
    else {
        document.querySelector(".Username").innerHTML = "Offline";
        document.querySelector(".UserActiveStatus").innerHTML = "You still can send message";

    }

});
connection.on("istypingres", function (id, grpid) {
    if (id != myid) {
        document.querySelector("#istypingmsg").style.display = "flex";

        msgbox.typingseen = true;
        msgbox.showistyping();
    }
});
connection.on("istypingstoppedres", function (id, grpid) {
    if (id != myid) {
        document.querySelector("#istypingmsg").style.display = "none";

        msgbox.typingseen = false;
        msgbox.showistyping();
    }
});
connection.on("canneds", function (id) {
    msgbox.canneds = id;
});
connection.on("groupfilemsg", function (groupID, user, link, filename, msgid) {
    msgbox.addfileData(user, link, filename, msgid);
    checkforviewed(msgid);

});
connection.on("seenbyAdmin", function (msg) {
    msgbox.settopos(msg);
});
connection.on("groupaudiomsg", function (groupID, user, link, msgid) {
    msgbox.addaudiofileData(user, link, msgid);
    checkforviewed(msgid);

});


function checkforviewed(msg) {
    if (windowVisible) {
        connection.invoke("seenbyAnonym", msg).catch(function (err) {
            return console.error(err.toString());
        });
    }
    else {
        document.querySelector("#newnotaudio").play();
        lastmsg = msg;
        onwindowvisible = () => {
            connection.invoke("seenbyAnonym", lastmsg).catch(function (err) {
                return console.error(err.toString());
            });
        };
    }
}
connection.start().catch(function (err) {
    return console.log(err.toString());
});
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState == "visible") {
        if (onwindowvisible != null) {
            onwindowvisible();
        }
        windowVisible = true;
    }
    else
        windowVisible = false;
});
function fetchdata() {
    connection.invoke("CreateAnonChat", document.querySelector("#inputname").value, document.querySelector("#inputemail").value, document.querySelector("#inputphone").value).catch(function (err) {
        return console.error(err.toString());
    }).then(() => {
        fetchuserdata();
        connection.invoke("getcanneds").catch(function (err) {
            return console.error(err.toString());
        })
        connection.invoke("isAdminActive").catch(function (err) {
            return console.error(err.toString());
        })
    });
}
function fetchuserdata() {
    connection.invoke("Getmyid").catch(function (err) {
        return console.error(err.toString());
    }).then(() => {
        connection.invoke("Getgrpid").catch(function (err) {
            return console.error(err.toString());
        });
    });
}
function groupmembersChanged() {
    if (groupmembers.length <= 1) {
        document.querySelector(".Username").innerHTML = "<h3 style='color: white; line-height: 10px;'>Offline</h3>";
        document.querySelector(".UserActiveStatus").innerHTML = "<h7 style='color: white; line-height: 10px;'>You still can leave message</h7>";
    }
    else {
        document.querySelector(".Username").innerHTML = "<h3 style='color: white; line-height: 10px;'>Online</h3>";
    }
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
    showistyping() { }
    reloadforuser(userid) {
        var user = this.usersStack.find(x => x.userid == userid);
        var allmsgs = this.singleMessageContainer.querySelectorAll("[userid='" + userid + "']");
        for (var i = 0; i < allmsgs; i++) {
            allmsgs.querySelector("img").src = user.imageloc;
            allmsgs.querySelector(".nametag").innerHTML = user.username;
        }
    }
    settopos(msg) {
        if (document.querySelector("#seentags").children[0].style.display == "none") {
            document.querySelector("#seentags").children[0].style.display == "block";
        }
        var msgdiv = document.querySelector("[msgid='" + msg + "']");
        if (msgdiv == null)
            return;
        var msgdivheight = msgdiv.getBoundingClientRect().bottom - document.querySelector(".singleMessageContainer").getBoundingClientRect().top;
        var tag = document.querySelector("#seentags").children[0];
        document.querySelector("#seentags").children[0].style.display = "block";

        if (tag.style.top == null)
            tag.style.top = "0px";
        var top = parseInt(tag.style.top.slice(0, tag.style.top.length - 2));
        if (top < msgdivheight) {
            tag.style.top = msgdivheight + "px";
        }
    }
    addaudiofileData(user, link, msgid) {
        var itm = document.createElement("div");
        itm.setAttribute("msgid", msgid);

        var username = "";
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
    addData(user, message, msgid) {
        var itm = document.createElement("div");
        itm.setAttribute("msgid", msgid);
        var username = "";
        var userpic = "/images/defaultuserpic.png";
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
        var me = document.querySelector(".singleMessageContainer").lastChild;
        document.querySelector(".singleMessageContainer").insertBefore(itm, me);

        scroller.redo();
        this.inputbox.editor.blur();

    }
    addfileData(user, link, filename, msgid) {
        var itm = document.createElement("div");
        itm.setAttribute("msgid", msgid);

        var username = "";
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
        connection.invoke("SendMessage", text, myid).catch(function (err) {
            return console.error(err.toString());
        });
    }
    constructor(bodybox, messagebox, id, inputbox) {
        this.bodybox = bodybox;
        this.usersStack = [];
        this.messagebox = messagebox;
        this.width = this.messagebox.getBoundingClientRect().width;
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
        this.settingView = this.messagebox.querySelector(".settingView");
        this.cancelname = this.messagebox.querySelector("#cancelname");
        this.savename = this.messagebox.querySelector("#savename");
        this.showoptionbtn = this.messagebox.querySelector("#showoptionbtn");
        this.thisusernameinput = this.messagebox.querySelector("#thisusernameinput");
        this.thisuserimageinput = this.messagebox.querySelector("#newimginput");
        this.cannedselectindex = 0;
        this.cannedseen = [];
        document.querySelector(".startchat").addEventListener("click", function () {
            var name = document.querySelector("#inputname").value;
            var email = document.querySelector("#inputemail").value;
            if (name == "" && email == "") {
                document.querySelector("#notnullmsg").innerHTML = "Name and email must not be null";
            }
            else if (name == "") {
                document.querySelector("#notnullmsg").innerHTML = "Name must not be null";
            }
            else if (name == "") {
                document.querySelector("#notnullmsg").innerHTML = "Email must not be null";
            }
            else {
                document.querySelector("#MessageboxMainContainer").classList = "";
                fetchdata();
            }
        });
        this.showoptionbtn.addEventListener("click", function () {

            _that.thisusernameinput.value = (_that.usersStack.find(x => x.userid == myid)).username;
            if (!_that.namecont.classList.contains("nameactive")) {
                _that.namecont.classList += " nameactive";
            }
        });
        this.bodybox.querySelector("#MessageboxHeader").addEventListener("click", function (e) {
            console.log(e.target);
            if (!initialized) {
                initialized = true;
            }
            if (e.target == _that.bodybox.querySelector("#MessageboxHeader")) {
                if (!_that.bodybox.classList.contains("inactive"))
                    _that.bodybox.classList += " inactive";
                else
                    _that.bodybox.classList.remove("inactive");
            }
        });
        this.cancelname.addEventListener("click", function () {
            if (_that.namecont.classList.contains("nameactive")) {
                _that.namecont.classList.remove("nameactive");
            }
        });
        this.savename.addEventListener("click", function () {
            _that.savename.style.pointerEvents = "none";
            _that.cancelname.style.pointerEvents = "none";
            connection.invoke("addusername", groupid, _that.thisusernameinput.value).catch(function (err) {
                return console.error(err.toString());

            }).then(() => {
                _that.savename.style.pointerEvents = "all";
                _that.cancelname.style.pointerEvents = "all";
                _that.namecont.classList.remove("nameactive");
            });
        });
        this.thisuserimageinput.addEventListener("change", function (e) {
            let formData = new FormData();
            formData.append("files", e.target.files[0]);
            formData.append("anonid", myid);
            _that.showoptionbtn.setAttribute("disabled", "disabled");
            fetch('/Group/userimageupload', { method: "POST", body: formData }).then(() => {
                _that.showoptionbtn.removeAttribute("disabled", "disabled");
            });
        });
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
            formData.append("anonid", myid);
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
                connection.invoke("isTyping", groupid).catch(function (err) {
                    return console.error(err.toString());
                });
            }
        });
        this.inputbox.on("blur", function (b, e) {
            if (_that.iamtyping == true) {
                _that.iamtyping = false;
                connection.invoke("stoppedTyping", groupid).catch(function (err) {
                    return console.error(err.toString());
                });
            }
        });

        this.loadInitialData();

    }
}
var msgbox, scroller;
document.addEventListener("DOMContentLoaded", function () {
    //jQuery.noConflict();
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
    document.querySelector(".addFileOVerlay").addEventListener("drop", dropHandler);
    document.querySelector("#bigimagecross").addEventListener("click", function () {
        document.querySelector("#bigimage").style.display = "none";
    });
    document.querySelector("#seentags").children[0].style.top = "0px";
    document.querySelector(".singleMessageContainer").innerHTML = "<div class='singleMessage anotheruser' id='istypingmsg'><div class='userpic'></div><div class='actualmessage'><div class='nametag'>Nabin</div><div class='typing' id='istypingbox'><div class='first'></div><div class='second'></div><div class='third'></div></div></div></div>";
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
                formData.append("anonid", myid);
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

let gumStream, rec, input, URL, audioContext, audisrecording = false, audsetup = false;
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
    formData.append("anonid", myid);
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