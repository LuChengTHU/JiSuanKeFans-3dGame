import React, { Component, PropTypes} from 'react';
import * as THREE from 'three';

import { Vector3, Euler, Geometry, DoubleSide, } from 'three';

import Game from '../components/Game';
import MapBlock from '../components/MapBlock';
import * as Logic from '../logic/logic';
import TrackballControls from '../utils/trackball';

import playerMovement from '../logic/playerMovement';


export default class EditorGameContainer extends Component {
    constructor(props) {
        super(props);
        window.ui = this;
        window.Game = Logic.default;

        // Initial scene state
        this.state = {
            playerPosition: new Vector3( 0, 0, 0 ),
            playerRotation: new Euler( 0, 0, 0 ),
            cameraPosition: new THREE.Vector3( 2.5999999, 5, 4.07 ),
            cameraRotation: new THREE.Euler(),
            //lookAt: new THREE.Vector3( 2.60, 0, 4.07 ),
            monsters: []
        };
    }

    createMap(height, width)
	{
		let bs = [];
		for(let i = 0; i < height; ++i)
			for(let j = 0; j < width; ++j)
				bs.push(<MapBlock x={i} z={j}/>);
		this.setState({mapBlocks: bs, monsters: []});
	}
	
	createPlayer(x, z)
	{
		this.setState(
			{
				playerPosition : new Vector3(x, 0, z),
				playerTargetPosition : new Vector3(x, 0, z),
				playerRotation : new Euler(0, -Math.PI / 2, 0),
			}
		);
	}
	
	setPlayerDirection(x, z)
	{
		this.setState(
			{	
                playerDirection : new Vector3(x, 0, z),
			}
		);
    }
    
    setWeight = ( action, weight ) => {
        action.enabled = true;
        action.setEffectiveTimeScale( 1 );
        action.setEffectiveWeight( weight );
    };


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

        // console.log(cameraPosition);
        // console.log(lookAt);

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
    
            // const container = this.refs.container;
            // container.addEventListener('mousedown', this.onGameMouseDown, false);
            //container.addEventListener('click', this.onGameMouseClick, false);

            const controls = new TrackballControls(this.camera);

            controls.rotateSpeed = 1.0;
            controls.zoomSpeed = 1.2;
            controls.panSpeed = 0.8;
            controls.noZoom = false;
            controls.noPan = false;
            controls.staticMoving = true;
            controls.dynamicDampingFactor = 0.3;

            this.controls = controls;            
            this.controls.addEventListener('change', this.onTrackballChange);            
    
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
    
                });
        }
        
        componentWillUnmount() {
        
            this.mounted = false;

            // Remove Trackball
            this.controls.removeEventListener('change', this.onTrackballChange);
            this.controls.dispose();
            delete this.controls;
            
            // const container = this.refs.container;
            // container.removeEventListener('mousedown', this.onGameMouseDown, false);
            // document.removeEventListener('mousemove', this.onGameMouseMove, false);
            // document.removeEventListener('mouseup', this.onGameMouseUp, false);
            // document.removeEventListener('mouseout', this.onGameMouseOut, false);
        
        }

        onTrackballChange = () => {
            this.setState({
                cameraPosition: this.refs.camera.position.clone(),
                cameraRotation: this.refs.camera.position.clone(),
            });
        }

        // // Mouse Click
        // onGameMouseClick = (event) => {
        //     event.preventDefault();

        //     console.log("Clicked.");
        // }

        // // Mouse Down
        // onGameMouseDown = (event) => {
        //     event.preventDefault();

        //     document.addEventListener('mousemove', this.onGameMouseMove, false);
        //     document.addEventListener('mouseup', this.onGameMouseUp, false);
        //     document.addEventListener('mouseout', this.onGameMouseOut, false);

        //     this.dragging = false;

        //     /*
        //         .. to add codes
        //         record the initial position of mouse
        //     */
        //     this.mouseXOnMouseDown = event.clientX;
        //     this.mouseYOnMouseDown = event.clientY;

        //     this.cameraXOnMouseDown = this.state.cameraPosition.x;
        //     this.cameraYOnMouseDown = this.state.cameraPosition.y;
        //     this.cameraZOnMouseDown = this.state.cameraPosition.z;

        //     this.lookAtXOnMouseDown = this.state.lookAt.x;
        //     this.lookAtYOnMouseDown = this.state.lookAt.y;
        //     this.lookAtZOnMouseDown = this.state.lookAt.z;
        // };

        // // Mouse Moving
        // onGameMouseMove = (event) => {
        //     /*
        //         .. to add codes
        //     */
        //     this.mouseX = event.clientX;
        //     this.mouseY = event.clientY;
    
        //     let DeltaX = (this.mouseX - this.mouseXOnMouseDown) * 0.005;
        //     let DeltaY = (this.mouseY - this.mouseYOnMouseDown) * 0.005;
        //     let SightX = (this.state.lookAt.x - this.state.cameraPosition.x);
        //     let SightZ = (this.state.lookAt.z - this.state.cameraPosition.z);
            
        //     let SightLen = Math.sqrt(SightX * SightX + SightZ * SightZ);
        //     SightX = 1. * SightX / SightLen;
        //     SightZ = 1. * SightZ / SightLen;
        //     let vSightX = SightZ;
        //     let vSightZ = -SightX;
    
        //     this.cameraX = this.cameraXOnMouseDown + (DeltaY * SightX + DeltaX * vSightX);
        //     this.cameraY = this.cameraYOnMouseDown;
        //     this.cameraZ = this.cameraZOnMouseDown + (DeltaY * SightZ + DeltaX * vSightZ);
    
        //     this.lookAtX = this.lookAtXOnMouseDown + (DeltaY * SightX + DeltaX * vSightX);
        //     this.lookAtY = this.lookAtYOnMouseDown;
        //     this.lookAtZ = this.lookAtZOnMouseDown + (DeltaY * SightZ + DeltaX * vSightZ);

        //     this.dragging = true;
    
        //     // this.setCameraPosition(this.cameraX, this.cameraY, this.cameraZ);
        //     // this.setLookAt(this.lookAtX, this.lookAtY, this.lookAtZ);

        //     // this.setState(
        //     //     {
        //     //         cameraPosition : new Vector3(this.cameraX, this.cameraY, this.cameraZ),
        //     //         lookAt : new Vector3(this.lookAtX, this.lookAtY, this.lookAtZ),
        //     //     }
        //     // );
        // };
    
        // // Mouse Up
        // onGameMouseUp = (event) => {
        //     document.removeEventListener('mousemove', this.onGameMouseMove, false);
        //     document.removeEventListener('mouseup', this.onGameMouseUp, false);
        //     document.removeEventListener('mouseout', this.onGameMouseOut, false);	

        //     console.log(event.clientX, event.clientY);

        //     if (!this.dragging) {
        //         // Clicked
        //         let gridX = parseInt((event.clientX - 110) / 45.4);
        //         let gridY = parseInt((317 - event.clientY) / 45.4);

        //         console.log(gridX, gridY);

        //         this.setState(
        //             {
        //                 playerPosition : new Vector3(gridY, 0, gridX),
        //             }
        //         );
        //     }
        //     /* 
        //         ... to add codes
        //         place a person
        //     */
        // };
    
        // // Mouse Out
        // onGameMouseOut = () => {
        //     document.removeEventListener('mousemove', this.onGameMouseMove, false);
        //     document.removeEventListener('mouseup', this.onDocumentMouseUp, false);
        //     document.removeEventListener('mouseout', this.onGameMouseOut, false);
        // };
}