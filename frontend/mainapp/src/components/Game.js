import React, { Component, PropTypes, } from 'react';
import React3 from 'react-three-renderer';
import { Vector3, Euler, Geometry, DoubleSide, } from 'three';
import * as THREE from 'three';

import Player from './Player';
import MapBlock from './MapBlock';
import Monster from './Monster';


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
    }

    render() {
        const {
            width, height, cameraPosition, geometry, lookAt, playerPosition,
            playerRotation,
			mapBlocks,
			monsters
        } = this.props;

        const { faces, vertices, faceVertexUvs, } = geometry;
		
		let ms = [];
		for(let i = 0; i < monsters.length; ++i)
		{
			ms.push(<Monster position={monsters[i].position} rotation={monsters[i].rotation}/>);
		}

		// return <div> width={ width }, height={ height }
                    // lookAt={ lookAt.x } </div>
		let ans = <React3
            mainCamera="camera"
            width={ width }
            height={ height }
            antialias
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
				{ mapBlocks }
				{ ms }
				<Player
					position={playerPosition}
					rotation={playerRotation}
				/>
            </scene>
        </React3>;
		// console.log(ans);
		return ans;
    }

}