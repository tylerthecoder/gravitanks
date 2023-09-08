class thing {
    pos: Vector;
    vel: Vector;
    r: number;
    shape: string;
    constructor (position: Vector,velocity: Vector,radius: number) {
        this.pos = position;
        this.vel = velocity;
        this.r = radius;
        this.shape = "circle";
    }

    get mass () {
        return Math.pow(this.r,3)*3
    }

    isTouching (thing2: thing) {
        if (this.shape == "circle" && thing2.shape == "circle") {
            return this.pos.distBetween(thing2.pos) < this.r+thing2.r;
        }
    }


    applyGrav (from: thing[]) {
        let grav = zeroVector();
        for (let i in from) {
            grav.add(gravForce(this,from[i]))
        }
        this.vel.add(grav);
    }
}

function gravForce (t1: thing, t2:thing) {
    let d = t1.pos.minus(t2.pos)
    if (d.dist == 0) return zeroVector();
    let gravForce = t2.mass / (d.dist * d.dist);
    gravForce *= -0.01;
    let x = gravForce * (d.x/d.dist);
    let y = gravForce * (d.y/d.dist);
    return new Vector(x,y,"rect")
}

function typeOf(what):string {
    if (what) {
        return what.constructor.name
    }else{
        return ""
    }

}