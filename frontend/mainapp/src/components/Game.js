import React, { Component, PropTypes, } from 'react';
import React3 from 'react-three-renderer';
import { Vector3, Euler, Geometry, DoubleSide, } from 'three';
import * as THREE from 'three';

import Player from './Player';
import MapBlock from './MapBlock';
import * as Logic from '../logic/logic';


/**
 * Our main class to display the game. This contains only view code! It's very
 * easy to reason about
 */
export default class Game extends Component {

    static propTypes = {
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        cameraPosition: PropTypes.instanceOf( Vector3 ).isRequired,
        lookAt: PropTypes.instanceOf( Vector3 ).isRequired,
        geometry: PropTypes.instanceOf( Geometry ).isRequired,
        playerPosition: PropTypes.instanceOf( Vector3 ).isRequired,
        playerRotation: PropTypes.instanceOf( Euler ).isRequired,
    }
    constructor(props, context) {
        super(props, context);
		window.ui = this;
		window.Game = Logic.default;

        this.state = {
			rotation: new THREE.Euler(),
			
			roting: true,
			mapBlocks: [],
			playerPosition: new Vector3(0, 1, 0),
			playerRotation: new Euler(),
			playerDirection: new Vector3(1, 0, 0)
        };

		this._onAnimate = () => {
		  // we will get this callback every frame

		  // this helps with updates and pure rendering.
		  
		  if(this.state.roting)
			  this.setState({
				rotation: new THREE.Euler(
				  this.state.rotation.x + 0.1,
				  this.state.rotation.y + 0.2,
				  0
				),
			  });
		};
		
		this.createMap = this.createMap.bind(this);
		this.setPlayerDirection = this.setPlayerDirection.bind(this);
		this.createPlayer = this.createPlayer.bind(this);
		this.addPlayer = this.addPlayer.bind(this);
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
			{	playerPosition : new Vector3(x, 1, z),
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
	}
	
	playerMoveForward()
	{
		console.log('call move');
		this.setState((prevState, props) => {
			let tmp = new Vector3(0, 0, 0);
			tmp.add(prevState.playerPosition);
			tmp.add(prevState.playerDirection);
			return {playerPosition: tmp};
		});
	}
	
	// TODO: change its name to "onClick"
	addPlayer()
	{
		this.createMap(Math.ceil(Math.random() * 10), Math.ceil(Math.random() * 10));
		this.createPlayer();
	}

    render() {
        const {
            width, height, cameraPosition, geometry, lookAt, playerPosition,
            playerRotation
        } = this.props;

        const { faces, vertices, faceVertexUvs, } = geometry;

		// return <div> width={ width }, height={ height }
                    // lookAt={ lookAt.x } </div>
		let ans = <React3
            mainCamera="camera"
            width={ width }
            height={ height }
            antialias
			onAnimate={this._onAnimate}
        >
            <resources>
                <texture
                    resourceId="robotImage"
                    url={ require( '../assets/sitepoint-robot-texture.jpg' ) }
                    anisotropy={ 16 }
                />
                <meshPhongMaterial
                    resourceId="robotTexture"
                    side={ DoubleSide }
                >
                    <textureResource
                        resourceId="robotImage"
                    />
                </meshPhongMaterial>
                <texture
                    resourceId="grassImage"
                    url={ require( '../assets/grass.jpg' ) }
                    anisotropy={ 16 }
                />
                <meshPhongMaterial
                    resourceId="grassTexture"
                    side={ DoubleSide }
                >
                    <textureResource
                        resourceId="grassImage"
                    />
                </meshPhongMaterial>
                <geometry
                    resourceId="robotGeometry"
                    faces={ faces }
                    vertices={ vertices }
                    faceVertexUvs={ faceVertexUvs }
                />
            </resources>
            <scene>
                <perspectiveCamera
                    name="camera"
                    fov={ 75 }
                    aspect={ width / height }
                    near={ 0.1 }
                    far={ 1000 }
                    position={ cameraPosition }
                    lookAt={ lookAt }
                />
                <ambientLight
                    color={ 0xdddddd }
                />
				{ this.state.mapBlocks }
				<Player
					position={this.state.playerPosition}
					rotation={this.state.playerRotation}
				/>
            </scene>
        </React3>;
		// console.log(ans);
		return ans;
    }

}