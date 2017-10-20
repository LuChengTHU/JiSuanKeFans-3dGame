import React, { Component, PropTypes, } from 'react';
import React3 from 'react-three-renderer';
import { Euler, Vector3 } from 'three';

export default class Player extends Component {

    constructor(props, context) {
        super(props, context);
		this.state = {
			position : props.position,
			rotation : props.rotation,
			direction : new Vector3(1, 0, 0),
		};
		window.player = this;
		
		this.turnCW = this.turnCW.bind(this);
		this.turnCCW = this.turnCCW.bind(this);
		this.moveForward = this.moveForward.bind(this);
    }
	
	turnCW()
	{
		if(this.state.direction.x == 1)
			this.setState({direction: new Vector3(0, 0, 1)});
		else if(this.state.direction.z == 1)
			this.setState({direction: new Vector3(-1, 0, 0)});
		else if(this.state.direction.x == -1)
			this.setState({direction: new Vector3(0, 0, -1)});
		else
			this.setState({direction: new Vector3(1, 0, 0)});
	}
	turnCCW()
	{
		if(this.state.direction.x == 1)
			this.setState({direction: new Vector3(0, 0, -1)});
		else if(this.state.direction.z == -1)
			this.setState({direction: new Vector3(-1, 0, 0)});
		else if(this.state.direction.x == -1)
			this.setState({direction: new Vector3(0, 0, 1)});
		else
			this.setState({direction: new Vector3(1, 0, 0)});
	}
	moveForward()
	{
		console.log(this.state.position);
		console.log(this.state.direction);
		this.setState( (prevState, props) => ({position: prevState.position.add(prevState.direction)}) );
		console.log(this.state.position);
		console.log(this.group);
	}

    render() {
        const {
            position, rotation
        } = this.state;
		
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
