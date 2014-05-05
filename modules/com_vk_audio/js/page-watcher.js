/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2014 PoziWorld
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
      processButtonClick_playStop()
      processButtonClick_mute()
      processButtonClick_unmute()
      processCommand_muteUnmute()
      processCommand_showNotification()
      initObserver()
      initBodyObserver()
      initPlayerStatusObserver()
      initPlayerLitePlayStopButtonContainerObserver()
      initTrackTitleObserver()
      initPlayerFullOpacityObserver()
      onPlayerLiteAppearance()
      onPlayerFullAppearance()
      onFeedbackDialogAppearance()
      addTrackToPlaylist()
      playNextTrack()
      hideOrKeepPlayerVisibleFull()
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

var
  // Player
    strPlayerId                           = 'player'
  , strPlayerVisibleLiteId                = 'gp'
  , strPlayerVisibleLiteClickableId       = 'gp_info'
  , strPlayerVisibleFullId                = 'pad_wrap'
  , boolPlayerVisibleFullWasShown         = false

  , $player
  , $playerVisibleLiteClickable
  , $playerVisibleFull

  // Buttons
  , strPlayerVisibleFullToolbarId         = 'pd'
  , strPlayerVisibleFullAddableClass      = 'add'
  , strAddTrackToPlaylistBtnId            = 'pd_add'
  , strAddTrackToPlaylistBtnAddedClass    = 'added'
  , strPlayNextTrackBtnId                 = 'pd_next'
  , strPlayStopBtnPlayerLiteContainerId   = 'gp_play_btn'
  , strPlayStopBtnPlayerLiteId            = 'gp_play'

  , $playerVisibleFullToolbar
  , $addTrackToPlaylistBtn
  , $addTrackToPlaylistResponse
  , $playNextTrackBtn

  , $playStopBtnHeader                    = document
                                              .getElementById( 'head_play_btn' )
  , $playStopBtnPlayerLiteContainer
  , $playStopBtnPlayerLite
  , $mainPlayStopBtn                      = $playStopBtnHeader

  // Track title and performer
  , strTrackPerformerContainerId          = 'gp_performer'
  , strTrackTitleContainerId              = 'gp_title'
  , strPerformerTitleDivider              = ' - '

  , $trackPerformer
  , $trackTitle

  // Others
  , strVolumeLineId                       = 'pd_vol_line'
  , strFeedbackDialogClass                = 'top_result_baloon_wrap'
  , strFeedbackDialogHeaderClass          = 'top_result_header'

  // Module
  , strModule                             = 'com_vk_audio'
  , strImgPath                            = 'modules/' + strModule + '/img/'

  , DisconnectableObserver                = null

  , PageWatcher                           = {
        boolUserLoggedIn                  : document
                                              .getElementById( 'logout_link' ) !== null

      , boolHadPlayedBefore               : false
      , boolPageJustLoaded                : true
      , boolDisregardSameMessage          : false

      , objPlayerInfo                     : {
            strModule                     : strModule
          , boolIsReady                   : false
          , intVolume                     : 0
          , intVolumeBeforeMuted          : 0
          , strStatus                     : ''
          , strPreviousStatus             : ''
          , boolCanPlayNextTrackLoggedOut : false
        }
      , objStationInfo                    : {
            strStationName                : ''
          , strStationNamePlusDesc        : ''
          , strLogoUrl                    : '/' + strImgPath + 'VK_logo-32.png'
          , strLogoDataUri                : strImgPath + 'VK_logo-80.png'
          , strTrackInfo                  : ''
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
      var boolPlaying = $mainPlayStopBtn.classList.contains( 'playing' );

      // Follow the 101.ru logic:
      // 'stop' means it's in progress / playback can be stopped;
      // 'play' means it's off / playback can be started/resumed.
      PageWatcher.objPlayerInfo.strStatus = boolPlaying ? 'stop' : 'play';

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
              document.getElementById( strVolumeLineId ).style.width.replace( '%', '' )
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
      boolPlayerVisibleFullWasShown = false;
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
      boolPlayerVisibleFullWasShown = false;
      PageWatcher.initBodyObserver( strPlayerVisibleFullId, 'next' );

      if ( document.contains( $playerVisibleLiteClickable ) )
        $playerVisibleLiteClickable.click();
    };

    PageWatcher.playNextTrack( funcElse );
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
      chrome.i18n.getMessage( 'poziNotificationButtonsMuteFeedback' )
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
      chrome.i18n.getMessage( 'poziNotificationButtonsUnmuteFeedback' )
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
   * Init observer
   *
   * @type    method
   * @param   $target
   *            The Node on which to observe DOM mutations
   * @param   objOptions
   *            A MutationObserverInit object, specifies which DOM mutations should be reported.
   * @param   funcCallback
   *            The function which will be called on each DOM mutation
   * @param   boolDisconnectable
   *            If this observer should be disconnected later
   * @return  void
   **/
  initObserver : function( $target, objOptions, funcCallback, boolDisconnectable ) {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    if ( typeof boolDisconnectable === 'undefined' && !boolDisconnectable ) {
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
                &&  arrAddedNodes[ 0 ].classList.contains( strFeedbackDialogClass )
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
              , boolPlaying               = $target.classList.contains( 'playing' )
              , strUpdatedPreviousStatus  = boolPlaying ? 'play' : 'stop'
              ;

            // Sometimes mutation happens even without player status change
            if ( strUpdatedPreviousStatus === PageWatcher.objPlayerInfo.strPreviousStatus )
              return;

            // Follow the 101.ru logic
            PageWatcher.objPlayerInfo.strPreviousStatus = strUpdatedPreviousStatus;

            if ( boolPlaying ) {
              var strLangStartedOrResumed = 
                chrome.i18n.getMessage( 'poziNotificationPlayerStatusChangeResumed' );

              if ( PageWatcher.boolPageJustLoaded ) {
                strLangStartedOrResumed =
                  chrome.i18n.getMessage( 'poziNotificationPlayerStatusChangeStarted' );

                PageWatcher.initTrackTitleObserver();
              }

              PageWatcher.sendSameMessage( strLangStartedOrResumed );

              PageWatcher.boolHadPlayedBefore = true;
              PageWatcher.boolPageJustLoaded = false;
            }
            else if (
                  ! boolPlaying
              &&  PageWatcher.boolHadPlayedBefore
            )
              PageWatcher.sendSameMessage(
                chrome.i18n.getMessage( 'poziNotificationPlayerStatusChangeStopped' )
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
              // Wait till play stop button gets appended to lite player.
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
              PageWatcher.setTrackInfoAndSend();
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

    if ( PageWatcher.boolUserLoggedIn ) {
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
    var strFeedback = document
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
            'poziNotificationPlayerStatusChangeStarted'
          )
        ;

      PageWatcher.objPlayerInfo.strPreviousStatus = strPreviousStatus;

      PageWatcher.sendSameMessage( strMessage );

      PageWatcher.initTrackTitleObserver();

      PageWatcher.boolHadPlayedBefore = true;
      PageWatcher.boolPageJustLoaded = false;

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
            'poziNotificationAddTrackToPlaylistFeedbackAlreadyInPlaylist'
          )
        );

      PageWatcher.hideOrKeepPlayerVisibleFull();
    }
    else if ( typeof funcElse === 'function' )
      funcElse();
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
   * Hide full player if it was hidden before action simulation or
   * keep visible if it was visible.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  hideOrKeepPlayerVisibleFull : function() {
    if ( ! boolPlayerVisibleFullWasShown )
      $playerVisibleLiteClickable.click();

    boolPlayerVisibleFullWasShown = true;
  }
  ,

  /**
   * Send same message again (set of buttons needs to be changed)
   *
   * @type    method
   * @param   strFeedback
   *            Feedback for main actions
   * @return  void
   **/
  sendSameMessage : function( strFeedback ) {
    PageWatcher.setTrackInfoAndSend( false );

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
   * Combine performer, divider and title info and send
   *
   * @type    method
   * @param   boolSend
   *            Whether to set and send or just set
   * @param   strStatusMessage
   *            Status message to append
   * @return  void
   **/
  setTrackInfoAndSend : function( boolSend, strStatusMessage ) {
    PageWatcher.objStationInfo.strTrackInfo = 
        $trackPerformer.innerText
      + strPerformerTitleDivider
      + $trackTitle.innerText
      ;

    if ( typeof boolSend === 'undefined' || boolSend )
      PageWatcher.sendSameMessage( strStatusMessage );
  }
};

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
    else if ( strMessage === 'Are you ready to get a command?' ) {
      var strResponse = 'Affirmative.';

      if ( ! PageWatcher.objPlayerInfo.boolIsReady )
        strResponse = 'Negative.';

      funcSendResponse( strResponse );
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