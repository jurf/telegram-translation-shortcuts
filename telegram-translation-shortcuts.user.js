// ==UserScript==
// @name         Telegram Translation Platform Shortcuts
// @namespace    https://github.com/jurf/telegram-translation-shortcuts
// @description  Adds useful keyboard shortcuts to the Telegram Translation Platform
// @author       Juraj Fiala
// @include      https://translations.telegram.org/*
// @version      0.4.4
// @grant        none
// @run-at       document-start
// @downloadURL  https://github.com/jurf/telegram-translation-shortcuts/raw/master/telegram-translation-shortcuts.user.js
// @updateURL    https://github.com/jurf/telegram-translation-shortcuts/raw/master/telegram-translation-shortcuts.user.js
// ==/UserScript==

/* global alert, MutationObserver, Keys */
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

// https://gist.github.com/ejoubaud/7d7c57cda1c10a4fae8c
var Podium = {}

Podium.keydown = function (k) {
  var oEvent = document.createEvent('KeyboardEvent')

  // Chromium Hack
  Object.defineProperty(oEvent, 'keyCode', {
    get: function () {
      return this.keyCodeVal
    }
  })
  Object.defineProperty(oEvent, 'which', {
    get: function () {
      return this.keyCodeVal
    }
  })

  if (oEvent.initKeyboardEvent) {
    oEvent.initKeyboardEvent('keydown', true, true, document.defaultView, k, k, '', '', false, '')
  } else {
    oEvent.initKeyEvent('keydown', true, true, document.defaultView, false, false, false, false, k, 0)
  }

  oEvent.keyCodeVal = k

  if (oEvent.keyCode !== k) {
    alert('keyCode mismatch ' + oEvent.keyCode + '(' + oEvent.which + ')')
  }

  document.body.dispatchEvent(oEvent)
}

// Podium.keydown(40); // for arrow-down, arrow-up is 38

/**
 * Scrolls to lower/upper item
 * @param {Boolean} down - scolls down if true, up if false
 */
function scrollItems (down) {
  // HACK: Replace this with clicking maybe?
  if (down) {
    // passing a constructed KeyboardEvent() object does not work in chromium
    Podium.keydown(Keys.DOWN)
    // LangKeys.onKeyDown(new KeyboardEvent('keydown', { which: Keys.DOWN }))
  } else {
    Podium.keydown(Keys.UP)
    // LangKeys.onKeyDown(new KeyboardEvent('keydown', { which: Keys.UP }))
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
    focusOut() // change focus
  } else
  if (inCommentField()) {
    const formbtns = document.activeElement.nextElementSibling.children.item(0).children
    document.activeElement.form.reset()
    formbtns.item(1).click() // Clicks 'cancel' for animation
    focusOut() // change focus
    // document.getElementsByClassName('key-suggestion-value-wrap').item(activeCommentItem).click() // Collapse the comments
  }
}

// Using MutationObserver to observe when the suggestion box is 'collapsed'
// and then change focus() to a non-form non-clickable element
function focusOut () {
  const addwrap = document.querySelector('.key-add-suggestion-wrap')

  const observer = new MutationObserver(function (mutationList) {
    // addwrap's class has changed
    document.getElementsByClassName('key-suggestion-value-box')[0].focus() // prevent re-submit on 'Enter' by changing focused element
    observer.disconnect()
  })

  observer.observe(addwrap, {
    attributeFilter: ['class'],
    attributeOldValue: false
  })
}

/**
 * Clicks the submit button and jumps down to next phrase
 */
function submitScrollDown () {
  const addwrap = document.querySelector('.key-add-suggestion-wrap')
  const observer = new MutationObserver(() => {
    // addwrap's class has changed
    if (inSuggestionField()) {
      scrollItems(true)
      document.getElementsByClassName('key-suggestion-value-box')[0].focus()
    }
    observer.disconnect()
  })
  observer.observe(addwrap, {
    attributeFilter: ['class'],
    attributeOldValue: false
  })
}

/**
 * parses window.location.href and returns an array
 * @returns {array} [langname, appname, stringname]
 */
function fromUrl () {
  const fromurlmatches = window.location.href.match(/\.org\/([\w-]+)\/(android_x|ios|tdesktop|macos|android)?(?:.*\/)?([\w._]+$)?/)
  const langname = fromurlmatches[1]
  const appname = fromurlmatches[2]
  const stringname = fromurlmatches[3]
  return [langname, appname, stringname]
}

// works on chromium
function searchSelection () {
  const selection = window.getSelection()
  if (selection.isCollapsed) return
  const text = selection.toString()
  const host = 'https://translations.telegram.org/'
  const langname = fromUrl()[0]
  const searchurl = host + langname + '/search?&query=' + encodeURI(text)
  window.open(searchurl, '_blank')
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
 * Selects/Unselects all modified phrases on the import page.
 */
function importSelectAll () {
  var phrases = document.getElementsByClassName('tr-plain-key-row') // phrases to be edited
  var total = phrases.length > 50 ? 50 : phrases.length
  if (total === document.getElementsByClassName('tr-plain-key-row selected').length) {
    var selectedAll = true
  }
  for (let i = 0; i < total; i++) {
    if (selectedAll) {
      phrases.item(i).click() // unselect all phrases
    } else {
      if (!phrases.item(i).classList.contains('selected')) {
        phrases.item(i).click() // select some more phrases
      }
    }
  }
  // Append count of selected strings
  // const selected = document.getElementsByClassName('tr-plain-key-row selected').length
  // $('.change-selected-btn').html(selected + ' Edit Selected')
  // Maybe use mutation observer to change the count of selected strings
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
            cancel() // needs "@run-at  document-start" to work
          } else return
          break
        case 'Enter':
          if (e.ctrlKey) {
            submitScrollDown()
          }
          break
        default:
          return
      }
    }
    return // finish handling shortcuts in this context
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
    case 'k':
      if (!e.ctrlKey) scrollItems(true)
      break
    case 'PageDown':
      scrollItems(true)
      break

    case 'j':
      if (!e.ctrlKey) scrollItems(false); else matchedKey = false
      break
    case 'PageUp':
      scrollItems(false)
      break

    // Add translation OR select/deselect all phrases on import page
    case 'a':
      if (e.ctrlKey) {
        if (window.location.href.includes('/import')) {
          importSelectAll()
        } else {
          addTranslation()
        }
      } else matchedKey = false
      break

    // Add new translation
    case 'i':
      if (!e.ctrlKey) addTranslation(); else matchedKey = false
      break

    // Search selected text
    case 'C':
      if (e.shiftKey && e.ctrlKey) {
        e.stopImmediatePropagation()
        e.preventDefault()
        searchSelection()
      } else matchedKey = false
      break

    // Edit translation
    case 'c':
      if (!e.ctrlKey) {
        editTranslation()
      } else matchedKey = false // allow ctrl+c to copy
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
 * Observes if the page has changed and calls runAtDocumentLoadProgressComplete()
 */
function AttachMutationProgress () {
  // Watch progress bar to detect loading of new page
  const ajprogressbar = document.querySelector('#aj_progress')
  var progressObserver = new MutationObserver(function (mutationList) {
    mutationList.forEach(function (mutation) {
      if (mutation.oldValue === 'width: 100%; transition: width 0.3s linear 0s, box-shadow 0.2s ease 0s; position: fixed; z-index: 1000; top: 0px; height: 3px; box-shadow: rgb(57, 173, 231) 0px 2px 0px inset;') {
        if (mutation.target.style.boxShadow === 'rgb(57, 173, 231) 0px 0px 0px inset') {
          console.log('=== Page changed/reloaded ===')
          runAtDocumentLoadProgressComplete()
        } else if (mutation.target.style.boxShadow === 'rgb(57, 173, 231) 0px 0px 0px 0px inset') {
          console.log('=== Page changed/reloaded with 4 x 0px boxShadow ===')
          runAtDocumentLoadProgressComplete()
        }
      }
    })
  })
  progressObserver.observe(ajprogressbar, {
    attributeFilter: ['style'],
    attributeOldValue: true
  })
}

/**
 * Runs when page has loaded with ajax / blue page loading progress bar
 */
function runAtDocumentLoadProgressComplete () {
  // run something everytime new content loads
}

/**
 * Bootstraps the userscript
 */
function init () {
  document.addEventListener('keydown', handleShortcut)

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      // run when page fully loaded first time
      AttachMutationProgress()
      runAtDocumentLoadProgressComplete()
    })
  }
}

init()
