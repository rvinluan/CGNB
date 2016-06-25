//TODO: Make Node types constants (NodeTypes.EMPTY == 0)

/*
/ The Board.
/ Contains a grid of Nodes and their connections.
/
*/
function Board() {
    this.nodes = [];
}

Board.prototype.init = function() {
    for(var i = 0; i < 5; i++) {
        this.nodes.push( new Node() );
    }
}

Board.prototype.render = function() {
    translate(width/2, height/2);
    this.nodes.forEach(n => n.render());
}

/*
/ Node.
/ A Node is any point between two paths.
/ Nodes can be empty (in that case they're just an intersection)
/ but they can also be a Program, Enemy, or Wall.
*/
function Node() {
    this.type = 0;
    this.x = random(-5, 5);
    this.y = random(-5, 5);
    this.callSign = "abcdefg".charAt(random(7)) + "123456789".charAt(random(9));
    this.siblings = [];
}

Node.prototype.render = function() {
    push();
    translate(this.x*20, this.y*20);
    noStroke();
    rect(0,0,20,20);
    text(this.callSign, 0, 10);
    pop();
    // console.log('hello');
}

/*
/ Path.
/ Connects two nodes.
/ Various things can travel along paths and animate along the length of them
/ until they reach their destination.
/ 
/ TODO: actually implement this 
*/
// function Path(previous, next) {
//     this.previous = previous;
//     this.next = next;

//     this.travellers = [];
// }