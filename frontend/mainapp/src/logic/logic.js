export default class Game {
	/**
	 * Fields cared by logic:
	 * height, width
	 * nMaxHandBoxes
	 * instrSet
	 * {init, cur, final} {Pos, GroundColors, GroundBoxes, HandBoxes, Dir}
	 */
	// map : null;

	/**
	 * Set the current map.
	 * @param The map to set.
	 * @return Whether succeeded.
	 * This function should be called before any other functions.
	 */
	static gameSetMap(map)
	{
		Game.GameCW    = 14;
		Game.GameCCW   = 15;
		Game.GameUp    = 16;
		Game.GameLeft  = 17;
		Game.GameDown  = 18;
		Game.GameRight = 19;
		// @TODO: Check whether the map is valid.
		Game.map = map;
		window.ui.createMap(map.height, map.width);
		window.ui.createPlayer(map.initPos[0], map.initPos[1]);
		return true;
	}

	/**
	 * Set the map to the initial state.
	 * This function should be called before the player's first instruction is
	 * called.
	 */
	static gameInit()
	{
		Game.map.curDir          = Game.map.initDir;
		Game.map.curPos          = Game.map.initPos.slice(0);
		Game.map.curGroundColors = Game.map.initGroundColors.slice(0);
		Game.map.curGroundBoxes  = Game.map.initGroundBoxes.slice(0);
		Game.map.curHandBoxes    = Game.map.initHandBoxes.slice(0);
		
		window.ui.createPlayer(Game.map.curPos[0], Game.map.curPos[1]);
		if(Game.map.curDir === Game.GameUp)
			window.ui.setPlayerDirection(-1, 0);
		if(Game.map.curDir === Game.GameLeft)
			window.ui.setPlayerDirection(0, -1);
		if(Game.map.curDir === Game.GameDown)
			window.ui.setPlayerDirection(1, 0);
		if(Game.map.curDir === Game.GameRight)
			window.ui.setPlayerDirection(0, 1);
	}

	/*
		All instructions called by the player, may throw an Error with message
		'IllegalInstruction'.
	*/
	
	static gameMove()
	{
		if(!Game.map.instrSet[11])
			throw new Error('IllegalInstruction');
		let dir = Game.map.curDir;
		console.log(dir);
		console.log(Game.GameUp);
		if(dir === Game.GameUp)
		{
			if(Game.map.curPos[0] > 0)
			{
				Game.map.curPos[0]--;
				window.ui.playerMoveForward();
			}
		}
		else if(dir === Game.GameLeft)
		{
			if(Game.map.curPos[1] > 0)
			{
				Game.map.curPos[1]--;
				window.ui.playerMoveForward();
			}
		}
		else if(dir === Game.GameDown)
		{
			if(Game.map.curPos[0] < Game.map.height - 1)
			{
				Game.map.curPos[0]++;
				window.ui.playerMoveForward();
			}
		}
		else if(dir === Game.GameRight)
		{
			if(Game.map.curPos[1] < Game.map.width - 1)
			{
				Game.map.curPos[1]++;
				window.ui.playerMoveForward();
			}
		}
		else
			throw new Error('IllegalState');
		Game.gameCheckFinished();
	}

	static gameTurn(way)
	{
		console.log(way);
		console.log(Game.GameCW);
		console.log(Game.map.instrSet[Game.GameCW]);
		if(way === Game.GameCW && Game.map.instrSet[Game.GameCW])
		{
			Game.map.curDir = (Game.map.curDir + 1) % 4 + 16;
			window.ui.playerTurnCW();
		}
		else if(way === Game.GameCCW && Game.map.instrSet[Game.GameCCW])
		{
			Game.map.curDir = (Game.map.curDir + 3) % 4 + 16;
			window.ui.playerTurnCCW();
		}
		else
			throw new Error('IllegalInstruction');
		Game.gameCheckFinished();
	}

	/**
	 * Judge whether the game is finished.
	 * @throw Error 'GameFinished' if finished.
	 * This function is called after every player's instruction.
	 */
	static gameCheckFinished()
	{
		if(
			Game.gameFinishedHelper(Game.map.curPos         , Game.map.finalPos         ) &&
			Game.gameFinishedHelper(Game.map.curDir         , Game.map.finalDir         ) &&
			Game.gameFinishedHelper(Game.map.curGroundColors, Game.map.finalGroundColors) &&
			Game.gameFinishedHelper(Game.map.curGroundBoxes , Game.map.finalGroundBoxes ) &&
			Game.gameFinishedHelper(Game.map.curHandBoxes   , Game.map.finalHandBoxes   )
		)
			throw new Error('GameFinished');
	}
	static gameFinishedHelper(cur, fin)
	{
		return fin === null || Game.gameFinishedEqual(cur, fin);
	}
	static gameFinishedEqual(a, b)
	{
		let isa = Game.isArray(a), isb = Game.isArray(b);
		if(isa && isb)
		{
			if(a.length != b.length)
				return false;
			for(let i = 0; i < a.length; i++)
				if(!Game.gameFinishedEqual(a[i], b[i]))
					return false;
			return true;
		}
		if(!isa && !isb)
			return a == b;
		return false;
	}
	static isArray(o)
	{
		return Object.prototype.toString.call(o) == '[object Array]';
	}
    // static gameTurn(x) {
        // console.log('gameTurn'+x);        
    // }
    // static gameMove()  {
        // console.log('gameMove');        
    // }
}
