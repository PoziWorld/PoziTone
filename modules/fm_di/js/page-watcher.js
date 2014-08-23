/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2014 PoziWorld
  License                 :           pozitone.com/license
  File                    :           js/page-watcher.js
  Description             :           DI.fm Page Watcher JavaScript

  Table of Contents:

  1. Page Watcher
      init()
      getPlayerInfo()
      getPlayerStatus()
      getPlayerVolume()
      processButtonClick_favorite()
      processButtonClick_playStop()
      processButtonClick_mute()
      processButtonClick_unmute()
      sendSameMessage()
      processCommand_muteUnmute()
      processCommand_showNotification()
      initObserver()
      initTitleContainerObserver()
      initPlayerStatusObserver()
      initFavoriteButtonContainerObserver()
      setLogoLoadedCallback()
      modifyStationLogo()
  2. Listeners
      titlesong DOMCharacterDataModified
      runtime.onMessage
  3. On Load
      Initialize

 ============================================================================ */

/* =============================================================================

  1. Page Watcher

 ============================================================================ */

const
    strFavoriteButtonContainerId          = 'wp-track-vote-buttons'
  , strFavoriteButtonClass                = 'up'
  , strFavoriteButtonQuerySelector        = 
      '#wp-track-vote-buttons .vote-btn.up'
  , strFavoriteButtonSuccessClass         = 'voted'
  , intVolumeBeforeMutedDefault           = 50
  , strMuteClass                          = 'icon-sound'
  , strUnmuteClass                        = 'icon-mute'
  , strTrackInfoVolumeMuted               = 'Volume: Muted'
  , strTrackInfoVolumePercentageRegExp    = /(Volume: )+([0-9]{1,3})+(%)/

  , strStationName                        =
      document.getElementById( 'channel-title' ).innerText
  , $stationDescription                   =
      document.querySelector( '.current-channel .description' )
  , strStationNamePlusDesc                =
      document.contains( $stationDescription ) ?
          strStationName + ': ' + $stationDescription.innerText
        : strStationName

  , $stationLogo                          =
      document.getElementById( 'art' ).getElementsByTagName( 'img' )[0]
  , $playStopButton                       =
      document.getElementById( 'ctl-play' )
  , $playerStatusIndicator                =
      $playStopButton.children[ 0 ]
  , $muteUnmuteButton                     =
      document.getElementById( 'btn-volume' )
  , $trackInfo                            =
      document.querySelectorAll( '.title-container .title' )[0]
  , $kbpsInfo                             =
      document.querySelector( '#settings-bitrate input:checked' )
  , $volumeHandle                         =
      document.getElementsByClassName( 'handle' )[0]

  , boolIsLoggedInMenuPresent             = 
          document.contains( document.getElementsByClassName( 'logout' )[0] )
      ||  document.contains( document.getElementById( 'link-logout' ) )
  , intKbps                               =
      document.contains( $kbpsInfo ) ?
          parseInt( $kbpsInfo.parentNode.innerText.replace( /\D+/g, '' ) )
        : 0

  , strNotificationSeparator              = "\n\n"
  , strModuleSettingsPrefix               = 'objSettings_'
  , strModule                             = 'fm_di'
  ;

var
    // On stop player removes track info, so store it in a var
    strTrackInfo
  , $favoriteButtonContainer
  , $favoriteButton
  , DisconnectableObserver                = null
  , DisconnectableObserver2               = null

  , PageWatcher                           = {
        boolIsUserLoggedIn                : boolIsLoggedInMenuPresent

      // Play/Stop button has class which is player status. 

      // When player is off (paused/stopped/not started), 
      // it has class 'play'; on - 'stop'.
      , objWantedClassRegExp              : /-(play|stop)/
      , intWantedClassLength              : 4

      , boolHadPlayedBefore               : false
      , boolWasPageJustLoaded             : true
      , boolDisregardSameMessage          : false

      , intLogoBorderToAdd                : 15
      , strLogoBorderColor                : '#FFF'

      , objPlayerInfo                     : {
            strModule                     : strModule
          , boolIsReady                   : document.contains( $playStopButton )
          , intVolume                     : 100
          , intVolumeBeforeMuted          : intVolumeBeforeMutedDefault
          , strStatus                     : ''
          , strPreviousStatus             : ''
          , boolCanPlayNextTrackLoggedOut : false
          , boolCanPlayPreviousTrackLoggedOut : false
        }
        // When set of vars changes check Background.saveRecentTrackInfo, Log
      , objStationInfo                    : {
            strStationName                : strStationName
          , strStationNamePlusDesc        : strStationNamePlusDesc
          , strLogoUrl                    : $stationLogo.src
          , strLogoDataUri                : $stationLogo.src
          , strTrackInfo                  : $trackInfo.innerText
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
    PageWatcher.initTitleContainerObserver();

    // There is no such option when not logged-in
     if ( PageWatcher.boolIsUserLoggedIn )
       PageWatcher.initFavoriteButtonContainerObserver();
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
    if ( document.contains( $playerStatusIndicator ) ) {
      // .search() is faster than for () - http://jsperf.com/for-loop-or-search-regexp
      var
          strPlayStopButtonClassAttr    = $playerStatusIndicator.className
        , intWantedClassPosition        = 
            strPlayStopButtonClassAttr
              .search( PageWatcher.objWantedClassRegExp )
        , strWantedClass                = 
            ( intWantedClassPosition !== -1 ) ?
                // +1 because we don't want to include dash symbol
                strPlayStopButtonClassAttr
                  .substr(
                      intWantedClassPosition + 1
                    , PageWatcher.intWantedClassLength
                  )
              : ''
        ;

      PageWatcher.objPlayerInfo.strStatus = strWantedClass;

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
    if ( document.contains( $volumeHandle ) )
      PageWatcher.objPlayerInfo.intVolume = 
        parseInt( $volumeHandle.style.left.replace( '%', '' ) );
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
    if ( document.contains( $favoriteButton ) )
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
    PageWatcher.objPlayerInfo.intVolumeBeforeMuted = 
      ( document.contains( $volumeHandle ) ) ?
          $volumeHandle.style.left.replace( '%', '' )
        : intVolumeBeforeMutedDefault
        ;

    if ( $muteUnmuteButton.classList.contains( strMuteClass ) )
      $muteUnmuteButton.click();

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
    if ( $muteUnmuteButton.classList.contains( strUnmuteClass ) )
      $muteUnmuteButton.click();

    PageWatcher.sendSameMessage(
      chrome.i18n.getMessage( 'notificationButtonsUnmuteFeedback' )
    );
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
    PageWatcher.objStationInfo.strTrackInfo = strTrackInfo;

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
      var strModuleSettings = strModuleSettingsPrefix + strModule;

      chrome.storage.sync.get( strModuleSettings, function( objReturn ) {
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
            strNotificationSeparator + strKbpsInfo;
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
   * @param   boolIsDisconnectable
   *            If this observer should be disconnected later
   * @return  void
   **/
  initObserver : function(
      $target
    , objOptions
    , funcCallback
    , boolIsDisconnectable
  ) {
    var MutationObserver = 
          window.MutationObserver || window.WebKitMutationObserver;

    if (
          typeof boolIsDisconnectable === 'undefined'
      &&  ! boolIsDisconnectable
    ) {
      var observer = new MutationObserver( funcCallback );
      observer.observe( $target, objOptions );
    }
    else if ( DisconnectableObserver === null ) {
      DisconnectableObserver = new MutationObserver( funcCallback );
      DisconnectableObserver.observe( $target, objOptions );
    }
    else {
      DisconnectableObserver2 = new MutationObserver( funcCallback );
      DisconnectableObserver2.observe( $target, objOptions );
    }
  }
  ,

  /**
   * Init title container observer
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  initTitleContainerObserver : function() {
    $titleContainer = document.getElementsByClassName( 'title-container' )[0];

    var
        $target       = $titleContainer
      , objOptions    = {
                            childList         : true
                          , subtree           : true
                        }
      , funcCallback  = function( arrMutations ) {  
          for ( var i = 0; i < arrMutations.length; i++ ) {
            var
                objMutationRecord   = arrMutations[ i ]
              , arrAddedNodes       = objMutationRecord.addedNodes
              ;

            if ( arrAddedNodes.length ) {
              // Wait till title gets appended to its container.
              var strNewTrackInfo = arrAddedNodes[ 0 ].textContent;

              if ( strNewTrackInfo !== '' ) {
                strTrackInfo = strNewTrackInfo;

                PageWatcher.boolHadPlayedBefore = true;

                PageWatcher.sendSameMessage(
                    chrome.i18n.getMessage(
                      'notificationPlayerStatusChangeStarted'
                    )
                  , true
                );

                PageWatcher.boolWasPageJustLoaded = false;

                PageWatcher.initPlayerStatusObserver();

                // Once button appeared, it doesn't dissapear - disconnect
                DisconnectableObserver.disconnect();
                return;
              }
            }
          };
        }
      ;

    PageWatcher.initObserver( $target, objOptions, funcCallback, true );
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
        $target       = $playerStatusIndicator
      , objOptions    = {
                            attributes        : true
                          , attributeFilter   : [ 'class' ]
                        }
      , funcCallback  = function( arrMutations ) {  
          for ( var i = 0; i < arrMutations.length; i++ ) {
            var strPlayerStatus = PageWatcher.getPlayerStatus( true );

            // To prevent a bug when mutation happens twice on MP3 player start
            if ( strPlayerStatus === 
                    PageWatcher.objPlayerInfo.strPreviousStatus )
              return;

            if ( strPlayerStatus === 'stop' )
              PageWatcher.sendSameMessage(
                  chrome.i18n.getMessage(
                      'notificationPlayerStatusChangeResumed'
                    )
                , true
              );
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
          };
        }
      ;

    PageWatcher.initObserver( $target, objOptions, funcCallback );
  }
  ,

  /**
   * Init favorite button container observer
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  initFavoriteButtonContainerObserver : function() {
    $favoriteButtonContainer = 
      document.getElementById( strFavoriteButtonContainerId );

    var
        $target       = $favoriteButtonContainer
      , objOptions    = {
                            childList         : true
                          , subtree           : true
                        }
      , funcCallback  = function( arrMutations ) {  
          for ( var i = 0; i < arrMutations.length; i++ ) {
            var
                objMutationRecord   = arrMutations[ i ]
              , arrAddedNodes       = objMutationRecord.addedNodes
              ;

            if ( arrAddedNodes.length ) {
              // Wait till favorite button gets appended to its container.
              var $tempFavoriteButton = 
                    arrAddedNodes[ 0 ]
                      .children[ 1 ]
                        .children[ 0 ]
                  ;

              if (
                $tempFavoriteButton
                  .classList
                    .contains( strFavoriteButtonClass )
              ) {
                $favoriteButton = 
                  document.querySelector( strFavoriteButtonQuerySelector );

                // If favorited track
                if (
                  $favoriteButton
                    .classList
                      .contains( strFavoriteButtonSuccessClass )
                )
                  PageWatcher.sendSameMessage(
                    chrome.i18n.getMessage(
                      'notificationFavoriteStatusSuccess'
                    )
                  );

                return;
              }
            }
          };
        }
      ;

    // DOM changes on favorite/unfavorite and track change, so no Disconnectable
    PageWatcher.initObserver( $target, objOptions, funcCallback );
  }
  ,

  /**
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
   * Use canvas to add border to original logo image,
   * so we can use it as notification icon.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  modifyStationLogo : function() {
    var
        $img              = new Image
      , $canvas           = document.createElement( 'canvas' )
      , intLogoBorder     = PageWatcher.intLogoBorderToAdd
      , intLogoWidth      = $stationLogo.width
      , intLogoHeight     = $stationLogo.height
      , intCanvasWidth    = intLogoWidth + 2 * intLogoBorder
      , intCanvasHeight   = intLogoHeight + 2 * intLogoBorder
      , strLogoSrc        = $stationLogo.src
      ;

    $img.crossOrigin      = 'Anonymous';
    $canvas.width         = intCanvasWidth;
    $canvas.height        = intCanvasHeight;

    var context           = $canvas.getContext( '2d' );

    $img.onload = function() {
      // Solid bg
      context.fillStyle     = PageWatcher.strLogoBorderColor;
      context.fillRect( 0, 0, intCanvasWidth, intCanvasHeight );

      context.drawImage(
          $img
        , intLogoBorder
        , intLogoBorder
        , intLogoWidth
        , intLogoHeight
      );

      PageWatcher.objStationInfo.strLogoDataUri = $canvas.toDataURL();
    }
    $img.src = strLogoSrc;
    // make sure the load event fires for cached images too
    if ( $img.complete || $img.complete === undefined ) {
      $img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
      $img.src = strLogoSrc;
    }
  }
};

/* =============================================================================

  2. Event Listeners

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
      var strNewTrackInfo = objEvent.newValue;

      // On volume change they replace track info with volume info
      if (
            strNewTrackInfo !== strTrackInfoVolumeMuted
        &&  ! strTrackInfoVolumePercentageRegExp.test( strNewTrackInfo )
        &&  strNewTrackInfo !== strTrackInfo
      ) {
        strTrackInfo = strNewTrackInfo;
        PageWatcher.objStationInfo.strTrackInfo = strNewTrackInfo;

        if ( ! PageWatcher.boolWasPageJustLoaded )
          PageWatcher.sendSameMessage( '', true, '', false );
        else
          PageWatcher.initPlayerStatusObserver();
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

  3. On Load

 ============================================================================ */

/**
 * Initialize
 *
 * @type    method
 * @param   No Parameters taken
 * @return  void
 **/
PageWatcher.init();