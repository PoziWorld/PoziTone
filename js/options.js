/* ====================================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2014 PoziWorld
  File                    :           js/options.js
  Description             :           Options JavaScript

  Table of Contents:

  1.                              Options
    1.a.                            init()
    1.b.                            getAvailableOptions()
    1.c.                            onChange()
  2.                              Events

 ==================================================================================== */

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
    Options.getAvailableOptions();
    Options.onChange();
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
   * 1.c.
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