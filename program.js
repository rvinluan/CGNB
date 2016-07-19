/*
/ Program. Extends Node.
*/

Program.prototype = new Node()
Program.prototype.constructor = Program 

function Program(command) {
  Node.call(this, command)
  this.typeColor = color(109,175,187);
  this.argumentType = Enemy
}

Program.types = ["debug", "ddos", "crack", "cypher", "hack", "corrupt", "horse", "root", "virus"];

// Placeholder for running the program. Resets everything.
Program.prototype.run = function() {
  console.log("Running: '" + this.command + "'")
  this.running = 1;
  this.active = true
  // Reset everything
  currentBoard.resetAll()
  currentScreen.addPrompt(new Prompt(this))
  

  this.mainFill = color(109,175,187)
}