/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2014 PoziWorld
  License                 :           pozitone.com/license
  File                    :           js/background.js
  Description             :           Background JavaScript

  Table of Contents:

  1. Background
      init()
      cleanUp()
      removeOldSettings()
      setExtensionDefaults()
      saveRecentTrackInfo()
      onMessageCallback()
      checkOpenTabs()
      checkIfOpenTabChangedDomainOnUpdated()
      checkIfOpenTabChangedDomainOnReplaced()
      checkIfHostnameChanged()
  2. Listeners
      runtime.onMessage + runtime.onMessageExternal
      notifications.onClicked
      notifications.onButtonClicked
      commands.onCommand
      runtime.onInstalled
      runtime.onStartup
      tabs.onUpdated
      tabs.onReplaced
      tabs.onRemoved
  3. On Load
      Initialize

 ============================================================================ */

/* =============================================================================

  1. Background

 ============================================================================ */

var Background                    = {
    strObjOpenTabsName            : 'objOpenTabs'

  , strPreviousTrack              : ''
  , arrTrackInfoPlaceholders      : [
      , ''
      , '...'
      , 'Ожидаем следующий трек...'
      , 'Ждём название трека...'
    ]
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
   * Clean up in case of browser (re-)load/crash, extension reload, etc.
   *
   * @type    method
   * @param   boolOnInstalled
   *            Whether to set extension defaults on clean-up complete
   * @param   objDetails
   *            Reason - install/update/chrome_update - 
   *            and (optional) previous version
   * @return  void
   **/
  cleanUp : function( boolOnInstalled, objDetails ) {
    strLog = 'cleanUp';
    Log.add( strLog );

    var arrSettingsToCleanUp  = [
                                    'objActiveButtons'
                                  , 'arrTabsIds'
                                ];

    chrome.storage.sync.remove( arrSettingsToCleanUp, function() {
      if (
            typeof boolOnInstalled !== 'undefined'
        &&  boolOnInstalled
      )
        Background.removeOldSettings( objDetails );
    });
  }
  ,

  /**
   * Remove old settings when updated to a newer version
   * (some vars could have been renamed, deprecated)
   *
   * @type    method
   * @param   objDetails
   *            Reason - install/update/chrome_update - 
   *            and (optional) previous version
   * @return  void
   **/
  removeOldSettings : function( objDetails ) {
    strLog = 'removeOldSettings';
    Log.add( strLog, objDetails );

    if (
          objDetails.reason === 'update'
      &&  typeof objDetails.previousVersion !== 'undefined'
      &&  objDetails.previousVersion < chrome.runtime.getManifest().version
    ) {
      chrome.storage.sync.get( null, function( objReturn ) {
        strLog = 'removeOldSettings';

        var
            arrSettingsToRemove   = []
          , arrDeprecatedSettings = [
                                        'arrActiveButtons'
                                      , 'arrLastTracks'
                                      , 'arrNotificationButtons'
                                      , 'intLastTracksToKeep'
                                      , 'boolNotificationShowStationLogo'
                                      , 'boolNotificationShowWhenStopped'
                                      , 'boolNotificationShowWhenMuted'
                                      , 'boolNotificationShowWhenNoTrackInfo'
                                      , 'strNotificationTitleFormat'
                                    ]
          ;

        for (
          var i = 0, intSettingsToRemove = arrDeprecatedSettings.length;
          i < intSettingsToRemove;
          i++
        ) {
          var strSettingToRemove = arrDeprecatedSettings[ i ];

          // Remove it only if it is present
          if ( objReturn[ strSettingToRemove ] )
            arrSettingsToRemove.push( strSettingToRemove );
        }

        if ( ! Global.isEmpty( arrSettingsToRemove ) ) {
          chrome.storage.sync.remove( arrSettingsToRemove, function() {
            strLog = 'removeOldSettings';
            Log.add( strLog + strLogDo, arrSettingsToRemove, true );

            if ( chrome.runtime.lastError ) {
              Log.add( strLog + strLogError, {}, true );
              return;
            }

            chrome.storage.sync.get( null, function( objData ) {
              strLog = 'removeOldSettings';
              Log.add( strLog + strLogDone, objData );
            });

            Background.setExtensionDefaults();
          });
        }
        else {
          Log.add( strLog + strLogDoNot );

          Background.setExtensionDefaults();
        }
      });
    }
    else {
      Log.add( strLog + strLogDoNot );
      
      Background.setExtensionDefaults();
    }
  }
  ,

  /**
   * Set extension defaults
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  setExtensionDefaults : function() {
    chrome.storage.sync.get( null, function( objReturn ) {
      strLog = 'setExtensionDefaults';
      Log.add( strLog );

      // 1. To set
      var
          objTempToSet                                  = {}
        , objSettingsDefaults                           = {
              objActiveButtons                          : {}
            , objOpenTabs                               : {}
            , arrTabsIds                                : []
            , arrRecentTracks                           : []
            , intRecentTracksToKeep                     : 10

            , objSettings_general                       : {
                  strJoinUeip                           : 'no'
              }
            , objSettings_ru_101                        : {
                  boolEnabled                           : true
                , boolNotificationShowLogo              : true
                , strNotificationTitleFormat            : 'short'
                , arrNotificationButtons                : [
                                                              'add'
                                                            , 'muteUnmute'
                                                          ]
                , boolNotificationShowWhenStopped       : false
                , boolNotificationShowWhenMuted         : false
                , boolNotificationShowWhenNoTrackInfo   : false
              }
            , objSettings_com_vk_audio                  : {
                  boolEnabled                           : true
                , boolNotificationShowLogo              : true
                , arrNotificationButtons                : [
                                                              'add'
                                                            , 'next'
                                                          ]
                , boolNotificationShowWhenMuted         : false
              }
          }
        ;

      for ( var strSetting in objSettingsDefaults ) {
        if ( objSettingsDefaults.hasOwnProperty( strSetting ) ) {
          var miscSetting = objSettingsDefaults[ strSetting ];

          // If a new setting introduced, set its default
          if ( typeof objReturn[ strSetting ] === 'undefined' )
            objTempToSet[ strSetting ] = miscSetting;

          if (
                typeof miscSetting === 'object'
            &&  ! Array.isArray( miscSetting )
          )
            for ( var strSubsetting in miscSetting ) {
              if ( miscSetting.hasOwnProperty( strSubsetting ) ) {
                // If a new subsetting introduced, set its default
                if (
                      typeof objReturn[ strSetting ] !== 'undefined'
                  &&  typeof
                        objReturn[ strSetting ][ strSubsetting ] === 'undefined'
                ) {
                  // If the setting has been set before.
                  if ( typeof objTempToSet[ strSetting ] === 'undefined' )
                    // Preserve other subsettings.
                    objTempToSet[ strSetting ] = objReturn[ strSetting ];

                  objTempToSet[ strSetting ][ strSubsetting ] = 
                    miscSetting[ strSubsetting ];
                }
              }
            }
        }
      }

      if ( ! Global.isEmpty( objTempToSet ) )
        Global.setStorageItems( objTempToSet, strLog );
      else
        Log.add( strLog + strLogDoNot );
    });
  }
  ,

  /**
   * Save Last Track info
   *
   * @type    method
   * @param   objStationInfo
   *            Last Track + Station info
   * @return  void
   **/
  saveRecentTrackInfo : function( objStationInfo ) {
    var arrVarsToGet = [ 'arrRecentTracks', 'intRecentTracksToKeep' ];

    chrome.storage.sync.get( arrVarsToGet, function( objReturn ) {
      strLog = 'saveRecentTrackInfo';
      Log.add( strLog, objStationInfo );

      var
          arrRecentTracks     = objReturn.arrRecentTracks
        // Don't include messages with player status (started, resumed, muted)
        , arrTrackInfo        = objStationInfo.strTrackInfo.split( "\n\n" )
        , strTrackInfo        = arrTrackInfo[ 0 ]
        , intIndex            = arrRecentTracks
                                  .map(
                                    function ( arrSub ) {
                                      return arrSub[0]
                                    }
                                  )
                                    .indexOf( strTrackInfo )
        , arrTempRecentTrack  = []
        ;

      if ( intIndex !== -1 ) {
        if ( intIndex !== ( arrRecentTracks.length - 1 ) )
          arrRecentTracks.splice( intIndex, 1 );
        // Don't save if it is already at the last position in the array
        else
          return;
      }
      else {
        var
            intRecentTracksExcess     = arrRecentTracks.length - 
                                          objReturn.intRecentTracksToKeep
          , intRecentTracksToRemove   = (
                                          intRecentTracksExcess < 0 ?
                                            -1 : intRecentTracksExcess
                                        ) + 1
          ;

        arrRecentTracks.splice( 0, intRecentTracksToRemove );
      }

      // Using array instead of object because of QUOTA_BYTES_PER_ITEM
      // developer.chrome.com/extensions/storage.html#property-sync-QUOTA_BYTES_PER_ITEM
      arrTempRecentTrack[ 0 ] = strTrackInfo;
      arrTempRecentTrack[ 1 ] = objStationInfo.strStationName;
      arrTempRecentTrack[ 2 ] = objStationInfo.strLogoUrl;

      arrRecentTracks.push( arrTempRecentTrack );

      Global.setStorageItems( objReturn, strLog );
    });
  }
  ,

  /**
   * Processes messages from PoziTone and its "modules" (external extensions)
   *
   * @type    method
   * @param   objMessage
   *            Message received
   * @param   objSender
   *            Sender of the message
   * @return  void
   **/
  onMessageCallback : function( objMessage, objSender, objSendResponse ) {
    strLog = 'onMessageCallback';
    Log.add( strLog, objMessage );

    var strTrackInfo = objMessage.objStationInfo.strTrackInfo;

    // Show notification if track info changed or extension asks to show it
    // again (for example, set of buttons needs to be changed)
    if (
          Background.arrTrackInfoPlaceholders.indexOf( strTrackInfo ) === -1
      &&  strTrackInfo !== Background.strPreviousTrack
      ||  objMessage.boolDisregardSameMessage
    ) {
      Global.showNotification(
          objMessage.boolUserLoggedIn
        , objMessage.boolDisregardSameMessage
        , objSender.tab.id
        , objMessage.objPlayerInfo
        , objMessage.objStationInfo
        , objMessage.strCommand || ''
      );

      Background.strPreviousTrack = strTrackInfo;
    }
    else
      Log.add( strLog + strLogDoNot, strTrackInfo );
  }
  ,

  /**
   * Checks if there are any changes to open tabs, 
   * detects if supported sites were opened/closed.
   * 
   * TODO: Auto-injection (inject required module detector
   * which will then inject correct PageWatcher).
   *
   * @type    method
   * @param   objSavedTab
   *            Optional. Previous state of tab.
   * @param   intRemovedTabId
   *            Optional. Previous ID of tab.
   * @return  void
   **/
  checkOpenTabs : function( objSavedTab, intRemovedTabId ) {
    chrome.tabs.query( {}, function( tabs ) {
      strLog = 'checkOpenTabs';
      Log.add(
          strLog
        , {
              objSavedTab     : objSavedTab     || {}
            , intRemovedTabId : intRemovedTabId || -1
          }
      );

      var objOpenTabs = {};

      for ( var i = 0, objTab; objTab = tabs[i]; i++ ) {
        if ( objTab.url && Global.isValidUrl( objTab.url ) ) {
          Log.add( strLog + strLogSuccess, objTab.url );

          var
              intWindowId = objTab.windowId
            , intTabId    = objTab.id
            ;

          // If there are no open tabs for this windowId saved yet
          if ( Global.isEmpty( objOpenTabs[ intWindowId ] ) )
            objOpenTabs[ intWindowId ] = {};

          objOpenTabs[ intWindowId ][ objTab.index ] = objTab;

          chrome.tabs.sendMessage(
              intTabId
            , 'Do you copy?'
            , function( strResponse ) {
                if ( strResponse !== 'Copy that.' ) {
//                chrome.tabs.executeScript(
//                    intTabId
//                  , { file: '/modules/ru_101/js/uppod-player-api.js' }
//                );
//                chrome.tabs.executeScript(
//                    intTabId
//                  , { file: '/modules/ru_101/js/page-watcher.js' }
//                );
                }
              }
          );
        }

        // chrome.tabs.onReplaced
        if (
              typeof objSavedTab === 'object'
          &&  typeof intRemovedTabId === 'number'
          &&  objSavedTab.index === objTab.index
        )
          Background.checkIfHostnameChanged(
              objSavedTab
            , objTab
            , intRemovedTabId
          );
      }

      // TODO: Prevent exceeding max number of write operations
      Global.saveOpenTabs( objOpenTabs );

      if ( Global.isEmpty( objOpenTabs ) ) {
        strLog = 'checkOpenTabs';
        Log.add( strLog + strLogNoSuccess );
      }
    });
  }
  ,

  /**
   * Checks if this tab had supported URL, and if changed to not supported one
   * remove the notification (possibly created).
   *
   * @type    method
   * @param   objTab
   *            Tab properties
   * @return  void
   **/
  checkIfOpenTabChangedDomainOnUpdated : function( objTab ) {
    chrome.storage.sync.get(
        Background.strObjOpenTabsName
      , function( objReturn ) {
          strLog = 'checkIfOpenTabChangedDomainOnUpdated';
          Log.add( strLog, objTab );

          var 
              objSavedTabs    = objReturn[ Background.strObjOpenTabsName ]
            , objSavedWindow  = objSavedTabs[ objTab.windowId ]
            ;

          if ( typeof objSavedWindow === 'object' ) {
            var objSavedTab = objSavedWindow[ objTab.index ];

            if ( typeof objSavedTab === 'object' )
              Background.checkIfHostnameChanged( objSavedTab, objTab );
          }
        }
    );
  }
  ,

  /**
   * Checks if this tab had supported URL, and if changed to not supported one
   * remove the notification (possibly created).
   *
   * @type    method
   * @param   intRemovedTabId
   *            Previous Tab ID, before replace
   * @return  void
   **/
  checkIfOpenTabChangedDomainOnReplaced : function( intRemovedTabId ) {
    chrome.storage.sync.get(
        Background.strObjOpenTabsName
      , function( objReturn ) {
          strLog = 'checkIfOpenTabChangedDomainOnReplaced';
          Log.add( strLog, intRemovedTabId );

          var 
              objSavedTabs    = objReturn[ Background.strObjOpenTabsName ]
            ;

          for ( var intWindowId in objSavedTabs ) {
            if ( objSavedTabs.hasOwnProperty( intWindowId ) ) {
              var objSavedWindows = objSavedTabs[ intWindowId ];

              for ( var intTabIndex in objSavedWindows ) {
                if ( objSavedWindows.hasOwnProperty( intTabIndex ) ) {
                  var objSavedTab = objSavedWindows[ intTabIndex ];

                  if ( objSavedTab.id === intRemovedTabId ) {
                    Log.add( strLog + strLogSuccess, intRemovedTabId );

                    Background.checkOpenTabs( objSavedTab, intRemovedTabId );
                    return;
                  }
                }
              }
            }
          }

          Log.add( strLog + strLogNoSuccess, intRemovedTabId );

          // When no tabs had been saved
          Background.checkOpenTabs();
        }
    );
  }
  ,

  /**
   * Checks if hostname of the tab changed.
   * If yes, removes the notification for that tab.
   *
   * @type    method
   * @param   objSavedTab
   *            Previous state of tab
   * @param   objTab
   *            Current state of tab
   * @param   intRemovedTabId
   *            Optional. Previous ID of tab
   * @return  void
   **/
  checkIfHostnameChanged : function( objSavedTab, objTab, intRemovedTabId ) {
    strLog = 'checkIfHostnameChanged';
    Log.add(
        strLog
      , {
            objSavedTab     : objSavedTab
          , objTab          : objTab
          , intRemovedTabId : intRemovedTabId || -1
        }
    );

    // http://stackoverflow.com/a/8498668/561712
    var
        $aSavedTab  = document.createElement( 'a' )
      , $aTab       = document.createElement( 'a' )
      ;

    $aSavedTab.href = objSavedTab.url;
    $aTab.href      = objTab.url;

    if ( $aSavedTab.hostname !== $aTab.hostname ) {
      Log.add( strLog + strLogSuccess );

      var intTabId = objTab.id;

      if ( typeof intRemovedTabId === 'number' )
        intTabId = intRemovedTabId;

      Global.removeNotification( intTabId );
    }
  }
};

/* =============================================================================

  2. Listeners

 ============================================================================ */

/**
 * Listens for track info sent from Page Watcher
 *
 * @type    method
 * @param   objMessage
 *            Message received
 * @param   objSender
 *            Sender of the message
 * @return  void
 **/
chrome.runtime.onMessage.addListener(
  function( objMessage, objSender, objSendResponse ) {
    Background.onMessageCallback( objMessage, objSender, objSendResponse );
  }
);

chrome.runtime.onMessageExternal.addListener(
  function( objMessage, objSender, objSendResponse ) {
    Background.onMessageCallback( objMessage, objSender, objSendResponse );
  }
);

/**
 * Listens for clicks on notification.
 * 
 * Makes a tab which initiated the notification active, 
 * and makes the window focused.
 *
 * @type    method
 * @param   strNotificationId
 *            Notification ID
 * @return  void
 **/
chrome.notifications.onClicked.addListener(
  function( strNotificationId ) {
    strLog = 'chrome.notifications.onClicked';
    Log.add( strLog, { strNotificationId : strNotificationId }, true, true );

    var intNotificationTabId = parseInt(
      strNotificationId.replace( Global.strNotificationId, '' )
    );

    var funcFocusTab = function( intWindowId, intTabIndex, intTabId ) {
      if ( intNotificationTabId === intTabId )
        chrome.windows.update(
            intWindowId
          , { focused: true }
          , function() {
              chrome.tabs.highlight(
                  { windowId: intWindowId, tabs: intTabIndex }
                , function() {
                    strLog = 'chrome.notifications.onClicked';
                    Log.add( strLog + strLogSuccess );
                  }
              );
            }
        );
      // Continue searching for the right tab
      else
        return 0;
    };

    Global.findFirstOpenTabInvokeCallback( funcFocusTab );
  }
);

/**
 * Listens for buttons clicks from notification
 *
 * @type    method
 * @param   strNotificationId
 *            Notification ID
 * @param   intButtonIndex
 *            Notification button index
 * @return  void
 **/
chrome.notifications.onButtonClicked.addListener(
  function( strNotificationId, intButtonIndex ) {
    chrome.storage.sync.get( 'objActiveButtons', function( objReturn ) {
      strLog = 'chrome.notifications.onButtonClicked';
      Log.add(
          strLog
        , {
              strNotificationId : strNotificationId
            , intButtonIndex    : intButtonIndex
            , objActiveButtons  : objReturn
          }
      );

      var
          intTabId    = 
            parseInt(
              strNotificationId.replace( Global.strNotificationId, '' )
            )
        , arrButtons  = objReturn.objActiveButtons[ intTabId ]
        , arrButton   = arrButtons[ intButtonIndex ].split( '|' )
        , strFunction = Global
                          .objSettingsDefaults
                            .arrNotificationButtons[
                              arrButton[ 0 ] ][ arrButton[ 1 ]
                            ]
                              .strFunction
        ;

      Log.add(
          strLog + strLogDo
        , {
              strButton0  : arrButtons[ 0 ]
            , strButton1  : arrButtons[ 1 ]
            , strFunction : strFunction
          }
        , true
      );

      chrome.tabs.sendMessage(
          intTabId
        , 'processButtonClick_' + strFunction
      );
    });
  }
);

/**
 * Listens for hotkeys
 *
 * @type    method
 * @param   strCommand
 *            Command
 * @return  void
 **/
chrome.commands.onCommand.addListener(
  function( strCommand ) {
    chrome.storage.sync.get( 'arrTabsIds', function( objData ) {
      strLog = 'chrome.commands.onCommand';
      Log.add( strLog, { strCommand : strCommand }, true );

      var strMessagePrefix = 'processCommand_';

      // For these it's the same as button click
      if ( strCommand === 'add' || strCommand === 'playStop' )
        strMessagePrefix = 'processButtonClick_';

      var
          arrTabsIds      = objData.arrTabsIds
        , intTabsIds      = arrTabsIds.length
        , intArrIndex     = intTabsIds - 1
        , funcSendMessage = function( intWindowId, intTabIndex, intTabId ) {
                              chrome.tabs.sendMessage(
                                  intTabId
                                , strMessagePrefix + strCommand
                              );
                            }
        ;

      // Try to send to active players first
      var funcSendToActivePlayers = function( intArrIndex ) {
        if ( intArrIndex >= 0 ) {
          var intTabId = arrTabsIds[ intArrIndex ];

          chrome.tabs.sendMessage(
              intTabId
            , 'Are you ready to get a command?'
            , function( strResponse ) {
                if ( strResponse === 'Affirmative.' ) {
                  strLog = 'chrome.commands.onCommand';
                  Log.add( strLog + strLogSuccess, intTabId );

                  funcSendMessage( null, null, intTabId );
                }
                else {
                  intArrIndex--;
                  funcSendToActivePlayers( intArrIndex );
                }
              }
          );
        }
        else {
          // If no active players found, send to first open
          Log.add( strLog + strLogNoSuccess );
          Global.findFirstOpenTabInvokeCallback( funcSendMessage );
        }
      };

      // Start from the end of array (last index = latest notification)
      funcSendToActivePlayers( intArrIndex );
    });
  }
);

/**
 * Fired when the extension is first installed, 
 * when the extension is updated to a new version, 
 * and when Chrome is updated to a new version.
 *
 * @type    method
 * @param   objDetails
 *            Reason - install/update/chrome_update - 
 *            and (optional) previous version
 * @return  void
 **/
chrome.runtime.onInstalled.addListener(
  function( objDetails ) {
    strLog                        = 'chrome.runtime.onInstalled';
    objDetails.currentVersion     = chrome.runtime.getManifest().version;
    objDetails.browserName        = bowser.name;
    objDetails.browserVersion     = bowser.version;
    objDetails.browserVersionFull = bowser.versionFull;
    objDetails.chromeVersion      = bowser.chromeVersion;
    objDetails.chromeVersionFull  = bowser.chromeVersionFull;
    objDetails.userAgent          = bowser.userAgent;

    Log.add( strLog, objDetails, true );

    Background.cleanUp( true, objDetails );
  }
);

/**
 * Fired when a profile that has this extension installed first starts up.
 *
 * @type    method
 * @param   No Parameters Taken
 * @return  void
 **/
chrome.runtime.onStartup.addListener(
  function() {
    strLog = 'chrome.runtime.onStartup';
    Log.add( strLog, {}, true );

    Background.cleanUp();
  }
);

/**
 * When tab is updated (most likely NOT loaded from cache), recheck open tabs. 
 * So that if we, for example, changed URL of tab which would get commands, 
 * after it has been changed, another one gets commands.
 *
 * @type    method
 * @param   intTabId
 * @param   objChangeInfo
 *            Lists the changes to the state of the tab that was updated.
 * @param   objTab
 *            Gives the state of the tab that was updated.
 * @return  void
 **/
chrome.tabs.onUpdated.addListener(
  function( intTabId, objChangeInfo, objTab ) {
    strLog = 'chrome.tabs.onUpdated';
    Log.add( strLog, objChangeInfo );

    var strStatus = objChangeInfo.status;

    if ( typeof strStatus !== 'undefined' ) {
      if ( strStatus === 'loading' )
        Background.checkIfOpenTabChangedDomainOnUpdated( objTab );
      else if ( strStatus === 'complete' )
        Background.checkOpenTabs();
    }
  }
);

/**
 * When tab is replaced with another tab due to prerendering or instant
 * (most likely loaded from cache), recheck open tabs. 
 * So that if we, for example, changed URL of tab which would get commands, 
 * after it has been changed, another one gets commands.
 *
 * @type    method
 * @param   intTabId
 * @param   objChangeInfo
 *            Lists the changes to the state of the tab that was updated.
 * @param   objTab
 *            Gives the state of the tab that was updated.
 * @return  void
 **/
chrome.tabs.onReplaced.addListener(
  function( intAddedTabId, intRemovedTabId ) {
    strLog = 'chrome.tabs.onReplaced';
    Log.add(
        strLog
      , {
            intAddedTabId   : intAddedTabId
          , intRemovedTabId : intRemovedTabId
        }
    );

    Background.checkIfOpenTabChangedDomainOnReplaced( intRemovedTabId );
  }
);

/**
 * When tab is closed, recheck open tabs. 
 * So that if we closed tab which would get commands, after it has been closed,
 * another one gets commands.
 *
 * @type    method
 * @param   intTabId
 *            ID of the tab that has been closed
 * @return  void
 **/
chrome.tabs.onRemoved.addListener(
  function( intTabId ) {
    strLog = 'chrome.tabs.onRemoved';
    Log.add( strLog, intTabId );

    Background.checkOpenTabs();
    Global.removeNotification( intTabId );
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
Background.init();