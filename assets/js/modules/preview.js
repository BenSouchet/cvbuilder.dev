const Preview = (function() {
    const pixelToFloat = (valueStr) => parseFloat(valueStr.slice(0, -2));

    return { MouseState:
class MouseState {
    static Select = new MouseState("Select");
    static Move = new MouseState("Move");
  
    constructor(name) {
        this.name = name;
    }
}, Mode:
class Mode {
    static Free = new Mode("Free");
    static FitWidth = new Mode("FitWidth");
    static FitFull = new Mode("FitFull");
  
    constructor(name) {
        this.name = name;
    }
}, UserMovingDevice:
class UserMovingDevice {
    static Mouse = new UserMovingDevice("Mouse");
    static Trackpad = new UserMovingDevice("Trackpad");
    static Undefined = new UserMovingDevice("Undefined");
  
    constructor(name) {
        this.name = name;
    }
}, ZoomController:
class ZoomController {
    _element;
    _elementUserInput;
    _buttonZoomOut;
    _buttonZoomIn;
    _callbackNewValue;
    value;
    minStepValue;
    step;

    constructor(element, minStepValue, step, callbackNewValue) {
        this._element = element;
        this.minStepValue = minStepValue;
        this.step = step;
        this._callbackNewValue = callbackNewValue;
        this.value = 1.0;

        // Zoom buttons
        this._buttonZoomOut = document.getElementById('tool-zoom-out');
        this._buttonZoomOut.onmousedown = this._stepZoom.bind(this, event, -1);

        this._buttonZoomIn = document.getElementById('tool-zoom-in');
        this._buttonZoomIn.onmousedown = this._stepZoom.bind(this, event, 1);

        // Zoom percent
        this._elementUserInput = document.getElementById('tool-zoom-value');
        this._elementUserInput.addEventListener("keydown", this._checkBlur.bind(this));
        this._elementUserInput.addEventListener('blur', this._userInput.bind(this));
    }

    _stepZoom(event, direction) {
        const newValue = this.minStepValue + (this.step * (Math.round((this.value - this.minStepValue) / this.step) + direction));
        this.setValue(newValue, true);

        return false;
    }

    _checkDisablingZoomOut() {
        if (this.value <= this.minStepValue) {
            // Disable Zoom Out Button
            if (!this._buttonZoomOut.classList.contains('disabled')) {
                this._buttonZoomOut.classList.add('disabled');
            }
        } else {
            this._buttonZoomOut.classList.remove('disabled');
        }
    }

    setValue(newValue, userZoom=false) {
        newValue = parseFloat(newValue);
        if (newValue < 0.01) {
            newValue = 0.01;
        }

        const prevValue = this.value;

        // Set element scale based on zoom
        this.value = parseFloat(newValue);
        this._element.style.transform = 'scale(' + this.value + ')';

        // Update zoom UI value
        this._elementUserInput.value = (this.value * 100).toFixed() + '%';

        this._checkDisablingZoomOut();

        this._callbackNewValue(this.value, prevValue, userZoom);
    }

    _removeForbiddenCharacters(value) {
        return value.replace(/[^.0-9]+/gi, '').split('.')[0];
    }

    _userInput(event) {
        const trimmedUserValue = this._removeForbiddenCharacters(this._elementUserInput.value);
        let newValue = this.value;
        if (trimmedUserValue != "" && parseFloat(trimmedUserValue) != 0) {
            newValue = parseFloat(trimmedUserValue) * 0.01;
        }

        this.setValue(newValue, true);
    }

    _checkBlur(event) {
        if (event.keyCode === 13) {
            // If ENTER key is pressed leave the focus of the input
            this._elementUserInput.blur();
        }
    }
}, MoveController:
class MoveController {
    _element;
    _elementMouseArea;
    _callbackStartMoving;
    _callbackMoving;
    _startPos;
    _startOffset;
    offset;

    constructor(element, elementMouseArea, callbackStartMoving, callbackMoving) {
        this._callbackStartMoving = callbackStartMoving;
        this._callbackMoving = callbackMoving;

        this._element = element;

        this._elementMouseArea = elementMouseArea;
        this._elementMouseArea.addEventListener('mousedown', this._startMoving.bind(this), true);

        this.offset = [undefined, undefined];
    }

    _switchNoInteract(add) {
        for (let child of document.body.childNodes) {
            if (child.nodeName == 'DIV') {
                if (add) {
                    child.classList.add('nointeract');
                } else {
                    child.classList.remove('nointeract');
                }
            }
        }
    }

    _startMoving(event) {
        const e = event || window.event;

        const canMove = this._callbackStartMoving();

        if (!canMove) {
            return true;
        }

        e.preventDefault();

        this._startPos = [e.clientX, e.clientY];
        const computedStyle = window.getComputedStyle(this._element, null);
        this._startOffset = [pixelToFloat(computedStyle.left), pixelToFloat(computedStyle.top)];

        document.onmousemove = this._moving.bind(this);
        document.onmouseup = this._stopMoving.bind(this);

        this._switchNoInteract(true);

        return false;
    }

    _moving(event) {
        const e = event || window.event;

        const newOffset = [this._startOffset[1] + (e.clientY - this._startPos[1]), this._startOffset[0] + (e.clientX - this._startPos[0])];

        this._callbackMoving(newOffset, this.offset);

        this.offset = newOffset;

        return false;
    }

    _stopMoving(event) {
        document.onmouseup = null;
        document.onmousemove = null;

        this._switchNoInteract(false);

        return false;
    }

    setOffset(newValues) {
        this.offset = newValues;

        this._element.style.top = newValues[0] + 'px';
        this._element.style.left = newValues[1] + 'px';
    }

    setOffsetTop(newValue) {
        this.offset[0] = newValue;

        this._element.style.top = newValue + 'px';
    }

    setOffsetLeft(newValue) {
        this.offset[1] = newValue;

        this._element.style.left = newValue + 'px';
    }

    unsetOffset() {
        // Set to undefine to show that it's currently unavailable
        this.offset = [undefined, undefined];

        this._element.style.top = 'unset';
        this._element.style.left = 'unset';
    }

    unsetOffsetTop() {
        // Set to undefine to show that it's currently unavailable
        this.offset[0] = undefined;

        this._element.style.top = 'unset';
    }

    unsetOffsetLeft() {
        // Set to undefine to show that it's currently unavailable
        this.offset[1] = undefined;

        this._element.style.left = 'unset';
    }
}, wheelController:
class wheelController {
    _element;
    _elementContainer;
    _callbackZoom;
    _callbackPan;
    _userDevice = Preview.UserMovingDevice.Undefined;
    _lastUserDeviceDetection;
    _lastWheelEvent;
    pinchEnabled = false;

    constructor(element, elementContainer, callbackZoom, callbackPan) {
        this._element = element;
        this._elementContainer = elementContainer;
        this._callbackZoom = callbackZoom;
        this._callbackPan = callbackPan;

        // Add event listeners for zoom / scroll / pan
        this._elementContainer.addEventListener('wheel', this._eventWheel.bind(this, event, true), { passive: false });
    }

    addWheelEventToElemWindow() {
        this._element.contentWindow.addEventListener('wheel', this._eventWheel.bind(this, event, false), { passive: false });
    }

    _getUserMovingDevice(event, currDate) {   
        if (this._userDevice != Preview.UserMovingDevice.Undefined &&
            (this._lastWheelEvent + 200) >= currDate &&
            (this._lastUserDeviceDetection + 2000) >= currDate) {
            // If the device was previously detected,
            // and the last wheel event was less than 200ms ago,
            // and the last device detection was less than 2s ago, then we assume nothing as changed.
            // INFO: These values (200ms and 2s) are arbitrary but seems to work very well.
            return this._userDevice;
        }

        this._lastUserDeviceDetection = currDate;

        // The first wheel event deltaY value of a Trackpad is something very small between 1 and 6
        // The first wheel event deltaY value of a mouse is at least 8 (and that on very high sensitive mouse wheel)
        return Math.abs(event.deltaY) < 8 ? Preview.UserMovingDevice.Trackpad : Preview.UserMovingDevice.Mouse;
    }

    setUserMovingDevice(userdDevice) {
        this._userDevice = userdDevice;
        this._lastUserDeviceDetection = Date.now();
    }

    _eventWheel(event, preventDefault) {
        const e = event || window.event;

        const currDate = Date.now();

        if (e.ctrlKey) {
            // It's a pinch
            this.setUserMovingDevice(Preview.UserMovingDevice.Trackpad);

            if (!this.pinchEnabled) {
                return false;
            }
            e.preventDefault();

            // The deltaY value represent the zoom factor(deltaX isn't used, always ~0.0)
            this._callbackZoom(e.deltaY);
        } else if (Math.abs(e.deltaX) > Number.EPSILON) {
            // It's a pan
            this.setUserMovingDevice(Preview.UserMovingDevice.Trackpad);

            this._callbackPan(e.deltaX, e.deltaY);
        } else if (Math.abs(e.deltaY) > Number.EPSILON) {
            this._userDevice = this._getUserMovingDevice(e, currDate);
            if (this._userDevice === Preview.UserMovingDevice.Mouse) {
                // It's a zoom
                this._callbackZoom(e.deltaY);
            } else {
                // It's a pan
                this._callbackPan(0.0, e.deltaY);
            }
        }

        this._lastWheelEvent = currDate;
        return false;
    }
}, Controller:
class PreviewController {
    _element;
    _elementContainer;
    _moveController;
    _zoomController;
    _wheelController;
    _freeZoom = false;
    _mode = Preview.Mode.FitFull;
    _mouseState = Preview.MouseState.Select;
    _emInPixels = 16;

    constructor(containerElemId, mouseStates) {
        this._emInPixels = parseFloat(getComputedStyle(document.documentElement).fontSize);
        this._elementContainer = document.getElementById(containerElemId);

        // Create the preview element (type iFrame)
        this._element = this._createElement('live-preview');
        // Append it to the container
        this._elementContainer.append(this._element);

        // Create controllers for the features (move, zoom)
        this._moveController = new Preview.MoveController(this._element, this._elementContainer, this._handleMoveStarted.bind(this), this._handleMoving.bind(this));
        this._zoomController = new Preview.ZoomController(this._element, 0.05, 0.15, this._handleZoomUpdated.bind(this));
        this._wheelController = new Preview.wheelController(this._element, this._elementContainer, this._handleZoom.bind(this), this._handlePan.bind(this));

        // Listeners for Mouse tools
        for (const [mouseState, buttonId] of mouseStates) {
            let buttonElem = document.getElementById(buttonId);
            buttonElem.addEventListener('change', this._eventSwitchMouseState.bind(this, event, mouseState));
        }

        // Fit buttons
        const fitWidthButton = document.getElementById('tool-fit-width');
        fitWidthButton.onmousedown = this.toolFitWidth.bind(this);
        const fitFullButton = document.getElementById('tool-fit-full');
        fitFullButton.onmousedown = this.toolFitFull.bind(this);

        this.toolFitFull();
        this.switchMouseState(Preview.MouseState.Select);
    }

    switchMouseState(mouseState) {
        this._mouseState = mouseState;
        if (this._mouseState === Preview.MouseState.Select) {
            this._wheelController.pinchEnabled = false;
            this._element.classList.remove('nointeract');
        } else {
            this._wheelController.pinchEnabled = true;
            this._elementContainer.classList.remove('nointeract');
            if (!this._element.classList.contains('nointeract')) {
                this._element.classList.add('nointeract');
            }
        }
    }

    _eventSwitchMouseState(event, mouseState) {
        this.switchMouseState(mouseState);
        return false;
    }

    viewResized() {
        if (this._mode === Preview.Mode.FitWidth) {
            this.toolFitWidth();
        } else if (this._mode === Preview.Mode.FitFull) {
            this.toolFitFull();
        }
    }

    updateHTML(htmlContent) {
        this._element.contentDocument.write(htmlContent);
        this._element.contentDocument.close();
        this._wheelController.addWheelEventToElemWindow();
    }

    _createElement(elementId) {
        let element = document.createElement('iframe');
        element.setAttribute('id', elementId);
        element.sandbox = 'allow-same-origin allow-modals allow-scripts';

        return element;
    }

    switchToFreeMode() {
        if (this._mode === Mode.Free) {
            return true;
        }

        const topOffset = (this._elementContainer.offsetHeight - this._element.offsetHeight) * 0.5;
        const leftOffset = (this._elementContainer.offsetWidth - this._element.offsetWidth) * 0.5;

        this._moveController.setOffsetLeft(leftOffset);
        if (this._mode === Preview.Mode.FitFull) {
            this._moveController.setOffsetTop(topOffset);
        }

        this._mode = Preview.Mode.Free;
        this._freeZoom = false;
    }

    _toolFitWidth_ComputeTopOffset() {
        let topOffset = ((this._zoomController.value * this._element.offsetHeight) - this._element.offsetHeight) * 0.5;
        topOffset = topOffset + (.7 * this._emInPixels);

        return topOffset;
    }

    getFitWidthZoom() {
        return this._elementContainer.offsetWidth / this._element.offsetWidth;
    }

    toolFitWidth(event) {
        if (this._mode !== Preview.Mode.FitWidth) {
            this._freeZoom = false;
        }

        this._mode = Preview.Mode.FitWidth;

        const newZoomValue = this.getFitWidthZoom();

        if (!this._freeZoom || (this._freeZoom && newZoomValue < this._zoomController.value)) {
            this._freeZoom = false;
            this._zoomController.setValue(newZoomValue);
        }

        if (event) {
            event.srcElement.blur();
        }

        return false;
    }

    getFitFullZoom() {
        let ZoomValue = (this._elementContainer.offsetHeight - (1.4 * this._emInPixels)) / this._element.offsetHeight;
        if ((this._elementContainer.offsetWidth / this._elementContainer.offsetHeight) <= (210 / 297)) {
            ZoomValue = this._elementContainer.offsetWidth / this._element.offsetWidth;
        }
        return ZoomValue;
    }

    toolFitFull(event) {
        if (this._mode !== Preview.Mode.FitFull) {
            this._freeZoom = false;
        }

        this._mode = Preview.Mode.FitFull;

        let newZoomValue = this.getFitFullZoom();

        if (!this._freeZoom || (this._freeZoom && newZoomValue < this._zoomController.value)) {
            this._freeZoom = false;
            this._zoomController.setValue(newZoomValue);
        }

        if (event) {
            event.srcElement.blur();
        }

        return false;
    }

    _handleZoomUpdated(newValue, prevValue, userZoom) {
        this._freeZoom = userZoom;

        // Update element position
        if (this._mode === Preview.Mode.FitWidth) {
            const topOffset = this._toolFitWidth_ComputeTopOffset();

            this._moveController.setOffsetTop(topOffset);
            this._moveController.unsetOffsetLeft();
            if (this._freeZoom && newValue > this.getFitWidthZoom()) {
                // User as manually zoom up while he was in Fit Width mode, we switch to Free Mode
                // This will also disable/reset _freeZoom
                this.switchToFreeMode();
            }
        } else if (this._mode === Preview.Mode.FitFull) {
            this._moveController.unsetOffset();
            if (this._freeZoom && newValue > this.getFitFullZoom()) {
                // User as manually zoom up while he was in Fit Full mode, we switch to Free Mode
                // This will also disable/reset _freeZoom
                this.switchToFreeMode();
            }
        }
    }

    _handleMoveStarted() {
        if (this._mouseState === Preview.MouseState.Move) {
            this.switchToFreeMode();
            return true;
        }
        return false;
    }

    _handleMoving(newOffset, prevOffset) {
        this._moveController.setOffset(newOffset);
    }

    _handleZoom(zoomDelta) {
        this._zoomController.setValue(this._zoomController.value - (zoomDelta * 0.002), true);
    }

    _handlePan(panDeltaX, panDeltaY) {
        // Switch to free mode to unsure we have correct offset computed
        this.switchToFreeMode();

        const currOffset = this._moveController.offset;
        if (Math.abs(panDeltaY) > Number.EPSILON) {
            this._moveController.setOffsetTop(currOffset[0] - panDeltaY);
        }

        if (Math.abs(panDeltaX) > Number.EPSILON) {
            this._moveController.setOffsetLeft(currOffset[1] - panDeltaX);
        }
    }
}}})();