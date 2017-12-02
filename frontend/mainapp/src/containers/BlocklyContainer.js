import React, { Component } from 'react';
import scriptLoader from 'react-async-script-loader';
import PropTypes from 'prop-types';
class BlocklyContainer extends Component {
    constructor(props) {
        super(props);
        this.workspace = null;
        this._blocklyArea = null;
        this._blocklyDiv = null;
        this.mounted = false;
        this.initialized = false;
        this.isScriptLoadSucceed = false;
        if(typeof(this.props.refCallback) !== 'undefined')
            this.props.refCallback(this);
    }

    clear() {
        this.workspace.clear();
    }

    getCode = () => {
        return window.Blockly.JavaScript.workspaceToCode(this.workspace);
    }

    getNBlocks = () => {
        return this.workspace.getAllBlocks().length;
    }

    getXmlText() {
        return window.Blockly.Xml.domToText(window.Blockly.Xml.workspaceToDom(this.workspace));
    }

    highlightBlock = (id) => {
        this.workspace.highlightBlock(id);
    }

    loadXmlText = (xmlText) => {
        this.workspace.clear();
        window.Blockly.Xml.domToWorkspace(this.workspace, window.Blockly.Xml.textToDom(xmlText));
    }

    setReadOnly = (readOnly) => {
        this.workspace.options.readOnly = readOnly;
        if (readOnly) {
            this.workspace.options.maxBlocks = 0;
        } else {
            this.workspace.options.maxBlocks = this.props.maxBlocks ? this.props.maxBlocks : 99999;
        }
        if (typeof(this.workspace.toolbox_) !== 'undefined') {
            this.workspace.toolbox_.flyout_.hide(); // This solution is found in the source code....
        }
    }

    componentWillReceiveProps ({ isScriptLoaded, isScriptLoadSucceed, ...newProps }) {
        if (isScriptLoaded && !this.props.isScriptLoaded) { // load finished 
          if (isScriptLoadSucceed) {
            this.isScriptLoadSucceed = true;
            this.init();
          }
          else this.props.onError()
        }
        if (this.workspace != null && newProps !== this.props) {
            // TODO this.props.toolboxXml
            this.update(newProps, this.props);
        }
    }

    resize = (h) => {
        if (this.height === h)
        {
            return;
        }
        this.height = h;
        this._blocklyDiv.style.height = h + 'px';
        if (this.workspace) {
            window.Blockly.svgResize(this.workspace);
        }
    }
    
    init()
    {
        if (this.mounted && this.isScriptLoadSucceed && !this.initialized) {
            this.initialized = true;
            const Blockly = window.Blockly;
            Blockly.JavaScript.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
            Blockly.JavaScript.addReservedWords('highlightBlock');
            this.workspace = Blockly.inject(this._blocklyDiv,
                {toolbox: this.props.toolboxXml});
            this.resize(600);
            this.update(this.props, {});
            if(typeof(this.props.onLoaded) !== 'undefined')
                this.props.onLoaded();
        }
    }

    update = (newProps, prevProps) => {
        if (newProps.toolboxXml !== prevProps.toolboxXml) {
            this.workspace.updateToolbox(newProps.toolboxXml);
        }
        if (newProps.defaultBlocks !== prevProps.defaultBlocks) {
            this.loadXmlText(newProps.defaultBlocks);
        }
        this.setReadOnly(newProps.readOnly);
        window.Blockly.svgResize(this.workspace);
    }
    render ()
    {
        return (
        <div ref={el => this._blocklyArea = el} className="blocklyArea" lang="zh-hans" style={{height: "100%"}}>
            <div id="blocklyDiv" ref={el => this._blocklyDiv = el}></div>
        </div>
        );
    }
    loadScript(str) {
        const script = document.createElement("script");
        script.src = str;
        script.async = false;
        document.body.appendChild(script);
    }
    componentDidMount() {
        this.mounted = true;
        this.init();
    }
}

BlocklyContainer.propTypes = {
    // blocklyHeight: PropTypes.number,
    readOnly: PropTypes.bool.isRequired,
    onError: PropTypes.func.isRequired,
    defaultBlocks: PropTypes.string,
    toolboxXml: PropTypes.string,
};

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