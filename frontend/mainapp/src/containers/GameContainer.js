import React, { Component, PropTypes} from 'react';
import * as THREE from 'three';

import { Vector3, Euler, Geometry, DoubleSide, } from 'three';

import Game from '../components/Game';
import MapBlock from '../components/MapBlock';
import * as Logic from '../logic/logic';

// Load our simple functions that manage scene/game state
import playerMovement from '../logic/playerMovement';


/**
 * Our "container" component. See https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0#.jwywi6ltw
 * for more reading. This container holds the game logic, but not the view code
 */
export default class GameContainer extends Component {

    constructor(props) {

        super(props);
		window.ui = this;
		window.Game = Logic.default;
		window.blocklyCallback = () => {/* default no callback */};
		window.blocklyShouldRun = false;
		
		window.blocklyAutoRun = () =>
		{
			window.setTimeout(window.blocklyAutoRun, 10);
			try
			{
				if(window.blocklyShouldRun)
					window.blocklyCallback();
			}
			catch(e)
			{
				if(e.message === 'GameFinished')
					this.props.gameSetState('passed');
				else if(e.message === 'GameFailedLoop' || e.message === 'GameFailed' || e.message === 'Player Dead')
					this.props.gameSetState('failed');
				else
					throw e;
			}
		};
		window.blocklyAutoRun();

        // Initial scene state
        this.state = {
            playerPosition: new Vector3( 0, 0, 0 ),
            playerRotation: new Euler( 0, -Math.PI / 2, 0 ),
            cameraPosition: new THREE.Vector3( -2, 4, -2 ),
            lookAt: new THREE.Vector3( 0, 0, 0 ),
			monsters: []
        };

        this.createMap = this.createMap.bind(this);
        this.setPlayerDirection = this.setPlayerDirection.bind(this);
        this.createPlayer = this.createPlayer.bind(this);
        this.playerMoveForward = this.playerMoveForward.bind(this);
        this.playerTurnCW = this.playerTurnCW.bind(this);
        this.playerTurnCCW = this.playerTurnCCW.bind(this);
        this.playerAttack = this.playerAttack.bind(this);
        this.addMonster = this.addMonster.bind(this);
        this.monsterMoveForward = this.monsterMoveForward.bind(this);
        this.monsterTurnCW = this.monsterTurnCW.bind(this);
        this.monsterTurnCCW = this.monsterTurnCCW.bind(this);
        this.setPlayerHp = this.setPlayerHp.bind(this);
    }

    setWeight = ( action, weight ) => {
        action.enabled = true;
        action.setEffectiveTimeScale( 1 );
        action.setEffectiveWeight( weight );
    };

    prepareCrossFade = (startAction, endAction, duration) => {
        const oldState = this.state;
        oldState.actions.forEach( function (action) {
            action.paused = false;
        });


        oldState.mixer.addEventListener('loop', onEndLoopFinished);
        this.setWeight(endAction, 1);
        endAction.time = 0;
        // Crossfade with warping - you can also try without warping by setting the third parameter to false
        startAction.crossFadeTo(endAction, duration, true);
        oldState.currentAction = endAction;
        this.setState(oldState);

        const that = this;

        function onEndLoopFinished(event) {
            if (event.action === endAction) {
                if (endAction === oldState.actions[1]) {
                    oldState.playerAnimateAttacking = false;
                    oldState.mixer.removeEventListener('loop', onEndLoopFinished);
                    that.setState(oldState);
                    that.prepareCrossFade(endAction, oldState.actions[0], duration);
                }
            }
        }

    };

	setTargetPos(x, z)
	{
		if(x)
			this.setState({targetPosition: new Vector3(x, 0.05, z)});
		else
			this.setState({targetPosition: null});
	}
	
	addMonster(id, x, z, maxHp)
	{
	    const mesh = new THREE.SkinnedMesh(this.state.monsterGeometry, this.state.monsterMaterial)
        mesh.scale.set(0.15, 0.15, 0.15);
        const mixer = new THREE.AnimationMixer(mesh);
        const moveAction = mixer.clipAction(mesh.geometry.animations[1]);
        const attackAction = mixer.clipAction(mesh.geometry.animations[0]);
        this.setWeight(moveAction, 0);
        this.setWeight(attackAction, 1);
        const actions = [moveAction, attackAction];
        actions.forEach(function (action) {
            action.play();
        });

		this.setState((prevState/*, props*/) => {
			const ms = prevState.monsters.slice(0);
			if(id >= ms.length)
				ms.length = id + 1;
			ms[id] =
			{
				position: new Vector3(x, 0.3, z),
				direction: new Vector3(1, 0, 0),
				rotation: new Euler(),
				maxHp: maxHp,
				hp: maxHp,
                mesh: mesh,
                mixer: mixer,
                actions: actions,
                currentAction: attackAction
			};
			return {monsters: ms};
		});
	}
	
	setMonsterHp(id, hp)
	{
		if(hp < 0)
        {
            hp = 0;
        }
		this.setState((prevState/*, props*/) => {
			const ms = prevState.monsters.slice(0);
			ms[id].hp = hp;
			return {monsters: ms};
		});
	}
	
	monsterMoveForward(id)
	{
 		this.setState((prevState/*, props*/) => {
			const ms = prevState.monsters.slice(0);
 			ms[id].animateForward = true;
 			return {monsters: ms};
 		});
		window.blocklyShouldRun = false;
	}
	
	monsterTurnCCW(id)
	{
 		this.setState((prevState/*, props*/) => {
			const ms = prevState.monsters.slice(0);
 			ms[id].animateCCW = true;
 			if(ms[id].direction.x === 1)
 				ms[id].direction = new Vector3(0, 0, -1);
 			else if(ms[id].direction.z === -1)
 				ms[id].direction = new Vector3(-1, 0, 0);
 			else if(ms[id].direction.x === -1)
 				ms[id].direction = new Vector3(0, 0, 1);
 			else
 				ms[id].direction = new Vector3(1, 0, 0);
 			return {monsters: ms};
 		});
		window.blocklyShouldRun = false;
	}
	
	monsterTurnCW(id)
	{
		this.setState((prevState/*, props*/) => {
			const ms = prevState.monsters.slice(0);
 			ms[id].animateCW = true;
 			if(ms[id].direction.x === 1)
 				ms[id].direction = new Vector3(0, 0, 1);
 			else if(ms[id].direction.z === 1)
 				ms[id].direction = new Vector3(-1, 0, 0);
 			else if(ms[id].direction.x === -1)
 				ms[id].direction = new Vector3(0, 0, -1);
 			else
 				ms[id].direction = new Vector3(1, 0, 0);
			return {monsters: ms};
		});
		window.blocklyShouldRun = false;
	}

    monsterAttack(id)
    {
        const oldState = this.state;
        oldState.monsters.slice(0)[id].mixer.addEventListener('loop', onEndLoopFinished);
        this.setWeight(oldState.monsters.slice(0)[id].currentAction, 1);
        oldState.monsters.slice(0)[id].currentAction.play();
        this.setState(oldState);
        this.setState({monsterAnimateAttacking: true});
        window.blocklyShouldRun = false;

        const that = this;

        function onEndLoopFinished(/*event*/) {
            oldState.playerAnimateAttacking = false;
            oldState.mixer.removeEventListener('loop', onEndLoopFinished);
            that.setWeight(oldState.monsters.slice(0)[id].currentAction, 0);
            that.setState(oldState);
        }
    }
	
	createMap(height, width)
	{
		const bs = [];
		for(let i = 0; i < height; ++i)
			for(let j = 0; j < width; ++j)
				bs.push(<MapBlock x={i} z={j}/>);
		this.setState({mapBlocks: bs, monsters: []});
	}
	
	createPlayer(x, z, maxHp)
	{
		this.setState(
			{
				playerPosition : new Vector3(x, 0, z),
				playerTargetPosition : new Vector3(x, 0, z),
				playerRotation : new Euler(0, -Math.PI / 2, 0),
				playerMaxHp : maxHp,
				playerHp : maxHp,
			}
		);
	}
	
	setPlayerHp(hp)
	{
		if(hp < 0)
        {
            hp = 0;
        }
		this.setState({playerHp: hp});
	}
	
	setPlayerDirection(x, z)
	{
		this.setState(
			{
				playerDirection : new Vector3(x, 0, z),
			}
		);
		if(z === 1)
			this.setState(
				{
					playerRotation : new Euler(0, 0, 0),
				}
			);
		if(z === -1)
			this.setState(
				{
					playerRotation : new Euler(0, Math.PI, 0),
				}
			);
		if(x === 1)
			this.setState(
				{
					playerRotation : new Euler(0, Math.PI / 2, 0),
				}
			);
		if(x === -1)
			this.setState(
				{
					playerRotation : new Euler(0, -Math.PI / 2, 0),
				}
			);
	}
	
	setMonsterDirection(id, x, z)
	{
		this.setState((prevState/*, props*/) => {
			const ms = prevState.monsters.slice(0);
			ms[id].direction = new Vector3(x, 0, z);
			return {monsters: ms};
		});
	}

	setCameraPosition = (x, y, z) => {
		this.setState(
			{
				cameraPosition : new Vector3(x, y, z),
			}
		);
	};

	setLookAt = (x, y, z) => {
		this.setState(
			{
				lookAt : new Vector3(x, y, z),
			}
		);
	};
	
	playerTurnCW()
	{
		this.setState((prevState/*, props*/) => {
			if(prevState.playerDirection.x === 1)
				return {playerDirection: new Vector3(0, 0, 1)};
			else if(prevState.playerDirection.z === 1)
				return {playerDirection: new Vector3(-1, 0, 0)};
			else if(prevState.playerDirection.x === -1)
				return {playerDirection: new Vector3(0, 0, -1)};
			else
				return {playerDirection: new Vector3(1, 0, 0)};
		});
		this.setState({playerAnimateCW: true});
		window.blocklyShouldRun = false;
        this.prepareCrossFade(this.state.currentAction, this.state.actions[0], 0);
	}
	
	playerTurnCCW()
	{
		this.setState((prevState/*, props*/) => {
			if(prevState.playerDirection.x === 1)
				return {playerDirection: new Vector3(0, 0, -1)};
			else if(prevState.playerDirection.z === -1)
				return {playerDirection: new Vector3(-1, 0, 0)};
			else if(prevState.playerDirection.x === -1)
				return {playerDirection: new Vector3(0, 0, 1)};
			else
				return {playerDirection: new Vector3(1, 0, 0)};
		});
		this.setState({playerAnimateCCW: true});
		window.blocklyShouldRun = false;
        this.prepareCrossFade(this.state.currentAction, this.state.actions[0], 0);
	}
	
	playerMoveForward()
	{
		this.setState({playerAnimateForward: true});
		window.blocklyShouldRun = false;
        this.prepareCrossFade(this.state.currentAction, this.state.actions[0], 0);
	}


    playerAttack()
    {
        this.setState({playerAnimateAttacking: true});
        window.blocklyShouldRun = false;
        this.prepareCrossFade(this.state.currentAction, this.state.actions[1], 0);
    }

    componentDidMount() {
    
        // Track if we're mounted so game loop doesn't tick after unmount
        this.mounted = true;
    
        // Expose the global THREE object for use in debugging console
        window.THREE = THREE;

		const container = this.refs.container;
		container.addEventListener('mousedown', this.onGameMouseDown, false);

        const loader = new THREE.JSONLoader();
        loader.load(`${process.env.PUBLIC_URL}/assets/guitongzi_action.json`,
            (geometry, materials) => {
                for(let i = 0; i < materials.length; i++) {
                    materials[i].emissive.set(0x101010);
                    materials[i].skinning = true;
                    materials[i].morphTargets = true;
                }
                const mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));
                mesh.scale.set(0.01, 0.01, 0.01);
                const mixer = new THREE.AnimationMixer(mesh);
                const moveAction = mixer.clipAction(mesh.geometry.animations[0]);
                const attackAction = mixer.clipAction(mesh.geometry.animations[2]);
                this.setWeight(moveAction, 1);
                this.setWeight(attackAction, 0);
                const actions = [moveAction, attackAction];

                actions.forEach(function (action) {
                    action.play();
                });

                this.setState({
                    knightMesh: mesh,
                    mixer: mixer,
                    clock: new THREE.Clock(),
                    actions: actions,
                    currentAction: moveAction
                });


                const monsterLoader = new THREE.JSONLoader();
                monsterLoader.load(`${process.env.PUBLIC_URL}/assets/spider.json`,
                    (geometry, materials) => {
                        const material = materials[0];
                        material.emissive.set(0x101010);
                        material.skinning = true;
                        material.morphTargets = true;

                        this.setState({
                            monsterGeometry: geometry,
                            monsterMaterial: material
                        });
                        // Start the game loop when this component loads
                        this.requestGameLoop();
                    });

            });

		if(typeof(this.props.onLoaded) !== 'undefined')
			this.props.onLoaded();
    };
    
    componentWillUnmount() {
    
		this.mounted = false;
		
		const container = this.refs.container;
		container.removeEventListener('mousedown', this.onGameMouseDown, false);
		document.removeEventListener('mousemove', this.onGameMouseMove, false);
		document.removeEventListener('mouseup', this.onGameMouseUp, false);
		document.removeEventListener('mouseout', this.onGameMouseOut, false);

        this.cancelGameLoop();
    
	}

	requestGameLoop = () => {
		
		this.reqAnimId = window.requestAnimationFrame( this.gameLoop );
		
	}
	
	cancelGameLoop = () => {
		
		window.cancelAnimationFrame( this.reqAnimId );
		
	}

	// Mouse Down
	onGameMouseDown = (event) => {
		event.preventDefault();

		document.addEventListener('mousemove', this.onGameMouseMove, false);
		document.addEventListener('mouseup', this.onGameMouseUp, false);
		document.addEventListener('mouseout', this.onGameMouseOut, false);

		/*
			.. to add codes
			record the initial position of mouse
		*/
		this.mouseXOnMouseDown = event.clientX;
		this.mouseYOnMouseDown = event.clientY;

		this.cameraXOnMouseDown = this.state.cameraPosition.x;
		this.cameraYOnMouseDown = this.state.cameraPosition.y;
		this.cameraZOnMouseDown = this.state.cameraPosition.z;

		this.lookAtXOnMouseDown = this.state.lookAt.x;
		this.lookAtYOnMouseDown = this.state.lookAt.y;
		this.lookAtZOnMouseDown = this.state.lookAt.z;
	};
	
	// Mouse Move
	onGameMouseMove = (event) => {
		/*
			.. to add codes
		*/
		this.mouseX = event.clientX;
		this.mouseY = event.clientY;

		const DeltaX = (this.mouseX - this.mouseXOnMouseDown) * 0.002;
		const DeltaY = (this.mouseY - this.mouseYOnMouseDown) * 0.002;
		const SightX = (this.state.lookAt.x - this.state.cameraPosition.x);
		const SightZ = (this.state.lookAt.z - this.state.cameraPosition.z);
		
		const vSightX = SightZ;
		const vSightZ = -SightX;

		this.cameraX = this.cameraXOnMouseDown + (DeltaY * SightX + DeltaX * vSightX);
		this.cameraY = this.cameraYOnMouseDown;
		this.cameraZ = this.cameraZOnMouseDown + (DeltaY * SightZ + DeltaX * vSightZ);

		this.lookAtX = this.lookAtXOnMouseDown + (DeltaY * SightX + DeltaX * vSightX);
		this.lookAtY = this.lookAtYOnMouseDown;
		this.lookAtZ = this.lookAtZOnMouseDown + (DeltaY * SightZ + DeltaX * vSightZ);

		this.setCameraPosition(this.cameraX, this.cameraY, this.cameraZ);
		this.setLookAt(this.lookAtX, this.lookAtY, this.lookAtZ);
	};

	// Mouse Up
	onGameMouseUp = () => {
		document.removeEventListener('mousemove', this.onGameMouseMove, false);
		document.removeEventListener('mouseup', this.onGameMouseUp, false);
		document.removeEventListener('mouseout', this.onGameMouseOut, false);	
	};

	// Mouse Out
	onGameMouseOut = () => {
		document.removeEventListener('mousemove', this.onGameMouseMove, false);
		document.removeEventListener('mouseup', this.onDocumentMouseUp, false);
		document.removeEventListener('mouseout', this.onGameMouseOut, false);
	};

    
    // Our game loop, which is managed as the window's requestAnimationFrame
    // callback
    gameLoop = (time) => {
    
        if( !this.mounted ) {
            return;
        }
    
        this.requestGameLoop();
    
        const oldState = this.state;
    
        // Apply our reducer functions to the "game state", which for this
        // example is held in local container state. It could be moved into
        // a redux/flux store and udpated once per game loop.
        const newState = playerMovement( oldState, time );
        if(!this.state.playerAnimateAttacking) {
            newState.playerAnimateAttacking = false;
        }
        this.setState( newState );
		if(newState.ready)
			window.blocklyCallback();
    };


    render() {

		const divObj = window.document.getElementById('gameContainer');
        let width = 0;
        let height = 0;
		if(divObj)
		{
			width = divObj.clientWidth;
			height = window.innerHeight * .8;
			if(typeof(this.props.reportHeight) !== 'undefined') {
				this.props.reportHeight(height);
			}
		}

        const {

            cameraPosition, lookAt, playerPosition, playerRotation, mapBlocks, knightMesh, monsters, playerMaxHp, playerHp, targetPosition,
            monsterGeometry, monsterMaterial
        } = this.state;

        // Pass the data <Game /> needs to render. Note we don't show the game
        // until the geometry model file is loaded. This could be replaced with
        // a loading  screen, or even a 3d scene without geometry in it
        return <div ref="container">
			<div>
				{ monsterGeometry&&monsterMaterial&&knightMesh ? <Game
					width={ width }
					height={ height }
					cameraPosition={ cameraPosition }
					lookAt={ lookAt }
					playerPosition={ playerPosition }
					playerRotation={ playerRotation }
					mapBlocks={ mapBlocks }
                    knightMesh={ knightMesh }
					monsters={ monsters }
					playerHp={playerHp}
					playerMaxHp={playerMaxHp}
					targetPosition={targetPosition}
				/> : 'Loading' }
			</div>
		</div>;
    }

}