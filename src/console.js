function DrawCommandPromptWindow(x,y, sizeX,sizeY) {
	if (consoleOn) {
		push();
		translate(x,y);
		noStroke();

		fill(50,220);
		stroke(255);
		rect(0,2, sizeX + 6,sizeY);

		let np = prevCmd.length;
		if (np > 50) prevCmd.splice(0,1);
		for (let p = 0; p < np; p++) {
			push();
			noStroke();
			textFont("Courier New");

			let errCheck = new RegExp("err", 'i');
			let infoCheck = new RegExp("info - ", 'i');

			textSize(12);
			let prev = prevCmd[p];
			if (Array.isArray(prevCmd[p])) {
				textSize(prevCmd[p][1] != undefined ? prevCmd[p][1] : 12);
				prev = prevCmd[p][0];
			}

			if (errCheck.test(prev)) {
				fill(255,50,50); textStyle(BOLD);
			}
			else if (infoCheck.test(prev)) {
				fill(200); textStyle(ITALIC);
				prev = '\t\t\t' + prev.replace(infoCheck, '');
			}
			else {
				fill(10,250,10);
				prev = '> ' + prev;
			}


			if (prev != undefined && sizeY - (np - p) * 16 > 0) {
				text(prev, 2, sizeY - (np - p) * 16, consoleWidth);
			}
			pop();
		}

		let ns = cmdSuggestions.length;
		for (let s = 0; s < ns; s++) {
			push();
			fill(200); noStroke(); textFont("Courier New");
			text(cmdSuggestions[s], 2, sizeY + (ns - s) * 32 + 10);
			pop();
		}

		consoleInp.position(canvasX + x + 1, sizeY + y + 4 + canvasY);
		consoleInp.size(sizeX);
		consoleInp.show();

		push();
		fill(50,220); stroke(20, 220); strokeWeight(5);
		rect(3,5, sizeX,20);

		fill(200); noStroke(); textAlign(CENTER); textSize(14);
		text("CONSOLE", sizeX/2,20);
		pop();
		pop();
	}
	else { consoleInp.hide(); }
}

const regexTrue = /true/i;
const regexFalse = /false/i;

function ReadConsoleInput (str) {
	let mkRegex = new RegExp('def', 'i');
	if (mkRegex.test(str)) {
		prevCmd.push(consoleInp.value());

		Commands.get("def").Invoke(str);

		consoleInp.value("");
		return;
	}

	//Draw new input as previous command to display
	prevCmd.push(str);

	//Check for mutiple commands (same line)
	let possibleCMDs = str.split(', ');

	for (let CMD = 0; CMD < possibleCMDs.length; CMD++) {
		//Splits input on ' ' character
		let newInputCMD = possibleCMDs[CMD].split(' ');

		//Is custom command
		if (CustomCommands.get(newInputCMD[0])) {
			let CustomCMD = CustomCommands.get(newInputCMD[0]);
			//Get letiables
			newInputCMD.splice(0,1);

			prevCmd.push(consoleInp.value());

			CustomCMD.Invoke([CustomCMD, newInputCMD]);

			consoleInp.value("");
			return;
		}


		// check cmd in Commands and modifiers as invoke parameters
		for (let i = 0; i < newInputCMD.length; i++) {
			// if mod is a number, parse as a float
			if (!isNaN(newInputCMD[i])) newInputCMD[i] = parseFloat(newInputCMD[i]);

			// if mod is a boolean, parse as corresponding boolean
			if (regexTrue.test(newInputCMD[i]))
				newInputCMD[i] = true;
			else if (regexFalse.test(newInputCMD[i]))
				newInputCMD[i] = false;

			if(isNaN(newInputCMD[i]) && typeof newInputCMD[i] == "number") newInputCMD.splice(i,1);

			// if all others do not apply, use modifier as it is
		}


		//Get command base
		let newInput = newInputCMD[0];

		//Get modifiers
		newInputCMD.splice(0,1);

		//Invoke command
		if (Commands.get(newInput)) {
			//With array of modifiers as params
			Commands.get(newInput).Invoke(newInputCMD);
		}
	}


	consoleInp.value("");
}

function InputUpdate () {
	cmdSuggestions = [];
	if (consoleInp.value().length > 0) {
		let str = consoleInp.value();
		cmdSuggestions = InputRegexTest(str);
		cmdSuggestions.sort(
			(a,b) => { return b.length - a.length; }
		);
	}
}

function ConsoleThrowException (err) {
	prevCmd.push(err);
}

function ConsoleInform (info, size) {
	prevCmd.push([info, size]);
}
