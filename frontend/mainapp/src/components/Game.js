import React, { Component, PropTypes, } from 'react';
import React3 from 'react-three-renderer';
import { Vector3, Euler, Geometry } from 'three';
import * as THREE from 'three';

import Player from './Player';

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
        knightMesh.position.set(0,0,0);
        knightMesh.rotation.set(0,0,0);
        this.sceneRef.add(knightMesh);
    }

    render() {

        const {
            width, height, cameraPosition, lookAt
        } = this.props;



        return <React3
            mainCamera="camera"
            width={ width }
            height={ height }
            antialias
        >
            <resources>
                {/*<texture*/}
                    {/*resourceId="robotImage"*/}
                    {/*url={ require('../assets/sitepoint-robot-texture.jpg') }*/}
                    {/*anisotropy={ 16 }*/}
                {/*/>*/}
                {/*<meshPhongMaterial*/}
                    {/*resourceId="robotTexture"*/}
                    {/*side={ THREE.DoubleSide }*/}
                {/*>*/}
                    {/*<textureResource*/}
                        {/*resourceId="robotImage"*/}
                    {/*/>*/}
                {/*</meshPhongMaterial>*/}

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

            </scene>
        </React3>;

    }

}