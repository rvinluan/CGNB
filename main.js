var currentBoard;

function setup() {
    createCanvas(document.body.clientHeight, document.body.clientHeight);
    currentBoard = new Board();
    currentBoard.init();
}

function draw() {
    background(currentBoard.bgColor);
    currentBoard.render();
}