var assert = console.assert;

try
{
	gameInit();
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

assert(gameSetMap(map));
gameInit();
try
{
	gameMove(GameRight);
}
catch(e)
{
	assert(e.message == 'GameFinished');
}

gameInit();
gameMove(GameLeft);
gameMove(GameLeft);
gameMove(GameLeft);
gameMove(GameLeft);
gameMove(GameRight);
try
{
	gameMove(GameRight);
}
catch(e)
{
	assert(e.message == 'GameFinished');
}
