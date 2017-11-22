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
                { knightMesh ? <EditorGame ref={val => { this.gameRef = val; }}
                    width={ width }
                    height={ height }
                    camera={ camera }
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

        const {
            container,
        } = this.refs;

        container.addEventListener('mousedown', this.onMouseDown, false);
        const divObj = window.document.getElementById('editorGameContainer');
        const screenWidth = divObj.clientWidth;
        const screenHeight = window.innerHeight * .8;
        this.camera = new PerspectiveCamera(60, screenWidth/screenHeight, 0, 100);
        this.camera.position.set(5, 5, 0);

        const controls = new TracerControls(this.camera, container);

        controls.slideSpeed = 2.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        controls.noZoom = false;
        controls.noPan = false;
        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;
        // controls.maxDistance = 10;

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
        this.controls.update();
        this.setState({
            camera: this.camera,
        });
    
    };

    onTrackballChange = () => {
        this.setState({
            camera: this.camera,
        });
    }

    onMouseDown = (event) => {
        document.addEventListener('mousemove', this.onMouseMove, false);
        document.addEventListener('mouseup', this.onMouseUp, false);
    }

    onMouseMove = () => {
        document.removeEventListener('mouseup', this.onMouseUp, false);
    }

    onMouseUp = (event) => {
        document.removeEventListener('mouseup', this.onMouseUp, false);
        document.removeEventListener('mousemove', this.onMouseMove, false);
        
        const divObj = window.document.getElementById('editorGameContainer');
        if (divObj) {
            const screenWidth = divObj.clientWidth;
            const screenHeight = window.innerHeight * .8;

            console.log(this.camera);

            const mouse = new THREE.Vector2();
            mouse.x =   (event.clientX / screenWidth)  * 2 - 1;
            mouse.y = - (event.clientY / screenHeight) * 2 + 1;

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera( mouse, this.camera );
            const intersects = raycaster.intersectObjects( this.gameRef.sceneRef.children );
            
            console.log(intersects);
            
            
            // const standardVector  = new THREE.Vector3(mouse.x, mouse.y, 0.5);//标准设备坐标
            // const worldVector = standardVector.unproject(this.camera);
            // const ray = worldVector.sub(this.camera.position).normalize();
            // const pos = this.camera.position;

            // const t = -pos.y / ray.y;
            // const interX = pos.x + t * ray.x;
            // const interZ = pos.z + t * ray.z;

            // console.log(interX, interZ);
        }
    }
}