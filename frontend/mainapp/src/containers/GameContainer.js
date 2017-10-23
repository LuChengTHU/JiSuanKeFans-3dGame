import React, { Component, PropTypes} from 'react';
import * as THREE from 'three';
import { Vector3, Euler } from 'three';

import Game from '../components/Game';

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
            playerPosition: new Vector3( 0, 0, 0 ),
            playerRotation: new Euler( 0, 0, 0 ),
            cameraPosition: new Vector3( 10, 10, 20 ),
            lookAt: new Vector3( 0, 0, 0 ),
            knightMesh : null,
            knightMixer : null,
            ready : false
        };
    }

    componentDidMount() {

        // Track if we're mounted so game loop doesn't tick after unmount
        this.mounted = true;

        // Expose the global THREE object for use in debugging console
        window.THREE = THREE;

        // Load the geometry in didMount, which is only executed server side.
        // Note we can pass our JSON file paths to webpack!

        // const geometry = robot;
        //
        // this.setState({geometry}, ()=>{console.log(this.state);});

        // loadJsonModel( `${process.env.PUBLIC_URL}/assets/robot.json` ).then(
        //     (geometry) => {
        //         this.setState({geometry});
        //     }
        // );


        let loader = new THREE.JSONLoader();
        loader.load(`${process.env.PUBLIC_URL}/assets/knight.json`,
            (geometry, materials) => {
                let material = materials[ 0 ];
                material.emissive.set( 0x101010 );
                material.skinning = true;
                material.morphTargets = true;
                let mesh = new THREE.SkinnedMesh( geometry, material );
                let mixer = new THREE.AnimationMixer( mesh );
                for ( let i = 0; i < mesh.geometry.animations.length; i ++ ) {
                    let action = mixer.clipAction( mesh.geometry.animations[ i ] );
                    if ( i === 1 ) action.timeScale = 0.05;
                    action.play();
                }
                this.setState({
                    knightMesh:mesh,
                    mixer:mixer,
                    ready:true,
                    geometry:mesh.geometry,
                    clock:new THREE.Clock()
                });

                // Start the game loop when this component loads
                this.requestGameLoop();

            });

        // loadObjModel( `${process.env.PUBLIC_URL}/assets/Garen.obj` ).then(
        //     (obj) => {
        //         // let texture = new THREE.Texture();
        //         // obj.traverse( function( child ) {
        //         //     if(child instanceof THREE.Mesh) {
        //         //         //child.material.map = texture;
        //         //     }
        //         // })
        //         obj.position.y = 0;
        //         obj.position.x = 0;
        //         obj.position.z = 0;
        //         this.setState({objPlayer : obj});
        //         console.log(obj)
        //     }
        // );



    }

    componentWillUnmount() {

        this.mounted = false;
        this.cancelGameLoop();

    }


    requestGameLoop() {

        this.reqAnimId = window.requestAnimationFrame( this.gameLoop );

    }

    cancelGameLoop() {

        window.cancelAnimationFrame( this.reqAnimId );

    }

    // Our game loop, which is managed as the window's requestAnimationFrame
    // callback
    gameLoop = (time) => {

        if( !this.mounted || !this.state.ready) {
            return;
        }

        this.requestGameLoop();

        const oldState = this.state;

        // Apply our reducer functions to the "game state", which for this
        // example is held in local container state. It could be moved into
        // a redux/flux store and udpated once per game loop.
        const newState = playerMovement( oldState, time );

        this.setState( newState );
    };

    render() {

        const width = window.innerWidth;
        const height = window.innerHeight;

        const {
            cameraPosition, geometry, lookAt, playerPosition, playerRotation, knightMesh
        } = this.state;

        // Pass the data <Game /> needs to render. Note we don't show the game
        // until the geometry model file is loaded. This could be replaced with
        // a loading  screen, or even a 3d scene without geometry in it
        return <div>
            { geometry ? <Game
                width={ width }
                height={ height }
                cameraPosition={ cameraPosition }
                lookAt={ lookAt }
                geometry={ geometry }
                playerPosition={ playerPosition }
                playerRotation={ playerRotation }
                knightMesh={ knightMesh }
            /> : 'Loading' }
        </div>;

    }

}