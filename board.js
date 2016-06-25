//TODO: don't generate nodes randomly
//TODO: write a generator function that ensures callSigns are unique
//TODO: implement travellers 
//TODO: make it so paths don't overlap?
    //or perhaps that will fix itself when we don't have a random layout
//TODO: more elegant sizing and positioning of the board relative to the canvas

//GENERAL NOTE: the random() functions used here are p5's random functions.

/*
/ The Board.
/ Contains a list of Nodes and their connections.
/
*/
function Board() {
    //nodes is just a list of nodes
    this.nodes = [];
    //connections is an object where keys are nodes and values are a list of paths that connect that node to other nodes
    //e.g. { node1: [Path, Path], node2: [Path], node3: [Path, Path, Path], node4: [Path] }
    this.connections = {};
}

//number of tiles in the grid (each direction)
//total size is Board.gridSize^2
Board.gridSize = 20;
//pixel dimensions of each side of a tile
Board.gridTileSize = 500 / Board.gridSize;

Board.prototype.init = function() {
    for(var i = 0; i < 5; i++) {
        var n = new Node();
        this.nodes.push( n );
        this.connections[n.callSign] = [];
        if(i > 0) {
            //connect this node to a random previous node
            this.connections[n.callSign].push( new Path(n, this.nodes[ Math.floor(random(i)) ]) );
        }
    }
}

Board.prototype.render = function() {
    rectMode(CORNER);
    //draw the grid, for debug purposes
    translate(50,50); //padding
    var gss = Board.gridTileSize;
    for(var i = 0; i < Board.gridSize; i++) {
        for(var j = 0; j < Board.gridSize; j++) {
            noFill();
            stroke(0,0,0,14); 
            rect(i * gss, j * gss, gss, gss);
        }
    }
    //for aesthetics
    rectMode(CENTER);
    //note that 0,0 is in the center of the coordinate system, 
    //since we will be expanding out from the center
    translate(Board.gridSize/2 * Board.gridTileSize, Board.gridSize/2 * Board.gridTileSize);
    for (n in this.connections) {
        this.connections[n].forEach(path => path.render());
    }
    this.nodes.forEach(node => node.render());
}

/*
/ Node.
/ A Node is usually a Program, Enemy, or Wall.
*/
function Node() {
    this.x = Math.floor(random(-Board.gridSize/2, Board.gridSize/2));
    this.y = Math.floor(random(-Board.gridSize/2, Board.gridSize/2));
    this.callSign = "abcdefg".charAt(random(7)) + "123456789".charAt(random(9));
    //Open Question: should programs be a type/subclass of node or should a node contain a program as an instance variable?
    //this.type = 0;
    //this.program = null;
}

Node.prototype.render = function() {
    push();
    translate(this.x*Board.gridTileSize, this.y*Board.gridTileSize);
    noStroke();
    fill(255);
    rect(0,0,Board.gridTileSize,Board.gridTileSize);
    fill(0);
    text(this.callSign, 0, 10);
    pop();
}

/*
/ Path.
/ Connects two nodes.
/ Various things can travel along paths and animate along the length of them
/ until they reach their destination.
*/
function Path(previous, next) {
    this.previous = previous;
    this.next = next;
}

Path.prototype.render = function() {
    noFill();
    stroke(0);
    var gss = Board.gridTileSize;
    //this algorithm always travels x first, then y
    line( this.previous.x*gss, this.previous.y*gss, this.next.x*gss, this.previous.y*gss);
    line( this.next.x*gss, this.previous.y*gss, this.next.x*gss, this.next.y*gss);
}