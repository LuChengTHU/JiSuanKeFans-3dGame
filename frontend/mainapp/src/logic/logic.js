import Vm from 'vm.js';

export default class Game {
	/**
	 * Fields cared by logic:
	 * height, width
	 * instr_set
	 * {init, cur}_{pos, dir, AI_infos, hp, attack}
	 * final_pos
	 * final_gold
	 */

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
		window.ui.createPlayer(map.init_pos[0], map.init_pos[1], map.init_hp);
		if(Game.map.init_dir === Game.GameUp)
			window.ui.setPlayerDirection(-1, 0);
		if(Game.map.init_dir === Game.GameLeft)
			window.ui.setPlayerDirection(0, -1);
		if(Game.map.init_dir === Game.GameDown)
			window.ui.setPlayerDirection(1, 0);
		if(Game.map.init_dir === Game.GameRight)
			window.ui.setPlayerDirection(0, 1);
		if(map.final_pos)
			window.ui.setTargetPos(map.final_pos[0], map.final_pos[1]);
		else
			window.ui.setTargetPos(null);
		
		for(let i = 0; i < map.init_AI_infos.length; i++)
			window.ui.addMonster(i, map.init_AI_infos[i].pos[0], map.init_AI_infos[i].pos[1], map.init_AI_infos[i].hp);
		return true;
	}

	/**
	 * Set the map to the initial state.
	 * This function should be called before the player's first instruction is
	 * called.
	 */
	static gameInit()
	{
		Game.map.cur_dir    = Game.map.init_dir;
		Game.map.cur_pos    = Game.map.init_pos.slice(0);
		Game.map.cur_hp     = Game.map.init_hp;
		Game.map.cur_attack = Game.map.init_attack;
		
		Game.map.grids = [];
		for(let i = 0; i < Game.map.height; ++i)
			Game.map.grids[i] = [];
		for(let i = 0; i < Game.map.height; ++i)
			for(let j = 0; j < Game.map.width; ++j)
				Game.map.grids[i][j] = null;
		Game.map.grids[Game.map.cur_pos[0]][Game.map.cur_pos[1]] = -1;
		
		if(Game.map.final_pos)
			window.ui.setTargetPos(Game.map.final_pos[0], Game.map.final_pos[1]);
		else
			window.ui.setTargetPos(null);
		
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
		
		window.ui.createPlayer(Game.map.cur_pos[0], Game.map.cur_pos[1], Game.map.cur_hp);
		if(Game.map.cur_dir === Game.GameUp)
			window.ui.setPlayerDirection(-1, 0);
		if(Game.map.cur_dir === Game.GameLeft)
			window.ui.setPlayerDirection(0, -1);
		if(Game.map.cur_dir === Game.GameDown)
			window.ui.setPlayerDirection(1, 0);
		if(Game.map.cur_dir === Game.GameRight)
			window.ui.setPlayerDirection(0, 1);
		
		Game.map.ai_callbacks = [];
		for(let i = 0; i < Game.map.init_AI_infos.length; i++)
		{
			window.ui.addMonster(i, Game.map.init_AI_infos[i].pos[0], Game.map.init_AI_infos[i].pos[1], Game.map.init_AI_infos[i].hp);
			if(Game.map.init_AI_infos[i].dir === Game.GameUp)
				window.ui.setMonsterDirection(i, -1, 0);
			if(Game.map.init_AI_infos[i].dir === Game.GameLeft)
				window.ui.setMonsterDirection(i, 0, -1);
			if(Game.map.init_AI_infos[i].dir === Game.GameDown)
				window.ui.setMonsterDirection(i, 1, 0);
			if(Game.map.init_AI_infos[i].dir === Game.GameRight)
				window.ui.setMonsterDirection(i, 0, 1);
			const dat = {};
			Game.map.ai_callbacks.push(() =>
			{
                const vm = new Vm();
                vm.realm.global.Game = Game;
                vm.realm.global.data = dat;
                vm.realm.global.console = console;
                try
                {
                    return vm.eval(Game.map.init_AI_infos[i].code);
                }
                catch(e)
                {
                    // ignore ai errors
                    return undefined;
                }
			});
		}
	}

	/*
		All instructions called by the player, may throw an Error with message
		'IllegalInstruction'.
	*/
	
	static gameLookAheadName()
	{
		// No "Call After Move" needed!
		const id = Game.map.cur_ai;
		let x, y, dir;
		if(id === -1)
		{
			x = Game.map.cur_pos[0];
			y = Game.map.cur_pos[1];
			dir = Game.map.cur_dir;
		}
		else
		{
			x = Game.map.cur_ai_infos[id].pos[0];
			y = Game.map.cur_ai_infos[id].pos[1];
			dir = Game.map.cur_ai_infos[id].dir;
		}
		let dx = 0, dy = 0;
		if(dir === Game.GameUp)
			dx = -1;
		else if(dir === Game.GameLeft)
			dy = -1;
		else if(dir === Game.GameDown)
			dx = 1;
		else if(dir === Game.GameRight)
			dy = 1;
		else
			throw new Error('IllegalState');
		x += dx;
        y += dy;
		while(x >= 0 && x < Game.map.height && y >= 0 && y < Game.map.width)
		{
			const tid = Game.map.grids[x][y];
			if(tid !== null)
			{
				if(tid === -1)
					return "player";
				else if(Game.map.cur_ai_infos[tid].hp >= 0)
					return Game.map.cur_ai_infos[tid].id;
			}
			x += dx;
            y += dy;
		}
		return "";
	}
	
	static gameGetPosX(name)
	{
		if(name === 'player')
			return Game.map.cur_pos[0];
		for(let i = 0; i < Game.map.cur_ai_infos.length; i++)
			if(Game.map.cur_ai_infos[i].id === name)
				return Game.map.cur_ai_infos[i].pos[0];
		return -1;
	}
	
	static gameGetPosY(name)
	{
		if(name === 'player')
			return Game.map.cur_pos[1];
		for(let i = 0; i < Game.map.cur_ai_infos.length; i++)
			if(Game.map.cur_ai_infos[i].id === name)
				return Game.map.cur_ai_infos[i].pos[1];
		return -1;
	}
	
	static gameGetDir(name)
	{
		if(name === 'player')
			return Game.map.cur_dir;
		for(let i = 0; i < Game.map.cur_ai_infos.length; i++)
			if(Game.map.cur_ai_infos[i].id === name)
				return Game.map.cur_ai_infos[i].dir;
		return -1;
	}
	
	static gameGetAttack(name)
	{
		if(name === 'player')
			return Game.map.cur_attack;
		for(let i = 0; i < Game.map.cur_ai_infos.length; i++)
			if(Game.map.cur_ai_infos[i].id === name)
				return Game.map.cur_ai_infos[i].attack;
		return -1;
	}
	
	static gameGetHp(name)
	{
		if(name === 'player')
			return Game.map.cur_hp;
		for(let i = 0; i < Game.map.cur_ai_infos.length; i++)
			if(Game.map.cur_ai_infos[i].id === name)
				return Game.map.cur_ai_infos[i].hp;
		return -1;
	}
	
	static gameMove()
	{
		if(Game.map.cur_ai === -1)
		{
			// Player playing
			if(!Game.map.instr_set[11])
				throw new Error('IllegalInstruction');
			const dir = Game.map.cur_dir;
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
			const id = Game.map.cur_ai;
			const dir = Game.map.cur_ai_infos[id].dir;
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
			else if(dir === Game.GameLeft)
			{
				if(Game.map.cur_ai_infos[id].pos[1] > 0 && Game.map.grids[Game.map.cur_ai_infos[id].pos[0]][Game.map.cur_ai_infos[id].pos[1] - 1] === null)
				{
					Game.map.cur_ai_infos[id].pos[1]--;
					shouldCall = true;
				}
			}
			else if(dir === Game.GameDown)
			{
				if(Game.map.cur_ai_infos[id].pos[0] < Game.map.height - 1 && Game.map.grids[Game.map.cur_ai_infos[id].pos[0] + 1][Game.map.cur_ai_infos[id].pos[1]] === null)
				{
					Game.map.cur_ai_infos[id].pos[0]++;
					shouldCall = true;
				}
			}
			else if(dir === Game.GameRight)
			{
				if(Game.map.cur_ai_infos[id].pos[1] < Game.map.width - 1 && Game.map.grids[Game.map.cur_ai_infos[id].pos[0]][Game.map.cur_ai_infos[id].pos[1] + 1] === null)
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
			if(Game.map.cur_ai_infos[i].hp <= 0)
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
			if(!Game.map.instr_set[21])
				throw new Error('IllegalInstruction');
			const dir = Game.map.cur_dir;
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
			window.ui.playerAttack();
			Game.gameCallAfterPlayerMove();
		}
		else
		{
			// AI playing
			const id = Game.map.cur_ai;
			const dir = Game.map.cur_ai_infos[id].dir;
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
			window.ui.setPlayerHp(Game.map.cur_hp);
			if(Game.map.cur_hp <= 0)
				throw new Error('Player Dead');
		}
		else
		{
			Game.map.cur_ai_infos[target].hp -= attack;
			window.ui.setMonsterHp(target, Game.map.cur_ai_infos[target].hp);
			if(Game.map.cur_ai_infos[target].hp <= 0)
				Game.map.grids[Game.map.cur_ai_infos[target].pos[0]][Game.map.cur_ai_infos[target].pos[1]] = null;
		}
	}

	static gameTurn(way)
	{
		if(Game.map.cur_ai === -1)
		{
			// Player playing
			if(!Game.map.instr_set[12])
				throw new Error('IllegalInstruction');
			if(way === Game.GameCW && Game.map.instr_set[Game.GameCW])
			{
				Game.map.cur_dir = (Game.map.cur_dir + 1) % 4 + 16;
				window.ui.playerTurnCW();
			}
			else if(way === Game.GameCCW && Game.map.instr_set[Game.GameCCW])
			{
				Game.map.cur_dir = (Game.map.cur_dir + 3) % 4 + 16;
				window.ui.playerTurnCCW();
			}
			else
				throw new Error('IllegalInstruction');
			Game.gameCallAfterPlayerMove();
		}
		else
		{
			// AI playing
			const id = Game.map.cur_ai;
			if(way === Game.GameCW)
			{
				Game.map.cur_ai_infos[id].dir = (Game.map.cur_ai_infos[id].dir + 1) % 4 + 16;
				window.ui.monsterTurnCW(id);
			}
			else if(way === Game.GameCCW)
			{
				Game.map.cur_ai_infos[id].dir = (Game.map.cur_ai_infos[id].dir + 3) % 4 + 16;
				window.ui.monsterTurnCCW(id);
			}
			else
				throw new Error('IllegalInstruction');
		}
	}

	/**
	 * Judge whether the game is finished.
	 * @throw Error 'GameFinished' if finished.
	 * This function is called after every player's instruction.
	 */
	static gameCheckFinished()
	{
		if(Game.map.final_pos && (Game.map.cur_pos[0] !== Game.map.final_pos[0] || Game.map.cur_pos[1] !== Game.map.final_pos[1]))
        {
			return;
		}
		let gold = 0;
		for(let i = 0; i < Game.map.cur_ai_infos.length; i++)
			if(Game.map.cur_ai_infos[i].hp <= 0)
				gold++;
		if(gold < Game.map.final_gold)
			return;
		window.blocklyCallback = () => {/* clear the callback */};
		throw new Error('GameFinished');
	}
}


