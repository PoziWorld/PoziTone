/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2015 PoziWorld
  License                 :           pozitone.com/license
  File                    :           js/page-watcher.js
  Description             :           101.ru Page Watcher JavaScript

  Table of Contents:

    Page Watcher
      init()
      getPlayerInfo()
      getPlayerStatus()
      getPlayerVolume()
      getPlayerIntVar()
      processButtonClick_add()
      processButtonClick_favorite()
      processButtonClick_playStop()
      processButtonClick_mute()
      processButtonClick_unmute()
      changeVolume()
      processButtonClick_volumeUp()
      processButtonClick_volumeDown()
      sendSameMessage()
      processCommand_muteUnmute()
      processCommand_showNotification()
      initObserver()
      initPlayerStatusObserver()
      initAddTrackToPlaylistFeedbackObserver()
      initFavoriteStatusObserver()
      setLogoLoadedCallback()
      modifyStationLogo()
    Listeners
      titlesong DOMCharacterDataModified
      runtime.onMessage
    On Load
      Initialize

 ============================================================================ */

/* =============================================================================

  Page Watcher

 ============================================================================ */

const
    strPlayerId                           = 'radioplayer_sm'
  , strFavoriteButtonSuccessClass         = 'favok'
  , strFavoriteButtonSuccessClass2        = 'pollok'
  , strStationName                        =
      document.getElementsByTagName( 'h1' )[0].innerText

  , $stationLogo                          =
      document.getElementById( 'player-site' ).getElementsByTagName( 'img' )[0]
  , $wmaPlayer                            =
      document.getElementsByName( 'MediaPlayer' )[0]
  , $playStopButton                       =
      document.getElementsByClassName( 'general_play' )[0]
  , $addTrackToPlaylistButton             =
      document.getElementById( 'addfavoritetracksfromair' )
  , $addTrackToPlaylistResponse           =
      document.getElementById( 'airfavmsg' )
  , $favoriteButton                       =
      document.getElementById( 'polltrackaction' )
  , $trackInfo                            =
      document.getElementById( 'titlesong' )
  , $kbpsInfo                             =
      document.querySelector( '#audio_set_content .last .active' )

  , boolIsLoggedInMenuPresent             =
      document.contains( document.getElementById( 'user-account' ) )
  , intKbps                               =
      document.contains( $kbpsInfo ) ?
        $kbpsInfo.innerText.replace( 'K', '' ) : 0

  , strModule                             = 'ru_101'
  , strModuleSettings                     = strConstSettingsPrefix + strModule
  ;

var
    objWmaPlayerSettings

  , PageWatcher                           = {
        boolIsUserLoggedIn                : boolIsLoggedInMenuPresent

      // Play/Stop button has class which is player status.

      // When player is off (paused/stopped/not started),
      // it has class 'play'; on - 'stop'.
      , objWantedClassRegExp              : / (play|stop)/
      , intWantedClassLength              : 4

      , boolHadPlayedBefore               : false
      , boolWasPageJustLoaded             : true
      , boolDisregardSameMessage          : false

      , intLogoBorderToAdd                : 15
      , strLogoBorderColor                : '#FFF'

      , objPlayerInfo                     : {
            strModule                     : strModule
          , boolIsReady                   : document.contains( $playStopButton )
          , boolIsMp3Player               : ! document.contains( $wmaPlayer )
          , boolIsPlaying                 : false
          , boolIsMuted                   : false
          , intVolume                     : 0
            // Uppod doesn't save prev value, restore to this one
          , intVolumeBeforeMuted          : 50
          , strPreviousStatus             : ''
          , boolCanPlayNextTrackLoggedOut : false
          , boolCanPlayPreviousTrackLoggedOut : false
        }
        // When set of vars changes check Background.saveRecentTrackInfo, Log
      , objStationInfo                    : {
            strStationName                : strStationName
          , strStationNamePlusDesc        : ''
          , strLogoUrl                    : $stationLogo.src
          , strLogoDataUri                : null
          , strTrackInfo                  : $trackInfo.innerText
          , strAdditionalInfo             : ''
          , boolHasAddToPlaylistButton    : false
        }
      , objAddTrackToPlaylistFeedback     : {
            'Трек успешно добавлен в плейлист'
                                          :
              chrome.i18n.getMessage(
                'notificationAddTrackToPlaylistFeedbackSuccessfullyAdded'
              )
          , 'Данный трек уже есть в Вашем плейлисте'
                                          :
              chrome.i18n.getMessage(
                'notificationAddTrackToPlaylistFeedbackAlreadyInPlaylist'
              )
        }
  ,

  /**
   * Initialize
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  init : function() {
    // WMA player has 'stop' class by default (it's in Play mode),
    // so mutation doesn't happen on page load
    if ( ! PageWatcher.objPlayerInfo.boolIsMp3Player ) {
      PageWatcher.boolHadPlayedBefore = true;

      objWmaPlayerSettings = $wmaPlayer.settings;
    }

    if ( document.contains( $addTrackToPlaylistButton ) ) {
      PageWatcher.objStationInfo.boolHasAddToPlaylistButton = true;
      PageWatcher.initAddTrackToPlaylistFeedbackObserver();
    }

    PageWatcher.initPlayerStatusObserver();

    // There is no such option when not logged-in
    if ( PageWatcher.boolIsUserLoggedIn )
      PageWatcher.initFavoriteStatusObserver();

    PageWatcher.setLogoLoadedCallback();
  }
  ,

  /**
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
        , intWantedClassPosition        = 
            strPlayStopButtonClassAttr
              .search( PageWatcher.objWantedClassRegExp )
        , strWantedClass                = 
            ( intWantedClassPosition !== -1 ) ?
                // +1 because we don't want to include space symbol
                strPlayStopButtonClassAttr
                  .substr(
                      intWantedClassPosition + 1
                    , PageWatcher.intWantedClassLength
                  )
              : ''
        ;

      PageWatcher.objPlayerInfo.boolIsPlaying = strWantedClass === 'stop';

      if ( typeof boolReturnStatus !== 'undefined' )
        return strWantedClass;
    }
  }
  ,

  /**
   * Gets player volume
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  getPlayerVolume : function() {
    // MP3 version
    if ( PageWatcher.objPlayerInfo.boolIsMp3Player )
      PageWatcher.getPlayerIntVar( 'getv', 'intVolume' );
    // WMA version
    else {
      // If muted, WMP doesn't set volume to 0. Simulate setting it to 0
      if (
            typeof objWmaPlayerSettings.mute !== 'undefined'
        &&  objWmaPlayerSettings.mute
      )
        PageWatcher.objPlayerInfo.intVolume = 0;
      else if ( typeof objWmaPlayerSettings.volume === 'number' )
        PageWatcher.objPlayerInfo.intVolume = objWmaPlayerSettings.volume;
    }
  }
  ,

  /**
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
    var intPlayerIntVar = 
          parseInt( playerAPI.Uppod.uppodGet( strPlayerId, strApiKey ) );

    if ( ! isNaN( intPlayerIntVar ) )
      PageWatcher.objPlayerInfo[ strReturnPropertyName ] = intPlayerIntVar;
  }
  ,

  /**
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
   * Simulate "Mute" player method
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  processButtonClick_mute : function() {
    if ( PageWatcher.objPlayerInfo.boolIsMp3Player ) { // If MP3
      // Uppod JS API doesn't provide "mute" method, simulate it 
      // by saving current value
      PageWatcher.getPlayerIntVar( 'getv', 'intVolumeBeforeMuted' );
      playerAPI.Uppod.uppodSend( strPlayerId, 'v0' );
    }
    else // If WMA
      objWmaPlayerSettings.mute = true;

    PageWatcher.objPlayerInfo.boolIsMuted = true;

    PageWatcher.sendSameMessage(
      chrome.i18n.getMessage( 'notificationButtonsMuteFeedback' )
    );
  }
  ,

  /**
   * Simulate "Unmute" player method
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  processButtonClick_unmute : function() {
    if ( PageWatcher.objPlayerInfo.boolIsMp3Player )
      // Uppod JS API doesn't provide "unmute" method, restore prev value
      playerAPI.Uppod.uppodSend(
          strPlayerId
        , 'v' + PageWatcher.objPlayerInfo.intVolumeBeforeMuted
      );
    else
      objWmaPlayerSettings.mute = false;

    PageWatcher.objPlayerInfo.boolIsMuted = false;

    PageWatcher.sendSameMessage(
      chrome.i18n.getMessage( 'notificationButtonsUnmuteFeedback' )
    );
  }
  ,

  /**
   * Change volume level (up/down).
   * Volume level value range, %: 0-100.
   *
   * @type    method
   * @param   strDirection
   *            'up' or 'down'.
   * @return  void
   **/
  changeVolume : function( strDirection ) {
    PageWatcher.getPlayerVolume();

    var intVolume = PageWatcher.objPlayerInfo.intVolume;

    // Can't be changed, reached the limit
    if (
          strDirection === 'up' && intVolume >= 100
      ||  strDirection === 'down' && intVolume <= 0
    )
      return;

    var funcSetVolume = function( intVolumeDelta ) {
      var
          intUpDown = 1
        ;

      if ( strDirection === 'down' )
        intUpDown = -1;

      intVolume += ( intUpDown * intVolumeDelta );

      if ( intVolume > 100 )
        intVolume = 100;
      else if ( intVolume < 0 )
        intVolume = 0;

      if ( PageWatcher.objPlayerInfo.boolIsMp3Player )
        playerAPI.Uppod.uppodSend( strPlayerId, 'v' + intVolume );
      /* Changing volume for WMA version doesn't seem to work
       *
       * 1. http://code.google.com/p/chromium/issues/detail?id=72111
       * 2. http://www.interoperabilitybridges.com/wmp-extension-for-chrome
       *    An extension enabling WMA playback does not work anymore
       *    since Chrome 33.
       */
      else
        objWmaPlayerSettings.volume = intVolume;

      PageWatcher.sendSameMessage(
        chrome.i18n.getMessage(
            'notificationButtonsVolumeChangeFeedback'
          , [ intVolume ]
        )
      );
    };

    PageWatcher.getVolumeDeltaSettings( funcSetVolume );
  }
  ,

  /**
   * Send same message again (set of buttons needs to be changed)
   *
   * @type    method
   * @param   strFeedback
   *            Optional. Feedback for main actions
   * @param   boolAppendKbpsInfo
   *            Optional. Whether kbps info should be appended to the message
   * @param   strCommand
   *            Optional. Which command made this call
   * @param   boolDisregardSameMessage
   *            Optional. Whether to show the same message again or not
   * @return  void
   **/
  sendSameMessage : function(
      strFeedback
    , boolAppendKbpsInfo
    , strCommand
    , boolDisregardSameMessage
  ) {
    PageWatcher.objStationInfo.strTrackInfo = $trackInfo.innerText;

    PageWatcher.objStationInfo.strAdditionalInfo = 
      ( typeof strFeedback === 'string' && strFeedback !== '' ) ?
        strFeedback : '';

    var funcSend = function() {
      if ( typeof boolDisregardSameMessage !== 'boolean' )
        boolDisregardSameMessage = true;

      chrome.runtime.sendMessage(
        {
            boolIsUserLoggedIn        : PageWatcher.boolIsUserLoggedIn
          , boolDisregardSameMessage  : boolDisregardSameMessage
          , objPlayerInfo             : PageWatcher.getPlayerInfo()
          , objStationInfo            : PageWatcher.objStationInfo
          , strCommand                : strCommand
        }
      );
    };

    if ( typeof boolAppendKbpsInfo === 'boolean' && boolAppendKbpsInfo ) {
      // Check settings whether kbps info should be shown
      StorageSync.get( strModuleSettings, function( objReturn ) {
        var objModuleSettings = objReturn[ strModuleSettings ];

        // If set to show kbps info and kbps info is available
        if (
              typeof objModuleSettings === 'object'
          &&  typeof objModuleSettings.boolShowKbpsInfo === 'boolean'
          &&  objModuleSettings.boolShowKbpsInfo
          &&  intKbps !== 0
        ) {
          var strKbpsInfo = intKbps + chrome.i18n.getMessage( 'kbps' );

          PageWatcher.objStationInfo.strTrackInfo += 
            strConstNotificationLinesSeparator + strKbpsInfo;
        }

        funcSend();
      });
    }
    else
      funcSend();
  }
  ,

  /**
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
   * TODO: Don't use 'processCommand_showNotification', 
   * just 'sendSameMessage' from sender.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  processCommand_showNotification : function() {
    PageWatcher.sendSameMessage( '', true, 'showNotification' );
  }
  ,

  /**
   * Init observer
   *
   * @type    method
   * @param   $target
   *            The Node on which to observe DOM mutations
   * @param   objOptions
   *            A MutationObserverInit object, specifies which DOM mutations
   *            should be reported.
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
          for ( var i = 0, l = arrMutations.length; i < l; i++ ) {
            var strPlayerStatus = PageWatcher.getPlayerStatus( true );

            // To prevent a bug when mutation happens twice on MP3 player start
            if ( strPlayerStatus === 
                    PageWatcher.objPlayerInfo.strPreviousStatus )
              return;

            if ( strPlayerStatus === 'stop' ) {
              var strLangStartedOrResumed =
                    chrome.i18n.getMessage(
                      'notificationPlayerStatusChangeResumed'
                    );

              if ( PageWatcher.boolWasPageJustLoaded )
                strLangStartedOrResumed =
                  chrome.i18n.getMessage(
                    'notificationPlayerStatusChangeStarted'
                  );

              PageWatcher.boolHadPlayedBefore = true;

              PageWatcher.sendSameMessage( strLangStartedOrResumed, true );

              PageWatcher.boolWasPageJustLoaded = false;
            }
            else if (
                  strPlayerStatus === 'play'
              &&  PageWatcher.boolHadPlayedBefore
            )
              PageWatcher.sendSameMessage(
                chrome.i18n.getMessage(
                  'notificationPlayerStatusChangeStopped'
                )
              );

            PageWatcher.objPlayerInfo.strPreviousStatus = strPlayerStatus;
            return;
          }
        }
      ;

    PageWatcher.initObserver( $target, objOptions, funcCallback );
  }
  ,

  /**
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
          for ( var i = 0, l = arrMutations.length; i < l; i++ ) {
            var
                objMutationRecord   = arrMutations[ i ]
              , strFeedbackMessage  = ''
              , strMessageToSend    = ''
              ;

            if (
                  objMutationRecord.type === 'childList'
              &&  objMutationRecord.addedNodes.length
            )
              strFeedbackMessage = objMutationRecord.target.innerText;
            else if (
                  objMutationRecord.type === 'characterData'
              &&  objMutationRecord.target.textContent !== ''
            )
              strFeedbackMessage = objMutationRecord.target.textContent;

            if ( strFeedbackMessage !== '' ) {
              if ( typeof
                      PageWatcher
                        .objAddTrackToPlaylistFeedback[ strFeedbackMessage ] !==
                          'undefined'
              )
                strMessageToSend = 
                  PageWatcher
                    .objAddTrackToPlaylistFeedback[ strFeedbackMessage ];
              else
                strMessageToSend = strFeedbackMessage;

              PageWatcher.sendSameMessage( strMessageToSend );
            }

            return;
          }
        }
      ;

    PageWatcher.initObserver( $target, objOptions, funcCallback );
  }
  ,

  /**
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
          for ( var i = 0, l = arrMutations.length; i < l; i++ ) {
            var arrClassList = arrMutations[ i ].target.classList;

            if (
                  arrClassList.contains( strFavoriteButtonSuccessClass )
              ||  arrClassList.contains( strFavoriteButtonSuccessClass2 )
            ) {
              PageWatcher.sendSameMessage(
                chrome.i18n.getMessage(
                  'notificationFavoriteStatusSuccess'
                )
              );
              return;
            }
          }
        }
      ;

    PageWatcher.initObserver( $target, objOptions, funcCallback );
  }
  ,

  /**
   * Checks whether station logo is loaded.
   * If yes, creates an image for notification.
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

// "Import" general functions
PageWatcher.getVolumeDeltaSettings =
  GeneralPageWatcher.getVolumeDeltaSettings;
PageWatcher.processButtonClick_volumeUp =
  GeneralPageWatcher.processButtonClick_volumeUp;
PageWatcher.processButtonClick_volumeDown =
  GeneralPageWatcher.processButtonClick_volumeDown;

/* =============================================================================

  Event Listeners

 ============================================================================ */

/**
 * Watches track info changes and sends them to Background
 * TODO: Add check if this element exists
 * TODO: Mutation events deprecated...
 *
 * @type    method
 * @param   objEvent
 * @return  void
 **/
$trackInfo.addEventListener(
    'DOMCharacterDataModified'
  , function( objEvent ) {
      // When WMA player starts, it should show "Playback started", same as MP3
      if (
            PageWatcher.boolWasPageJustLoaded
        &&  ! PageWatcher.objPlayerInfo.boolIsMp3Player
      ) {
        PageWatcher.sendSameMessage(
            chrome.i18n.getMessage( 'notificationPlayerStatusChangeStarted' )
          , true
        );

        PageWatcher.boolWasPageJustLoaded = false;
        return;
      }

      PageWatcher.sendSameMessage( '', true, '', false );
    }
  , false
);

/**
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
    else if ( strMessage === 'Ready for a command? Your name?' ) {
      var objResponse = {
                            boolIsReady : PageWatcher.objPlayerInfo.boolIsReady
                          , strModule   : PageWatcher.objPlayerInfo.strModule
                        };

      funcSendResponse( objResponse );
    }
  }
);

/* =============================================================================

  On Load

 ============================================================================ */

/**
 * Initialize
 *
 * @type    method
 * @param   No Parameters taken
 * @return  void
 **/
PageWatcher.init();
