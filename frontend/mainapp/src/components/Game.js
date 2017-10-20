import React, { Component, PropTypes, } from 'react';
import React3 from 'react-three-renderer';
import { Vector3, Euler, Geometry, DoubleSide, } from 'three';
import * as THREE from 'three';

import Player from './Player';
import MapBlock from './MapBlock';


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

        this.state = {
			rotation: new THREE.Euler(),
			
			roting: true,
			mapBlocks: [],
			player: null
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
		
    }
	
	createMap(height, width)
	{
		var bs = [];
		for(var i = 0; i < height; ++i)
			for(var j = 0; j < width; ++j)
				bs.push(<MapBlock x={i} z={j}/>);
		this.setState({mapBlocks: bs});
	}
	
	createPlayer()
	{
		this.setState({player: <Player
					position={ new Vector3(0, 1, 0) }
					rotation={ new Euler() }
		/>});
	}
	
	// TODO: change its name to "onClick"
	addPlayer()
	{
		this.createMap(5, 3);
		this.createPlayer();
		console.log(this.state.mapBlocks);
	}

    render() {
        const {
            width, height, cameraPosition, geometry, lookAt, playerPosition,
            playerRotation
        } = this.props;

        const { faces, vertices, faceVertexUvs, } = geometry;

		// return <div> width={ width }, height={ height }
                    // lookAt={ lookAt.x } </div>
		return <React3
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
				{ this.state.player }
            </scene>
        </React3>;
    }

}