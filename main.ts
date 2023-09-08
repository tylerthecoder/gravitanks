let settings = {
    "beltSize":20,
	"numOfPlanets":12,
	"powerConstant":0.25,
    "minPlanetRadius":20,
    "maxPlanetRadius":100
}
let arsenal: any[];
let gameState: string = "";
let planets: Planet[];
let players: Player[];
let projs: projectile[];
let map: canvas;
let state: string = "";
let stateData: any;
let controllingPlayer: Player;
let editing = {
    "power":false,
    "angle":false,
    "weapon":false
}

let projData = {
	"Shot": { "color":"yellow", "radius":10, "playerDam": 10, "planetDam": 10, "class": shot},
	"Three Shot": { "color":"green", "radius":0.1, "playerDam": 0, "planetDam": 0, "class": three_shot},
	"Laser": { "color":"red", "radius":10, "playerDam": 5, "planetDam": 5, "class": laser},
	"Planet Destoryer": { "color":"black", "radius":15, "playerDam": 3, "planetDam": 50, "class": shot},
	"Teleporter": { "color":"purple", "radius":10, "playerDam": 0, "planetDam": 0, "class": Teleporter},
	"Bomb": { "color":"green", "radius":10, "playerDam": 0, "planetDam": 0, "class": Bomb_Carrier},
	"Explosion": { "color":"multi", "radius":10, "playerDam": 10, "planetDam": 10, "class": Explosion, "unGettable":true},
	"Frag": { "color":"blue", "radius":10, "playerDam": 0, "planetDam": 0, "class": Frag_Carry},
	"Frag_Bullet": { "color":"green", "radius":5, "playerDam": 5, "planetDam": 5, "class": shot, "unGettable":true},
	"Bouncer": { "color":"red", "radius":10, "playerDam": 0, "planetDam": 0, "class": Bouncer},
}

let projNames:string[] = [];
for (let proj in projData) {
	if (!projData[proj].unGettable) projNames.push(proj);
}

function setup () { //do at the begining of the program
    map = new canvas();

    //create players
    players = [];   
    players[0] = new Player(zeroVector(),"green",0);
    players[1] = new Player(new Vector(map.width,map.height),"red",1);

    //fill the players belts
    for (let i=0; i<settings.beltSize; i++) {
        for (let player of players) {
            player.belt.push(rand(projNames))
        }
    }

    projs = [];

    //generate the planets
	planets = [];
	//make planets that the players will definitely land on
	planets.push(new Planet(new Vector(60,60),30));
	planets.push(new Planet(new Vector(map.width-60,map.height-60),30));

    for (let i = 0; i < settings.numOfPlanets; i++) {
        let flag = false;
		let pos = new Vector(rand(0,map.width),rand(0,map.height));
		//find the closest screen edge
		let radiusContraint = Math.min(pos.x,pos.y,map.height-pos.y,map.width-pos.y)

		//this planet isn't possible with the minRadius and where it is located
		let maxRadius = Math.min(settings.maxPlanetRadius,radiusContraint)
		if (maxRadius < settings.minPlanetRadius) flag = true;

		//use the max radius or the radius contraint, which ever is smaller
        let newPlanet = new Planet(pos, rand(settings.minPlanetRadius,maxRadius))
        //check all the other planets to see if there is a collision
        for (let planet of planets) {
            if (planet.isTouching(newPlanet)) flag = true; //the new planet is touching one of the other planets
        }
        if (!flag) planets.push(newPlanet);
	}
	
	//make some moons
	for (let planet of planets) {
		let flag = true;
		if (planet.isMoon) continue; //dont run if it is a moon
		for (let cPlanet of planets) {
			if (cPlanet.pos.distBetween(planet.pos) == 0) continue; //skip yourself
			if (cPlanet.pos.distBetween(planet.pos) < cPlanet.r+2*planet.r) flag = false;
		}
		if (flag) {
			//create new moon with this dude;
			planets.push(new Planet(planet.pos,planet.r/4,true))
		}
	}

}

function start () { //do when the button is pressed
    setInterval(loop,50);
	state = "endturn";
	
	//set the event handllers

    //clicking the canvas
    map.canvasEle.onclick = function (event) {
        let pos = new Vector (event.clientX, event.clientY, "rect"); //the pos of the click
        //add the map offset and subtract the players position and then get that angle
        controllingPlayer.inputs.angle = pos.plus(map.offset).minus(controllingPlayer.pos).angle
	}
	
	//scrolling will change weapons

}

function loop () { //do every game tick
    //draw
    map.draw();
    for (let player of players) {
        player.draw();
    }
    for (let planet of planets) {
        planet.draw();
	}
	for (let planet of planets) { //planets will always be orbiting
		planet.orbit();
	}
	d("pointsDiv").innerHTML = Math.floor(players[0].points) + ":" + Math.floor(players[1].points);
	
	if (state == "endturn") { //all the projs are dead, tighty a few move things up like moons and players falling
		
		for (let i = planets.length-1;i>=0;i--) {
			let planet = planets[i];
			let result = planet.update();
			if (result == 0) {
				planets.splice(i,1);
			}
		}

		for (let player of players) {
			let result = player.update();
			if (result == 0) { //if the player is falling, then dont update the other one yet
				return 0;
			}
		}

		//if no one fell
		state = "idle";
		window.setTimeout(function() {
			changeTurn();
			state = "playerAiming";
		},1000);
		
	}else if (state == "playerAiming") { //this is where the player can move around and deside how they want to shoot
		map.move(); //move the map accoriding to key presses
		aim(); //show the path of the proj
		controlInputs(); //constrict the inputs to certain values
	}else if (state == "projFired") {
		//cycle through backwards so deleteing doens't muck things up
		projs.filter((proj) => {
			let res:number = proj.next()
			return res != 0
		})
		// for (let i = projs.length-1;i>=0;i--) {
		// 	let result:number = updateProj(i);
		// 	if (result == 0) {
		// 		continue;
		// 	}
		// }
		if (projs.length == 0) {
			state = "endturn";
			return 0;
		}
		map.focus(projs[0].pos);
		//update the planets agian, in case on of them died
		planets.filter((planet) => {
			const res:number = planet.update();
			return res != 0;
		})
		// for (let i = planets.length-1;i>=0;i--) {
		// 	let planet = planets[i];
		// 	let result = planet.update();
		// 	if (result == 0) {
		// 		planets.splice(i,1);
		// 	}
		// }
	}

}

function changeTurn () {
	console.log("next turn");
	if (controllingPlayer == undefined) { //first time
		controllingPlayer = players[0];
		d("controlsDiv").style.display = "block";
	}else {
		controllingPlayer = players[(controllingPlayer.id+1)%2];
	}
	
	map.focus(controllingPlayer.pos);
	//fill the select input
	for (let proj of controllingPlayer.belt) {
		inpt("weaponSelect").innerHTML += "<option>" + proj + "</option>";
	}
	//set the weapon to the guys 
	controllingPlayer.inputs.weapon = (<HTMLSelectElement>d("weaponSelect")).options[0].text 
}

function controlInputs ():void {
	//set the inputs to the correct values
    if (editing.power) {
        controllingPlayer.inputs.power = +inpt("powerInput").value
    }else {
        inpt("powerInput").value = controllingPlayer.inputs.power.toString();
    }
    if (controllingPlayer.inputs.power > 100) {
        controllingPlayer.inputs.power = 100;
    }else if (controllingPlayer.inputs.power < 0) {
        controllingPlayer.inputs.power = 0;
    }

    if (editing.angle) {
        controllingPlayer.inputs.angle = +inpt("angleInput").value
    }else {
        inpt("angleInput").value = (~~(controllingPlayer.inputs.angle*10)/10).toString();
    }
    if (controllingPlayer.inputs.angle >= 360) {
        //roll over
        controllingPlayer.inputs.angle %= 360;
    }else if (controllingPlayer.inputs.angle < 0) {
        //roll over
        controllingPlayer.inputs.angle += 360;
    }

    if (editing.weapon) { 
		controllingPlayer.inputs.weapon = inpt("weaponSelect").value;
    }else {
		inpt("weaponSelect").value = controllingPlayer.inputs.weapon;
	}
}

function aim () {
	//make the player shoot
	let para = controllingPlayer.inputs;
	let pos = new Vector(controllingPlayer.r+projData[para.weapon].radius+10,para.angle,"polar")
	pos.add(controllingPlayer.pos)
	let vel = new Vector(para.power * settings.powerConstant, para.angle, "polar");
	projs.push(new projData[para.weapon].class(pos,vel,para.weapon));
	
	//run through all the bullets, updating them as a ghost
	while(projs.length > 0) {
		projs.filter((proj) => {
			let res:number = proj.next()
			return res != 0
		})
	}
}

//key press code;
let keys = {}
window.onkeydown = function(event) {
  keys[event.key] = true
}
window.onkeyup = function(event) {
  delete keys[event.key]
}

function randomColor(): string {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(rand(0,1) * 16)];
    }
    return color;
}


//seeded random stuff code
let seed = Math.floor(Math.random() * 10000);

let seededRandom = function() {
  let max = 1;
  let min = 0;

  seed = (seed * 9301 + 49297) % 233280;
  let rnd = seed / 233280;

  return min + rnd * (max - min);
}

function rand(min: any, max: number = 0) {
  if (typeof(min) == "number") {
    return min + (seededRandom() * (max - min))
  }
  return min[Math.floor(seededRandom() * min.length)]
}

function d(what: string):HTMLElement {
    return document.getElementById(what);
}

function inpt(what: string):HTMLInputElement {
    return <HTMLInputElement>d(what);
}