/* =============================================================================

  Product: PoziTone
  Author: PoziWorld
  Copyright: (c) 2016 PoziWorld
  License: pozitone.com/license

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
      processButtonClick_volumeUp()
      processButtonClick_volumeDown()
      processCommand_showNotification()
      initObserver()
      initBodyObserver()
      initPlayerStatusObserver()
      initTrackTitleObserver()
      initPlayer2Observer()
      initAddToPlaylistBtnObserver()
      onPlayer2Appearance()
      onPlayer2LoadingDone()
      addTrackToPlaylist()
      playNextTrack()
      playPreviousTrack()
      hideOrKeepPlayer2()
      getKbpsInfoThenSendMessage()
      sendSameMessage()
      setTrackInfoAndSend()
      setListeners()
      triggerMouseEvent()

 ============================================================================ */

/* =============================================================================

  Page Watcher

 ============================================================================ */

( function () {
  'use strict';

  const
    // Player
      strIsPlayingClass = 'top_audio_player_playing'
    , strIsReadyClass = 'top_audio_player_enabled'
    , strPlayer2Class = 'top_audio_layer'
    , strPlayer2VisibleClass = 'eltt_vis'
    , strPlayer2LoadingClass = 'top_audio_loading'
    , strPlayPauseBtn2Selector = '.audio_page_player_play'
    , strAddToPlaylistButtonSelector = '.audio_page_player_add'
    , strAddToPlaylistButtonNotDoneClass = 'no_transition'
    , strAddToPlaylistButtonSuccessClass = 'audio_player_btn_added'

    // Others
    , boolIsUserMenuPresent = document.contains( document.getElementById( 'top_profile_link' ) )

    // Module
    , strModule = 'com_vk_audio'
    , strModuleSettings = strConstSettingsPrefix + strModule
    , strImgPath = 'modules/' + strModule + '/img/'
    ;

  var $player = document.getElementById( 'top_audio_player' )
    , $player2
    , $trackInfo = document.querySelector( '.top_audio_player_title_wrap' )
    , $playPauseBtn = document.querySelector( '.top_audio_player_play' )
    , $playPause2Btn
    , $playNextTrackBtn = document.querySelector( '.top_audio_player_next' )
    , $playPreviousTrackBtn = document.querySelector( '.top_audio_player_prev' )
    , $addToPlaylistBtn

    , boolIsPlayerReady = false
    , boolHadBeenPlayer2Displayed = false
    , boolWasPlayer2ShownBeforeAction = false

    // Others
    , intKbpsInfoIntervalAttempts = 0
    , intKbpsInfoIntervalAttemptsMax = 10
    , DisconnectableObserver = null

    , PageWatcher = {
          boolIsUserLoggedIn : boolIsUserMenuPresent

        , boolHadPlayedBefore : false
        , boolWasPageJustLoaded : true
        , boolDisregardSameMessage : false

        , objPlayerInfo : {
              strModule : strModule
            , boolIsReady : false
            , boolIsPlaying : false
            , boolIsMuted : false
            , intVolume : 0
            , intVolumeBeforeMuted : 0
              // TODO: Replace
            , strPreviousStatus : ''
            , boolCanPlayNextTrackLoggedOut : false
            , boolCanPlayPreviousTrackLoggedOut : false
          }
          // When set of vars changes check Background.saveRecentTrackInfo, Log
        , objStationInfo : {
              strStationName : ''
            , strStationNamePlusDesc : ''
            , strLogoUrl : '/' + strImgPath + 'vk-logo-32.png'
            , strLogoDataUri : strImgPath + 'vk-logo-80.png'
            , strTrackInfo : ''
            , strAdditionalInfo : ''
            , boolHasAddToPlaylistButton : boolIsUserMenuPresent
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
      PageWatcher.initBodyObserver( strPlayer2Class );
      PageWatcher.initPlayerStatusObserver();
      PageWatcher.setListeners();
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
      if ( document.contains( $player ) ) {
        PageWatcher.objPlayerInfo.boolIsPlaying = $player.classList.contains( strIsPlayingClass );
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
      if ( document.contains( $player ) ) {
        // TODO:
        PageWatcher.objPlayerInfo.intVolume = 100;
      }
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
      var funcWhenNotReady = function() {
        PageWatcher.initBodyObserver( strPlayer2Class, 'add' );

        if ( boolIsPlayerReady && document.contains( $player ) ) {
          PageWatcher.triggerMouseEvent( $player, 'mousedown' );
        }
      };

      PageWatcher.addTrackToPlaylist( funcWhenNotReady );
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
      PageWatcher.playNextTrack();
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
      PageWatcher.playPreviousTrack();
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
      if ( boolIsPlayerReady && document.contains( $playPauseBtn ) ) {
        $playPauseBtn.click();
      }
      else if ( boolHadBeenPlayer2Displayed && document.contains( $playPause2Btn ) ) {
        $playPause2Btn.click();
      }
      else if ( ! boolIsPlayerReady ) {
        PageWatcher.initBodyObserver( strPlayer2Class, 'play' );

        if ( document.contains( $player ) ) {
          PageWatcher.triggerMouseEvent( $player, 'mousedown' );
        }
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

    initObserver : function( $target, objOptions, funcCallback, boolIsDisconnectable ) {
      var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

      if (  typeof boolIsDisconnectable === 'undefined'
        &&  ! boolIsDisconnectable
      ) {
        var observer = new MutationObserver( funcCallback );

        observer.observe( $target, objOptions );
      }
      else {
        // Disconnect the one set previously
        if ( DisconnectableObserver ) {
          DisconnectableObserver.disconnect();
        }

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
      var $target = document.body
        , objOptions = {
              childList : true
          }
        , funcCallback = function( arrMutations ) {
            for ( var i = 0, l = arrMutations.length; i < l; i++ ) {
              var objMutationRecord = arrMutations[ i ]
                , arrAddedNodes = objMutationRecord.addedNodes
                ;

              if ( arrAddedNodes.length ) {
                // Wait till full player, which contains different buttons (next,
                // add to playlist, etc.), gets appended to <body />.
                if (  strElementIdOrClass === strPlayer2Class
                  &&  arrAddedNodes[ 0 ].classList.contains( strPlayer2Class )
                ) {
                  PageWatcher.onPlayer2Appearance( arrAddedNodes[ 0 ], strAction );
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
     * @param   No Parameters Taken
     * @return  void
     **/

    initPlayerStatusObserver : function() {
      var objOptions = {
              attributes : true
            , attributeFilter : [ 'class' ]
          }
        , funcCallback  = function( arrMutations ) {
            for ( var i = 0, l = arrMutations.length; i < l; i++ ) {
              var $target = arrMutations[ i ].target
                , boolIsReady = $target.classList.contains( strIsReadyClass )
                ;

              if ( boolIsReady ) {
                if ( ! boolIsPlayerReady ) {
                  PageWatcher.objPlayerInfo.boolIsReady = true;
                  boolIsPlayerReady = true;
                }
              }
              else {
                return;
              }

              var boolIsPlaying = $target.classList.contains( strIsPlayingClass )
                , strUpdatedPreviousStatus = boolIsPlaying ? 'play' : 'stop'
                ;

              // Sometimes mutation happens even without player status change
              if ( strUpdatedPreviousStatus === PageWatcher.objPlayerInfo.strPreviousStatus ) {
                return;
              }

              // Follow the 101.ru logic
              PageWatcher.objPlayerInfo.strPreviousStatus = strUpdatedPreviousStatus;

              if ( boolIsPlaying ) {
                var strLangStartedOrResumed =
                      pozitone.i18n.getMessage( 'notificationPlayerStatusChangeResumed' );

                if ( PageWatcher.boolWasPageJustLoaded ) {
                  strLangStartedOrResumed =
                    pozitone.i18n.getMessage( 'notificationPlayerStatusChangeStarted' );

                  PageWatcher.initTrackTitleObserver();
                }

                PageWatcher.getKbpsInfoThenSendMessage( strLangStartedOrResumed );

                PageWatcher.boolHadPlayedBefore = true;
                PageWatcher.boolWasPageJustLoaded = false;

                if ( boolHadBeenPlayer2Displayed ) {
                  $addToPlaylistBtn = document.querySelector( strAddToPlaylistButtonSelector );
                }
              }
              else if ( ! boolIsPlaying && PageWatcher.boolHadPlayedBefore ) {
                PageWatcher.sendSameMessage(
                  pozitone.i18n.getMessage( 'notificationPlayerStatusChangeStopped' )
                );
              }

              return;
            }
          }
        ;

      PageWatcher.initObserver( $player, objOptions, funcCallback );
    }
    ,

    /**
     * Init track title observer
     *
     * @type    method
     * @param   No Parameters Taken
     * @return  void
     **/

    initTrackTitleObserver : function() {
      var objOptions = {
              characterData : true
            , childList : true
            , subtree : true
          }
        , funcCallback  = function( arrMutations ) {
            for ( var i = 0, l = arrMutations.length; i < l; i++ ) {
              var objMutationRecord = arrMutations[ i ]
                , arrRemovedNodes = objMutationRecord.removedNodes
                ;

              if ( arrRemovedNodes.length ) {
                if ( $trackInfo.textContent !== '' && ! PageWatcher.boolWasPageJustLoaded ) {
                  PageWatcher.getKbpsInfoThenSendMessage();
                }
              }
            }
          }
        ;

      PageWatcher.initObserver( $trackInfo, objOptions, funcCallback );
    }
    ,

    /**
     * Full player appears with "opacity: 0". Wait for a class that sets "opacity: 1".
     *
     * @type    method
     * @param   funcWhenReady
     *            Callback function to run when the player is fully visible
     * @return  void
     **/

    initPlayer2Observer : function( funcWhenReady ) {
      var objOptions = {
              attributes : true
            , attributeFilter : [ 'class' ]
          }
        , funcCallback  = function( arrMutations ) {
            for ( var i = 0, l = arrMutations.length; i < l; i++ ) {
              var arrPlayer2ClassList = arrMutations[ 0 ].target.classList;

              if (  arrPlayer2ClassList.contains( strPlayer2VisibleClass )
                &&  ! arrPlayer2ClassList.contains( strPlayer2LoadingClass )
                &&  typeof funcWhenReady === 'function'
              ) {
                funcWhenReady();
                DisconnectableObserver.disconnect();
                return;
              }
            }
          }
        ;

      PageWatcher.initObserver( $player2, objOptions, funcCallback, true );
    }
    ,

    /**
     * Wait till "Add to playlist" button gets a class that lets us know the operation was successful.
     *
     * @type    method
     * @param   funcSuccessCallback
     *            Callback function to run when the operation was successful.
     * @return  void
     **/

    initAddToPlaylistBtnObserver : function( funcSuccessCallback ) {
      var objOptions = {
              attributes : true
            , attributeFilter : [ 'class' ]
          }
        , funcCallback = function( arrMutations ) {
            for ( var i = 0, l = arrMutations.length; i < l; i++ ) {
              var arrClassList = arrMutations[ 0 ].target.classList;

              if (  ! arrClassList.contains( strAddToPlaylistButtonNotDoneClass )
                &&  arrClassList.contains( strAddToPlaylistButtonSuccessClass )
                &&  typeof funcSuccessCallback === 'function'
              ) {
                funcSuccessCallback();
                return;
              }
            }
          }
        ;

      PageWatcher.initObserver( $addToPlaylistBtn, objOptions, funcCallback );
    }
    ,

    /**
     * Full player appeared.
     * Set vars, observers.
     *
     * @type    method
     * @param   $player
     *            The player element
     * @param   strAction
     *            Type of action to do
     * @return  void
     **/

    onPlayer2Appearance : function( $player, strAction ) {
      // Once player appeared, it doesn't disappear - disconnect
      DisconnectableObserver.disconnect();

      $player2 = $player;

      if ( strAction !== '' ) {
        var funcWhenReady;

        // TODO: Analyze which one is more popular, and check for it first
        if ( strAction === 'add' ) {
          funcWhenReady = function() {
            PageWatcher.onPlayer2LoadingDone();
            PageWatcher.addTrackToPlaylist();
          };
        }
        else if ( strAction === 'play' ) {
          funcWhenReady = function() {
            PageWatcher.onPlayer2LoadingDone();
            $playPause2Btn.click();
            PageWatcher.hideOrKeepPlayer2();
          };
        }

        PageWatcher.initPlayer2Observer( funcWhenReady || PageWatcher.onPlayer2LoadingDone );
      }
      else {
        PageWatcher.initPlayer2Observer( PageWatcher.onPlayer2LoadingDone );
      }
    }
    ,

    /**
     * Full player appeared and finished loading.
     *
     * @type    method
     * @param   No Parameters Taken
     * @return  void
     **/

    onPlayer2LoadingDone : function() {
      boolHadBeenPlayer2Displayed = true;
      $addToPlaylistBtn = document.querySelector( strAddToPlaylistButtonSelector );
      $playPause2Btn = document.querySelector( strPlayPauseBtn2Selector );
    }
    ,

    /**
     * Add track to playlist if button is present.
     *
     * @type    method
     * @param   funcWhenNotReady
     *            Do if button is not present
     * @return  void
     **/

    addTrackToPlaylist : function( funcWhenNotReady ) {
      if ( document.contains( $addToPlaylistBtn ) ) {
        // disconnect initPlayer2Observer()
        DisconnectableObserver.disconnect();

        // If addable (not "My Music") & hasn't been added yet
        if ( $addToPlaylistBtn.style.display !== 'none' ) {
          if ( ! $addToPlaylistBtn.classList.contains( strAddToPlaylistButtonSuccessClass ) ) {
            PageWatcher.initAddToPlaylistBtnObserver( function() {
              PageWatcher.hideOrKeepPlayer2();

              PageWatcher.sendSameMessage(
                pozitone.i18n.getMessage( 'notificationAddTrackToPlaylistFeedbackSuccessfullyAdded' )
              );
            } );

            $addToPlaylistBtn.click();
          }
          else {
            PageWatcher.sendSameMessage(
              pozitone.i18n.getMessage( 'notificationAddTrackToPlaylistFeedbackAlreadyInPlaylist' )
            );
          }
        }
        else {
          PageWatcher.hideOrKeepPlayer2();
        }
      }
      else if ( typeof funcWhenNotReady === 'function' ) {
        funcWhenNotReady();
      }
    }
    ,

    /**
     * Play next track if button is present.
     *
     * @type    method
     * @param   No Parameters Taken
     * @return  void
     **/

    playNextTrack : function() {
      if ( document.contains( $playNextTrackBtn ) ) {
        $playNextTrackBtn.click();
      }
    }
    ,

    /**
     * Play previous track if button is present.
     *
     * @type    method
     * @param   No Parameters Taken
     * @return  void
     **/

    playPreviousTrack : function() {
      if ( document.contains( $playPreviousTrackBtn ) ) {
        $playPreviousTrackBtn.click();
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

    hideOrKeepPlayer2 : function() {
      if ( ! boolWasPlayer2ShownBeforeAction ) {
        PageWatcher.triggerMouseEvent( $player, 'mousedown' );
      }

      boolWasPlayer2ShownBeforeAction = true;
    }
    ,

    /**
     * Get CBR (constant bitrate) of a track.
     * TODO: Update or remove.
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
        if (  typeof objModuleSettings === 'object'
          &&  typeof objModuleSettings.boolShowKbpsInfo === 'boolean'
          &&  objModuleSettings.boolShowKbpsInfo
        ) {
          var objLocalStorage = window.localStorage
            , miscPlaylist = objLocalStorage.pad_playlist
            , strAudioId = objLocalStorage.audio_id
            ;

          // localStorage vars got set up
          if (  typeof strAudioId === 'string'
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

            var strTrackUrl = objTrackInfo[ 2 ]
              , intTrackDuration = parseInt( objTrackInfo[ 3 ] )
              ;

            if (  typeof strTrackUrl === 'string' && strTrackUrl !== ''
              &&  typeof intTrackDuration === 'number'
              && ! isNaN( intTrackDuration )
            ) {
              // Get file size
              chrome.runtime.sendMessage(
                  {
                      strReceiver : 'background'
                    , boolMakeCall : true
                    , objVars : {
                          strUrl : strTrackUrl
                      }
                  }
                , function( intContentLength ) {
                    var strKbpsInfo = undefined;

                    if ( typeof intContentLength === 'number' ) {
                      var intKbps = Math.round( intContentLength / intTrackDuration / 125 / 32 ) * 32;

                      if ( intKbps > 320 ) {
                        intKbps = 320;
                      }

                      strKbpsInfo = intKbps + pozitone.i18n.getMessage( 'kbps' );
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
          else if ( intKbpsInfoIntervalAttempts < intKbpsInfoIntervalAttemptsMax ) {
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
        else {
          PageWatcher.setTrackInfoAndSend( true, strStatus, '', strCommand );
        }
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
      if ( typeof boolSetTrackInfo === 'undefined' || boolSetTrackInfo ) {
        PageWatcher.setTrackInfoAndSend( false );
      }

      PageWatcher.objStationInfo.strAdditionalInfo =
        ( typeof strFeedback === 'string' && strFeedback !== '' )
          ? strFeedback
          : ''
          ;

      chrome.runtime.sendMessage(
        {
            boolIsUserLoggedIn : PageWatcher.boolIsUserLoggedIn
          , boolDisregardSameMessage : true
          , objPlayerInfo : PageWatcher.getPlayerInfo()
          , objStationInfo : PageWatcher.objStationInfo
          , strCommand : strCommand
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
      PageWatcher.objStationInfo.strTrackInfo = $trackInfo.innerText;

      if ( typeof strKbpsInfo === 'string' && strKbpsInfo !== '' ) {
        PageWatcher.objStationInfo.strTrackInfo += strConstNotificationLinesSeparator + strKbpsInfo;
      }

      if ( typeof boolSend === 'undefined' || boolSend ) {
        PageWatcher.sendSameMessage( strStatusMessage, strCommand, false );
      }
    }
    ,

    /**
     * Set listeners.
     *
     * @type    method
     * @param   No Parameters Taken
     * @return  void
     **/

    setListeners : function() {

      /**
       * Listens for command sent from Background.
       * If requested function found, call it.
       *
       * @type    method
       * @param   strMessage
       *            Message received
       * @param   objSender
       *            Sender of the message
       * @return  void
       **/

      chrome.runtime.onMessage.addListener(
        function( strMessage, objSender, funcSendResponse ) {
          var funcToProceedWith = PageWatcher[ strMessage ];

          if ( typeof funcToProceedWith === 'function' ) {
            funcToProceedWith();
          }
          else if ( strMessage === 'Do you copy?' ) {
            funcSendResponse( 'Copy that.' );
          }
          else if ( strMessage === 'Ready for a command? Your name?' ) {
            var objResponse = {
                boolIsReady : PageWatcher.objPlayerInfo.boolIsReady
              , strModule : PageWatcher.objPlayerInfo.strModule
            };

            funcSendResponse( objResponse );
          }
        }
      );
    }
    ,

    /**
     * Simulate mouse events, such as 'mousedown', 'mouseup', 'mouseover'.
     *
     * @type    method
     * @param   $target
     *            Node which mouse event needs to be triggered on.
     * @param   strEventType
     *            Type of mouse event.
     * @return  void
     **/

    triggerMouseEvent : function( $target, strEventType ) {
      var objMouseEvent = document.createEvent( 'MouseEvents' );

      objMouseEvent.initEvent( strEventType, true, true );
      $target.dispatchEvent( objMouseEvent );
    }
  };

  pozitone.pageWatcherV2 = PageWatcher;
} )();
