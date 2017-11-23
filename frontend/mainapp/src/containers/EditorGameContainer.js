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

        this.createMap = this.createMap.bind(this);
        this.setPlayerDirection = this.setPlayerDirection.bind(this);
        this.createPlayer = this.createPlayer.bind(this);
        this.addMonster = this.addMonster.bind(this);
    }

    createMap(height, width)
	{
		let bs = [];
		for(let i = 0; i < height; ++i)
			for(let j = 0; j < width; ++j)
				bs.push(<MapBlock x={i} z={j}/>);
		this.setState({mapBlocks: bs, monsters: [], height: height, width: width});
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
		if(!this.state.monsterGeometry || !this.state.monsterMaterial)
		{
			// window.setTimeOut(()=>this.addMonster(id, x, z, maxHp), 1000);
			return;
		}
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
            targetPosition,
            
            mapBlocks,
            
            knightMesh,
            monsters
        } = this.state;
        
        // Pass the data <Game /> needs to render. Note we don't show the game
        // until the geometry model file is loaded. This could be replaced with
        // a loading  screen, or even a 3d scene without geometry in it
        return <div ref="container">
            <div>
                { this.state.monsterGeometry&&this.state.monsterMaterial&&knightMesh ? <EditorGame ref={val => { this.gameRef = val; }}
                    width={ width }
                    height={ height }
                    camera={ camera }
                    playerPosition={ playerPosition }
                    playerRotation={ playerRotation }
                    targetPosition={ targetPosition }
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

        this.refs.container.addEventListener('mousedown', this.onMouseDown, false);
        const divObj = window.document.getElementById('editorGameContainer');
        const screenWidth = divObj.clientWidth;
        const screenHeight = window.innerHeight * .8;
        this.camera = new PerspectiveCamera(60, screenWidth/screenHeight, 1, 100);
        this.camera.position.set(5, 5, 0);

        const controls = new TracerControls(this.camera, this.refs.container);

        controls.slideSpeed = 2.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        controls.noZoom = false;
        controls.noPan = false;
        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;
        controls.minDistance = 1;
        // controls.maxDistance = 10;

        this.controls = controls;            
        this.controls.addEventListener('change', this.onTrackballChange);       
        
        this.setState({
            camera: this.camera,
        })

        let loader = new THREE.JSONLoader();
        loader.load(`${process.env.PUBLIC_URL}/assets/guitongzi_action.json`,
            (geometry, materials) => {
                for(let i = 0; i < materials.length; i++) {
                    materials[i].emissive.set(0x101010);
                    materials[i].skinning = true;
                    materials[i].morphTargets = true;
                }
                let mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));
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
    
    componentWillUnmount() {
    
        this.mounted = false;

        // Remove Trackball
        this.controls.removeEventListener('change', this.onTrackballChange);
        this.controls.dispose();
        delete this.controls;

        this.refs.container.removeEventListener('mousedown', this.onMouseDown);

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
        event.preventDefault();
        document.addEventListener('mousemove', this.onMouseMove, false);
        document.addEventListener('mouseup', this.onMouseUp, false);
        // this.initClientX = event.clientX;
        // this.initClientY = event.clientY
        // console.log(event.clientX, event.clientY)
    }

    onMouseMove = (event) => {
        event.preventDefault();
        document.removeEventListener('mouseup', this.onMouseUp, false);
    }

    onMouseUp = (event) => {
        event.preventDefault();
        document.removeEventListener('mouseup', this.onMouseUp, false);
        document.removeEventListener('mousemove', this.onMouseMove, false);
        
        const divObj = window.document.getElementById('editorGameContainer');
        if (divObj) {
            const screenWidth = divObj.clientWidth;
            const screenHeight = window.innerHeight * .8;
            this.camera.aspect = screenWidth/screenHeight;
            this.camera.updateProjectionMatrix();
            this.camera.updateMatrixWorld();

            const mouse = new THREE.Vector2();
            mouse.x =   (event.offsetX / screenWidth)  * 2 - 1;
            mouse.y =  -(event.offsetY / screenHeight) * 2 + 1;

            console.log(mouse.x, mouse.y)

            // const raycaster = new THREE.Raycaster();
            // raycaster.setFromCamera( mouse, this.camera );
            // const intersects = raycaster.intersectObjects( this.gameRef.sceneRef.children );
            // console.log(this.gameRef.sceneRef.children)
            
            // console.log(intersects);
            
            
            const standardVector = new THREE.Vector3(mouse.x, mouse.y, 0.5);//标准设备坐标
            const worldVector = standardVector.unproject(this.camera);
            const ray = worldVector.sub(this.camera.position).normalize();
            const pos = this.camera.position;

            const t = -pos.y / ray.y;
            const interX = pos.x + t * ray.x;
            const interZ = pos.z + t * ray.z;

            let gridX = Math.round(interX);
            let gridY = Math.round(interZ);
            let height = this.state.height;
            let width = this.state.width;
            console.log(gridX, gridY);
            console.log(window.map)
            if (gridX >= 0 && gridY >=0 && gridX < width && gridY < height) {
                if (this.state.selected === "Player") {
                    let monsters = this.state.monsters;
                    for (let i = 0; i < monsters.length; ++ i) 
                        if (monsters[i].hp > 0 && monsters[i].position.x == gridX && monsters[i].position.z == gridY)
                            return ;
                    this.setState({
                        playerPosition: new THREE.Vector3(gridX, 0, gridY)
                    })
                    window.map.init_pos = [gridX, gridY]
                }
                else if (this.state.selected === "Target") {
                    this.setState({
                        targetPosition: new THREE.Vector3(gridX, 0, gridY)
                    })
                    window.map.final_pos = [gridX, gridY]
                }
                else if (this.state.selected === "Monster") {
                    if (this.state.playerPosition.x == gridX && this.state.playerPosition.z == gridY)
                        return ;
                    
                    let ms = [];
                    let exist = false;
                    let monsters = this.state.monsters;

                    for (let i = 0; i < monsters.length; ++ i) 
                        if (monsters[i].hp > 0 && Math.round(monsters[i].position.x) == gridX 
                          && Math.round(monsters[i].position.z) == gridY) {
                            exist = true;
                            monsters[i].hp = -1;
                            window.map.init_AI_infos[i].hp = -1;
                        }
                        
                    if (!exist) {
                        let id = monsters.length;
                        this.addMonster(id, gridX, gridY, 10);
                        if (id > window.map.init_AI_infos.length)
                            window.map.init_AI_infos.length = id + 1;
                        
                        window.map.init_AI_infos[id] = {
                            "pos": [gridX, gridY],
                            "id": "naive",
                            "hp": 1,
                            "attack": 1,
                            "code": "Game.gameTurn(Game.GameCW);",
                            "dir": 17
                        };
                    }
                    else {
                        this.setState({
                            monsters: monsters
                        })
                    }
                }
            }
        }
    }
}
