class Planet extends thing {
    player: Player
    moon: Planet
    planet: Planet
    isMoon: boolean
    isPlanet: boolean
    orbitSpeed: number
    img: HTMLImageElement;
    constructor (pos:Vector, r: number,moon:boolean = false) {
        super(pos, new Vector(0,0,"rect"), r);
        this.isMoon = moon;
        if (moon) {
            //set stuff up
            this.orbitSpeed = rand(0,5);
            this.pos = new Vector(this.pos.x+this.r*2, this.pos.y)
        }
        this.isPlanet = true;
        this.img = new Image();
        this.img.src = "images/planet" + (Math.floor(Math.random() * 5)+1).toString() + ".png";
    }

    draw () {
        map.canvas.drawImage(this.img, this.pos.x-this.r, this.pos.y-this.r,
                                       2*this.r, 2*this.r)
    }

    update () {
        //return values
        //2: Kepp planet alive
        //1: Keep planet alive, but don't move on, some stuff is going down
        //0: Kill the planet

        this.pos.add(this.vel); // this only really appiles to moons, but it doesn't matter

        if (this.r <= 10) { //im dead
            if (this.moon) this.moon.planet = undefined //tell my moon I love them
            return 0;
        }
        if (this.isMoon) {
            if (this.planet === undefined) {
                for (let pl of planets) {
                    //see if it is touching any other planet
                    if (this.pos.distBetween(pl.pos) > this.r + pl.r + 2) {
                        pl.r += Math.pow(this.r,1/3) //add the moons mass to the planet it hits mass
                        return 0
                    }
                }
                this.applyGrav(planets)

                map.focus(this.pos);
                return 1;
            }
        }
        return 2;
    }

    orbit () {
        if (this.isMoon) {
            //let differnece = 
        }
    }

    hurt (amount) {
        this.r -= amount;
    }

}