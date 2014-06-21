/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2014 PoziWorld
  License                 :           pozitone.com/license
  File                    :           js/page.js
  Description             :           Page JavaScript

  Table of Contents:

  1. Page
      init()
      localize()
  2. Events

 ============================================================================ */

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

  1. Page

 ============================================================================ */

var Page = {

  /**
   * Initialize
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  init : function() {
  }
  ,

  /**
   * Localize page
   *
   * @type    method
   * @param   strPageName
   *            Page name
   * @return  void
   **/
  localize : function( strPageName ) {
    var $allLocalizableElements = document.querySelectorAll( '[i18n-content]' );

    for (
      var i = 0, intLocalizableElements = $allLocalizableElements.length;
      i < intLocalizableElements;
      i++
        ) {
        var
            $localizableElement = $allLocalizableElements[ i ]
          , strI18              = $localizableElement
                                    .getAttribute( 'i18n-content' )
          , strMessage          = chrome.i18n.getMessage( strI18 );
          ;

        if ( $localizableElement.nodeName === 'LABEL' )
          $localizableElement.innerHTML = 
            $localizableElement.innerHTML + strMessage;
        else if ( $localizableElement.nodeName === 'A' ) {
          $localizableElement.innerHTML = strMessage;

          if ( $localizableElement.href === '' )
            $localizableElement.href = 
              chrome.i18n.getMessage( strI18 + 'Href' );
        }
        else if ( $localizableElement.nodeName === 'IMG' )
          $localizableElement.alt = strMessage;
        else
          $localizableElement.innerHTML = strMessage;

        if ( $localizableElement.classList.contains( 'i18nTitle' ) )
          $localizableElement.setAttribute( 'title', strMessage );
    }

    document.title = 
      chrome.i18n.getMessage( 'pozi' + strPageName + 'PageTitle' );
  }
};

/* =============================================================================

  2. Events

 ============================================================================ */

document.addEventListener( 'DOMContentLoaded', Page.init );