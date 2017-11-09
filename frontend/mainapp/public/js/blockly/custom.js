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
Blockly.JavaScript['game_move'] = function(block) {
	var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
	var code = 'gameMove();\n';
	return code;
};

Blockly.Blocks['game_turn'] = {
	init: function() {
		this.appendDummyInput()
			.appendField("Turn")
			.appendField(new Blockly.FieldDropdown([["Clockwise","GameCW"], ["CounterClockwise","GameCCW"]]), "Turn");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(230);
		this.setTooltip("");
		this.setHelpUrl("");
	}
};
Blockly.JavaScript['game_turn'] = function(block) {
	var dropdown_turn = block.getFieldValue('Turn');
	var code = `gameTurn(${dropdown_turn});\n`;
	return code;
};

Blockly.Blocks['game_attack'] = {
	init: function() {
		this.appendDummyInput()
			.appendField("Attack");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(230);
		this.setTooltip("");
		this.setHelpUrl("");
	}
};
Blockly.JavaScript['game_attack'] = function(block) {
	var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
	var code = 'gameAttack();\n';
	return code;
};

Blockly.Blocks['game_lookahead_name'] = {
	init: function() {
		this.appendDummyInput()
			.appendField("LookAhead");
		this.setOutput(true, null);
		this.setColour(230);
		this.setTooltip("");
		this.setHelpUrl("");
	}
};
Blockly.JavaScript['game_lookahead_name'] = function(block) {
	var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
	var code = 'gameLookAheadName()';
	return code;
};
