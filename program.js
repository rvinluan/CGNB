/*
/ Program. Extends Node.
*/

Program.prototype = new Node()
Program.prototype.constructor = Program

function Program(command) {
  Node.call(this, command)

  this.mainFill = color(26,21,26);
  
  currentBoard.programs.push(this) // Adds to set of programs on screen
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