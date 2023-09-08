class Player extends thing{
    index: number;
    belt: string[];
    inputs: inputs;
    points: number;
    planet: Planet;
    state: string;
    angleBetweenPlanet: number;
    constructor (pos: Vector, public color: string, public id: number) {
        super(pos,zeroVector(),12);
        this.state = "notMyTurn";
        this.inputs = {
            power:50,
            angle:50,
            weapon:""
        };
        this.points = 0;
        //put items into belt;
        this.belt = [];
        for (let i=0;i<settings.beltSize;i++) {
            //this.belt.push(arsenal[i].name) // make this choose a random element of the arsenal array
        }
    }

    draw () {
        //calculate the pos by adding the planet pos to the pos of the player on the planet
        map.drawCircle(this,this.color);
		map.canvas.translate(this.pos.x,this.pos.y);
		map.canvas.rotate(this.inputs.angle*(Math.PI/180))
		map.drawRect(this.r/2,-this.r/2,20,this.r,this.color);
		map.canvas.rotate(-this.inputs.angle*(Math.PI/180))
		map.canvas.translate(-(this.pos.x),-(this.pos.y));
    }

    update () {
        //return values
        //1: move on
        //0: wait!! i'm doing stuff

        for (let planet of planets) {
            if (this.pos.distBetween(planet.pos) < this.r + planet.r + 2) { //the player hit the planet
                if (this.vel.dist > 5) this.points += this.vel.dist;
                planet.player = this;
                this.planet = planet;
                this.moveOnPlanet(0); // align it correctly to planet
                //stop him
                this.vel.set(zeroVector());
                return 1;
            }
        }
        //By this point, we know im not on a planet
        this.applyGrav(planets);

        this.pos.add(this.vel);
        //focus on me if I'm moving
        map.focus(this.pos);
        return 0
    }

    shoot (para: inputs) {
        this.inputs = para; // give the player the anlge values that is selected
        console.log(this.belt,para.weapon,this.belt.indexOf(para.weapon));
        this.belt.splice(this.belt.indexOf(para.weapon),1);
        console.log(this.belt);
        //create bullet using para
        let pos = new Vector(this.r+projData[para.weapon].radius+10,para.angle,"polar").plus(this.pos)
        let vel = new Vector(para.power * settings.powerConstant, para.angle, "polar");

        projs.push(new projData[para.weapon].class(pos,vel,para.weapon));
        
        state = "projFired";

    }

    moveOnPlanet (angle: number) {
        //set the player to the correct angle on the planet
        let angleBetweenPlanet = this.pos.minus(this.planet.pos).angle

        angleBetweenPlanet += angle;

        //attach self to planet if on planet
        this.pos = this.planet.pos.plus(new Vector(this.planet.r+this.r,angleBetweenPlanet,"polar"));
    }

    hurt (amount: number) {
        this.points += amount;
        console.log(amount)
    }

}

interface inputs {
    "power": number,
    "angle": number,
    "weapon": string
}