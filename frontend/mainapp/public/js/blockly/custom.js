Blockly.Blocks['game_move'] = {
	init: function() {
		this.appendDummyInput()
			.appendField("前进");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(230);
		this.setTooltip("");
		this.setHelpUrl("");
	}
};
Blockly.JavaScript['game_move'] = function(/*block*/) {
	var code = 'gameMove();\n';
	return code;
};

Blockly.Blocks['game_turn'] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown([["顺时针","GameCW"], ["逆时针","GameCCW"]]), "Turn")
			.appendField("转弯");
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
			.appendField("攻击");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(230);
		this.setTooltip("");
		this.setHelpUrl("");
	}
};
Blockly.JavaScript['game_attack'] = function(/*block*/) {
	var code = 'gameAttack();\n';
	return code;
};

Blockly.Blocks['game_lookahead_name'] = {
	init: function() {
		this.appendDummyInput()
			.appendField("向前看");
		this.setOutput(true, null);
		this.setColour(230);
		this.setTooltip("");
		this.setHelpUrl("");
	}
};
Blockly.JavaScript['game_lookahead_name'] = function(/*block*/) {
	var code = 'gameLookAheadName()';
	return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['game_get_pos_x'] = {
	init: function() {
		this.appendValueInput("ARG")
			.setCheck("Number")
			.appendField("获取X坐标");
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
			.appendField("获取Y坐标");
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
			.appendField("获取方向");
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
			.appendField("获取生命值");
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
			.appendField("获取攻击力");
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
