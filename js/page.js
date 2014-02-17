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
    $( '[i18n-content]' ).each( function( intIndex, objElement ) {
        if ( objElement.nodeName === 'LABEL' )
          $( objElement ).append( chrome.i18n.getMessage( $( this ).attr( 'i18n-content' ) ) );
        else
          objElement.innerHTML = chrome.i18n.getMessage( $( this ).attr( 'i18n-content' ) );
    });

    document.title = chrome.i18n.getMessage( 'pozi' + strPageName + 'PageTitle' );
  }
};

/* ====================================================================================

  3.                              Events

 ==================================================================================== */

document.addEventListener( 'DOMContentLoaded', Page.init );