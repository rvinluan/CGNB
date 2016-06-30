var currentBoard;

function setup() {
    createCanvas(600,600);
    currentBoard = new Board();
    currentBoard.init();
}

function draw() {
    background(26,21,26);
    currentBoard.render();
}