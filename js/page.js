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
      template()
      showSuccess()
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
        else if ( ! $localizableElement.classList.contains( 'i18nNoInner' ) )
          $localizableElement.innerHTML = strMessage;

        if ( $localizableElement.classList.contains( 'i18nTitle' ) )
          $localizableElement.setAttribute( 'title', strMessage );
    }

    document.title = chrome.i18n.getMessage( strPageName + 'Title' );
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
};

/* =============================================================================

  2. Events

 ============================================================================ */

document.addEventListener( 'DOMContentLoaded', Page.init );