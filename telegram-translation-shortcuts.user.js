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
document.addEventListener('keyup', handleEvent);

function handleEvent(e) {
  if (e.key === 'Enter') {
    event.preventDefault();
    applyString();
  }
}

function applyString() {
  document
      .getElementsByClassName('btn btn-sm btn-default key-status-apply-btn')[0]
      .click();
  LangKeys.onKeyDown(new KeyboardEvent('keydown', {which: Keys.DOWN}));
}
