/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2014 PoziWorld
  License                 :           pozitone.com/license
  File                    :           js/page-watcher.js
  Description             :           VK.com Page Watcher JavaScript

  Table of Contents:

  1. Page Watcher
      init()
      getPlayerInfo()
      getPlayerStatus()
      getPlayerVolume()
      processButtonClick_add()
      processButtonClick_next()
      processButtonClick_previous()
      processButtonClick_playStop()
      processButtonClick_mute()
      processButtonClick_unmute()
      changeVolume()
      processButtonClick_volumeUp()
      processButtonClick_volumeDown()
      processCommand_muteUnmute()
      processCommand_showNotification()
      initObserver()
      initBodyObserver()
      initPlayerStatusObserver()
      initPlayerLitePlayButtonContainerObserver()
      initTrackTitleObserver()
      initPlayerFullOpacityObserver()
      onPlayerLiteAppearance()
      onPlayerFullAppearance()
      onFeedbackDialogAppearance()
      addTrackToPlaylist()
      playNextTrack()
      playPreviousTrack()
      hideOrKeepPlayerVisibleFull()
      getKbpsInfoThenSendMessage()
      sendSameMessage()
      setTrackInfoAndSend()
  2. Listeners
      runtime.onMessage
  3. On Load
      Initialize

 ============================================================================ */

/* =============================================================================

  1. Page Watcher

 ============================================================================ */

const
  // Player
    strPlayerId                           = 'player'
  , strPlayerVisibleLiteId                = 'gp'
  , strPlayerVisibleLiteClickableId       = 'gp_info'
  , strPlayerVisibleFullId                = 'pad_wrap'

  // Buttons
  , strPlayerVisibleFullToolbarId         = 'pd'
  , strPlayerVisibleFullAddableClass      = 'add'
  , strAddTrackToPlaylistBtnId            = 'pd_add'
  , strAddTrackToPlaylistBtnAddedClass    = 'added'
  , strPlayNextTrackBtnId                 = 'pd_next'
  , strPlayPreviousTrackBtnId             = 'pd_prev'
  , strPlayStopBtnPlayerLiteContainerId   = 'gp_play_btn'
  , strPlayStopBtnPlayerLiteId            = 'gp_play'

  , $playStopBtnHeader                    = 
      document.getElementById( 'head_play_btn' )

  // Track title and performer
  , strTrackPerformerContainerId          = 'gp_performer'
  , strTrackTitleContainerId              = 'gp_title'
  , strPerformerTitleDivider              = ' - '

  // Others
  , strVolumeLineId                       = 'pd_vol_line'
  , strFeedbackDialogClass                = 'top_result_baloon_wrap'
  , strFeedbackDialogHeaderClass          = 'top_result_header'
  , boolIsLogOutButtonPresent             = 
      document.contains( document.getElementById( 'logout_link' ) )

  // Module
  , strModule                             = 'com_vk_audio'
  , strModuleSettings                     = strConstSettingsPrefix + strModule
  , strImgPath                            = 'modules/' + strModule + '/img/'
  ;

var
  // Player
    boolWasPlayerVisibleFullShown         = false

  , $player
  , $playerVisibleLiteClickable
  , $playerVisibleFull

  // Buttons
  , $playerVisibleFullToolbar
  , $addTrackToPlaylistBtn
  , $addTrackToPlaylistResponse
  , $playNextTrackBtn
  , $playPreviousTrackBtn

  , $playStopBtnPlayerLiteContainer
  , $playStopBtnPlayerLite
  , $mainPlayStopBtn                      = $playStopBtnHeader

  // Track title and performer
  , $trackPerformer
  , $trackTitle

  // Others
  , intKbpsInfoIntervalAttempts           = 0
  , intKbpsInfoIntervalAttemptsMax        = 10
  , DisconnectableObserver                = null

  , PageWatcher                           = {
        boolIsUserLoggedIn                : boolIsLogOutButtonPresent

      , boolHadPlayedBefore               : false
      , boolWasPageJustLoaded             : true
      , boolDisregardSameMessage          : false

      , objPlayerInfo                     : {
            strModule                     : strModule
          , boolIsReady                   : false
          , intVolume                     : 0
          , intVolumeBeforeMuted          : 0
          , strStatus                     : ''
          , strPreviousStatus             : ''
          , boolCanPlayNextTrackLoggedOut : false
          , boolCanPlayPreviousTrackLoggedOut : false
        }
        // When set of vars changes check Background.saveRecentTrackInfo, Log
      , objStationInfo                    : {
            strStationName                : ''
          , strStationNamePlusDesc        : ''
          , strLogoUrl                    : '/' + strImgPath + 'vk-logo-32.png'
          , strLogoDataUri                : strImgPath + 'vk-logo-80.png'
          , strTrackInfo                  : ''
          , strAdditionalInfo             : ''
          , boolHasAddToPlaylistButton    : boolIsLogOutButtonPresent
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
    PageWatcher.initBodyObserver( strPlayerVisibleLiteId );
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
   * @param   boolReturnStatus
   *            Return status or not
   * @return  void / string
   **/
  getPlayerStatus : function( boolReturnStatus ) {
    if ( document.contains( $mainPlayStopBtn ) ) {
      var boolIsPlaying = $mainPlayStopBtn.classList.contains( 'playing' );

      // Follow the 101.ru logic:
      // 'stop' means it's in progress / playback can be stopped;
      // 'play' means it's off / playback can be started/resumed.
      PageWatcher.objPlayerInfo.strStatus = boolIsPlaying ? 'stop' : 'play';

      if ( typeof boolReturnStatus !== 'undefined' )
        return strWantedClass;
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
    if ( document.contains( $player ) )
      PageWatcher.objPlayerInfo.intVolume = 
        ( typeof $player.getVolume === 'function' ) ?
            $player.getVolume()
          : parseInt(
              document
                .getElementById( strVolumeLineId )
                  .style.width.replace( '%', '' )
            );
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
    var funcElse = function() {
      boolWasPlayerVisibleFullShown = false;
      PageWatcher.initBodyObserver( strPlayerVisibleFullId, 'add' );

      if ( document.contains( $playerVisibleLiteClickable ) )
        $playerVisibleLiteClickable.click();
    };

    PageWatcher.addTrackToPlaylist( funcElse );
  }
  ,

  /**
   * Simulate "Next track" player method
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  processButtonClick_next : function() {
    var funcElse = function() {
      boolWasPlayerVisibleFullShown = false;
      PageWatcher.initBodyObserver( strPlayerVisibleFullId, 'next' );

      if ( document.contains( $playerVisibleLiteClickable ) )
        $playerVisibleLiteClickable.click();
    };

    PageWatcher.playNextTrack( funcElse );
  }
  ,

  /**
   * Simulate "Previous track" player method
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  processButtonClick_previous : function() {
    var funcElse = function() {
      boolWasPlayerVisibleFullShown = false;
      PageWatcher.initBodyObserver( strPlayerVisibleFullId, 'previous' );

      if ( document.contains( $playerVisibleLiteClickable ) )
        $playerVisibleLiteClickable.click();
    };

    PageWatcher.playPreviousTrack( funcElse );
  }
  ,

  /**
   * Simulate "Play/Stop" player method
   * Don't send message because Mutation Observer takes care of it
   * 
   * If player is already on the page, 
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  processButtonClick_playStop : function() {
    $playStopBtnPlayerLite = 
      document.getElementById( strPlayStopBtnPlayerLiteId );

    if ( document.contains( $playStopBtnPlayerLite ) ) {
      $playStopBtnPlayerLite.click();
      return;
    }

    $playStopBtnHeader.click();
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
    PageWatcher.objPlayerInfo.intVolumeBeforeMuted = $player.getVolume();
    $player.setVolume( 0 );

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
    $player.setVolume( PageWatcher.objPlayerInfo.intVolumeBeforeMuted );

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
    var intVolume = $player.getVolume();

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

      // PoziTone operates with %, VK operates with a 0–1 range
      intVolume += ( intUpDown * intVolumeDelta / 100 );

      if ( intVolume > 1 )
        intVolume = 1;
      else if ( intVolume < 0 )
        intVolume = 0;
      else
        // http://stackoverflow.com/a/5651139
        intVolume = intVolume.toFixed( 2 );

      $player.setVolume( intVolume );

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
    PageWatcher.getKbpsInfoThenSendMessage( '', 'showNotification' );
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
    else {
      DisconnectableObserver = new MutationObserver( funcCallback );
      DisconnectableObserver.observe( $target, objOptions );
    }
  }
  ,

  /**
   * Init <body /> observer
   *
   * @type    method
   * @param   strElementIdOrClass
   *            Appearance of which element to observe
   * @param   strAction
   *            Optional. Type of action to do
   * @return  void
   **/
  initBodyObserver : function( strElementIdOrClass, strAction ) {
    var
        $target       = document.body
      , objOptions    = {
                            childList         : true
                        }
      , funcCallback  = function( arrMutations ) {  
          for ( var i = 0; i < arrMutations.length; i++ ) {
            var
                objMutationRecord   = arrMutations[ i ]
              , arrAddedNodes       = objMutationRecord.addedNodes
              ;

            if ( arrAddedNodes.length ) {
              // Wait till <embed /> player as well as lite player, which
              // contains performer and title info, get appended to <body />.
              if (
                    strElementIdOrClass === strPlayerVisibleLiteId
                &&  arrAddedNodes[ 0 ].id === strPlayerVisibleLiteId
              ) {
                PageWatcher.onPlayerLiteAppearance();
                return;
              }
              // Wait till full player, which contains different buttons (next,
              // add to playlist, etc.), gets appended to <body />.
              else if (
                    strElementIdOrClass === strPlayerVisibleFullId
                &&  arrAddedNodes[ 0 ].id === strPlayerVisibleFullId
              ) {
                PageWatcher.onPlayerFullAppearance( strAction );
                return;
              }
              // Wait till feedback dialog gets appended to <body />.
              else if (
                    strElementIdOrClass === strFeedbackDialogClass
                &&  arrAddedNodes[ 0 ]
                      .classList
                        .contains( strFeedbackDialogClass )
              ) {
                PageWatcher.onFeedbackDialogAppearance();
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
   * @param   $targetPlayStopBtn
   *            Button in the header (logged-in) or lite player's (logged-out)
   * @return  void
   **/
  initPlayerStatusObserver : function( $targetPlayStopBtn ) {
    var
        $target       = $targetPlayStopBtn
      , objOptions    = {
                            attributes        : true
                          , attributeFilter   : [ 'class' ]
                        }
      , funcCallback  = function( arrMutations ) {  
          for ( var i = 0; i < arrMutations.length; i++ ) {
            var
                $target                   = arrMutations[ i ].target
              , boolIsPlaying             = 
                  $target.classList.contains( 'playing' )
              , strUpdatedPreviousStatus  = boolIsPlaying ? 'play' : 'stop'
              ;

            // Sometimes mutation happens even without player status change
            if ( strUpdatedPreviousStatus === 
                    PageWatcher.objPlayerInfo.strPreviousStatus )
              return;

            // Follow the 101.ru logic
            PageWatcher.objPlayerInfo.strPreviousStatus = 
              strUpdatedPreviousStatus;

            if ( boolIsPlaying ) {
              var strLangStartedOrResumed = 
                    chrome.i18n.getMessage(
                      'notificationPlayerStatusChangeResumed'
                    );

              if ( PageWatcher.boolWasPageJustLoaded ) {
                strLangStartedOrResumed =
                  chrome.i18n.getMessage(
                    'notificationPlayerStatusChangeStarted'
                  );

                PageWatcher.initTrackTitleObserver();
              }

              PageWatcher.getKbpsInfoThenSendMessage( strLangStartedOrResumed );

              PageWatcher.boolHadPlayedBefore   = true;
              PageWatcher.boolWasPageJustLoaded = false;
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

            return;
          };
        }
      ;

    PageWatcher.initObserver( $target, objOptions, funcCallback );
  }
  ,

  /**
   * Init lite player observer
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  initPlayerLitePlayButtonContainerObserver : function() {
    $playStopBtnPlayerLiteContainer = 
      document.getElementById( strPlayStopBtnPlayerLiteContainerId );

    var
        $target       = $playStopBtnPlayerLiteContainer
      , objOptions    = {
                            childList         : true
                        }
      , funcCallback  = function( arrMutations ) {  
          for ( var i = 0; i < arrMutations.length; i++ ) {
            var
                objMutationRecord   = arrMutations[ i ]
              , arrAddedNodes       = objMutationRecord.addedNodes
              ;

            if ( arrAddedNodes.length ) {
              // Wait till play/stop button gets appended to lite player.
              if (
                arrAddedNodes[ 0 ]
                  .children[ 0 ]
                    .children[ 0 ]
                      .id === strPlayStopBtnPlayerLiteId
              ) {
                $playStopBtnPlayerLite = 
                  document.getElementById( strPlayStopBtnPlayerLiteId );

                $mainPlayStopBtn = $playStopBtnPlayerLite;

                PageWatcher.initPlayerStatusObserver( $playStopBtnPlayerLite );
                PageWatcher
                  .checkIfPlayerStatusHadBeenChanged( $playStopBtnPlayerLite );

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
   * Init track title observer
   *
   * @type    method
   * @param   funcWhenReady
   *            Callback when mini-player appears on the page
   * @return  void
   **/
  initTrackTitleObserver : function( funcWhenReady ) {
    var
        $target       = document.getElementById( strTrackTitleContainerId )
      , objOptions    = {
                            characterData     : true
                          , childList         : true
                          , attributes        : true
                          , subtree           : true
                        }
      , funcCallback  = function( arrMutations ) {  
          for ( var i = 0; i < arrMutations.length; i++ ) {
            var
                objMutationRecord   = arrMutations[ i ]
              ;

            if ( objMutationRecord.target.textContent !== '' )
              PageWatcher.getKbpsInfoThenSendMessage();
          };
        }
      ;

    PageWatcher.initObserver( $target, objOptions, funcCallback );
  }
  ,

  /**
   * Full player appears with "opacity: 0". Wait till it gets "opacity: 1".
   *
   * @type    method
   * @param   funcWhenReady
   * @return  void
   **/
  initPlayerFullOpacityObserver : function( funcWhenReady ) {
    var
        $target       = $playerVisibleFull
      , objOptions    = {
                            attributes        : true
                          , attributeFilter   : [ 'style' ]
                        }
      , funcCallback  = function( arrMutations ) {  
          for ( var i = 0; i < arrMutations.length; i++ ) {
            if (
                  arrMutations[i].target.style.opacity == 1
              &&  typeof funcWhenReady === 'function'
            ) {
              funcWhenReady();
              return;
            }
          };
        }
      ;

    PageWatcher.initObserver( $target, objOptions, funcCallback, true );
  }
  ,

  /**
   * Lite player appeared.
   * Set vars, observers.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  onPlayerLiteAppearance : function() {
    // Once player appeared, it doesn't dissapear - disconnect
    DisconnectableObserver.disconnect();

    PageWatcher.objPlayerInfo.boolIsReady = true;

    $player = 
      document.getElementById( strPlayerId );
    $playerVisibleLiteClickable =
      document.getElementById( strPlayerVisibleLiteClickableId );

    $trackPerformer =
      document.getElementById( strTrackPerformerContainerId );
    $trackTitle =
      document.getElementById( strTrackTitleContainerId );

    if ( PageWatcher.boolIsUserLoggedIn ) {
      PageWatcher.initPlayerStatusObserver( $playStopBtnHeader );
      PageWatcher.checkIfPlayerStatusHadBeenChanged( $playStopBtnHeader );
    }
    else
      PageWatcher.initPlayerLitePlayButtonContainerObserver();
  }
  ,

  /**
   * Full player appeared.
   * Set vars, observers.
   *
   * @type    method
   * @param   strAction
   *            Type of action to do
   * @return  void
   **/
  onPlayerFullAppearance : function( strAction ) {
    // Once player appeared, it doesn't dissapear - disconnect
    DisconnectableObserver.disconnect();

    $playerVisibleFull = document.getElementById( strPlayerVisibleFullId );

    if ( strAction !== '' ) {
      var funcWhenFullOpacity = function() {};

      // TODO: Analyze which one is more popular, and check for it first
      if ( strAction === 'next' )
        funcWhenFullOpacity = function() { PageWatcher.playNextTrack(); };
      else if ( strAction === 'previous' )
        funcWhenFullOpacity = function() { PageWatcher.playPreviousTrack(); };
      else if ( strAction === 'add' )
        funcWhenFullOpacity = function() { PageWatcher.addTrackToPlaylist(); };

      PageWatcher.initPlayerFullOpacityObserver( funcWhenFullOpacity );
    }
  }
  ,

  /**
   * Feedback dialog appeared.
   * Grap the message and display it in the notification.
   *
   * @type    method
   * @param   funcWhenReady
   * @return  void
   **/
  onFeedbackDialogAppearance : function( funcWhenReady ) {
    var strFeedback =
          document
            .getElementsByClassName( strFeedbackDialogHeaderClass )[ 0 ]
              .innerText
            ;

    PageWatcher.sendSameMessage( strFeedback );
  }
  ,

  /**
   * Sometimes player status changes before player appears (logged in) or
   * starts playing (logged-out).
   * 
   * true after lcServer() has been called (Notifier inited).
   * This is a fallback.
   *
   * @type    method
   * @param   $targetPlayStopBtn
   *            Button in the header (logged-in) or lite player's (logged-out)
   * @return  void
   **/
  checkIfPlayerStatusHadBeenChanged : function( $targetPlayStopBtn ) {
    if (
          document.contains( $targetPlayStopBtn )
      &&  $targetPlayStopBtn.classList.contains( 'playing' )
    ) {
      var
          strPreviousStatus = 'play'
        , strMessage        = chrome.i18n.getMessage(
            'notificationPlayerStatusChangeStarted'
          )
        ;

      PageWatcher.objPlayerInfo.strPreviousStatus = strPreviousStatus;

      PageWatcher.getKbpsInfoThenSendMessage( strMessage );

      PageWatcher.initTrackTitleObserver();

      PageWatcher.boolHadPlayedBefore = true;
      PageWatcher.boolWasPageJustLoaded = false;

      // Debug
      console.log( 'PoziTone: PageWatcher.checkIfPlayerStatusHadBeenChanged' );
    }
  }
  ,

  /**
   * Add track to playlist if button is present.
   *
   * @type    method
   * @param   funcElse
   *            Do if button is not present
   * @return  void
   **/
  addTrackToPlaylist : function( funcElse ) {
    $playerVisibleFullToolbar =
      document.getElementById( strPlayerVisibleFullToolbarId );
    $addTrackToPlaylistBtn =
      document.getElementById( strAddTrackToPlaylistBtnId );

    if ( document.contains( $addTrackToPlaylistBtn ) ) {
      // disconnect initPlayerFullOpacityObserver()
      DisconnectableObserver.disconnect();

      // If addable (not "My Music") & hasn't been added yet
      if (
            $playerVisibleFullToolbar
              .classList
                .contains( strPlayerVisibleFullAddableClass )
        &&  ! $addTrackToPlaylistBtn
                .classList
                  .contains( strAddTrackToPlaylistBtnAddedClass )
      ) {
        // Wait for feedback dialog
        PageWatcher.initBodyObserver( strFeedbackDialogClass );

        $addTrackToPlaylistBtn.click();
      }
      // If not addable ("My Music") or has been added already
      else if (
            ! $playerVisibleFullToolbar
                .classList
                  .contains( strPlayerVisibleFullAddableClass )
        ||  $addTrackToPlaylistBtn
              .classList
                .contains( strAddTrackToPlaylistBtnAddedClass )
      )
        PageWatcher.sendSameMessage(
          chrome.i18n.getMessage(
            'notificationAddTrackToPlaylistFeedbackAlreadyInPlaylist'
          )
        );

      PageWatcher.hideOrKeepPlayerVisibleFull();
    }
    else if ( typeof funcElse === 'function' )
      funcElse();
  }
  ,

  /**
   * Play next track if button is present.
   *
   * @type    method
   * @param   funcElse
   *            Do if button is not present
   * @return  void
   **/
  playNextTrack : function( funcElse ) {
    $playNextTrackBtn = document.getElementById( strPlayNextTrackBtnId );

    if ( document.contains( $playNextTrackBtn ) ) {
      // disconnect initPlayerFullOpacityObserver()
      DisconnectableObserver.disconnect();

      $playNextTrackBtn.click();

      PageWatcher.hideOrKeepPlayerVisibleFull();
    }
    else if ( typeof funcElse === 'function' )
      funcElse();
  }
  ,

  /**
   * Play previous track if button is present.
   *
   * @type    method
   * @param   funcElse
   *            Do if button is not present
   * @return  void
   **/
  playPreviousTrack : function( funcElse ) {
    $playPreviousTrackBtn = 
      document.getElementById( strPlayPreviousTrackBtnId );

    if ( document.contains( $playPreviousTrackBtn ) ) {
      // disconnect initPlayerFullOpacityObserver()
      DisconnectableObserver.disconnect();

      $playPreviousTrackBtn.click();

      PageWatcher.hideOrKeepPlayerVisibleFull();
    }
    else if ( typeof funcElse === 'function' )
      funcElse();
  }
  ,

  /**
   * Hide full player if it was hidden before action simulation or
   * keep visible if it was visible.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  hideOrKeepPlayerVisibleFull : function() {
    if ( ! boolWasPlayerVisibleFullShown )
      $playerVisibleLiteClickable.click();

    boolWasPlayerVisibleFullShown = true;
  }
  ,

  /**
   * Get CBR (constant bitrate) of a track.
   *
   * @type    method
   * @param   strStatus
   *            Optional. Additional playback info
   * @param   strCommand
   *            Optional. Which command made this call
   * @return  void
   **/
  getKbpsInfoThenSendMessage : function( strStatus, strCommand ) {
    // Check settings whether kbps info should be shown
    StorageSync.get( strModuleSettings, function( objReturn ) {
      var objModuleSettings = objReturn[ strModuleSettings ];

      // If set to show kbps info
      if (
            typeof objModuleSettings === 'object'
        &&  typeof objModuleSettings.boolShowKbpsInfo === 'boolean'
        &&  objModuleSettings.boolShowKbpsInfo
      ) {
        var
            objLocalStorage = window.localStorage
          , miscPlaylist    = objLocalStorage.pad_playlist
          , strAudioId      = objLocalStorage.audio_id
          ;

        // localStorage vars got set up
        if (
              typeof strAudioId === 'string'
          &&  typeof miscPlaylist === 'string'
        ) {
          intKbpsInfoIntervalAttempts = 0;

          // Convert to object
          miscPlaylist = JSON.parse( miscPlaylist );

          // If playlist has no info about this track, do not continue
          var objTrackInfo = miscPlaylist[ strAudioId.replace( /"/g, '' ) ];

          if ( typeof objTrackInfo !== 'object' ) {
            PageWatcher.setTrackInfoAndSend( true, strStatus, '', strCommand );
            return;
          }

          var
              strTrackUrl       = objTrackInfo[ 2 ]
            , intTrackDuration  = parseInt( objTrackInfo[ 3 ] )
            ;

          if (
                typeof strTrackUrl === 'string' && strTrackUrl !== ''
            &&  typeof intTrackDuration === 'number'
            && ! isNaN( intTrackDuration )
          ) {
            // Get file size
            chrome.runtime.sendMessage(
                {
                    strReceiver     : 'background'
                  , boolMakeCall    : true
                  , objVars         : {
                        strUrl      : strTrackUrl
                    }
                }
              , function( intContentLength ) {
                  var strKbpsInfo = undefined;

                  if ( typeof intContentLength === 'number' ) {
                    var intKbps = 
                          Math.round(
                            intContentLength / intTrackDuration / 125 / 32
                          ) * 32;

                    if ( intKbps > 320 )
                      intKbps = 320;

                    strKbpsInfo = intKbps + chrome.i18n.getMessage( 'kbps' );
                  }

                  PageWatcher.setTrackInfoAndSend(
                      true
                    , strStatus
                    , strKbpsInfo
                    , strCommand
                  );
              }
            );
          }
        }
        else if (
          intKbpsInfoIntervalAttempts < intKbpsInfoIntervalAttemptsMax
        ) {
          // Wait till localStorage vars get set up
          setTimeout(
              function() {
                PageWatcher.getKbpsInfoThenSendMessage( strStatus, strCommand );
              }
            , 100
          );
        }
      }
      // Not set to show kbps info
      else
        PageWatcher.setTrackInfoAndSend( true, strStatus, '', strCommand );
    });
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
   * @param   boolSetTrackInfo
   *            Optional. Whether to set track info
   * @return  void
   **/
  sendSameMessage : function( strFeedback, strCommand, boolSetTrackInfo ) {
    if ( typeof boolSetTrackInfo === 'undefined' || boolSetTrackInfo )
      PageWatcher.setTrackInfoAndSend( false );

    PageWatcher.objStationInfo.strAdditionalInfo = 
      ( typeof strFeedback === 'string' && strFeedback !== '' ) ?
        strFeedback : '';

    chrome.runtime.sendMessage(
      {
          boolIsUserLoggedIn        : PageWatcher.boolIsUserLoggedIn
        , boolDisregardSameMessage  : true
        , objPlayerInfo             : PageWatcher.getPlayerInfo()
        , objStationInfo            : PageWatcher.objStationInfo
        , strCommand                : strCommand
      }
    );
  }
  ,

  /**
   * Combine performer, divider and title info and send
   *
   * @type    method
   * @param   boolSend
   *            Whether to set and send or just set
   * @param   strStatusMessage
   *            Optional. Status message to append
   * @param   strKbpsInfo
   *            Optional. CBR of a track
   * @param   strCommand
   *            Optional. Which command made this call
   * @return  void
   **/
  setTrackInfoAndSend : function(
      boolSend
    , strStatusMessage
    , strKbpsInfo
    , strCommand
  ) {
    PageWatcher.objStationInfo.strTrackInfo = 
        $trackPerformer.innerText
      + strPerformerTitleDivider
      + $trackTitle.innerText
      ;

    if ( typeof strKbpsInfo === 'string' && strKbpsInfo !== '' )
      PageWatcher.objStationInfo.strTrackInfo += 
        strConstNotificationLinesSeparator + strKbpsInfo;

    if ( typeof boolSend === 'undefined' || boolSend )
      PageWatcher.sendSameMessage( strStatusMessage, strCommand, false );
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

  2. Event Listeners

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