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
            width, height, cameraPosition, lookAt, mapBlocks, playerPosition, playerRotation
        } = this.props;

        if(this.state.readyKnight) {
            this.sceneRef.getObjectByName("knight").position.set(playerPosition.x, playerPosition.y, playerPosition.z);
            this.sceneRef.getObjectByName("knight").rotation.set(playerRotation.x, playerRotation.y, playerRotation.z);
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
                {/*<texture*/}
                    {/*resourceId="robotImage"*/}
                    {/*url={ require( '../assets/sitepoint-robot-texture.jpg' ) }*/}
                    {/*anisotropy={ 16 }*/}
                {/*/>*/}
                {/*<meshPhongMaterial*/}
                    {/*resourceId="robotTexture"*/}
                    {/*side={ DoubleSide }*/}
                {/*>*/}
                    {/*<textureResource*/}
                        {/*resourceId="robotImage"*/}
                    {/*/>*/}
                {/*</meshPhongMaterial>*/}
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
                {/*<group ref={val => { this.playerGroupRef = val; }}>*/}
                    {/*position={playerPosition}*/}
                    {/*rotation={playerRotation}*/}
                {/*</group>*/}
            </scene>
        </React3>;
		return ans;
    }

}