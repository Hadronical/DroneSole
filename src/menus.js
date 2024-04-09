function MainMenu () {
	background(20);


	playButton.show();
	settingsButton.show();
	howToButton.show();
	toMainButton.hide();


	push();
	imageMode(CENTER);
	image(Title, width/2, height/2 - 100);
	pop();
}


function Pause () {
	background(10,15);

	playButton.show();
	settingsButton.show();
	howToButton.show();
	toMainButton.show();

	push();
	fill(255);
	textSize(100); textAlign(CENTER);
	text("PAUSED", width/2, height/2 - 100);
	pop();
}


function Settings () {
	background(0);

	playButton.hide();
	settingsButton.hide();
	howToButton.hide();
	toMainButton.show();

	push();
	fill(255);
	textSize(60); textAlign(CENTER);
	text("SETTINGS", width/2, height/2 - 120);

	fill(200);
	textSize(15); textAlign(CENTER);
	text(
		"hmmm, there seems to be no settings for you to mess with, :(... yet",
		width/2,
		height/2 - 20
	);


	textAlign(LEFT);
	if (prevScene == 2){
		text("[esc] to go back", 10, height - 20);
	}

	pop();
}


function HowToPlayScreen () {
	background(0);

	playButton.hide();
	settingsButton.hide();
	howToButton.hide();
	toMainButton.show();

	push();
	fill(255);
	textSize(60); textAlign(CENTER);
	text("HOW TO PLAY", width/2, height/2 - 120);

	fill(200);
	textSize(15); textAlign(CENTER);
	text(
		"Ok so look, I'm lazy, just type 'help' into your console... type [~]",
		width/2,
		height/2 - 20);

	textAlign(LEFT);
	if (prevScene == 2){
		text("[esc] to go back", 10, height - 20);
	}

	pop();
}


function LevelCompleteScreen () {
	background(10,10);

	playButton.show();
	settingsButton.show();
	howToButton.show();
	toMainButton.show();

	consoleOn = false;  

	push();
	textAlign(CENTER);
	fill(255);
	noStroke();
	textSize(30);
	textFont("Verdana");
	text("Level Complete!", width/2, height/2 - 50)
	pop();
}


function GameOverScreen () {
	background(10,10);

	playButton.show();
	settingsButton.show();
	howToButton.show();
	toMainButton.show();

	consoleOn = false;  

	push();
	textAlign(CENTER); textSize(30);
	fill(255); noStroke();
	textFont("Verdana");
	text("GAMEOVER!", width/2, height/2 - 50);
	pop();

	Level = 0;
	LoadMapStr(Level);
}


function GameCompleteScreen () {
	background(10);

	playButton.show();
	settingsButton.show();
	howToButton.show();
	toMainButton.show();

	consoleOn = false;  

	push();
	textAlign(CENTER); textSize(30);
	fill(255); noStroke();
	textFont("Verdana");
	text("ALL LEVELS COMPLETED", width/2, height/2 - 50);

	textSize(20);
	text("Thank you for playing :)", width/2, height/2);
	pop();
}


//Scene switch functions
function SetScene (scene) {
	prevScene = currentScene;
	currentScene = scene;
}

function PreviousScene () {
	SetScene(prevScene);
}

function BackToMain(){ SetScene(0); prevCmd = []; }
function StartGame(){ SetScene(1); }
function GoToSettings(){ SetScene(5); }
function GoToHowTo(){ SetScene(4); }
function PauseGame(){ SetScene(2); }
function CompleteLevel() { SetScene(3); }
function EndGame(){ SetScene(6); }
function GameOver(){ SetScene(7); }


function LevelComplete () {
	if (Level == Maps.length - 1) {
		EndGame();
	}
	else {
		CompleteLevel();
	}

	fadeAlpha = 255;

	zoom = 4;
	pTargetFuel = 100;
	pTargetPower = 100;
	pDMGSustain = 0;

	Level++;
	LoadMapStr(Level);
}


function RestartLevel () {
	LoadMapStr(Level);
}


var fadeAlpha = 255;
function FadeScreen () {
	fadeAlpha -= 2;

	push();
	background(0, fadeAlpha);
	textAlign(CENTER); textSize(80);
	fill(250, fadeAlpha); noStroke();
	if (Level > 0) 
		text("Level " + Level, width/2, height/2 - 20);
	else 
		text("Tutorial", width/2, height/2 - 20);
	pop();
}
