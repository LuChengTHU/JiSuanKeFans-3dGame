import React, { Component, PropTypes, } from 'react';
import React3 from 'react-three-renderer';
import { Euler, Vector3, } from 'three';

const Player = ({ position, rotation }) => <group
    position={ position }
    rotation={ rotation }
>
    <mesh>
        <geometryResource
            resourceId="robotGeometry"
        />
        <materialResource
            resourceId="robotTexture"
        />
    </mesh>
</group>;

Player.propTypes = {
    position: PropTypes.instanceOf( Vector3 ).isRequired,
    rotation: PropTypes.instanceOf( Euler ).isRequired,
}

export default Player;