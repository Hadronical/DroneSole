var Entities = [];


class Entity{
  constructor(x,y, name){
    this.pos = createVector(x,y);
    this.isEntity = true;
    this.isRigid = true; //cannot pass through
    
    if (name != undefined) this.name = name;
    else this.name = "empty_entity";
  }
  
  
  Update(){
    this.Draw();
  }
  
  CheckPlayerCollision(){
    return (p5.Vector.dist(this.pos, pMoveToPos) <= uSize * 0.9);
  }
  
  Draw(){
    push();
    translate(this.pos.x + uSize/2, this.pos.y + uSize/2);
    scale(0.31);
    imageMode(CENTER);
    image(emptyEntitySprite,0,0);
    pop();
  }
}



class Enemy extends Entity{
  constructor(x,y){
    super(x,y, "enemy");
    this.targetPos = this.pos.copy();
    
    this.moveTime = 1.5;
    this.currentMoveTime = this.moveTime;
  }
  
  
  Update(){
    this.Draw();
    lerpPos(this.pos, this.targetPos, 0.075);
    
    if (super.CheckPlayerCollision()){
      pDMGSustain += 0.6;
      ConsoleInform("info - taken damage from " + this.name);
      Entities.splice(Entities.findIndex(entity => entity == this));
    }
    
    this.currentMoveTime -= 0.01;
    if (this.currentMoveTime <= 0 && p5.Vector.dist(pMoveToPos, this.targetPos) <= uSize*5){
      this.Move();
      this.currentMoveTime = this.moveTime;
    }
  }
  
  Move(){
    let targetVec = p5.Vector.sub(pMoveToPos, this.targetPos).normalize();
    
    let component;
    if (abs(targetVec.x) > abs(targetVec.y)) component = targetVec.x;
    else component = targetVec.y;
    let otherComponent;
    if (abs(targetVec.x) < abs(targetVec.y)) otherComponent = targetVec.x;
    else otherComponent = targetVec.y;
    
    let xIsComponent = targetVec.x == component;
    
    targetVec.x = targetVec.x == component ? uSize * Math.sign(targetVec.x) : 0;
    targetVec.y = targetVec.y == component ? uSize * Math.sign(targetVec.y): 0;

    let posInFront = p5.Vector.add(this.targetPos, targetVec);
    let frontTile = CheckForTileAtPos(posInFront.x,posInFront.y);
    let frontEntity = CheckForEntityAtPos(posInFront.x,posInFront.y);
    
    if ((frontTile == undefined || frontTile.type == tType.EMPTY || (frontTile.type == tType.DOOR && frontTile.open)) &&
       (frontEntity == undefined || !frontEntity.isRigid)){
      this.targetPos.add(targetVec);
    }
    else if (frontTile != undefined &&
           ((frontTile.type == tType.DOOR && !frontTile.open) ||
            frontTile.type == tType.WALL ||
            frontTile.type == tType.PUSHABLE) ||
            (frontEntity != undefined && frontEntity.isRigid)){
      if(otherComponent != 0){
        //Check the other direction;
        let targetVec = p5.Vector.sub(pMoveToPos, this.targetPos).normalize();
        
        if (xIsComponent){
          targetVec.x = 0;
          targetVec.y = uSize * Math.sign(targetVec.y);
        }
        else {
          targetVec.x = uSize * Math.sign(targetVec.x);
          targetVec.y = 0;
        }

        let posInFront = p5.Vector.add(this.targetPos, targetVec);
        let frontTile = CheckForTileAtPos(posInFront.x,posInFront.y);
        
        if (frontTile == undefined || frontTile.type == tType.EMPTY || (frontTile.type == tType.DOOR && frontTile.open)){
          this.targetPos.add(targetVec);
        }
        else if ((frontTile.type == tType.DOOR && frontTile.open) || frontTile.type == tType.WALL || frontTile.type == tType.PUSHABLE){
          return;
        }
      }
    }
  }
  
  Draw(){
    push();
    translate(this.pos.x + uSize/2, this.pos.y + uSize/2);
    rectMode(CENTER);
    fill(255,50,50);
    rect(0,0, uSize, uSize);
    pop();
  }
}


class Fuel extends Entity{
  constructor(x,y){ super(x,y, "fuel"); this.isRigid = false; }
  
  Update(){
    this.Draw();
    
    if (super.CheckPlayerCollision()){
      pTargetFuel += 50;
      pTargetFuel = constrain(pTargetFuel, 0, 100);
      Entities.splice(Entities.findIndex(entity => entity == this));
    }
  }
  
  Draw(){
    push();
    translate(this.pos.x + uSize/2, this.pos.y + uSize/2);
    scale(0.3); imageMode(CENTER); fill(255,50,50);
    image(FuelTankSprite, 0,0);
    pop();
  }
}


class Battery extends Entity{
  constructor(x,y){ super(x,y, "battery"); this.isRigid = false; }
  
  Update(){
    this.Draw();
    
    if (super.CheckPlayerCollision()){
      pTargetPower = 100;
      Entities.splice(Entities.findIndex(entity => entity == this));
    }
  }
  
  Draw(){
    push();
    translate(this.pos.x + uSize/2, this.pos.y + uSize/2);
    scale(0.3); imageMode(CENTER); fill(255,50,50);
    image(BatterySprite, 0,0);
    pop();
  }
}


class Repair extends Entity{
  constructor(x,y){ super(x,y, "cog"); this.isRigid = false; }
  
  Update(){
    this.Draw();
    
    if (super.CheckPlayerCollision()){
      pDMGSustain -= 0.3;
      pDMGSustain = constrain(pDMGSustain, 0, 1);
      Entities.splice(Entities.findIndex(entity => entity == this));
    }
  }
  
  Draw(){
    push();
    translate(this.pos.x + uSize/2, this.pos.y + uSize/2);
    scale(0.3); imageMode(CENTER); fill(255,50,50);
    image(CogSprite, 0,0);
    pop();
  }
}



class Informator extends Entity{
  constructor(x,y, info){
    super(x,y, "informator");
    this.info = info;
    
    this.isRigid = false;
  }
  
  Update(){
    this.Draw();
    
    if (super.CheckPlayerCollision()){
      ConsoleInform("info - " + this.info);
      for (var i = 0; i < 5; i++) ConsoleInform("info - ");
      
      Entities.splice(Entities.findIndex(entity => entity == this));
    }
  }
  
  Draw(){
    push();
    translate(this.pos.x + uSize/2, this.pos.y + uSize/2);
    scale(0.31); imageMode(CENTER); fill(255,50,50);
    image(InfoSprite, 0,0);
    pop();
  }
}





//ENTITY FUNCTIONS
function CheckEntityAtPos(entity, x, y) {
  let distX = abs(entity.pos.x - x);
  let distY = abs(entity.pos.y - y);
  return distX <= uSize/2 && distY <= uSize/2;
}
function CheckForEntityAtPos(x, y, entityType){
  let entityReturn;
  
  if (entityType == undefined){
    Entities.forEach(
      entity => { if (CheckEntityAtPos(entity, x, y)) entityReturn = entity; }
    );
  }
  else {
    Entities.forEach(
      entity => {
        if (CheckentityAtPos(entity, x, y) && entity instanceof entityType)
          entityReturn = entity;
    });
  }
  
  return entityReturn;
}



function SetEntityType(x,y, strType){
  if (x == undefined|| y == undefined){
    ConsoleThrowException("err - position not defined");
    return;
  }
  if (strType == undefined){
    ConsoleThrowException("err - type not defined");
    return;
  }
  
  x *= uSize;
  y *= uSize;
  
  let ent = CheckForEntityAtPos(x,y);
  if (ent != undefined){
    let newEntity;
    switch (strType){
      case "emp": newEntity = new Entity(x, y); break;
      case "e": newEntity = new Enemy(x, y); break;
      case "f": newEntity = new Fuel(x, y); break;
      case "b": newEntity = new Battery(x, y); break;
      case "c": newEntity = new Repair(x, y); break;
      default:
        ConsoleThrowException("err - " + strType + " is not valid");
        return;
    }
    
    Entities.splice(Entities.findIndex(entity => entity == ent), 1);
    Entities.push(newEntity);
  }
  else {
    ConsoleThrowException("err - no entity found");
    return;
  }
}


function AddEntity(x,y, strType){
  if (x == undefined|| y == undefined){
    ConsoleThrowException("err - position not defined");
    return;
  }
  if (strType == undefined){
    ConsoleThrowException("err - type not defined");
    return;
  }
  
  x *= uSize;
  y *= uSize;
  
  let newEntity = new Entity(x, y);
  switch (strType){
    case "emp": newEntity = new Entity(x, y); break;
    case "e": newEntity = new Enemy(x, y); break;
    case "f": newEntity = new Fuel(x, y); break;
    case "b": newEntity = new Battery(x, y); break;
    case "c": newEntity = new Repair(x, y); break;
    default:
      ConsoleThrowException("err - " + strType + " is not valid");
      return;
  }
  
  
  let entity = CheckForEntityAtPos(x, y);
  if (entity == undefined) {
    Entities.push(newEntity);
  }
  else {
    ConsoleThrowException("err - entity already exists");
  }
}

//sys.prot: false, set_zoom 0.4, set_entitytype 1 6 b




//