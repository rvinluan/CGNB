var b;

function setup() {
    createCanvas(600,600);
    b = new Board();
    b.init();
}

function draw() {
    background(128);
    b.render();
}