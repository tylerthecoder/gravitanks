interface options {
	real:boolean,
	hitsPlayer:boolean,
	hitsPlanet:boolean,
	hitsMoon:boolean
}

function updateProj(index:number,ghost = false) {
	let proj = projs[index];

	if (ghost) {
		proj.options.real = false;
		proj.color = "white"; // to give it that ghouly affect
		if (proj.distTravled > 500) {
			projs.splice(index,1);
			return 0;
		}
	}
	
	proj.draw();
	let result:number = proj.update();
	if (result == 0) {
		// projs.splice(index,1); //delete current bullet
		return 0;
	}
	//check if the bullet is offscreen
	if (map.isOffscreen(proj.pos)) {
		// projs.splice(index,1); //delete current bullet
		return 0;
	}

	proj.distTravled += proj.vel.dist
	
	return 1;
}

class projectile extends thing{
    planetDamage: number;
    playerDamage: number;
    distTravled: number;
    color: string;
	name: string;
	options: options;
	ghost: boolean;
    constructor (pos, vel, type) {
        let data = projData[type];
		super(pos,vel,data.radius);
        this.planetDamage = data.planetDam;
        this.playerDamage = data.playerDam;
		this.color = data.color;
        this.name = type;
        this.options = {
            "real":true,
            "hitsPlayer":true,
            "hitsPlanet":true,
            "hitsMoon":true
		};
		this.setData();
        this.distTravled = 0;
	}
	
	setData () {}

    draw () {
		let color:string = (this.color == "mult") ? randomColor():this.color;
        map.drawCircle(this, color);
	}
	
	next():number {
		if (this.ghost) {
			this.options.real = false;
			this.color = "white"; // to give it that ghouly affect
			if (this.distTravled > 500) {
				return 0;
			}
		}
		
		this.draw();
		let result:number = this.update();
		if (result == 0) return 0;
		//check if the bullet is offscreen
		if (map.isOffscreen(this.pos)) return 0
		this.distTravled += this.vel.dist

		return 1
	}
	

    update():number {
        //return values
        //2: Kepp bullet alive
        //1: Keep bullet alive, but don't move on, some stuff is going down
		//0: Kill the bullet
		
		return 0;
    }

    hitThing () {
		//check all the planets and see if the bullet hits them
		//Return values, 
		//0: Nothing
		//1: Planet
		//2: Player

		//check all the players and see if the bullet hit them
        if (this.options.hitsPlayer) {
            for (let player of players) {
                if (this.isTouching(player)) {
					if (this.options.real) player.hurt(this.playerDamage)
					return player;
                }
            }
        }

        if (this.options.hitsPlanet) {
            for (let planet of planets) {
                if (this.isTouching(planet)) {
					if (this.options.real) planet.hurt(this.planetDamage)
					return planet;
                }
            }
        }
		return null;

    }
}

class shot extends projectile {
    update () {
		this.applyGrav(planets)
		this.pos.add(this.vel)
        if (this.hitThing()) {
			return 0
        }
        return 2;
    }
}

class three_shot extends projectile {
	update () {
		//spawn three shots next to me and then kill me, but in a nice way
		for (let i=-10;i<=10;i+=10) {
			let newVel = new Vector(this.vel.dist,this.vel.angle+i,"polar");
			projs.push(new projData["Shot"].class(this.pos.copy(),newVel,"Shot"));
		}
		return 0;
	}
}

class laser extends projectile {

	draw() {
		let angle = this.vel.angle;
		map.canvas.translate(this.pos.x,this.pos.y);
		map.canvas.rotate(angle*(Math.PI/180))
		map.drawRect(0,0,20,5,"Red");
		map.canvas.rotate(-angle*(Math.PI/180))
		map.canvas.translate(-(this.pos.x),-(this.pos.y));
	}

	update () {
        this.pos.add(this.vel)
        if (this.hitThing()) {
			return 0
        }
        return 2;
	}
}

class Teleporter extends projectile {
	update() {
		this.applyGrav(planets)
        this.pos.add(this.vel)
        if (this.hitThing()) {

			//teleport me to where the bullet is
			if (this.options.real) controllingPlayer.pos = this.pos;

			return 0
        }
        return 2;
	}

}

class Bomb_Carrier extends projectile {
	update() {
		this.applyGrav(planets);
		this.pos.add(this.vel);
		let what:any = this.hitThing()
		if (typeOf(what) == "Planet") { //hit a planet not player
			//spawn an explosion
			projs.push(new projData["Explosion"].class(this.pos.copy(),zeroVector(),"Explosion"))
			return 0;
		}

		return 2;
	}
}

class Explosion extends projectile {
	update () {
		this.r += 5;
		this.hitThing()
		if (this.r > 30) {
			return 0;
		}
		return 2;
	}
}

class Frag_Carry extends projectile {
	update() {
		this.applyGrav(planets);
		this.pos.add(this.vel);
		let what:any = this.hitThing()
		if (typeOf(what) == "Planet") { //hit a planet not player
			//make the three smaller frags
			let basePos = (new Vector(what.pos.x,what.pos.y))
			//move to edge of planet
			let angle = this.pos.angleBetween(what.pos);
			basePos.add(new Vector(what.r+projData["Frag_Bullet"].radius+2,angle,"polar"))
			for (let i = -20; i <= 10; i+=20) {
				let newVel = new Vector(this.vel.dist*.75,this.vel.angleBetween(what.pos)+i,"polar")
				projs.push(new projData["Frag_Bullet"].class(basePos.copy(),newVel,"Frag_Bullet"))
			}
			return 0;
		}


		return 2;
	}
}

class Bouncer extends projectile {
	bounces: number;
	setData () {
		this.bounces = 0;
	}
	update() {
		this.applyGrav(planets);
		this.pos.add(this.vel);
		let what:any = this.hitThing()
		if (this.bounces >= 5) {
			return 0
		}
		if (typeOf(what) == "Planet"){
			//bounce off the planet
			//slope of the tanget
			this.bounces++;
			let diff = this.pos.minus(what.pos)
			let slope = diff.x/diff.y;
			let angle = new Vector(slope,1).angle;
			this.vel.angle = 2*angle - 180 - this.vel.angle
		}


		return 2
	}
}