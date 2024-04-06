/*jshint multistr: true */

const TestMap = "\
wwwwwwwwwwww\
wE00d0d0000w\
w000www0000w\
wwwww000p00w\
w0000000000w\
w000000P000w\
w0000000000w\
w0000000000w\
w0000000000w\
wwwwww00000w\
00000we0000w\
00000wwwwwww\
000000000000";

const TutorialMap = "\
wwwwwwwwwww0\
w00d0E0000w0\
ww0wwwwwwww0\
wf000000f0w0\
wwwwwiwwwww0\
w0000P0000w0\
w000000000w0\
w000000000w0\
w000000000w0\
wwwwwwwwwww0";

const Map1 = "\
wwwwwwwwwwww\
wE00fd0f000w\
wwwwwwwwwwfw\
w0f0000f000w\
ww0wwwwwwwww\
w0bwf000f00w\
wfww0000000w\
wd000000000w\
wwwwwww0000w\
wPwwwww0f00w\
w00000d0000w\
wwwwwwwwwwww";

const Map2 = "\
www000000000\
wEw000000000\
www000000000\
wiw000000000\
wPw000000000\
www000000000";

const Map3 = "\
wwwwwww00000\
wPwddEw00000\
w0wwwww00000\
w0wddbw00000\
wdddwfw00000\
wwwwwww00000";

const Map4 = "\
wwwwwwwwww00\
w000oEo00w00\
w0000w000w00\
w00iwPw00w00\
w0000w000w00\
w00000000w00\
wwwwwwwwww00";

const Map5 = "\
wwwwwwwwwwww\
w0eeeEeee00w\
w0eeeeeee00w\
we000000000w\
w00ccccc000w\
w00ccPic000w\
wwwwwwwwwwww";

const Map6 = "\
wwwwwwwwwwww\
w0eeeEeee00w\
w0eeeeeee00w\
we000000000w\
w0000ww0000w\
w0000000000w\
w00000ccciPw\
wwwwwwwwwwww";

const Map7 = "\
wwwwwwwwwwww\
wE000d00000w\
wwwwwwwwww0w\
w0000000000w\
ww0wwwwwwwww\
w0bw0000f00w\
w0ww0000000w\
wd000cb0000w\
wwwwwww0f00w\
wPwwwww0000w\
wi0000d0000w\
wwwwwwwwwwww";

const Map8 = "\
wwwwwwwwwwww\
wE00e000000w\
wEe0w000000w\
wEe0w000000w\
wEe0wc00000w\
wEe0wc0000Pw\
wEe0wc00000w\
wEe0wc00000w\
wEe0wc000-0w\
wwwwwwwwwwww";

const Map9 = "\
wwwwwwwwwww0\
w000dEd000w0\
w0wwwwwww0w0\
wf00000000w0\
wwwwwddwwww0\
w000000000w0\
w000000000w0\
w00e0P0e00w0\
w000e0e000w0\
wwwwwwwwwww0";

const Map10 = "\
wwwwwwwwwww0\
w000000000w0\
w000000000w0\
w0000P0000w0\
w000000000w0\
w000000000w0\
wwwwwwwwwww0\
w000000000w0\
w000000000w0\
000000000000\
000000000000\
00000E000000";

const Maps = [
  TutorialMap, Map1,
  Map2, Map3, Map4,
  Map5, Map6, Map7,
  Map8, Map9, Map10
];

const Info = [
"- these blocks give hints \n\t\t\t\
- use 'scan' for info \n\t\t\t\
- 'open'/'close' doors \n\t\t\t\
- fuel tanks give fuel \n\t\t\t\
- batteries give power \n\t\t\t\
- 'move for' costs least",

"- whats 'def'?",
  
"- have you checked 'help' yet? \n\t\t\t\
- you might need your 'pos'",
  
"- try 'set_entitytype' on those empties",
  
"",

"- cogs can 'repair' you",
  
"- cogs can 'repair' you, but...",

"- you've been here before \n\t\t\t\
- hmm 'light's are out"
];


function LoadMapStr(mapIndex){
  if (mapIndex == 7) light = 0.1;
  LoadMap(mapIndex);
}



function LoadMap(map){
  let mapStr = Maps[map];
  
  Tiles = [];
  Entities = [];
    
  [].forEach.call(mapStr, (char, i) => {
      let x = uSize*(i%mapWidth);
      let y = uSize*(floor(i/mapWidth));
      switch (char){
        //TILES
        case 'w': Tiles.push(new Tile(x,y, tType.WALL)); break;
        case 'd': Tiles.push(new Tile(x,y, tType.DOOR)); break;
        case 'p': Tiles.push(new Tile(x,y, tType.PUSHABLE)); break;
        case 'E': endPos = createVector(x,y); break;
        case 'P': pPos = createVector(x,y);  break;
        
        //ENTITIES
        case 'o': Entities.push(new Entity(x,y)); break;
        case 'e': Entities.push(new Enemy(x,y)); break;
        case 'f': Entities.push(new Fuel(x,y)); break;
        case 'b': Entities.push(new Battery(x,y)); break;
        case 'c': Entities.push(new Repair(x,y)); break;
        case 'i':
          Entities.push(new Informator(x,y, Info[map]));
          break;
      }
  });
  
  pMoveToPos = pPos.copy();
  
  Tiles.forEach(
    tile => {
      if (tile.type == tType.DOOR)
        Doors.push(tile);
  });
}




//