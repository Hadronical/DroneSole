class Tile {
  constructor(x,y, type){
    this.pos = createVector(x,y);
    this.type = type;
    
    if (this.type == tType.DOOR){
      this.open = false;
      this.isEntity = true;
      this.name = "door";
    }
    
    if (this.type == tType.PUSHABLE){
      this.targetPos = this.pos.copy();
      this.isEntity = true;
      this.name = "pushable";
    }
  }
  
  
  Update(){
    this.Draw();
    
    if (this.type == tType.PUSHABLE){
      this.pos.x = lerp(this.pos.x, this.targetPos.x, 0.075);
      this.pos.y = lerp(this.pos.y, this.targetPos.y, 0.075);
    }
  }
  
  CheckMove(dir){
    let posInDir = p5.Vector.add(this.pos, dir);
    let frontTile = CheckForTileAtPos(posInDir.x,posInDir.y);

    if (frontTile == undefined || frontTile.type == tType.EMPTY || (frontTile.type == tType.DOOR && frontTile.open)){
        return true;
    }
    else if ((frontTile.type == tType.DOOR && frontTile.open) || frontTile.type == tType.WALL){
      ConsoleInform("info - something is in the way");
      return false;
    }
    else if (frontTile.type == tType.PUSHABLE){
      return (frontTile.CheckMove(p5.Vector.mult(posFromDir, uSize*steps)));
    }
  }
  
  
  Draw(){
    switch (this.type){
      case tType.EMPTY:
        return;
        
      case tType.WALL:
        push();
        translate(this.pos.x + uSize/2, this.pos.y + uSize/2);
        fill(15); stroke(10); strokeWeight(2); rectMode(CENTER);
        rect(0,0, uSize,uSize);
        pop();
        break;
        
      case tType.DOOR:
        if (!this.open){
          push();
          translate(this.pos.x + uSize/2,this.pos.y + uSize/2);
          scale(0.35); imageMode(CENTER);
          image(doorTileClosed, 0,0);
          
          textAlign(CENTER); textSize(30); fill(255,20,20); textStyle(BOLD);
          text(this.pos.x/uSize + ' ' + this.pos.y/uSize, 0,12);
          pop();
        }
        else {
          push();
          translate(this.pos.x + uSize/2,this.pos.y + uSize/2);
          scale(0.345); imageMode(CENTER);
          image(doorTileOpen, 0,0);
          
          textAlign(CENTER); textSize(30); fill(20,255,20); textStyle(BOLD);
          text(this.pos.x/uSize + ' ' + this.pos.y/uSize, 0,12);
          pop();
        }
        break;
      
      case tType.PUSHABLE:
        push();
        translate(this.pos.x + uSize/2, this.pos.y + uSize/2);
        fill(25); stroke(50); rectMode(CENTER);
        rect(0,0, uSize,uSize);
        pop();
        break;
    }
  }
}


var Tiles = [],
    Doors = [];


const tType = {
  EMPTY : "empty",
  WALL : "wall",
  DOOR : "door",
  PUSHABLE : "pushable"
}


//TILE FUNCTIONS
function CheckTileAtPos(tile, x, y) {
  let distX = abs(tile.pos.x - x);
  let distY = abs(tile.pos.y - y);
  return distX <= uSize/2 && distY <= uSize/2;
}
function CheckForTileAtPos(x, y, type){
  let tileReturn;
  
  if (type == undefined){
    Tiles.forEach(
      tile => { if (CheckTileAtPos(tile, x, y)) tileReturn = tile; }
    );
  }
  else {
    Tiles.forEach(
      tile => {
        if (CheckTileAtPos(tile, x, y) && tile.type == type)
          tileReturn = tile;
    });
  }
  
  return tileReturn;
}


function SetTileType(x,y, strType){
  if (x == undefined|| y == undefined){
    ConsoleThrowException("err - position not defined");
    return;
  }
  if (strType == undefined){
    ConsoleThrowException("err - type not defined");
    return;
  }
  
  let newType;
  switch (strType){
    case "emp": newType = tType.EMPTY; break;
    case "wal": newType = tType.WALL; break;
    case "dor": newType = tType.DOOR; break;
    default:
      ConsoleThrowException("err - " + strType + " is not valid");
      return;
  }
  
  let tile = CheckForTileAtPos(x * uSize, y * uSize);
  if (tile != undefined) tile.type = newType;
  else {
    ConsoleThrowException("err - no tile found");
  }
}


function AddTile(x,y, strType){
  if (x == undefined|| y == undefined){
    ConsoleThrowException("err - position not defined");
    return;
  }
  if (strType == undefined){
    ConsoleThrowException("err - type not defined");
    return;
  }
  
  let newType;
  switch (strType){
    case "emp": newType = tType.EMPTY; break;
    case "wal": newType = tType.WALL; break;
    case "dor": newType = tType.DOOR; break;
    default:
      ConsoleThrowException("err - " + strType + " is not valid");
      return;
  }
  
  x *= uSize;
  y *= uSize;
  
  let tile = CheckForTileAtPos(x, y);
  if (tile == undefined) Tiles.push(new Tile(x,y, newType));
  else {
    ConsoleThrowException("err - tile already exists");
  }
}



//----------DOOR FUNCTIONS----------//
function SetDoorState(x,y, state){
  if (x == undefined|| y == undefined)
    ConsoleThrowException("err - door position not defined");
  if (state == undefined)
    ConsoleThrowException("err - door state not defined");
  
  let newState = false;
  if (state == 'o') newState = true;
  
  let door = CheckForTileAtPos(x * uSize, y * uSize, tType.DOOR);
  if (door != undefined) door.open = newState;
  else {
    ConsoleThrowException("err - no door found");
  }
}



//Open / close doors
function OpenDoor(){
  if (pTargetPower - 5 < 0){
    ConsoleInform("info - not enough power");
    return;
  }
  
  let posFromPDir = createVector(cos(pTargetRot), sin(pTargetRot)).mult(uSize);
  let posInFront = p5.Vector.add(pPos, posFromPDir);

  let door = CheckForTileAtPos(posInFront.x,posInFront.y, tType.DOOR);
  if (door != undefined) {
    door.open = true;
    pTargetPower -= 5;
  }
  else {
    ConsoleThrowException("err - no door found");
  }
}

function CloseDoor(){
  if (pTargetPower - 5 < 0){
    ConsoleInform("info - not enough power");
    return;
  }
  
  let posFromPDir = createVector(cos(pTargetRot), sin(pTargetRot)).mult(uSize);
  let posInFront = p5.Vector.add(pPos, posFromPDir);
  
  let door = CheckForTileAtPos(posInFront.x,posInFront.y, tType.DOOR);
  if (door != undefined) {
    door.open = false;
    pTargetPower -= 5;
  }
  else{
    ConsoleThrowException("err - no door found");
  }
}




//