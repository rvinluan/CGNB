function Spark(char, node, returning) {
  this.char = char
  if (returning == true) { 
    this.start = createVector(node.getLocation().x, node.getLocation().y)
    this.end = createVector(0,0)
    this.returning = true
    this.active = false
  } else {
    this.node = node
    this.start = createVector(0,0)
    this.end = createVector(node.getLocation().x, node.getLocation().y)
    this.active = true
  }
  
  this.loc = this.start.copy()
  this.speed = 4
  this.distance = this.start.dist(this.end)
  this.velocity = this.end.copy().sub(this.start).normalize().mult(this.speed)
  this.moving = true
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
  

  if (this.loc.dist(this.end) < this.speed) {
    
    if (this.returning) {
      currentBoard.power.energy += 1
    } else {
      this.node.receiveChar(this.char)
    }

    this.moving = false
    currentBoard.removeSpark(this)
  }

  this.checkActive()
}

Spark.prototype.checkActive = function() {
  if (this.active && this.node.focused == false) {
    this.active = false

    this.end = createVector(0,0)
    this.start = this.loc
    this.distance = this.start.dist(this.end)
    this.velocity = this.end.sub(this.start).normalize().mult(this.speed)

    this.returning = true
    
  }
}

Spark.prototype.setReturn = function() {
  this.returning = true
}