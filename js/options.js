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
   * Get available options and set their stored values
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  getAvailableOptions : function() {
    $( ':input' ).each( function( intIndex, objElement ) {
      var
          strVarName        = objElement.name
        , strVarType        = objElement.type
        , strVarValue       = objElement.value
        ;

      chrome.storage.sync.get( strVarName, function( objStorageData ) {
        var miscStorageVar  = objStorageData[ strVarName ];

        if ( typeof miscStorageVar !== 'undefined' ) {
          if ( strVarType === 'checkbox' ) {
            if ( typeof miscStorageVar === 'boolean' )
              objElement.checked = miscStorageVar;
            else if ( typeof miscStorageVar === 'object' && miscStorageVar.indexOf( strVarValue ) !== -1 )
              objElement.checked = true;
          }
          else if ( strVarType === 'radio' && typeof miscStorageVar === 'string' && miscStorageVar === strVarValue )
            objElement.checked = true;
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

      if ( $this.type === 'checkbox' && $this.value === 'on' )
        objTemp[ $this.name ] = $( this ).prop( 'checked' );
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
        objTemp[ $this.name ] = $( this ).val();

      if ( Global.isEmpty( objTemp ) !== true )
        chrome.storage.sync.set( objTemp, function() {
          // Debug
          chrome.storage.sync.get( null, function(data) {
            console.log(data);
          });
        });
    });
  }
};

/* ====================================================================================

  3.                              Events

 ==================================================================================== */

document.addEventListener( 'DOMContentLoaded', Options.init );