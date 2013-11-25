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
    1.c.                            getPlayerStatus()
    1.d.                            getPlayerVolume()
    1.e.                            getPlayerIntVar()
  2.                              Event Listeners
    2.a.                            titlesong DOMCharacterDataModified()

 ==================================================================================== */

/* ====================================================================================

  1.                              Page Watcher

 ==================================================================================== */

var PageWatcher = {
    strPlayerId             : 'radioplayer_sm' // Set by 101
  , strTrackInfoContainer   : 'titlesong'
  , objPlayerInfo           : {
        status              : null
      , volume              : null
    }
  // Play/Stop button has class which is player status 
  // When player is off (paused/stopped/not started), it has class 'play'; on - 'stop'
  , objWantedClassRegExp    : / (play|stop)/
  , intWantedClassLength    : 4
  , $wmaPlayer              : document.getElementsByName( 'MediaPlayer' )[0]
  , $playStopButton         : document.getElementsByClassName( 'general_play' )[0]
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
    PageWatcher.getPlayerStatus();
    PageWatcher.getPlayerVolume();

    return PageWatcher.objPlayerInfo;
  }
  ,

  /**
   * 1.c.
   *
   * Gets player status from Play/Stop Button class attr
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  getPlayerStatus : function() {
    if ( document.contains( PageWatcher.$playStopButton ) ) {
      // .search() is faster than for () - http://jsperf.com/for-loop-or-search-regexp
      var
          strPlayStopButtonClassAttr    = PageWatcher.$playStopButton.className
        , intWantedClassPosition        = strPlayStopButtonClassAttr.search( PageWatcher.objWantedClassRegExp )
        , strWantedClass                = ( intWantedClassPosition !== -1 ) ?
            // +1 because we don't want to include space symbol
            strPlayStopButtonClassAttr.substr( intWantedClassPosition + 1, PageWatcher.intWantedClassLength ) : ''
        ;

      PageWatcher.objPlayerInfo.status = strWantedClass;
    }
  }
  ,

  /**
   * 1.d.
   *
   * Gets player volume
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  getPlayerVolume : function() {
    if ( ! document.contains( PageWatcher.$wmaPlayer ) ) // If MP3
      PageWatcher.getPlayerIntVar( 'getv', 'volume' );
    else // If WMA
      // If muted, WMP doesn't set volume to 0. Emulate setting it to 0
      if ( typeof PageWatcher.$wmaPlayer.settings.mute !== 'undefined' && PageWatcher.$wmaPlayer.settings.mute === true )
        PageWatcher.objPlayerInfo.volume = 0;
      else if ( typeof PageWatcher.$wmaPlayer.settings.volume === 'number' )
        PageWatcher.objPlayerInfo.volume = PageWatcher.$wmaPlayer.settings.volume;
  }
  ,

  /**
   * 1.e.
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
document.getElementById( PageWatcher.strTrackInfoContainer ).addEventListener( 'DOMCharacterDataModified', function( objEvent ) {
  chrome.runtime.sendMessage(
    {
        objPlayerInfo:  PageWatcher.getPlayerInfo()
      , strTrack:       objEvent.newValue
    }
  );
}, false);