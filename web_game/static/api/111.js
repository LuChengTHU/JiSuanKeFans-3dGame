
Blockly.Blocks['game_move'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Move");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};
Blockly.Blocks['game_turn'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Turn")
        .appendField(new Blockly.FieldDropdown([["Clockwise","Game.GameCW"], ["CounterClockwise","Game.GameCCW"]]), "Turn");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['game_move'] = function(block) {
  var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'Game.gameMove();\n';
  // TODO: Change ORDER_NONE to the correct strength.
  return code;
};

Blockly.JavaScript['game_turn'] = function(block) {
  var dropdown_turn = block.getFieldValue('Turn');
  // TODO: Assemble JavaScript into code variable.
  var code = `Game.gameTurn(${dropdown_turn});\n`;
  return code;
};