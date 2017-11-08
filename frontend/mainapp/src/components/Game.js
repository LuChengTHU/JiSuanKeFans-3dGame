import React, { Component, PropTypes, } from 'react';
import React3 from 'react-three-renderer';

import { Vector3, Euler, Geometry, DoubleSide, } from 'three';

import * as THREE from 'three';

import Player from './Player';
import Bar from './Bar';
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
        playerPosition: PropTypes.instanceOf( Vector3 ).isRequired,
        playerRotation: PropTypes.instanceOf( Euler ).isRequired,
    };

    componentDidMount() {
        const {knightMesh, playerPosition, playerRotation} = this.props;
        let group = new THREE.Group();
        knightMesh.position.x = playerPosition.x;
        knightMesh.position.y = playerPosition.y;
        knightMesh.position.z = playerPosition.z;
        //knightMesh.rotation.set(0,0,0);
        knightMesh.name = "knight";
        this.sceneRef.add(knightMesh);

        this.setState({readyKnight:true})
    }

    constructor(props, context) {
        super(props, context);
        this.state = {
            readyKnight:false
        };
    }

    render() {
        const {
            width, height, cameraPosition, lookAt, mapBlocks, playerPosition, playerRotation, monsters, playerHp, playerMaxHp, targetPosition
        } = this.props;

        if(this.state.readyKnight) {
            this.sceneRef.getObjectByName("knight").position.set(playerPosition.x, playerPosition.y, playerPosition.z);
            this.sceneRef.getObjectByName("knight").rotation.set(playerRotation.x, playerRotation.y, playerRotation.z);
        }

		// return <div> width={ width }, height={ height }
                    // lookAt={ lookAt.x } </div>

		
		let ms = [];
		let mbar = [];
		for(let i = 0; i < monsters.length; ++i)
			if(monsters[i].hp <= 0)
			{
				ms.push(null); mbar.push(null);
			}
			else
			{
				ms.push(<Monster position={monsters[i].position} rotation={monsters[i].rotation}/>);
				mbar.push(<Bar position={monsters[i].position} curValue={monsters[i].hp} maxValue={monsters[i].maxHp}/>);
			}
		
		let target = null;
		if(targetPosition)
		{
			target = <group
				position={ targetPosition }
			>
				<mesh>
					  <boxGeometry
						width={1}
						height={0.1}
						depth={1}
					  />
					<meshLambertMaterial
						color={0xffff00}
					/>
				</mesh>
			</group>;
		}

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
            </resources>
            <scene ref={val => { this.sceneRef = val; }}>
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
				<Bar
					position = {playerPosition}
					curValue = {playerHp}
					maxValue = {playerMaxHp}
				/>
				{ ms }
				{mbar}
				{target}
            </scene>
        </React3>;
		return ans;
    }

}