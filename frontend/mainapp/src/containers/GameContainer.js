import React, { Component, PropTypes} from 'react';
import * as THREE from 'three';
import { Vector3, Euler, Geometry, DoubleSide, } from 'three';

import Game from '../components/Game';
import MapBlock from '../components/MapBlock';
import * as Logic from '../logic/logic';

import { loadModel, } from '../utils/utils';

// Load our simple functions that manage scene/game state
import playerMovement from '../logic/playerMovement';

/**
 * Our "container" component. See https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0#.jwywi6ltw
 * for more reading. This container holds the game logic, but not the view code
 */
export default class GameContainer extends Component {

    constructor() {

        super();
		window.ui = this;
		window.Game = Logic.default;
		window.blocklyCallback = () => {};
		window.blocklyShouldRun = false;
		
		window.blocklyAutoRun = () =>
		{
			window.setTimeout(window.blocklyAutoRun, 1);
			if(window.blocklyShouldRun)
				window.blocklyCallback();
		};
		window.blocklyAutoRun();

        // Initial scene state
        this.state = {
            cameraPosition: new THREE.Vector3( -3, 6, -3 ),
            geometry: new THREE.Geometry(),
            lookAt: new THREE.Vector3( 3, 0, 3 ),
        };

        loadModel(  '../assets/sitepoint-robot.json'  ).then(geometry =>
            this.setState({ geometry })
        );

		this.createMap = this.createMap.bind(this);
		this.setPlayerDirection = this.setPlayerDirection.bind(this);
		this.createPlayer = this.createPlayer.bind(this);
		this.playerMoveForward = this.playerMoveForward.bind(this);
		this.playerTurnCW = this.playerTurnCW.bind(this);
		this.playerTurnCCW = this.playerTurnCCW.bind(this);
    }
	
	createMap(height, width)
	{
		let bs = [];
		for(let i = 0; i < height; ++i)
			for(let j = 0; j < width; ++j)
				bs.push(<MapBlock x={i} z={j}/>);
		this.setState({mapBlocks: bs});
	}
	
	createPlayer(x, z)
	{
		this.setState(
			{
				playerPosition : new Vector3(x, 1, z),
				playerTargetPosition : new Vector3(x, 1, z),
				playerRotation : new Euler(),
			}
		);
	}
	
	setPlayerDirection(x, z)
	{
		this.setState(
			{	playerDirection : new Vector3(x, 0, z),
			}
		);
	}
	
	playerTurnCW()
	{
		this.setState((prevState, props) => {
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
	}
	
	playerTurnCCW()
	{
		this.setState((prevState, props) => {
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
	}
	
	playerMoveForward()
	{
		this.setState({playerAnimateForward: true});
		window.blocklyShouldRun = false;
	}
    
    componentDidMount() {
    
        // Track if we're mounted so game loop doesn't tick after unmount
        this.mounted = true;
    
        // Expose the global THREE object for use in debugging console
        window.THREE = THREE;
    
        // Load the geometry in didMount, which is only executed server side.
        // Note we can pass our JSON file paths to webpack!
        // loadModel( require( '../assets/sitepoint-robot.json' ) ).then(geometry =>
            // this.setState({ geometry })
        // );
    
        // Start the game loop when this component loads
        this.requestGameLoop();
    
    }
    
    componentWillUnmount() {
    
        this.mounted = false;
        this.cancelGameLoop();
    
    }
    
    
    requestGameLoop = () => {
    
        this.reqAnimId = window.requestAnimationFrame( this.gameLoop );
    
    }
    
    cancelGameLoop = () => {
    
        window.cancelAnimationFrame( this.reqAnimId );
    
    }
    
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
    
        this.setState( newState );
		if(newState.ready)
			window.blocklyCallback();
    }

    render() {

		const divObj = window.document.getElementById('gameContainer');
        let width = 0;
        let height = 0;
		if(divObj)
		{
			width = divObj.clientWidth;
			// height = divObj.clientHeight;
			height = window.innerHeight * .8;
		}

        const {
            cameraPosition, geometry, lookAt, playerPosition, playerRotation, mapBlocks
        } = this.state;

        // Pass the data <Game /> needs to render. Note we don't show the game
        // until the geometry model file is loaded. This could be replaced with
        // a loading  screen, or even a 3d scene without geometry in it
        return <div>
			<div>
				{ geometry ? <Game
					width={ width }
					height={ height }
					cameraPosition={ cameraPosition }
					lookAt={ lookAt }
					geometry={ geometry }
					playerPosition={ playerPosition }
					playerRotation={ playerRotation }
					mapBlocks={ mapBlocks }
				/> : 'Loading' }
			</div>
		</div>;

    }

}