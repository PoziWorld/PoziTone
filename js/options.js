/* ====================================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013 PoziWorld
  File                    :           js/options.js
  Description             :           Options JavaScript

  Table of Contents:

  1.                              Options
    1.a.                            init()
    1.b.                            localize()
    1.c.                            getAvailableOptions()
    1.d.                            onChange()
  2.                              Events

 ==================================================================================== */

/* ====================================================================================

  1.                              Options

 ==================================================================================== */

var Options = {
    intNotificationCount    : 1
  , objOpenTab              : {}
  , strNotificationId       : 'pozitone'
  , strValidUrl             : '101.ru/'
  ,

  /**
   * 1.a.
   *
   * Initialize extension defaults
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  init : function() {
    Options.localize();
    Options.getAvailableOptions();
    Options.onChange();
  }
  ,

  /**
   * 1.b.
   *
   * Localize page
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  localize : function() {
    $( '[i18n-content]' ).each( function( intIndex, objElement ) {
        if ( objElement.nodeName === 'LABEL' )
          $( objElement ).append( chrome.i18n.getMessage( $( this ).attr( 'i18n-content' ) ) );
        else
          objElement.innerHTML = chrome.i18n.getMessage( $( this ).attr( 'i18n-content' ) );
    });

    document.title = chrome.i18n.getMessage( 'poziOptionsPageTitle' );
  }
  ,

  /**
   * 1.c.
   *
   * Get available options
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  getAvailableOptions : function() {
    $( ':input' ).each( function( intIndex, objElement ) {
      var strVarName = objElement.name;

      chrome.storage.sync.get( strVarName, function( objStorageData ) {
        if ( typeof objStorageData[ strVarName ] !== 'undefined' ) {
          if ( typeof objStorageData[ strVarName ] === 'boolean' && objElement.type === 'checkbox' )
            objElement.checked = objStorageData[ strVarName ];
        }
      });
    });
  }
  ,

  /**
   * 1.d.
   *
   * Assign change listeners
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  onChange : function() {
    $( ':input' ).on( 'change', function() {
      var
          $this   = this
          objTemp = {}
        ;

      if ( $this.type === 'checkbox' )
        objTemp[ $this.name ] = $( this ).prop( 'checked' );

      if ( Global.isEmpty( objTemp ) !== true )
        chrome.storage.sync.set( objTemp, function() {
          // chrome.storage.sync.get( null, function(data) {
            // console.log(data);
          // });
        });
    });
  }
};

/* ====================================================================================

  3.                              Events

 ==================================================================================== */

document.addEventListener('DOMContentLoaded', Options.init);