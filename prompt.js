function Prompt(program) {
  this.program = program
  this.animationState = 0;
  this.loc = {x: 0, y: 200}
  this.width = Board.gridTileSize*6
  this.height = Board.gridTileSize*0.8
  this.currentPos = -this.width/2+20
  this.padding = 13
  this.argumentType = program.argumentType
  this.argument = ""
}

Prompt.prototype.render = function() {
  var prompt = this
  push()

  // reset currentPos
  prompt.currentPos = -prompt.width/2+20

  translate(prompt.loc.x, prompt.loc.y)
  stroke(255)
  strokeWeight(3)
  fill(26,21,26)
  rect(0,0, prompt.width, prompt.height)
  fill(255)
  noStroke()
  textFont("Inconsolata")
  textSize(22)
  fill(109,175,187)
  text(">", prompt.currentPos, 6)
  prompt.currentPos += 20

  prompt.program.command.split('').forEach(function(char, i) {
    prompt.currentPos += prompt.padding
    text(char, prompt.currentPos, 6)
  })

  prompt.currentPos += 35

  var argColor = color(255)
  if (prompt.argumentType == Enemy) {
    argColor = color(172,96,75)
  }

  fill(argColor)
  text(">", prompt.currentPos, 6)

  prompt.currentPos += 20

  prompt.argument.split('').forEach(function(char, i) {
    prompt.currentPos += prompt.padding
    text(char, prompt.currentPos, 6)
  })

  pop()
}

Prompt.prototype.newChar = function(char) {
  if (currentScreen.listener.findNodes(char)) {
    this.argument += char
  }
}