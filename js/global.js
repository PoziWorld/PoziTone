/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2014 PoziWorld
  License                 :           pozitone.com/license
  File                    :           js/global.js
  Description             :           Global JavaScript

  Table of Contents:

  1. Global
      init()
      setStorageItems()
      showNotification()
      showNotificationCallback()
      removeNotification()
      saveTabsIds()
      saveActiveButtons()
      saveOpenTabs()
      isValidUrl()
      getValidUrl()
      isEmpty()
      findFirstOpenTabInvokeCallback()
      checkIfModuleIsEnabled()
      getTabIdFromNotificationId()
      composeNotificationId()
      returnIndexOfSubarrayContaining()
  2. On Load
      Initialize

 ============================================================================ */

/* =============================================================================

  1. Global

 ============================================================================ */

var
    strNotificationIdSeparator      = '_'

  , Global                          = {
      intNoVolume                   : 0
    , strNotificationIdSeparator    : strNotificationIdSeparator
    , strNotificationId             : 'PoziTone' + strNotificationIdSeparator
                                                     // + module name + tab ID
    , strNotificationIconUrl        : 'img/notification-icon-80.png'
    , strNoTrackInfo                : '...'
    , strPlayerIsOffClass           : 'play'
    , strModuleSettingsPrefix       : 'objSettings_'

    // Embedded modules (replicates manifest's "content_scripts")
    , objModules                    : {
          ru_101                    : {
              objRegex              : /(http:\/\/|https:\/\/)101.ru\/.*/
            , arrJs                 : [
                  'modules/ru_101/js/uppod-player-api.js'
                , 'modules/ru_101/js/uppod-player-api.js'
            ]
          }
        , com_vk_audio              : {
              objRegex              : /(http:\/\/|https:\/\/)vk.com\/.*/
            , arrJs                 : [
                  'modules/com_vk_audio/js/page-watcher.js'
            ]
          }
    }

    // Don't show these buttons, if they've been clicked for this track already
    , arrAddTrackToPlaylistFeedback : [
          chrome.i18n.getMessage(
            'poziNotificationAddTrackToPlaylistFeedbackSuccessfullyAdded'
          )
        , chrome.i18n.getMessage(
            'poziNotificationAddTrackToPlaylistFeedbackAlreadyInPlaylist'
          )
      ]
    , strFavoriteStatusSuccess      : 
        chrome.i18n.getMessage( 'poziNotificationFavoriteStatusSuccess' )

    , arrNotificationButtons    : {
          miscDefault           : [ 'add', 'muteUnmute' ]
        , add                   : {
              loggedIn          : {
                  objButton     : {
                      title     : 
                        chrome.i18n.getMessage(
                          'poziNotificationButtonsAddLoggedInTitle'
                        )
                    , iconUrl   : 'img/round_plus_icon&16.png'
                  }
                , strFunction   : 'add'
              }
          }
        , favorite              : {
              loggedIn          : {
                  objButton     : {
                      title     : 
                        chrome.i18n.getMessage(
                          'poziNotificationButtonsFavoriteLoggedInTitle'
                        )
                    , iconUrl   : 'img/emotion_smile_icon&16.png'
                  }
                , strFunction   : 'favorite'
              }
          }
        , next                  : {
              next              : {
                  objButton     : {
                      title     : 
                        chrome.i18n.getMessage(
                          'poziNotificationButtonsNextTitle'
                        )
                    , iconUrl   : 'img/playback_next_icon&16.png'
                  }
                , strFunction   : 'next'
              }
          }
        , playStop              : {
              play              : {
                  objButton     : {
                      title     : 
                        chrome.i18n.getMessage(
                          'poziNotificationButtonsPlayTitle'
                        )
                    , iconUrl   : 'img/playback_play_icon&16.png'
                  }
                , strFunction   : 'playStop'
              }
            , stop              : {
                  objButton     : {
                      title     : 
                        chrome.i18n.getMessage(
                          'poziNotificationButtonsStopTitle'
                        )
                    , iconUrl   : 'img/playback_stop_icon&16.png'
                  }
                , strFunction   : 'playStop'
              }
          }
        , muteUnmute            : {
              mute              : {
                  objButton     : {
                      title     : 
                        chrome.i18n.getMessage(
                          'poziNotificationButtonsMuteTitle'
                        )
                    , iconUrl   : 'img/sound_mute_icon&16.png'
                  }
                , strFunction   : 'mute'
              }
            , unmute            : {
                  objButton     : {
                      title     : 
                        chrome.i18n.getMessage(
                          'poziNotificationButtonsUnmuteTitle'
                        )
                    , iconUrl   : 'img/sound_high_icon&16.png'
                  }
                , strFunction   : 'unmute'
              }
          }
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
  }
  ,

  /**
   * Sets multiple items in StorageArea.
   *
   * @type    method
   * @param   objItems
   *            An object which gives each key/val pair to update storage with.
   * @param   strLog
   *            Debug line "prefix".
   * @return  void
   **/
  setStorageItems : function( objItems, strLog ) {
    chrome.storage.sync.set( objItems, function() {
      var strSetStorageItemsLog = strLog;
      Log.add( strLog + strLogDo, objItems );

      if ( chrome.runtime.lastError ) {
        Log.add( strLog + strLogError, {}, true );
        return;
      }

      chrome.storage.sync.get( null, function( objAllItemsAfterUpdate ) {
        Log.add( strSetStorageItemsLog + strLogDone, objAllItemsAfterUpdate );
      });
    });
  }
  ,

  /**
   * Display current track info via Notification
   *
   * @type    method
   * @param   boolIsUserLoggedIn
   *            Whether user logged-in or not
   * @param   boolDisregardSameMessage
   *            If true, show notification in any case
   * @param   intTabId
   *            Tab ID info received from
   * @param   objPlayerInfo
   *            Player info (play status, volume, etc.)
   * @param   objStationInfo
   *            Station info
   *              (strStationName, strStationNamePlusDesc, strTrackInfo)
   * @param   strCommand
   *            Optional. Which command made this call
   * @return  void
   **/
  showNotification : function(
      boolIsUserLoggedIn
    , boolDisregardSameMessage
    , intTabId
    , objPlayerInfo
    , objStationInfo
    , strCommand
  ) {
    strLog = 'showNotification';
    Log.add( strLog, objStationInfo );

    var
        objNotificationOptions  = {
          type                  : 'basic',
          title                 : '',
          message               : objStationInfo.strTrackInfo,
          iconUrl               : Global.strNotificationIconUrl
        }
      , objTempPlayerInfo       = objPlayerInfo
      , objTempStationInfo      = objStationInfo
      , strModule               = objTempPlayerInfo.strModule
      , strStorageVar           = Global.strModuleSettingsPrefix + strModule
      , strNotificationId       = Global.composeNotificationId(
                                      strModule
                                    , intTabId
                                  )
      ;

    // Clear notification for this tab first, then display a new one
    chrome.notifications.clear( strNotificationId, function() {
      chrome.storage.sync.get(
          [ strStorageVar ]
        , function( objReturn ) {
            var objData = objReturn[ strStorageVar ];

            // Whether to show notification or not
            if (
                  ! boolDisregardSameMessage
              &&  typeof
                    objData.boolShowNotificationWhenStopped !== 'undefined'
              &&  ! objData.boolShowNotificationWhenStopped
              &&  objTempPlayerInfo.strStatus === Global.strPlayerIsOffClass
            )
              return false;

            if (
                  ! boolDisregardSameMessage
              &&  typeof
                    objData.boolShowNotificationWhenMuted !== 'undefined'
              &&  ! objData.boolShowNotificationWhenMuted
              &&  objTempPlayerInfo.intVolume === Global.intNoVolume
            )
              return false;

            if (
                  ! boolDisregardSameMessage
              &&  typeof 
                    objData.boolShowNotificationWhenNoTrackInfo !== 'undefined'
              &&  ! objData.boolShowNotificationWhenNoTrackInfo
              &&  objTempStationInfo.strTrackInfo === Global.strNoTrackInfo
            )
              return false;

            // Notification Icon Settings
            if (
                  objData.boolShowNotificationLogo
              &&  objStationInfo.strLogoDataUri !== null
            )
              objNotificationOptions.iconUrl = objStationInfo.strLogoDataUri;

            var
                strTitleFormat = objData.strNotificationTitleFormat || ''
              , arrButtons     = objData.arrNotificationButtons
              ;

            // Notification Title Settings
            if ( strTitleFormat === 'short' )
              objNotificationOptions.title = 
                objTempStationInfo.strStationName;
            else if ( strTitleFormat === 'long' )
              objNotificationOptions.title = 
                objTempStationInfo.strStationNamePlusDesc;
            else if ( strTitleFormat === 'noStationInfo' )
              objNotificationOptions.title = 
                chrome.i18n.getMessage( 'poziNotificationTitle' );

            // Notification Buttons Settings
            if ( arrButtons.length !== 0 ) {
              // Save active buttons for the listener
              var
                  arrActiveButtons  = []
                , arrTrackInfo      = objTempStationInfo
                                        .strTrackInfo.split( "\n\n" )
                ;

              objNotificationOptions.buttons = [];

              // TODO: Combine all following buttons check into one

              if (
                    arrButtons.indexOf( 'add' ) !== -1
                &&  (
                          boolIsUserLoggedIn
                      &&  (
                                typeof
                                  objTempStationInfo
                                    .boolHasAddToPlaylistButton ===
                                      'undefined'
                            ||  objTempStationInfo.boolHasAddToPlaylistButton
                          )
                    )
              ) {
                // Don't show button, if track is in playlist
                // TODO: Show if track changed while waited for server response
                if (
                  Global
                    .arrAddTrackToPlaylistFeedback
                      .indexOf( arrTrackInfo[ 1 ] ) === -1
                ) {
                  objNotificationOptions.buttons.push(
                    Global
                      .arrNotificationButtons
                        .add
                          .loggedIn
                            .objButton
                  );

                  arrActiveButtons.push( 'add|loggedIn' );
                }
              }

              if (
                    arrButtons.indexOf( 'favorite' ) !== -1
                &&  boolIsUserLoggedIn
              ) {
                // Don't show button, if liked this track already
                // TODO: Show if track changed while waited for server response
                if (
                  Global
                    .strFavoriteStatusSuccess
                      .indexOf( arrTrackInfo[ 1 ] ) === -1
                ) {
                  objNotificationOptions.buttons.push(
                    Global
                      .arrNotificationButtons
                        .favorite
                          .loggedIn
                            .objButton
                  );

                  arrActiveButtons.push( 'favorite|loggedIn' );
                }
              }

              if (
                    arrButtons.indexOf( 'next' ) !== -1
                &&  (
                          boolIsUserLoggedIn
                      ||  (
                                typeof
                                  objTempPlayerInfo
                                    .boolCanPlayNextTrackLoggedOut ===
                                      'undefined'
                            ||  objTempPlayerInfo.boolCanPlayNextTrackLoggedOut
                          )
                    )
              ) {
                objNotificationOptions.buttons.push(
                  Global
                    .arrNotificationButtons
                      .next
                        .next
                          .objButton
                );

                arrActiveButtons.push( 'next|next' );
              }

              if ( arrButtons.indexOf( 'playStop' ) !== -1 ) {
                objNotificationOptions.buttons.push(
                  Global
                    .arrNotificationButtons
                      .playStop[ objTempPlayerInfo.strStatus ]
                        .objButton
                );

                arrActiveButtons
                  .push( 'playStop|' + objTempPlayerInfo.strStatus );
              }

              if ( arrButtons.indexOf( 'muteUnmute' ) !== -1 ) {
                var strMuteUnmuteState = ( objTempPlayerInfo.intVolume > 0 ) ? 
                                           'mute' : 'unmute';

                objNotificationOptions.buttons.push(
                  Global
                    .arrNotificationButtons
                      .muteUnmute[ strMuteUnmuteState ]
                        .objButton
                );

                arrActiveButtons.push( 'muteUnmute|' + strMuteUnmuteState );
              }
            }

            chrome.notifications.create( 
                strNotificationId
              , objNotificationOptions
              , function( strNotificationId ) {
                  Global.showNotificationCallback(
                      objTempPlayerInfo
                    , objTempStationInfo
                    , intTabId
                    , arrActiveButtons
                    , strCommand
                  );
                }
            );
          }
      );
    });
  }
  ,

  /**
   * Actions after notification has been displayed
   *
   * @type    method
   * @param   objPlayerInfo
   *            Play status, volume, etc.
   * @param   objStationInfo
   *            Last Track + Station info
   * @param   intTabId
   *            Tab ID info received from
   * @param   arrActiveButtons
   *            Active buttons for current notification
   * @param   strCommand
   *            Optional. Which command made this call
   * @return  void
   **/
  showNotificationCallback : function(
      objPlayerInfo
    , objStationInfo
    , intTabId
    , arrActiveButtons
    , strCommand
  ) {
    var strModule = objPlayerInfo.strModule;

    /* START Log */
    var
        arrTrackInfo  = objStationInfo.strTrackInfo.split( "\n\n" )
      , funcLog       = function() {
          strLog = 'showNotificationCallback';
          Log.add(
              strLog
            , {
                  strModule                   : strModule
                , strStationName              : objStationInfo.strStationName
                , boolHasAddToPlaylistButton  : 
                    objStationInfo.boolHasAddToPlaylistButton || 'n/a'
              }
            , true
          );
        }
      ;

    // There is no arrTrackInfo[ 1 ] only on track change (automatic and when
    // clicked 'next', too) and on 'showNotification' command
    if (
          typeof arrTrackInfo[ 1 ] === 'undefined'
      &&  strCommand !== 'showNotification'
    )
      funcLog();
    else
      chrome.storage.sync.get( 'arrRecentTracks', function( objReturn ) {
        if ( typeof objReturn.arrRecentTracks === 'object' ) {
          var arrLastTrack = objReturn.arrRecentTracks.pop();

          // Don't log when same player, station & track info as last track. 
          // Even on page reload.
          if (
                (
                      arrLastTrack      === undefined
                  ||  arrLastTrack[ 0 ] !== arrTrackInfo[ 0 ]
                  ||  arrLastTrack[ 1 ] !== objStationInfo.strStationName
                  ||  arrLastTrack[ 2 ] !== objStationInfo.strLogoUrl
                )
            &&  strCommand !== 'showNotification'
          )
            funcLog();
        }
      });
    /* END Log */

    Background.saveRecentTrackInfo( objStationInfo ); 
    Global.saveTabsIds( intTabId, strModule );
    Global.saveActiveButtons( intTabId, arrActiveButtons );
  }
  ,

  /**
   * Remove the notification for this tab.
   *
   * @type    method
   * @param   intTabId
   *            ID of the tab
   * @param   strModule
   *            Module notification was displayed for
   * @return  void
   **/
  removeNotification : function( intTabId, strModule ) {
    var funcRemoveNotification = function( intTabId, strModule ) {
      chrome.notifications.clear(
          Global.composeNotificationId( strModule, intTabId )
        , function( boolWasCleared ) {
            strLog = 'removeNotification';
            Log.add( strLog, intTabId );

            if ( boolWasCleared ) {
              var arrVars = [ 'objActiveButtons', 'arrTabsIds' ];

              chrome.storage.sync.get( arrVars, function( objData ) {
                strLog = 'removeNotification';
                var intChanges = 0;

                // Remove this notification's active buttons
                if ( typeof objData.objActiveButtons[ intTabId ] === 'object' ) {
                  delete objData.objActiveButtons[ intTabId ];
                  intChanges++;
                }

                // Remove this notification's tab id
                var
                    arrTabsIds  = objData.arrTabsIds
                  , intIndex    = Global.returnIndexOfSubarrayContaining(
                                      arrTabsIds
                                    , intTabId
                                  )
                  ;

                if ( intIndex !== -1 ) {
                  arrTabsIds.splice( intIndex, 1 );
                  intChanges++;
                }

                // "Submit" changes
                if ( intChanges > 0 )
                  Global.setStorageItems( objData, strLog + ', submit' );
              });
            }
        }
      );
    }

    if ( typeof strModule === 'undefined' ) {
      chrome.storage.sync.get( 'arrTabsIds', function( objData ) {
        strLog = 'removeNotification, strModule';
        Log.add( strLog, intTabId );

        var arrTabsIds = objData.arrTabsIds;

        if ( typeof arrTabsIds === 'undefined' )
          return;

        var intIndex = 
              Global.returnIndexOfSubarrayContaining( arrTabsIds, intTabId );

        if ( intIndex !== -1 ) {
          strModule = arrTabsIds[ intIndex ][ 1 ];
          funcRemoveNotification( intTabId, strModule );
        }
      });
    }
    else
      funcRemoveNotification( intTabId, strModule );
  }
  ,

  /**
   * Save id of tab, for which notification was shown, in storage for later use
   * 
   * TODO: Use obj instead of arr?
   *
   * @type    method
   * @param   intTabId
   *            Tab ID info received from
   * @param   strModule
   *            Module notification was displayed for
   * @return  void
   **/
  saveTabsIds : function ( intTabId, strModule ) {
    chrome.storage.sync.get( 'arrTabsIds', function( objData ) {
      strLog = 'saveTabsIds';
      Log.add( strLog, intTabId );

      var arrTabsIds = objData.arrTabsIds;

      if ( typeof arrTabsIds === 'undefined' )
        arrTabsIds = [];

      var
          intIndex      = Global.returnIndexOfSubarrayContaining(
                              arrTabsIds
                            , intTabId
                          )
        , intLastIndex  = arrTabsIds.length - 1
        , intChanges    = 0
        , arrToPush     = [ intTabId, strModule ]
        , funcPush      = function() {
                            arrTabsIds.push( arrToPush );
                            intChanges++;
                          }
        ;

      // Save if it is not present or "reposition" to be the last
      if ( intIndex === -1 )
        funcPush();
      else if ( intIndex !== intLastIndex ) {
        arrTabsIds.splice( intIndex, 1 );
        funcPush();
      }

      // "Submit" changes
      if ( intChanges > 0 )
        Global.setStorageItems( objData, strLog );
    });
  }
  ,

  /**
   * Save active buttons (per notification's tab id) in storage for later use
   *
   * @type    method
   * @param   intTabId
   *            Tab ID info received from
   * @param   arrActiveButtons
   *            Active buttons for current notification
   * @return  void
   **/
  saveActiveButtons : function ( intTabId, arrActiveButtons ) {
    chrome.storage.sync.get( 'objActiveButtons', function( objData ) {
      strLog = 'saveActiveButtons';
      Log.add(
          strLog
        , {
              intTabId          : intTabId
            , arrActiveButtons  : arrActiveButtons
          }
      );

      if ( typeof objData.objActiveButtons === 'undefined' )
        objData.objActiveButtons = {};

      if (
            typeof objData.objActiveButtons[ intTabId ] === 'undefined'
        ||  JSON.stringify( objData.objActiveButtons[ intTabId ] ) !== 
              JSON.stringify( arrActiveButtons )
      ) {
        objData.objActiveButtons[ intTabId ] = arrActiveButtons;

        Global.setStorageItems( objData, strLog );
      }
    });
  }
  ,

  /**
   * Saves open tabs objects for later use
   *
   * @type    method
   * @param   objOpenTabs
   *            Object of open tabs
   * @return  void
   **/
  saveOpenTabs : function ( objOpenTabs ) {
    strLog = 'saveOpenTabs';
    Log.add( strLog, objOpenTabs );

    var objToSet = {};

    objToSet.objOpenTabs = {};

    for ( var intWindowId in objOpenTabs ) {
      if ( objOpenTabs.hasOwnProperty( intWindowId ) ) {
        // If there are no open tabs for this windowId saved yet
        if ( Global.isEmpty( objToSet.objOpenTabs[ intWindowId ] ) )
          objToSet.objOpenTabs[ intWindowId ] = {};

        var objTempWindowTabs = objOpenTabs[ intWindowId ];

        for ( var intTabIndex in objTempWindowTabs ) {
          if ( objTempWindowTabs.hasOwnProperty( intTabIndex ) ) {
            objToSet.objOpenTabs[ intWindowId ][ intTabIndex ] = 
              objTempWindowTabs[ intTabIndex ];
          }
        }
      }
    }

    chrome.storage.sync.get( 'objOpenTabs', function( objReturn ) {
      if (
        ! (
              Global.isEmpty( objToSet.objOpenTabs )
          &&  Global.isEmpty( objReturn.objOpenTabs )
        )
      ) {
        strLog = 'saveOpenTabs';

        Global.setStorageItems( objToSet, strLog );
      }
    });
  }
  ,

  /**
   * Checks whether the URL is supported.
   *
   * @type    method
   * @param   strUrl
   *            Provided URL
   * @return  void
   **/
  isValidUrl : function ( strUrl ) {
    var
        objModules  = this.objModules
      ;

    for ( var strModule in objModules ) {
      if ( objModules.hasOwnProperty( strModule ) ) {
        var objRegEx = objModules[ strModule ].objRegex;

        if ( objRegEx.test( strUrl ) )
          return strModule;
        }
    }

    return false;
  }
  ,

  /**
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
   * Makes an object out of an array
   *
   * @type    method
   * @param   arrToConvert
   *            Array to convert
   * @return  object
   **/
  convertArrToObj : function ( arrToConvert )
  {
    return obj = arrToConvert.reduce(
        function( o, v, i ) {
          o[ i ] = v;
          return o;
        }
      , {}
    );
  }
  ,

  /**
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
      strLog = 'findFirstOpenTabInvokeCallback';
      Log.add( strLog );

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
                  , objTempWindowTabs[ intTabIndex ].url
                ) !== 0 )
                return;
            }
          }
        }
      }
    });
  }
  ,

  /**
   * Checks whether a module is enabled.
   *
   * @type    method
   * @param   strNotificationId
   *            Notification ID
   * @return  integer
   **/
  checkIfModuleIsEnabled : function (
      strModule
    , intTabId
    , funcSuccess
    , funcElse
    , objPreservedData
    , strFrom
  ) {
    var strObjSettings = Global.strModuleSettingsPrefix + strModule;

    chrome.storage.sync.get(
        strObjSettings
      , function( objReturn ) {
          var objModuleSettings = objReturn[ strObjSettings ];

          if (
                typeof objModuleSettings === 'object'
            &&  objModuleSettings.boolIsEnabled
          ) {
            strLog = 'checkIfModuleIsEnabled, ' + strFrom;
            Log.add( strLog + strLogSuccess, intTabId );

            funcSuccess( objPreservedData );
          }
          else
            funcElse( objPreservedData );
        }
    );
  }
  ,

  /**
   * Extracts tab ID from notification id.
   *
   * @type    method
   * @param   strNotificationId
   *            Notification ID
   * @return  integer
   **/
  getTabIdFromNotificationId : function ( strNotificationId )
  {
    var
        arrNotificationId     = strNotificationId.split(
                                  Global.strNotificationIdSeparator
                                )
      , intNotificationIdLen  = arrNotificationId.length
      , intNotificationTabId  = parseInt(
                                  arrNotificationId[ intNotificationIdLen - 1 ]
                                )
      ;

    return intNotificationTabId;
  }
  ,

  /**
   * Composes notification ID
   *
   * @type    method
   * @param   intTabId
   *            Tab ID notification belongs to
   * @param   strModule
   *            Module notification was displayed for
   * @return  string
   **/
  composeNotificationId : function ( strModule, intTabId )
  {
    return Global.strNotificationId + 
            strModule + 
            Global.strNotificationIdSeparator + 
            intTabId;
  }
  ,

  /**
   * Finds item in subarray, returns its index
   *
   * @type    method
   * @param   arrContainer
   *            Array containing subarrays
   * @param   miscItem
   *            What to look for
   * @return  integer
   **/
  returnIndexOfSubarrayContaining : function ( arrContainer, miscItem )
  {
    return arrContainer
            .map(
              function ( arrSub ) {
                return arrSub[ 0 ]
              }
            )
              .indexOf( miscItem );
  }
};

/* =============================================================================

  2. On Load

 ============================================================================ */

/**
 * Initialize
 *
 * @type    method
 * @param   No Parameters taken
 * @return  void
 **/
Global.init();