var allshapes;
var canvas;
var BB;
var offsetX, offsetY;
var ctx;
var WIDTH, HEIGHT;
var cArray;
var nodes = 4;
var clicked;
var selected = -1;
var dists, next;
var fstep = 0;
var screenLeft, screenRight;
var pathElems;

var startX;
var startY;

function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

function resizecArray(length){
    if (cArray.length < length){
        while (cArray.length < length){
            cArray.push(new Array());
        }
        for (var i = 0; i < length; i++){
            while (cArray[i].length < length)
            cArray[i].push(999);
        }
    }
    if (cArray.length > length){
        while (cArray.length > length){
            cArray.pop();
        }
        for (var i = 0; i < length; i++){
            while (cArray[i].length > length)
            cArray[i].pop(999);
        }
    }
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
    next = createArray(nodes, nodes);
    pathElems = new Array();
    allshapes = new Array();

    for (i = 0; i < nodes; i++){
        for (j = 0; j < nodes; j++){
            cArray[i][j] = 999;
            cArray[j][i] = 999;
            next[i][j] = 999;
            next[j][i] = 999;
        }
    }
    //Make random connections so it's connected
    for (i = 0; i < nodes; i++){
        var rj = Math.floor(Math.random()*nodes);
        while (rj == i){
            rj = Math.floor(Math.random()*nodes);
        }
        cArray[i][rj] = Math.floor(Math.random()*5)+1;
        cArray[rj][i] = cArray[i][rj];
    }
    //Sprinkle some more connections
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
    updateNodes();

}

function updateNodes(argument) {
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

function checkDragging(){
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
}

function newEdge(){
    var edgeA = prompt("De", "Vertice...");
    var edgeB = prompt("Para", "Vertice...");
    var weight = prompt("De peso", "Peso...");
    if(isNaN(edgeA) || isNaN(edgeB) || isNaN(weight)){
        alert("Entrada invalida; Use apenas numeros inteiros.");
    } else if (edgeA === edgeB){
        alert("Entrada invalida; A deve ser diferente de B.");
    } else if(edgeA < 0 || edgeB < 0){
        alert("Entrada invalida; Use apenas numeros inteiros.");
    } else if(weight < 0){
        alert("Entrada invalida; Peso negativo.");
    }  else if(edgeA > nodes || edgeB > nodes){
        alert("Entrada invalida; Vertice inexistente");
    } else {
        cArray[parseInt(edgeA)][parseInt(edgeB)] = parseInt(weight);
        cArray[parseInt(edgeB)][parseInt(edgeA)] = parseInt(weight);
    }

}

function removeEdge(){
    var edgeA = prompt("De", "Vertice...");
    var edgeB = prompt("Para", "Vertice...");
    if(isNaN(edgeA) || isNaN(edgeB)){
        alert("Entrada invalida; Use apenas numeros inteiros.");
    } else {
        cArray[parseInt(edgeA)][parseInt(edgeB)] = 999;
        cArray[parseInt(edgeB)][parseInt(edgeA)] = 999;
    }

}

function update(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    checkDragging();
    drawConnections(allshapes);
    drawCircle(allshapes);
    drawTags(allshapes);
}
function drawTags(shapes){
    var count = 0;
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
                var color = "black";
                //var color = "#"+((1<<24)*((i*1.032342+j*1.014567)/(nodes*2))|0).toString(16);
                ctx.beginPath();
                ctx.moveTo(shapes[i][0], shapes[i][1]);
                ctx.lineTo(shapes[j][0], shapes[j][1]);
                ctx.lineWidth = 2;
                if (pathElems.includes(i) && pathElems.includes(j)){
                    ctx.strokeStyle = "orange";
                } else ctx.strokeStyle = "black";
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
    //Distance is the weight
    for (i = 0; i < nodes; i++){
        for (j = 0; j < nodes; j++){
            dists[i][j] = cArray[i][j];
            if (i == j) {
                dists[i][j] = 0;
            }
        }
    }
    for (i = 0; i < nodes; i++){
        for (j = 0; j < nodes; j++){
            if (cArray[i][j] != 999 && (i != j)){
                next[i][j] = j;
            } else next[i][j] = -1;
        }
    }

    for (k = 0; k < nodes; k++){
        for (i = 0; i < nodes; i++){
            for (j = 0; j < nodes; j++){
                if (dists[i][j] > dists[i][k]+dists[k][j]){
                    dists[i][j] = dists[i][k]+dists[k][j];
                    next[i][j] = next[i][k];
                }
            }
        }
    }
}

function floydWarshallSeq(step){
    dists = 0;
    next = 0;
    dists = createArray(nodes,nodes);
    next = createArray(nodes,nodes);
    //Distance is the weight
    for (i = 0; i < nodes; i++){
        for (j = 0; j < nodes; j++){
            dists[i][j] = cArray[i][j];
            if (i == j) {
                dists[i][j] = 0;
            }
        }
    }
    for (i = 0; i < nodes; i++){
        for (j = 0; j < nodes; j++){
            if (cArray[i][j] != 999 && (i != j)){
                next[i][j] = j;
            } else next[i][j] = -1;
        }
    }
    var count = 0;
    for (k = 0; k < nodes; k++){
        for (i = 0; i < nodes; i++){
            for (j = 0; j < nodes; j++){
                if (dists[i][j] > dists[i][k]+dists[k][j]){
                    dists[i][j] = dists[i][k]+dists[k][j];
                    next[i][j] = next[i][k];
                    count++;
                    if (count > step) {
                        console.log(next, step, count);
                        cleanup();
                        maketable();
                        return;
                    };
                }
            }
        }
    }
}

function removeVertexAndRefresh(){
    nodes = Math.max(nodes-1,2);
    resizecArray(nodes);
    updateNodes();
    console.log(cArray);
}
function addVertexAndRefresh(){
    nodes = Math.min(nodes+1,25);
    resizecArray(nodes);
    updateNodes();
    console.log(cArray);
}

function cleanup(){

    var body = document.getElementById('ntable');
    if (body){
        body.parentNode.removeChild(body);
    }

    body = document.getElementById("fcode");
    if (body){
        body.parentNode.removeChild(body);
    }
}

function buildPath(va, vb){
    floydWarshallInstant();
    pathElems = [];
    if (next[parseInt(va)][parseInt(vb)] == -1){
        alert("Nenhum caminho.");
        return;
    }
    pathElems.push(parseInt(va));
    while (va != vb){
        va = next[va][vb];
        pathElems.push(va);
    }
    console.log(pathElems);
    return pathElems;
}

function markpath(){
    var edgeA = prompt("De", "Vertice...");
    var edgeB = prompt("Para", "Vertice...");
    if(isNaN(edgeA) || isNaN(edgeB)){
        alert("Entrada invalida; Use apenas numeros inteiros.");
    } else if (edgeA === edgeB){
        alert("Entrada invalida; A deve ser diferente de B.");
    } else if(edgeA < 0 || edgeB < 0){
        alert("Entrada invalida; Use apenas numeros inteiros.");
    }  else if(edgeA > nodes || edgeB > nodes){
        alert("Entrada invalida; Vertice inexistente.");
    } else {
        buildPath(edgeA, edgeB);
    }

}

function maketable(){
    var body = document.getElementById('tables');
    var tbl  = document.createElement('table');
    tbl.setAttribute('id', "ntable");
    tbl.style.width = '100%';
    tbl.style.display = 'block';
    var tr = tbl.insertRow();
    var td = tr.insertCell();
    td.appendChild(document.createTextNode(" "));
    for(var i = 0; i < nodes; i++){
        var td = tr.insertCell();
        td.className = "decCell";
        td.appendChild(document.createTextNode(i.toString()));
    }
    for(var i = 0; i < nodes; i++){
        var tr = tbl.insertRow();
        var td = tr.insertCell();
        td.className = "decCell";
        td.appendChild(document.createTextNode(i.toString()));
        for(var j = 0; j < nodes; j++){
            var td = tr.insertCell();
            var ndiv = document.createElement("div");
            ndiv.className = "cellContent";
            if (next[i][j] != 0){
                ndiv.appendChild(document.createTextNode(next[i][j].toString()));
                td.appendChild(ndiv);
            } else {
                ndiv.appendChild(document.createTextNode("0"));
                td.appendChild(ndiv);
            }
        }
    }
    body.appendChild(tbl);
}

function createtable(){
    screenRight = "showTable";
    fstep = 0;
    cleanup();
    var body = document.getElementById('tables');
    if (!document.getElementById('nextbtn')){
        var button = document.createElement("button");
        button.className = "btn";
        button.setAttribute('id', "nextbtn");
        body.appendChild(button);
        button.innerHTML = "Passo a passo";
        button.addEventListener ("click", function() {
          button.innerHTML = "Proximo ("+(Math.pow(nodes,3)-fstep)+")";
          floydWarshallSeq(fstep);
          fstep++;
        });
    } else {
        document.getElementById('nextbtn').innerHTML = "Passo a passo";
    }
    maketable();
}

function showContent(selected){
    screenRight = "showAlgo";
    cleanup();
    floydWarshallInstant();
    if (selected == 1){
        var body = document.getElementById("visual");
        var code  = document.createElement('code');
        code.setAttribute('id', "fcode");
        if (body.style.display === "none") {
            body.style.display = "block";
            code.innerHTML= `<pre><code>function Floyd_Warshall ()
    for each edge (u,v)
        dist[u][v] <- w(u,v)
        next[u][v] <- v
    
    for k from 1 to |V|
        for i from 1 to |V|
            for j from 1 to |V|
                if dist[i][j] > dist[i][k] + dist[k][j] then
                    dist[i][j] <- dist[i][k] + dist[k][j]
                    next[i][j] <- next[i][k]
            </code></pre>`;
            body.appendChild(code);
        } else body.style.display = "none";
    }
}


function start(){
    startup();
    canvas.onmousedown = myDown;
    canvas.onmouseup = myUp;
    canvas.onmousemove = myMove;
    screenLeft = "showGraph";
    screenRight = "showAlgo";

    console.log(cArray);
    update();
    floydWarshallInstant();

    setInterval(function(){
        update();
    },1000/30);
}
