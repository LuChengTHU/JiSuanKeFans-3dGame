import React, { Component, PropTypes} from 'react';
import * as THREE from 'three';

import { Vector3, Euler, Geometry, DoubleSide, } from 'three';

import Game from '../components/Game';
import MapBlock from '../components/MapBlock';
import * as Logic from '../logic/logic';

import playerMovement from '../logic/playerMovement';


export default class EditorGameContainer extends Component {
    constructor(props) {
        super(props);
        window.ui = this;
        window.Game = Logic.default;

        // Initial scene state
        this.state = {
            playerPosition: new Vector3( 0, 0, 0 ),
            playerRotation: new Euler( 0, -Math.PI / 2, 0 ),
            cameraPosition: new THREE.Vector3( 5, 5, -3 ),
            lookAt: new THREE.Vector3( 5, 0, 5 ),
            monsters: []
        };
    }

    render() {

        const divObj = window.document.getElementById('editorGameContainer');
        let width = 0;
        let height = 0;
        if(divObj)
        {
            width = divObj.clientWidth;
            height = window.innerHeight * .8;
        }

        const {

            cameraPosition, lookAt, playerPosition, playerRotation, mapBlocks, knightMesh, monsters
        } = this.state;

        // Pass the data <Game /> needs to render. Note we don't show the game
        // until the geometry model file is loaded. This could be replaced with
        // a loading  screen, or even a 3d scene without geometry in it
        return <div ref="container">
            <div>
                { knightMesh ? <Game
                    width={ width }
                    height={ height }
                    cameraPosition={ cameraPosition }
                    lookAt={ lookAt }
                    playerPosition={ playerPosition }
                    playerRotation={ playerRotation }
                    mapBlocks={ mapBlocks }
                    knightMesh={ knightMesh }
                    monsters={ monsters }
                /> : 'Loading' }
            </div>
        </div>;
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
    
            const container = this.refs.container;
            container.addEventListener('mousedown', this.onGameMouseDown, false);
            // document.addEventListener('mousemove', this.onGameMouseMove, false);
            // document.addEventListener('mouseup', this.onGameMouseUp, false);
            // document.addEventListener('mouseout', this.onGameMouseOut, false);
    
            let loader = new THREE.JSONLoader();
            loader.load(`${process.env.PUBLIC_URL}/assets/guitongzi_action.json`,
                (geometry, materials) => {
                    let material = materials[ 0 ];
                    material.emissive.set( 0x101010 );
                    material.skinning = true;
                    material.morphTargets = true;
                    let mesh = new THREE.SkinnedMesh( geometry, material );
                    mesh.scale.set( 0.01, 0.01, 0.01 );
                    let mixer = new THREE.AnimationMixer( mesh );
                    // for ( let i = 0; i < mesh.geometry.animations.length; i ++ ) {
                    //     let action = mixer.clipAction( mesh.geometry.animations[ i ] );
                    //     action.play();
                    // }
                    let moveAction = mixer.clipAction( mesh.geometry.animations[ 0 ] );
                    let attackAction = mixer.clipAction( mesh.geometry.animations[ 2 ] );
                    //attackAction.setLoop(THREE.LoopOnce, 0);
                    this.setWeight(moveAction, 1);
                    this.setWeight(attackAction, 0);
                    let actions = [ moveAction, attackAction];
    
                    actions.forEach( function ( action ) {
                        action.play();
                    } );
    
                    this.setState({
                        knightMesh:mesh,
                        mixer:mixer,
                        clock:new THREE.Clock(),
                        actions: actions,
                        currentAction: moveAction
                    });
    
                    // Start the game loop when this component loads
                    this.requestGameLoop();
    
                });
        
        }
        
        componentWillUnmount() {
        
            this.mounted = false;
            
            const container = this.refs.container;
            container.removeEventListener('mousedown', this.onGameMouseDown, false);
            document.removeEventListener('mousemove', this.onGameMouseMove, false);
            document.removeEventListener('mouseup', this.onGameMouseUp, false);
            document.removeEventListener('mouseout', this.onGameMouseOut, false);
    
            this.cancelGameLoop();
        
        }
}