/* ====================================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013 PoziWorld
  File                    :           js/page-watcher.js
  Description             :           Page Watcher JavaScript

  Table of Contents:

  1.                              Page Watcher
    1.a.                            init()
    1.b.                            getPlayerInfo()
    1.c.                            getPlayerIntVar()
  2.                              Event Listeners
    2.a.                            titlesong DOMCharacterDataModified()

 ==================================================================================== */

/* ====================================================================================

  1.                              Page Watcher

 ==================================================================================== */

var PageWatcher = {
    strPlayerId             : 'radioplayer_sm' // Set by 101
  , objPlayerInfo           : {
        status              : null
      , volume              : null
    }
  ,

  /**
   * 1.a.
   *
   * Initialize defaults
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
   * Gets player info via Uppod JS API
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  object
   **/
  getPlayerInfo : function() {
    if ( typeof playerAPI !== 'undefined' ) {
      PageWatcher.getPlayerIntVar( 'getstatus', 'status' );
      PageWatcher.getPlayerIntVar( 'getv',      'volume' );
    }
    return PageWatcher.objPlayerInfo;
  }
  ,

  /**
   * 1.c.
   *
   * Gets player integer var via Uppod JS API
   *
   * @type    method
   * @param   strApiKey
   *            uppodGet key to check
   * @param   strReturnPropertyName
   *            objPlayerInfo property to set
   * @return  object
   **/
  getPlayerIntVar : function( strApiKey, strReturnPropertyName ) {
    var intPlayerIntVar = parseInt( playerAPI.Uppod.uppodGet( PageWatcher.strPlayerId, strApiKey ) );

    if ( ! isNaN( intPlayerIntVar ) )
      PageWatcher.objPlayerInfo[ strReturnPropertyName ] = intPlayerIntVar;
  }
};

/* ====================================================================================

  2.                              Event Listeners

 ==================================================================================== */

/**
 * 2.a.
 *
 * Watches track info changes and sends them to Background
 *
 * @type    method
 * @param   objEvent
 * @return  void
 **/
document.getElementById( 'titlesong' ).addEventListener( 'DOMCharacterDataModified', function( objEvent ) {
  chrome.runtime.sendMessage(
    {
        objPlayerInfo:  PageWatcher.getPlayerInfo()
      , strTrack:       objEvent.newValue
    }
  );
}, false);