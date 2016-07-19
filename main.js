var currentBoard;
var currentScreen;

function setup() {
    createCanvas(document.body.clientHeight, document.body.clientHeight);
    currentBoard = new Board();
    currentBoard.init();
    currentScreen = new Screen(currentBoard)
}

function draw() {
    background(currentBoard.bgColor);
    currentScreen.render();
}