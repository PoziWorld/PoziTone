/* ====================================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2014 PoziWorld
  File                    :           js/page-watcher.js
  Description             :           101.ru Page Watcher JavaScript

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
    1.n.                            initObserver()
    1.o.                            initPlayerStatusObserver()
    1.p.                            initAddTrackToPlaylistFeedbackObserver()
    1.q.                            initFavoriteStatusObserver()
    1.r.                            setLogoLoadedCallback()
    1.s.                            modifyStationLogo()
  2.                              Listeners
    2.a.                            titlesong DOMCharacterDataModified
    2.b.                            runtime.onMessage
  3.                              On Load
    3.a.                            Initialize

 ==================================================================================== */

/* ====================================================================================

  1.                              Page Watcher

 ==================================================================================== */

var
    strPlayerId                         = 'radioplayer_sm'
  , strTrackInfoContainerId             = 'titlesong'
  , strFavoriteButtonSuccessClass       = 'favok'
  , strFavoriteButtonSuccessClass2      = 'pollok'

  , $stationLogo                        = document
                                            .getElementById( 'player-site' )
                                              .getElementsByTagName( 'img' )[0]
  , $wmaPlayer                          = document.getElementsByName( 'MediaPlayer' )[0]
  , $playStopButton                     = document.getElementsByClassName( 'general_play' )[0]
  , $addTrackToPlaylistButton           = document.getElementById( 'addfavoritetracksfromair' )
  , $addTrackToPlaylistResponse         = document.getElementById( 'airfavmsg' )
  , $favoriteButton                     = document.getElementById( 'polltrackaction' )
  , $trackInfo                          = document.getElementById( strTrackInfoContainerId )

  , PageWatcher                         = {
        boolUserLoggedIn                : document.getElementById( 'user-account' ) !== null

      // Play/Stop button has class which is player status 
      // When player is off (paused/stopped/not started), it has class 'play'; on - 'stop'
      , objWantedClassRegExp            : / (play|stop)/
      , intWantedClassLength            : 4

      , boolHadPlayedBefore             : false
      , boolPageJustLoaded              : true
      , boolDisregardSameMessage        : false

      , intLogoBorderToAdd              : 15
      , strLogoBorderColor              : '#FFF'

      , objPlayerInfo                   : {
            strModule                   : 'ru_101'
          , boolIsMp3Player             : ! document.contains( $wmaPlayer )
          , intVolume                   : 0
          , intVolumeBeforeMuted        : 50 // Uppod doesn't save prev value, restore to this one
          , strStatus                   : ''
          , strPreviousStatus           : ''
        }
      , objStationInfo                  : {
            strStationName              : document.getElementsByTagName( 'h1' )[0].innerText
          , strStationNamePlusDesc      : document.title
          , strLogoUrl                  : $stationLogo.src
          , strLogoDataUri              : null
          , strTrackInfo                : $trackInfo.innerText
          , boolHasAddToPlaylistButton  : false
        }
      , objAddTrackToPlaylistFeedback   : {
            'Трек успешно добавлен в плейлист'
                                        : chrome.i18n.getMessage( 'poziNotificationAddTrackToPlaylistFeedbackSuccessfullyAdded' )
          , 'Данный трек уже есть в Вашем плейлисте'
                                        : chrome.i18n.getMessage( 'poziNotificationAddTrackToPlaylistFeedbackAlreadyInPlaylist' )
        }
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
    // WMA player has 'stop' class by default (it's in Play mode),
    // so mutation doesn't happen on page load
    if ( ! PageWatcher.objPlayerInfo.boolIsMp3Player )
      PageWatcher.boolHadPlayedBefore = true;

    if ( document.contains( $addTrackToPlaylistButton ) ) {
      PageWatcher.objStationInfo.boolHasAddToPlaylistButton = true;
      PageWatcher.initAddTrackToPlaylistFeedbackObserver();
    }

    PageWatcher.initPlayerStatusObserver();

    // There is no such option when not logged-in
    if ( PageWatcher.boolUserLoggedIn )
      PageWatcher.initFavoriteStatusObserver();

    PageWatcher.setLogoLoadedCallback();
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
   * @param   boolReturnStatus
   *            Return status or not
   * @return  void / string
   **/
  getPlayerStatus : function( boolReturnStatus ) {
    if ( document.contains( $playStopButton ) ) {
      // .search() is faster than for () - http://jsperf.com/for-loop-or-search-regexp
      var
          strPlayStopButtonClassAttr    = $playStopButton.className
        , intWantedClassPosition        = strPlayStopButtonClassAttr.search( PageWatcher.objWantedClassRegExp )
        , strWantedClass                = ( intWantedClassPosition !== -1 ) ?
            // +1 because we don't want to include space symbol
            strPlayStopButtonClassAttr.substr( intWantedClassPosition + 1, PageWatcher.intWantedClassLength ) : ''
        ;

      PageWatcher.objPlayerInfo.strStatus = strWantedClass;

      if ( typeof boolReturnStatus !== 'undefined' )
        return strWantedClass;
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
    if ( PageWatcher.objPlayerInfo.boolIsMp3Player ) // If MP3
      PageWatcher.getPlayerIntVar( 'getv', 'intVolume' );
    else // If WMA
      // If muted, WMP doesn't set volume to 0. Simulate setting it to 0
      if (
            typeof $wmaPlayer.settings.mute !== 'undefined'
        &&  $wmaPlayer.settings.mute
      )
        PageWatcher.objPlayerInfo.intVolume = 0;
      else if ( typeof $wmaPlayer.settings.volume === 'number' )
        PageWatcher.objPlayerInfo.intVolume = $wmaPlayer.settings.volume;
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
    var intPlayerIntVar = parseInt( playerAPI.Uppod.uppodGet( strPlayerId, strApiKey ) );

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
    $addTrackToPlaylistButton.click();
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
    $favoriteButton.click();
  }
  ,

  /**
   * 1.h.
   *
   * Simulate "Play/Stop" player method
   * Don't send message because Mutation Observer takes care of it
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  processButtonClick_playStop : function() {
    $playStopButton.click();
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
    if ( PageWatcher.objPlayerInfo.boolIsMp3Player ) { // If MP3
      // Uppod JS API doesn't provide "mute" method, simulate it by saving current value
      PageWatcher.getPlayerIntVar( 'getv', 'intVolumeBeforeMuted' );
      playerAPI.Uppod.uppodSend( strPlayerId, 'v0' );
    }
    else // If WMA
      $wmaPlayer.settings.mute = true;

    PageWatcher.sendSameMessage(
      chrome.i18n.getMessage( 'poziNotificationButtonsMuteFeedback' )
    );
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
    if ( PageWatcher.objPlayerInfo.boolIsMp3Player ) // If MP3
      // Uppod JS API doesn't provide "unmute" method, restore prev value
      playerAPI.Uppod.uppodSend( strPlayerId, 'v' + PageWatcher.objPlayerInfo.intVolumeBeforeMuted );
    else // If WMA
      $wmaPlayer.settings.mute = false;

    PageWatcher.sendSameMessage(
      chrome.i18n.getMessage( 'poziNotificationButtonsUnmuteFeedback' )
    );
  }
  ,

  /**
   * 1.k.
   *
   * Send same message again (set of buttons needs to be changed)
   *
   * @type    method
   * @param   strFeedback
   *            Feedback for main actions
   * @return  void
   **/
  sendSameMessage : function( strFeedback ) {
    PageWatcher.objStationInfo.strTrackInfo = $trackInfo.innerText;

    if ( typeof strFeedback !== 'undefined' )
      PageWatcher.objStationInfo.strTrackInfo += "\n\n" + strFeedback;

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
  ,

  /**
   * 1.n.
   *
   * Init observer
   *
   * @type    method
   * @param   $target
   *            The Node on which to observe DOM mutations
   * @param   objOptions
   *            A MutationObserverInit object, specifies which DOM mutations should be reported.
   * @param   funcCallback
   *            The function which will be called on each DOM mutation
   * @return  void
   **/
  initObserver : function( $target, objOptions, funcCallback ) {
    var
        MutationObserver  = window.MutationObserver || window.WebKitMutationObserver
      , observer          = new MutationObserver( funcCallback )
      ;

    observer.observe( $target, objOptions );
  }
  ,

  /**
   * 1.o.
   *
   * Init player status changes observer
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  initPlayerStatusObserver : function() {
    var
        $target       = $playStopButton
      , objOptions    = {
                            attributes        : true
                          , attributeFilter   : [ 'class' ]
                        }
      , funcCallback  = function( arrMutations ) {  
          for ( var i = 0; i < arrMutations.length; i++ ) {
            var strPlayerStatus = PageWatcher.getPlayerStatus( true );

            // To prevent a bug when mutation happens twice on MP3 player start
            if ( strPlayerStatus === PageWatcher.objPlayerInfo.strPreviousStatus )
              return;

            if ( strPlayerStatus === 'stop' ) {
              var strLangStartedOrResumed = chrome.i18n.getMessage( 'poziNotificationPlayerStatusChangeResumed' );

              if ( PageWatcher.boolPageJustLoaded )
                strLangStartedOrResumed = chrome.i18n.getMessage( 'poziNotificationPlayerStatusChangeStarted' );

              PageWatcher.boolHadPlayedBefore = true;
              PageWatcher.sendSameMessage( strLangStartedOrResumed );
              PageWatcher.boolPageJustLoaded = false;
            }
            else if (
                  strPlayerStatus === 'play'
              &&  PageWatcher.boolHadPlayedBefore
            )
              PageWatcher.sendSameMessage(
                chrome.i18n.getMessage( 'poziNotificationPlayerStatusChangeStopped' )
              );

            PageWatcher.objPlayerInfo.strPreviousStatus = strPlayerStatus;
            return;
          };
        }
      ;

    PageWatcher.initObserver( $target, objOptions, funcCallback );
  }
  ,

  /**
   * 1.p.
   *
   * Init "Add track to playlist" feedback observer
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  initAddTrackToPlaylistFeedbackObserver : function() {
    var
        $target       = $addTrackToPlaylistResponse
      , objOptions    = {
                            characterData : true
                          , childList     : true
                          , subtree       : true
                        }
      , funcCallback  = function( arrMutations ) {  
          for ( var i = 0; i < arrMutations.length; i++ ) {
            var
                objMutationRecord   = arrMutations[ i ]
              , strFeedbackMessage  = ''
              , strMessageToSend    = ''
              ;

            if ( objMutationRecord.type === 'childList' && objMutationRecord.addedNodes.length )
              strFeedbackMessage = objMutationRecord.target.innerText;
            else if ( objMutationRecord.type === 'characterData' && objMutationRecord.target.textContent !== '' )
              strFeedbackMessage = objMutationRecord.target.textContent;

            if ( strFeedbackMessage !== '' ) {
              if ( typeof PageWatcher.objAddTrackToPlaylistFeedback[ strFeedbackMessage ] !== 'undefined' )
                strMessageToSend = PageWatcher.objAddTrackToPlaylistFeedback[ strFeedbackMessage ];
              else
                strMessageToSend = strFeedbackMessage;

              PageWatcher.sendSameMessage( strMessageToSend );
            }

            return;
          };
        }
      ;

    PageWatcher.initObserver( $target, objOptions, funcCallback );
  }
  ,

  /**
   * 1.q.
   *
   * Init "I like it!" button changes observer
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  initFavoriteStatusObserver : function() {
    var
        $target       = $favoriteButton
      , objOptions    = {
                            attributes        : true
                          , attributeFilter   : [ 'class' ]
                        }
      , funcCallback  = function( arrMutations ) {  
          for ( var i = 0; i < arrMutations.length; i++ ) {
            var arrClassList = arrMutations[ i ].target.classList;

            if (
                  arrClassList.contains( strFavoriteButtonSuccessClass )
              ||  arrClassList.contains( strFavoriteButtonSuccessClass2 )
            ) {
              PageWatcher.sendSameMessage( chrome.i18n.getMessage( 'poziNotificationFavoriteStatusSuccess' ) );
              return;
            }
          };
        }
      ;

    PageWatcher.initObserver( $target, objOptions, funcCallback );
  }
  ,

  /**
   * 1.r.
   *
   * Checks whether station logo is loaded.
   * If yes, created an image for notification.
   * If no, adds onload listener.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  setLogoLoadedCallback : function() {
    if ( $stationLogo.complete )
      PageWatcher.modifyStationLogo();
    else
      $stationLogo.onload = function() {
        PageWatcher.modifyStationLogo();
      };
  }
  ,

  /**
   * 1.s.
   *
   * Use canvas to add border to original logo image,
   * so we can use it as notification icon.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  modifyStationLogo : function() {
    var
        $canvas           = document.createElement( 'canvas' )
      , intLogoBorder     = PageWatcher.intLogoBorderToAdd
      , intLogoWidth      = $stationLogo.width
      , intLogoHeight     = $stationLogo.height
      , intCanvasWidth    = intLogoWidth + 2 * intLogoBorder
      , intCanvasHeight   = intLogoHeight + 2 * intLogoBorder
      ;

    $canvas.width         = intCanvasWidth;
    $canvas.height        = intCanvasHeight;

    var context           = $canvas.getContext( '2d' );

    // Solid bg
    context.fillStyle     = PageWatcher.strLogoBorderColor;
    context.fillRect( 0, 0, intCanvasWidth, intCanvasHeight );

    context.drawImage(
        $stationLogo
      , intLogoBorder
      , intLogoBorder
      , intLogoWidth
      , intLogoHeight
    );

    PageWatcher.objStationInfo.strLogoDataUri = $canvas.toDataURL();
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
 * TODO: Mutation events deprecated...
 *
 * @type    method
 * @param   objEvent
 * @return  void
 **/
$trackInfo.addEventListener( 'DOMCharacterDataModified', function( objEvent ) {
  PageWatcher.objStationInfo.strTrackInfo = objEvent.newValue;

  // When WMA player starts, it should show "Playback started", same way as MP3
  if ( PageWatcher.boolPageJustLoaded && !PageWatcher.objPlayerInfo.boolIsMp3Player ) {
    PageWatcher.sendSameMessage(
      chrome.i18n.getMessage( 'poziNotificationPlayerStatusChangeStarted' )
    );
    PageWatcher.boolPageJustLoaded = false;
    return;
  }

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

/* ====================================================================================

  3.                              On Load

 ==================================================================================== */

/**
 * 3.a.
 *
 * Initialize
 *
 * @type    method
 * @param   No Parameters taken
 * @return  void
 **/
PageWatcher.init();