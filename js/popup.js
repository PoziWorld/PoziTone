/* ====================================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013 PoziWorld
  File                    :           js/popup.js
  Description             :           Popup JavaScript

  Table of Contents:

  1.                              Popup
    1.a.                            init()
    1.b.                            populateLastTracks()
  2.                              Events

 ==================================================================================== */

/* ====================================================================================

  1.                              Popup

 ==================================================================================== */

var Popup = {
    strLogoPath                   : 'http://101.ru/vardata/modules/channel/dynamics/'
  ,

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
    Page.localize( 'Popup' );
    Popup.populateLastTracks();
  }
  ,

  /**
   * 1.b.
   *
   * Populate Last Tracks list
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  populateLastTracks : function() {
    chrome.storage.sync.get( 'arrLastTracks', function( objReturn ) {
      var
          arrLastTracks   = objReturn.arrLastTracks
        , strHtml         = ''
        ;

      for ( var i = ( arrLastTracks.length - 1 ); i > 0; i-- ) {
        strHtml += Popup.template(
            'lastTrackRow'
          , {
                track : arrLastTracks[ i ][ 0 ]
              , src   : Popup.strLogoPath + arrLastTracks[ i ][ 2 ]
              , alt   : arrLastTracks[ i ][ 1 ]
            }
        );
      }
      // TODO: Null case
      // if ( strHtml === '' )

      document.getElementById( 'lastTracks' ).innerHTML = strHtml;
    });
  }
  ,

  /**
   * 1.c.
   *
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

/* ====================================================================================

  3.                              Events

 ==================================================================================== */

document.addEventListener( 'DOMContentLoaded', Popup.init );