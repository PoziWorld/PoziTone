/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2016 PoziWorld
  License                 :           pozitone.com/license
  File                    :           js/page-watcher.js
  Description             :           DI.fm Page Watcher JavaScript

  Table of Contents:

    Page Watcher
      init()
      getPlayerInfo()
      getPlayerStatus()
      getPlayerVolume()
      getStationInfo()
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
      initPlayerContainerObserver()
      initTitleContainerObserver()
      initStationTitleContainerObserver()
      initPlayerStatusObserver()
      initFavoriteButtonContainerObserver()
      cacheLogoElement()
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
    strPlayerId = 'player'
  , strPlayerContainerId = 'webplayer-region'
  , strStationTitleContainerSelector = '#webplayer-region .channel-detail'
  , strStationTitleSelector = '.title'
  , strStationDescriptionSelector = '#hero .desc'

  , strPlayStopButtonSelector = '#webplayer-region .track-region .controls .ico'
  , strIsPlayingClass = 'icon-pause'
  , strIsNotPlayingClass = 'icon-play'

  , strFavoriteButtonContainerSelector = '#webplayer-region .vote-buttons'
  , strFavoriteButtonClass = 'up'
  , strFavoriteButtonQuerySelector =
      strFavoriteButtonContainerSelector + ' .vote-btn.up'
  , strFavoriteButtonSuccessClass = 'active'

  , intVolumeBeforeMutedDefault = 80
  , strMuteClass = 'icon-sound'
  , strUnmuteClass = 'icon-mute'
  , strTrackInfoVolumeMuted = 'Volume: Muted'
  , strTrackInfoVolumePercentageRegExp = /(Volume: )+([0-9]{1,3})+(%)/

  , strTrackInfoPlaceholder1 = 'connecting...'
  , strTrackInfoPlaceholder2 = 'stopped'

  , $playerContainer =
      document.getElementById( strPlayerContainerId )

  , strModule = 'fm_di'
  , strModuleSettings = strConstSettingsPrefix + strModule
  ;

var
    // On stop player removes track info, so store it in a var
    strTrackInfo
  , $stationTitleContainer
  , $stationTitle
  , strStationName
  , $stationDescription
  , strStationNamePlusDesc

  , $player
  , $stationLogo
  , $playStopButton
  , $muteUnmuteButton
  , $favoriteButtonContainer
  , $favoriteButton
  , $trackInfo
  , $kbpsInfo
  , $volumeHandle

  , boolIsLoggedInMenuPresent
  , intKbps

  , DisconnectableObserver = null
  , DisconnectableObserver2 = null

  , PageWatcher = {
        boolIsUserLoggedIn : false

      , boolHadPlayedBefore : false
      , boolWasPageJustLoaded : true
      , boolDisregardSameMessage : false

      , intLogoBorderToAdd : 0
      , strLogoBorderColor : '#f5f5f5'

      , objPlayerInfo : {
            strModule : strModule
          , boolIsReady : false
          , boolIsPlaying : false
          , boolIsMuted : false
          , intVolume : 100
          , intVolumeBeforeMuted : intVolumeBeforeMutedDefault
          , boolWasVolumeMessageJustDisplayed : false
          , strStatus : ''
          , strPreviousStatus : ''
          , boolCanPlayNextTrackLoggedOut : false
          , boolCanPlayPreviousTrackLoggedOut : false
        }
        // When set of vars changes check Background.saveRecentTrackInfo, Log
      , objStationInfo : {
            strStationName : ''
          , strStationNamePlusDesc : ''
          , strLogoUrl : ''
          , strLogoDataUri : ''
          , strTrackInfo : ''
          , strAdditionalInfo : ''
          , boolHasAddToPlaylistButton : false
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
    this.initPlayerContainerObserver();
  }
  ,

  /**
   * Get player info
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
   * Get player status from Play/Stop Button class attr
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  getPlayerStatus : function() {
    if ( document.contains( $playStopButton ) ) {
      PageWatcher.objPlayerInfo.boolIsPlaying =
        $playStopButton.classList.contains( strIsPlayingClass );
    }
  }
  ,

  /**
   * Get player volume
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
   * Get station info (title, description, logo).
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  getStationInfo : function() {
    strStationName =
      $stationTitleContainer
        .querySelector( strStationTitleSelector )
        .textContent
      ;

    $stationDescription =
      document.querySelector( strStationDescriptionSelector );

    strStationNamePlusDesc =
      document.contains( $stationDescription )
        ? strStationName + ': ' + $stationDescription.textContent
        : strStationName
      ;

    var objStationInfo = PageWatcher.objStationInfo
      , strLogoUrl = $stationLogo.src
      ;

    objStationInfo.strStationName = strStationName;
    objStationInfo.strStationNamePlusDesc = strStationNamePlusDesc;
    objStationInfo.strLogoUrl = strLogoUrl;
    objStationInfo.strLogoDataUri = strLogoUrl;
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

    if ( $muteUnmuteButton.classList.contains( strMuteClass ) ) {
      $muteUnmuteButton.click();
      PageWatcher.objPlayerInfo.boolIsMuted = true;
    }

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
    if ( $muteUnmuteButton.classList.contains( strUnmuteClass ) ) {
      $muteUnmuteButton.click();
      PageWatcher.objPlayerInfo.boolIsMuted = false;
    }

    PageWatcher.sendSameMessage(
      chrome.i18n.getMessage( 'notificationButtonsUnmuteFeedback' )
    );
  }
  ,

  /**
   * Change volume level (up/down).
   * Volume level value range: 0-1.
   *
   * @type    method
   * @param   strDirection
   *            'up' or 'down'.
   * @return  void
   **/
  changeVolume : function( strDirection ) {
    var intVolume = $player._getVolume();

    // Can't be changed, reached the limit
    if (
          strDirection === 'up' && intVolume >= 1
      ||  strDirection === 'down' && intVolume <= 0
    )
      return;

    var funcSetVolume = function( intVolumeDelta ) {
      var
          intUpDown = 1
        , intPercentage
        ;

      if ( strDirection === 'down' )
        intUpDown = -1;

      // PoziTone operates with %, DI operates with a 0–1 range
      intVolume += ( intUpDown * intVolumeDelta / 100 );

      if ( intVolume > 1 )
        intVolume = 1;
      else if ( intVolume < 0 )
        intVolume = 0;
      else
        // http://stackoverflow.com/a/5651139
        intVolume = intVolume.toFixed( 2 );

      $player._setVolume( intVolume );

      // parseInt & Math.floor return 28 for .29 * 100
      intPercentage = Math.round( intVolume * 100 );

      PageWatcher.sendSameMessage(
        chrome.i18n.getMessage(
            'notificationButtonsVolumeChangeFeedback'
          , [ intPercentage ]
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

    if ( PageWatcher.objPlayerInfo.intVolume !== 0 )  {
      PageWatcher.processButtonClick_mute();
    }
    else {
      PageWatcher.processButtonClick_unmute();
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
   * Init player container observer
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  initPlayerContainerObserver : function() {
    var $target = $playerContainer
      , objOptions = {
            childList : true
          , subtree : true
        }
      , funcCallback  = function( arrMutations ) {
          for ( var i = 0, l = arrMutations.length; i < l; i++ ) {
            var objMutationRecord = arrMutations[ i ]
              , arrAddedNodes = objMutationRecord.addedNodes
              ;

            if ( arrAddedNodes.length ) {
              $player = document.getElementById( strPlayerId );

              PageWatcher.cacheLogoElement();
              $playStopButton =
                document.querySelector( strPlayStopButtonSelector );
              $muteUnmuteButton =
                document.querySelector( '[data-toggle-mute]' );
              $trackInfo =
                document.querySelector( '#webplayer-region .track-region .track-title' );
              $kbpsInfo =
                document.querySelector( '#settings-bitrate input:checked' );
              $volumeHandle =
                document.querySelector( '#webplayer-region .handle' );

              boolIsLoggedInMenuPresent =
                document.contains( document.getElementById( 'account-nav' ) );
              intKbps =
                document.contains( $kbpsInfo )
                  ? parseInt( $kbpsInfo.parentNode.innerText.match( /[0-9]{2,4}/g ) )
                  : 0
                ;

              $stationTitleContainer =
                document.querySelector( strStationTitleContainerSelector );
              PageWatcher.getStationInfo();

              PageWatcher.boolIsUserLoggedIn = boolIsLoggedInMenuPresent;

              PageWatcher.objPlayerInfo.boolIsReady = true;

              PageWatcher.initPlayerStatusObserver();
              PageWatcher.initStationTitleContainerObserver();

              // There is no such option when not logged-in
              //if ( PageWatcher.boolIsUserLoggedIn )
              //  PageWatcher.initFavoriteButtonContainerObserver();

              // Once button appeared, it doesn't disappear - disconnect
              DisconnectableObserver.disconnect();
              return;
            }
          }
        }
      ;

    PageWatcher.initObserver( $target, objOptions, funcCallback, true );
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
    var $target = $trackInfo
      , objOptions = {
            childList : true
          , subtree : true
        }
      , funcCallback = function( arrMutations ) {
          for ( var i = 0, l = arrMutations.length; i < l; i++ ) {
            var objMutationRecord = arrMutations[ i ]
              , arrAddedNodes = objMutationRecord.addedNodes
              ;

            if ( arrAddedNodes.length ) {
              var strNewTrackInfo = arrAddedNodes[ 1 ].textContent;

              if (
                    ! ~ [
                        strTrackInfoPlaceholder1
                      , strTrackInfoPlaceholder2
                      , strTrackInfoVolumeMuted
                    ].indexOf( strNewTrackInfo )
                &&  ! strTrackInfoVolumePercentageRegExp.test( strNewTrackInfo )
                &&  ! PageWatcher.objPlayerInfo.boolWasVolumeMessageJustDisplayed
              ) {
                if ( PageWatcher.objPlayerInfo.boolIsPlaying ) {
                  var strMessage
                    , boolDisregardSameMessage = false
                    ;

                  if ( PageWatcher.boolWasPageJustLoaded ) {
                    strMessage =
                      chrome.i18n.getMessage(
                        'notificationPlayerStatusChangeStarted'
                      );

                    boolDisregardSameMessage = true;
                  }
                  else if ( PageWatcher.objPlayerInfo.strPreviousStatus === 'stopped' ) {
                    strMessage=
                      chrome.i18n.getMessage(
                        'notificationPlayerStatusChangeResumed'
                      );

                    boolDisregardSameMessage = true;
                  }

                  strTrackInfo = strNewTrackInfo;

                  PageWatcher.sendSameMessage(
                      strMessage
                    , undefined
                    , undefined
                    , boolDisregardSameMessage
                  );

                  PageWatcher.boolHadPlayedBefore   = true;
                  PageWatcher.boolWasPageJustLoaded = false;
                }

                // Follow the 101.ru logic
                PageWatcher.objPlayerInfo.strPreviousStatus =
                  PageWatcher.objPlayerInfo.boolIsPlaying
                    ? 'playing'
                    : 'stopped'
                  ;
                PageWatcher.objPlayerInfo.boolWasVolumeMessageJustDisplayed = false;

                return;
              }
              else if (
                    (
                          strNewTrackInfo === strTrackInfoVolumeMuted
                      ||  strTrackInfoVolumePercentageRegExp.test( strNewTrackInfo )
                    )
                &&  PageWatcher.objPlayerInfo.boolIsPlaying
              ) {
                PageWatcher.objPlayerInfo.boolWasVolumeMessageJustDisplayed = true;

                return;
              }
              else {
                PageWatcher.objPlayerInfo.boolWasVolumeMessageJustDisplayed = false;
              }
            }
          }
        }
      ;

    PageWatcher.initObserver( $target, objOptions, funcCallback );
  }
  ,

  /**
   * Init title container observer
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  initStationTitleContainerObserver : function() {
    var $target = $stationTitleContainer.parentNode
      , objOptions = {
            childList : true
          , subtree : true
        }
      , funcCallback = function( arrMutations ) {
          for ( var i = 0, l = arrMutations.length; i < l; i++ ) {
            var objMutationRecord = arrMutations[ i ]
              , arrAddedNodes = objMutationRecord.addedNodes
              ;

            if ( arrAddedNodes.length ) {
              $stationTitle =
                $stationTitleContainer.querySelector( strStationTitleSelector );

              if ( document.contains( $stationTitle ) ) {
                PageWatcher.cacheLogoElement();
                PageWatcher.setLogoLoadedCallback();
                PageWatcher.getStationInfo();

                return;
              }
            }
          }
        }
      ;

    PageWatcher.initObserver( $target, objOptions, funcCallback );
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
    var $target = $playStopButton.parentNode.parentNode
      , objOptions = {
            childList : true
          , subtree : true
        }
      , funcCallback = function( arrMutations ) {
          for ( var i = 0, l = arrMutations.length; i < l; i++ ) {
            $playStopButton =
              document.querySelector( strPlayStopButtonSelector );

            var arrClassList = $playStopButton.classList
              , boolIsPlaying = arrClassList.contains( strIsPlayingClass )
              , boolIsStopped = arrClassList.contains( strIsNotPlayingClass )
              , strPlayerStatus = boolIsPlaying
                  ? 'playing'
                  : boolIsStopped
                      ? 'stopped'
                      : 'changing'
              ;

            if ( ~ [ PageWatcher.objPlayerInfo.strPreviousStatus, 'changing' ].indexOf( strPlayerStatus ) ) {
              return;
            }

            PageWatcher.objPlayerInfo.boolIsPlaying = boolIsPlaying;

            if ( boolIsPlaying ) {
              if ( PageWatcher.boolWasPageJustLoaded ) {
                PageWatcher.setLogoLoadedCallback();
                PageWatcher.initTitleContainerObserver();
              }
            }
            else if (
                  ! boolIsPlaying
              &&  PageWatcher.boolHadPlayedBefore
            )
              PageWatcher.sendSameMessage(
                chrome.i18n.getMessage(
                  'notificationPlayerStatusChangeStopped'
                )
              );

              PageWatcher.objPlayerInfo.strPreviousStatus = 'stopped';

            return;
          }
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
      document.getElementById( strFavoriteButtonContainerSelector );

    var $target       = $favoriteButtonContainer
      , objOptions    = {
                            childList         : true
                          , subtree           : true
                        }
      , funcCallback  = function( arrMutations ) {
          for ( var i = 0, l = arrMutations.length; i < l; i++ ) {
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
          }
        }
      ;

    // DOM changes on favorite/unfavorite and track change, so no Disconnectable
    PageWatcher.initObserver( $target, objOptions, funcCallback );
  }
  ,

  /**
   * Caches station logo element.
   * Done on page load and station change.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  cacheLogoElement : function() {
    $stationLogo = document.querySelector( '#webplayer-region .channel-region .artwork img' );
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
    var $img              = new Image
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
    };

    $img.src = strLogoSrc;

    // make sure the load event fires for cached images too
    if ( $img.complete || $img.complete === undefined ) {
      $img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
      $img.src = strLogoSrc;
    }
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
