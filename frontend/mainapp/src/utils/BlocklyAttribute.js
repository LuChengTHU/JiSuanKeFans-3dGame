
export function getToolboxXml(map) {
    //map maybe undefined
    return `<xml id="toolbox" style="display: none">
        <category name="Game">
                    <block type="game_move"></block>
                    <block type="game_turn"></block>
                    <block type="game_attack"></block>
                    <block type="game_lookahead_name"></block>
                    <block type="game_get_pos_x"></block>
                    <block type="game_get_pos_y"></block>
                    <block type="game_get_dir"></block>
                    <block type="game_get_attack"></block>
                    <block type="game_get_hp"></block>
        </category>
        <category name="Logic">
        <category name="If">
            <block type="controls_if"></block>
            <block type="controls_if">
            <mutation else="1"></mutation>
            </block>
            <block type="controls_if">
            <mutation elseif="1" else="1"></mutation>
            </block>
        </category>
        <category name="Boolean">
            <block type="logic_compare"></block>
            <block type="logic_operation"></block>
            <block type="logic_negate"></block>
            <block type="logic_boolean"></block>
            <block type="logic_null"></block>
            <block type="logic_ternary"></block>
        </category>
        </category>
        <category name="Loops">
        <block type="controls_repeat_ext">
            <value name="TIMES">
            <block type="math_number">
                <field name="NUM">10</field>
            </block>
            </value>
        </block>
        <block type="controls_whileUntil"></block>
        <block type="controls_for">
            <field name="VAR">i</field>
            <value name="FROM">
            <block type="math_number">
                <field name="NUM">1</field>
            </block>
            </value>
            <value name="TO">
            <block type="math_number">
                <field name="NUM">10</field>
            </block>
            </value>
            <value name="BY">
            <block type="math_number">
                <field name="NUM">1</field>
            </block>
            </value>
        </block>
        <block type="controls_forEach"></block>
        <block type="controls_flow_statements"></block>
        </category>
        <category name="Math">
        <block type="math_number"></block>
        <block type="math_arithmetic"></block>
        <block type="math_single"></block>
        <block type="math_trig"></block>
        <block type="math_constant"></block>
        <block type="math_number_property"></block>
        <block type="math_round"></block>
        <block type="math_on_list"></block>
        <block type="math_modulo"></block>
        <block type="math_constrain">
            <value name="LOW">
            <block type="math_number">
                <field name="NUM">1</field>
            </block>
            </value>
            <value name="HIGH">
            <block type="math_number">
                <field name="NUM">100</field>
            </block>
            </value>
        </block>
        <block type="math_random_int">
            <value name="FROM">
            <block type="math_number">
                <field name="NUM">1</field>
            </block>
            </value>
            <value name="TO">
            <block type="math_number">
                <field name="NUM">100</field>
            </block>
            </value>
        </block>
        <block type="math_random_float"></block>
        </category>
        <category name="Lists">
        <block type="lists_create_empty"></block>
        <block type="lists_create_with"></block>
        <block type="lists_repeat">
            <value name="NUM">
            <block type="math_number">
                <field name="NUM">5</field>
            </block>
            </value>
        </block>
        <block type="lists_length"></block>
        <block type="lists_isEmpty"></block>
        <block type="lists_indexOf"></block>
        <block type="lists_getIndex"></block>
        <block type="lists_setIndex"></block>
        </category>
        <category name="Variables" custom="VARIABLE"></category>
        <category name="Functions" custom="PROCEDURE"></category>
        <sep></sep>
        <category name="Library" expanded="true">
        <category name="Randomize">
            <block type="procedures_defnoreturn">
            <mutation>
                <arg name="list"></arg>
            </mutation>
            <field name="NAME">randomize</field>
            <statement name="STACK">
                <block type="controls_for" inline="true">
                <field name="VAR">x</field>
                <value name="FROM">
                    <block type="math_number">
                    <field name="NUM">1</field>
                    </block>
                </value>
                <value name="TO">
                    <block type="lists_length" inline="false">
                    <value name="VALUE">
                        <block type="variables_get">
                        <field name="VAR">list</field>
                        </block>
                    </value>
                    </block>
                </value>
                <value name="BY">
                    <block type="math_number">
                    <field name="NUM">1</field>
                    </block>
                </value>
                <statement name="DO">
                    <block type="variables_set" inline="false">
                    <field name="VAR">y</field>
                    <value name="VALUE">
                        <block type="math_random_int" inline="true">
                        <value name="FROM">
                            <block type="math_number">
                            <field name="NUM">1</field>
                            </block>
                        </value>
                        <value name="TO">
                            <block type="lists_length" inline="false">
                            <value name="VALUE">
                                <block type="variables_get">
                                <field name="VAR">list</field>
                                </block>
                            </value>
                            </block>
                        </value>
                        </block>
                    </value>
                    <next>
                        <block type="variables_set" inline="false">
                        <field name="VAR">temp</field>
                        <value name="VALUE">
                            <block type="lists_getIndex" inline="true">
                            <mutation statement="false" at="true"></mutation>
                            <field name="MODE">GET</field>
                            <field name="WHERE">FROM_START</field>
                            <value name="AT">
                                <block type="variables_get">
                                <field name="VAR">y</field>
                                </block>
                            </value>
                            <value name="VALUE">
                                <block type="variables_get">
                                <field name="VAR">list</field>
                                </block>
                            </value>
                            </block>
                        </value>
                        <next>
                            <block type="lists_setIndex" inline="false">
                            <value name="AT">
                                <block type="variables_get">
                                <field name="VAR">y</field>
                                </block>
                            </value>
                            <value name="LIST">
                                <block type="variables_get">
                                <field name="VAR">list</field>
                                </block>
                            </value>
                            <value name="TO">
                                <block type="lists_getIndex" inline="true">
                                <mutation statement="false" at="true"></mutation>
                                <field name="MODE">GET</field>
                                <field name="WHERE">FROM_START</field>
                                <value name="AT">
                                    <block type="variables_get">
                                    <field name="VAR">x</field>
                                    </block>
                                </value>
                                <value name="VALUE">
                                    <block type="variables_get">
                                    <field name="VAR">list</field>
                                    </block>
                                </value>
                                </block>
                            </value>
                            <next>
                                <block type="lists_setIndex" inline="false">
                                <value name="AT">
                                    <block type="variables_get">
                                    <field name="VAR">x</field>
                                    </block>
                                </value>
                                <value name="LIST">
                                    <block type="variables_get">
                                    <field name="VAR">list</field>
                                    </block>
                                </value>
                                <value name="TO">
                                    <block type="variables_get">
                                    <field name="VAR">temp</field>
                                    </block>
                                </value>
                                </block>
                            </next>
                            </block>
                        </next>
                        </block>
                    </next>
                    </block>
                </statement>
                </block>
            </statement>
            </block>
        </category>
        <category name="Jabberwocky">
            <block type="text_print"></block>
            <block type="text"></block>
        </category>
        </category>
    </xml>
    `;
}

export function getDefaultBlocks(map) {
    return `<xml xmlns="http://www.w3.org/1999/xhtml" id="workspaceBlocks" style="display: none">
    <variables></variables>
    <block type="controls_repeat_ext" id="XXW{mM|V)O4t}b%c\`k=Y" x="13" y="13">
        <value name="TIMES">
        <shadow type="math_number" id="t6[VMer(7eCVqRMEX2ez">
            <field name="NUM">2</field>
        </shadow>
        </value>
        <statement name="DO">
        <block type="game_move" id="+!cL)/7;TB9NG)vuHr+;"></block>
        </statement>
    </block>
    </xml>`;
}