/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2014 PoziWorld
  License                 :           pozitone.com/license
  File                    :           js/browser-action.js
  Description             :           Popup JavaScript

  Table of Contents:

  1. Popup
      init()
      populateRecentTracks()
      template()
      addEventListeners()
  2. Events

 ============================================================================ */

/* =============================================================================

  1. Popup

 ============================================================================ */

var
    strListId             = 'recentTracks'

  , Popup                 = {
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
    Popup.addEventListeners();
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

      if ( strHtml !== '' )
        document.getElementById( strListId ).innerHTML = strHtml;
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
  ,

  /**
   * Add event listeners
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  addEventListeners : function() {
    addEvent(
        document.getElementById( 'bractOpenOptionsPage' )
      , 'click'
      , function( objEvent ) {
          var
              strOptionsUrl = chrome.extension.getURL( 'html/options.html' )
              objOptionsUrl = { url: strOptionsUrl }
            ;

          chrome.tabs.query( objOptionsUrl , function( objTabs ) {
            if ( objTabs.length )
              chrome.tabs.update( objTabs[0].id, { active: true } );
            else
              chrome.tabs.create( objOptionsUrl );
          } );
        }
    );

    addEvent(
        document.getElementById( 'bractClosePopupPage' )
      , 'click'
      , function( objEvent ) {
          window.close();
        }
    );
  }
};

/* =============================================================================

  3. Events

 ============================================================================ */

document.addEventListener( 'DOMContentLoaded', Popup.init );