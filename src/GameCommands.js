/*jshint multistr: true */

var Commands;
const GameCommands = new Map();
const CheatCommands = new Map();
const CustomCommands = new Map();

const lpRegex = new RegExp(/\(/g, 'i');
const rpRegex = new RegExp(/\)/g, 'i');
const lbRegex = new RegExp(/\[/g, 'i');
const rbRegex = new RegExp(/\]/g, 'i');

class ConsoleCommand{
  constructor(name, description, invokeMethod){
    this.name = name;
    this.descript = description;
    this.func = invokeMethod;
    
    this.variables = [];
  }
  
  Invoke(mod){
    let params;
    if (Array.isArray(mod)) params = mod;
    else params = [mod];
    this.func.apply(this, params);
  }
}


const CMDS = {
  MOVE : new ConsoleCommand ("move", "Moves player (for/back/lef/ri) (num {int})", PlayerMove),
  ROTATE : new ConsoleCommand ("rotate", "rotate player 90 degrees (l/r)", PlayerRotate),
  INVERT_MOVE : new ConsoleCommand ("invert_move", "inverts movement of player", InvertMovement),
  
  //ACTIONS
  OPENDOOR : new ConsoleCommand ("open", "opens door in front of player", OpenDoor),
  CLOSEDOOR : new ConsoleCommand ("close", "closes door in front of player", CloseDoor),
  SCAN : new ConsoleCommand ("scan", "scans around player for important entities (radius {<= 10})", PlayerScan),
  SET_CONSOLE : new ConsoleCommand ("set_console", "show or hide console (true/false)", SetConsole),
  RESTART : new ConsoleCommand ("level_restart", "restart current level", RestartLevel),
  
  //INFO
  PRINT_POS : new ConsoleCommand ("pos", "prints player pos", PrintPPos),
  LIST_ALL : new ConsoleCommand ("list_all", "prints all commands", ListAllCMDS),
    
  HELP : new ConsoleCommand ("help", "need some help?", PrintHelpMSG),
  SHOW_REDACTED : new ConsoleCommand ("unredact_all", "", ShowRedacted),
  TOGGLE_CHEATS : new ConsoleCommand ("sys.prot:", "system- cheats- anti_all: (true/false)", RemoveCheats),
  
  //CUSTOM CMDS
  MK_CMD : new ConsoleCommand ("def", "create custom commands with specified cmds (name (var,var,...), cmd, cmd, ...)", CreateCustomCMD)
}

//CHEATS
const cheat_CMDS = {  
  SET_DOORSTATE : new ConsoleCommand ("set_doorstate", "sets state of door (x) (y) (o/c)", SetDoorState),
  SET_TILETYPE : new ConsoleCommand ("set_tiletype", "sets type of tile (x) (y) (emp/wal/dor)", SetTileType),
  SET_ENTITYTYPE : new ConsoleCommand ("set_entitytype", "sets type of entity (x) (y) (emp/e/f/b/c)", SetEntityType),
  DESTROY : new ConsoleCommand ("destroy", "destroys tile/entity at position (x) (y)", DestroyObj),
  
  ADD_TILE : new ConsoleCommand ("add_tile", "adds tile at position (x) (y) (emp/wal/dor)", AddTile),
  ADD_ENTITY : new ConsoleCommand ("add_entity", "adds entity at position (x) (y) (emp/e/f/b/c)", AddEntity),
  
  SET_DAMAGE : new ConsoleCommand ("repair", "sets player damage% (num {float})", SetDamage),
  SET_FUEL : new ConsoleCommand ("set_fuel", "sets player fuel (num {float})", SetFuel),
  SET_POWER : new ConsoleCommand ("set_power", "sets player power (num {float})", SetPower),
  
  SET_ZOOM : new ConsoleCommand ("set_zoom", "set the zoom (num {float})", SetZoom),
  SET_LIGHT : new ConsoleCommand ("set_light", "set lights (num {float})", SetLight),
}


//Movement
GameCommands.set(CMDS.MOVE.name, CMDS.MOVE);
GameCommands.set(CMDS.ROTATE.name, CMDS.ROTATE);
GameCommands.set(CMDS.INVERT_MOVE.name, CMDS.INVERT_MOVE);

//INFO
GameCommands.set(CMDS.PRINT_POS.name, CMDS.PRINT_POS);
GameCommands.set(CMDS.LIST_ALL.name, CMDS.LIST_ALL);

//ACTIONS
GameCommands.set(CMDS.OPENDOOR.name, CMDS.OPENDOOR);
GameCommands.set(CMDS.CLOSEDOOR.name, CMDS.CLOSEDOOR);
GameCommands.set(CMDS.SCAN.name, CMDS.SCAN);
GameCommands.set(CMDS.SET_CONSOLE.name, CMDS.SET_CONSOLE);
GameCommands.set(CMDS.RESTART.name, CMDS.RESTART);

//TILES
GameCommands.set(CMDS.HELP.name, CMDS.HELP);
GameCommands.set(CMDS.SHOW_REDACTED.name, CMDS.SHOW_REDACTED);
GameCommands.set(CMDS.TOGGLE_CHEATS.name, CMDS.TOGGLE_CHEATS);

//CUSTOM CMDS
GameCommands.set(CMDS.MK_CMD.name, CMDS.MK_CMD);


//CHEATS
CheatCommands.set(cheat_CMDS.SET_DOORSTATE.name, cheat_CMDS.SET_DOORSTATE);
CheatCommands.set(cheat_CMDS.SET_TILETYPE.name, cheat_CMDS.SET_TILETYPE);
CheatCommands.set(cheat_CMDS.SET_ENTITYTYPE.name, cheat_CMDS.SET_ENTITYTYPE);
CheatCommands.set(cheat_CMDS.DESTROY.name, cheat_CMDS.DESTROY);

CheatCommands.set(cheat_CMDS.ADD_TILE.name, cheat_CMDS.ADD_TILE);
CheatCommands.set(cheat_CMDS.ADD_ENTITY.name, cheat_CMDS.ADD_ENTITY);

CheatCommands.set(cheat_CMDS.SET_DAMAGE.name, cheat_CMDS.SET_DAMAGE);
CheatCommands.set(cheat_CMDS.SET_FUEL.name, cheat_CMDS.SET_FUEL);
CheatCommands.set(cheat_CMDS.SET_POWER.name, cheat_CMDS.SET_POWER);

CheatCommands.set(cheat_CMDS.SET_ZOOM.name, cheat_CMDS.SET_ZOOM);
CheatCommands.set(cheat_CMDS.SET_LIGHT.name, cheat_CMDS.SET_LIGHT);


Commands = new Map(GameCommands);




function InvertMovement() { if (inverted) inverted = false; else inverted = true; }
function SetConsole(on) { consoleOn = on; }
function SetKeyboardInput(on) { keyboardInp = on; }
function SetZoom(newZoom) { zoom = newZoom; }
function SetLight(newLight) { light = newLight; }
function SetDamage(newDMGSustain) { pDMGSustain = newDMGSustain; }


function InputRegexTest(input){
  let possibleCmds = [];
  
  if (input == '') return;
    
  let inputAdj = input.replace(lpRegex, ' ').replace(rpRegex, '').replace(lbRegex, ' ').replace(rbRegex, '');
  let inputRegex = new RegExp(inputAdj, 'i');
  
  Commands.forEach(cmd => {
    if (cmd != CMDS.TOGGLE_CHEATS || !redact){
      if (inputRegex.test(cmd.name)) possibleCmds.push(cmd.name + '\n\t' + cmd.descript);
      else{
        let cmdRegex = new RegExp(cmd.name, 'i');
        if (cmdRegex.test(input)) possibleCmds.push(cmd.name + '\n\t' + cmd.descript);
      }
    }
  });
  CustomCommands.forEach(cmd => {
    if (inputRegex.test(cmd.name)) possibleCmds.push(cmd.name + '\n\t' + cmd.descript);
    else{
      let cmdRegex = new RegExp(cmd.name, 'i');
      if (cmdRegex.test(input)) possibleCmds.push(cmd + '\n\t' + cmd.descript);
    }
  });
  
  return possibleCmds;
}


function PrintPPos(){
  ConsoleInform("info - " + floor(pPos.x / uSize) + ", " + floor(pPos.y / uSize));
}


function DestroyObj(x,y){
  x *= uSize;
  y *= uSize;

  if (CheckForEntityAtPos(x,y) == undefined && CheckForTileAtPos(x,y) == undefined){
    ConsoleInform("info - nothing to destroy at " + x/uSize + ", " + y/uSize);
    return;
  }
  
  
  if (CheckForEntityAtPos(x,y) != undefined){
    Entities.splice(
      Entities.findIndex(entity => entity == CheckForEntityAtPos(x,y)),
      1
    );
  }
  
  if (CheckForTileAtPos(x,y) != undefined){
    Tiles.splice(
      Tiles.findIndex(tile => tile == CheckForTileAtPos(x,y)),
      1
    );
  }
}



//CUSTOM COMMANDS
function CreateCustomCMD(CMDSstr){
  let newInputCMDs = CMDSstr.split(', ');
  let CMDANDVariables = newInputCMDs[0].replace(lpRegex, '').replace(rpRegex, '');
  let splitCMDS = CMDANDVariables.split(' ');
  
  let newCustomCMDName = splitCMDS[1];
  let customVariables = []
  
  //Remove 'def' and new name
  splitCMDS.splice(0,2);
  
  //Store custom var names as regex, for later
  if (splitCMDS.length > 0){    
    splitCMDS.forEach(
      variable => {
        customVariables.push(new RegExp(variable, 'i'));
    });
  }
  
  //Remove initializer statement
  newInputCMDs.splice(0,1);
  
  for (var i = 0; i < newInputCMDs.length; i++){        
    //Check commands valid
    let newInputCMD = newInputCMDs[i].split(' ')[0];
    if (!Commands.get(newInputCMD)){
      ConsoleThrowException("err - " + newInputCMD + " is not a valid cmd");
      return;
    }
  }
  
  
  let newCMD = new ConsoleCommand (newCustomCMDName, newInputCMDs, RunCustomCommand);
  newCMD.variables = customVariables;
  CustomCommands.set(newCustomCMDName, newCMD);
  ConsoleInform("info - made new command: " + newCustomCMDName);
}



function RunCustomCommand(customCMD, variableValues){
  let CMDSections = customCMD.descript;
      
  //Replace each custom variable with value
  CMDSections.forEach(
    section => {
      for (var i = 0; i < customCMD.variables.length; i++){
        if (variableValues != undefined && variableValues[i] != undefined){
          
          if (!isNaN(variableValues[i])) variableValues[i] = parseFloat(variableValues[i]);

          //If mod is a boolean, parse as corresponding boolean
          if (regexTrue.test(variableValues[i]))
            variableValues[i] = true;
          else if (regexFalse.test(variableValues[i]))
            variableValues[i] = false;
          
          section = section.replace(customCMD.variables[i], variableValues[i]);
        }
        else{
          ConsoleThrowException("err - " + customCMD.variables[i].toString()[1] + " is not defined");
          return;
        }
      }

      ReadConsoleInput(section);
  });
}


function ListAllCMDS(){
  Commands.forEach(
    cmd =>{
      if ((cmd != CMDS.TOGGLE_CHEATS && cmd != CMDS.SHOW_REDACTED) || !redact) ConsoleInform("info - " + cmd.name, 10);
  });
}




var helpMSG = "\n\
Sooo, you want some help?\n\
- [esc] pauses / escapes console\n\
- [~] brings up the console\n\
- type cmds into console\n\
- read the suggestions\n\
- 'list_all' for all cmds\n\
- ' ' between cmd and variables\n\
- don't type '()' in cmds unless for 'def' variables\n\
- 'mk_cmd' for custom cmds\n\n\
\
- [REDACTED]\n\
- 'unredact_all' to [REDACTED]\n\n\
\
Good luck :)\
";

var redact = true;


function PrintHelpMSG(){
  prevCmd.push(helpMSG);
  for (var i = 0; i < 16; i++){ ConsoleInform("info - "); }
}


function ShowRedacted(){
  let unredactor = new RegExp('REDACTED','i');
  helpMSG = helpMSG.replace(unredactor, "type 'sys.prot: false' for cheats :D have fun");
  helpMSG = helpMSG.replace(unredactor, "unredact all");
  redact = false;
  
  ConsoleInform("info - unredacted: all");
}


function RemoveCheats(remove){
  if (typeof remove != "boolean" ){
    ConsoleThrowException("err - " + remove + " is not valid");
    return;
  }
  
  
  if (!remove){
    //Merge game and cheat commands
    let temp1 = Array.from(GameCommands);
    let temp2 = Array.from(CheatCommands);
    temp1 = temp1.concat(temp2);
    
    Commands = new Map(temp1);
    
    ConsoleThrowException("err - system.prot diabled");
  }
  else{
    Commands = new Map(GameCommands);
  }
}





//