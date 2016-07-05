//TODO: don't generate nodes randomly
//TODO: write a generator function that ensures callSigns are unique
//TODO: implement travellers 
//TODO: make it so paths don't overlap?
    //or perhaps that will fix itself when we don't have a random layout
//TODO: more elegant sizing and positioning of the board relative to the canvas
//GENERAL NOTE: the random() functions used here are p5's random functions.
var random = function (min, max) {

  var rand = Math.random()

  if (arguments.length === 0) {
    return rand;
  } else
  if (arguments.length === 1) {
    if (arguments[0] instanceof Array) {
      return arguments[0][Math.floor(rand * arguments[0].length)];
    } else {
      return rand * min;
    }
  } else {
    if (min > max) {
      var tmp = min;
      min = max;
      max = tmp;
    }

    return rand * (max-min) + min;
  }
};

Array.prototype.randomIn = function() {
  return this[ Math.floor(Math.random() * this.length) ];
}


/*
/ The Board.
/ Contains a list of Nodes and their connections.
/
*/
function Board() {
  //nodes is just a list of nodes
  this.nodes = [];
  this.programs = []
  //connections is an object where keys are nodes and values are a list of paths that connect that node to other nodes
  //e.g. { node1: [Path, Path], node2: [Path], node3: [Path, Path, Path], node4: [Path] }
  this.connections = {};
  this.currentID = 0
  this.power = new Power(0,0,20)
  this.sparks = [];
  this.prompt = null;
  this.openNodes = [this.power];
  this.unplacedNodes = [];
}

//number of tiles in the grid (each direction)
//total size is Board.gridSize^2
Board.gridSize = 8;
//pixel dimensions of each side of a tile
Board.padding = 50;
Board.gridTileSize = (document.body.clientHeight - Board.padding*2) / Board.gridSize;

Board.commands = ["debug", "ddos", "crack", "cypher", "hack", "corrupt", "horse", "root", "virus"]

Board.prototype.init = function() {
  for(var i = 0; i < 20; i++) {
    var n = new Program( Board.commands.randomIn() );
    this.unplacedNodes.push( n );
  }
  this.openNewArea(this.openNodes[0], 0);
}

Board.prototype.render = function() {
  rectMode(CORNER);
  //draw the grid, for debug purposes
  translate(Board.padding,Board.padding);
  var gss = Board.gridTileSize;
  for(var i = 0; i < Board.gridSize; i++) {
    for(var j = 0; j < Board.gridSize; j++) {
      noFill();
      stroke(255,255,255,10); 
      rect(i * gss, j * gss, gss, gss);
    }
  }
  //for aesthetics
  rectMode(CENTER);
  //note that 0,0 is in the center of the coordinate system, 
  //since we will be expanding out from the center
  translate(Board.gridSize/2 * Board.gridTileSize, Board.gridSize/2 * Board.gridTileSize);
  for (n in this.connections) {
    this.connections[n].forEach(p => p.render());
  }
  this.nodes.forEach(n => n.render());
  this.power.render()
  this.sparks.forEach(s => s.render())
  // if (this.prompt != null) { this.prompt.render() }
}

/* LAYOUT GENERATION
//
// steps:
// 1) generate list of programs to be placed (unplacedNodes)
// 2) start at one of the open positions, in a direction
// 3) keep track of the nodes that have been placed in this branch so far (thisBranch)
// 4) pick a random direction, try to place a node there
//    4a) if you can't, that direction is ineligible, so remove it from the possible directions and try again until all directions are empty
//    4b) if there are no possible directions left, step backwards in the branch array to the previously placed nodes
//
// TODO: if you're all the way at the beginning, then SOL I guess? figure out what to do here.
// TODO: add open area points for navigation in the future
// TODO: add the chance that some random connections form when there is an adjacent node
*/
Board.prototype.openNewArea = function(whichNode, whichDirection) {
  var thisBranch = [whichNode];
  var lastVisited = thisBranch[0];
  for(var i = 0; i < this.unplacedNodes.length; i++) {
    var n = this.unplacedNodes[i];
    var possibleDirections = [0,1,2,3];
    var d = i == 0 ? whichDirection : possibleDirections.randomIn();
    var coord = this.relativeDirectionFrom(lastVisited.x, lastVisited.y, d);
    while(this.existsNodeAt(coord.x, coord.y) || this.isOutOfBounds(coord.x, coord.y)) {
      possibleDirections.splice(possibleDirections.indexOf(d), 1);
      if(possibleDirections.length > 0) {
        d = possibleDirections.randomIn();
        coord = this.relativeDirectionFrom(lastVisited.x, lastVisited.y, d);
      } else {
        possibleDirections = [0,1,2,3];
        lastVisited = thisBranch.pop();
        d = possibleDirections.randomIn();
        coord = this.relativeDirectionFrom(lastVisited.x, lastVisited.y, d);
      }
    }
    n.x = coord.x;
    n.y = coord.y;
    this.nodes.push(n);
    thisBranch.push(n);
    if(this.connections[n.id]) {
      this.connections[n.id].push[ new Path(lastVisited, n) ];
    } else {
      this.connections[n.id] = [ new Path(lastVisited, n) ];
    }
    lastVisited = n;
    console.log(this.connections);
  }
}

Board.prototype.relativeDirectionFrom = function(originX, originY, d) {
  var ro = {x: originX, y: originY};
  switch( d ) {
    case 0 : 
    //north
    ro.y -= 1;
    break;
    case 1 :
    //east
    ro.x += 1;
    break;
    case 2 :
    //south
    ro.y += 1;
    break;
    case 3 :
    //west
    ro.x -= 1;
    break;
  }
  return ro;
}

Board.prototype.existsNodeAt = function(x, y) {
  if(x == 0 && y == 0) {
    return true;
  }
  for(n in this.nodes) {
    if(this.nodes[n].x == x && this.nodes[n].y == y) {
      return true;
    }
  }
  return false;
}

Board.prototype.isOutOfBounds = function(x, y) {
  if (
    x < - Board.gridSize / 2 ||
    x > Board.gridSize / 2 || 
    y < - Board.gridSize / 2 ||
    y > Board.gridSize / 2
  ) { return true; }
    else {
      return false;
    }
}

Board.prototype.getID = function() {
  return this.currentID++
}

Board.prototype.addPrompt = function(prompt) {
  this.prompt = prompt
}

Board.prototype.removePrompt = function() {
  this.prompt = null
}

Board.prototype.removeSpark = function(spark) {
  var i = this.sparks.indexOf(spark)
  this.sparks.splice(i, 1)
}

Board.prototype.findPrograms = function(char) {
  
  var board = this;
  var matchedPrograms = []
  var unmatchedPrograms = []
  var unfocusedPrograms = false

  board.programs.forEach(function(program) {
    
    if (!program.focused) { unfocusedPrograms = true }
    // If a program is both focused and matches the character
    if (program.focused && program.is_match(char)) {
      matchedPrograms.push(program)
    } else {
      unmatchedPrograms.push(program)
    }

  })

  // If there's only one matched program, set it to autocomplete
  if (matchedPrograms.length == 1) {
    matchedPrograms[0].setAuto()
  }

  var finish = false;
  matchedPrograms.forEach(function(program) {
    // Send it the character (received by program.receiveChar())
    if (board.power.typeChar(char, program)) {
      finish = true
    }
  })

  if (finish) {
    return
  }

  if (matchedPrograms.length > 0) {
    unmatchedPrograms.forEach(function(program) {
      // Otherwise set it as unfocused
      program.unFocus()
    })
    return true
  } else {
    return false
  }
}

Board.prototype.resetAll = function() {
  this.programs.forEach(function(program) {
    program.reset()
  })
}

Board.prototype.runAuto = function() {
  var board = this
  this.programs.forEach(function(program) {
    if (program.auto) {
      program.run();
      board.resetAll()
    }
  })
}

/*
/ Node.
/ A Node is usually a Program, Enemy, or Wall.
*/
function Node() {
    this.x = Math.floor(random(-Board.gridSize/2, Board.gridSize/2));
    this.y = Math.floor(random(-Board.gridSize/2, Board.gridSize/2));
    this.id = Math.random() * new Date().getTime(); //lol for now
    //Open Question: should programs be a type/subclass of node or should a node contain a program as an instance variable?
    //this.type = 0;
    //this.program = null;
}

Node.prototype.getLocation = function() {
  return {x:this.x*Board.gridTileSize, y:this.y*Board.gridTileSize}
}

Node.prototype.render = function() {
    push();
    translate(this.x*Board.gridTileSize, this.y*Board.gridTileSize);
    noStroke();
    fill(255);
    rect(0,0,20,20);
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
    stroke(161,178,167);
    strokeWeight(3)
    var gss = Board.gridTileSize;
    //this algorithm always travels x first, then y
    line( this.previous.x*gss, this.previous.y*gss, this.next.x*gss, this.previous.y*gss);
    line( this.next.x*gss, this.previous.y*gss, this.next.x*gss, this.next.y*gss);
    //test?
    line( this.previous.x*gss, this.previous.y*gss, this.next.x*gss, this.next.y*gss);

}