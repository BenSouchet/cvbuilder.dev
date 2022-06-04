const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const pixelToFloat = (valueStr) => parseFloat(valueStr.slice(0, -2));

export class Axis {
    static X = new Axis("X");
    static Y = new Axis("Y");
    static Both = new Axis("Both");
  
    constructor(name) {
        this.name = name;
    }
}

export class Resizer {
    resizerElem;
    destElem;
    object;
    axis;
    minMaxX;
    minMaxY
    _startPos;
    _startSize;
    _dummy;
    _noInteractElem;
    _callback;

    constructor(resizerElemId, destElemId, axis, minMaxX, minMaxY, dummyElemId, defaultValues, noInteractElemId, callback) {
        this.resizerElem = document.getElementById(resizerElemId);
        this.destElem = document.getElementById(destElemId);
        this.axis = axis;
        this.minMaxX = minMaxX;
        this.minMaxY = minMaxY;
        this._dummy = document.getElementById(dummyElemId);
        // Cannot retrieve directly noInteractElem since in some case the HTML DOM element doesn't exists yet
        this._noInteractElem = noInteractElemId;
        this.callback = callback;

        if (defaultValues[0] != null) {
            this.destElem.style.width = defaultValues[0] + 'px';
            this.callback(Axis.X, defaultValues[0]);
        }
        if (defaultValues[1] != null) {
            this.destElem.style.height = defaultValues[1] + 'px';
            this.callback(Axis.Y, defaultValues[1]);
        }

        this.resizerElem.onmousedown = this.startResize.bind(this);
    }

    getCurrentMinMax(minMax) {
        this._dummy.style.setProperty('width', 'calc(' + minMax[0] + ')');
        this._dummy.style.setProperty('height', 'calc(' + minMax[1] + ')');

        var computedStyle = window.getComputedStyle(this._dummy, null);
        return [pixelToFloat(computedStyle.width), pixelToFloat(computedStyle.height)];
    }

    _switchNoInteract(add) {
        // Block (or unblock) interactions for childs of the body element
        for (let child of document.body.childNodes) {
            if (child.nodeName == 'DIV') {
                if (add) {
                    if (!child.classList.contains('nointeract')) {
                        child.classList.add('nointeract');
                    }
                } else {
                    child.classList.remove('nointeract');
                }
            }
        }

        if (!this._noInteractElem) {
            return true;
        }

        if (typeof this._noInteractElem === 'string' || this._noInteractElem instanceof String) {
            this._noInteractElem = document.getElementById(this._noInteractElem);
        }

        // This means that this._noInteractElem point to a valid DOM element we need to block (or unblock) interactions
        if (add) {
            if (!this._noInteractElem.classList.contains('nointeract')) {
                this._noInteractElem.classList.add('nointeract');
            }
        } else {
            this._noInteractElem.classList.remove('nointeract');
        }
    }

    startResize(event) {
        const e = event || window.event;

        this.startPos = [e.clientX, e.clientY];
        this.startSize = [this.destElem.offsetWidth, this.destElem.offsetHeight];

        document.onmousemove = this.resize.bind(this);
        document.onmouseup = this.stopResize.bind(this);

        this._switchNoInteract(true);

        return false;
    }

    resize(event) {
        const e = event || window.event;

        if (this.axis == Axis.X || this.axis == Axis.Both) {
            let newWidth = this.startSize[0] - (e.clientX - this.startPos[0]);
            const minMaxX = this.getCurrentMinMax(this.minMaxX);

            newWidth = clamp(newWidth, minMaxX[0], minMaxX[1]);

            this.destElem.style.width = newWidth + 'px';

            if (this.callback !== undefined) {
                this.callback(Axis.X, newWidth);
            }
        }
        if (this.axis == Axis.Y || this.axis == Axis.Both) {
            let newHeight = this.startSize[1] - (e.clientY - this.startPos[1]);
            const minMaxY = this.getCurrentMinMax(this.minMaxY);
            newHeight = clamp(newHeight, minMaxY[0], minMaxY[1]);

            this.destElem.style.height = newHeight + 'px';

            if (this.callback !== undefined) {
                this.callback(Axis.Y, newHeight);
            }
        }

        return false;
    }

    stopResize(event) {
        document.onmouseup = null;
        document.onmousemove = null;

        this._switchNoInteract(false);

        return false;
    }
}
