import React, { Component, PropTypes} from 'react';
import * as THREE from 'three';

import { Vector3, Euler, Geometry, DoubleSide, PerspectiveCamera, } from 'three';

import EditorGame from '../components/EditorGame';
import MapBlock from '../components/MapBlock';
import * as Logic from '../logic/logic';
import TracerControls from '../utils/tracer';

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
            // mouseInput: null, 
            // scene: null,
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

    addMonster(id, x, z, maxHp)
	{
	    let mesh = new THREE.SkinnedMesh(this.state.monsterGeometry, this.state.monsterMaterial)
        mesh.scale.set(0.15, 0.15, 0.15);
        let mixer = new THREE.AnimationMixer(mesh);
        let moveAction = mixer.clipAction(mesh.geometry.animations[1]);
        let attackAction = mixer.clipAction(mesh.geometry.animations[0]);
        this.setWeight(moveAction, 0);
        this.setWeight(attackAction, 1);
        let actions = [moveAction, attackAction];
        actions.forEach(function (action) {
            action.play();
        });

		this.setState((prevState, props) => {
			let ms = prevState.monsters.slice(0);
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
	
	// setMonsterHp(id, hp)
	// {
	// 	if(hp < 0) hp = 0;
	// 	this.setState((prevState, props) => {
	// 		let ms = prevState.monsters.slice(0);
	// 		ms[id].hp = hp;
	// 		return {monsters: ms};
	// 	});
	// }
    
    setWeight = ( action, weight ) => {
        action.enabled = true;
        action.setEffectiveTimeScale( 1 );
        action.setEffectiveWeight( weight );
    };

    setTargetPos(x, z)
	{
		if(x)
			this.setState({targetPosition: new Vector3(x, 0.05, z)});
		else
			this.setState({targetPosition: null});
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
            camera,
            // mouseInput,

            playerPosition,
            playerRotation,
            
            mapBlocks,
            
            knightMesh,
            monsters
        } = this.state;
        
        // Pass the data <Game /> needs to render. Note we don't show the game
        // until the geometry model file is loaded. This could be replaced with
        // a loading  screen, or even a 3d scene without geometry in it
        return <div ref="container">
            <div>
                { this.state.monsterGeometry ? <EditorGame
                    width={ width }
                    height={ height }
                    camera={ camera }
                    playerPosition={ playerPosition }
                    playerRotation={ playerRotation }
                    mapBlocks={ mapBlocks }
                    knightMesh={ knightMesh }
                    monsters={ monsters }
                    // mouseInput={ mouseInput }
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

        const {
            container,
        } = this.refs;

        this.camera = new PerspectiveCamera(75, 1, 0.1, 1000);
        this.camera.position.x = 5;
        this.camera.position.y = 5;
        this.camera.position.z = 0;

        const controls = new TracerControls(this.camera, container);

        controls.slideSpeed = 2.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        controls.noZoom = false;
        controls.noPan = false;
        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;
        controls.maxDistance = 10;

        this.controls = controls;            
        this.controls.addEventListener('change', this.onTrackballChange);       
        
        this.setState({
            camera: this.camera,
        })

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
                let moveAction = mixer.clipAction( mesh.geometry.animations[ 0 ] );
                let attackAction = mixer.clipAction( mesh.geometry.animations[ 2 ] );
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
                this.requestGameLoop();
            });

            let monsterLoader = new THREE.JSONLoader();
            monsterLoader.load(`${process.env.PUBLIC_URL}/assets/spider.json`,
                (geometry, materials) => {
                    let material = materials[0];
                    material.emissive.set(0x101010);
                    material.skinning = true;
                    material.morphTargets = true;

                    this.setState({
                        monsterGeometry: geometry,
                        monsterMaterial: material
                    });
                });

		if(typeof(this.props.onLoaded) !== 'undefined')
			this.props.onLoaded();
    }

    componentDidUpdate(newProps) {
        // const {
        //     mouseInput,
        // } = this.state;

        const {
            width,
            height,
        } = this.props;

        // if (width !== newProps.width || height !== newProps.height) {
        //     mouseInput.containerResized();
        // }
    }
    
    componentWillUnmount() {
    
        this.mounted = false;

        // Remove Trackball
        this.controls.removeEventListener('change', this.onTrackballChange);
        this.controls.dispose();
        delete this.controls;

        // Cancel
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

        // const {
        //     mouseInput,
        // } = this.refs;

        // console.log(this.camera.position);

        this.controls.update();
        // const {
        //     // mouseInput,
        //     camera,
        // } = this.state;
        
        // console.log(this.statcamera);

        // if (!mouseInput.isReady()) {
        //     const {
        //         scene,
        //         container,
        //     } = this.refs;

        //     mouseInput.ready(scene, container, camera);
        //     mouseInput.setActive(false);
        // }
        
        // if (this.state.mouseInput !== mouseInput) {
        //     this.setState({
        //         mouseInput,
        //     });
        // }

        if (this.state.camera !== this.camera) {
            this.setState({
                camera: this.camera,
            });
        }
    
    };

    onTrackballChange = () => {
        this.setState({
            camera: this.camera,
        });
    }
}