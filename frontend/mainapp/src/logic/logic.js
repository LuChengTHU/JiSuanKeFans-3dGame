export default class Game {
	/**
	 * Fields cared by logic:
	 * height, width
	 * nMaxHandBoxes
	 * instr_set
	 * {init, cur, final} {Pos, GroundColors, GroundBoxes, HandBoxes, Dir, AiInfos, Hp, Attack}
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
		
		Game.map.ai_callbacks = [];
		for(let i = 0; i < map.init_AI_infos.length; i++)
		{
			window.ui.addMonster(i, map.init_AI_infos[i].pos[0], map.init_AI_infos[i].pos[1]);
			let dat = {};
			Game.map.ai_callbacks.push(() =>
			{
				let data = dat;
				return eval(map.init_AI_infos[i].code);
			});
		}
		Game.map.cur_ai = -1;
		return true;
	}

	/**
	 * Set the map to the initial state.
	 * This function should be called before the player's first instruction is
	 * called.
	 */
	static gameInit()
	{
		Game.map.cur_dir           = Game.map.init_dir;
		Game.map.cur_pos           = Game.map.init_pos.slice(0);
		Game.map.cur_ground_colors = Game.map.init_ground_colors.slice(0);
		Game.map.cur_ground_boxes  = Game.map.init_ground_boxes.slice(0);
		Game.map.cur_hand_boxes    = Game.map.init_hand_boxes.slice(0);
		Game.map.cur_hp            = Game.map.init_hp;
		Game.map.cur_attack        = Game.map.init_attack;
		
		Game.map.grids = [];
		for(let i = 0; i < Game.map.height; ++i)
			Game.map.grids[i] = [];
		for(let i = 0; i < Game.map.height; ++i)
			for(let j = 0; j < Game.map.width; ++j)
				Game.map.grids[i][j] = null;
		Game.map.grids[Game.map.cur_pos[0]][Game.map.cur_pos[1]] = -1;
		
		// @TODO: manual deep copy
		Game.map.cur_ai_infos = [];
		for(let i = 0; i < Game.map.init_AI_infos.length; i++)
		{
			Game.map.cur_ai_infos.push({
				id     : Game.map.init_AI_infos[i].id,
				pos    : Game.map.init_AI_infos[i].pos.slice(0),
				dir    : Game.map.init_AI_infos[i].dir,
				hp     : Game.map.init_AI_infos[i].hp,
				attack : Game.map.init_AI_infos[i].attack,
			});
			Game.map.grids[Game.map.cur_ai_infos[i].pos[0]][Game.map.cur_ai_infos[i].pos[1]] = i;
		}
		Game.map.cur_ai = -1;
		
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
		if(Game.map.cur_ai === -1){		
			if(!Game.map.instr_set[11])
				throw new Error('IllegalInstruction');
			let dir = Game.map.cur_dir;
			console.log(dir);
			console.log(Game.GameUp);
			let shouldCall = false;
			console.assert(Game.map.grids[Game.map.cur_pos[0]][Game.map.cur_pos[1]] === -1);
			Game.map.grids[Game.map.cur_pos[0]][Game.map.cur_pos[1]] = null;
			if(dir === Game.GameUp)
			{
				if(Game.map.cur_pos[0] > 0 && Game.map.grids[Game.map.cur_pos[0] - 1][Game.map.cur_pos[1]] === null)
				{
					Game.map.cur_pos[0]--;
					shouldCall = true;
				}
			}
			else if(dir === Game.GameLeft)
			{
				if(Game.map.cur_pos[1] > 0 && Game.map.grids[Game.map.cur_pos[0]][Game.map.cur_pos[1] - 1] === null)
				{
					Game.map.cur_pos[1]--;
					shouldCall = true;
				}
			}
			else if(dir === Game.GameDown)
			{
				if(Game.map.cur_pos[0] < Game.map.height - 1 && Game.map.grids[Game.map.cur_pos[0] + 1][Game.map.cur_pos[1]] === null)
				{
					Game.map.cur_pos[0]++;
					shouldCall = true;
				}
			}
			else if(dir === Game.GameRight)
			{
				if(Game.map.cur_pos[1] < Game.map.width - 1 && Game.map.grids[Game.map.cur_pos[0]][Game.map.cur_pos[1] + 1] === null)
				{
					Game.map.cur_pos[1]++;
					shouldCall = true;
				}
			}
			else
				throw new Error('IllegalState');
			Game.map.grids[Game.map.cur_pos[0]][Game.map.cur_pos[1]] = -1;
			if(shouldCall)
				window.ui.playerMoveForward();
			Game.gameCallAfterPlayerMove();
		}
		else
		{
			// AI playing
			let id = Game.map.cur_ai;
			let dir = Game.map.cur_ai_infos[id].dir;
			console.log(id);
			console.log(dir);
			let shouldCall = false;
			console.assert(Game.map.grids[Game.map.cur_ai_infos[id].pos[0]][Game.map.cur_ai_infos[id].pos[1]] === id);
			Game.map.grids[Game.map.cur_ai_infos[id].pos[0]][Game.map.cur_ai_infos[id].pos[1]] = null;
			if(dir === Game.GameUp)
			{
				if(Game.map.cur_ai_infos[id].pos[0] > 0 && Game.map.grids[Game.map.cur_ai_infos[id].pos[0] - 1][Game.map.cur_ai_infos[id].pos[1]] === null)
				{
					Game.map.cur_ai_infos[id].pos[0]--;
					shouldCall = true;
				}
			}
			else if(dir === Game.GameLeft && Game.map.grids[Game.map.cur_ai_infos[id].pos[0]][Game.map.cur_ai_infos[id].pos[1] - 1] === null)
			{
				if(Game.map.cur_ai_infos[id].pos[1] > 0)
				{
					Game.map.cur_ai_infos[id].pos[1]--;
					shouldCall = true;
				}
			}
			else if(dir === Game.GameDown && Game.map.grids[Game.map.cur_ai_infos[id].pos[0] + 1][Game.map.cur_ai_infos[id].pos[1]] === null)
			{
				if(Game.map.cur_ai_infos[id].pos[0] < Game.map.height - 1)
				{
					Game.map.cur_ai_infos[id].pos[0]++;
					shouldCall = true;
				}
			}
			else if(dir === Game.GameRight && Game.map.grids[Game.map.cur_ai_infos[id].pos[0]][Game.map.cur_ai_infos[id].pos[1] + 1] === null)
			{
				if(Game.map.cur_ai_infos[id].pos[1] < Game.map.width - 1)
				{
					Game.map.cur_ai_infos[id].pos[1]++;
					shouldCall = true;
				}
			}
			else
				throw new Error('IllegalState');
			Game.map.grids[Game.map.cur_ai_infos[id].pos[0]][Game.map.cur_ai_infos[id].pos[1]] = id;
			if(shouldCall)
				window.ui.monsterMoveForward(id);
		}
	}
	
	static gameCallAfterPlayerMove()
	{
		Game.gameCheckFinished();
		for(let i = 0; i < Game.map.ai_callbacks.length; ++i)
		{
			if(Game.map.cur_ai_infos[id].hp <= 0)
				continue;
			Game.map.cur_ai = i;
			Game.map.ai_callbacks[i]();
			Game.map.cur_ai = -1;
		}
	}
	
	static gameAttack()
	{
		if(Game.map.cur_ai === -1)
		{
			// Player playing
			let dir = Game.map.cur_dir;
			let target = null;
			if(dir === Game.GameUp && Game.map.cur_pos[0] > 0)
				target = Game.map.grids[Game.map.cur_pos[0] - 1][Game.map.cur_pos[1]];
			if(dir === Game.GameLeft && Game.map.cur_pos[1] > 0)
				target = Game.map.grids[Game.map.cur_pos[0]][Game.map.cur_pos[1] - 1];
			if(dir === Game.GameDown && Game.map.cur_pos[0] < Game.map.height - 1)
				target = Game.map.grids[Game.map.cur_pos[0] + 1][Game.map.cur_pos[1]];
			if(dir === Game.GameRight && Game.map.cur_pos[1] < Game.map.width - 1)
				target = Game.map.grids[Game.map.cur_pos[0]][Game.map.cur_pos[1] + 1];
			if(target !== null)
				Game.gameDealDamage(-1, target, Game.map.cur_attack);
			Game.gameCallAfterPlayerMove();
		}
		else
		{
			// AI playing
			let id = Game.map.cur_ai;
			let dir = Game.map.cur_ai_infos[id].dir;
			let target = null;
			if(dir === Game.GameUp && Game.map.cur_ai_infos[id].pos[0] > 0)
				target = Game.map.grids[Game.map.cur_ai_infos[id].pos[0] - 1][Game.map.cur_ai_infos[id].pos[1]];
			if(dir === Game.GameLeft && Game.map.cur_ai_infos[id].pos[1] > 0)
				target = Game.map.grids[Game.map.cur_ai_infos[id].pos[0]][Game.map.cur_ai_infos[id].pos[1] - 1];
			if(dir === Game.GameDown && Game.map.cur_ai_infos[id].pos[0] < Game.map.height - 1)
				target = Game.map.grids[Game.map.cur_ai_infos[id].pos[0] + 1][Game.map.cur_ai_infos[id].pos[1]];
			if(dir === Game.GameRight && Game.map.cur_ai_infos[id].pos[1] < Game.map.width - 1)
				target = Game.map.grids[Game.map.cur_ai_infos[id].pos[0]][Game.map.cur_ai_infos[id].pos[1] + 1];
			if(target !== null)
				Game.gameDealDamage(id, target, Game.map.cur_ai_infos[id].attack);
		}
	}
	
	static gameDealDamage(source, target, attack)
	{
		if(target === -1)
		{
			Game.map.cur_hp -= attack;
			if(Game.map.cur_hp <= 0)
				throw new Error('Player Dead');
		}
		else
		{
			Game.map.cur_ai_infos[target].hp -= attack;
			if(Game.map.cur_ai_infos[target].hp <= 0)
				Game.map.grids[Game.map.cur_ai_infos[target].pos[0]][Game.map.cur_ai_infos[target].pos[1]] = null;
		}
	}

	static gameTurn(way)
	{
		if(Game.map.cur_ai === -1)
		{
			// Player playing
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
			callback();
			Game.gameCallAfterPlayerMove();
		}
		else
		{
			// AI playing
			let id = Game.map.cur_ai;
			let callback = null;
			if(way === Game.GameCW)
			{
				Game.map.cur_ai_infos[id].dir = (Game.map.cur_ai_infos[id].dir + 1) % 4 + 16;
				callback = window.ui.monsterTurnCW;
			}
			else if(way === Game.GameCCW)
			{
				Game.map.cur_ai_infos[id].dir = (Game.map.cur_ai_infos[id].dir + 3) % 4 + 16;
				callback = window.ui.monsterTurnCCW;
			}
			else
				throw new Error('IllegalInstruction');
			callback(id);
		}
	}

	/**
	 * Judge whether the game is finished.
	 * @throw Error 'GameFinished' if finished.
	 * This function is called after every player's instruction.
	 */
	static gameCheckFinished()
	{
		if(
			Game.gameFinishedHelper(Game.map.cur_pos          , Game.map.final_pos          ) &&
			Game.gameFinishedHelper(Game.map.cur_dir          , Game.map.final_dir          ) &&
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
}