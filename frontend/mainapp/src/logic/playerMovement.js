import { Vector3, Euler, } from 'three';

// const positionScale = 0.5;
// const positionSpeed = 0.001;
// const positionOffset = 0.2;

// const rotationSpeed = 0.002;
// const rotationScale = 0.03;

/**
 * We can manage our game state in a series of small, easy to reason about
 * functions
 **/
export default function playerMovement( oldState, time ) {

	let state = { ...oldState };
	let animationCount = 0;
	// Player Animate Forward
	if(state.playerAnimateForward)
	{
		state.playerAnimateForwardStart = state.playerPosition.clone();
		let tmp = state.playerPosition.clone();
		tmp.add(state.playerDirection);
		state.playerAnimateForwardStop = tmp;
		state.playerAnimateForwardCurrent = 0;
		state.playerAnimateForwardTotal = 20;
		state.playerAnimateForwarding = true;
		
		state.playerAnimateForward = false;
	}
	if(state.playerAnimateForwarding)
	{
		if(state.playerAnimateForwardCurrent >= state.playerAnimateForwardTotal)
		{
			state.playerAnimateForwarding = false;
			state.playerPosition = state.playerAnimateForwardStop;
		}
		else
			state.playerPosition = state.playerDirection.clone().multiplyScalar(++state.playerAnimateForwardCurrent / state.playerAnimateForwardTotal).add(state.playerAnimateForwardStart);
	}
	if(state.playerAnimateForwarding)
		++animationCount;
	// Player Animate CW or CCW
	if(state.playerAnimateCW || state.playerAnimateCCW)
	{
		console.assert(!state.playerAnimateCW || !state.playerAnimateCCW);
		console.log(state.playerRotation);
		state.playerAnimateTurnStart = state.playerRotation.clone();
		if(state.playerAnimateCW)
			state.playerAnimateTurnDiff = -Math.PI / 2;
		else
			state.playerAnimateTurnDiff = Math.PI / 2;
		let tmp = state.playerRotation.clone();
		tmp.y += state.playerAnimateTurnDiff;
		state.playerAnimateTurnStop = tmp;
		state.playerAnimateTurnCurrent = 0;
		state.playerAnimateTurnTotal = 20;
		state.playerAnimateTurning = true;
		
		state.playerAnimateCW = false;
		state.playerAnimateCCW = false;
	}
	if(state.playerAnimateTurning)
	{
		if(state.playerAnimateTurnCurrent >= state.playerAnimateTurnTotal)
		{
			state.playerAnimateTurning = false;
			state.playerRotation = state.playerAnimateTurnStop;
		}
		else
		{
			let tmp = state.playerAnimateTurnStart.clone();
			tmp.y += state.playerAnimateTurnDiff * ++state.playerAnimateTurnCurrent / state.playerAnimateTurnTotal;
			state.playerRotation = tmp;
		}
	}
	if(state.playerAnimateTurning)
		++animationCount;
	// console.log(animationCount);
	window.blocklyShouldRun = (animationCount === 0);


    state.attackLength += 1;
	state.mixer.update(state.clock.getDelta());
    // let action = state.mixer.existingAction( state.knightMesh.geometry.animations[ 0 ] );
    // action._update(state.clock.getDelta())

	return state;

}
