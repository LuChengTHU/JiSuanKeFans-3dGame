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
        {toolbox: document.getElementById('toolbox')});
        let defaultBlocks = document.getElementById('workspaceBlocks');
        Blockly.Xml.domToWorkspace(defaultBlocks, this.workspace);
        this.workspace.addChangeListener((e) => this.myUpdateFunction(e));
        function executeBlockCode() {
            let code = Blockly.JavaScript.workspaceToCode(this.workspace);
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
            while (myInterpreter.step() && stepsAllowed) {
            stepsAllowed--;
            }
            if (!stepsAllowed) {
            throw EvalError('Infinite loop.');
            }
        }

        document.getElementById('playButton').addEventListener('click', executeBlockCode);
    }
    render ()
    {
        return (
        <div ref={el => this.el = el} className="blockly">
            <xml id="toolbox" style={{display: "none"}}>
                <block type="game_move"></block>
                <block type="game_turn"></block>
                <block type="controls_if"></block>
                <block type="controls_repeat_ext"></block>
                <block type="logic_compare"></block>
                <block type="math_number"></block>
                <block type="math_arithmetic"></block>
                <block type="text"></block>
                <block type="text_print"></block>
            </xml>
            <xml xmlns="http://www.w3.org/1999/xhtml" id="workspaceBlocks" style={{display:"none"}}>
            <variables></variables>
            <block type="controls_repeat_ext" id="XXW{mM|V)O4t}b%c`k=Y" x="13" y="13">
                <value name="TIMES">
                <shadow type="math_number" id="t6[VMer(7eCVqRMEX2ez">
                    <field name="NUM">2</field>
                </shadow>
                </value>
                <statement name="DO">
                <block type="game_move" id="+!cL)/7;TB9NG)vuHr+;"></block>
                </statement>
            </block>
            </xml>

            <div className="row">
                <div id="blocklyDiv" style={{height: "480px", width: "600px"}}></div>
                <div id="codeDiv" className="main output-panel">
                    <hr className="POps"/>
                    <pre></pre>
                </div>
                <div className="col-xs-12">
                    <hr className="POps"/>
                <button type="button" id="playButton" className="btn-success"/>Play
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