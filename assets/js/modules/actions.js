export class Controller {
    _callbackGetStringHTML;
    _callbackGetIframeElem;
    _callbackActionSaveHTML;
    _domParser;
    _filereader;

    constructor(callbackGetStringHTML, callbackGetIframeElem, callbackActionSaveHTML, callbackEventBeforeImportHTML, callbackUpdateBlocks) {
        this._callbackGetStringHTML = callbackGetStringHTML;
        this._callbackGetIframeElem = callbackGetIframeElem;
        this._callbackActionSaveHTML = callbackActionSaveHTML;
        this._callbackEventBeforeImportHTML = callbackEventBeforeImportHTML;
        this._callbackUpdateBlocks = callbackUpdateBlocks;

        this._domParser = new DOMParser();
        this._fileReader = new FileReader();
        this._fileReader.onloadend = this._eventImportHTMLContent.bind(this);

        let btnImport = document.getElementById('html-file-import');
        let btnSaveHTML = document.getElementById('btn-save');
        let btnSavePDF = document.getElementById('btn-pdf');
        let btnPrint = document.getElementById('btn-print');

        btnImport.addEventListener('change', this._eventImportHTML.bind(this));
        btnSaveHTML.onmouseup = this.actionSaveAsHTML.bind(this);
        btnSavePDF.onmouseup = this.actionSaveAsPDF.bind(this);
        btnPrint.onmouseup = this.actionPrint.bind(this);
    }

    _eventImportHTML(event) {
        const fileList = event.target.files;
        if (fileList.length != 1) {
            return false;
        }

        this._callbackEventBeforeImportHTML(fileList[0]);
    }

    actionImportHTMLString(strContent) {
        const newHtmlDom = this._domParser.parseFromString(strContent, 'text/html');

        const bodyHtml = newHtmlDom.body.innerHTML;
        const headHtml = newHtmlDom.head.innerHTML.slice(0, newHtmlDom.head.innerHTML.lastIndexOf('<style>'));
        const styleCss = newHtmlDom.head.lastElementChild.innerHTML;

        this._callbackUpdateBlocks(bodyHtml, headHtml, styleCss, true);
    }

    _eventImportHTMLContent(event) {
        this.actionImportHTMLString(this._fileReader.result);
    }

    actionImportHTMLFile(file) {
        this._fileReader.readAsText(file, "UTF-8");
    }

    _generateFilename(extension) {
        let dateObj = new Date();
        const offsetMs = dateObj.getTimezoneOffset() * 60000;
        dateObj = new Date(dateObj.getTime() - offsetMs);

        const regex = /^(.+?)T(.+?)\./;

        const match = regex.exec(dateObj.toISOString());
        const currDate = match[1];
        const currTime = match[2].replaceAll(':', '-');

        return `cv_${currDate}_${currTime}.${extension}`;
    }

    _saveBlobAs(blob, filename) {
        const dummyLink = window.document.createElement('a');

        dummyLink.setAttribute("type", "hidden");

        dummyLink.href = window.URL.createObjectURL(blob);
        dummyLink.download = filename;

        document.body.appendChild(dummyLink);

        dummyLink.click();

        window.URL.revokeObjectURL(dummyLink.href);

        document.body.removeChild(dummyLink);
    }

    actionSaveAsHTML() {
        const htmlContent = this._callbackGetStringHTML();
        if (htmlContent === undefined) {
            this._callbackActionSaveHTML(true);
            return false;
        }

        const blob = new Blob([htmlContent], {type: 'text/html'});

        this._saveBlobAs(blob, this._generateFilename('html'));

        this._callbackActionSaveHTML();
    }

    actionSaveAsPDF() {
        const iFrameDocument = this._callbackGetIframeElem().contentDocument;

        const options = { allowTaint: true };
        html2canvas(iFrameDocument.body, options).then(canvas => {
            const imgData = canvas.toDataURL();

            const doc = new PDFDocument({size: 'A4', info: { Title: 'CV' }});
            const stream = doc.pipe(blobStream());

            // A4 format at 72 DPI is equal to 595px by 842px
            doc.image(imgData, 0, 0, {width: 595, height: 842});

            // Little hack to reduce memory usage (see https://github.com/foliojs/pdfkit/issues/1081#issuecomment-580889621 )
            delete doc._imageRegistry[imgData];

            doc.end();
            stream.on('finish', function() {
                const blob = stream.toBlob('application/pdf');

                this._saveBlobAs(blob, this._generateFilename('pdf'))
            }.bind(this));
        });
    }

    actionPrint() {
        const iframeWindow = this._callbackGetIframeElem().contentWindow;
        iframeWindow.print();
    }
}