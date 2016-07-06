/*
/ Node.
/ A Node is usually a Program, Enemy, or Wall.
*/
function Node(command) {
    this.x = null
    this.y = null
    this.id = Math.random() * new Date().getTime(); //lol for now

    // The typing command associated with this node

    this.command = command

    // Typing purposes
    this.focused = true // Tracks focused state, changes based on typing

    this.untyped = this.command // Tracks untyped letters
    this.typed = "" // Tracks typed letters
    this.energized = "" // Tracks letters filled w/ energy

    this.active = false // If the program is currently in use

    this.typeColor = null // Color, overriden by type of node
}

Node.prototype.getUniqueName = function() {
    if (currentBoard.usedNodeNames[this.command]) {
      currentBoard.usedNodeNames[this.command]++
    } else {
      currentBoard.usedNodeNames[this.command] = 1
    }
    this.command = this.command + currentBoard.usedNodeNames[this.command]
    this.untyped = this.command
}

Node.prototype.getLocation = function() {
  return {x:this.x*Board.gridTileSize, y:this.y*Board.gridTileSize}
}

Node.prototype.reset = function(char) {
  this.untyped = this.command
  this.typed = ""
  this.energized = ""
  this.focused = true
  this.auto = false
}

// Sets the object to unfocused and redraws
Node.prototype.unFocus = function() {
  if (this.focused) {
    this.focused = false
    this.untyped = this.command
    this.typed = ""
    var program = this
    this.energized.split('').forEach(function(char) {
      currentBoard.power.createSpark(char, program, true); 
    })
    this.energized = ""
  }
}

// Sets the object to autocomplete and redraws
Node.prototype.setAuto = function(char) {
  this.auto = true
}

// Checks if the next untyped character matches the argument
Node.prototype.is_match = function(char) {
  return (this.untyped.charAt(0) == char)
}

// Accepts a new character and removes the first untyped character, then redraws
Node.prototype.typeChar = function(char) {
  // If the next untype character matches the argument
  if (this.untyped.charAt(0) == char) {
    // Remove the next letter from untype
    this.untyped = this.untyped.substr(1)
    this.typed += char
  }
}

Node.prototype.receiveChar = function(char) {
  if (this.typed.charAt(0) == char) {
    // Remove the next letter from untype
    this.typed = this.typed.substr(1)
    this.energized += char
  }
  if (this.typed.length == 0 && this.untyped.length == 0) {
    // Run this command
    var program = this
    setTimeout(function() {
      program.run()  
      return true
    }, 200)
    
  }
}

Node.prototype.render = function() {

    var width = Board.gridTileSize/1.5
    var height = Board.gridTileSize/3
    var padding = 7
    textSize(13)
    textFont("Inconsolata")
    

    push();
    translate(this.getLocation().x, this.getLocation().y);


    // Box
    
    strokeWeight(1);
    stroke(42,41,44)
    if (this.focused) { stroke(this.typeColor) } 

    fill(currentBoard.bgColor)
    if (this.active) { fill(this.typeColor) }

    rect(0,0,width,height);
    

    // Text

    noStroke();
    var charNum = this.command.length
    var currentPos = - charNum*3


    // Energized
    fill(255);
    for (let char of this.energized) {
      text(char, currentPos, 6)
      currentPos += padding
    }

    // Typed
    fill(100);
    for (let char of this.typed) {
      text(char, currentPos, 6)
      currentPos += padding
    }

    // Untyped
    if (this.focused) {
      fill(this.typeColor)
      if (this.active) { fill(26,21,26); }
    } else {
      fill(42,41,44)
    }
    for (let char of this.untyped) {
      text(char, currentPos, 6)
      currentPos += padding
    }

    pop();
}