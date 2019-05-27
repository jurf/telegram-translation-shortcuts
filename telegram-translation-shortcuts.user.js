// ==UserScript==
// @name         Telegram Translation Platform Shortcuts
// @namespace    https://github.com/jurf/telegram-translation-shortcuts
// @description  Adds useful keyboard shortcuts to the Telegram Translation Platform
// @include      https://translations.telegram.org/*
// @version      0.1.0
// @grant        none
// @downloadURL  https://github.com/jurf/telegram-translation-shortcuts/raw/master/telegram-translation-shortcuts.user.js
// @updateURL    https://github.com/jurf/telegram-translation-shortcuts/raw/master/telegram-translation-shortcuts.user.js
// ==/UserScript==

// Quick apply
document.addEventListener("keyup",
    function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementsByClassName("btn btn-sm btn-default key-status-apply-btn")[0].click();
            var e = new KeyboardEvent("keydown", {
                which: Keys.DOWN
            });
            LangKeys.onKeyDown(e);
        }
    }
);
