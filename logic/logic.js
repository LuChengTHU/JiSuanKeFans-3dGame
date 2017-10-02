/**
 * Fields cared by logic:
 * height, width
 * nMaxHandBoxes
 * instrSet
 * {init, cur, final} {Pos, GroundColors, GroundBoxes, HandBoxes}
 */
var gameMap = null;

var GameUp    = 16;
var GameLeft  = 17;
var GameDown  = 18;
var GameRight = 19;

/**
 * Set the current map.
 * @param The map to set.
 * @return Whether succeeded.
 * This function should be called before any other functions.
 */
function gameSetMap(map)
{
	// @TODO: Check whether the map is valid.
	gameMap = map;
	return true;
}

/**
 * Set the map to the initial state.
 * This function should be called before the player's first instruction is
 * called.
 */
function gameInit()
{
	gameMap.curPos          = gameMap.initPos;
	gameMap.curGroundColors = gameMap.initGroundColors;
	gameMap.curGroundBoxes  = gameMap.initGroundBoxes;
	gameMap.curHandBoxes    = gameMap.initHandBoxes;
}

/*
	All instructions called by the player, may throw an Error with message
	'IllegalInstruction'.
*/

function gameMove(dir)
{
	if(!gameMap.instrSet[11])
		throw new Error('IllegalInstruction');
	if(dir == GameUp && gameMap.instrSet[GameUp])
	{
		if(gameMap.curPos[0] > 0)
			gameMap.curPos[0]--;
	}
	else if(dir == GameLeft && gameMap.instrSet[GameLeft])
	{
		if(gameMap.curPos[1] > 0)
			gameMap.curPos[1]--;
	}
	else if(dir == GameDown && gameMap.instrSet[GameDown])
	{
		if(gameMap.curPos[0] < gameMap.height - 1)
			gameMap.curPos[0]++;
	}
	else if(dir == GameRight && gameMap.instrSet[GameRight])
	{
		if(gameMap.curPos[1] < gameMap.width - 1)
			gameMap.curPos[1]++;
	}
	else
		throw new Error('IllegalInstruction');
}

/**
 * Judge whether the game is finished.
 * @throw Error 'GameFinished' if finished.
 * This function is called after every player's instruction.
 */
function gameFinished()
{
	if(
	gameFinishedHelper(gameMap.curPos         , gameMap.finalPos         ) &&
	gameFinishedHelper(gameMap.curGroundColors, gameMap.finalGroundColors) &&
	gameFinishedHelper(gameMap.curGroundBoxes , gameMap.finalGroundBoxes ) &&
	gameFinishedHelper(gameMap.curHandBoxes   , gameMap.finalHandBoxes   )
	)
		throw new Error('GameFinished');
}
function gameFinishedHelper(cur, fin)
{
	return fin === null || gameFinishedEqual(cur, fin);
}
function gameFinishedEqual(a, b)
{
	var isa = isArray(a), isb = isArray(b);
	if(isa && isb)
	{
		if(a.length != b.length)
			return false;
		for(var i = 0; i < a.length; i++)
			if(!gameFinishedEqual(a[i], b[i]))
				return false;
		return true;
	}
	if(!isa && !isb)
		return a == b;
	return false;
}
function isArray(o){
	return Object.prototype.toString.call(o) == '[object Array]';
}
