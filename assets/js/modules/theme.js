const Theme = (function() { return { Switcher:
class ThemeSwitcher {
    checkboxElem;

    constructor(elementID, callbackThemeChanged) {
        this.checkboxElem = document.getElementById(elementID);
        if (document.documentElement.classList.contains('dark')) {
            this.checkboxElem.checked = true;
        }

        this._callbackThemeChanged = callbackThemeChanged;

        // Add event listener when user click to switch theme
        this.checkboxElem.addEventListener('change', this.onClick.bind(this));
    }

    isDark() {
        return this.checkboxElem.checked;
    }

    switchToDark(darkBoolean) {
        // Update the UI
        this.checkboxElem.checked = darkBoolean;

        this._callbackThemeChanged(darkBoolean);

        // Add or remove the CSS class to the HTML
        if (darkBoolean) {
            if (!document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.add('dark');
            }
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    onClick(event) {
        localStorage.setItem('theme', event.srcElement.checked ? 'dark' : 'light');
        this.switchToDark(event.srcElement.checked);
    }
}}})();