/* ====================================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2014 PoziWorld
  File                    :           js/options.js
  Description             :           Options JavaScript

  Table of Contents:

  0.                              Globals
  1.                              Options
    1.a.                            init()
    1.b.                            getAvailableOptions()
    1.c.                            onChange()
    1.d.                            switchPage()
  2.                              Events

 ==================================================================================== */

/* ====================================================================================

  0.                              Globals

 ==================================================================================== */

var
    $allInputs // All <input />
  , intInputs  // Num of $allInputs
  ;

// http://code.tutsplus.com/tutorials/from-jquery-to-javascript-a-reference--net-23703
var addEvent = (function () {
    var filter = function(el, type, fn) {
        for ( var i = 0, len = el.length; i < len; i++ ) {
            addEvent(el[i], type, fn);
        }
    };
    if ( document.addEventListener ) {
        return function (el, type, fn) {
            if ( el && el.nodeName || el === window ) {
                el.addEventListener(type, fn, false);
            } else if (el && el.length) {
                filter(el, type, fn);
            }
        };
    }
})();

/* ====================================================================================

  1.                              Options

 ==================================================================================== */

var Options = {

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
    Page.localize( 'Options' );

    // Set global values
    $allInputs  = document.getElementsByTagName( 'input' );
    intInputs   = $allInputs.length;

    Options.getAvailableOptions();

    addEvent(
        $allInputs
      , 'change'
      , function( objEvent ) { Options.onChange( objEvent ); }
    );

    addEvent(
        document.getElementsByClassName( 'switchPage' )
      , 'click'
      , function( objEvent ) { Options.switchPage( objEvent ); }
    );
  }
  ,

  /**
   * 1.b.
   *
   * Get available options and set their stored values
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  getAvailableOptions : function() {
    var arrAvailableOptions = [];

    for ( var i = 0; i < intInputs; i++ ) {
      var
          $input            = $allInputs[ i ]
        , strVarName        = $input.name
        ;

      arrAvailableOptions.push( strVarName );
    }

    chrome.storage.sync.get( arrAvailableOptions, function( objStorageData ) {
      for ( i = 0; i < intInputs; i++ ) {
        var
            $input            = $allInputs[ i ]
          , strVarName        = $input.name
          , strVarType        = $input.type
          , strVarValue       = $input.value
          , miscStorageVar    = objStorageData[ strVarName ]
          ;

        if ( typeof miscStorageVar !== 'undefined' ) {
          if ( strVarType === 'checkbox' ) {
            if ( typeof miscStorageVar === 'boolean' )
              $input.checked = miscStorageVar;
            else if ( typeof miscStorageVar === 'object' && miscStorageVar.indexOf( strVarValue ) !== -1 )
              $input.checked = true;
          }
          else if ( strVarType === 'radio' && typeof miscStorageVar === 'string' && miscStorageVar === strVarValue )
            $input.checked = true;
        }
      }
    });
  }
  ,

  /**
   * 1.c.
   *
   * Assign change listeners
   *
   * @type    method
   * @param   objEvent
   * @return  void
   **/
  onChange : function( objEvent ) {
    var
        $this   = objEvent.target
        objTemp = {}
      ;

    if ( $this.type === 'checkbox' && $this.value === 'on' )
      objTemp[ $this.name ] = $this.checked;
    else if ( $this.type === 'checkbox' && $this.value !== 'on' ) {
      var
          $group    = document.getElementsByName( $this.name )
        , arrTemp   = []
        ;

      for ( var i = 0; i < $group.length; i++ ) {
        var $groupEl = $group[ i ];

        if ( $groupEl.checked === true )
          arrTemp.push( $groupEl.value );
      }

      objTemp[ $this.name ] = arrTemp;
    }
    else if ( $this.type === 'radio' )
      objTemp[ $this.name ] = $this.value;

    if ( Global.isEmpty( objTemp ) !== true )
      chrome.storage.sync.set( objTemp, function() {
        // Debug
        chrome.storage.sync.get( null, function(data) {
          console.log(data);
        });
      });
  }
  ,

  /**
   * 1.d.
   *
   * Switch page
   *
   * @type    method
   * @param   objEvent
   * @return  void
   **/
  switchPage : function( objEvent ) {
    var
        $target     = objEvent.target
      , strPageId   = $target.hash.replace( '#', '' )
      , $page       = document.getElementById( strPageId )
      ;

    if ( document.contains( $page ) ) {
      // 1. Hide all pages, show called.
      var $allPages = document.getElementsByClassName( 'page' );

      for ( var i = 0, intPages = $allPages.length; i < intPages; i++ )
        $allPages[ i ].style.display = 'none';

      $page.style.display = 'block';

      // 2. Make menu link active.
      // TODO: Switch to querySelector(All)? Performance vs Less code
      var $allMenuLinks = document.getElementById( 'menu' ).getElementsByTagName( 'li' );

      for ( var j = 0, intMenuLinks = $allMenuLinks.length; j < intMenuLinks; j++ )
        $allMenuLinks[ j ].classList.remove( 'selected' );

      $target.parentNode.classList.add( 'selected' );
    }

    return false;
  }
};

/* ====================================================================================

  3.                              Events

 ==================================================================================== */

document.addEventListener( 'DOMContentLoaded', Options.init );