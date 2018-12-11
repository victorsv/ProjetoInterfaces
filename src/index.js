var allshapes = new Array();
var canvas;
var BB ;
var offsetX;
var offsetY;
var ctx;
var WIDTH;
var HEIGHT;
var cArray;
var nodes = 8;
var clicked;
var selected = -1;
var dists;
var next;

var startX;
var startY;

var floydCode = ["procedure FloydWarshall ()",
"for each edge (u,v)",
    "dist[u][v] ← w(u,v)",
   " next[u][v] ← v",
"for k from 1 to |V|",
    "for i from 1 to |V|",
        "for j from 1 to |V|",
           "if dist[i][j] > dist[i][k] + dist[k][j] then",
                "dist[i][j] ← dist[i][k] + dist[k][j]",
                "next[i][j] ← next[i][k]"]

function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

// handle mousedown events
function myDown(e) {

    // tell the browser we're handling this mouse event
    e.preventDefault();
    e.stopPropagation();
    var dist = 999;
    var dist2;
    var count = 0;
    var closest = 0;

    // get the current mouse position
    var mx = parseInt(e.clientX - offsetX);
    var my = parseInt(e.clientY - offsetY);

    allshapes.forEach (function(shape){
        dist2 = Math.sqrt(Math.pow(Math.abs(mx-shape[0]), 2)+Math.pow(Math.abs(my-shape[1]), 2));
        if (dist2 < dist){
            dist = dist2;
            closest = count;
        }
        count++;
    });
    if (dist > 20){
        clicked = 0;
    } else selected = closest;
    // save the current mouse position
    startX = mx;
    startY = my;
}


// handle mouseup events
function myUp(e) {  
    e.preventDefault();
    e.stopPropagation();
    selected = -1;
}

// handle mouse moves
function myMove(e) {
    if (selected != -1) {
        e.preventDefault();
        e.stopPropagation();
        var mx = parseInt(e.clientX - offsetX);
        var my = parseInt(e.clientY - offsetY);

        var dx = mx - startX;
        var dy = my - startY;

        allshapes[selected][0] += dx;
        allshapes[selected][1] += dy;
        startX = mx;
        startY = my;

    }
}

function startup(){
    //Clear and make Array
    cArray = 0;
    cArray = createArray(nodes,nodes);

    for (i = 0; i < nodes; i++){
        for (j = 0; j < nodes; j++){
            cArray[i][j] = 999;
            cArray[j][i] = 999;
        }
    }
    for (i = 0; i < nodes; i++){
        var rj = Math.floor(Math.random()*nodes);
        while (rj == i){
            rj = Math.floor(Math.random()*nodes);
        }
        cArray[i][rj] = Math.floor(Math.random()*5)+1;
        cArray[rj][i] = cArray[i][rj];
    }

    for (i = 0; i < Math.floor((nodes-Math.random()*nodes)/2); i++){
        var rj = Math.floor(Math.random()*nodes);
        while (rj == i){
            rj = Math.floor(Math.random()*nodes);
        }
        cArray[i][rj] = Math.floor(Math.random()*5)+1;
        cArray[rj][i] = cArray[i][rj];
    }

    canvas = document.getElementById("canvas");
    BB = canvas.getBoundingClientRect();
    offsetX = BB.left;
    offsetY = BB.top;
    ctx = canvas.getContext('2d');
    WIDTH = canvas.width;
    HEIGHT = canvas.height;
    //Set nodes to random positions
    if (allshapes.length < nodes){
        for (i = allshapes.length; i < nodes; i++){
            var element = [25+Math.floor(Math.random()*((canvas.width-50)/30))*30,
                            25+Math.floor(Math.random()*((canvas.height-50)/30))*30];
            allshapes.push(element);
        }
    }
    if (allshapes.length > nodes){
        allshapes.length = nodes;
    }

}
function update(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var dist = 999;
    var dist2;
    var count = 0;
    var closest = 0;
    if (clicked == 1 && selected == -1){
        allshapes.forEach (function(shape){
            dist2 = Math.sqrt(Math.pow(Math.abs(clx-shape[0]), 2)+Math.pow(Math.abs(cly-shape[1]), 2));
            if (dist2 < dist){
                dist = dist2;
                closest = count;
            }
            count++;
        });
        console.log(closest, dist);
    }
    if (dist > 20){
        clicked = 0;
    } else selected = closest;
    
    if (clicked == 1 && selected != -1){
        allshapes[selected][0] = clx;
        allshapes[selected][1] = cly;
    }
    drawConnections(allshapes);
    drawCircle(allshapes);
    drawTags(allshapes);
    floydWarshallInstant();
}
function drawTags(shapes){
    var count = 1;
    shapes.forEach (function(shape){
        ctx.font = "18px Arial";
        ctx.fillStyle = "black";
        ctx.fillText(`${count}`, shape[0]-5 , shape[1]+5); 
        count++;
    });
}

function drawConnections(shapes){
    for (i = 0; i < nodes; i++){
        for (j = i; j < nodes; j++){
            if (cArray[i][j] != 999){
                var color = "#"+((1<<24)*((i*1.032342+j*1.014567)/(nodes*2))|0).toString(16);
                ctx.beginPath();
                ctx.moveTo(shapes[i][0], shapes[i][1]);
                ctx.lineTo(shapes[j][0], shapes[j][1]);
                ctx.lineWidth = 2;
                ctx.strokeStyle = color;
                ctx.stroke();
                var x_avg = (shapes[i][0]+shapes[j][0])/2;
                var y_avg = (shapes[i][1]+shapes[j][1])/2;

                ctx.font = "18px Arial";
                ctx.fillStyle = color;
                ctx.fillText(`${cArray[i][j]}`, x_avg , y_avg);
            }
        }
    }
}
function drawCircle(shapes) {
    shapes.forEach (function(shape){
        ctx.beginPath();
        ctx.arc(shape[0], shape[1], 15, 0, Math.PI*2, 1);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.stroke(); 
        ctx.fillStyle = " #9cc243";
        ctx.fill(); 
    });
}

function floydWarshallInstant(){
    dists = createArray(nodes,nodes);
    next = createArray(nodes,nodes);
    for (i = 0; i < nodes; i++){
        for (j = 0; j < nodes; j++){
            dists[i][j] = cArray[i][j];
            if (i == j){
                dists[i][j] = 999;
            }
        }
    }
    for (i = 0; i < nodes; i++){
        for (j = 0; j < nodes; j++){
            if (cArray[i][j] != 0){
                next[i][j] = j;
                next[j][i] = next[i][j];
            } else next[i][j] = -1;
        }
    }

    for (i = 0; i < nodes; i++){
        for (j = 0; j < nodes; j++){
            for (k = 0; k < nodes; k++){
                if (dists[i][j] > dists[i][k]+dists[k][j]){
                    dists[i][j] = dists[i][k]+dists[k][j];
                    next[i][j] = next[i][k];
                }
            }
        }
    }
    console.log(next);
}

function floydWarshallGradual(){
    var dists = createArray(nodes,nodes);
    var next = createArray(nodes,nodes);
    for (i = 0; i < nodes; i++){
        for (j = 0; j < nodes; j++){
            dists[i][j] = cArray[i][j];
        }
    }
    for (i = 0; i < nodes; i++){
        for (j = 0; j < nodes; j++){
            if (cArray[i][j] != 999){
                next[i][j] = j;
                next[j][i] = next[i][j];
            } else next[i][j] = -1;
        }
    }

    for (i = 0; i < nodes; i++){
        for (j = 0; j < nodes; j++){
            for (k = 0; k < nodes; k++){
                if (dists[i][j] > dists[i][k]+dists[k][j]){
                    dists[i][j] = dists[i][k]+dists[k][j];
                    next[i][j] = next[i][k];
                }
            }
        }
    }
    console.log(next);
}

function removeVertexAndRefresh(){
    nodes = Math.max(nodes-1,2);
    startup();
}
function addVertexAndRefresh(){
    nodes = Math.min(nodes+1,25);
    startup();
}

function createtable(){
    var body = document.getElementById('tables');
    var tbl  = document.createElement('table');
    tbl.style.width  = '100px';
    tbl.style.border = '1px solid black';
    var x = document.getElementById("visual");
    x.style.display = "none";
    for(var i = 0; i < nodes; i++){
        var tr = tbl.insertRow();
        for(var j = 0; j < nodes; j++){
            var td = tr.insertCell();
            if (next[i][j] != 0){
                td.appendChild(document.createTextNode(next[i][j].toString()));
            } else td.appendChild(document.createTextNode("___"));
            td.style.border = '1px solid black';
        }
    }
    body.appendChild(tbl);
}

function showContent(selected){
    if (selected == 1){
        var x = document.getElementById("visual");
    }
    if (x.style.display === "none") {
        x.style.display = "block";
    } else x.style.display = "none";
}


function start(){
    startup();
    canvas.onmousedown = myDown;
    canvas.onmouseup = myUp;
    canvas.onmousemove = myMove;

    console.log(cArray);
    update();
    floydWarshallInstant();

    setInterval(function(){
        update();
    },1000/30);
}
