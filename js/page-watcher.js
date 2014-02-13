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
    1.f.                            processButtonClick_add()
    1.g.                            processButtonClick_favorite()
    1.h.                            processButtonClick_playStop()
    1.i.                            processButtonClick_mute()
    1.j.                            processButtonClick_unmute()
    1.k.                            sendSameMessage()
    1.l.                            processCommand_muteUnmute()
    1.m.                            processCommand_showNotification()
  2.                              Listeners
    2.a.                            titlesong DOMCharacterDataModified
    2.b.                            runtime.onMessage

 ==================================================================================== */

/* ====================================================================================

  1.                              Page Watcher

 ==================================================================================== */

var PageWatcher = {
    boolUserLoggedIn            : document.getElementById( 'user-account' ) !== null

  // Play/Stop button has class which is player status 
  // When player is off (paused/stopped/not started), it has class 'play'; on - 'stop'
  , objWantedClassRegExp        : / (play|stop)/
  , intWantedClassLength        : 4

  , $wmaPlayer                  : document.getElementsByName( 'MediaPlayer' )[0]
  , $playStopButton             : document.getElementsByClassName( 'general_play' )[0]

  , strTrackInfoContainerId     : 'titlesong'
  , strPlayerId                 : 'radioplayer_sm' // Set by 101

  , boolDisregardSameMessage    : false

  , objPlayerInfo               : {
        boolIsMp3Player         : ! document.contains( document.getElementsByName( 'MediaPlayer' )[0] )
      , intVolume               : 0
      , intVolumeBeforeMuted    : 50 // Uppod doesn't save prev value, restore to this one
      , strStatus               : ''
    }
  , objStationInfo              : {
        strStationName          : document.getElementsByTagName( 'h1' )[0].innerText
      , strStationNamePlusDesc  : document.title
      , strLogoUrl              : document
                                    .querySelectorAll( '[rel="image_src"]' )[0]
                                      .href
                                        .replace( 'http://101.ru/vardata/modules/channel/dynamics/', '' )
      , strTrackInfo            : ''
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

      PageWatcher.objPlayerInfo.strStatus = strWantedClass;
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
    if ( PageWatcher.objPlayerInfo.boolIsMp3Player === true ) // If MP3
      PageWatcher.getPlayerIntVar( 'getv', 'intVolume' );
    else // If WMA
      // If muted, WMP doesn't set volume to 0. Emulate setting it to 0
      if ( typeof PageWatcher.$wmaPlayer.settings.mute !== 'undefined' && PageWatcher.$wmaPlayer.settings.mute === true )
        PageWatcher.objPlayerInfo.intVolume = 0;
      else if ( typeof PageWatcher.$wmaPlayer.settings.volume === 'number' )
        PageWatcher.objPlayerInfo.intVolume = PageWatcher.$wmaPlayer.settings.volume;
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
  ,

  /**
   * 1.f.
   *
   * Simulate "Add track to playlist" player method
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  processButtonClick_add : function() {
    document.getElementById( 'addfavoritetracksfromair' ).click();
  }
  ,

  /**
   * 1.g.
   *
   * Simulate "I like it!" player method
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  processButtonClick_favorite : function() {
    document.getElementById( 'polltrackaction' ).click();
  }
  ,

  /**
   * 1.h.
   *
   * Simulate "Play/Stop" player method
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  processButtonClick_playStop : function() {
    PageWatcher.$playStopButton.click();
    PageWatcher.sendSameMessage();
  }
  ,

  /**
   * 1.i.
   *
   * Simulate "Mute" player method
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  processButtonClick_mute : function() {
    if ( PageWatcher.objPlayerInfo.boolIsMp3Player === true ) { // If MP3
      // Uppod JS API doesn't provide "mute" method, emulate it by saving current value
      PageWatcher.getPlayerIntVar( 'getv', 'intVolumeBeforeMuted' );
      playerAPI.Uppod.uppodSend( 'radioplayer_sm', 'v0' );
    }
    else // If WMA
      PageWatcher.$wmaPlayer.settings.mute = true;

    PageWatcher.sendSameMessage();
  }
  ,

  /**
   * 1.j.
   *
   * Simulate "Unmute" player method
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  processButtonClick_unmute : function() {
    if ( PageWatcher.objPlayerInfo.boolIsMp3Player === true ) // If MP3
      // Uppod JS API doesn't provide "unmute" method, restore prev value
      playerAPI.Uppod.uppodSend( 'radioplayer_sm', 'v' + PageWatcher.objPlayerInfo.intVolumeBeforeMuted );
    else // If WMA
      PageWatcher.$wmaPlayer.settings.mute = false;

    PageWatcher.sendSameMessage();
  }
  ,

  /**
   * 1.k.
   *
   * Send same message again (set of buttons needs to be changed)
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  sendSameMessage : function() {
    chrome.runtime.sendMessage(
      {
          boolUserLoggedIn          : PageWatcher.boolUserLoggedIn
        , boolDisregardSameMessage  : true
        , objPlayerInfo             : PageWatcher.getPlayerInfo()
        , objStationInfo            : PageWatcher.objStationInfo
      }
    );
  }
  ,

  /**
   * 1.l.
   *
   * If volume is not 0, then mute; otherwise unmute;
   * TODO: Create general muteUnmute, and use it here and for button click.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  processCommand_muteUnmute : function() {
    PageWatcher.getPlayerVolume();

    if ( PageWatcher.objPlayerInfo.intVolume !== 0 )
      PageWatcher.processButtonClick_mute();
    else
      PageWatcher.processButtonClick_unmute();
  }
  ,

  /**
   * 1.m.
   *
   * If volume is not 0, then mute; otherwise unmute;
   * TODO: Don't use 'processCommand_showNotification', just 'sendSameMessage' from sender.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  processCommand_showNotification : function() {
    PageWatcher.sendSameMessage();
  }
};

/* ====================================================================================

  2.                              Event Listeners

 ==================================================================================== */

/**
 * 2.a.
 *
 * Watches track info changes and sends them to Background
 * TODO: Add check if this element exists
 *
 * @type    method
 * @param   objEvent
 * @return  void
 **/
document.getElementById( PageWatcher.strTrackInfoContainerId ).addEventListener( 'DOMCharacterDataModified', function( objEvent ) {
  PageWatcher.objStationInfo.strTrackInfo = objEvent.newValue;

  chrome.runtime.sendMessage(
    {
        boolUserLoggedIn          : PageWatcher.boolUserLoggedIn
      , boolDisregardSameMessage  : false
      , objPlayerInfo             : PageWatcher.getPlayerInfo()
      , objStationInfo            : PageWatcher.objStationInfo
    }
  );
}, false);

/**
 * 2.b.
 *
 * Listens for command sent from Background.
 * If requested function found, call it.
 *
 * @type    method
 * @param   objMessage
 *            Message received
 * @param   objSender
 *            Sender of the message
 * @return  void
 **/
chrome.runtime.onMessage.addListener(
  function( strMessage, objSender, funcSendResponse ) {

    // Debug
    console.log( 'PageWatcher onMessage: ' + strMessage );

    var funcToProceedWith = PageWatcher[ strMessage ];

    if ( typeof funcToProceedWith === 'function' )
      funcToProceedWith();
    else if ( strMessage === 'Do you copy?' )
      funcSendResponse( 'Copy that.' );
  }
);