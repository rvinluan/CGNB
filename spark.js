function Spark(char, program) {
  this.char = char
  this.program = program
  this.start = createVector(0,0) //default to 0,0
  this.loc = this.start
  this.end = createVector(program.loc.x, program.loc.y)
  this.speed = 20
  this.distance = this.start.dist(this.end)
  this.velocity = this.end.sub(this.start).normalize().mult(2.5)
  this.moving = true
  this.active = true
  this.fade = 255
}

Spark.prototype.render = function() {
  if (this.moving == true) {
    this.loc = this.loc.add(this.velocity)  
    push()
    translate(0,0)
    // move towards location (linear so as to come in with the same speed)
    noStroke()
    fill(255,255,255,this.fade)
    ellipse(this.loc.x, this.loc.y,5,5)
    pop()

  }

  if (this.active == false) {
    this.fade-=10
    if (this.fade <= 0) {
      currentBoard.removeSpark(this)
    }
  } else if (this.loc.dist(this.end) > this.distance) {
    this.moving = false
    this.program.receiveChar(this.char)
    currentBoard.removeSpark(this)
  }

  this.checkActive()
}

Spark.prototype.checkActive = function() {
  if (this.program.active == false) {
    this.active = false
  }
}