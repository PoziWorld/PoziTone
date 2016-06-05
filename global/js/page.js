/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2016 PoziWorld
  License                 :           pozitone.com/license
  File                    :           global/js/page.js
  Description             :           Page JavaScript

  Table of Contents:

    Page
      init()
      addDevelopersMessageEventListeners()
      localize()
      template()
      showSuccess()
      closeDevelopersMessage()
      trackPageView()
      initStickyElement()
      toggleElement()
    Events

 ============================================================================ */

const strNotShownElementClass = 'none';

// code.tutsplus.com/tutorials/from-jquery-to-javascript-a-reference--net-23703
var addEvent = (function () {
  var filter = function( el, type, fn ) {
    for ( var i = 0, len = el.length; i < len; i++ )
      addEvent( el[i], type, fn );
  };

  if ( document.addEventListener )
    return function ( el, type, fn ) {
      if ( el && el.nodeName || el === window )
        el.addEventListener( type, fn, false );
      else if ( el && el.length )
        filter( el, type, fn );
    };
})();

/* =============================================================================

  Page

 ============================================================================ */

var Page = {
    strDevelopersMessageId          : 'pwMessage'
  , strDevelopersMessageCloseCtaId  : 'pwMessageCloseCta'
  , strDevelopersMessageReadCtaId   : 'pwMessageReadCta'
  ,

  /**
   * Initialize
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  init : function() {
    setTimeout(
        function() {
          Global.checkForDevelopersMessage( true );
        }
      , 0
    );
  }
  ,

  /**
   * Add event listeners
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  addDevelopersMessageEventListeners : function() {
    addEvent(
        document.getElementById( this.strDevelopersMessageCloseCtaId )
      , 'click'
      , function() {
          Page.closeDevelopersMessage();
        }
    );

    // When message from developers is shown
    addEvent(
        document.getElementById( this.strDevelopersMessageReadCtaId )
      , 'click'
      , function( objEvent ) {
          var strUrl  = strConstMessageUrl
                          .replace(
                              strConstVersionParam
                            , strConstExtensionVersion
                          )
                          .replace(
                              strConstLangParam
                            , strConstExtensionLanguage
                          );

          strUrl += Log.strJoinUeip;

          // Track clicks
          chrome.runtime.sendMessage(
            {
                strReceiver     : 'background'
              , strLog          : 'browserAction.toolbar'
              , objVars         : {
                    strAction   : 'readMessage'
                  , strPage     : strPage
                  , strUrl      : strUrl
                }
            }
          );

          Global.createTabOrUpdate( strUrl );
        }
    );
  }
  ,

  /**
   * Localize page
   *
   * @type    method
   * @param   strPageName
   *            Page name
   * @param   strCustomSelectorParent
   *            Optional. If only part of the page needs to be localized
   * @return  void
   **/
  localize : function( strPageName, strCustomSelectorParent ) {
    var boolIsCustomSelectorParentPresent = typeof strCustomSelectorParent === 'string'
      , strSelectorPrefix = boolIsCustomSelectorParentPresent ? strCustomSelectorParent + ' ' : ''
      , $$allLocalizableElements = document.querySelectorAll( strSelectorPrefix + '[i18n-content]' )
      ;

    for ( var i = 0, l = $$allLocalizableElements.length; i < l; i++ ) {
        var $$localizableElement = $$allLocalizableElements[ i ]
          , strI18n = $$localizableElement.getAttribute( 'i18n-content' )
          , strI18nParameters = $$localizableElement.getAttribute( 'data-i18n-parameters' )
          , arrI18nParameters
          ;

        if ( typeof strI18nParameters === 'string' && strI18nParameters !== '' ) {
          arrI18nParameters = strI18nParameters.split( '|' );
        }

        var strMessage = chrome.i18n.getMessage( strI18n, arrI18nParameters );

        if ( $$localizableElement.nodeName === 'LABEL' ) {
          $$localizableElement.innerHTML = $$localizableElement.innerHTML + strMessage;
        }
        else if ( $$localizableElement.nodeName === 'A'
              &&  ! $$localizableElement.classList.contains( 'i18nNoInner' )
        ) {
          $$localizableElement.innerHTML = strMessage;

          if ( $$localizableElement.href === '' ) {
            $$localizableElement.href = chrome.i18n.getMessage( strI18n + 'Href' );
          }
        }
        else if ( $$localizableElement.nodeName === 'IMG' ) {
          $$localizableElement.alt = strMessage;
        }
        else if ( $$localizableElement.nodeName === 'OPTGROUP' ) {
          $$localizableElement.label = strMessage;
        }
        else if ( ! $$localizableElement.classList.contains( 'i18nNoInner' ) ) {
          $$localizableElement.innerHTML = strMessage;
        }

        if ( $$localizableElement.classList.contains( 'i18nTitle' ) ) {
          var strI18nTitle = $$localizableElement.getAttribute( 'data-i18n-title' )
            , strTitle = strMessage
            ;

          if ( typeof strI18nTitle === 'string' && strI18nTitle !== '' ) {
            strTitle = chrome.i18n.getMessage( strI18nTitle );
          }

          $$localizableElement.setAttribute( 'title', strTitle );
        }

        // Replace copyright year placeholder with the current year if the start year matches
        // or with a start-current range if the start year is less than the current one.
        var $$copyrightYear = $$localizableElement.getElementsByClassName( 'copyrightYear' );

        if ( $$copyrightYear.length ) {
          [].forEach.call( $$copyrightYear, function ( $$element ) {
            var strCopyrightStartYear = $$element.getAttribute( 'data-copyright-start-year' );

            if ( strCopyrightStartYear && strCopyrightStartYear !== '' && strCopyrightStartYear.length === 4 ) {
              var intCopyrightStartYear = parseInt( strCopyrightStartYear )
                , intCurrentYear = new Date().getFullYear()
                ;

              if ( intCopyrightStartYear < intCurrentYear ) {
                $$element.textContent = '' + intCopyrightStartYear + '-' + intCurrentYear;
              }
              else {
                $$element.textContent = intCurrentYear;
              }
            }
          } );
        }
    }

    if ( ! boolIsCustomSelectorParentPresent && strPageName ) {
      document.title = chrome.i18n.getMessage( strPageName + 'Title' );
    }
  }
  ,

  /**
   * Insert the provided data into the template
   *
   * @type    method
   * @param   strTemplateId
   *            Element ID where template is "stored"
   * @param   objData
   *            Data to populate into template
   * @return  string
   **/
  template : function( strTemplateId, objData ) {
    return document.getElementById( strTemplateId )
            .innerHTML
              .replace(
                  /%(\w*)%/g
                , function( m, key ) {
                    return objData.hasOwnProperty( key ) ? objData[ key ] : '';
                  }
              );
  }
  ,

  /**
   * Let user know something was successful
   *
   * @type    method
   * @param   $element
   *            Element which will be a success indicator
   * @return  void
   **/
  showSuccess : function( $element ) {
    $element.classList.remove( 'show' );

    // Does not work the second time if there is no timeout
    setTimeout(
        function() {
          $element.classList.add( 'reset' );
          $element.classList.remove( 'reset' );
          $element.classList.add( 'show' );
        }
      , 10
    );
  }
  ,

  /**
   * Let user know something was successful
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  closeDevelopersMessage : function() {
    strLog = 'closeDevelopersMessage';

    document.getElementById( this.strDevelopersMessageId ).remove();

    Global.setStorageItems(
        StorageSync
      , { boolWasMessageForThisVersionClosed : true }
      , strLog
      , function() {
          // Track clicks
          chrome.runtime.sendMessage(
            {
                strReceiver     : 'background'
              , strLog          : 'browserAction.toolbar'
              , objVars         : {
                    strAction   : 'closeMessage'
                  , strPage     : strPage
                }
            }
          );

          // Reset title and badge
          chrome.browserAction.setTitle( {
            title: chrome.runtime.getManifest().browser_action.default_title
          } );

          chrome.browserAction.setBadgeText( {
            text: ''
          } );
        }
    );
  }
  ,

  /**
   * Track page, subpage (section of the page), and subsection view.
   *
   * @type    method
   * @param   strSubpage
   *            Name of the subpage.
   * @param   strSubsection
   *            Name of the subsection.
   * @return  void
   **/
  trackPageView : function( strSubpage, strSubsection ) {
    chrome.runtime.sendMessage(
      {
          strReceiver       : 'background'
        , strLog            : 'pageView'
        , objVars           : {
              strPage       : strPage
            , strSubpage    : strSubpage
            , strSubsection : strSubsection
          }
      }
    );
  }
  ,

  /**
   * position: sticky replacement.
   *
   * @type    method
   * @param   $$stickyElement
   *            Element to stick.
   * @param   intOrigOffsetY
   *            Original offset in pixels.
   * @return  void
   **/
  initStickyElement : function( $$stickyElement, intOrigOffsetY ) {
    var intStickyElementOffsetHeight = $$stickyElement.offsetHeight
      , strStickyElementPlaceholderHtml =
          '<div style="height: ' + intStickyElementOffsetHeight + 'px"></div>'
      ;

    $$stickyElement.insertAdjacentHTML(
        'afterend'
      , strStickyElementPlaceholderHtml
    );

    function onScroll( objEvent ) {
      $$stickyElement.classList.toggle(
          'sticky'
        , window.scrollY >= intOrigOffsetY
      );
    }

    document.addEventListener( 'scroll', onScroll );
  }
  ,

  /**
   * Make element show up or disappear.
   *
   * @type    method
   * @param   $element
   *            Element which will be a success indicator.
   * @param   boolShow
   *            Optional. Whether to show or hide.
   * @return  void
   **/
  toggleElement : function( $element, boolShow ) {
    var boolHidden
      , boolAriaHidden
      ;

    if ( typeof boolShow !== 'boolean' ) {
      $element.classList.toggle( strNotShownElementClass );
      boolHidden = ! $element.hidden;
      boolAriaHidden = ! $element.getAttribute( 'aria-hidden' );
    }
    else if ( boolShow ) {
      $element.classList.remove( strNotShownElementClass );
      boolHidden = false;
      boolAriaHidden = false;
    }
    else {
      $element.classList.add( strNotShownElementClass );
      boolHidden = true;
      boolAriaHidden = true;
    }

    $element.hidden = boolHidden;
    $element.setAttribute( 'aria-hidden', boolAriaHidden );
  }
};

/* =============================================================================

  Events

 ============================================================================ */

document.addEventListener( 'DOMContentLoaded', Page.init );
