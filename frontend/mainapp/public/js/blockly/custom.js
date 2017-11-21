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
	return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['game_get_pos_x'] = {
	init: function() {
		this.appendValueInput("ARG")
			.setCheck("Number")
			.appendField("GetPosX");
		this.setOutput(true, null);
		this.setColour(230);
		this.setTooltip("");
		this.setHelpUrl("");
	}
};
Blockly.JavaScript['game_get_pos_x'] = function(block) {
	var arg = Blockly.JavaScript.valueToCode(block, 'ARG', Blockly.JavaScript.ORDER_NONE) || 0;
	var code = `gameGetPosX(${arg})`;
	return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['game_get_pos_y'] = {
	init: function() {
		this.appendValueInput("ARG")
			.setCheck("Number")
			.appendField("GetPosY");
		this.setOutput(true, null);
		this.setColour(230);
		this.setTooltip("");
		this.setHelpUrl("");
	}
};
Blockly.JavaScript['game_get_pos_y'] = function(block) {
	var arg = Blockly.JavaScript.valueToCode(block, 'ARG', Blockly.JavaScript.ORDER_NONE) || 0;
	var code = `gameGetPosY(${arg})`;
	return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['game_get_dir'] = {
	init: function() {
		this.appendValueInput("ARG")
			.setCheck("Number")
			.appendField("GetDir");
		this.setOutput(true, null);
		this.setColour(230);
		this.setTooltip("");
		this.setHelpUrl("");
	}
};
Blockly.JavaScript['game_get_dir'] = function(block) {
	var arg = Blockly.JavaScript.valueToCode(block, 'ARG', Blockly.JavaScript.ORDER_NONE) || 0;
	var code = `gameGetDir(${arg})`;
	return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['game_get_hp'] = {
	init: function() {
		this.appendValueInput("ARG")
			.setCheck("Number")
			.appendField("GetHp");
		this.setOutput(true, null);
		this.setColour(230);
		this.setTooltip("");
		this.setHelpUrl("");
	}
};
Blockly.JavaScript['game_get_hp'] = function(block) {
	var arg = Blockly.JavaScript.valueToCode(block, 'ARG', Blockly.JavaScript.ORDER_NONE) || 0;
	var code = `gameGetHp(${arg})`;
	return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['game_get_attack'] = {
	init: function() {
		this.appendValueInput("ARG")
			.setCheck("Number")
			.appendField("GetAttack");
		this.setOutput(true, null);
		this.setColour(230);
		this.setTooltip("");
		this.setHelpUrl("");
	}
};
Blockly.JavaScript['game_get_attack'] = function(block) {
	var arg = Blockly.JavaScript.valueToCode(block, 'ARG', Blockly.JavaScript.ORDER_NONE) || 0;
	var code = `gameGetAttack(${arg})`;
	return [code, Blockly.JavaScript.ORDER_NONE];
};
