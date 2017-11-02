export default class Game {
	/**
	 * Fields cared by logic:
	 * height, width
	 * nMaxHandBoxes
	 * instr_set
	 * {init, cur, final} {Pos, GroundColors, GroundBoxes, HandBoxes, Dir}
	 */
	// map : null;

	/**
	 * Set the current map.
	 * @param map The map to set.
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
		window.ui.createPlayer(map.init_pos[0], map.init_pos[1]);
		return true;
	}

	/**
	 * Set the map to the initial state.
	 * This function should be called before the player's first instruction is
	 * called.
	 */
	static gameInit()
	{
		Game.map.cur_dir          = Game.map.init_dir;
		Game.map.cur_pos          = Game.map.init_pos.slice(0);
		Game.map.cur_ground_colors = Game.map.init_ground_colors.slice(0);
		Game.map.cur_ground_boxes  = Game.map.init_ground_boxes.slice(0);
		Game.map.cur_hand_boxes    = Game.map.init_hand_boxes.slice(0);
		
		window.ui.createPlayer(Game.map.cur_pos[0], Game.map.cur_pos[1]);
		if(Game.map.cur_dir === Game.GameUp)
			window.ui.setPlayerDirection(-1, 0);
		if(Game.map.cur_dir === Game.GameLeft)
			window.ui.setPlayerDirection(0, -1);
		if(Game.map.cur_dir === Game.GameDown)
			window.ui.setPlayerDirection(1, 0);
		if(Game.map.cur_dir === Game.GameRight)
			window.ui.setPlayerDirection(0, 1);
	}

	/*
		All instructions called by the player, may throw an Error with message
		'IllegalInstruction'.
	*/
	
	static gameMove()
	{
		if(!Game.map.instr_set[11])
			throw new Error('IllegalInstruction');
		let dir = Game.map.cur_dir;
		console.log(dir);
		console.log(Game.GameUp);
		let shouldCall = false;
		if(dir === Game.GameUp)
		{
			if(Game.map.cur_pos[0] > 0)
			{
				Game.map.cur_pos[0]--;
				shouldCall = true;
			}
		}
		else if(dir === Game.GameLeft)
		{
			if(Game.map.cur_pos[1] > 0)
			{
				Game.map.cur_pos[1]--;
				shouldCall = true;
			}
		}
		else if(dir === Game.GameDown)
		{
			if(Game.map.cur_pos[0] < Game.map.height - 1)
			{
				Game.map.cur_pos[0]++;
				shouldCall = true;
			}
		}
		else if(dir === Game.GameRight)
		{
			if(Game.map.cur_pos[1] < Game.map.width - 1)
			{
				Game.map.cur_pos[1]++;
				shouldCall = true;
			}
		}
		else
			throw new Error('IllegalState');
		Game.gameCheckFinished();
		if(shouldCall)
			window.ui.playerMoveForward();
	}

	static gameTurn(way)
	{
		console.log(way);
		console.log(Game.GameCW);
		console.log(Game.map.instr_set[Game.GameCW]);
		let callback = null;
		if(way === Game.GameCW && Game.map.instr_set[Game.GameCW])
		{
			Game.map.cur_dir = (Game.map.cur_dir + 1) % 4 + 16;
			callback = window.ui.playerTurnCW;
		}
		else if(way === Game.GameCCW && Game.map.instr_set[Game.GameCCW])
		{
			Game.map.cur_dir = (Game.map.cur_dir + 3) % 4 + 16;
			callback = window.ui.playerTurnCCW;
		}
		else
			throw new Error('IllegalInstruction');
		Game.gameCheckFinished();
		callback();
	}

	/**
	 * Judge whether the game is finished.
	 * @throw Error 'GameFinished' if finished.
	 * This function is called after every player's instruction.
	 */
	static gameCheckFinished()
	{
		if(
			Game.gameFinishedHelper(Game.map.cur_pos         , Game.map.final_pos         ) &&
			Game.gameFinishedHelper(Game.map.cur_dir         , Game.map.final_dir         ) &&
			Game.gameFinishedHelper(Game.map.cur_ground_colors, Game.map.final_ground_colors) &&
			Game.gameFinishedHelper(Game.map.cur_ground_boxes , Game.map.final_ground_boxes ) &&
			Game.gameFinishedHelper(Game.map.cur_hand_boxes   , Game.map.final_hand_boxes   )
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
			if(a.length !== b.length)
				return false;
			for(let i = 0; i < a.length; i++)
				if(!Game.gameFinishedEqual(a[i], b[i]))
					return false;
			return true;
		}
		if(!isa && !isb)
			return a === b;
		return false;
	}
	static isArray(o)
	{
		return Object.prototype.toString.call(o) === '[object Array]';
	}
    // static gameTurn(x) {
        // console.log('gameTurn'+x);        
    // }
    // static gameMove()  {
        // console.log('gameMove');        
    // }
}
