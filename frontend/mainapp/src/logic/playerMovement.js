import { Vector3, Euler, } from 'three';

const positionScale = 0.5;
const positionSpeed = 0.001;
const positionOffset = 0.2;

const rotationSpeed = 0.002;
const rotationScale = 0.03;

/**
 * We can manage our game state in a series of small, easy to reason about
 * functions
 **/
export default function playerMovement( oldState, time ) {

    let mixer = oldState.mixer;
    const clock = oldState.clock;
    mixer.update(clock.getDelta() / 2.0);
    


    // Merge the old state with the updated properties
    return {
        ...oldState,
        // playerPosition: new Vector3( 0, 0, positionScale * Math.sin( time * positionSpeed ) + positionOffset ),
        // playerRotation: new Euler( 0, 0, rotationScale * Math.sin( time * rotationSpeed ) ),
        mixer: mixer,
        clock: clock,
    };

}
