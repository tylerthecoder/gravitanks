class Vector {
    x: number;
    y: number;
    constructor (val1: number, val2: number, type: string = "rect") {
        if (type == "polar"){
            this.x = val1*Math.cos(val2 * (Math.PI/180));
            this.y = val1*Math.sin(val2 * (Math.PI/180));
        }else {
            this.x = val1;
            this.y = val2;
        }
    }

    public add (v: Vector) {
        this.x += v.x;
        this.y += v.y;
    }

    public plus (v: Vector) {
        return new Vector(this.x+v.x,this.y+v.y,"rect");
    }

    public sub (v: Vector) {
        this.x -= v.x;
        this.y -= v.y;
    }

    public minus (v: Vector) {
        return new Vector(this.x-v.x,this.y-v.y,"rect");
    }

    public mult (m: number){
        this.x *= m;
        this.y *= m;
    }

    public distBetween (v: Vector) {
        let x = this.x - v.x
        let y = this.y - v.y
        return Math.sqrt(x * x + y * y)
    }

    public set(v: Vector) {
        this.x = v.x;
        this.y = v.y;
    }

    public angleBetween(v: Vector) {
        let diffVector = new Vector(this.x-v.x,this.y- v.y)
        return diffVector.angle;
    }

    public copy() {
        return new Vector(this.x,this.y);
    }

    get dist () {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    set dist (d: number) {

    }

    set angle (a: number) {
        let dist = this.dist
        this.x = Math.cos(a * (Math.PI/180)) * dist
        this.y = Math.sin(a * (Math.PI/180)) * dist
    }

    get angle () {
        let a = Math.atan(Math.abs(this.y) / Math.abs(this.x))
        a *= (180 / Math.PI);
        if (this.x == Math.abs(this.x) && this.y == Math.abs(this.y)) {
          a = a;
        } else if (this.x != Math.abs(this.x) && this.y == Math.abs(this.y)) {
          a = 180 - a;
        } else if (this.x != Math.abs(this.x) && this.y != Math.abs(this.y)) {
          a = 180 + a;
        } else if (this.x == Math.abs(this.x) && this.y != Math.abs(this.y)) {
          a = 360 - a;
        }
        return a
    }


}

function zeroVector(): Vector {
    return new Vector(0,0,"rect");
}


