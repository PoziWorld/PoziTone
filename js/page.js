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
    }

    document.title = 
      chrome.i18n.getMessage( 'pozi' + strPageName + 'PageTitle' );
  }
};

/* =============================================================================

  2. Events

 ============================================================================ */

document.addEventListener( 'DOMContentLoaded', Page.init );