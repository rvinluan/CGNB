var b;

var currentBoard;

function setup() {
    createCanvas(600,600);
    b = new Board();
    currentBoard = b;
    b.init();
}

function draw() {
    background(30);
    b.render();
}