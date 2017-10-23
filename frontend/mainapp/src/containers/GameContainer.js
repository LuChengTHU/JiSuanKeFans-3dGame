import React, { Component, PropTypes} from 'react';
import * as THREE from 'three';

import Game from '../components/Game';

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

        // Initial scene state
        this.state = {
            cameraPosition: new THREE.Vector3( -3, 3, -3 ),
            geometry: new THREE.Geometry(),
            lookAt: new THREE.Vector3( 0, 0, 0 ),
            playerPosition: new THREE.Vector3( 0, 2, 0),
            playerRotation: new THREE.Vector3( 0, 0, 0)
        };

        loadModel(  '../assets/sitepoint-robot.json'  ).then(geometry =>
            this.setState({ geometry })
        );


    }
    //
    // componentDidMount() {
    //
    //     // Track if we're mounted so game loop doesn't tick after unmount
    //     this.mounted = true;
    //
    //     // Expose the global THREE object for use in debugging console
    //     window.THREE = THREE;
    //
    //     // Load the geometry in didMount, which is only executed server side.
    //     // Note we can pass our JSON file paths to webpack!
    //     loadModel( require( '../assets/sitepoint-robot.json' ) ).then(geometry =>
    //         this.setState({ geometry })
    //     );
    //
    //     // // Start the game loop when this component loads
    //     // this.requestGameLoop();
    //
    // }
    //
    // componentWillUnmount() {
    //
    //     this.mounted = false;
    //     this.cancelGameLoop();
    //
    // }
    //
    //
    // requestGameLoop = () => {
    //
    //     this.reqAnimId = window.requestAnimationFrame( this.gameLoop );
    //
    // }
    //
    // cancelGameLoop = () => {
    //
    //     window.cancelAnimationFrame( this.reqAnimId );
    //
    // }
    //
    // // Our game loop, which is managed as the window's requestAnimationFrame
    // // callback
    // gameLoop = (time) => {
    //
    //     if( !this.mounted ) {
    //         return;
    //     }
    //
    //     this.requestGameLoop();
    //
    //     const oldState = this.state;
    //
    //     // Apply our reducer functions to the "game state", which for this
    //     // example is held in local container state. It could be moved into
    //     // a redux/flux store and udpated once per game loop.
    //     const newState = playerMovement( oldState, time );
    //
    //     this.setState( newState );
    // }

    render() {

        const width = window.innerWidth;
        const height = window.innerHeight;

        const {
            cameraPosition, geometry, lookAt, playerPosition, playerRotation,
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
				/> : 'Loading' }
			</div>
		</div>;

    }

}