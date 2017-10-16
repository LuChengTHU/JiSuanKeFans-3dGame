'use strict';
var workspace = Blockly.inject('blocklyDiv',
{toolbox: document.getElementById('toolbox')});
var defaultBlocks = document.getElementById('workspaceBlocks');
Blockly.Xml.domToWorkspace(defaultBlocks, workspace);
function myUpdateFunction(event) {
var languageDropdown = document.getElementById('languageDropdown');
var languageSelection = languageDropdown.options[languageDropdown.selectedIndex].value;
var codeDiv = document.getElementById('codeDiv');
var codeHolder = document.createElement('pre');
codeHolder.className = 'prettyprint but-not-that-pretty';
var code = document.createTextNode(Blockly[languageSelection].workspaceToCode(workspace));
codeHolder.appendChild(code);
codeDiv.replaceChild(codeHolder, codeDiv.lastElementChild);
//PR.prettyPrint();
}
workspace.addChangeListener(myUpdateFunction);
function executeBlockCode() {
var code = Blockly.JavaScript.workspaceToCode(workspace);
    var initFunc = function(interpreter, scope) {
        interpreter.setProperty(scope, 'GameCW', Game.GameCW);
        interpreter.setProperty(scope, 'GameCCW', Game.GameCCW);
        interpreter.setProperty(scope, "gameTurn",
        interpreter.createNativeFunction((x) => {
            return Game.gameTurn(x);     
        })
        );
        interpreter.setProperty(scope, "gameMove",
        interpreter.createNativeFunction(() => {
            return Game.gameMove();     
        })
        );
        
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
    var myInterpreter = new Interpreter(code, initFunc);
    var stepsAllowed = 10000;
    while (myInterpreter.step() && stepsAllowed) {
        stepsAllowed--;
    }
    if (!stepsAllowed) {
        throw EvalError('Infinite loop.');
    }
}
document.getElementById('playButton').addEventListener('click', executeBlockCode);