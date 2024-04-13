// ui components
let playButton;
let settingsButton;
let howToButton;
let toMainButton;

let consoleInp;

let bar_propellant;
let bar_power;
let bar_damage;

let ovr_black;


// graphics
let Title;
let PlayerDrone;
let doorTileClosed, doorTileOpen;
let emptyEntitySprite,
	FuelTankSprite,
	BatterySprite,
	CogSprite,
	InfoSprite;


function loadImages () {
	Title = loadImage("assets/DroneSole_title.png");
	PlayerDrone = loadImage("assets/Drone.png");
	
	doorTileClosed = loadImage("assets/DoorTile_Closed.png");
	doorTileOpen = loadImage("assets/DoorTile_Open.png");
	
	emptyEntitySprite = loadImage("assets/EmptyEntity.png");
	FuelTankSprite = loadImage("assets/FuelTank.png");
	BatterySprite = loadImage("assets/Battery.png");
	CogSprite = loadImage("assets/Cog.png");
	
	InfoSprite = loadImage("assets/InfoBlock.png");
}


function initializeUI () {
	consoleInp = select('#inp_console');
	consoleInp.input(InputUpdate);
	consoleInp.hide();

	let menuButtonsX = 20;
	let menuButtonsY = height/2 + 30;

	let buttonContainer = select('#cnt_menuButtons');
	buttonContainer.position(canvasX + menuButtonsX, canvasY + menuButtonsY);

	playButton = select('#btn_play');
	playButton.mousePressed(StartGame);

	settingsButton = select('#btn_settings');
	settingsButton.mousePressed(GoToSettings);

	howToButton = select('#btn_tutorial');
	howToButton.mousePressed(GoToHowTo);

	toMainButton = select('#btn_menu');
	toMainButton.mousePressed(BackToMain);
	
	bar_propellant = document.getElementById("bar_propellant");
	bar_power = document.getElementById("bar_power");
	bar_damage = document.getElementById("bar_damage");
	let ui_propellant = select('#ui_propellant');
	ui_propellant.position(
		canvasX,
		canvasY+height-ui_propellant.elt.offsetHeight
	);
	let ui_power_damage = select('#ui_power_damage');
	ui_power_damage.position(
		canvasX+width-ui_power_damage.elt.offsetWidth,
		canvasY+height-ui_power_damage.elt.offsetHeight
	);
	
	
	ovr_black = document.getElementById("overlay_black");
}

// TODO: make these DOM elements
function drawUI () {
	pFuel = lerp(pFuel, pTargetFuel, 0.1);
	pPower = lerp(pPower, pTargetPower, 0.2);

	// draw fuel indicator
	bar_propellant.elt.value = pFuel;

	// draw power and DMG sustained indicator  
	bar_power.value = pPower;
	bar_damage.value = pDMGSustain;

//	textSize(18); textAlign(RIGHT);
//	textFont("Verdana");
//	text("Power: " + round(pPower, 2) + "%", 0,-25);
//	text("Damage: " + round(pDMGSustain, 2) * 100 + "%", 0,20);
//
//	fill(50,100,240);
//	if (pPower / maxPower < 0.3) fill(220,50,50);
//	rect(-100,-21, (pPower / maxPower) * 100, 20);
//
//	fill(250,50,50);
//	rect(-100,25, (pDMGSustain / maxDMGSustain) * 100, 20);
//	pop();
}
