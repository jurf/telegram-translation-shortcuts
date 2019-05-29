// ==UserScript==
// @name         Telegram Translation Platform Shortcuts
// @namespace    https://github.com/jurf/telegram-translation-shortcuts
// @description  Adds useful keyboard shortcuts to the Telegram Translation Platform
// @include      https://translations.telegram.org/*
// @version      0.3.1
// @grant        none
// @downloadURL  https://github.com/jurf/telegram-translation-shortcuts/raw/master/telegram-translation-shortcuts.user.js
// @updateURL    https://github.com/jurf/telegram-translation-shortcuts/raw/master/telegram-translation-shortcuts.user.js
// ==/UserScript==

/* global LangKeys, KeyboardEvent, Keys */

/**
 * Returns the current app name (not yet used)
 *
function getCurrentApp () {
  var crumbs = document.getElementById('breadcrumb').getElementsByTagName('li')
  if (crumbs.length < 2) return null
  return crumbs[2].firstChild.firstChild.data
}
*/

/**
 * Returns the list of binding buttons, if available
 */
function getBindings () {
  return Array.from(document.getElementsByClassName('binding-item'))
}

/**
 * Returns the selected binding button
 */
function getCurrentBinding () {
  return document.getElementsByClassName('binding-item binding-item-current').item(0)
}

/**
 * Cycles through bindings
 * @param {boolean} forward - cycles forward if true, backwards if false
 */
function cycleBindings (forward) {
  var bindings = getBindings()
  if (bindings.length < 1) return
  var i = bindings.indexOf(getCurrentBinding())

  if (forward) {
    if (i < bindings.length - 1) bindings[i + 1].click()
    else bindings[0].click() // Jump to beginning
  } else {
    if (i > 0) bindings[i - 1].click()
    else bindings[bindings.length - 1].click() // Jump to end
  }
}

/**
 * Scrolls to lower/upper item
 * @param {Boolean} down - scolls down if true, up if false
 */
function scrollItems (down) {
  // HACK: Replace this with clicking maybe?
  if (down) {
    LangKeys.onKeyDown(new KeyboardEvent('keydown', { which: Keys.DOWN }))
  } else {
    LangKeys.onKeyDown(new KeyboardEvent('keydown', { which: Keys.UP }))
  }
}

/**
 * Clicks the 'Add Translation' button
 */
function addTranslation () {
  document.getElementsByClassName('key-add-suggestion-header').item(0).click()
}

/**
 * Clicks the edit icon
 */
function editTranslation () {
  document.getElementsByClassName('ibtn key-suggestion-edit').item(0).click()
}

/**
 * Applies the most popular translation, switches to next item
 *
 * @param {number} index - most popular if negative, specific if positive
 */
function quickApply (index) {
  var currentRow = document.getElementsByClassName('tr-key-row-wrap open').item(0)
  if (currentRow == null) return

  // Click 'Apply'
  var buttons = currentRow.getElementsByClassName('btn btn-sm btn-default key-status-apply-btn')
  if (index > -1 && buttons[index].offsetParent != null) {
    // If we have a specific index, press that
    buttons[index].click()
  } else {
    // If not, press the first usable one
    for (var i = 0; i < buttons.length; i++) {
      // Apply button not visible; ignore
      if (buttons[i].offsetParent == null) continue

      buttons[i].click()
      break
    }
  }

  // Be smart and cycle bindings if they're available
  if (getCurrentBinding() == null) {
    scrollItems(true)
  } else {
    cycleBindings(true)
  }
}

/**
 * Clicks the search icon
 */
function openSearch () {
  document.getElementsByClassName('header-search-btn').item(0).click()
}

/**
 * If the event matches a shortcut, launches it
 * @param {KeyboardEvent} e - event to handle
 */
function handleShortcut (e) {
  // Don't override in input forms
  if (e.target.classList.contains('form-control')) return

  var matchedCode = true
  // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code#Code_values
  switch (e.code) {
    // Apply specific translation
    case 'Digit1':
      quickApply(0)
      break
    case 'Digit2':
      quickApply(1)
      break
    case 'Digit3':
      quickApply(2)
      break
    case 'Digit4':
      quickApply(3)
      break
    case 'Digit5':
      quickApply(4)
      break
    default:
      matchedCode = false
  }

  var matchedKey = true
  // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
  switch (e.key) {
    // Cycle bindings
    case 'l':
      if (!e.ctrlKey) cycleBindings(true)
      break
    case 'h':
      if (!e.ctrlKey) cycleBindings(false)
      break
    case 'Tab':
      cycleBindings(!e.shiftKey)
      break

    // Scroll items
    case 'j':
      if (!e.ctrlKey) scrollItems(true)
      break
    case 'PageDown':
      scrollItems(true)
      break

    case 'k':
      if (!e.ctrlKey) scrollItems(false)
      break
    case 'PageUp':
      scrollItems(false)
      break

    // Add new translation
    case 'i':
      if (!e.ctrlKey) addTranslation()
      break
    case 'a':
      if (e.ctrlKey) addTranslation()
      break

    // Edit translation
    case 'c':
      if (!e.ctrlKey) editTranslation()
      break
    case 'e':
      if (e.ctrlKey) editTranslation()
      break

    // Confirm top translation
    case 'y':
      if (!e.ctrlKey) quickApply(-1)
      break
    case 'Enter':
      if (e.ctrlKey) quickApply(-1)
      break

    // Open search
    case '/':
      openSearch()
      break

    default:
      matchedKey = false
  }

  if (matchedCode || matchedKey) e.preventDefault()
}

/**
 * Bootstraps the userscript
 */
function init () {
  document.addEventListener('keydown', handleShortcut)
}

init()
