
var mdiv = document.createElement("DIV");
mdiv.innerHTML = "<script src='/jquery.min.js'></script><link href='https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css' rel='stylesheet'><link href='/emojionearea.min.css' rel='stylesheet'><input type='hidden' id='groupID' value='' /><link rel='stylesheet' href='/css/style.css'><link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.2/css/all.min.css'crossorigin='anonymous'><audio id='newnotaudio' style='display:none' src='/newnot.mp3'></audio><div id='bodyoverlay'><div id='bigimage'><img /><div id='bigimagecross'><i class='fas fa-times'></i></div></div><div id='overlaywrapper' class='inactive'><div id='MessageboxMainContainer' class='initquestactive' style='background:white; z-index:100;'><div class='actualmessagebody'><div id='MessageboxHeader'><div class='UserDetails'><div class='Username'>Lets talk</div><div class='UserActiveStatus'></div></div><div class='settingView'><div class='singlerow'><div id='profilepic'><input id='newimginput' type='file' accept='image/x-png,image/gif,image/jpeg' /><div class='pencilicon'><i class='fas fa-pencil-alt'></i></div><img /></div><div class='namecont'><div class='nameoptionscont'><div>Name</div><i class='fas fa-ellipsis-h' id='showoptionbtn'></i><i class='fas fa-check' id='savename'></i><i class='fas fa-times' id='cancelname'></i></div><div id='thisusername'></div><input id='thisusernameinput'></input></div></div></div></div><div class='msgboxBody'><div class='initialquests'><div class='textcont'>Name*</div><input class='textname' id='inputname' placeholder='Name'><div class='textcont'>Email*</div><input class='textname' id='inputemail' placeholder='Email' /><div class='textcont'>Phone</div><input class='textname' id='inputphone' placeholder='Phone' /><button class='startchat'>Start Chat</button><div id='notnullmsg'></div></div><div class='scrollbarcontainer'><div class='scrollbar'></div></div><div class='addFileOVerlay'>Drop file(s) here!</div><div class='scrollbaroverlay'><div class='singleMessageScroller'><div class='singleMessage1Container'><div id='seentags' style='top:0px;'><div class='singleseentag'><i class='fas fa-check-circle'></i></div></div><div class='singleMessageContainer'></div></div></div></div></div><div id='cannedcont'><div class='singlecan'><div class='cannedshort'></div><div class='cannedlong'></div></div><div class='singlecan'><div class='cannedshort'></div><div class='cannedlong'></div></div></div><div class='msgboxInputcontainer inactive'><div class='textareact'><textarea id='textInput' placeholder='Type message here....'></textarea></div><div class='inputsContainer'><div class='fileInput'><input type='file' class='imagedata' file accept='image/*'><i class='fas fa-paperclip' style='padding:6px'></i></div><div id='soundInput'><i class='fas fa-microphone' style='padding:6px'></i></div></div><div class='reorderbox'><div id='recordbutton'><i class='fas fa-microphone' style='padding:6px'></i></div><div class='recordstopbtncont'><div id='recordstopbutton' class='isrecording'><i class='fa fa-stop-circle' aria-hidden='true' style='padding:6px'></i></div></div><div class='recordbuttonexit'><i class='fas fa-times' id='cancelname'></i></div></div></div></div></div></div></div>";
document.body.insertBefore(mdiv, document.body.firstChild);
loadScript("https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js", loadmain);
loadScript("/emojionearea.js", loadmain);
loadScript("https://cdnjs.cloudflare.com/ajax/libs/recorderjs/0.1.0/recorder.js", loadmain);
loadScript("/lib/signalr/dist/browser/signalr.js", loadmain);
var loaded = 0;
function loadmain() {
    loaded++;
    if (loaded >= 4) {
            loadScript("/js/messsmain.js", () => {
                setup();
            });
    }
}

function loadScript(url, callback) {
    var script = document.createElement("script")
    script.type = "text/javascript";
    if (script.readyState) {  // only required for IE <9
        script.onreadystatechange = function () {
            if (script.readyState === "loaded" || script.readyState === "complete") {
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function () {
            callback();
        };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

