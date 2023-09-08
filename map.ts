class canvas {
    offset: Vector;
    width: number;
    height: number;
    img: HTMLImageElement;
    canvas: CanvasRenderingContext2D;
    canvasEle: HTMLCanvasElement;
    constructor() {
        this.width = 2000;
        this.height = 1200;
        this.offset = new Vector (0,0,"rect");
        this.img = new Image();
        this.img.src = "images/space.jpg";
        
        this.canvasEle = <HTMLCanvasElement>document.getElementById("gameDiv")
        this.canvas = this.canvasEle.getContext("2d");
		this.canvasEle.height = this.height + 60;
		this.canvasEle.width = this.width;
		this.canvas.drawImage(this.img, 0, 0, this.width, this.height+60);
    }

    get screenWidth () {
        return window.innerWidth;
    }

    get screenHeight () {
        return window.innerHeight - 60;
    }

    draw () {
        this.canvas.clearRect(0, 0, this.width, this.height);
	    this.canvas.drawImage(this.img, 0, 0, this.width, this.height+60)
		//draw canvas in right place;
		this.offset.x = (this.width < this.screenWidth) ? 0 : (this.offset.x < 0) ? 0 : (this.offset.x > this.width - this.screenWidth) ? this.width - this.screenWidth : this.offset.x;
		this.offset.y = (this.height < this.screenHeight) ? 0 : (this.offset.y < 0) ? 0 : (this.offset.y > this.height - this.screenHeight) ? this.height - this.screenHeight : this.offset.y;
		this.canvasEle.style.top = -this.offset.y + "px";
        this.canvasEle.style.left = -this.offset.x + "px";
    }

    drawCircle (what: thing, color: string) {
        this.canvas.fillStyle = color;
        this.canvas.beginPath();
        this.canvas.arc(what.pos.x, what.pos.y, what.r, 0, 2 * Math.PI);
        this.canvas.fill();
    }

    drawRect (xPos: number, yPos: number, width: number, height:number, color: string) {
        this.canvas.fillStyle = color;
        this.canvas.fillRect(xPos, yPos, width, height);
    }

    isOffscreen (what: Vector) {
        return (what.x > this.width*1.25 || what.y > this.height*1.25 || what.y < -this.height/4 || what.x  < -this.width/4);
    }

    focus (what: Vector) {
        this.offset = what.minus(new Vector(this.screenWidth/2,this.screenHeight/2,"rect"))
    }

    move () {
        for (let i in keys) {
            if (i == "w") {
            this.offset.y -= 30
            } else if (i == "s") {
            this.offset.y += 30
            } else if (i == "a") {
            this.offset.x -= 30
            } else if (i == "d") {
            this.offset.x += 30
            }
        }
    }
}