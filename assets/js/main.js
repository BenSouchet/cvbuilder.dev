import * as Theme from './modules/theme.js';
import * as Resize from './modules/resize.js';
import * as Preview from './modules/preview.js';
import * as Blocks from './modules/blocks.js';
import * as Actions from './modules/actions.js';
import * as Popup from './modules/popup.js';
import * as Templates from './modules/templates.js';

class AppController {
    themeController;
    blocksController;
    previewController;
    actionsController;
    popupController;
    currentStringHTML = undefined;
    cssBlockResizer;
    sideResizer;
    _unsavedChanges = false;
    _updatePreviewRequested = undefined;
    leftSideElem;
    rightSideElem;
    rightSideWidthMin = 260;
    rightSideWidthDefault = 500;
    rightSideWidth;
    cssBlockHeightDefault = 400;

    constructor() {
        this.leftSideElem  = document.getElementById('side-left');
        this.rightSideElem = document.getElementById('side-right');

        let rightSideWidth = localStorage.getItem('side-width');
        rightSideWidth = (rightSideWidth !== null) ? Math.max(parseInt(rightSideWidth), this.rightSideWidthMin) : this.rightSideWidthDefault;

        let cssBlockHeight = localStorage.getItem('css-block-height');
        cssBlockHeight = (cssBlockHeight !== null) ? parseInt(cssBlockHeight) : this.cssBlockHeightDefault;

        this.themeController = new Theme.Switcher('theme-switch', this._callbackThemeChanged.bind(this));

        this.cssBlockResizer = new Resize.Resizer('sidebar-resizer-h', 'block-css', Resize.Axis.Y, null, ['22px', '100vh - 18.82rem'], 'dummy-container', [null, cssBlockHeight], null, this._callbackCssBlockResized.bind(this));
        this.sideResizer = new Resize.Resizer('sidebar-resizer-v', 'side-right', Resize.Axis.X, [ this.rightSideWidthMin.toString() + 'px', '100vw - 22.525rem'], null, 'dummy-container', [rightSideWidth, null], 'live-preview', this._callbackSideResized.bind(this));
        
        this.blocksController = new Blocks.Controller('block-body', 'block-head', 'content-block-css', this._callbackBlocksChanged.bind(this), this.themeController.isDark());
        this._generateStringHTML();

        this.previewController = new Preview.Controller('preview-container', [[Preview.MouseState.Select, 'tool-radio-cursor-pointer'], [Preview.MouseState.Move, 'tool-radio-cursor-grab']]);
        this._updatePreview();

        this.actionsController = new Actions.Controller(this.getStringHTML.bind(this), this.getIframeElem.bind(this), this._callbackActionSaveHTML.bind(this), this._callbackEventBeforeImportHTML.bind(this), this._callbackUpdateBlocks.bind(this));

        this.popupController = new Popup.Controller('popup-container');

        this.templatesController = new Templates.Controller('templates', this.blocksController.viewResized.bind(this.blocksController), this._eventViewTemplate.bind(this), this.popupController.open.bind(this.popupController), this._callbackEventBeforeImportHTML.bind(this));

        // Add event listener when the window is resized
        window.addEventListener("resize", this._eventWindowResized.bind(this), { passive: true });
        window.addEventListener('beforeunload', this._eventBeforeUnload.bind(this));
    }

    _callbackThemeChanged(isDark) {
        if (!this.blocksController) {
            return false;
        }
        this.blocksController.switchToDark(isDark);
    }

    setRightSideWidth(value) {
        this.rightSideElem.style.width = value + 'px';
        this._saveSideWidthLS(value);
    }

    _eventViewTemplate(event) {
        let e = event || window.event;
        e.preventDefault();

        if (event.currentTarget && event.currentTarget.nodeName === 'A') {
            const templateFilename = event.currentTarget.getAttribute('data-templateFilename');

            this.templatesController.previewTemplate(templateFilename);
        }
        return true;
    }

    _eventWindowResized(event) {
        this.previewController.viewResized();

        if (window.innerWidth < (this.leftSideElem.offsetWidth + this.rightSideWidth) && this.rightSideWidth > this.rightSideWidthMin) {
            this.setRightSideWidth(Math.max((window.innerWidth - this.leftSideElem.offsetWidth), this.rightSideWidthMin));
        }
        this.blocksController.viewResized();
    }

    _eventBeforeUnload(event) {
        let e = event || window.event;

        if (this._unsavedChanges == true) {
            e.preventDefault();
            e.cancelBubble = true;

            if (e.stopPropagation) {
                e.stopPropagation();
            }

            e.returnValue = 'Unsaved modifications will be lost, are you sure ?';
            return 'Unsaved modifications will be lost, are you sure ?';
        }
    
        delete e['returnValue'];
    }

    _generateStringHTML() {
        this.currentStringHTML = this.blocksController.generateStringHTML();
    }

    _callbackUpdateBlocks(bodyHtmlStr, headHtmlStr, styleCssStr, resetSavedChanges=false) {
        this.blocksController.headEditor.session.setValue(headHtmlStr.trim());
        this.blocksController.headEditor.navigateFileStart();
        this.blocksController.updateBlockErrors(Blocks.BlockName.Head);

        this.blocksController.bodyEditor.session.setValue(bodyHtmlStr.trim());
        this.blocksController.bodyEditor.navigateFileStart();
        this.blocksController.updateBlockErrors(Blocks.BlockName.Body);

        this.blocksController.cssEditor.session.setValue(styleCssStr.trim());
        this.blocksController.cssEditor.navigateFileStart();

        if (resetSavedChanges) {
            this._unsavedChanges = false;
        }
    }

    _callbackImportHTML(file) {
        this.actionsController.actionImportHTMLFile(file);
    }

    _callbackEventBeforeImportHTML(file) {
        if (!this._unsavedChanges) {
            this.actionsController.actionImportHTMLFile(file);
            return true;
        }
        this.popupController.open('Unsaved Changes', '<p>You are about to import and replace the codes of the HTML & CSS blocks.</p><p>There are <b>unsaved changes</b> that will be lost if you continue the import.</p>', ['vcenter'], this._callbackImportHTML.bind(this, file), 'Import & Replace', true);
    }

    _callbackActionSaveHTML(aborted = false) {
        if (aborted) {
            this.popupController.open('Cannot Save to file', '<p>Cannot save while there is unsolved error(s).</p><p>Check error list on bottom right corner.</p>', ['vcenter']);
            this.blocksController.errors.show();
            return false;
        }

        this._unsavedChanges = false;
    }

    getIframeElem() {
        return this.previewController._element;
    }

    getStringHTML() {
        if (this.blocksController.errors.length > 0) {
            return undefined;
        }

        return this.currentStringHTML;
    }

    _updatePreview() {
        this.previewController.updateHTML(this.currentStringHTML);
        this._updatePreviewRequested = undefined;
    }

    _saveSideWidthLS(value) {
        localStorage.setItem('side-width', value);
    }

    _callbackBlocksChanged() {
        clearTimeout(this._updatePreviewRequested);
        this._unsavedChanges = true;

        this._generateStringHTML();

        this._updatePreviewRequested = setTimeout(this._updatePreview.bind(this), 1400);
    }
    
    _callbackSideResized(axis, value) {
        this.rightSideWidth = value;
        this._saveSideWidthLS(value);
    
        if (this.previewController) {
            // Check required since the right side resizer instance is created before the preview controller instance
            this.previewController.viewResized();
        }
        if (this.blocksController) {
            this.blocksController.viewResized();
        }
    }
    
    _callbackCssBlockResized(axis, value) {
        localStorage.setItem('css-block-height', value);

        if (this.blocksController) {
            this.blocksController.viewResized();
        }
    }
}

function initialization() {
    new AppController();
}

function _preInitSwitchToDark() {
    // Get theme var from local storage
    const userSelectedTheme = localStorage.getItem('theme');
  
    if ((userSelectedTheme === null && window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches) ||
        userSelectedTheme === "dark") {
        // If the theme var doesn't exist in localStorage but user preference is set to dark
        // Or if user selected dark (localStorage)
        if (!document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.add('dark');
        }
    }
}

// Quickly move to dark theme if required
_preInitSwitchToDark();

// Wait document is ready before manipulating the DOM Elements
if (document.readyState !== 'loading') {
    initialization();
} else {
    document.addEventListener("DOMContentLoaded", function (event) {
        initialization();
    });
}
