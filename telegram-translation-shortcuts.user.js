// ==UserScript==
// @name         Telegram Translation Platform Shortcuts
// @namespace    https://github.com/jurf/telegram-translation-shortcuts
// @description  Adds useful keyboard shortcuts to the Telegram Translation Platform
// @include      https://translations.telegram.org/*
// @version      0.2.1
// @grant        none
// @downloadURL  https://github.com/jurf/telegram-translation-shortcuts/raw/master/telegram-translation-shortcuts.user.js
// @updateURL    https://github.com/jurf/telegram-translation-shortcuts/raw/master/telegram-translation-shortcuts.user.js
// ==/UserScript==

/**
 * Gets the current app name
 */
function getCurrentApp() {
  crumbs = document.getElementById('breadcrumb').getElementsByTagName('li');
  if (crumbs.length < 2) {
    return null;
  }
  return crumbs[2].firstChild.firstChild.data;
}

/**
 * Returns the list of binding buttons, if available
 */
function getBindings() {
  return Array.from(document.getElementsByClassName('binding-item'));
}

/**
 * Returns the selected binding button
 */
function getCurrentBinding() {
  return document.getElementsByClassName('binding-item binding-item-current').item(0);
}

/**
 * Handles shortcuts
 * @param {KeyboardEvent} e - event to handle
 */
function handleShortcut(e) {
  // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
  if (e.target.classList.contains('form-control')) {
    // Don't override in input forms
    return;
  }
  switch (e.key) {
    case 'Tab':
      e.preventDefault();
      cycleBindings(!e.shiftKey);
      break;
    case 'PageDown':
      e.preventDefault();
      scrollItems(true);
      break;
    case 'PageUp':
      e.preventDefault();
      scrollItems(false);
      break;
    case 'Enter':
      if (e.ctrlKey) {
        e.preventDefault();
        quickApply();
      }
      break;
  }
}

/**
 * Applies the most popular translation, switches to next item
 */
function quickApply() {
  var currentRow = document.getElementsByClassName('tr-key-row-wrap open').item(0);
  if (currentRow === null) {
    return;
  }

  // Click 'Apply'
  buttons = currentRow.getElementsByClassName('btn btn-sm btn-default key-status-apply-btn')
  for (var i = 0; i < buttons.length; i++) {
    if (buttons[i].offsetParent === null) {
      // Apply button not visible; ignore
      continue;
    }
    buttons[i].click();
    break;
  }

  if (getCurrentBinding() === null) {
    scrollItems(true);
  } else {
    cycleBindings(true);
  }
}

/**
 * Scrolls to lower/upper item
 * @param {Boolean} down - scolls down if true, up if false
 */
function scrollItems(down) {
  // HACK: Replace this with clicking maybe?
  if (down) {
    LangKeys.onKeyDown(new KeyboardEvent('keydown', { which: Keys.DOWN }));
  } else {
    LangKeys.onKeyDown(new KeyboardEvent('keydown', { which: Keys.UP }));
  }
}

/**
 * Cycles through bindings
 * @param {boolean} forward - cycles forward if true, backwards if false
 */
function cycleBindings(forward) {
  bindings = getBindings();
  if (bindings.length < 1) {
    return;
  }
  i = bindings.indexOf(getCurrentBinding());

  if (forward) {

    if (i < bindings.length - 1) {
      bindings[i + 1].click();
    } else {
      bindings[0].click();
    }

  } else {

    if (0 < i) {
      bindings[i - 1].click();
    } else {
      bindings[bindings.length - 1].click();
    }

  }
}

/**
 * Bootstraps the userscipt
 */
function main() {
  document.addEventListener('keydown', handleShortcut);
}

main();
