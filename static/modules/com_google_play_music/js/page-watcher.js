/* =============================================================================

  Product: PoziTone module for Google Play Music
  Author: PoziWorld
  Copyright: (c) 2016 PoziWorld
  License: pozitone.com/license

  Table of Contents:

    PageWatcher
      init()
      initObserver()
      initBodyObserver()
      initPlayerActivationObserver()
      initPlayerStatusObserver()
      initTrackInfoContainerObserver()
      checkFavoriteButtonStatus()
      addRuntimeOnMessageListener()
      addVolumeChangeListener()
      getPlayerVolume()
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
      triggerPlayerAction_volumeUp()
      triggerPlayerAction_volumeDown()
      triggerVolumeChange()
      triggerPlayerAction_showNotification()

 ============================================================================ */

( function() {
  'use strict';

  function PageWatcher() {
    const
        strModule = 'com_google_play_music'
      , strImgPath = 'modules/' + strModule + '/img/'
      ;

    /* DOM-related variables */
    this.strPlayerId = 'player';
    this.$player = document.getElementById( this.strPlayerId );
    this.strPlayerActiveClass = 'active';

    this.strActualPlayerNodeName = 'AUDIO';
    this.$actualPlayerNode = null;
    this.boolIsVolumeChangeByUser = false; // true when clicked button in the notification or triggered by a keyboard shortcut

    this.strPlayPauseButtonSelector = '#player-bar-play-pause';
    this.strPlayPauseButtonPlayingClass = 'playing';
    this.strPlayNextTrackButtonSelector = '#player-bar-forward';
    this.strPlayPreviousTrackButtonSelector = '#player-bar-rewind';
    this.strFavoriteButtonSelector = '#playerSongInfo [icon="sj:thumb-up-outline"]';
    this.strFavoriteButtonStatusIndicatorSelector = 'path';

    this.strTrackInfoId = 'playerSongInfo';
    this.strTrackTitleId = 'currently-playing-title';
    this.strTrackArtistId = 'player-artist';
    this.strTrackTimeId = 'time_container_current';
    this.strTrackDurationId = 'time_container_duration';
    this.strTrackImageId = 'playerBarArt';
    this.intTrackImageBorder = 0;

    this.strPlaylistStationLogoSelector = '.material-playlist-container .cover-card';
    this.strPlaylistStationLogoNodeName = 'DIV';
    this.objPlaylistStationLogoOptions = { quality : 0.8 };
    this.strAlbumStationLogoSelector = '.material-album-container .image';
    this.strCardPlayingStationLogoSelector = '[data-playback-status].material-card:not([data-playback-status=""]) .image';
    this.intStationLogoBorder = 0;

    this.strUserSignedOutAttribute = 'data-signed-out';

    this.$queueOverlay = document.getElementById( 'queue-overlay' );
    this.strStationNameSelector = '[data-id="playing-from-text"]';

    this.$musicContent = document.getElementById( 'music-content' );
    this.strStationDescriptionSelector = '.description';
    this.strCardPlayingSelector = '[data-playback-status="playing"]';
    this.strCardPausedSelector = '[data-playback-status="paused"]';
    this.strCardLoadingSelector = '[data-playback-status="loading"]';

    this.DisconnectableObserver = null;
    this.DisconnectableBodyObserver = null;
    /* DOM-related variables - END */

    this.boolIsUserLoggedIn = true; // observer will change to false when logged-out
    this.boolHadPlayedBefore = false;
    this.boolWasPageJustLoaded = true;
    this.boolDisregardSameMessage = true;
    this.intLogoBorder = 10;

    this.objPlayerInfo = {
        strModule : strModule
      , strPlayerName : poziworldExtension.i18n.getMessage( 'module_' + strModule )
      , boolIsReady : false
      , boolIsPlaying : false
      , boolIsMuted : false
      , intVolume : 50
      , boolCanPlayNextTrackLoggedOut : false
      , boolCanPlayPreviousTrackLoggedOut : false
    };

    this.objStationInfo = {
        strStationName : ''
      , strStationNamePlusDesc : ''
      , strLogoUrl : '/' + strImgPath + 'google-play-music.svg'
      , strLogoDataUri : strImgPath + 'google-play-music-logo-80.png'
      , strTrackInfo : ''
      , strAdditionalInfo : ''
      , boolHasAddToPlaylistButton : false
    };

    this.init();
  }

  /**
   * Set event listeners, initialize SDK.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.init = function () {
    var _this = this;

    _this.initBodyObserver();
    _this.initPlayerActivationObserver();
    _this.addRuntimeOnMessageListener();
    pozitoneModule.sdk.init( 'built-in', _this );
    _this.convertNotificationLogoUrl();
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
   *            Optional. If this observer should be disconnected later.
   * @param   moCustomDisconnectable
   *            Optional. If custom mutation observer is needed to avoid conflicts.
   * @return  void
   **/

  PageWatcher.prototype.initObserver = function (
      $target
    , objOptions
    , funcCallback
    , boolIsDisconnectable
    , moCustomDisconnectable
  ) {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    if (  typeof boolIsDisconnectable === 'undefined'
      &&  ! boolIsDisconnectable
    ) {
      var observer = new MutationObserver( funcCallback );

      observer.observe( $target, objOptions );
    }
    else {
      if ( typeof moCustomDisconnectable === 'undefined' ) {
        // Disconnect the one set previously
        if ( this.DisconnectableObserver ) {
          this.DisconnectableObserver.disconnect();
        }

        this.DisconnectableObserver = new MutationObserver( funcCallback );
        this.DisconnectableObserver.observe( $target, objOptions );
      }
      else {
        moCustomDisconnectable = new MutationObserver( funcCallback );
        moCustomDisconnectable.observe( $target, objOptions );
      }
    }
  };

  /**
   * Watch body for <audio /> and user state attribute.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.initBodyObserver = function() {
    var _this = this
      , strUserSignedOutAttribute = _this.strUserSignedOutAttribute
      , strActualPlayerNodeName = _this.strActualPlayerNodeName
      , intObserverCount = 0
      , intObserverCountMax = 2
      , objOptions = {
            attributes : true
          , attributeFilter : [ strUserSignedOutAttribute ]
          , childList : true
        }
      , funcCallback  = function( arrMutations ) {
          for ( var i = 0, l = arrMutations.length; i < l; i++ ) {
            var objMutationRecord = arrMutations[ i ];
            var strType = objMutationRecord.type;
            var $target = objMutationRecord.target;

            if ( strType === 'attributes' ) {
              _this.boolIsUserLoggedIn = ! JSON.parse( $target.getAttribute( strUserSignedOutAttribute ) );

              intObserverCount++;
            }
            else if ( strType === 'childList' ) {
              var arrAddedNodes = objMutationRecord.addedNodes;
              var intAddedNodesCount = arrAddedNodes.length;

              for ( var j = 0; j < intAddedNodesCount; j++ ) {
                var $addedNode = arrAddedNodes[ j ];

                if ( $addedNode.nodeName === strActualPlayerNodeName ) {
                  _this.$actualPlayerNode = $addedNode;
                  _this.addVolumeChangeListener();

                  intObserverCount++;

                  if ( intObserverCount >= intObserverCountMax ) {
                    break;
                  }
                }
              }
            }

            if ( intObserverCount >= intObserverCountMax ) {
              _this.DisconnectableBodyObserver = null;
              break;
            }
          }
        }
      ;

    _this.initObserver( document.body, objOptions, funcCallback, true, _this.DisconnectableBodyObserver );
  };

  /**
   * Wait for the player to initialize.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.initPlayerActivationObserver = function() {
    var _this = this
      , objOptions = {
            attributes : true
          , attributeFilter : [ 'class' ]
          , childList : true
        }
      , funcCallback  = function( arrMutations ) {
          for ( var i = 0, l = arrMutations.length; i < l; i++ ) {
            var objMutationRecord = arrMutations[ i ];
            var strType = objMutationRecord.type;
            var $target = objMutationRecord.target;

            if ( strType === 'attributes' && $target.id === _this.strPlayerId ) {
              var boolIsReady = $target.classList.contains( _this.strPlayerActiveClass );

              _this.objPlayerInfo.boolIsReady = boolIsReady;

              if ( boolIsReady ) {
                _this.DisconnectableObserver = null;
                _this.initPlayerStatusObserver();
              }
            }
            else if ( strType === 'childList' ) {
              var arrAddedNodes = objMutationRecord.addedNodes;
              var intAddedNodesCount = arrAddedNodes.length;

              for ( var j = 0; j < intAddedNodesCount; j++ ) {
                var $addedNode = arrAddedNodes[ j ];
                var $playPauseButton = $addedNode.querySelector( _this.strPlayPauseButtonSelector );
                var $playNextTrackButton = $addedNode.querySelector( _this.strPlayNextTrackButtonSelector );
                var $playPreviousTrackButton = $addedNode.querySelector( _this.strPlayPreviousTrackButtonSelector );

                if ( $playPauseButton ) {
                  _this.$playPauseButton = $playPauseButton;
                }

                if ( $playNextTrackButton ) {
                  _this.$playNextTrackButton = $playNextTrackButton;
                }

                if ( $playPreviousTrackButton ) {
                  _this.$playPreviousTrackButton = $playPreviousTrackButton;
                }

                _this.checkFavoriteButtonStatus();

                // They come in one mutation. No need to search further.
                if ( $playPauseButton && $playNextTrackButton && $playPreviousTrackButton ) {
                  break;
                }
              }
            }
          }
        }
      ;

    _this.initObserver( _this.$player, objOptions, funcCallback, true );
  };

  /**
   * Init player status changes observer.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.initPlayerStatusObserver = function() {
    var _this = this
      , objOptions = {
            attributes : true
          , attributeFilter : [ 'class' ]
        }
      , funcCallback  = function( arrMutations ) {
          for ( var i = 0, l = arrMutations.length; i < l; i++ ) {
            var $target = arrMutations[ i ].target;
            var boolIsPlaying = $target.classList.contains( _this.strPlayPauseButtonPlayingClass );
            var strUpdatedPreviousStatus = boolIsPlaying ? 'play' : 'stop';

            // Sometimes mutation happens even without player status change
            if ( strUpdatedPreviousStatus === _this.objPlayerInfo.strPreviousStatus ) {
              return;
            }

            _this.objPlayerInfo.boolIsPlaying = boolIsPlaying;

            // Follow the 101.ru logic
            _this.objPlayerInfo.strPreviousStatus = strUpdatedPreviousStatus;

            if ( boolIsPlaying ) {
              var strLangStartedOrResumed = 'onPlay';

              if ( _this.boolWasPageJustLoaded ) {
                strLangStartedOrResumed = 'onFirstPlay';

                _this.checkFavoriteButtonStatus();
                _this.initTrackInfoContainerObserver();
              }

              _this.sendMediaEvent( strLangStartedOrResumed );
              _this.boolIsPausedBeforeTrackChange = false; // reset

              _this.boolHadPlayedBefore = true;
              _this.boolWasPageJustLoaded = false;
            }
            else if ( ! boolIsPlaying && _this.boolHadPlayedBefore ) {
              if ( _this.$actualPlayerNode.paused ) {
                _this.boolIsPausedBeforeTrackChange = false;
                _this.sendMediaEvent( 'onPause', undefined, false );
              }
              else {
                _this.boolIsPausedBeforeTrackChange = true;
              }
            }

            return;
          }
        }
      ;

    _this.initObserver( _this.$playPauseButton, objOptions, funcCallback );
  };

  /**
   * Init track title container observer.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.initTrackInfoContainerObserver = function () {
    var _this = this
      , $target = document.getElementById( _this.strTrackInfoId )
      , objOptions = {
            childList : true
        }
      , funcCallback  = function( arrMutations ) {
          for ( var i = arrMutations.length; i--; ) {
            var objMutationRecord = arrMutations[ i ]
              , arrAddedNodes = objMutationRecord.addedNodes
              , intAddedNodesCount = arrAddedNodes.length
              ;

            if ( intAddedNodesCount ) {
              _this.checkFavoriteButtonStatus();

              var $trackArtist = document.getElementById( _this.strTrackArtistId );
              var $trackTitle = document.getElementById( _this.strTrackTitleId );

              if ( $trackArtist && $trackTitle ) {
                // If track artist or track title changed
                if (  _this.strLatestTrackArtist !== $trackArtist.textContent
                  ||  _this.strLatestTrackTitle !== $trackTitle.textContent
                ) {
                  _this.sendMediaEvent( 'onTrackChange' );
                }

                // Return when found the nodes regardless they are changed or not:
                // we won't find the required info in other mutation records
                // since we are searching from the end of array
                return;
              }
            }
          }
        }
      ;

    _this.$trackInfo = $target;

    _this.initObserver( $target, objOptions, funcCallback );
  };

  /**
   * Listen for commands sent from PoziTone.
   * If requested function found, call it.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.checkFavoriteButtonStatus = function () {
    var $favoriteButton = document.querySelector( this.strFavoriteButtonSelector );
    var boolHasBeenFavorite = this.boolIsTrackFavorite;

    if ( $favoriteButton ) {
      this.$favoriteButton = $favoriteButton;

      // In order to understand whether the track is favorite,
      // we check a number of children: 2 means favorite, 1 – not.
      var $statusIndicators = $favoriteButton.querySelectorAll( this.strFavoriteButtonStatusIndicatorSelector );

      if ( $statusIndicators ) {
        var intStatusIndicatorsCount = $statusIndicators.length;

        if ( intStatusIndicatorsCount === 2 ) {
          this.boolIsTrackFavorite = false;
        }
        else if ( intStatusIndicatorsCount === 1 ) {
          this.boolIsTrackFavorite = true;

          // It's undefined on page load, so check type, too
          if ( boolHasBeenFavorite === false ) {
            this.sendMediaEvent( 'onFavorite' );
          }
        }
      }
    }
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
    var _this = this;

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
        pozitoneModule.sdk.processRequest(
            objMessage
          , objSender
          , funcSendResponse
          , _this
        );

        // Indicate that the response function will be called asynchronously
        return true;
      }
    );
  };

  /**
   * Once the actual player node is on the page, we can start listening to volume change.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.addVolumeChangeListener = function () {
    var $player = this.$actualPlayerNode;
    var _this = this;

    // Get initial sound volume level
    this.getPlayerVolume( $player );

    $player.addEventListener( 'volumechange', function( objEvent ) {
      // Before playback initialized, player sets the volume level it had last time
      if ( ! _this.boolHadPlayedBefore ) {
        return;
      }

      if ( ! _this.boolIsVolumeChangeByUser ) {
        var boolIsMuted = $player.muted;

        if ( boolIsMuted !== _this.objPlayerInfo.boolIsMuted ) {
          _this.triggerPlayerAction_muteUnmute( boolIsMuted, true );
        }
        else {
          _this.getPlayerVolume( $player );
          _this.sendMediaEvent( 'onVolumeChange' );
        }
      }
      else {
        _this.boolIsVolumeChangeByUser = false;
      }
    } );
  };

  /**
   * Gets player volume using built-in HTML5 audio methods
   *
   * @type    method
   * @param   $player
   *            HTML5 media node.
   * @return  void
   **/

  PageWatcher.prototype.getPlayerVolume = function ( $player ) {
    if ( document.contains( $player ) ) {
      this.objPlayerInfo.intVolume = pozitoneModule.sdk.convertVolumeToPercent( $player.volume );
    }
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
    var _this = this;

    pozitoneModule.sdk.convertImageSrcToDataUrl(
        chrome.runtime.getURL( _this.objStationInfo.strLogoDataUri )
      , function ( strDataUri ) {
          _this.objStationInfo.strLogoDataUri = strDataUri;
        }
      , _this.intLogoBorder
    );
  };

  /**
   * Send media event information to PoziTone.
   *
   * TODO: Figure out better ways of tracking onTrackChange.
   *
   * @type    method
   * @param   strEvent
   *            Optional. Event type (play/stop, mute/unmute).
   * @param   strCommand
   *            Optional. What command made this call.
   * @param   boolSetTrackInfo
   *            Optional. Whether to set track info.
   * @param   boolDisregardSameMessage
   *            Optional. Whether to show the same message again or not
   * @return  void
   **/

  PageWatcher.prototype.sendMediaEvent = function (
      strEvent
    , strCommand
    , boolSetTrackInfo
    , boolDisregardSameMessage
  ) {
    if ( strEvent === 'onPlay' ) {
      // Sometimes, when radio plays, it pauses before playing next track, then resumes.
      // Other times, it doesn't.
      // Since we have track info observer, this triggers notification multiple times.
      // Avoid unneeded notifications (don't show on resume within 5 seconds of on track change).
      if (  this.strPreviousEvent === 'onTrackChange'
        &&  this.intPreviousEventTimestamp < ( Date.now() + 5000 )
      ) {
        return;
      }
      // Playback started after the track changed.
      // We canceled onTrackChange, pretend this is onTrackChange.
      else if ( this.strPreviousEvent === 'onTrackChangeNotPlayingYet' ) {
        strEvent = 'onTrackChange';
      }
      // Track switched, but mutation record about its info hasn't arrived yet
      // Was happening at https://play.google.com/music/listen?u=0#/artist/And2yjvnixfr5is2tms2hlo2ige/FuNBOX
      else if ( this.boolIsPausedBeforeTrackChange ) {
        strEvent = 'onTrackChange';
      }
    }

    this.intPreviousEventTimestamp = Date.now();

    if ( strEvent === 'onTrackChange' && ! this.objPlayerInfo.boolIsPlaying ) {
      this.strPreviousEvent = 'onTrackChangeNotPlayingYet';
      // Playback hasn't started. Thus, it will show the Play button.
      // While playback will start almost instantaneous. This may cause confusion.
      return;
    }
    else {
      this.strPreviousEvent = strEvent;
    }

    var _this = this;
    var boolIsEventTriggered = typeof this.boolIsEventTriggered === 'boolean' && this.boolIsEventTriggered;

    /* Station name and description */

    var $musicContent = this.$musicContent;
    var $descriptions = $musicContent.querySelectorAll( this.strStationDescriptionSelector );
    var intDescriptionsCount = $descriptions.length;

    // Sometimes, when radio plays, it pauses before playing next track, then resumes.
    // Other times, it doesn't.
    // Since we have track info observer, this triggers notification multiple times.
    // Avoid unneeded notifications (don't show on pause if this is a radio, not triggered by user, and just switched to next track).
    if ( strEvent === 'onPause' && ! boolIsEventTriggered && intDescriptionsCount > 0 ) {
      var $trackTime = document.getElementById( this.strTrackTimeId );
      var $trackDuration = document.getElementById( this.strTrackDurationId );

      if ( $trackTime && $trackDuration ) {
        var strTrackTime = $trackTime.textContent;
        var strTrackDuration = $trackDuration.textContent;

        if (  strTrackTime !== ''
          &&  strTrackDuration !== ''
          &&  parseInt( strTrackTime.replace( ':', '' ) ) === 0
        ) {
          return;
        }
      }
    }

    // Reset for next event
    this.boolIsEventTriggered = false;

    var strStationName = this.$queueOverlay.querySelector( this.strStationNameSelector ).textContent.trim();
    this.objStationInfo.strStationName = strStationName;

    // Single option/card. Example: https://play.google.com/music/listen#/wst/situations/L5e2yoitdn3hbciqxskuxms7uli
    if ( intDescriptionsCount === 1 ) {
      this.objStationInfo.strStationNamePlusDesc = strStationName + ': ' + $descriptions[ 0 ].textContent;
    }
    // Multiple options/cards. Example: https://play.google.com/music/listen#/situations/Nx4irkig4433fxk2lznnjy2s2rq/N4tkafclf57ncsydq7gmnovyblq
    else if ( intDescriptionsCount > 1 ) {
      var $activeCard =
            $musicContent.querySelector( this.strCardPlayingSelector )
        ||  $musicContent.querySelector( this.strCardPausedSelector )
        ||  $musicContent.querySelector( this.strCardLoadingSelector )
        ;

      if ( $activeCard ) {
        var strDescription = $activeCard.querySelector( this.strStationDescriptionSelector ).textContent;

        this.objStationInfo.strStationNamePlusDesc = strStationName + ': ' + strDescription;
      }
      else {
        this.objStationInfo.strStationNamePlusDesc = strStationName;
      }
    }
    // Album from Google Play (for example, you received a free track from an album on Google Play
    else {
      this.objStationInfo.strStationNamePlusDesc = strStationName;
    }

    /* Track artist, title, image; station logo */

    if ( typeof boolSetTrackInfo === 'undefined' || boolSetTrackInfo ) {
      var strTrackArtist = document.getElementById( this.strTrackArtistId ).textContent;
      var strTrackTitle = document.getElementById( this.strTrackTitleId ).textContent;

      this.strLatestTrackArtist = strTrackArtist;
      this.strLatestTrackTitle = strTrackTitle;
      this.objStationInfo.strTrackInfo = pozitoneModule.sdk.setMediaInfo( strTrackArtist, strTrackTitle );
    }

    var promise1;
    var promise2;

    // Track image and station logo are still the same on pause, no need to retrieve them again
    if ( strEvent !== 'onPause' ) {
      var $trackImage = document.getElementById( _this.strTrackImageId );

      if ( $trackImage ) {
        promise1 = new Promise( function( funcResolve, funcReject ) {
          pozitoneModule.sdk.convertImageSrcToDataUrl(
              $trackImage.src
            , function ( strDataUri ) {
                _this.objStationInfo.strTrackImageDataUri = strDataUri;
                funcResolve();
              }
            , _this.intTrackImageBorder
          );
        } );
      }

      var $stationLogo =
            document.querySelector( _this.strCardPlayingStationLogoSelector )
        ||  document.querySelector( _this.strAlbumStationLogoSelector )
        ||  document.querySelector( _this.strPlaylistStationLogoSelector )
        ;

      if ( $stationLogo ) {
        promise2 = new Promise( function( funcResolve, funcReject ) {
          // Playlist logo consists of a few separate img tags, combine them in one image
          if ( $stationLogo.nodeName === _this.strPlaylistStationLogoNodeName ) {
            domtoimage
              .toJpeg(
                  $stationLogo
                , _this.objPlaylistStationLogoOptions
              )
              .then( function( strDataUri ) {
                _this.objStationInfo.strStationLogoDataUri = strDataUri;
                funcResolve();
              } )
              ;
          }
          else {
            pozitoneModule.sdk.convertImageSrcToDataUrl(
                $stationLogo.src
              , function ( strDataUri ) {
                  _this.objStationInfo.strStationLogoDataUri = strDataUri;
                  funcResolve();
                }
              , _this.intStationLogoBorder
            );
          }
        } );
      }
      // Artist page may have no image. Example: https://play.google.com/music/listen?u=0#/artist/And2yjvnixfr5is2tms2hlo2ige/FuNBOX
      // Use player logo as station logo.
      else {
        this.objStationInfo.strStationLogoDataUri = this.objStationInfo.strLogoDataUri;
      }
    }

    /* Additional info */

    this.objStationInfo.strAdditionalInfo = typeof strEvent === 'string' && strEvent !== ''
      ? strEvent
      : ''
      ;

    // TODO: Is this really needed?
    if ( typeof boolDisregardSameMessage !== 'boolean' ) {
      boolDisregardSameMessage = this.boolDisregardSameMessage;
    }

    var objData = {
        boolIsUserLoggedIn : this.boolIsUserLoggedIn
      , boolDisregardSameMessage : boolDisregardSameMessage
      , objPlayerInfo : this.objPlayerInfo
      , objStationInfo : this.objStationInfo
      , strCommand : strCommand
    };

    if ( promise1 || promise2 ) {
      Promise
        .all( [ promise1, promise2 ] )
        .then( function () {
          pozitoneModule.sdk.sendMediaEvent( objData );
        } )
        ;
    }
    else {
      pozitoneModule.sdk.sendMediaEvent( objData );
    }
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
    this.triggerButtonClick( this.$favoriteButton );
  };

  /**
   * Simulate "Next" player method
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.triggerPlayerAction_next = function() {
    this.triggerButtonClick( this.$playNextTrackButton );
  };

  /**
   * Simulate "Previous" player method
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.triggerPlayerAction_previous = function() {
    this.triggerButtonClick( this.$playPreviousTrackButton );
  };

  /**
   * Toggle the sound.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.triggerPlayerAction_playStop = function() {
    this.boolIsEventTriggered = true;
    this.triggerButtonClick( this.$playPauseButton );
  };

  /**
   * Simulate "Mute" player method
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.triggerPlayerAction_mute = function() {
    this.triggerPlayerAction_muteUnmute( true );
  };

  /**
   * Simulate "Unmute" player method
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.triggerPlayerAction_unmute = function() {
    this.triggerPlayerAction_muteUnmute( false );
  };

  /**
   * If volume is not 0, then mute. Otherwise, unmute.
   *
   * @type    method
   * @param   boolMute
   *            Optional. Whether to mute or not (unmute).
   * @param   boolIsFromListener
   *            Optional. Whether called from "volumechange" listener or not.
   * @return  void
   **/

  PageWatcher.prototype.triggerPlayerAction_muteUnmute = function( boolMute, boolIsFromListener ) {
    var $player = this.$actualPlayerNode;

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

      this.objPlayerInfo.boolIsMuted = boolMute;

      if ( typeof boolIsFromListener !== 'boolean' || ! boolIsFromListener ) {
        this.boolIsVolumeChangeByUser = true;

        $player.muted = boolMute;
      }

      this.sendMediaEvent( 'on' + strCommand, 'muteUnmute' );
    }
  };

  /**
   * Simulate "volume up" player method
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.triggerPlayerAction_volumeUp = function() {
    this.triggerVolumeChange( 'up' );
  };

  /**
   * Simulate "volume down" player method
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.triggerPlayerAction_volumeDown = function() {
    this.triggerVolumeChange( 'down' );
  };

  /**
   * Simulate "volume up/down" player method
   *
   * @type    method
   * @param   strDirection
   *            'up' or 'down'.
   * @return  void
   **/

  PageWatcher.prototype.triggerVolumeChange = function( strDirection ) {
    var _this = this;

    pozitoneModule.sdk.changeVolume(
        strDirection
      , _this.objPlayerInfo.intVolume
      , function ( intVolume ) {
          if ( typeof intVolume !== 'number' || intVolume < 0 || intVolume > 100 ) {
            return;
          }

          _this.boolIsVolumeChangeByUser = true;
          _this.objPlayerInfo.intVolume = intVolume;
          _this.$actualPlayerNode.volume = pozitoneModule.sdk.convertPercentToVolume( intVolume );
          _this.sendMediaEvent( 'onVolumeChange' );
        }
    );
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

  if ( typeof pozitoneModule === 'undefined' ) {
    window.pozitoneModule = {};
  }

  // TODO: Fix cause, not effect
  if ( ! pozitoneModule.pageWatcher ) {
    pozitoneModule.pageWatcher = new PageWatcher();
  }
}() );
