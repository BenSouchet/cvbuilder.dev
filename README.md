# CVBuilder.dev <img src="https://raw.githubusercontent.com/BenSouchet/cvbuilder.dev/main/assets/logo-220x220.png" align="left" title="CVBuilder.dev" width="110" height="110">
_Write your CV/Resume Easily with HTML & CSS!_
<br />
<br />
<p align="center">
  <img src="https://visitor-badge.glitch.me/badge?page_id=BenSouchet.cvbuilder&left_text=Views" alt="Views Count" />
  <img src="https://www.repostatus.org/badges/latest/active.svg" alt="The project is being actively developed." />
</p>

**CVBuilder.dev** is a Web App that helps you you create your CV in HTML & CSS, it's written in pure JS and hosted by Github.

## Templates
There is multiple templates available, ready to use and perfect for a good start!

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

## Source Code
The whole source code is on the [`gh-pages` branch](https://github.com/BenSouchet/cvbuilder.dev/tree/gh-pages) of this repository.

## How it's working internally ?
The preview is a ***virtual sandboxed iFrame***, **virtual** because the iFrame doesn't point to a true file/page, and **sandboxed** to avoid code injection into the web app.

The editor blocks are currently instances of [Ace editor](https://github.com/ajaxorg/ace). The project will maybe move to [Code Mirror](https://github.com/codemirror/codemirror.next/) in the futur to improve CSS coverage.

The HTML to PDF is done by the combo of two libraries, first [html2canvas](https://github.com/niklasvh/html2canvas) to create an image (PNG) of the Preview in the form of an HTML canvas, then set this image into a PDF with [img2pdf](https://github.com/BenSouchet/img2pdf).

## Limitations
#### • Only One Page ?
Currently you can only work on one page at a time, if you have a multi pages resume to build:
1. Start by creating the first page, then save the HTML with the _Save As HTML_ button and _Export as PDF_
2. Edit the HTML content to create the next page, do the same thing _Save As HTML_ button and _Export as PDF_
3. Redo the opperation for every pages you need.
4. Then with a website like [ilovepdf.com](https://www.ilovepdf.com/merge_pdf) or [combinepdf.com](https://combinepdf.com/) combine the PDF pages into one single PDF.

Since you have saved as HTML all the pages you can import them back to **CVBuilder.dev** to edit them and re-export them as PDF.

#### • No Sass / SCSS ?
I haven't planned to add support for Sass / SCSS, Stylus or any other CSS preprocessor, this would require a step of convertion between the STYLE editor block and Preview.

And the major issue is when saving as an HTML file to be able to use it later, you will lose the preprocessor and get instead pure CSS. This would require replacing the export as HTML process with an export as JSON to be able to store HTML (for HEAD & BODY), and STYLE code without forget to store the format used (CSS, Sass, SCSS, ...).

If you want to dig into that and do a pull request to add this use feature, feel free 😊

#### • No Pug or Slim ?
Exactly the same answer as for the **Sass / SCSS** 🙂

#### • Why no User Login / session ?
Since the project is hosted on Github (via Github Pages), and use Jekyll, there is no server operations it's all client side JS code. This makes it impossible to have a User Session with login, saved files, back-ups. The maximum we can set is Local Storage ("successor" of cookies) to store some variables.

## Contributing
I actively encourage and support contributions.

Feel free to fork and improve/enhance **CVBuilder.dev** any way you want. If you feel that the web app and/or the community will benefit from your changes, please open a pull request.

You just created a stunning Resume and want to share it as a **template** for the community? Open a pull request.

You don't know how to contribute ? How to open a pull request ? No worries, [check this page!](https://github.com/BenSouchet/cvbuilder.dev/blob/main/CONTRIBUTING.md)

## Author / Maintainer
**CVBuilder.dev** has been created and is currently maintained by [Ben Souchet](https://github.com/BenSouchet).

## Licenses
- Third party libraries used for this project (in [`/assets/js/vendor/`](https://github.com/BenSouchet/cvbuilder.dev/tree/gh-pages/assets/js/vendor)) have there own licenses accessible in their respective sub-folders.
- The font used [`JetBrains Mono`](https://www.jetbrains.com/lp/mono/) is under the [SIL Open Font License 1.1](https://github.com/JetBrains/JetBrainsMono/blob/master/OFL.txt).
- Apart from that, the rest of the elements (code, images, font) in this repository are under [MIT license](https://github.com/BenSouchet/cvbuilder.dev/blob/main/LICENSE).
