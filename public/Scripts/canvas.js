canvas = document.getElementById('canvas');
context = canvas.getContext("2d");
var lastI = -1;
var checkpoints = [];
var socket = io.connect("http://localhost:3000");

let dict = {};

console.log(username);

var clickX = [];
var clickY = [];
var clickDrag = [];
var paint = false;
var colorPurple = "#AB47BC";
var colorGreen = "#659b41";
var colorBlue = "#005ce6";
var colorYellow = "#FFC107";
var colorBrown = "#5D4037";

var currentColor = colorPurple;
var clickColor = new Array();


var clickSize = new Array();
var currentSize = 3;

var clickTool = new Array();
var currentTool = "crayon";
var crayonTextureImage = new Image();

var game = new Game();
let word= game.getRandomWord();
const info = {};
info["clickX"] = clickX;
info["clickY"] = clickY;
info["clickDrag"] = clickDrag;
info["clickColor"] = clickColor;
info["clickSize"] = clickSize;
info["clickTool"] = clickTool;
info["checkpoints"] = checkpoints;
info["lastI"] = lastI;
info["paint"] = paint;
info["currentColor"] = currentColor;
info["currentSize"] = currentSize;
info["currentTool"] = currentTool;
game.displayChat();
game.seatPlayers();

socket.emit("addUser", roomname,info,word);

var send_button = document.getElementById("send");  //?????????????????


crayonTextureImage.onload = function() {
    redraw();
};
crayonTextureImage.src = "images/crayon-texture.png";//"images/Red.svg.png";  //"images/crayon-texture.png";

document.getElementById("color1").addEventListener("click", function() {
    clearColorBoxes();
    document.getElementById("color1").style.backgroundImage = "url('../images/checker.png')";
    currentColor = colorPurple;
});

document.getElementById("color2").addEventListener("click", function() {
    clearColorBoxes();
    document.getElementById("color2").style.backgroundImage = "url('../images/checker.png')";
    currentColor = colorBlue;
});

document.getElementById("color3").addEventListener("click", function() {
    clearColorBoxes();
    document.getElementById("color3").style.backgroundImage = "url('../images/checker.png')";
    currentColor = colorGreen;
});
document.getElementById("color4").addEventListener("click", function() {
    clearColorBoxes();
    document.getElementById("color4").style.backgroundImage = "url('../images/checker.png')";
    currentColor = colorYellow;
});
document.getElementById("color5").addEventListener("click", function() {
    clearColorBoxes();
    document.getElementById("color5").style.backgroundImage = "url('../images/checker.png')";
    currentColor = colorBrown;
});

document.getElementById("slide-bar").addEventListener("change", function(){
    currentSize = parseInt(document.getElementById("range").innerHTML);
});

document.getElementById("tool-crayon").addEventListener("click", function() {
    resetTools();
    document.getElementById("tool-crayon").style.backgroundImage = "url('../images/crayon-selected.png')";
    currentTool = "crayon";
});
document.getElementById("tool-pen").addEventListener("click", function() {
    resetTools();
    document.getElementById("tool-pen").style.backgroundImage = "url('../images/pen-selected.png')";
    currentTool = "pen";
});
document.getElementById("tool-eraser").addEventListener("click", function() {
    resetTools();
    document.getElementById("tool-eraser").style.backgroundImage = "url('../images/eraser-selected.png')";
    currentTool = "eraser";
});


document.getElementById("canvas").addEventListener("mousedown", mouseDown);
document.getElementById("canvas").addEventListener("mousemove", mouseMove);
document.getElementById("canvas").addEventListener("mouseup", mouseUp);
document.getElementById("canvas").addEventListener("mouseleave", mouseLeave);
document.getElementById("clear").addEventListener("click", clearClicked);
document.getElementById("undo").addEventListener("click", undoClicked);




/*
 * თუ Chat და Canvas ობიექტებთან მხოლოდ Game-ს მეშვეობით უნდა გვქონდეს წვდომა, მაშინ ასე უნდა დავწეროთ ალბათ?
 * */
send_button.addEventListener('click', function(){
    var message = document.getElementById("message_input");
    game.emitMessage(socket, message);
});

socket.on('player-message', function(data){
    // if(game.checkWord(data.message) == true) {
    //     alert("guessed");
    //     socket.emit("clear");
    //     //game.increaseScore(player)
    // }
    game.displayMessage({id:username,message:data.message,score:data.score});
});

socket.on('word-message', function(data){
    console.log("in");
    // if(game.checkWord(data.message) == true) {
    //     alert("guessed");
    //     socket.emit("clear");
    //     //game.increaseScore(player)
    // }
    game.displayMessage({id:"SERVER",message:"Your word is: " + data,score: 0});
});

socket.on('guess-message', function(data){
    game.displayMessage({id:"SERVER",message:"CORRECT GUESS" ,score: data.score});

});

socket.on('newWord', function(){
    console.log(socket.id);
    let newWord = game.getRandomWord();
    socket.emit('new-word',newWord);
});

socket.on('adduser', function(data,id,roomdata){
    dict = roomdata;

    redraw();
});

socket.on('disconnect',function(data, id){
   dict = data;
   context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
   redraw();
});




function mouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    var mouseX = (e.pageX - rect.left)*scaleX;
    var mouseY = (e.pageY - rect.top)*scaleY;
    socket.emit('mouseDown', {
        x:mouseX,
        y:mouseY,
        color: currentColor,
        size: currentSize,
        tool: currentTool
    });
}

socket.on('mouseDown', function(data,id) {
    console.log('down');
    // var mouseX = data.x;
    // var mouseY = data.y;
    //
    // const inf = dict[id];
    // inf["checkpoints"].push(inf["lastI"]);
    // inf["currentColor"] = data.color;
    // inf["currentSize"] = data.size;
    // inf["currentTool"] = data.tool;
    // inf["paint"] = true;
    // currentColor = data.color;
    // currentSize = data.size;
    // currentTool = data.tool;
    // paint = true;
    // checkpoints.push(lastI);
    // addClick(mouseX, mouseY,false, id);
    dict = data;

    redraw();
});

//------Mouse move
function mouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    var mouseX = (e.pageX - rect.left)*scaleX;
    var mouseY = (e.pageY - rect.top)*scaleY;

    socket.emit('mouseMove', {
        x: mouseX,
        y: mouseY
    });
}


socket.on('mouseMove', function(data,id){
    console.log('MOUSE MOVE');
    dict = data;
    const inf = dict[id];
    if(inf["paint"] ){
        // console.log("adding");
        // addClick(data.x, data.y, true,id);
        redraw();
    }
});



//--------Mouse up
function mouseUp(e) {
    socket.emit('mouseUp');
}

socket.on('mouseUp', function(data, id){
    dict = data;
});

//---------Mouse leave
function mouseLeave(e) {
    socket.emit('mouseLeave');
}

socket.on('mouseLeave', function(data, id){
    dict = data;

});

function clearClicked(e) {
    socket.emit('clear');
}

function undoClicked(e) {
    socket.emit('undo');
}

socket.on('clear', function(data,id){
    console.log('CLEAR');
    dict = data;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
    // const inf = dict[id];
    // inf["clickX"] = [];
    // inf["clickY"] = [];
    // inf["clickDrag"] = [];
    // inf["clickColor"] = [];
    // inf["clickSize"] = [];
    // inf["clickTool"] = [];
    redraw();
});

socket.on('undo', function(data, id){
    console.log('UNDO');
    dict = data;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
    // if(inf["checkpoints"].length === 0 ){
    //     redraw();
    //     return;
    // }
    // inf["lastI"] = inf["checkpoints"][inf["checkpoints"].length-1];
    // // console.log(clickX.length);
    // // console.log(lastI);
    // inf["clickX"] = inf["clickX"].slice(0,inf["lastI"]+1);
    // // console.log(clickX.length);
    // inf["clickY"] = inf["clickY"].slice(0,inf["lastI"]+1);
    // inf["clickDrag"] = inf["clickDrag"].slice(0,inf["lastI"]+1);
    // inf["clickColor"] = inf["clickColor"].slice(0, inf["lastI"]+1);
    // inf["clickSize"] = inf["clickSize"].slice(0, inf["lastI"]+1);
    // inf["clickTool"] = inf["clickTool"].slice(0, inf["lastI"]+1);
    // inf["checkpoints"] = inf["checkpoints"].slice(0,inf["checkpoints"].length-1);
    redraw();

});


function addClick(x, y, dragging,id) {
    const inf = dict[id];
    inf["clickX"].push(x);
    inf["clickY"].push(y);
    inf["clickDrag"].push(dragging);
    // clickX.push(x);
    // clickY.push(y);
    // clickDrag.push(dragging);
    if(inf["currentTool"] === "eraser"){
        inf["clickColor"].push("white");
    } else{
        inf["clickColor"].push(inf["currentColor"]);
    }
    inf["clickSize"].push(inf["currentSize"]);
    inf["clickTool"].push(inf["currentTool"]);
}



function redraw(){
    //context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
    // context.strokeStyle = "#df4b26";
    context.lineJoin = "round";
    // context.lineWidth = 3;
    console.log("redrawing");

    for(var key in dict){
        const info = dict[key];
        console.log(info);
        console.log("asfsaf");
        for(var i=0; i < info["clickX"].length; i++) {
            context.beginPath();
            if(info["clickDrag"][i] && i){
                // console.log("clickX: ", clickX[i], "; clickY: ", clickY[i]);
                context.moveTo(info["clickX"][i-1], info["clickY"][i-1]);
            }else{
                context.moveTo((info["clickX"][i]-1), info["clickY"][i]);
            }
            context.lineTo(info["clickX"][i], info["clickY"][i]);
            context.closePath();
            context.strokeStyle = info["clickColor"][i];
            context.lineWidth = info["clickSize"][i];
            context.stroke();
            if(info["clickTool"][i] === "crayon") {
                context.globalAlpha = 0.4;
                context.drawImage(crayonTextureImage, info["clickX"][i-1]-info["clickSize"][i]/2, info["clickY"][i-1]-info["clickSize"][i]/2,
                    info["clickSize"][i], info["clickSize"][i]);
            }info["lastI"] = info["clickX"].length -1;
            context.globalAlpha = 1;
        }
        socket.emit('addLastI', info["clickX"].length -1);

    }


}


function clearColorBoxes() {
    document.getElementById("color1").style.backgroundImage = "none";
    document.getElementById("color2").style.backgroundImage = "none";
    document.getElementById("color3").style.backgroundImage = "none";
    document.getElementById("color4").style.backgroundImage = "none";
    document.getElementById("color5").style.backgroundImage = "none";
}

function resetTools() {
    document.getElementById("tool-eraser").style.backgroundImage = "url('../images/eraser.png')";
    document.getElementById("tool-pen").style.backgroundImage = "url('../images/pen.png')";
    document.getElementById("tool-crayon").style.backgroundImage = "url('../images/crayon.png')";
}