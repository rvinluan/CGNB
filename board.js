//TODO: don't generate nodes randomly
//TODO: write a generator function that ensures callSigns are unique
//TODO: implement travellers 
//TODO: make it so paths don't overlap?
    //or perhaps that will fix itself when we don't have a random layout
//TODO: more elegant sizing and positioning of the board relative to the canvas
//GENERAL NOTE: the random() functions used here are p5's random functions.

//begin helper functions

/**
 * PriorityQueue, from https://github.com/mburst/dijkstras-algorithm/blob/master/dijkstras.js
 */
function PriorityQueue () {
  this._nodes = [];

  this.enqueue = function (priority, key) {
    this._nodes.push({key: key, priority: priority });
    this.sort();
  }
  this.dequeue = function () {
    return this._nodes.shift().key;
  }
  this.sort = function () {
    this._nodes.sort(function (a, b) {
      return a.priority - b.priority;
    });
  }
  this.isEmpty = function () {
    return !this._nodes.length;
  }
}

var random = function (min, max) {

  var rand = Math.random()

  if (arguments.length === 0) {
    return rand;
  } else
  if (arguments.length === 1) {
    if (arguments[0] instanceof Array) {
      return arguments[0][Math.floor(rand * arguments[0].length)];
    } else {
      return rand * min;
    }
  } else {
    if (min > max) {
      var tmp = min;
      min = max;
      max = tmp;
    }

    return rand * (max-min) + min;
  }
};

Array.prototype.randomIn = function() {
  return this[ Math.floor(Math.random() * this.length) ];
}

//end helper functions

/*
/ The Board.
/ Contains a list of Nodes and their connections.
/
*/
function Board() {
  //nodes is just a list of nodes
  this.nodes = [];
  this.programs = []
  //connections is an object where keys are nodes and values are a list of paths that connect that node to other nodes
  //e.g. { node1: [Path, Path], node2: [Path], node3: [Path, Path, Path], node4: [Path] }
  this.connections = {};
  this.currentID = 0
  this.power = new Power(0,0,20)
  this.sparks = [];
  this.openNodes = [this.power];
  this.unplacedNodes = [];

  this.bgColor = color(26,21,26);

  this.usedNodeNames = {}
}

//number of tiles in the grid (each direction)
//total size is Board.gridSize^2
Board.gridSize = 8;
//pixel dimensions of each side of a tile
Board.padding = 50;
Board.gridTileSize = (document.body.clientHeight - Board.padding*2) / Board.gridSize;

Board.prototype.init = function() {
  
  for(var i = 0; i < 13; i++) {

    var node

    if (Math.random() > 0.3) { 
      command = Program.types.randomIn();
      node = new Program( command )
      node.getUniqueName()
    } else {
      command = Enemy.types.randomIn();
      node = new Enemy( command )
      node.getUniqueName()
    }
    
    this.unplacedNodes.push(node);
  }
  this.nodes.push(this.power);
  this.openNewArea(this.openNodes[0], 0);
}

Board.prototype.render = function() {
  rectMode(CORNER);
  //draw the grid, for debug purposes
  translate(Board.padding,Board.padding);
  var gss = Board.gridTileSize;
  for(var i = 0; i < Board.gridSize; i++) {
    for(var j = 0; j < Board.gridSize; j++) {
      noFill();
      stroke(255,255,255,10); 
      rect(i * gss, j * gss, gss, gss);
    }
  }
  //for aesthetics
  rectMode(CENTER);
  //note that 0,0 is in the center of the coordinate system, 
  //since we will be expanding out from the center
  translate(Board.gridSize/2 * Board.gridTileSize, Board.gridSize/2 * Board.gridTileSize);
  for (n in this.connections) {
    this.connections[n].forEach(p => p.render());
  }
  this.nodes.forEach(n => n.render());
  this.power.render()
  this.sparks.forEach(s => s.render())
}

/* LAYOUT GENERATION
//
// steps:
// 1) generate list of programs to be placed (unplacedNodes)
// 2) start at one of the open positions, in a direction
// 3) keep track of the nodes that have been placed in this branch so far (thisBranch)
// 4) pick a random direction, try to place a node there
//    4a) if you can't, that direction is ineligible, so remove it from the possible directions and try again until all directions are empty
//    4b) if there are no possible directions left, step backwards in the branch array to the previously placed nodes
//
// TODO: if you're all the way at the beginning, then SOL I guess? figure out what to do here.
// TODO: add open area points for navigation in the future
// TODO: add the chance that some random connections form when there is an adjacent node
*/
Board.prototype.openNewArea = function(whichNode, whichDirection) {
  var thisBranch = [whichNode];
  var lastVisited = thisBranch[0];
  for(var i = 0; i < this.unplacedNodes.length; i++) {
    var n = this.unplacedNodes[i];
    var possibleDirections = [0,1,2,3];
    var d = i == 0 ? whichDirection : possibleDirections.randomIn();
    var coord = this.relativeDirectionFrom(lastVisited.x, lastVisited.y, d);
    while(this.getNodeAt(coord.x, coord.y) || this.isOutOfBounds(coord.x, coord.y)) {
      possibleDirections.splice(possibleDirections.indexOf(d), 1);
      if(possibleDirections.length > 0) {
        d = possibleDirections.randomIn();
        coord = this.relativeDirectionFrom(lastVisited.x, lastVisited.y, d);
      } else {
        possibleDirections = [0,1,2,3];
        lastVisited = thisBranch.pop();
        d = possibleDirections.randomIn();
        coord = this.relativeDirectionFrom(lastVisited.x, lastVisited.y, d);
      }
    }
    n.x = coord.x;
    n.y = coord.y;
    this.nodes.push(n);
    thisBranch.push(n);
    this.connect(n, lastVisited);
    possibleDirections = [0,1,2,3];
    for(var j = 0; j < possibleDirections.length; j++) {
      var tryCoord = this.relativeDirectionFrom(n.x, n.y, possibleDirections[j]);
      var neighbor = this.getNodeAt(tryCoord.x, tryCoord.y);
      if(neighbor && Math.random() < 0.25) {
        this.connect(n, neighbor);
      }
    }
    lastVisited = n;
  }
}

Board.prototype.connect = function(a, b) {
  var pathBetween = new Path(a, b);
  if(this.connections[a.id]) {
    this.connections[a.id].push( pathBetween );
  } else {
    this.connections[a.id] = [ pathBetween ];
  }
  if(this.connections[b.id]) {
    this.connections[b.id].push( pathBetween );
  } else {
    this.connections[b.id] = [ pathBetween ];
  }
}

//Dijkstra's Algorithm
//from https://github.com/mburst/dijkstras-algorithm/blob/master/dijkstras.js
//returns an array of Path objects
Board.prototype.shortestPathBetween = function(startNode, endNode) {
  var nodeQueue = new PriorityQueue(),
      distances = {},
      previous = {},
      workingPath = [],
      smallest, vertex, neighbor, alt;

      for(vertex in this.connections) {
        if(vertex == startNode) {
          distances[vertex] = 0;
          nodeQueue.enqueue(0, vertex);
        }
        else {
          distances[vertex] = Infinity;
          nodeQueue.enqueue(Infinity, vertex);
        }

        previous[vertex] = null;
      }

      while(!nodeQueue.isEmpty()) {
        smallest = nodeQueue.dequeue();

        if(smallest == endNode) {
          while(previous[smallest]) {
            workingPath.push( this.getPathBetween(smallest, previous[smallest]) );
            smallest = previous[smallest];
          }

          break;
        }

        if(!smallest || distances[smallest] === Infinity){
          continue;
        }


        for(edge in this.connections[smallest]) {
          if(!this.connections[smallest].hasOwnProperty(edge)) {
            continue;
          }
          neighbor = this.connections[smallest][edge].otherEnd(smallest).id;
          alt = distances[smallest] + this.connections[smallest][edge].length;

          if(alt < distances[neighbor]) {
            distances[neighbor] = alt;
            previous[neighbor] = smallest;

            nodeQueue.enqueue(alt, neighbor);
          }
        }
      }

      return workingPath.reverse();
}

Board.prototype.relativeDirectionFrom = function(originX, originY, d) {
  var ro = {x: originX, y: originY};
  switch( d ) {
    case 0 : 
    //north
    ro.y -= 1;
    break;
    case 1 :
    //east
    ro.x += 1;
    break;
    case 2 :
    //south
    ro.y += 1;
    break;
    case 3 :
    //west
    ro.x -= 1;
    break;
  }
  return ro;
}

Board.prototype.getNodeAt = function(x, y) {
  for(n in this.nodes) {
    if(this.nodes[n].x == x && this.nodes[n].y == y) {
      return this.nodes[n];
    }
  }
  return null;
}

Board.prototype.isOutOfBounds = function(x, y) {
  //I didn't use to have this parenthesis here
  //and it turns out that's TOTALLY WRONG
  return (
    x < - Board.gridSize / 2 ||
    x > Board.gridSize / 2 || 
    y < - Board.gridSize / 2 ||
    y > Board.gridSize / 2
  );
}

Board.prototype.getPathBetween = function(a, b) {
  for(c in this.connections[a]) {
    if(this.connections[a].hasOwnProperty(c)) {
      if(this.connections[a][c].otherEnd(a).id == b) {
        return this.connections[a][c];
      }
    }
  }
  return null;
}

Board.prototype.getID = function() {
  return this.currentID++
}

Board.prototype.removeSpark = function(spark) {
  var i = this.sparks.indexOf(spark)
  this.sparks.splice(i, 1)
}

Board.prototype.returnAllSparks = function() {
  this.sparks.forEach(function(spark) {
    spark.setReturn()
  })
}

Board.prototype.resetAll = function() {
  this.nodes.filter(function(node) {
    return !(node instanceof Power)
  }).forEach(function(node) {
    node.reset()
  })
  this.returnAllSparks()
}

/*
/ Path.
/ Connects two nodes.
/ Various things can travel along paths and animate along the length of them
/ until they reach their destination.
*/
function Path(previous, next) {
    this.previous = previous;
    this.next = next;
    this.length = 1;
}

Path.prototype.render = function() {
    noFill();
    stroke(161,178,167);
    strokeWeight(3)
    var gss = Board.gridTileSize;
    //this algorithm always travels x first, then y
    line( this.previous.x*gss, this.previous.y*gss, this.next.x*gss, this.previous.y*gss);
    line( this.next.x*gss, this.previous.y*gss, this.next.x*gss, this.next.y*gss);
    //test?
    line( this.previous.x*gss, this.previous.y*gss, this.next.x*gss, this.next.y*gss);

}

Path.prototype.otherEnd = function(endId) {
  if(this.previous.id == endId) {
    return this.next;
  }
  if(this.next.id == endId) {
    return this.previous;
  }
  return null;
}
