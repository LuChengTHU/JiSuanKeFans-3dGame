import React, { Component, PropTypes, } from 'react';
import { Euler, Vector3 } from 'three';

export default class Map extends Component {

    componentDidMount() {
        const {mapMesh,} = this.props;
        mapMesh.name = "map";
        this.groupRef.add(mapMesh);
    }

    render() {
        const {
            position, rotation
        } = this.props;

        this.group = <group ref={
            val => {
                this.groupRef = val;
            }
        }
                            position={ position }
                            rotation={ rotation }
        >

        </group>;

        return this.group;

    }

}

Map.propTypes = {
    position: PropTypes.instanceOf( Vector3 ).isRequired,
    rotation: PropTypes.instanceOf( Euler ).isRequired,
}
