"use strict";
var Game =
{
	/**
	 * Fields cared by logic:
	 * height, width
	 * nMaxHandBoxes
	 * instrSet
	 * {init, cur, final} {Pos, GroundColors, GroundBoxes, HandBoxes, Dir}
	 */
	map : null,

	/**
	 * Set the current map.
	 * @param The map to set.
	 * @return Whether succeeded.
	 * This function should be called before any other functions.
	 */
	gameSetMap: (map) =>
	{
		// @TODO: Check whether the map is valid.
		Game.map = map;
		return true;
	},

	/**
	 * Set the map to the initial state.
	 * This function should be called before the player's first instruction is
	 * called.
	 */
	gameInit: () =>
	{
		Game.map.curDir          = Game.map.initDir;
		Game.map.curPos          = Game.map.initPos;
		Game.map.curGroundColors = Game.map.initGroundColors;
		Game.map.curGroundBoxes  = Game.map.initGroundBoxes;
		Game.map.curHandBoxes    = Game.map.initHandBoxes;
	},

	/*
		All instructions called by the player, may throw an Error with message
		'IllegalInstruction'.
	*/

    GameCW    : 14,
    GameCCW   : 15,
	GameUp    : 16,
	GameLeft  : 17,
	GameDown  : 18,
	GameRight : 19,
	
	gameMove: () =>
	{
		if(!Game.map.instrSet[11])
			throw new Error('IllegalInstruction');
		var dir = Game.map.curDir;
		if(dir == Game.GameUp)
		{
			if(Game.map.curPos[0] > 0)
				Game.map.curPos[0]--;
		}
		else if(dir == Game.GameLeft)
		{
			if(Game.map.curPos[1] > 0)
				Game.map.curPos[1]--;
		}
		else if(dir == Game.GameDown)
		{
			if(Game.map.curPos[0] < Game.map.height - 1)
				Game.map.curPos[0]++;
		}
		else if(dir == Game.GameRight)
		{
			if(Game.map.curPos[1] < Game.map.width - 1)
				Game.map.curPos[1]++;
		}
		else
			throw new Error('IllegalState');
		Game.gameCheckFinished();
	},

	gameTurn: (way) =>
	{
		if(way == Game.GameCW && Game.map.instrSet[Game.GameCW])
		{
			Game.map.curDir = (Game.map.curDir + 3) % 4 + 16;
		}
		else if(way == Game.GameCCW && Game.map.instrSet[Game.GameCCW])
		{
			Game.map.curDir = (Game.map.curDir + 1) % 4 + 16;
		}
		else
			throw new Error('IllegalInstruction');
		Game.gameCheckFinished();
	},

	/**
	 * Judge whether the game is finished.
	 * @throw Error 'GameFinished' if finished.
	 * This function is called after every player's instruction.
	 */
	gameCheckFinished: () =>
	{
		if(
			Game.gameFinishedHelper(Game.map.curPos         , Game.map.finalPos         ) &&
			Game.gameFinishedHelper(Game.map.curDir         , Game.map.finalDir         ) &&
			Game.gameFinishedHelper(Game.map.curGroundColors, Game.map.finalGroundColors) &&
			Game.gameFinishedHelper(Game.map.curGroundBoxes , Game.map.finalGroundBoxes ) &&
			Game.gameFinishedHelper(Game.map.curHandBoxes   , Game.map.finalHandBoxes   )
		)
			throw new Error('GameFinished');
	},
	gameFinishedHelper: (cur, fin) =>
	{
		return fin === null || Game.gameFinishedEqual(cur, fin);
	},
	gameFinishedEqual: (a, b) =>
	{
		var isa = Game.isArray(a), isb = Game.isArray(b);
		if(isa && isb)
		{
			if(a.length != b.length)
				return false;
			for(var i = 0; i < a.length; i++)
				if(!Game.gameFinishedEqual(a[i], b[i]))
					return false;
			return true;
		}
		if(!isa && !isb)
			return a == b;
		return false;
	},
	isArray: (o) =>
	{
		return Object.prototype.toString.call(o) == '[object Array]';
	},
};