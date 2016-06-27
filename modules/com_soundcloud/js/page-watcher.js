/* =============================================================================

  Product: PoziTone module for SoundCloud
  Author: PoziWorld
  Copyright: (c) 2016 PoziWorld
  License: pozitone.com/license

  Table of Contents:

    PageWatcher
      init()
      initObserver()
      initPlayerStatusObserver()
      initTrackTitleContainerWrapperObserver()
      initFavoriteBtnObserver()
      addRuntimeOnMessageListener()
      convertNotificationLogoUrl()
      sendMediaEvent()
      triggerButtonClick()
      triggerPlayerAction_favorite()
      triggerPlayerAction_next()
      triggerPlayerAction_previous()
      triggerPlayerAction_playStop()
      triggerPlayerAction_mute()
      triggerPlayerAction_unmute()
      triggerPlayerAction_muteUnmute()
      triggerPlayerAction_showNotification()
      isMuted()

 ============================================================================ */

( function() {
  'use strict';

  function PageWatcher() {
    const
        strModule = 'com_soundcloud'
      , strImgPath = 'modules/' + strModule + '/img/'
      ;

    /* DOM-related variables */
    this.$player = document.querySelector( '.playControls' );
    this.$playPauseBtn = document.querySelector( '.playControl' );
    this.$playNextTrackBtn = document.querySelector( '.skipControl__next' );
    this.$playPreviousTrackBtn = document.querySelector( '.skipControl__previous' );
    this.$muteUnmuteBtn = document.querySelector( '.volume__button' );
    this.$muteUnmuteBtnContainer = document.querySelector( '.volume' );
    this.$trackTitleContainerWrapper = document.querySelector( '.playbackSoundBadge' );

    this.strPlayerVisibleClass = 'm-visible';
    this.strPlayPauseBtnPlayingClass = 'playing';
    this.strMuteUnmuteBtnContainerMutedClass = 'muted';
    this.strTrackTitleContainerClass = 'playbackSoundBadge__titleContextContainer';

    this.strUserMenuSelector = '.header__userNav';
    this.strFavoriteBtnSelector = '.playbackSoundBadge__like';
    this.strFavoriteBtnSuccessClass = 'sc-button-selected';

    this.DisconnectableObserver = null;
    /* DOM-related variables - END */

    this.boolIsUserLoggedIn = false;
    this.boolHadPlayedBefore = false;
    this.boolWasPageJustLoaded = true;
    this.boolDisregardSameMessage = true;

    this.objPlayerInfo = {
        strModule : strModule
      , boolIsReady : true
      , boolIsPlaying : false
      , boolIsMuted : false
      , intVolume : 10 // site uses 0-10 scale
      , boolCanPlayNextTrackLoggedOut : true
      , boolCanPlayPreviousTrackLoggedOut : true
    };

    this.objStationInfo = {
        strStationName : 'SoundCloud' // TODO: Change
      , strStationNamePlusDesc : document.title // TODO: Change
      , strLogoUrl : '/' + strImgPath + 'soundcloud-logo-48.svg'
      , strLogoDataUri : strImgPath + 'soundcloud-logo-80.png'
      , strTrackInfo : ''
      , strAdditionalInfo : ''
      , boolHasAddToPlaylistButton : false
    };

    this.init();
  }

  /**
   * Set event listeners, initialize API.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.init = function () {
    var self = this;

    self.initPlayerStatusObserver();
    self.addRuntimeOnMessageListener();
    pozitoneModule.api.init( 'built-in', self );
    self.convertNotificationLogoUrl();
  };

  /**
   * Init observer.
   *
   * @type    method
   * @param   $target
   *            The Node on which to observe DOM mutations.
   * @param   objOptions
   *            A MutationObserverInit object, specifies which DOM mutations
   *            should be reported.
   * @param   funcCallback
   *            The function which will be called on each DOM mutation.
   * @param   boolIsDisconnectable
   *            If this observer should be disconnected later.
   * @return  void
   **/

  PageWatcher.prototype.initObserver = function (
      $target
    , objOptions
    , funcCallback
    , boolIsDisconnectable
  ) {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    if (  typeof boolIsDisconnectable === 'undefined'
      &&  ! boolIsDisconnectable
    ) {
      var observer = new MutationObserver( funcCallback );

      observer.observe( $target, objOptions );
    }
    else {
      // Disconnect the one set previously
      if ( this.DisconnectableObserver ) {
        this.DisconnectableObserver.disconnect();
      }

      this.DisconnectableObserver = new MutationObserver( funcCallback );
      this.DisconnectableObserver.observe( $target, objOptions );
    }
  };

  /**
   * Init player status changes observer.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.initPlayerStatusObserver = function() {
    var self = this
      , objOptions = {
            attributes : true
          , attributeFilter : [ 'class' ]
        }
      , funcCallback  = function( arrMutations ) {
          for ( var i = 0, l = arrMutations.length; i < l; i++ ) {
            var $target = arrMutations[ i ].target;

            var boolIsPlaying = $target.classList.contains( self.strPlayPauseBtnPlayingClass )
              , strUpdatedPreviousStatus = boolIsPlaying ? 'play' : 'stop'
              ;

            // Sometimes mutation happens even without player status change
            if ( strUpdatedPreviousStatus === self.objPlayerInfo.strPreviousStatus ) {
              return;
            }

            self.objPlayerInfo.boolIsPlaying = boolIsPlaying;

            // Follow the 101.ru logic
            self.objPlayerInfo.strPreviousStatus = strUpdatedPreviousStatus;

            if ( boolIsPlaying ) {
              var strLangStartedOrResumed = 'onPlay';

              if ( self.boolWasPageJustLoaded ) {
                strLangStartedOrResumed = 'onFirstPlay';

                self.initTrackTitleContainerWrapperObserver();
              }

              self.sendMediaEvent( strLangStartedOrResumed );

              self.boolHadPlayedBefore = true;
              self.boolWasPageJustLoaded = false;
            }
            else if ( ! boolIsPlaying && self.boolHadPlayedBefore ) {
              self.sendMediaEvent( 'onPause', undefined, false );
            }

            return;
          }
        }
      ;

    self.initObserver( self.$playPauseBtn, objOptions, funcCallback );
  };

  /**
   * Init track title container observer.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.initTrackTitleContainerWrapperObserver = function () {
    var self = this
      , objOptions = {
            characterData : true
          , childList : true
          , subtree : true
        }
      , funcCallback  = function( arrMutations ) {
          for ( var i = 0, l = arrMutations.length; i < l; i++ ) {
            var objMutationRecord = arrMutations[ i ]
              , arrAddedNodes = objMutationRecord.addedNodes
              , intAddedNodesCount = arrAddedNodes.length
              ;

            if ( intAddedNodesCount ) {
              for ( var j = 0; i < intAddedNodesCount; i++ ) {
                var arrClassList = arrAddedNodes[ i ].classList;

                if (  arrClassList
                  &&  arrClassList.contains( self.strTrackTitleContainerClass )
                  &&  ! self.boolWasPageJustLoaded
                ) {
                  self.sendMediaEvent( undefined, undefined, true, false );
                }

                self.initFavoriteBtnObserver();
              }
            }
          }
        }
      ;

    self.initObserver( self.$trackTitleContainerWrapper, objOptions, funcCallback );
  };

  /**
   * Init "Favorite/Like" button observer.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.initFavoriteBtnObserver = function () {
    var self = this
      , DisconnectableObserver = self.DisconnectableObserver
      , $target = document.querySelector( self.strFavoriteBtnSelector )
      , objOptions = {
            attributes : true
          , attributeFilter : [ 'class' ]
        }
      , funcCallback  = function( arrMutations ) {
          for ( var i = 0, l = arrMutations.length; i < l; i++ ) {
            if ( arrMutations[ i ].target.classList.contains( self.strFavoriteBtnSuccessClass ) ) {
              self.sendMediaEvent( 'onFavorite', undefined, false );

              return;
            }
          }
        }
      ;

    // Reset "Favorite/Like" button observer
    if ( DisconnectableObserver ) {
      DisconnectableObserver.disconnect();
    }

    self.initObserver( $target, objOptions, funcCallback, true );
  };

  /**
   * Listen for commands sent from PoziTone.
   * If requested function found, call it.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.addRuntimeOnMessageListener = function () {

    /**
     * Listens for command sent from Background.
     * If requested function found, call it.
     *
     * @type    method
     * @param   objMessage
     *            Message received.
     * @param   objSender
     *            Sender of the message.
     * @param   funcSendResponse
     *            Function used for callback.
     * @return  void
     **/

    chrome.runtime.onMessage.addListener(
      function( objMessage, objSender, funcSendResponse ) {
        pozitoneModule.api.processRequest(
            objMessage
          , objSender
          , funcSendResponse
        );

        // Indicate that the response function will be called asynchronously
        return true;
      }
    );
  };

  /**
   * Provide relative notification logo URL/src, get data URL.
   *
   * PoziTone can't access image files from other extensions.
   * Thus, image URLs have to be data URLs.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.convertNotificationLogoUrl = function () {
    var self = this;

    pozitoneModule.api.convertImageSrcToDataUrl(
        chrome.runtime.getURL( self.objStationInfo.strLogoDataUri )
      , function ( strDataUri ) {
          self.objStationInfo.strLogoDataUri = strDataUri;
        }
    );
  };

  /**
   * Send media event information to PoziTone.
   *
   * @type    method
   * @param   strFeedback
   *            Optional. Feedback for main actions (play/stop, mute/unmute).
   * @param   strCommand
   *            Optional. What command made this call.
   * @param   boolSetTrackInfo
   *            Optional. Whether to set track info.
   * @param   boolDisregardSameMessage
   *            Optional. Whether to show the same message again or not
   * @return  void
   **/

  PageWatcher.prototype.sendMediaEvent = function (
      strFeedback
    , strCommand
    , boolSetTrackInfo
    , boolDisregardSameMessage
  ) {
    var self = this
      , $userMenu = document.querySelector( this.strUserMenuSelector )
      ;

    if ( typeof boolSetTrackInfo === 'undefined' || boolSetTrackInfo ) {
      this.objStationInfo.strTrackInfo = document.title;
    }

    this.objStationInfo.strAdditionalInfo =
      ( typeof strFeedback === 'string' && strFeedback !== '' )
        ? strFeedback
        : ''
        ;

    if ( strCommand !== 'muteUnmute' ) {
      this.isMuted( function( boolIsMuted ) {
        self.objPlayerInfo.boolIsMuted = boolIsMuted;
        self.objPlayerInfo.intVolume = boolIsMuted ? 0 : 10;
      } );
    }

    // TODO: Is this really needed?
    if ( typeof boolDisregardSameMessage !== 'boolean' ) {
      boolDisregardSameMessage = this.boolDisregardSameMessage;
    }

    var objData = {
        boolIsUserLoggedIn : document.contains( $userMenu )
      , boolDisregardSameMessage : boolDisregardSameMessage
      , objPlayerInfo : this.objPlayerInfo
      , objStationInfo : this.objStationInfo
      , strCommand : strCommand
    };

    pozitoneModule.api.sendMediaEvent( objData );
  };

  /**
   * Trigger button click if the button exists
   *
   * @type    method
   * @param   $btn
   *            The button to be clicked.
   * @return  void
   **/

  PageWatcher.prototype.triggerButtonClick = function( $btn ) {
    if ( document.contains( $btn ) ) {
      $btn.click();
    }
  };

  /**
   * Simulate "Favorite/Like" player method
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.triggerPlayerAction_favorite = function() {
    this.triggerButtonClick( document.querySelector( this.strFavoriteBtnSelector ) );
  };

  /**
   * Simulate "Next" player method
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.triggerPlayerAction_next = function() {
    this.triggerButtonClick( this.$playNextTrackBtn );
  };

  /**
   * Simulate "Previous" player method
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.triggerPlayerAction_previous = function() {
    this.triggerButtonClick( this.$playPreviousTrackBtn );
  };

  /**
   * Toggle the sound.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.triggerPlayerAction_playStop = function() {
    this.triggerButtonClick( this.$playPauseBtn );
  };

  /**
   * Simulate "Mute" player method
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.triggerPlayerAction_mute = function() {
    this.triggerPlayerAction_muteUnmute();
  };

  /**
   * Simulate "Unmute" player method
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.triggerPlayerAction_unmute = function() {
    this.triggerPlayerAction_muteUnmute();
  };

  /**
   * If volume is not 0, then mute. Otherwise, unmute.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.triggerPlayerAction_muteUnmute = function() {
    var self = this;

    this.isMuted( function( boolIsMuted ) {
      // Switching values to the opposite
      self.objPlayerInfo.boolIsMuted = ! boolIsMuted;
      self.objPlayerInfo.intVolume = boolIsMuted ? 10 : 0;

      self.triggerButtonClick( self.$muteUnmuteBtn );
      self.sendMediaEvent( boolIsMuted ? 'onUnmute' : 'onMute', 'muteUnmute' );
    } );
  };

  /**
   * Show the last shown notification again.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.triggerPlayerAction_showNotification = function() {
    this.sendMediaEvent( 'onShowNotification' );
  };

  /**
   * If volume is not 0, then mute. Otherwise, unmute.
   *
   * @type    method
   * @param   funcSuccessCallback
   *            Optional. Function to run on success.
   * @param   funcErrorCallback
   *            Optional. Function to run on error.
   * @return  void
   **/

  PageWatcher.prototype.isMuted = function( funcSuccessCallback, funcErrorCallback ) {
    var $muteUnmuteBtnContainer = this.$muteUnmuteBtnContainer;

    if ( document.contains( $muteUnmuteBtnContainer ) ) {
      var boolIsMuted = $muteUnmuteBtnContainer.classList.contains( this.strMuteUnmuteBtnContainerMutedClass );

      if ( typeof funcSuccessCallback === 'function' ) {
        funcSuccessCallback( boolIsMuted );
      }
    }
    else if ( typeof funcErrorCallback === 'function' ) {
      funcErrorCallback();
    }
  };

  if ( typeof pozitoneModule === 'undefined' ) {
    window.pozitoneModule = {};
  }

  // TODO: Fix cause, not effect
  if ( ! pozitoneModule.pageWatcher ) {
    pozitoneModule.pageWatcher = new PageWatcher();
  }
}() );
