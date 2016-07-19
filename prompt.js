function Prompt(program) {
  this.program = program
  this.animationState = 0;
  this.loc = {x: 0, y: 200}
  this.width = Board.gridTileSize*6
  this.height = Board.gridTileSize*0.8
  this.currentPos = -this.width/2+20
  this.padding = 13
  this.argumentType = program.argumentType
}

Prompt.prototype.render = function() {
  var prompt = this
  push()
  translate(this.loc.x, this.loc.y)
  stroke(255)
  strokeWeight(3)
  fill(26,21,26)
  rect(0,0, this.width, this.height)
  fill(255)
  noStroke()
  textFont("Inconsolata")
  textSize(22)
  text(">", -this.width/2+20, 6)

  fill(109,175,187)
  this.program.command.split('').forEach(function(char, i) {
    text(char, -prompt.width/2+45+i*prompt.padding, 6)
  })
  pop()
}

Prompt.prototype.newChar = function(char) {
  noStroke()
  textFont("Inconsolata")
  textSize(22)
  fill(255)
}