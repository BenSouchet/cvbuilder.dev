export class Controller {
    baseUrl = 'assets/templates/';
    templates = {};
    _containerElem;
    _showTemplatesCheckboxElem;
    _callbackResizeBlocks;
    _funcOpenPopupFunction;
    _funcLoadTemplate;

    constructor(templatesContainerId, callbackResizeBlocks, callbackViewTemplate, funcOpenPopupFunction, callbackEventBeforeImportHTML) {
        this._containerElem = document.getElementById(templatesContainerId);
        this._callbackResizeBlocks = callbackResizeBlocks;
        this._callbackViewTemplate = callbackViewTemplate;
        this._callbackEventBeforeImportHTML = callbackEventBeforeImportHTML;
        this._funcOpenPopupFunction = funcOpenPopupFunction;


        this._showTemplatesCheckboxElem = document.getElementById('retract-templates');
        this._showTemplatesCheckboxElem.addEventListener('change', this._callbackResizeBlocks);

        // Retrieve the templates list
        fetch(this.baseUrl + "templates.json").then(response => response.json()).then(this._callbackLoadTemplatesList.bind(this));
    }

    applyTemplate(templateFilename) {
        fetch(this.templates[templateFilename].url).then(res => res.blob()).then(blob => {
            const templateFile = new File([blob], templateFilename + '.html', blob);
            this._callbackEventBeforeImportHTML(templateFile);
        }).then(() => {
            // Force a resize of Ace blocks to avoid issues
            this._callbackResizeBlocks();
        });
    }

    applyRandomTemplate() {
        const templates = Object.values(this.templates);
        const templateIndex = Math.floor(Math.random() * (templates.length));

        this.applyTemplate(templates[templateIndex].filename); 
    }

    previewTemplate(templateFilename) {
        const template = this.templates[templateFilename];
        let contentHTML = `<img src="${template.thumbnail_url}"><div id="template-preview-info"><p id="template-preview-name">Name: ${template.name}</p><p id="template-preview-author">Created by <a href="${template.author.url}">${template.author.name}</a></p></div>`;

        this._funcOpenPopupFunction('Template Preview', contentHTML, ['template-preview'], this.applyTemplate.bind(this, templateFilename), 'Use Template', true);
    }

    _callbackLoadTemplatesList(templates) {
        for (const template of templates) {
            const filename = template.filename;

            this.templates[filename] = {
                name: template.name,
                filename: filename,
                author: template.author,
                url: this.baseUrl + 'files/' + filename + '.html',
                thumbnail_url: this.baseUrl + "thumbnails/" + filename + ".jpg",
            }

            this._addTemplateToContainer(this.templates[filename]);
        }

        this.applyRandomTemplate();
    }

    _addTemplateToContainer(template) {
        const templateLink = window.document.createElement('a');
        templateLink.href = '#';
        templateLink.classList.add('template');
        templateLink.onclick = this._callbackViewTemplate;
        templateLink.setAttribute('data-templateFilename', template.filename);

        const templateImg = window.document.createElement('img');
        templateImg.src = template.thumbnail_url;

        templateLink.appendChild(templateImg);

        this._containerElem.appendChild(templateLink);
    }
}
