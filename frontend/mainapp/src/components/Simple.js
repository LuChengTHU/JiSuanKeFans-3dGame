import React from 'react';
import React3 from 'react-three-renderer';
import * as THREE from 'three';
import ReactDOM from 'react-dom';

export default class Simple extends React.Component {
  constructor(props, context) {
    super(props, context);
	window.simple = this;

    // construct the position vector here, because if we use 'new' within render,
    // React will think that things have changed when they have not.
    this.cameraPosition = new THREE.Vector3(0, 0, 5);

    this.state = {
      cubeRotation: new THREE.Euler(),
	  roting: true,
    };

    this._onAnimate = () => {
      // we will get this callback every frame

      // pretend cubeRotation is immutable.
      // this helps with updates and pure rendering.
      // React will be sure that the rotation has now updated.
	  if(this.state.roting)
	  {
		  this.setState({
			cubeRotation: new THREE.Euler(
			  this.state.cubeRotation.x + 0.1,
			  this.state.cubeRotation.y + 0.2,
			  0
			),
		  });
	  }
    };
  }

  render() {
    const width = window.innerWidth; // canvas width
    const height = window.innerHeight; // canvas height
	this.i = 0;

    return (<React3
      mainCamera="camera" // this points to the perspectiveCamera which has the name set to "camera" below
      width={width}
      height={height}

      onAnimate={this._onAnimate}
    >
      <scene>
        <perspectiveCamera
          name="camera"
          fov={75}
          aspect={width / height}
          near={0.1}
          far={1000}

          position={this.cameraPosition}
        />
        <mesh
          rotation={this.state.cubeRotation}
        >
          <boxGeometry
            width={1}
            height={2}
            depth={1}
          />
          <meshBasicMaterial
            color={0x00ff00}
          />
        </mesh>
      </scene>
    </React3>);
  }
}