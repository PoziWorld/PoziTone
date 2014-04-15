/* ====================================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2014 PoziWorld
  File                    :           js/global.js
  Description             :           Global JavaScript

  Table of Contents:

  1.                              Global
    1.a.                            init()
    1.b.                            showNotification()
    1.c.                            showNotificationCallback()
    1.d.                            isValidUrl()
    1.e.                            getValidUrl()
    1.f.                            saveOpenTabs()
    1.g.                            isEmpty()
    1.h.                            findFirstOpenTabInvokeCallback()
  2.                              On Load
    2.a.                            Initialize

 ==================================================================================== */

/* ====================================================================================

  1.                              Global

 ==================================================================================== */

var Global = {
    intNotificationCount          : 1
  , intNoVolume                   : 0
  , strNotificationId             : 'pozitone_tab' // We'll add tab ID when displaying
  , strNotificationIconUrl        : 'img/notification-icon-80.png'
  , strNoTrackInfo                : '...'
  , strPlayerIsOffClass           : 'play'
  , strModuleSettingsPrefix       : 'objSettings_'

  // Embedded modules
  , arrValidUrl                   : [
      '101.ru'
    , 'vk.com'
  ]

  // Don't show these buttons, if they have been clicked for this track already
  , arrAddTrackToPlaylistFeedback : [
        chrome.i18n.getMessage( 'poziNotificationAddTrackToPlaylistFeedbackSuccessfullyAdded' )
      , chrome.i18n.getMessage( 'poziNotificationAddTrackToPlaylistFeedbackAlreadyInPlaylist' )
    ]
  , strFavoriteStatusSuccess      : chrome.i18n.getMessage( 'poziNotificationFavoriteStatusSuccess' )

  // All possible settings
  , objSettingsDefaults           : {
        boolNotificationShowWhenStopped         : { miscDefault : false }
      , boolNotificationShowWhenMuted           : { miscDefault : false }
      , boolNotificationShowWhenNoTrackInfo     : { miscDefault : false }
      , strNotificationTitleFormat              : { miscDefault : 'short' }
      , arrNotificationButtons                  : {
            miscDefault           : [ 'add', 'muteUnmute' ]
          , add                   : {
                loggedIn          : {
                    objButton     : {
                        title     : chrome.i18n.getMessage( 'poziNotificationButtonsAddLoggedInTitle' )
                      , iconUrl   : 'img/round_plus_icon&16.png'
                    }
                  , strFunction   : 'add'
                }
            }
          , favorite              : {
                loggedIn          : {
                    objButton     : {
                        title     : chrome.i18n.getMessage( 'poziNotificationButtonsFavoriteLoggedInTitle' )
                      , iconUrl   : 'img/emotion_smile_icon&16.png'
                    }
                  , strFunction   : 'favorite'
                }
            }
          , next                  : {
                next              : {
                    objButton     : {
                        title     : chrome.i18n.getMessage( 'poziNotificationButtonsNextTitle' )
                      , iconUrl   : 'img/playback_next_icon&16.png'
                    }
                  , strFunction   : 'next'
                }
            }
          , playStop              : {
                play              : {
                    objButton     : {
                        title     : chrome.i18n.getMessage( 'poziNotificationButtonsPlayTitle' )
                      , iconUrl   : 'img/playback_play_icon&16.png'
                    }
                  , strFunction   : 'playStop'
                }
              , stop              : {
                    objButton     : {
                        title     : chrome.i18n.getMessage( 'poziNotificationButtonsStopTitle' )
                      , iconUrl   : 'img/playback_stop_icon&16.png'
                    }
                  , strFunction   : 'playStop'
                }
            }
          , muteUnmute            : {
                mute              : {
                    objButton     : {
                        title     : chrome.i18n.getMessage( 'poziNotificationButtonsMuteTitle' )
                      , iconUrl   : 'img/sound_mute_icon&16.png'
                    }
                  , strFunction   : 'mute'
                }
              , unmute            : {
                    objButton     : {
                        title     : chrome.i18n.getMessage( 'poziNotificationButtonsUnmuteTitle' )
                      , iconUrl   : 'img/sound_high_icon&16.png'
                    }
                  , strFunction   : 'unmute'
                }
            }
        }
    }
  ,

  /**
   * 1.a.
   *
   * Initialize
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  init : function() {
  }
  ,

  /**
   * 1.b.
   *
   * Display current track info via Notification
   *
   * @type    method
   * @param   boolUserLoggedIn
   *            Whether user logged-in or not
   * @param   boolDisregardSameMessage
   *            If true, show notification in any case
   * @param   intTabId
   *            Tab ID info received from
   * @param   objPlayerInfo
   *            Player info (play status, volume, etc.)
   * @param   objStationInfo
   *            Station info (strStationName, strStationNamePlusDesc, strTrackInfo)
   * @return  void
   **/
  showNotification : function( boolUserLoggedIn, boolDisregardSameMessage, intTabId, objPlayerInfo, objStationInfo ) {
    var
        objNotificationOptions = {
          type                 : 'basic',
          title                : '',
          message              : objStationInfo.strTrackInfo,
          iconUrl              : Global.strNotificationIconUrl
        }
      , objThis                = this
      , objTempPlayerInfo      = objPlayerInfo
      , objTempStationInfo     = objStationInfo
      , strStorageVar          = Global.strModuleSettingsPrefix + objTempPlayerInfo.strModule
      ;

    chrome.notifications.clear( objThis.strNotificationId + intTabId, function() {
      chrome.storage.sync.get(
          [ strStorageVar ]
        , function( objReturn ) {
            var objData = objReturn[ strStorageVar ];

            // Whether to show notification or not
            if (
                  boolDisregardSameMessage === false
              &&  typeof objData.boolNotificationShowWhenStopped !== 'undefined'
              &&  objData.boolNotificationShowWhenStopped === false
              &&  objTempPlayerInfo.strStatus === Global.strPlayerIsOffClass
            )
              return false;

            if (
                  boolDisregardSameMessage === false
              &&  typeof objData.boolNotificationShowWhenMuted !== 'undefined'
              &&  objData.boolNotificationShowWhenMuted === false
              &&  objTempPlayerInfo.intVolume === Global.intNoVolume
            )
              return false;

            if (
                  boolDisregardSameMessage === false
              &&  typeof objData.boolNotificationShowWhenNoTrackInfo !== 'undefined'
              &&  objData.boolNotificationShowWhenNoTrackInfo === false
              &&  objTempStationInfo.strTrackInfo === Global.strNoTrackInfo
            )
              return false;

            // Notification Icon Settings
            if (
                  objData.boolNotificationShowLogo === true
              &&  objStationInfo.strLogoDataUri !== null
            )
              objNotificationOptions.iconUrl = objStationInfo.strLogoDataUri;

            var
                strTitleFormat = objData.strNotificationTitleFormat || ''
              , arrButtons     = objData.arrNotificationButtons
              ;

            // Notification Title Settings
            if ( strTitleFormat === 'short' )
              objNotificationOptions.title = objTempStationInfo.strStationName;
            else if ( strTitleFormat === 'long' )
              objNotificationOptions.title = objTempStationInfo.strStationNamePlusDesc;
            else if ( strTitleFormat === 'noStationInfo' )
              objNotificationOptions.title = chrome.i18n.getMessage( 'poziNotificationTitle' );

            // Notification Buttons Settings
            if ( arrButtons.length !== 0 ) {
              // Save active buttons for the listener
              var
                  arrActiveButtons  = []
                , arrTrackInfo      = objTempStationInfo.strTrackInfo.split( "\n\n" )
                , objTempToSet      = {}
                ;

              objNotificationOptions.buttons = [];

              // TODO: Combine all following buttons check into one

              if ( arrButtons.indexOf( 'add' ) !== -1 && boolUserLoggedIn === true ) {
                // Don't show button, if track is in playlist
                // TODO: Show if track changed while waited for server response
                if ( Global.arrAddTrackToPlaylistFeedback.indexOf( arrTrackInfo[ 1 ] ) === -1 ) {
                  objNotificationOptions.buttons.push(
                    Global.objSettingsDefaults.arrNotificationButtons.add.loggedIn.objButton
                  );

                  arrActiveButtons.push( 'add|loggedIn' );
                }
              }

              if ( arrButtons.indexOf( 'favorite' ) !== -1 && boolUserLoggedIn === true ) {
                // Don't show button, if liked this track already
                // TODO: Show if track changed while waited for server response
                if ( Global.strFavoriteStatusSuccess.indexOf( arrTrackInfo[ 1 ] ) === -1 ) {
                  objNotificationOptions.buttons.push(
                    Global.objSettingsDefaults.arrNotificationButtons.favorite.loggedIn.objButton
                  );

                  arrActiveButtons.push( 'favorite|loggedIn' );
                }
              }

              if ( arrButtons.indexOf( 'next' ) !== -1 ) {
                objNotificationOptions.buttons.push(
                  Global.objSettingsDefaults.arrNotificationButtons.next.next.objButton
                );

                arrActiveButtons.push( 'next|next' );
              }

              if ( arrButtons.indexOf( 'playStop' ) !== -1 ) {
                objNotificationOptions.buttons.push(
                  Global.objSettingsDefaults.arrNotificationButtons.playStop[ objTempPlayerInfo.strStatus ].objButton
                );

                arrActiveButtons.push( 'playStop|' + objTempPlayerInfo.strStatus );
              }

              if ( arrButtons.indexOf( 'muteUnmute' ) !== -1 ) {
                var strMuteUnmuteState = ( objTempPlayerInfo.intVolume > 0 ) ? 
                                           'mute' : 'unmute';

                objNotificationOptions.buttons.push(
                  Global.objSettingsDefaults.arrNotificationButtons.muteUnmute[ strMuteUnmuteState ].objButton
                );

                arrActiveButtons.push( 'muteUnmute|' + strMuteUnmuteState );
              }

              // Save in storage for later use
              objTempToSet.arrActiveButtons = arrActiveButtons;
              chrome.storage.sync.set( objTempToSet, function() {
                // Debug
                chrome.storage.sync.get( null, function( objData ) {
                  console.log( 'Global set arrActiveButtons ', objData );
                });
              });
            }

            chrome.notifications.create( 
                objThis.strNotificationId + intTabId
              , objNotificationOptions
              , function() { Global.showNotificationCallback( objTempStationInfo ) }
            );
          }
      );
    });
  }
  ,

  /**
   * 1.c.
   *
   * Actions after notification has been displayed
   *
   * @type    method
   * @param   objStationInfo
   *            Last Track + Station info
   * @return  void
   **/
  showNotificationCallback : function( objStationInfo ) {
    console.log( 'Successfully created PoziTone Notification # ' + Global.intNotificationCount );
    Global.intNotificationCount++;

    Background.saveRecentTrackInfo( objStationInfo ); 
  }
  ,

  /**
   * 1.d.
   *
   * Checks whether the URL starts with correct prefix.
   *
   * @type    method
   * @param   strUrl
   *            Provided URL
   * @return  void
   **/
  isValidUrl : function ( strUrl ) {
    // http://stackoverflow.com/a/8498668/561712
    var $tempA = document.createElement( 'a' );

    $tempA.href = strUrl;

    return this.arrValidUrl.indexOf( $tempA.hostname ) !== -1;
  }
  ,

  /**
   * 1.e.
   *
   * Gets valid URL
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  string
   **/
  getValidUrl : function ()
  {
    return this.strValidUrl;
  }
  ,

  /**
   * 1.f.
   *
   * Saves open tabs objects for later use
   *
   * @type    method
   * @param   objOpenTabs
   *            Object of open tabs
   * @return  void
   **/
  saveOpenTabs : function ( objOpenTabs )
  {
    var objToSet = {};

    objToSet.objOpenTabs = {};

    for ( var intWindowId in objOpenTabs ) {
      if ( objOpenTabs.hasOwnProperty( intWindowId ) ) {
        // If there are no open tabs for this windowId saved yet
        if ( Global.isEmpty( objToSet.objOpenTabs[ intWindowId ] ) === true )
          objToSet.objOpenTabs[ intWindowId ] = {};

        var objTempWindowTabs = objOpenTabs[ intWindowId ];

        for ( var intTabIndex in objTempWindowTabs ) {
          if ( objTempWindowTabs.hasOwnProperty( intTabIndex ) ) {
            objToSet.objOpenTabs[ intWindowId ][ intTabIndex ] = objTempWindowTabs[ intTabIndex ];
          }
        }
      }
    }

    if ( Global.isEmpty( objToSet ) !== true )
      chrome.storage.sync.set( objToSet, function() {
        // Debug
        chrome.storage.sync.get( null, function( objData ) {
          console.log( 'Global saveOpenTabs ', objData );
        });
      });
  }
  ,

  /**
   * 1.g.
   *
   * Checks whether object/array is empty
   *
   * @type    method
   * @param   objToTest
   *            Object to check against
   * @return  bool
   **/
  isEmpty : function ( objToTest )
  {
    for ( var i in objToTest )
      return false;

    return true;
  }
  ,

  /**
   * 1.h.
   *
   * Finds first open tab and invoke callback.
   * funcCallback() should return 0 to continue search for the right tab.
   *
   * @type    method
   * @param   funcCallback
   *            Callback to invoke when open tab found
   * @return  bool
   **/
  findFirstOpenTabInvokeCallback : function ( funcCallback )
  {
    chrome.storage.sync.get( 'objOpenTabs', function( objReturn ) {
      // Debug
      console.log( 'Global findFirstOpenTabInvokeCallback ', objReturn );

      var objOpenTabs = objReturn.objOpenTabs;

      for ( var intWindowId in objOpenTabs ) {
        if ( objOpenTabs.hasOwnProperty( intWindowId ) ) {
          var objTempWindowTabs = objOpenTabs[ intWindowId ];

          for ( var intTabIndex in objTempWindowTabs ) {
            if ( objTempWindowTabs.hasOwnProperty( intTabIndex ) ) {
              
              if ( funcCallback(
                    parseInt( intWindowId )
                  , parseInt( intTabIndex )
                  , objTempWindowTabs[ intTabIndex ].id
                ) !== 0 )
              return;
            }
          }
        }
      }
    });
  }
};

/* ====================================================================================

  2.                              On Load

 ==================================================================================== */

/**
 * 2.a.
 *
 * Initialize
 *
 * @type    method
 * @param   No Parameters taken
 * @return  void
 **/
Global.init();