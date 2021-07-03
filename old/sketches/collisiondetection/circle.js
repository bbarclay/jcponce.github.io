/* Written in p5.js (https://p5js.org/)
 * Under Creative Commons License
 * https://creativecommons.org/licenses/by-sa/4.0/
 * Writen by Juan Carlos Ponce Campuzano, 19-June-2018
 */

class Circle {
    
    constructor(_x, _y){
        this.x = _x;
        this.y = _y;
        this.r = random(12, 30);
        this.speed = random(0.5, 2);
        this.hit = false;
        this.R = 120;//0,150,255,150
        this.G = 155;
        this.B = 200;
        this.ran = floor(random(0,6));
    }
    
    update() {
        this.y += this.speed;
        if (this.y > height+50){
            this.x = random(width);
            this.y = random(-height,-50);
        }
        this.hit = circleCircle(this.x, this.y, notes[this.ran], cx, cy, cr);
    }
    
    display() {
        if (!this.hit) fill(this.R, this.G, this.B, 190);
        else fill(this.ran, 100, 200, 200);
        noStroke();
        ellipse(this.x, this.y, notes[this.ran]*2, notes[this.ran]*2);
        
        if (this.hit) {
           playNote(notes[this.ran]);
            osc.fade(0,30);
        }
    }
}
