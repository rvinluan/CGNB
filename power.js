function Power(x, y, energy) {
  this.x = x;
  this.y = y;
  this.energy = energy
  this.maxEnergy = energy
  this.char = ""
  this.fade = 255
  this.recharge = 0;
  this.rechargeRate = 60;
  this.charMatch = true;
  this.id = Math.random() * new Date().getTime();
}

Power.prototype.render = function() {
  push()
  translate(this.x,this.y)
  noFill()
  strokeWeight(3)
  stroke(255,255,255); 
  ellipse(0,0,80,80)
  if (this.charMatch) {
    fill(255,255,255,this.fade)
  } else {
    fill(38,32,37)
  }
  noStroke()
  this.drawEnergy()
  textAlign(CENTER)
  textSize(22)
  textFont("Inconsolata")
  text(this.char,0,5)
  this.fade-=10
  this.recharge++
  if (this.recharge > this.rechargeRate) {
    this.recharge = 0;
    if (this.energy < this.maxEnergy) {
      this.energy++
    }
  }
  pop()
}

Power.prototype.drawEnergy = function() {
  var energyRadius = 30;
  var energySize = 5;
  var energy = this.energy
  push()
  translate(this.x, this.y)
  fill(255,255,255)
  for (var i = 0; i<this.maxEnergy; i++) {
    var radians = (-i * 360/this.maxEnergy-90) * (Math.PI/180)
    var x = energyRadius*cos(radians)
    var y = energyRadius*sin(radians)
    if (i + 1 > energy) {
      fill(38,32,37)
    }
    ellipse(x, y, energySize, energySize)
  }

  pop()
}

Power.prototype.newChar = function(char) {
  if (this.energy > 0) {
    this.char = char
    this.fade = 255
    if (currentScreen.listener.findNodes(char)) {
      this.charMatch = true
      this.energy--
      this.recharge = 0
    } else {
      this.charMatch = false
    }
  }
}

Power.prototype.typeChar = function(char, program) {
  this.createSpark(char, program)
  return program.typeChar(char)
}

Power.prototype.createSpark = function(char, program, returning) {
  currentBoard.sparks.push(new Spark(char, program, returning))
}
