/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2014 PoziWorld
  File                    :           js/browser-action.js
  Description             :           Popup JavaScript

  Table of Contents:

  1. Popup
      init()
      populateRecentTracks()
  2. Events

 ============================================================================ */

/* =============================================================================

  1. Popup

 ============================================================================ */

var Popup = {
  /**
   * Initialize
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  init : function() {
    Page.localize( 'Popup' );
    Popup.populateRecentTracks();
  }
  ,

  /**
   * Populate Last Tracks list
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  populateRecentTracks : function() {
    chrome.storage.sync.get( 'arrRecentTracks', function( objReturn ) {
      var
          arrRecentTracks   = objReturn.arrRecentTracks
        , strHtml           = ''
        ;

      for ( var i = ( arrRecentTracks.length - 1 ); i >= 0; i-- ) {
        strHtml += Popup.template(
            'recentTrackRow'
          , {
                track : arrRecentTracks[ i ][ 0 ]
              , src   : arrRecentTracks[ i ][ 2 ]
              , alt   : arrRecentTracks[ i ][ 1 ]
            }
        );
      }
      // TODO: Null case
      // if ( strHtml === '' )

      document.getElementById( 'recentTracks' ).innerHTML = strHtml;
    });
  }
  ,

  /**
   * Initialize
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
};

/* =============================================================================

  3. Events

 ============================================================================ */

document.addEventListener( 'DOMContentLoaded', Popup.init );