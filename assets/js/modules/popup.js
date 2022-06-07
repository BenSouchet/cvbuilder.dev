const Popup = (function() { return { Controller:
class PopupController {
    _containerElem;
    _titleElem;
    _contentElem;
    _closeBtnElem;
    _outsideAreaElem;
    _actionCancelElem;
    _actionValidateElem;

    _actionValidateCallback;
    _actionCancelCallback;

    constructor(containerElemId) {
        this._containerElem = document.getElementById(containerElemId);
        this._titleElem = document.getElementById('popup-title');
        this._contentElem = document.getElementById('popup-content');

        this._closeBtnElem = document.getElementById('popup-close-btn');
        this._closeBtnElem.onclick = this._eventClose.bind(this);

        this._outsideAreaElem = document.getElementById('outside-popup');
        this._outsideAreaElem.onclick = this._eventClose.bind(this);

        this._actionCancelElem = document.getElementById('popup-action-cancel');
        this._actionCancelElem.onclick = this._eventCancel.bind(this);

        this._actionValidateElem = document.getElementById('popup-action-validate');
        this._actionValidateElem.onclick = this._eventValidate.bind(this);
    }

    open(titleStr, contentHTML, CustomContentElemClasses=[], validateCallback=null, validateValue='OK', showCancel=false, cancelCallback=null) {
        this._titleElem.innerText = titleStr;
        this._contentElem.innerHTML = contentHTML;
        this._actionValidateElem.innerText = validateValue;

        if (showCancel) {
            this._actionCancelElem.hidden = false;
        }

        this._actionValidateCallback = validateCallback;
        this._actionCancelCallback = cancelCallback;

        if (CustomContentElemClasses) {
            for (const customClass of CustomContentElemClasses) {
                this._contentElem.classList.add(customClass);
            }
        }

        this._containerElem.hidden = false;
    }

    clear() {
        this._titleElem.innerText = '';

        this._contentElem.classList.remove(...this._contentElem.classList);
        this._contentElem.innerHTML = '';

        this._actionValidateElem.innerText = 'OK';
        this._actionCancelElem.hidden = true;
    }

    close() {
        // First we hide
        this._containerElem.hidden = true;

        // Then we cleanup
        this.clear();
    }

    _eventClose(event) {
        let e = event || window.event;
        e.preventDefault();
        e.cancelBubble = true;

        if (e.stopPropagation) {
            e.stopPropagation();
        }

        this.close();
        return false;
    }

    _eventCancel(event) {
        if (this._actionCancelCallback) {
            this._actionCancelCallback();
        }

        this.close();
    }

    _eventValidate(event) {
        if (this._actionValidateCallback) {
            this._actionValidateCallback();
        }

        this.close();
    }
}}})();