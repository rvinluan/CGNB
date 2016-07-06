/*
/ Node.
/ A Node is usually a Program, Enemy, or Wall.
*/
function Node(command) {
    this.x = null
    this.y = null
    this.id = Math.random() * new Date().getTime(); //lol for now
    this.command = command
    this.untyped = this.command // Tracks what's already been typed (for next char)
    this.typed = ""
    this.energized = ""
    this.focused = true // Tracks focused state (unfocused programs are ignored)
    this.active = false
    this.auto = false // Tracks whether only focused program for autocompletion & styling
    this.running = 0

    this.mainFill = null // Default, overriden by type of node
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
      console.log("doing it w/ " + char)
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
    push();
    translate(this.getLocation().x, this.getLocation().y);
    fill(lerpColor(this.mainFill, color(255,255,255), this.running))
    if (this.running > 0) {
      this.running-=0.03
    }
    strokeWeight(1);
    stroke(109,175,187)
    if (this.active) { fill(109,175,187) }
    textSize(13)
    if (this.auto) {
      //stroke(color(0, 255, 0))
    } else if (this.focused) {
      stroke(109,175,187)
    } else {
      stroke(42,41,44)
    }

    var width = Board.gridTileSize/1.5
    var height = Board.gridTileSize/3
    var padding = 7
    rect(0,0,width,height);
    
    textFont("Inconsolata")
    var charNum = this.command.length
    var currentPos = - charNum*3

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
    if (this.focused) {
      fill(109,175,187)
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