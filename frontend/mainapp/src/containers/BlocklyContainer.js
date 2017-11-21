import React, { Component } from 'react';
import scriptLoader from 'react-async-script-loader';
import Game from '../logic/logic';
class BlocklyContainer extends Component {
    constructor(props) {
        super(props);
        this.workspace = null;
        this.myUpdateFunction = this.myUpdateFunction.bind(this);
    }
    componentWillReceiveProps ({ isScriptLoaded, isScriptLoadSucceed }) {
        if (isScriptLoaded && !this.props.isScriptLoaded) { // load finished 
          if (isScriptLoadSucceed) {
            this.init()
          }
          else this.props.onError()
        }
      }
    
    init()
    {
        this.loadBlocklyJS();
    }
    
    myUpdateFunction(event) {
        let Blockly = window.Blockly;
        let Interpreter = window.Interpreter;
        var languageSelection = 'JavaScript';
        let codeDiv = document.getElementById('codeDiv');
        let codeHolder = document.createElement('pre');
        codeHolder.className = 'prettyprint but-not-that-pretty';
        let code = document.createTextNode(Blockly[languageSelection].workspaceToCode(this.workspace));
        codeHolder.appendChild(code);
        codeDiv.replaceChild(codeHolder, codeDiv.lastElementChild);
        //PR.prettyPrint();
    }

    loadBlocklyJS() {
        let Blockly = window.Blockly;
        let Interpreter = window.Interpreter;
        this.workspace = Blockly.inject('blocklyDiv',
            {toolbox: this.props.toolboxXml});
        Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(this.props.defaultBlocks), this.workspace);
        this.workspace.addChangeListener((e) => this.myUpdateFunction(e));
        function executeBlockCode() {
            let code = 'gameInit();\n' + Blockly.JavaScript.workspaceToCode(this.workspace);
            let initFunc = function(interpreter, scope) {
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
                var alertWrapper = function(text) {
                    text = text ? text.toString() : '';
                    return alert(text);
                };
                interpreter.setProperty(scope, 'alert',
                    interpreter.createNativeFunction(alertWrapper));

                var promptWrapper = function(text) {
                    text = text ? text.toString() : '';
                    return prompt(text);
                };
                interpreter.setProperty(scope, 'prompt',
                    interpreter.createNativeFunction(promptWrapper));

                var consoleObj = this.createObject(interpreter.OBJECT);
                this.setProperty(scope, 'console', consoleObj);
                var logWrapper = function(text) {
					text = text ? text.toString() : '';
					return console.log(text);
                };
                interpreter.setProperty(consoleObj, 'log',
                    interpreter.createNativeFunction(logWrapper));
            };

            let myInterpreter = new Interpreter(code, initFunc);
            let stepsAllowed = 10000;
			let stepCallback = () =>
			{
                console.log('calling ' + stepsAllowed);
                console.log(code);
				if(stepsAllowed <= 0)
					throw EvalError('Infinite loop.');
				stepsAllowed--;
				if(!myInterpreter.step())
				{
					window.blocklyCallback = () => {};
					window.blocklyShouldRun = false;
				}
            };
            window.testCallback = stepCallback;
			window.blocklyCallback = stepCallback;
			window.blocklyShouldRun = true;
        }

        document.getElementById('playButton').addEventListener('click', executeBlockCode);
    }
    render ()
    {
        return (
        <div ref={el => this.el = el} className="blockly">

            <div className="row">
                <div id="blocklyDiv" style={{height: "480px", width: "600px"}}></div>
                <div id="codeDiv" className="main output-panel">
                    <hr className="POps"/>
                    <pre></pre>
                </div>
                <div className="col-xs-12">
                    <hr className="POps"/>
                <button type="button" id="playButton" className="btn-success">Play</button>
                </div>
            </div>

        </div>
        );
    }
    loadScript(str) {
        const script = document.createElement("script");
        script.src = str;
        script.async = false;
        document.body.appendChild(script);
    }
}

export default scriptLoader(

    `${process.env.PUBLIC_URL}/js/blockly/blockly_compressed.js`,
    `${process.env.PUBLIC_URL}/js/blockly/blocks_compressed.js`,
    `${process.env.PUBLIC_URL}/js/blockly/en.js`,
    `${process.env.PUBLIC_URL}/js/blockly/javascript_compressed.js`,
    `${process.env.PUBLIC_URL}/js/blockly/custom.js`,
    `${process.env.PUBLIC_URL}/js/utils/acorn_interpreter.js`,
    // 'http://localhost:8000/static/api/js/blockly/blockly_compressed.js',
    // "http://localhost:8000/static/api/js/blockly/blocks_compressed.js",
    // "http://localhost:8000/static/api/js/blockly/en.js",
    // "http://localhost:8000/static/api/js/blockly/javascript_compressed.js",
    // "http://localhost:8000/static/api/js/blockly/custom.js",
    // "http://localhost:8000/static/api/js/utils/acorn_interpreter.js"
  )(BlocklyContainer);