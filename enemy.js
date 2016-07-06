/*
/ Enemy. Extends Node.
*/

Enemy.prototype = new Node()
Enemy.prototype.constructor = Enemy

function Enemy(command) {
  Node.call(this, command)
  this.mainFill = color(172,96.75);
}

// Placeholder for running the Enemy. Resets everything.
Enemy.prototype.run = function() {
  console.log("Running: '" + this.command + "'")
  this.running = 1;
  // Reset everything
  currentBoard.resetAll()
  currentBoard.addPrompt(new Prompt(this))
  this.active = true

  this.mainFill = color(109,175,187)
}