import React, { Component, PropTypes, } from 'react';
import React3 from 'react-three-renderer';
import { Euler, Vector3, } from 'three';

const MapBlock = ({ x, z }) => <group
    position={ new Vector3(x, -0.05, z) }
>
    <mesh>
		  <boxGeometry
			width={1}
			height={0.1}
			depth={1}
		  />
        <materialResource
            resourceId="grassTexture"
        />
    </mesh>
</group>;

MapBlock.propTypes = {
    x: PropTypes.number.isRequired,
    z: PropTypes.number.isRequired,
}

export default MapBlock;