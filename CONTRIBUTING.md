# Contribute

Interesting in contributing to the CVBuilder.dev project, you are on the right place.

**CVBuilder.dev** is always looking for new contributors, so don't be afraid to jump in and help!

There are soft spots in the code, which could use cleanup, refactoring, additional comments, and so forth. Let's try to raise the bar, and clean things up as we go. Try to leave code in a better shape than it was before.

## How to Contribute
If you are specifically looking on _**"How to add a new template to the template list?"**_ click [here](https://github.com/BenSouchet/cvbuilder.dev/blob/main/CONTRIBUTING.md#how-to-add-a-new-template-to-the-template-list-).

To test the web app locally on your branch check [this section](https://github.com/BenSouchet/cvbuilder.dev/blob/main/CONTRIBUTING.md#test-the-web-app-locally).

#### To contribute to this project or any other projects hosted on platform like Github you need to create a **pull request**.

## First time ? How to create a **pull request** ?
1. **Fork** the Github repository, Github describe forking like this:
> A fork is a copy of a repository. Forking a repository allows you to freely experiment with changes without affecting the original project.  

- To do that click the **Fork** button located on the top right corner of the github Interface, then on the new page confirm that by clicking the green **Create fork** button.
2. Now that a new repository (normally named `cvbuilder.dev`) has been created on your repository list, `git clone` this repository. In your terminal of predilection do:
```sh
git clone https://github.com/{YOUR_USERNAME}/cvbuilder.dev.git
```
- Of course replace `{YOUR_USERNAME}` with your github username.
3. Move to this repository:
```sh
cd cvbuilder.dev/
```
4. Create a new branch base on the `gh-pages` branch where the code is located:
```sh
git switch -c {MY_BRANCH_NAME} gh-pages
```
- `{MY_BRANCH_NAME}` need to be a string without space and used as a name that describe your contribution.
5. Do the modification / addition you want in this branch, to test the web app locally read [this section](https://github.com/BenSouchet/cvbuilder.dev/blob/main/CONTRIBUTING.md#test-the-web-app-locally).
6. Then when the modifications suit you and you want to push them, you do:
```sh
git add ./assets/js/modules/blocks.js
```
- In this example I add `./assets/js/modules/blocks.js` but you add the file(s) you have edited and/or added.
- After you commit with an explicit but concise message on what you have done:
```sh
git commit -m "Editing how Style block is handled to add Sass support"
```
- If it's the first time you want to push to this newly created branch you will need to do:
```sh
git push -u origin {MY_BRANCH_NAME}
```
Else you only do:
```sh
git push
```
7. You can do steps **5.** and **6.** multiple times to do multiples commits.
8. When the branch seems okay to you and you want to create the famous **pull request**, go [here](https://github.com/BenSouchet/cvbuilder.dev/pulls) in the top there should be a message in yellow asking if you want to create a **pull request**, click on the button.
9. In the new page enter a description of you pull request, then you can click to submit your **pull request**.
10. Done, the first time it's seems a difficult task but in really it's rather simple.

## Test the web app locally
The web app use Jekyll to be compiled/served as a static site.

0. Install the [Jekyll dependencies required](https://jekyllrb.com/docs/installation/#requirements).
1. Of course you need to `fork` and `clone` the repository (if not done already).
2. Like for "The steps to create a pull request", you need to create a new branch based on the `gh-pages` branch:
```sh
git switch -c {MY_BRANCH_NAME} gh-pages
```
4. Now run the following command (only required the first time to generate the `Gemfile.lock` file):
```sh
bundle install
```
5. And then to start the live server:
```sh
bundle exec jekyll serve --incremental --livereload
```
6. Now you can check the web app at : `http://127.0.0.1:4000`, if you do change normally this will trigger an regenerate of the app and reload your browser tab.
- Sometime regenerate isn't triggered, like editing a JS module located at `./assets/js/modules/`, in that case in your terminal stop the live server with CTRL+C (Control+C on MacOS) and then re-run the command of step **5.** 

## How to add a new template to the template list ?
To do that you will need to create a **pull request**, if you are not familiar with this process check [the detailed steps above](https://github.com/BenSouchet/cvbuilder.dev/blob/main/CONTRIBUTING.md#first-time--how-to-create-a-pull-request-).

Then regarding the edits you will need to make:
1. Choose a name that fit well the template you want to add, in the steps below this name is refered as `{TEMPLATE_NAME}`.
2. Then you will need two things: your template named `{TEMPLATE_NAME}.html` and a preview image of your template of size `322px` by `456px` named `{TEMPLATE_NAME}.jpg`.
- Please ensure it's a `.jpg` image not `.jpeg`, `.png`, `.webp`, ...
3. Now put the `.html` file in the `assets/templates/files/` folder.
4. Put the `.jpg` file in the `assets/templates/previews/` folder.
5. And final thing to do, add an entry in the `assets/templates/templates.json` file, formated like this:
```json
{
    "name": "{TEMPLATE_PRETTY_NAME}",
    "filename": "{TEMPLATE_NAME}",
    "author": {
        "name": "{YOUR_NAME_OR_PSEUDO}",
        "url": "{AN_URL_TO_YOUR_WEBSITE_OR_GITHUB_PROFIL}"
    }
}
```

- `{TEMPLATE_PRETTY_NAME}` is like `{TEMPLATE_NAME}` but you replace the `-` with spaces, you can add uppercase(s), ponctuation(s).  
**Example**: If `{TEMPLATE_NAME}` is `curly-lavender` then `{TEMPLATE_PRETTY_NAME}` would be `Curly Lavender`.
- /!\ If you don't want to share an url to one of your page enter an empty string `""`.
