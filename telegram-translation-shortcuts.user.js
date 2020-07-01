// ==UserScript==
// @name         Telegram Translation Platform Shortcuts
// @namespace    https://github.com/jurf/telegram-translation-shortcuts
// @description  Adds useful keyboard shortcuts to the Telegram Translation Platform
// @Author       Juraj Fiala
// @include      https://translations.telegram.org/*
// @version      0.3.2
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
 * A div (key-add-suggestion-wrap) contains the input-form to Add translation with Submit and Cancel buttons
 * This function will check if that div is collapsed or not. If it is collapsed,
 * it's className will change to 'key-add-suggestion-wrap collapsed'
 *
 * @function inputWrapCollapsed() -- Checks if element by class 'key-add-suggestion-wrap' is exactly the same. If not the same, then it is collapsed
 * @returns True if collapsed
 * @returns False if NOT collapsed
 */
function inputWrapCollapsed () {
  if (document.getElementsByClassName('key-add-suggestion-wrap')[0].className === 'key-add-suggestion-wrap') { // checking if it is NOT collapsed
    return false
  } else return true
}

/**
 * Clicks the 'Add Translation' button
 */
function addTranslation () {
  if (!inputWrapCollapsed()) { // Don't toggle 'add' and 'cancel'
    document.getElementsByClassName('key-add-suggestion-header').item(0).click()
  } else { // Give focus back to input box (don't lose what was typed)
    document.getElementsByClassName('input form-control tr-form-control key-add-suggestion-field').item(0).focus()
  }
}

/**
 * Clicks the edit icon.
 * Useful when a suggestion exists but no translation is applied.
 */
function editTranslation () {
  // Don't click if already typing something
  if (!inputWrapCollapsed()) {
    document.getElementsByClassName('ibtn key-suggestion-edit').item(0).click()
  } else { // Give focus back to input box (don't lose what was typed)
    document.getElementsByClassName('input form-control tr-form-control key-add-suggestion-field').item(0).focus()
  }
}

/**
 * Clicks the cancel button
 */
function cancelTranslation () {
  // Prevent possible glitch: Don't cancel if wrapper is collapsed, but focus is in a 'form-control' element
  if (!inputWrapCollapsed) {
    // Don't allow input-forms to keep the focus after cancel or else shortcuts won't work
    document.getElementsByClassName('btn btn-default form-cancel-btn').item(0).focus()
    document.getElementsByClassName('btn btn-default form-cancel-btn').item(0).click()
  }
}

/**
 * Clicks the submit button
 */
function submitTranslation () {
  // Prevent possible glitch: Don't submit if wrapper is collapsed, but focus is in a 'form-control' element
  if (!inputWrapCollapsed()) {
    document.getElementsByClassName('btn btn-primary form-submit-btn').item(0).focus()
    document.getElementsByClassName('btn btn-primary form-submit-btn').item(0).click()
  }
}

/**
 * Clicks the delete icon of selected suggestion (not yet used)
 * @param {number} selected - Suggestion item which is in focus/selected
 *
function deleteSuggestion (selected) {
  if (selected != null) {
    document.getElementsByClassName('ibtn key-suggestion-delete').item(selected).click()
  }
} */

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
  // Handle shortcuts inside input forms
  if (e.target.classList.contains('form-control')) {
    // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
    switch (e.key) {
      // Cancel translation
      case 'Escape' | 'Esc':
        if (!e.ctrlKey) {
          e.stopImmediatePropagation()
          cancelTranslation() // FIXME: Doesn't work in search results
        }
        break

      // Submit translation
      case 'Enter':
        if (e.ctrlKey) submitTranslation()
        break

      default:
        return // Don't try to handle below shortcuts inside input forms
    }
  }

  // Handle shortcuts outside input forms
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
      if (!e.ctrlKey) cycleBindings(true); else matchedKey = false
      break
    case 'h':
      if (!e.ctrlKey) cycleBindings(false); else matchedKey = false
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
      if (!e.ctrlKey) scrollItems(false); else matchedKey = false
      break
    case 'PageUp':
      scrollItems(false)
      break

    // Add new translation
    case 'i':
      if (!e.ctrlKey) addTranslation(); else matchedKey = false
      break
    case 'a':
      if (e.ctrlKey) addTranslation(); else matchedKey = false
      break

    // Edit translation
    case 'c':
      if (!e.ctrlKey) editTranslation(); else matchedKey = false // allow ctrl+c to copy
      break
    case 'e':
      if (e.ctrlKey) editTranslation()
      break

    // Confirm top translation
    case 'y':
      if (!e.ctrlKey) quickApply(-1); else matchedKey = false
      break
    case 'Enter':
      if (e.ctrlKey) quickApply(-1); else matchedKey = false
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
