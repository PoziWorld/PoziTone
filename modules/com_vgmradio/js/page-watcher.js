/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2015-2016 PoziWorld
  License                 :           pozitone.com/license
  File                    :           js/page-watcher.js
  Description             :           vgmradio.com Page Watcher JavaScript

  Table of Contents:

    Page Watcher
      init()
      getPlayerInfo()
      isPlaying()
      getPlayerVolume()
      processButtonClick_playStop()
      processButtonClick_mute()
      processButtonClick_unmute()
      changeVolume()
      sendSameMessage()
      showNotificationOnVolumeChange()
      processCommand_muteUnmute()
      processCommand_showNotification()
      initObserver()
      initPlayerStatusObserver()
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
    $player                               =
      document.getElementsByTagName( 'audio' )[ 0 ]
  , $trackImage                           =
      document.getElementById( 'game-art' )
  , $trackAlbum                           =
      document.getElementById( 'cc_strinfo_trackalbum_vgmradio' )
  , $trackArtist                          =
      document.getElementById( 'cc_strinfo_trackartist_vgmradio' )
  , $trackTitle                           =
      document.getElementById( 'cc_strinfo_tracktitle_vgmradio' )
  , strTrackTitleBeforeFirstLoaded        = 'Loading...'
  , strTrackInfoDivider                   = ' – '

  , strModule                             = 'com_vgmradio'
  , strModuleSettings                     = strConstSettingsPrefix + strModule
  ;

var
    PageWatcher                           = {
        boolIsUserLoggedIn                : false

      , boolHadPlayedBefore               : false
      , boolWasPageJustLoaded             : true
      , boolDisregardSameMessage          : false
      , boolWasLogoLoadedOnce             : false

      , intLogoBorderToAdd                : 5
      , strLogoBorderColor                : '#FFF'

      , objPlayerInfo                     : {
            strModule                     : strModule
          , boolIsReady                   : document.contains( $player )
          , boolIsPlaying                 : false
          , boolIsMuted                   : false
          , boolIsVolumeChangeByUser      : false
          , intVolume                     : 0
          , boolCanPlayNextTrackLoggedOut : false
          , boolCanPlayPreviousTrackLoggedOut : false
        }
        // When set of vars changes check Background.saveRecentTrackInfo, Log
      , objStationInfo                    : {
            strStationName                : ''
          , strStationNamePlusDesc        : ''
          , strLogoUrl                    : $trackImage.src
          , strLogoDataUri                : null
          , strTrackInfo                  : ''
          , strAdditionalInfo             : ''
          , boolHasAddToPlaylistButton    : false
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
    PageWatcher.setLogoLoadedCallback();
  }
  ,

  /**
   * Gets player info
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  object
   **/
  getPlayerInfo : function() {
    PageWatcher.isPlaying();
    PageWatcher.getPlayerVolume();

    return PageWatcher.objPlayerInfo;
  }
  ,

  /**
   * Gets player status using built-in HTML5 audio methods
   *
   * @type    method
   * @param   boolReturnStatus
   *            Return status or not
   * @return  void / bool
   **/
  isPlaying : function( boolReturnStatus ) {
    if ( document.contains( $player ) ) {
      PageWatcher.objPlayerInfo.boolIsPlaying = ! $player.paused;

      if ( typeof boolReturnStatus !== 'undefined' )
        return PageWatcher.objPlayerInfo.boolIsPlaying;
    }
    else {
      return false;
    }
  }
  ,

  /**
   * Gets player volume using built-in HTML5 audio methods
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void / int
   **/
  getPlayerVolume : function() {
    if ( document.contains( $player ) ) {
      // PoziTone operates with %, VGM Radio operates with a 0–1 range
      return  PageWatcher.objPlayerInfo.intVolume =
                Math.round( $player.volume.toFixed( 2 ) * 100 );
    }
  }
  ,

  /**
   * Simulate "Play/Stop" player method
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  processButtonClick_playStop : function() {
    if ( PageWatcher.isPlaying( true ) ) {
      $player.pause();
    }
    else {
      $player.play();
    }
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
    PageWatcher.processCommand_muteUnmute( true );
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
    PageWatcher.processCommand_muteUnmute( false );
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
    var intVolume = PageWatcher.getPlayerVolume();

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

      intVolume = Math.round( intVolume + ( intUpDown * intVolumeDelta ) );

      if ( intVolume > 100 )
        intVolume = 100;
      else if ( intVolume < 0 )
        intVolume = 0;

      $player.volume =
        intVolume !== 0
          ? intVolume / 100
          : intVolume
        ;

      PageWatcher.showNotificationOnVolumeChange( intVolume );
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
   * @param   strCommand
   *            Optional. Which command made this call
   * @param   boolDisregardSameMessage
   *            Optional. Whether to show the same message again or not
   * @return  void
   **/
  sendSameMessage : function(
      strFeedback
    , strCommand
    , boolDisregardSameMessage
  ) {
    PageWatcher.objStationInfo.strTrackInfo =
        $trackArtist.innerText + strTrackInfoDivider + $trackTitle.innerText;

    if ( $trackAlbum.innerText !== '' ) {
      PageWatcher.objStationInfo.strTrackInfo +=
        ' (' + $trackAlbum.innerText + ') ';
    }

    PageWatcher.objStationInfo.strAdditionalInfo = 
      ( typeof strFeedback === 'string' && strFeedback !== '' ) ?
        strFeedback : '';

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
  }
  ,

  /**
   * Show notification on volume change
   *
   * @type    method
   * @param   intVolume
   *            New volume level.
   * @return  void
   **/
  showNotificationOnVolumeChange : function( intVolume ) {
    PageWatcher.sendSameMessage(
      poziworldExtension.i18n.getMessage(
          'notificationButtonsVolumeChangeFeedback'
        , [ Math.round( intVolume ) ]
      )
    );
  }
  ,

  /**
   * If volume is not 0, then mute; otherwise unmute;
   * TODO: Create general muteUnmute, and use it here and for button click.
   *
   * @type    method
   * @param   boolMute
   *            Optional. Whether to mute or not (unmute).
   * @param   boolIsFromListener
   *            Optional. Whether called from "volumechange" listener or not.
   * @return  void
   **/
  processCommand_muteUnmute : function( boolMute, boolIsFromListener ) {
    if ( document.contains( $player ) ) {
      if ( typeof boolMute !== 'boolean' ) {
        boolMute = ! $player.muted;
      }

      var strCommand;

      if ( boolMute ) {
        strCommand = 'Mute';
      }
      else {
        strCommand = 'Unmute';
      }

      PageWatcher.objPlayerInfo.boolIsMuted = boolMute;

      if ( typeof boolIsFromListener !== 'boolean' || ! boolIsFromListener ) {
        PageWatcher.objPlayerInfo.boolIsVolumeChangeByUser = true;

        $player.muted = boolMute;
      }

      PageWatcher.sendSameMessage(
        poziworldExtension.i18n.getMessage(
          'notificationButtons' + strCommand + 'Feedback'
        )
      );
    }
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
    PageWatcher.sendSameMessage( '', 'showNotification' );
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
    if ( $trackImage.complete ) {
      PageWatcher.onTrackChange();
    }
    else {
      $trackImage.onload = function() {
        PageWatcher.onTrackChange();
      };
    }
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
      , intLogoWidth      = $trackImage.width
      , intLogoHeight     = $trackImage.height
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
        $trackImage
      , intLogoBorder
      , intLogoBorder
      , intLogoWidth
      , intLogoHeight
    );

    PageWatcher.objStationInfo.strLogoDataUri = $canvas.toDataURL();

    PageWatcher.boolWasLogoLoadedOnce = true;
  }
  ,

  /**
   * When track changed.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  onTrackChange : function() {
    PageWatcher.modifyStationLogo();

    if (
          ! PageWatcher.boolWasPageJustLoaded
      &&  $trackTitle.innerText !== strTrackTitleBeforeFirstLoaded
    ) {
      PageWatcher.sendSameMessage( '', '', false );
    }
  }
  ,

  /**
   * When begins to play for the first time.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  onInitialPlaying : function() {
    if ( PageWatcher.boolWasLogoLoadedOnce ) {
      PageWatcher.sendSameMessage(
        poziworldExtension.i18n.getMessage( 'notificationPlayerStatusChangeStarted' )
      );

      PageWatcher.boolWasPageJustLoaded = false;
    }

    $player.removeEventListener(
        'playing'
      , PageWatcher.onInitialPlaying
      , false
    );

    $player.addEventListener(
        'playing'
      , PageWatcher.onPlaying
      , false
    );

    $player.addEventListener(
        'pause'
      , PageWatcher.onPause
      , false
    );
  }
  ,

  /**
   * When begins to play (either after having been paused, or after ending
   * and then restarting).
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  onPlaying : function() {
    var strLangStartedOrResumed =
          poziworldExtension.i18n.getMessage(
            'notificationPlayerStatusChangeResumed'
          );

    if ( PageWatcher.boolWasPageJustLoaded ) {
      strLangStartedOrResumed =
        poziworldExtension.i18n.getMessage(
          'notificationPlayerStatusChangeStarted'
        );
    }

    PageWatcher.boolHadPlayedBefore = true;

    PageWatcher.sendSameMessage( strLangStartedOrResumed );

    PageWatcher.boolWasPageJustLoaded = false;
  }
  ,

  /**
   * When playback is paused.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  onPause : function() {
    PageWatcher.sendSameMessage(
      poziworldExtension.i18n.getMessage(
        'notificationPlayerStatusChangeStopped'
      )
    );
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
 * Watches for initial playing start
 *
 * @type    method
 * @param   objEvent
 * @return  void
 **/
$player.addEventListener(
    'playing'
  , PageWatcher.onInitialPlaying
  , false
);

/**
 * Watches for volume change
 *
 * @type    method
 * @param   objEvent
 * @return  void
 **/
$player.addEventListener(
    'volumechange'
  , function() {
      if ( ! PageWatcher.objPlayerInfo.boolIsVolumeChangeByUser ) {
        var boolIsMuted = $player.muted;

        if ( boolIsMuted !== PageWatcher.objPlayerInfo.boolIsMuted ) {
          PageWatcher.processCommand_muteUnmute( boolIsMuted, true );
        }
        else {
          var intVolume = PageWatcher.getPlayerVolume();

          PageWatcher.showNotificationOnVolumeChange( intVolume );
        }
      }
      else {
        PageWatcher.objPlayerInfo.boolIsVolumeChangeByUser = false;
      }
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
