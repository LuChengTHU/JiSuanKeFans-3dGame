import Game from '../logic/logic';
export default class EnhancedInterpreter {
    constructor(runtimeLibrary, blocklyContainer, stateListenerCallback) {
        this.blocklyContainer = blocklyContainer;
        this.blockStarting = null;
        this.code = null;
        this.continuous = null;
        this.stepsAllowed = null; // Initialized by loadProgram()
        this.myInterpreter = null; // Initialized by loadProgram()
        // this._statementDelay = statementDelay;
        // this._parallelOperationInProgress = false;
        // this._pendingState = null;
        this.stateListenerCallback = stateListenerCallback;
        this.Game = runtimeLibrary;
    }
    initFunc = (interpreter, scope) => {
        const Game = this.Game;
        interpreter.setProperty(scope, 'GameCW', Game.GameCW);
        interpreter.setProperty(scope, 'GameCCW', Game.GameCCW);
        interpreter.setProperty(scope, "gameTurn",
            interpreter.createNativeFunction((x) => {
                return Game.gameTurn(x);     
            }));
        interpreter.setProperty(scope, "gameMove",
            interpreter.createNativeFunction(() => {
                return Game.gameMove();     
            }));
        interpreter.setProperty(scope, "gameInit",
            interpreter.createNativeFunction(() => {
                return Game.gameInit();     
            }));
        interpreter.setProperty(scope, "gameAttack",
            interpreter.createNativeFunction(() => {
                return Game.gameAttack();     
            }));
        interpreter.setProperty(scope, "gameLookAheadName",
            interpreter.createNativeFunction(() => {
                return Game.gameLookAheadName();     
            }));
        interpreter.setProperty(scope, "gameGetPosX",
            interpreter.createNativeFunction((x) => {
                return Game.gameGetPosX(x);     
            }));
        interpreter.setProperty(scope, "gameGetPosY",
            interpreter.createNativeFunction((x) => {
                return Game.gameGetPosY(x);     
            }));
        interpreter.setProperty(scope, "gameGetDir",
            interpreter.createNativeFunction((x) => {
                return Game.gameGetDir(x);     
            }));
        interpreter.setProperty(scope, "gameGetAttack",
            interpreter.createNativeFunction((x) => {
                return Game.gameGetAttack(x);     
            }));
        interpreter.setProperty(scope, "gameGetHp",
            interpreter.createNativeFunction((x) => {
                return Game.gameGetHp(x);     
            }));
        let alertWrapper = function(text) {
            text = text ? text.toString() : '';
            return alert(text);
        };
        interpreter.setProperty(scope, 'alert',
            interpreter.createNativeFunction(alertWrapper));

        let promptWrapper = function(text) {
            text = text ? text.toString() : '';
            return prompt(text);
        };
        interpreter.setProperty(scope, 'prompt',
            interpreter.createNativeFunction(promptWrapper));

        let consoleObj = interpreter.createObject(interpreter.OBJECT);
        interpreter.setProperty(scope, 'console', consoleObj);
        let logWrapper = function(text) {
            text = text ? text.toString() : '';
            return console.log(text);
        };
        interpreter.setProperty(consoleObj, 'log',
            interpreter.createNativeFunction(logWrapper));

        interpreter.setProperty(scope, 'highlightBlock', 
            interpreter.createNativeFunction((id) => this.highlightBlock(id))
        );
    };

    highlightBlock = (id) => {
        this.blockStarting = true;
        id = id ? id.toString() : '';
        this.blocklyContainer.highlightBlock(id);
    }

    loadProgram = (code) => {
        this.code = code;
        this.myInterpreter = new window.Interpreter(code, this.initFunc);
        this.stepsAllowed = 10000;
        window.blocklyCallback = this.step;
        window.blocklyShouldRun = true;
    }
    step = () => {
        console.log('calling ' + this.stepsAllowed);
        if(this.stepsAllowed <= 0)
		{
            window.blocklyCallback = () => {};
            window.blocklyShouldRun = false;
            throw new Error('GameFailedLoop');
		}
        this.stepsAllowed--;
        if(!this.myInterpreter.step())
        {
            window.blocklyCallback = () => {};
            window.blocklyShouldRun = false;
            throw new Error('GameFailed');
        }
    }

}