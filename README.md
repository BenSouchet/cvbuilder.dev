# Source Code of CVBuilder.dev

_Welcome to the Source Code branch!_

![source_code_banner](https://user-images.githubusercontent.com/17025808/172051639-1dca3c55-7a5a-44eb-87e3-c365621edb8d.jpg)


The main README of the project is located [here](https://github.com/BenSouchet/cvbuilder.dev).

## Code Documentation
In the next sections find more information about what is done by the different JavaScript files.

### # `assets/js/main.js`
It's the entry point for the JS code, all the modules are imported into this file.
- Firtly `_preInitSwitchToDark()` is called to add a classname to the `<html>` tag in case user prefer a dark theme.
- Then at the end of the file we wait until the Document is fully loaded to be able to call `initialization()`.
- The initialization function simply create the `AppController()`, this controller as the name indicates is the main one that will "control" the whole web app.  
It's the parent of all other controllers since it's created the instance of the other ones.  
It's will receive _events_ and _callbacks_ and handle them.  
In the constructor, the instances creation order of the modules are very important to avoid _events_ or _callbacks_ to be send and handled before the linked controller instance exists.

### # `assets/js/modules/actions.js`
This file store the controller that handle the topbar _actions_ (see [here](https://github.com/BenSouchet/cvbuilder.dev#usage--information) for more details).
- There is two dependencies required `html2canvas` and `img2pdf`, they are used in `actionSaveAsPDF()` to be able to convert the HTML result into a PDF.

### # `assets/js/modules/blocks.js`
This file store the controller that manage the editor blocks located on the right side of the interface. These blocks are used by the user to define/write the content of sections of an HTML file, this file is the representation of a A4 CV/Resume.
- There is three blocks defined: `Body`, `Head`, `Style`. They represent the following HTML DOM elements: `<body>`, `<head>`, `<style>`.
- The editor blocks are instance of [Ace editor](https://github.com/ajaxorg/ace), so this file require the ace library as dependency.
- The controller define the `generateStringHTML()` method used by other controllers to retrieve the full HTML code of the preview.
- In this file is also present the `ErrorsController`, the controller that manage the error list for the blocks.

### # `assets/js/modules/popup.js`
This file store the controller (with API methods) that handle the popup, the popup is `open` & `close` by in certain situations, for example when there are block(s) errors while the user wants to _Save as HTML_. Or when the user click on a template to see the preview.
- The popup `open()` method as lots of parameters to be able to fully customize the result, and the content you pass is an HTML string so you can set complexe hierarchy.

### # `assets/js/modules/preview.js`
This file define not one but four controllers, the main one (and also the one that is exposed) is the preview controller used to create and handle the iFrame used to live preview the result. And three others related to the user's interactions:
- `wheelController` for mouse wheel events (caution: a trackpad `pinch` trigger a wheel event).
- `MoveController` for drag event in `Move Mode` and trackpad pan.
- `ZoomController` to handle zoom related operations on the preview iFrame.

The preview controller also define the methods for the **preview tools** described [here](https://github.com/BenSouchet/cvbuilder.dev#usage--information).

To mimic to PDF preview tools of **Adobe Reader / Acrobat** the `toolFitWidth()` and `toolFitFull` requires the concept of `Mode` (see [here](https://github.com/BenSouchet/cvbuilder.dev/blob/58a8d46d8f64726a738bc2a7cbf42c83a40e8105/assets/js/modules/preview.js#L12)).

### # `assets/js/modules/resize.js`
This file define the `Resizer` class used to create horizontal or/and vertical resize element that control the dimension of a HTML element.
- There is a lot of parameters possible when creating a new instance to be able to truly craft the perfect resize element.

### # `assets/js/modules/templates.js`
This file store the controller that manage the templates logic, a `template` is an HTML file that can be used as a starting point to create your own CV/Resume.
- All template need to have an entry in the `assets/templates/templates.json` file to be recognize by the web app.
- In addition to the entry in the JSON file all templates need to be stored in `assets/templates/files` as an `.html` file and need to have a valid preview image (`.jpg`) stored in `assets/templates/previews`.
- By default when visit the website a random template from the JSON list is loaded (`applyRandomTemplate()`).
- The templates are displayed in the **TEMPLATES** block in the UI, when you click on one template this display a popup with a preview and you have a button to Apply the template (`previewTemplate()`).

### # `assets/js/modules/theme.js`
This file define the `Switcher` class used for switch the web app theme between **dark** and **light**.
- By default the web app use the **light** colors, but if the class `.dark` is set to the `<html>` tag the **dark** colors are used.
- When the user click to switch the new value is stored in is browser Local Storage, Local Storage can be clear when browsing cache is cleared.

## Local Preview
To test the web app locally the steps are:
1. Install [Jekyll requirements](https://jekyllrb.com/docs/installation/).
2. git clone the source code branch with:
```sh
git clone -b gh-pages --single-branch https://github.com/BenSouchet/cvbuilder.dev.git
```
3. Go in the newly created folder with `cd cvbuilder.dev/` and Install the project dependencies with:
```sh
bundle install
```
4. Then to start the live server do:
```sh
bundle exec jekyll serve --incremental --livereload
```
5. _Voilà_, now you can check the web app at : [`http://127.0.0.1:4000`](http://127.0.0.1:4000), if you do change normally this will trigger a re-generation of the app and reload your browser tab.
- Sometime regenerate isn't triggered, like editing a JS module located at `./assets/js/modules/`, in that case in your terminal stop the live server with <kbd>CTRL</kbd>+<kbd>C</kbd> (<kbd>Control</kbd>+<kbd>C</kbd> on MacOS) and then re-run the command of step **4**.
