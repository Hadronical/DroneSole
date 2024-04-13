// Dronesole
//
// Made by StrangeQuark | Hadronical


/* jshint multistr: true */


const Version = "0.2";
let canvas;
let canvasX = 0,
	canvasY = 0;

let prevScene = 0;
let currentScene = 0;
const SCENES = {
	MENU:     0,
	GAME:     1,
	PAUSE:    2,
	WIN:      3,
	TUTORIAL: 4,
	SETTINGS: 5,
	COMPLETE: 6,
	LOSE:     7,
}

let current_level = 0;

let Width = 620;
let Height = 600;


let zoom = 4;
let light = 1;

let uSize = 40;

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



//SFX


function preload () {
	loadImages();
}

function setup () {
	canvas = createCanvas(windowWidth, windowHeight);
	resizeCanvasDynamic();

	gridStartPos = createVector(uSize,uSize);

	initializeUI();

	LoadMapStr(current_level);
}



function draw () { 
	switch (currentScene) {
		case SCENES.MENU:     MainMenu();            break;
		case SCENES.GAME:     Play();                break;
		case SCENES.PAUSE:    Pause();               break;
		case SCENES.WIN:      LevelCompleteScreen(); break;
		case SCENES.TUTORIAL: HowToPlayScreen();     break;
		case SCENES.SETTINGS: Settings();            break;
		case SCENES.COMPLETE: GameCompleteScreen();  break;
		case SCENES.LOSE:     GameOverScreen();      break;
	}
	
	if (keyIsPressed) {
		if ([1,2,4,5].includes(currentScene)) {
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
	
	
	push();
	translate(gridStartPos.x,gridStartPos.y);
	
	
	for (let tile of Tiles) {
		tile.Update();
	}
	for (let entity of Entities) {
		entity.Update();
	}
	
	
	// draw end point
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


	// winning the game
	if (p5.Vector.dist(pPos, endPos) <= 0.1) { LevelComplete(); }


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

	// draw UI elements
	drawUI();

	background(0,(1 - light) * 255);
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

		// end of dist loop
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
