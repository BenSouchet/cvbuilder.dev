export class BlockName {
    static Body = new BlockName("Body");
    static Head = new BlockName("Head");
    static Style = new BlockName("Style");

    constructor(name) {
        this.name = name;
    }
}

export class BlockErrors {
    list = [];
    wrapperElem;
    contentElem;

    constructor(wrapperElemId, contentElemId, retractCheckboxElemId, callbackretractBlock) {
        this.wrapperElem = document.getElementById(wrapperElemId);
        this.contentElem = document.getElementById(contentElemId);

        const retractCheckboxElem = document.getElementById(retractCheckboxElemId);
        retractCheckboxElem.addEventListener('change', callbackretractBlock);
    }
}

export class ErrorsController {
    head;
    body;
    css;
    length;
    domParser;
    _iconNumElem;
    _linkDisplayElem;
    _titleElem;
    _closeBtnElem;
    _showBlockErrorsCheckboxElem;

    constructor(callbackResizeBlocks) {
        this.length = 0;
        this.domParser = new DOMParser();

        this.head = new BlockErrors('wrapper-head-errors', 'head-errors-content', 'retract-head-errors', callbackResizeBlocks);
        this.body = new BlockErrors('wrapper-body-errors', 'body-errors-content', 'retract-body-errors', callbackResizeBlocks);
        this.css = new BlockErrors('wrapper-css-errors', 'css-errors-content', 'retract-css-errors', callbackResizeBlocks);

        this._titleElem = document.getElementById('block-errors-title');
        this._iconNumElem = document.getElementById('error-count');
        this._linkDisplayElem = document.getElementById('display-errors');
        this._callbackResizeBlocks = callbackResizeBlocks;

        this._closeBtnElem = document.getElementById('block-errors-close-btn');
        this._closeBtnElem.onclick = this._eventHideBlock.bind(this);
        this._showBlockErrorsCheckboxElem = document.getElementById('show-block-errors');
        this._showBlockErrorsCheckboxElem.addEventListener('change', this._callbackResizeBlocks);

        this._update_title();
    }

    show() {
        if (!this._showBlockErrorsCheckboxElem.checked) {
            this._showBlockErrorsCheckboxElem.checked = true;
            this._callbackResizeBlocks();
        }
    }

    hide() {
        if (this._showBlockErrorsCheckboxElem.checked) {
            this._showBlockErrorsCheckboxElem.checked = false;
            this._callbackResizeBlocks();
        }
    }

    _eventHideBlock(event) {
        let e = event || window.event;
        e.preventDefault();
        e.cancelBubble = true;

        if (e.stopPropagation) {
            e.stopPropagation();
        }

        this.hide();
        return false;
    }

    _update_title() {
        let titleStr = 'NO ERROR';
        if (this.length !== 0) {
            titleStr = (this.length === 1) ? '1 ERROR' : this.length.toString() + ' ERRORS';
        }

        this._titleElem.innerText = titleStr;
    }

    _updateIconNum() {
        this._iconNumElem.innerText = this.length.toString();

        if (this.length === 0) {
            this._linkDisplayElem.classList.remove('active-red');
        } else {
            if (!this._linkDisplayElem.classList.contains('active-red')) {
                this._linkDisplayElem.classList.add('active-red');
            }
        }
    }

    _errorsToStrHTML(errorsList) {
        let contentHTML = '';

        for (const errorStr of errorsList) {
            contentHTML += '<p>- ' + errorStr + '</p>';
        }

        return contentHTML;
    }

    _updateInterface(block) {
        this._updateIconNum();
        this._update_title();
        
        const errorsStrHTML = this._errorsToStrHTML(block.list);
        block.contentElem.innerHTML = errorsStrHTML;

        if (errorsStrHTML) {
            block.wrapperElem.classList.remove('hidden');
        } else if (!block.wrapperElem.classList.contains('hidden')) {
            block.wrapperElem.classList.add('hidden');
        }

        if (this._showBlockErrorsCheckboxElem.checked) {
            this._callbackResizeBlocks();
        }
    }

    _needUpdateErrorsList(block, arr2) {
        if (block.list.length !== arr2.length) {
            return true;
        }

        const identical = block.list.every((v, i) => v == arr2[i]);
        return !identical;
    }

    setBlockErrors(blockName, errorsList) {
        // Update the errors for the specified block
        let block = undefined;

        switch (blockName) {
            case BlockName.Head:
                block = this.head;
                break;
            case BlockName.Body:
                block = this.body;
                break;
            case BlockName.Style:
                block = this.css;
                break;
            default:
                return false;
        }

        if (!this._needUpdateErrorsList(block, errorsList)) {
            return false;
        }

        // Update the errors array of this block
        block.list = errorsList;

        // Update the total error count
        this.length = this.head.list.length + this.body.list.length + this.css.list.length;

        // Finally update the interface
        this._updateInterface(block);
    }

}

export class Controller {
    bodyEditor;
    headEditor;
    cssEditor;
    errors;
    _callbackChangeOccured = undefined;
    _errorsRegexLineNum = /error on line (\d+)( at)/;
    _errorsRegexLineAndNum = /(line )(\d+)( and)/;
    _errorsRegexFirefox = /.+? Error: (.+?)\n.+?\nLine Number (\d+), Column (\d+):(.+?)\n/;

    constructor(bodyBlockId, headBlockId, cssBlockId, callbackChangeOccured, isDark=false) {
        this.bodyEditor = ace.edit(bodyBlockId);
        this.headEditor = ace.edit(headBlockId);
        this.cssEditor = ace.edit(cssBlockId);

        this.errors = new ErrorsController(this.viewResized.bind(this));

        this._callbackChangeOccured = callbackChangeOccured;

        let config = require("ace/config");
        let net = require("ace/lib/net");
        net.loadScript(config.moduleUrl("ace/mode/html", "mode"), this._initialize.bind(this, isDark));
    }

    _initialize(isDark) {
        let HtmlMode = require("ace/mode/html").Mode;

        this._setDefaultConfig(this.bodyEditor, new HtmlMode({fragmentContext: "body"}), BlockName.Body, isDark);
        this._setDefaultConfig(this.headEditor, new HtmlMode({fragmentContext: "head"}), BlockName.Head, isDark);
        this._setDefaultConfig(this.cssEditor, "ace/mode/css", BlockName.Style, isDark);

        this.cssEditor.session.on("changeAnnotation", this._eventUpdateCssErrors.bind(this));
        this.updateBlockErrors(BlockName.Head);
        this.updateBlockErrors(BlockName.Body);
    }

    _eventChangeOccured(event, blockName) {
        this._callbackChangeOccured();
        if (blockName !== BlockName.Style) {
            this.updateBlockErrors(blockName);
        }
    }

    viewResized() {
        this.bodyEditor.resize();
        this.headEditor.resize();
        this.cssEditor.resize();
    }

    _eventUpdateCssErrors(event) {
        const errorsList = this._retrieveListErrorsCSS(this.cssEditor.getSession().getAnnotations());
        this.errors.setBlockErrors(BlockName.Style, errorsList);
    }

    switchToDark(darkBoolean) {
        const theme = (darkBoolean) ? "ace/theme/rowan_dark" : "ace/theme/rowan_light";
        
        this.headEditor.setTheme(theme);
        this.bodyEditor.setTheme(theme);
        this.cssEditor.setTheme(theme);
    }

    _setDefaultConfig(editor, mode, blockName, isDark) {
        // Set the theme
        if (isDark) {
            editor.setTheme("ace/theme/rowan_dark");
        } else {
            editor.setTheme("ace/theme/rowan_light");
        }
        
        // Enable the keyboard shortcuts or Visual Studio Code
        editor.setKeyboardHandler("ace/keyboard/vscode");
        // Like in VS Code the undo have a delta
        editor.mergeUndoDeltas = true;
        // Set the best cursor type
        editor.cursorStyle = 'smooth';
        // Highlight the active line
        editor.highlightActiveLine = true;
        // If user do CTRL+C or CTRL+X without an active selection the whole line is considered selected
        editor.copyWithEmptySelection = true;
        // Disable the 80 characters indicator
        editor.setShowPrintMargin(false);
        // Set the correct font family name
        editor.setOption("fontFamily", 'JetBrains Mono');
        // Set the language (a.k.a the mode) to use for this code block
        editor.session.setMode(mode);
        // Use spaces as "Tabs"
        editor.session.useSoftTabs = true;
        // An indent is 4 space
        editor.session.tabSize = 4;
        // Add a callback to detect when the editor is changed / updated
        editor.on("change", this._eventChangeOccured.bind(this, event, blockName));
    }

    _retrieveListErrorsHTML(errors, lineNumOffset) {
        let list = [];

        for (let error of errors) {
            // These errors are nodes of type parsererror, all navigators doesn't fill them the same way.
            let errorMsg = error.textContent;

            if (error.childNodes.length === 2) {
                // Firefox

                errorMsg = errorMsg.replace(this._errorsRegexFirefox, function (match, p1, p2, p3, p4) {
                    let lineNum = parseInt(p2) + lineNumOffset;
                    if (lineNum <= 0) {
                        lineNum = 1;
                    }

                    return `Line ` + lineNum.toString() + ` at column ` + p3 + `: Html ` + p1 + `: ` + p4;
                });
            } else {
                // Chrome and Safari

                // Remove unwanted parts
                errorMsg = errorMsg.replace('This page contains the following errors:', '');
                errorMsg = errorMsg.replace('\nBelow is a rendering of the page up to the first error.', '');

                // Fix the error line
                errorMsg = errorMsg.replace(this._errorsRegexLineNum, function (match, p1, p2) {
                    let lineNum = parseInt(p1) + lineNumOffset;
                    if (lineNum <= 0) {
                        lineNum = 1;
                    }
                    return `Line ` + lineNum.toString() + p2;
                });

                // Fix the line in the body of the message
                errorMsg = errorMsg.replace(this._errorsRegexLineAndNum, function(match, p1, p2, p3) {
                    return p1 + (parseInt(p2) + lineNumOffset + 1).toString() + p3;
                });
            }

            // Add the corrected error message to the errors list
            list.push(errorMsg);
        }
        return list;
    }

    _retrieveListErrorsCSS(annotations) {
        let list = [];

        for (let annotation of annotations) {
            if (annotation.type != 'error') {
                continue;
            }

            let errorMsg = annotation.text.split(' at')[0];
            errorMsg = 'Line ' + (annotation.row + 1).toString() + ' at column ' + (annotation.column + 1).toString() + ': ' + errorMsg;

            list.push(errorMsg);
        }

        return list;
    }

    updateBlockErrors(blockName) {
        let strContent = '';

        if (blockName === BlockName.Head) {
            strContent = '<!DOCTYPE html><html><head>\n' + this.headEditor.getValue().trimEnd() + '\n</head><body></body></html>';
        } else if (blockName === BlockName.Body) {
            strContent = '<!DOCTYPE html><html><head></head><body>\n' + this.bodyEditor.getValue().trimEnd() + '\n</body></html>'; 
        } else {
            return false;
        }

        const parsedContent = this.errors.domParser.parseFromString(strContent, 'text/xml');
        const errorsList = this._retrieveListErrorsHTML(parsedContent.getElementsByTagName('parsererror'), -2);

        this.errors.setBlockErrors(blockName, errorsList);
    }

    generateStringHTML() {
        const headContent = this.headEditor.getValue();
        const bodyContent = this.bodyEditor.getValue();
        const cssContent = this.cssEditor.getValue();

        return `<!DOCTYPE html>
<html lang="en-US">
<head>
${headContent}
<style>
${cssContent}
</style>
</head>
<body>
${bodyContent}
</body>
</html>`;
    }
}