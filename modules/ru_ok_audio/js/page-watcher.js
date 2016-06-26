/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2016 PoziWorld
  License                 :           pozitone.com/license
  File                    :           js/page-watcher.js
  Description             :           OK.ru Page Watcher JavaScript

  Table of Contents:

    Page Watcher
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
      processCommand_muteUnmute()
      processCommand_showNotification()
      initObserver()
      initMainBodyAreaObserver()
      initPlayerStatusObserver()
      initTrackTitleObserver()
      initAddTrackToPlaylistButtonObserver()
      onPlaybackStartedIndicatorAppearance()
      onPlayerFullAppearance()
      initPlayerElements()
      checkIfPlayerFullHadBeenOpened()
      checkIfPlayerStatusHadBeenChanged()
      hideOrKeepPlayerVisibleFull()
      getKbpsInfoThenSendMessage()
      sendSameMessage()
      setTrackInfoAndSend()
    Listeners
      runtime.onMessage
    On Load
      Initialize

 ============================================================================ */

/* =============================================================================

  Page Watcher

 ============================================================================ */

const
  // Player
    strPlayerId                           = '_music_player'
  , strPlaybackStartedIndicatorClass      = 'music_play-ntf'
  , strPlayerFullContainerId              = 'topPanelPopup_a'
  , strPlayerFullId                       = 'mmpcw'
  , strIsPlayingClass                     = 'toolbar_music-play__active'

  // Buttons
  , $switchPlayerFull                     =
      document.getElementById( 'hook_ToolbarIconMusic_ToolbarIconMusic' )
  , $playStopBtnHeader                    =
      document.getElementById( 'topPanelMusicPlayerControl' )
  , strAddTrackToPlaylistBtnSelector      = '.mus_player_actions.__add'
  , strAddTrackToPlaylistBtnAddedClass    = '__done'
  , strMuteUnmuteBtnClass                 = 'mus_player-volume_ic'
  , strMutedClass                         = '__mute'

  // Track title and performer
  , strPerformerTitleContainerClass       = 'mus_player_seek-artist'

  // Others
  , strMainBodyAreaId                     = 'hook_Block_BodySwitcher'
  , boolIsUserToolbarPresent              =
      document.contains(
        document.getElementById( 'hook_Block_ToolbarUserDropdown' )
      )

  // Module
  , strModule                             = 'ru_ok_audio'
  , strModuleSettings                     = strConstSettingsPrefix + strModule
  , strImgPath                            = 'modules/' + strModule + '/img/'
  ;

var
  // Player
    boolWasPlayerVisibleFullShown         = false

  , $player
  , $playerFullContainer
  , $playerFull

  // Buttons
  , $mainPlayStopBtn                      = $playStopBtnHeader
  , $muteUnmuteBtn
  , $addTrackToPlaylistBtn

  // Track title and performer
  , $trackPerformerTitle

  // Others
  , $mainBodyArea                         =
      document.getElementById( strMainBodyAreaId )
  , DisconnectableObserver                = null

  , PageWatcher                           = {
        boolIsUserLoggedIn                : boolIsUserToolbarPresent

      , boolHadPlayedBefore               : false
      , boolWasPageJustLoaded             : true
      , boolDisregardSameMessage          : false

      , objPlayerInfo                     : {
            strModule                     : strModule
          , boolIsReady                   : false
          , boolIsPlaying                 : false
          , boolIsMuted                   : false
          , intVolume                     : 0
          , intVolumeBeforeMuted          : 0
          , strPreviousStatus             : ''
          , boolCanPlayNextTrackLoggedOut : false
          , boolCanPlayPreviousTrackLoggedOut : false
        }
        // When set of vars changes check Background.saveRecentTrackInfo, Log
      , objStationInfo                    : {
            strStationName                : ''
          , strStationNamePlusDesc        : ''
          , strLogoUrl                    :
              '/' + strImgPath + 'ok-logo-orange-32.png'
          , strLogoDataUri                : strImgPath + 'ok-logo-orange-80.png'
          , strTrackInfo                  : ''
          , strAdditionalInfo             : ''
          , boolHasAddToPlaylistButton    : boolIsUserToolbarPresent
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
    PageWatcher.initMainBodyAreaObserver();
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
   * @return  void / string
   **/
  getPlayerStatus : function() {
    if ( document.contains( $mainPlayStopBtn ) ) {
      PageWatcher.objPlayerInfo.boolIsPlaying =
        $mainPlayStopBtn.classList.contains( strIsPlayingClass );
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
    if (
          document.contains( $muteUnmuteBtn )
      &&  $muteUnmuteBtn.classList.contains( strMutedClass )
    )
      PageWatcher.objPlayerInfo.intVolume = 0;
    else
      PageWatcher.objPlayerInfo.intVolume = 1;
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
    if ( document.contains( $addTrackToPlaylistBtn ) ) {
      if (
        ! $addTrackToPlaylistBtn
            .classList.contains( strAddTrackToPlaylistBtnAddedClass )
      )
        $addTrackToPlaylistBtn.click();
      else
        PageWatcher.sendSameMessage(
          chrome.i18n.getMessage(
            'notificationAddTrackToPlaylistFeedbackAlreadyInPlaylist'
          )
        );
    }
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
    if ( document.contains( $player ) )
      $player.lcNext();
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
    if ( document.contains( $player ) )
      $player.lcPrev();
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
    if ( document.contains( $playStopBtnHeader ) )
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
    if (
          document.contains( $muteUnmuteBtn )
      &&  ! $muteUnmuteBtn.classList.contains( strMutedClass )
    ) {
      $muteUnmuteBtn.click();
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
    if (
          document.contains( $muteUnmuteBtn )
      &&  $muteUnmuteBtn.classList.contains( strMutedClass )
    ) {
      $muteUnmuteBtn.click();
      PageWatcher.objPlayerInfo.boolIsMuted = false;
    }

    PageWatcher.sendSameMessage(
      chrome.i18n.getMessage( 'notificationButtonsUnmuteFeedback' )
    );
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
   * Init main body area observer
   *
   * @type    method
   * @param   boolWasPlayerFullForcedToOpen
   *            Whether full player was forced to open by PageWatcher or not
   * @return  void
   **/
  initMainBodyAreaObserver : function( boolWasPlayerFullForcedToOpen ) {
    var
        $target       = $mainBodyArea
      , objOptions    = {
                            childList         : true
                        }
      , funcCallback  = function( arrMutations ) {
          for ( var i = 0, l = arrMutations.length; i < l; i++ ) {
            var
                objMutationRecord   = arrMutations[ i ]
              , arrAddedNodes       = objMutationRecord.addedNodes
              ;

            if ( arrAddedNodes.length ) {
              // Wait till an element containing performer and title info
              // gets appended to main body area (does not disappear after).
              if (
                arrAddedNodes[ 0 ]
                  .classList.contains( strPlaybackStartedIndicatorClass )
              ) {
                PageWatcher.onPlaybackStartedIndicatorAppearance();
                return;
              }
              // Wait till full player, which contains different buttons (next,
              // add to playlist, etc.), gets appended to main body area
              // (does not disappear after).
              else if ( arrAddedNodes[ 0 ].id === strPlayerFullContainerId ) {
                if (
                      typeof boolWasPlayerFullForcedToOpen === 'undefined'
                  ||  ! boolWasPlayerFullForcedToOpen
                ) {
                  PageWatcher.onPlaybackStartedIndicatorAppearance( false );
                  boolWasPlayerVisibleFullShown = true;
                }

                PageWatcher.onPlayerFullAppearance();
                return;
              }
            }
          }
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
          for ( var i = 0, l = arrMutations.length; i < l; i++ ) {
            var
                $target                   = arrMutations[ i ].target
              , boolIsPlaying             = 
                  $target.classList.contains( strIsPlayingClass )
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
                PageWatcher.initAddTrackToPlaylistButtonObserver();
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
          }
        }
      ;

    PageWatcher.initObserver( $target, objOptions, funcCallback );
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
        $target       =
          document
            .getElementsByClassName( strPerformerTitleContainerClass )[ 0 ]
      , objOptions    = {
                            characterData     : true
                          , childList         : true
                          , attributes        : true
                          , subtree           : true
                        }
      , funcCallback  = function( arrMutations ) {  
          for ( var i = 0, l = arrMutations.length; i < l; i++ ) {
            if (
                  arrMutations[ i ].target.textContent !== ''
              &&  $trackPerformerTitle.innerText !==
                    PageWatcher.objStationInfo.strTrackInfo
            )
              PageWatcher.getKbpsInfoThenSendMessage();
          }
        }
      ;

    this.initPlayerElements();
    PageWatcher.initObserver( $target, objOptions, funcCallback );
  }
  ,

  /**
   * Init "Add track to playlist" button changes observer
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  initAddTrackToPlaylistButtonObserver : function() {
    $addTrackToPlaylistBtn  =
      document.querySelector( strAddTrackToPlaylistBtnSelector );

    var
        $target       = $addTrackToPlaylistBtn
      , objOptions    = {
                            attributes        : true
                          , attributeFilter   : [ 'class' ]
                          , attributeOldValue : true
                        }
      , funcCallback  = function( arrMutations ) {
          for ( var i = 0, l = arrMutations.length; i < l; i++ ) {
            var
                objMutation   = arrMutations[ i ]
              , arrClassList  = objMutation.target.classList
              , strOldClass   = objMutation.oldValue
              ;

            // OK adds 'added' class first, and a few seconds later 'disabled'.
            // Avoid sending message the second time.
            if (
                  arrClassList.contains( strAddTrackToPlaylistBtnAddedClass )
              &&  ! ~ strOldClass.indexOf( strAddTrackToPlaylistBtnAddedClass )
            ) {
              PageWatcher.sendSameMessage(
                chrome.i18n.getMessage(
                  'notificationAddTrackToPlaylistFeedbackSuccessfullyAdded'
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
   * Playback started on the page for the first time.
   * Set vars, observers.
   *
   * @type    method
   * @param   boolWasPlayerFullForcedToOpen
   *            Whether full player was forced to open by PageWatcher or not
   * @return  void
   **/
  onPlaybackStartedIndicatorAppearance : function(
      boolWasPlayerFullForcedToOpen
    ) {
    // Once player appeared, it doesn't disappear - disconnect
    DisconnectableObserver.disconnect();

    PageWatcher.objPlayerInfo.boolIsReady = true;

    $player = 
      document.getElementById( strPlayerId );

    if (
          typeof boolWasPlayerFullForcedToOpen === 'undefined'
      ||  ! boolWasPlayerFullForcedToOpen
    )
      PageWatcher.checkIfPlayerFullHadBeenOpened();
  }
  ,

  /**
   * Full player appeared.
   * Set vars, observers.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  onPlayerFullAppearance : function() {
    // Once player appeared, it doesn't disappear - disconnect
    DisconnectableObserver.disconnect();

    this.initPlayerElements();

    PageWatcher.hideOrKeepPlayerVisibleFull();
    PageWatcher.initPlayerStatusObserver( $playStopBtnHeader );
    PageWatcher.checkIfPlayerStatusHadBeenChanged( $playStopBtnHeader );
  }
  ,

  /**
   * Find player nodes and cache them.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  initPlayerElements : function() {
    $playerFull = document.getElementById( strPlayerFullId );
    $trackPerformerTitle = document.getElementsByClassName( strPerformerTitleContainerClass )[ 0 ];
    $muteUnmuteBtn = document.getElementsByClassName( strMuteUnmuteBtnClass )[ 0 ];
  }
  ,

  /**
   * Check whether full player had been opened prior to playback start.
   * This would give us an option to get additional info, such as sound volume.
   * 
   * true after lcServer() has been called (Notifier inited).
   * This is a fallback.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  checkIfPlayerFullHadBeenOpened : function() {
    $playerFullContainer = document.getElementById( strPlayerFullContainerId );

    if ( ! document.contains( $playerFullContainer ) ) {
      PageWatcher.initMainBodyAreaObserver( true );

      function openPlayerFull () {
        odklMusic.openMusic();
      }

      var
          $script = document.createElement( 'script' )
        , $text   = document.createTextNode( '(' + openPlayerFull + ')();' )
        ;

      $script.appendChild( $text );
      document.body.appendChild( $script );
    }
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
      &&  $targetPlayStopBtn.classList.contains( strIsPlayingClass )
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
      PageWatcher.initAddTrackToPlaylistButtonObserver();

      PageWatcher.boolHadPlayedBefore = true;
      PageWatcher.boolWasPageJustLoaded = false;
    }
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
      $switchPlayerFull.click();

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
    // TODO
    PageWatcher.setTrackInfoAndSend( true, strStatus, '', strCommand );
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
    PageWatcher.objStationInfo.strTrackInfo = $trackPerformerTitle.innerText;

    if ( typeof strKbpsInfo === 'string' && strKbpsInfo !== '' )
      PageWatcher.objStationInfo.strTrackInfo += 
        strConstNotificationLinesSeparator + strKbpsInfo;

    if ( typeof boolSend === 'undefined' || boolSend )
      PageWatcher.sendSameMessage( strStatusMessage, strCommand, false );
  }
};

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
