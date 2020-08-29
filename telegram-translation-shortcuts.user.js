// ==UserScript==
// @name         Telegram Translation Platform Shortcuts
// @namespace    https://github.com/jurf/telegram-translation-shortcuts
// @description  Adds useful keyboard shortcuts to the Telegram Translation Platform
// @author       Juraj Fiala
// @include      https://translations.telegram.org/*
// @version      0.4.1
// @grant        none
// @run-at       document-start
// @downloadURL  https://github.com/jurf/telegram-translation-shortcuts/raw/master/telegram-translation-shortcuts.user.js
// @updateURL    https://github.com/jurf/telegram-translation-shortcuts/raw/master/telegram-translation-shortcuts.user.js
// ==/UserScript==

/* global LangKeys, KeyboardEvent, Keys */
// var activeCommentItem = 0

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
 * Cycles through Linked Phrases (bindings)
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
 * Returns elements with class 'form-cancel-btn'
 */
function getCancelBtns () {
  return document.getElementsByClassName('form-cancel-btn')
}

/**
 * Returns elements with class 'form-submit-btn'
 */
function getSubmitBtns () {
  return document.getElementsByClassName('form-submit-btn')
}

/**
 * @returns {number} 0 if translator, else item-number of the last 'form-submit-btn'
 * (works on pages with "Add Translation" button)
 */
function isTranslator () {
  return ((getSubmitBtns().item(0).innerHTML.toString().match('.*Apply') !== null) ? 0 : getSubmitBtns().length - 1)
  // 'Add Translation' form buttons come first if you're translator; else last btn is of Add Translation
}

/**
 * Returns whether ActiveElement is 'key-add-suggestion-field'
 */
function inSuggestionField () {
  return document.activeElement.classList.contains('key-add-suggestion-field')
}

/**
 * Returns whether activeElement is 'comment-field'
 */
function inCommentField () {
  // activeCommentItem = Array.from(document.getElementsByClassName('comment-field')).indexOf(document.activeElement)
  return document.activeElement.classList.contains('comment-field')
}

/**
 * The wrapper ('key-add-suggestion-wrap') contains elements needed to submit a new translation.
 * If the wrapper is closed, it's class-name changes to 'key-add-suggestion-wrap collapsed'
 *
 * @returns True if open; and will focus to the input-form
 * @returns False if collapsed/closed
 */
function isInputTranslationOpen () {
  if (document.getElementsByClassName('key-add-suggestion-wrap')[0].className === 'key-add-suggestion-wrap') {
    document.getElementsByClassName('tr-form-control').item(0).focus(); return true
  } else return false
}

/**
 * Clicks the 'Add Translation' button
 */
function addTranslation () {
  // Prevent toggle behaviour when clicking: focus to input if already open
  if (!isInputTranslationOpen()) {
    document.getElementsByClassName('key-add-suggestion-header').item(0).click()
  }
}

/**
 * Clicks the edit icon.
 * Useful when a suggestion exists but no translation is applied.
 */
function editTranslation () {
  // Don't edit if wrap was open: focus to its input
  if (!isInputTranslationOpen()) {
    document.getElementsByClassName('ibtn key-suggestion-edit').item(0).click()
  }
}

/**
 * Clicks the cancel button
 */
function cancel () {
  if (inSuggestionField()) {
    const ZeroOrLast = isTranslator() // 0 if translator
    getCancelBtns().item(ZeroOrLast).click()
    getCancelBtns().item(ZeroOrLast).focus() // Don't let input keep focus & prevent other shortcuts
  } else
  if (inCommentField()) {
    const formbtns = document.activeElement.nextElementSibling.children.item(0).children
    document.activeElement.form.reset()
    formbtns.item(1).click() // Clicks 'cancel' for animation
    // document.getElementsByClassName('key-suggestion-value-wrap').item(activeCommentItem).click() // Collapse the comments
  }
}

/**
 * Clicks the submit button
 */
function submit () {
  if (inSuggestionField()) {
    const ZeroOrLast = isTranslator()
    getSubmitBtns().item(ZeroOrLast).click()
    getCancelBtns().item(ZeroOrLast).focus() // Focus to cancel button to prevent re-submit on 'Enter' keypress
  } else
  if (inCommentField()) {
    const formbtns = document.activeElement.nextElementSibling.children.item(0).children
    if (formbtns.item(0).classList.contains('form-submit-btn')) {
      formbtns.item(0).focus() // Good UX
      formbtns.item(0).click() // Send
    } // ignore?
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

  // Be smart and cycle linked phrases if they're available
  if (getCurrentBinding() == null) {
    scrollItems(true)
  } else {
    cycleBindings(true)
  }
}

/**
 * Focus on current context search field
 */
function openSearch () {
  var isPopupHidden = document.getElementsByClassName('popup-container').item(0).classList.contains('hide')
  if (isPopupHidden | undefined | null) {
    document.getElementsByClassName('header-search-btn').item(0).click()
  } else {
    document.getElementsByClassName('tr-popup-search-field').item(0).focus()
  }
}

/**
 * If the event matches a shortcut, launches it
 * @param {KeyboardEvent} e - event to handle
 */
function handleShortcut (e) {
  if (!e.isTrusted) return // Only accept events from humans
  const eClassList = e.target.classList
  // INSIDE FORM INPUTS
  if (eClassList.contains('form-control')) {
    // Only within translation / comment inputs
    if (eClassList.contains('tr-form-control') || eClassList.contains('comment-field')) {
      // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
      switch (e.key) {
        // Cancel
        case 'Escape': // Try to Use 'Escape | Esc' inside an if()
          if (!e.ctrlKey) {
            e.stopImmediatePropagation()
            e.preventDefault()
            cancel() // needs @run-at  document-start to work
          } else return
          break

        // Submit or Send
        case 'Enter':
          if (e.ctrlKey) {
            e.stopImmediatePropagation()
            e.preventDefault()
            submit()
          } else return
          break

        default:
          return
      }
    }
    return // Don't handle any other shortcuts
  }

  // OUTSIDE INPUT FORMS
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
    // Cycle linked phrases
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
      if (!e.ctrlKey && document.activeElement.classList.contains('form-submit-btn')) {
        e.stopImmediatePropagation() // prevent form-resubmit
      } else if (e.ctrlKey) {
        quickApply(-1)
      } else matchedKey = false
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
