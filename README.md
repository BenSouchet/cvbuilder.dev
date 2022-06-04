# CVBuilder.dev
_Write your CV/Resume Easily with HTML & CSS!_

<p align="center"><img src="https://visitor-badge.glitch.me/badge?page_id=BenSouchet.cvbuilder&left_text=Views" alt="Views Count" /></p>

**CVBuilder.dev** is a Web App that helps you you create your CV in HTML & CSS, it's written in pure JS and hosted by Github.

## Templates
There is multiple templates available, ready to use and perfect for a good start!

## Source Code
The whole source code is on the [`gh-pages` branch]() of this repository.

## Usage & Information
**CVBuilder.dev** should be easy to use, on one side you see the current result, and on the other you have editor blocks to enter the HTML & CSS.

In the topbar you have the **actions**:
- _Open & Import HTML_, use to import a previously saved resume.
- _Save As HTML_, save the resume in one `.html` file to be able to use it again.
- _Export As PDF_, to generate a flat A4 PDF that you can easily share.
- _Print_, open the print dialog box of your browser.

The bottom bar contains the **preview tools**:
- _Select Mode_, it's the default mode you can select the text of the preview.
- _Move Mode_, in this mode you are in "hand" mode, this means that you can move the preview by clicking and dragging. If you have a trackpad you can pinch to zoom-in / zoom-out.
- Then the zoom controls, there is no real need to explain what it does :)
- Finally two button similar as in Adobe Reader / Acrobat, the first one will fit the preview in the available width.
- And the other one to fit the preview in the available space.

Check below a detailed view of the interface:

## How it work internally ?
The preview is an ***virtual sandboxed iFrame***, **virtual** because the iFrame doesn't point to a true file/page, and **sandboxed** to avoid code injection into the web app.

The editor blocks are currently instances of [Ace editor](https://github.com/ajaxorg/ace). The project will maybe move to [Code Mirror](https://github.com/codemirror/codemirror.next/) to improve CSS coverage.

The HTML to PDF is done by the combo of two libraries, first [**html2canvas**](https://github.com/niklasvh/html2canvas) to create an image (PNG) of the Preview in the form of an HTML canvas, then set this image into a PDF with [**img2pdf**](https://github.com/BenSouchet/img2pdf).

## Contributing
I actively encourage and support contributions.

Feel free to fork and improve/enhance **CVBuilder.dev** any way you want. If you feel that the web app and/or the community will benefit from your changes, please open a pull request.

You created a stunning Resume and want to share it as a **template**, open a pull request.

You don't know how to contribute ? how to open a pull request ? No worries, [check this page!]()

## Author / Maintainer
**CVBuilder.dev** has been created and is currently maintained by [Ben Souchet](https://github.com/BenSouchet).

## Licenses
- Third party libraries used for this project (in [`/assets/js/vendor/`]()) have there own licenses accessible in their respective sub-folders.
- The font used `JetBrains Mono` is under the [SIL Open Font License 1.1](https://github.com/JetBrains/JetBrainsMono/blob/master/OFL.txt).
- Apart from that, the rest of the elements (code, images, font) in this repository are under [MIT license]().
