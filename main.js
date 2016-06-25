var b;

function setup() {
    createCanvas(500,500);
    b = new Board();
    b.init();
}

function draw() {
    background(128);
    b.render();
}