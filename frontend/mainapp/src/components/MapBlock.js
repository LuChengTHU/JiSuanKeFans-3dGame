import React, { PropTypes, } from 'react';
import { Vector3, } from 'three';

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