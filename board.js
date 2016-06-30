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
}

//number of tiles in the grid (each direction)
//total size is Board.gridSize^2
Board.gridSize = 20;
//pixel dimensions of each side of a tile
Board.gridTileSize = 500 / Board.gridSize;

Board.commands = ["debug", "ddos", "crack", "cypher", "hack", "corrupt", "horse", "root", "virus"]

Board.prototype.init = function() {
  for(var i = 0; i < 5; i++) {
    var n = new Program();
    this.nodes.push( n );
    this.connections[n.callSign] = [];
    if(i > 0) {
      //connect this node to a random previous node
      //Open Question: is this the right way to store connections?
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
    this.connections[n].forEach(p => p.render());
  }
  this.nodes.forEach(n => n.render());
  this.power.render()
  this.sparks.forEach(s => s.render())
}

Board.prototype.getID = function() {
  return this.currentID++
}

Board.prototype.removeSpark = function(spark) {
  var i = this.sparks.indexOf(spark)
  this.sparks.splice(i, 1)
}

Board.prototype.findPrograms = function(char) {
  
  var board = this;
  var matchedPrograms = []
  var unmatchedPrograms = []
  var inactivePrograms = false

  board.programs.forEach(function(program) {
    
    if (!program.active) { inactivePrograms = true }
    // If a program is both active and matches the character
    if (program.active && program.is_match(char)) {
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
      // Otherwise set it as inactive
      program.setInactive()
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
    this.loc = {x:this.x*Board.gridTileSize, y:this.y*Board.gridTileSize}
    this.callSign = Board.commands.splice(Math.floor(random(Board.commands.length)),1).toString()
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
    stroke(161,178,167);
    strokeWeight(3)
    var gss = Board.gridTileSize;
    //this algorithm always travels x first, then y
    line( this.previous.x*gss, this.previous.y*gss, this.next.x*gss, this.previous.y*gss);
    line( this.next.x*gss, this.previous.y*gss, this.next.x*gss, this.next.y*gss);
}

/*
/ Program. Extends Node.
*/

Program.prototype = new Node()
Program.prototype.constructor = Program

function Program(command) {
  Node.call(this)

  command = this.callSign

  this.command = command // Initial command
  this.untyped = command // Tracks what's already been typed (for next char)
  this.typed = ""
  this.energized = ""
  this.active = true // Tracks active state (inactive programs are ignored)
  this.auto = false // Tracks whether only active program for autocompletion & styling
  this.running = 0
  
  currentBoard.programs.push(this) // Adds to set of programs on screen
}

Program.prototype.reset = function(char) {
  this.untyped = this.command
  this.typed = ""
  this.energized = ""
  this.active = true
  this.auto = false
}

// Sets the object to inactive and redraws
Program.prototype.setInactive = function() {
  if (this.active) {
    this.active = false
    this.untyped = this.command
    this.typed = ""
    var program = this
    this.energized.split('').forEach(function(char) {
      console.log("doing it w/ " + char)
      currentBoard.power.createSpark(char, program, true); 
      
    })
    this.energized = ""
  }
}

// Sets the object to autocomplete and redraws
Program.prototype.setAuto = function(char) {
  this.auto = true
}

// Checks if the next untyped character matches the argument
Program.prototype.is_match = function(char) {
  return (this.untyped.charAt(0) == char)
}

// Accepts a new character and removes the first untyped character, then redraws
Program.prototype.typeChar = function(char) {
  // If the next untype character matches the argument
  if (this.untyped.charAt(0) == char) {
    // Remove the next letter from untype
    this.untyped = this.untyped.substr(1)
    this.typed += char
  }
}

Program.prototype.receiveChar = function(char) {
  if (this.typed.charAt(0) == char) {
    // Remove the next letter from untype
    this.typed = this.typed.substr(1)
    this.energized += char
  }
  if (this.typed.length == 0 && this.untyped.length == 0) {
    // Run this command
    this.run()
    return true
  }
}

// Placeholder for running the program. Resets everything.
Program.prototype.run = function() {
  console.log("Running: '" + this.command + "'")
  this.running = 1;
  // Reset everything
  currentBoard.resetAll()
}

Program.prototype.render = function() {
    push();
    translate(this.loc.x, this.loc.y);
    fill(lerpColor(color(26,21,26), color(255,255,255), this.running))
    if (this.running > 0) {
      this.running-=0.03
    }
    strokeWeight(3);
    stroke(109,175,187)
    textSize(22)
    if (this.auto) {
      //stroke(color(0, 255, 0))
    } else if (this.active) {
      stroke(109,175,187)
    } else {
      stroke(42,41,44)
    }

    var width = Board.gridTileSize*5
    var height = Board.gridTileSize*2
    var padding = 13
    rect(0,0,width,height);
    
    textFont("Inconsolata")
    var charNum = this.command.length
    var currentPos = - charNum*6

    noStroke();
    fill(255);
    for (let char of this.energized) {
      text(char, currentPos, 6)
      currentPos += padding
    }
    fill(100);
    for (let char of this.typed) {
      text(char, currentPos, 6)
      currentPos += padding
    }
    if (this.active) {
      fill(109,175,187)
    } else {
      fill(42,41,44)
    }
    for (let char of this.untyped) {
      text(char, currentPos, 6)
      currentPos += padding
    }

    pop();
}