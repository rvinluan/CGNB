/*
/ Enemy. Extends Node.
*/

Enemy.prototype = new Node()
Enemy.prototype.constructor = Enemy

function Enemy(command) {
  Node.call(this, command)
  this.typeColor = color(172,96,75);
}

Enemy.types = ["hacker", "trojan", "beast", "boolean", "bug"];

// Placeholder for running the Enemy. Resets everything.
Enemy.prototype.run = function() {
  console.log("Running: '" + this.command + "'")
  this.running = 1;
  this.active = true
  // Reset everything
  currentBoard.resetAll()
  currentScreen.removePrompt()
  

  this.mainFill = color(109,175,187)
}