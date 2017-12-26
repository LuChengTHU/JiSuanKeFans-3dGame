/**
 * We can manage our game state in a series of small, easy to reason about
 * functions
 **/
export default function playerMovement( oldState/*, time*/ ) {

    const state = { ...oldState };
    if(window.animationShouldStop)
    {
        state.playerAnimateForward = false;
        state.playerAnimateForwarding = false;
        state.playerAnimateCW = false;
        state.playerAnimateCCW = false;
        state.playerAnimateTurning = false;
        state.playerAnimateAttacking = false;
        for(let i = 0; i < state.monsters.length; i++)
        {
            state.monsters[i].animateForward = false;
            state.monsters[i].animateForwarding = false;
            state.monsters[i].animateCW = false;
            state.monsters[i].animateCCW = false;
            state.monsters[i].animateTurning = false;
            state.monsters[i].animateAttacking = false;
        }
        window.animationShouldStop = false;
        return state;
    }
    let animationCount = 0;
    // Player Animate Forward
    if(state.playerAnimateForward)
    {
        state.playerAnimateForwardStart = state.playerPosition.clone();
        const tmp = state.playerPosition.clone();
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
        state.playerAnimateTurnStart = state.playerRotation.clone();
        if(state.playerAnimateCW)
            state.playerAnimateTurnDiff = -Math.PI / 2;
        else
            state.playerAnimateTurnDiff = Math.PI / 2;
        const tmp = state.playerRotation.clone();
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
            const tmp = state.playerAnimateTurnStart.clone();
            tmp.y += state.playerAnimateTurnDiff * ++state.playerAnimateTurnCurrent / state.playerAnimateTurnTotal;
            state.playerRotation = tmp;
        }
    }
    if(state.playerAnimateTurning)
        ++animationCount;


    if(state.playerAnimateAttacking) {
        ++animationCount;
    }

    // Monster Animate Forward
    for(let i = 0; i < state.monsters.length; i++)
    {
        if(state.monsters[i].animateForward)
        {
            state.monsters[i].animateForwardStart = state.monsters[i].position.clone();
            const tmp = state.monsters[i].position.clone();
            tmp.add(state.monsters[i].direction);
            state.monsters[i].animateForwardStop = tmp;
            state.monsters[i].animateForwardCurrent = 0;
            state.monsters[i].animateForwardTotal = 20;
            state.monsters[i].animateForwarding = true;
            
            state.monsters[i].animateForward = false;
        }
        if(state.monsters[i].animateForwarding)
        {
            if(state.monsters[i].animateForwardCurrent >= state.monsters[i].animateForwardTotal)
            {
                state.monsters[i].animateForwarding = false;
                state.monsters[i].position = state.monsters[i].animateForwardStop;
            }
            else
                state.monsters[i].position = state.monsters[i].direction.clone().multiplyScalar(++state.monsters[i].animateForwardCurrent / state.monsters[i].animateForwardTotal).add(state.monsters[i].animateForwardStart);
        }
        if(state.monsters[i].animateForwarding)
            ++animationCount;
    }
    // Monster Animate CW or CCW
    for(let i = 0; i < state.monsters.length; i++)
    {
        if(state.monsters[i].animateCW || state.monsters[i].animateCCW)
        {
            state.monsters[i].animateTurnStart = state.monsters[i].rotation.clone();
            if(state.monsters[i].animateCW)
                state.monsters[i].animateTurnDiff = -Math.PI / 2;
            else
                state.monsters[i].animateTurnDiff = Math.PI / 2;
            const tmp = state.monsters[i].rotation.clone();
            tmp.y += state.monsters[i].animateTurnDiff;
            state.monsters[i].animateTurnStop = tmp;
            state.monsters[i].animateTurnCurrent = 0;
            state.monsters[i].animateTurnTotal = 20;
            state.monsters[i].animateTurning = true;
            
            state.monsters[i].animateCW = false;
            state.monsters[i].animateCCW = false;
        }
        if(state.monsters[i].animateTurning)
        {
            if(state.monsters[i].animateTurnCurrent >= state.monsters[i].animateTurnTotal)
            {
                state.monsters[i].animateTurning = false;
                state.monsters[i].rotation = state.monsters[i].animateTurnStop;
            }
            else
            {
                const tmp = state.monsters[i].animateTurnStart.clone();
                tmp.y += state.monsters[i].animateTurnDiff * ++state.monsters[i].animateTurnCurrent / state.monsters[i].animateTurnTotal;
                state.monsters[i].rotation = tmp;
            }
        }
        if(state.monsters[i].animateTurning)
            ++animationCount;
    }

    window.blocklyShouldRun = (animationCount === 0);


    const delta = state.clock.getDelta();
    state.mixer.update(delta);
    // for(let i = 0; i < state.monsters.length; i++) {
    //     state.monsters[i].mixer.update(delta);
    // }


    return state;

}
