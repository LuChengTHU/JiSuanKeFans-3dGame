import React, { Component, PropTypes, } from 'react';
import React3 from 'react-three-renderer';
import { Euler, Vector3 } from 'three';

export default class Player extends Component {

    constructor(props, context) {
        super(props, context);
		// window.player = this;
		// this.state = {
			// position : props.position,
			// rotation : props.rotation,
			// direction : new Vector3(1, 0, 0),
		// };
		
		// this.turnCW = this.turnCW.bind(this);
		// this.turnCCW = this.turnCCW.bind(this);
		// this.moveForward = this.moveForward.bind(this);
		
		// this.version = -1;
    }
	
	// componentWillReceiveProps(props)
	// {
		// if(props.version != this.version)
		// {
			// this.state = {
				// position : props.position,
				// rotation : props.rotation,
				// direction : new Vector3(1, 0, 0),
			// };
			// this.version = props.version;
		// }
	// }
	
	// turnCW()
	// {
	// }
	// turnCCW()
	// {
	// }
	// moveForward()
	// {
		// console.log(this.state.position);
		// console.log(this.state.direction);
		// this.setState({position: this.state.position.add(this.state.direction)});
		// console.log(this.state.position);
		// console.log(this.group);
		// window.ui.forceUpdate();
	// }

    render() {
        const {
            position, rotation
        } = this.props;
		
		this.group = <group
			position={ position }
			rotation={ rotation }
		>
			<mesh>
				  <boxGeometry
					width={1}
					height={2}
					depth={1}
				  />
				<materialResource
					resourceId="robotTexture"
				/>
			</mesh>
		</group>;

        return this.group;

    }

}

Player.propTypes = {
    position: PropTypes.instanceOf( Vector3 ).isRequired,
    rotation: PropTypes.instanceOf( Euler ).isRequired,
}
