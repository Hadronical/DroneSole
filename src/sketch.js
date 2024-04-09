// Dronesole
//
// Made by StrangeQuark | Hadronical


/* jshint multistr: true */


let Version = "0.2";
let canvas;
let canvasX = 0,
	canvasY = 0;

let prevScene = 0;
let currentScene = 0;
// Main Menu  = 0
// Game Scene = 1
// Pause      = 2
// Win        = 3
// How to     = 4
// Settings   = 5

let Level = 0;

let Width = 620;
let Height = 600;


let consoleInp;
let consoleOn = false;
let consoleWidth = 250;

let prevCmd = [],
	cmdSuggestions = [];

let zoom = 4;
let light = 1;

let uSize = 40;
let mapWidth = 12,
	mapHeight = 12;

let gridStartPos;
let endPos;


let pPos, pMoveToPos, canMove = true;
let pRot = 0, pTargetRot = 0;
let maxFuel = 100;
let pFuel = maxFuel,
	pTargetFuel = maxFuel; // just for show
let maxPower = 100;
let pPower = maxPower,
	pTargetPower = maxPower; // just for show
let maxDMGSustain = 1;
let pDMGSustain = 0;


//Buttons and stuff
let playButton;
let settingsButton;
let howToButton;
let toMainButton;


//Graphics
let Title;
let PlayerDrone;
let doorTileClosed, doorTileOpen;
let emptyEntitySprite,
	FuelTankSprite,
	BatterySprite,
	CogSprite,
	InfoSprite;

//SFX


function preload () {
	Title = loadImage("Assets/DroneSole_title.png");
	PlayerDrone = loadImage("Assets/Drone.png");
	
	doorTileClosed = loadImage("Assets/Door_closed.png");
	doorTileOpen = loadImage("Assets/Door_open.png");
	
	emptyEntitySprite = loadImage("Assets/EmptyEntity.png");
	FuelTankSprite = loadImage("Assets/FuelTank.png");
	BatterySprite = loadImage("Assets/Battery.png");
	CogSprite = loadImage("Assets/Cog.png");
	
	InfoSprite = loadImage("Assets/InfoBlock.png");
}

function setup () {
	canvas = createCanvas(windowWidth, windowHeight);
	resizeCanvasDynamic();

	gridStartPos = createVector(uSize,uSize);

	// initializing ui
	consoleInp = createInput('');
	consoleInp.position(0, 0);
	consoleInp.size(100);
	consoleInp.input(InputUpdate);
	consoleInp.hide();

	let menuButtonsX = 20;
	let menuButtonsY = height/2 + 30;

	playButton = createButton("Play");
	playButton.position(canvasX + menuButtonsX, canvasY + menuButtonsY);
	playButton.size(70, 30);
	playButton.mousePressed(StartGame);

	settingsButton = createButton("Settings");
	settingsButton.position(canvasX + menuButtonsX, canvasY + menuButtonsY + menuButtonsSize + 10);
	settingsButton.size(120, 30);
	settingsButton.mousePressed(GoToSettings);

	howToButton = createButton("How to Play");
	howToButton.position(canvasX + menuButtonsX, canvasY + menuButtonsY + 2 * (menuButtonsSize + 10));
	howToButton.size(165, 30);
	howToButton.mousePressed(GoToHowTo);

	toMainButton = createButton("Main Menu");
	toMainButton.position(canvasX + menuButtonsX, canvasY + menuButtonsY + 3 * (menuButtonsSize + 10));
	toMainButton.size(155, 30);
	toMainButton.mousePressed(BackToMain);


	LoadMapStr(Level);
}



function draw () { 
	switch (currentScene) {
		case 0: MainMenu();            break;
		case 1: Play();                break;
		case 2: Pause();               break;
		case 3: LevelCompleteScreen(); break;
		case 4: HowToPlayScreen();     break;
		case 5: Settings();            break;
		case 6: GameCompleteScreen();  break;
		case 7: GameOverScreen();      break;
	}
	
	if (keyIsPressed) {
		if ([1,2,4,5,].includes(currentScene)) {
			if (keyCode === 192) { consoleOn = true; }
			if (keyCode === ESCAPE) {
				if (consoleOn) {
					consoleOn = false;
					previousCommands = [];
				}
				else if (currentScene == 1) { PauseGame(); } 
				else if (prevScene == 2)    { PreviousScene(); }
			}
			input = consoleInp.value();
			if (keyCode === RETURN && input.length > 0) { ReadConsoleInput(input); }
		}
	}
	
	DrawCommandPromptWindow(2,2, 250, 300);
}






function Play () {
	background(0);
	//scale(width / Width);
	
	playButton.hide();
	settingsButton.hide();
	howToButton.hide();
	toMainButton.hide();
	
	if (pDMGSustain / maxDMGSustain >= 1) { GameOver(); }
	
	push();
	scale(zoom);
	let realPX = gridStartPos.x+pPos.x+uSize/2;
	let realPY = gridStartPos.y+pPos.y+uSize/2;
	
	translate((width/zoom- 2*realPX)/2 + 75/zoom, (height/zoom - 2*realPY)/2 + 75/zoom);
	
	
	//Draw grid
	//Grid();
	
	push();
	translate(gridStartPos.x,gridStartPos.y);
	
	
	Tiles.forEach(
		tile => { tile.Update(); }
	);
	
	Entities.forEach(
		entity => { entity.Update(); }
	);
	
	
	//Draw end point
	push();
	translate(endPos.x + uSize/2, endPos.y + uSize/2);
	fill(50,220,50);
	noStroke();
	rectMode(CENTER);
	rect(0,0, uSize,uSize);

	textAlign(CENTER);
	textSize(15);
	rotate(PI/10);
	fill(240);
	text("Win", 0,5);
	pop();


	//Win
	if (p5.Vector.dist(pPos, endPos) <= 0.1) LevelComplete();


	if (p5.Vector.dist(pPos, pMoveToPos) <= 5) canMove = true;
	else canMove = false;



	//Draw player
	lerpPos(pPos, pMoveToPos, 0.075);
	pRot = lerp(pRot, pTargetRot, 0.1);

	translate(pPos.x + uSize/2, pPos.y + uSize/2);
	push();
	rotate(pRot); scale(0.31);
	fill(80,240,80);
	noStroke();
	imageMode(CENTER);
	image(PlayerDrone, 0,0);
	pop();


	pop();


	pop();

	//Draw UI elements
	DrawUI();
	background(0,(1 - light) * 255);

	if (fadeAlpha >= 0)
		FadeScreen();
}







//----------------CONSOLE FUNCTIONS----------------//
let inverted = false;
let keyboardInp = false;

function PlayerMove (strDir, steps) {
	if (steps != undefined && isNaN(steps)) {
		ConsoleThrowException("err - " + steps + " is not a number");
		return;
	}

	let numDir = [];
	switch (strDir) {
		case "for": numDir = [1,0]; break;
		case "back": numDir = [-1,0]; break;
		case "lef" : numDir = [0,-1]; break;
		case "ri" : numDir = [0,1]; break;
		default : numDir = []; break;
	}

	if (steps == undefined) steps = 1;

	if (pTargetFuel - steps * 10 * (numDir[1] != 0 ? 1.5 : 1) < 0){
		ConsoleInform("info - not enough fuel");
		return;
	}

	let moveVec = createVector(
		cos(pTargetRot) * numDir[0] + -round(sin(pTargetRot),0) * numDir[1],
		sin(pTargetRot) * numDir[0] + round(cos(pTargetRot),0) * numDir[1]
	);


	let moveDir = p5.Vector.mult(moveVec, uSize * steps);
	if (inverted) moveDir.mult(-1);

	let moveObstructed = false;
	if (pFuel > 0 && canMove && numDir.length > 1) {

		//Check every space in the move to make sure nothing is in the way
		for (let d = 0; d < steps; d++) {
			let posFromDir = p5.Vector.mult(moveVec, uSize * (d + 1));
			let posInFront = p5.Vector.add(pPos, posFromDir);
			let frontTile = CheckForTileAtPos(posInFront.x,posInFront.y);
			let frontEntity = CheckForEntityAtPos(posInFront.x,posInFront.y);

			if ((
				frontTile == undefined
				|| frontTile.type == tType.EMPTY
				|| (frontTile.type == tType.DOOR && frontTile.open))
				&& (frontEntity == undefined || !frontEntity.isRigid)
			){
				moveObstructed = false;
			}
			else if (
				frontTile != undefined
				&& (
					frontTile.type == tType.DOOR && !frontTile.open
					|| frontTile.type == tType.WALL
				)
				|| (frontEntity != undefined && frontEntity.isRigid)
			){
				moveObstructed = true;
				break;
			}
			else if (frontTile != undefined && frontTile.type == tType.PUSHABLE) {
				if(frontTile.CheckMove(p5.Vector.mult(posFromDir, uSize*steps))) {
					frontTile.targetPos.add(moveDir);
					moveObstructed = false;
				}
			}

		}


	}
	else if (pFuel <= 0) {
		ConsoleInform("info - out of fuel");
		return;
	}
	else if (!canMove) {
		ConsoleInform("info - please wait before moving again");
		return;
	}
	else {
		return;
	}

	if (!moveObstructed) {
		pMoveToPos.add(moveDir);
		pTargetFuel -= steps * 10 * (numDir[1] != 0 ? 1.5 : 1);
	}
	else {
		ConsoleInform("info - something is in the way");
	}

}



function SetFuel (newFuel) {
	pTargetFuel = newFuel;
	pFuel = newFuel;
}
function SetPower (newPower) {
	pTargetPower = newPower;
	pPower = newPower;
}



function PlayerRotate (strDir) {
	if (pTargetFuel - 2.5 < 0) {
		ConsoleInform("info - not enough fuel");
		return;
	}

	if (pFuel > 0 && canMove) {
		if (strDir == "l") pTargetRot -= PI/2;
		if (strDir == "r") pTargetRot += PI/2;
		pTargetFuel -= 2.5;
	}
}



function PlayerScan (radius) {
	if (isNaN(radius)) {
		ConsoleThrowException("err - " + radius + " is not a number");
		return;
	}

	radius = constrain(radius, 0, 10);

	let incr = PI/(8 * radius);
	let entitiesFound = [];

	if (pTargetPower - radius * 2 < 0) {
		ConsoleInform("info - not enough power");
		return;
	}

	let rowLen = radius*2 + 1;
	let scanOut = Array(rowLen*rowLen).fill('. ');
	let center = radius * rowLen + radius;
	scanOut[center] = '∆ ';

	for (let deg = 0; deg < 16 * radius; deg++) {
		for (let dist = 1; dist < radius + 1; dist++) {
			let x = cos(deg * incr);
			let y = sin(deg * incr);

			x = round(x * dist, 0) * uSize;
			y = round(y * dist, 0) * uSize;

			let realX = x/uSize + radius;
			let realY = y/uSize + radius;


			let checkPos = createVector(round(pPos.x + x,0), round(pPos.y + y,0));
			let checkTile = CheckForTileAtPos(checkPos.x, checkPos.y);
			let checkEntity = CheckForEntityAtPos(checkPos.x, checkPos.y);
			if (checkTile != undefined || checkEntity != undefined) {
				if (checkTile != undefined && checkTile.type == tType.WALL) {
					deg++;
					scanOut[realX + realY * rowLen] = '◼ ';
					continue;
				}
				let info;
				if (checkTile != undefined)
					info = { name:checkTile.name, x:checkPos.x, y:checkPos.y };
				if (checkEntity != undefined)
					info = { name:checkEntity.name, x:checkPos.x, y:checkPos.y };

				if (p5.Vector.dist(createVector(0,0),createVector(realX,realY)) > uSize*6)
					info.name = "unknown";

				if ((checkTile != undefined && checkTile.isEntity) || checkEntity != undefined) {
					let canPush = true;

					for (let i = 0; i < entitiesFound.length; i++) {
						if (
							entitiesFound[i].name == info.name
							&& entitiesFound[i].x == info.x
							&& entitiesFound[i].y == info.y
						){
							canPush = false;
							break;
						}
					}

					if (canPush) {
						//Found something
						entitiesFound.push(info);
						if (info.name == "door") scanOut[realX + realY * rowLen] = '🅾 ';
						else if (info.name == "informator") scanOut[realX + realY * rowLen] ='ℹ ';
						else scanOut[realX + realY * rowLen] = '◻ ';
					} 
				}

			}

		}

		//End of dist loop
	}

	for (let rL = 1; rL < rowLen; rL++){
		scanOut[rowLen * rL - 1] += '\n\t\t\t';
	}
	let scanOutStr = scanOut.toString().replace(/,/g, '');
	ConsoleInform("info - " + scanOutStr, 10);

	for (let l = 0; l < rowLen - 1; l++){
		ConsoleInform("info - ");
	}


	if (entitiesFound.length > 0){
		entitiesFound.forEach(
			entity => {
				ConsoleInform("info - " + entity.name + " at (" + entity.x / uSize + ", " + entity.y / uSize + ")");
			});
	}
	else{
		ConsoleInform("info - no entities found");
	}

	pTargetPower -= 2 * radius;

}


// TODO: draw this to a buffer bro
function Grid () {
	push();
	noFill();
	stroke(100, 150);
	strokeWeight(0.5);

	//translate(-(width - mapWidth*uSize)/2, -(height - mapHeight*uSize)/2);
	for (let xDir = 1; xDir < mapWidth + 1; xDir++) {
		let x = xDir * uSize;
		push();
		textAlign(CENTER); textSize(15); fill(255); noStroke();
		text(xDir - 1, x+uSize/2, 10);
		pop();

		line(x,uSize, x,mapHeight*uSize - uSize);
	}
	for (let yDir = 1; yDir < mapHeight + 1; yDir++) {
		let y = yDir*uSize
		push();
		textAlign(CENTER); textSize(15); fill(255); noStroke();
		text(yDir - 1, 10, y+uSize/2 + 5);
		pop();

		line(uSize,y, mapWidth*uSize - uSize,y);
	}
	pop();
}


// TODO: make these DOM elements
function DrawUI () {
	pFuel = lerp(pFuel, pTargetFuel, 0.1);
	pPower = lerp(pPower, pTargetPower, 0.2);


	// draw fuel indicator
	push();
	translate(5, height - 50);
	fill(50,120);
	noStroke();
	rect(-5,-30, 270, 80);

	fill(255);

	textSize(18);
	textFont("Verdana");
	text("Propellant: " + round(pFuel, 2) + "%", 0,-5);

	fill(220,220,50);
	if (pFuel / maxFuel < 0.3) fill(220,50,50);
	rect(0,3, (pFuel / maxFuel) * 250, 25);
	pop();


	// draw power and DMG sustained indicator  
	push();
	translate(width - 5, height - 50);
	fill(50,120);
	noStroke();
	rect(-140,-50, 140 + 5, 100);

	fill(255);

	textSize(18); textAlign(RIGHT);
	textFont("Verdana");
	text("Power: " + round(pPower, 2) + "%", 0,-25);
	text("Damage: " + round(pDMGSustain, 2) * 100 + "%", 0,20);

	fill(50,100,240);
	if (pPower / maxPower < 0.3) fill(220,50,50);
	rect(-100,-21, (pPower / maxPower) * 100, 20);

	fill(250,50,50);
	rect(-100,25, (pDMGSustain / maxDMGSustain) * 100, 20);
	pop();
}


function lerpPos (pos1, pos2, amt) {
	pos1.x = lerp(pos1.x, pos2.x, amt);
	pos1.y = lerp(pos1.y, pos2.y, amt);
}

// window resizing
function windowResized () {
	resizeCanvasDynamic();
}

function resizeCanvasDynamic () {
	let smallestSide = min(windowWidth - 5, windowHeight - 5);
	let otherSide;
	let newWidth, newHeight;


	if (smallestSide == windowWidth - 5) {
		smallestSide = constrain(smallestSide, 0, min(Width, windowWidth));
		otherSide = constrain((smallestSide / Width) * Height, 0, Height);

		newWidth = smallestSide;
		newHeight = otherSide;
	}
	else if (smallestSide == windowHeight - 5) {
		smallestSide = constrain(smallestSide, 0, min(Height, windowHeight));
		otherSide = constrain((smallestSide / Height) * Width, 0, Width);

		newWidth = smallestSide;
		newHeight = otherSide;
	}


	resizeCanvas(newWidth, newHeight);
	canvasX = (windowWidth - newWidth)/2;
	canvasY = (windowHeight - newHeight)/2
	canvas.position(canvasX, canvasY);
}
