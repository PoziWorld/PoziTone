/* ====================================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2014 PoziWorld
  File                    :           js/page.js
  Description             :           Page JavaScript

  Table of Contents:

  1.                              Page
    1.a.                            init()
    1.b.                            localize()
  2.                              Events

 ==================================================================================== */

/* ====================================================================================

  1.                              Page

 ==================================================================================== */

var Page = {

  /**
   * 1.a.
   *
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
   * 1.b.
   *
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
        var $localizableElement = $allLocalizableElements[ i ];

        if ( $localizableElement.nodeName === 'LABEL' )
          $localizableElement.innerHTML = 
              $localizableElement.innerHTML
            + chrome.i18n.getMessage( $localizableElement.getAttribute( 'i18n-content' ) );
        else
          $localizableElement.innerHTML = chrome.i18n.getMessage( $localizableElement.getAttribute( 'i18n-content' ) );
    }

    document.title = chrome.i18n.getMessage( 'pozi' + strPageName + 'PageTitle' );
  }
};

/* ====================================================================================

  3.                              Events

 ==================================================================================== */

document.addEventListener( 'DOMContentLoaded', Page.init );