import React, { Component, PropTypes, } from 'react';
import React3 from 'react-three-renderer';

import { Vector3, Euler, DoubleSide, } from 'three';

import Player from './Player';
import Bar from './Bar';
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

    render() {
        const {
            width, height, cameraPosition, lookAt, mapBlocks, playerPosition, playerRotation, monsters, playerHp,
            playerMaxHp, targetPosition, knightMesh
        } = this.props;

		const ms = [];
		const mbar = [];
		for(let i = 0; i < monsters.length; ++i)
			if(monsters[i].hp <= 0)
			{
				ms.push(null);
                mbar.push(null);
			}
			else
			{
				ms.push(<Monster position={monsters[i].position} rotation={monsters[i].rotation} monsterMesh={monsters[i].mesh}/>);
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

		return <React3
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
                <texture
                    resourceId="backgroundImage"
                    url={ require( '../assets/background.jpg' ) }
                    anisotropy={ 16 }
                />
                <meshPhongMaterial
                    resourceId="backgroundTexture"
                    side={ DoubleSide }
                >
                    <textureResource
                        resourceId="backgroundImage"
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
				<Player
                    position = {playerPosition}
                    rotation={playerRotation}
                    playerMesh = {knightMesh}
                />
				<group
					position={ new Vector3(0, -10, 0) }
                    rotation={ new Euler(-Math.PI / 12, 0, Math.PI / 12) }
				>
					<mesh>
						  <boxGeometry
							width={100}
							height={0.1}
							depth={100}
						  />
						<materialResource
							resourceId="backgroundTexture"
						/>
					</mesh>
				</group>
            </scene>
        </React3>;
    }

}