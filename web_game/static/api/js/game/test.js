var assert = console.assert;

try
{
	Game.gameInit();
	assert(false);
}
catch(e)
{
}

var map = new Object();
map.height = 2;
map.width = 3;
map.nMaxHandBoxes = 4;
map.instrSet = new Array(100);
for(var i = 0; i < 100; i++)
	map.instrSet[i] = true;
map.initPos = [1, 1];
map.finalPos = [1, 2];
map.initGroundColors = [[0, 0, 0], [0, 0, 0]];
map.finalGroundColors = null;
map.initGroundBoxes = [[null, null, null], [null, null, null]];
map.finalGroundBoxes = null;
map.initHandBoxes = [];
map.finalHandBoxes = null;
map.initDir = 16;

assert(Game.gameSetMap(map));
Game.gameInit();
try
{
	Game.gameMove();
}
catch(e)
{
	console.log(e);
	assert(e.message == 'GameFinished');
}

Game.gameInit();
Game.gameMove();
Game.gameMove();
Game.gameMove();
Game.gameMove();
Game.gameMove();

Game.gameTurn(Game.GameCCW);
Game.gameTurn(Game.GameCCW);
Game.gameMove();
Game.gameMove();
Game.gameTurn(Game.GameCCW);
try
{
	Game.gameMove();
	// assert(false);
}
catch(e)
{
	assert(e.message == 'GameFinished');
}
console.log(Game.map.curPos);
