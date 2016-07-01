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
  this.focused = true // Tracks focused state (unfocused programs are ignored)
  this.active = false
  this.auto = false // Tracks whether only focused program for autocompletion & styling
  this.running = 0

  this.mainFill = color(26,21,26);
  
  currentBoard.programs.push(this) // Adds to set of programs on screen
}

Program.prototype.reset = function(char) {
  this.untyped = this.command
  this.typed = ""
  this.energized = ""
  this.focused = true
  this.auto = false
}

// Sets the object to unfocused and redraws
Program.prototype.unFocus = function() {
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
    var program = this
    setTimeout(function() {
      program.run()  
      return true
    }, 200)
    
  }
}

// Placeholder for running the program. Resets everything.
Program.prototype.run = function() {
  console.log("Running: '" + this.command + "'")
  this.running = 1;
  // Reset everything
  currentBoard.resetAll()
  currentBoard.addPrompt(new Prompt(this))
  this.active = true

  this.mainFill = color(109,175,187)
}

Program.prototype.render = function() {
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