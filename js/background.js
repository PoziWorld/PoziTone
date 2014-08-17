/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2014 PoziWorld
  License                 :           pozitone.com/license
  File                    :           js/background.js
  Description             :           Background JavaScript

  Table of Contents:

  1. Constants
  2. Background
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
      processButtonClick_seeChanges()
      processButtonClick_doNotNotifyOfUpdates()
  3. Listeners
      runtime.onMessage + runtime.onMessageExternal
      notifications.onClicked
      notifications.onButtonClicked
      commands.onCommand
      runtime.onInstalled
      runtime.onStartup
      tabs.onUpdated
      tabs.onReplaced
      tabs.onRemoved
  4. On Load
      Initialize

 ============================================================================ */

/* =============================================================================

  1. Constants

 ============================================================================ */

const
    objSettingsNotSyncable                        = {
        objActiveButtons                          : {}
      , objOpenTabs                               : {}
      , arrTabsIds                                : []
    }
  , objSettingsSyncable                           = {
        arrRecentTracks                           : []
      , intRecentTracksToKeep                     : 10

      , objSettings_general                       : {
            strJoinUeip                           : 'no'
          , boolShowShortcutsInNotification       : true
          , boolShowWasUpdatedNotification        : true
        }
      , objSettings_ru_101                        : {
            boolIsEnabled                         : true
          , boolShowNotificationLogo              : true
          , strNotificationTitleFormat            : 'short'
          , boolShowKbpsInfo                      : true
          , arrNotificationButtons                : [
                                                        'add'
                                                      , 'muteUnmute'
                                                    ]
          , boolShowNotificationWhenStopped       : false
          , boolShowNotificationWhenMuted         : false
          , boolShowNotificationWhenNoTrackInfo   : false
        }
      , objSettings_com_vk_audio                  : {
            boolIsEnabled                         : true
          , boolShowNotificationLogo              : true
          , boolShowKbpsInfo                      : true
          , arrNotificationButtons                : [
                                                        'add'
                                                      , 'next'
                                                    ]
          , boolShowNotificationWhenMuted         : false
        }
    }
  ;

/* =============================================================================

  2. Background

 ============================================================================ */

var Background                    = {
    strObjOpenTabsName            : 'objOpenTabs'
  , objPreservedSettings          : {}
  , strPreviousTrack              : ''
  , arrTrackInfoPlaceholders      : [
      , ''
      , '...'
      , 'Ожидаем следующий трек'
      , 'Ожидаем следующий трек...'
      , 'Ждём название трека...'
    ]
  , strProcessButtonClick         : 'processButtonClick_'
  , strProcessCommand             : 'processCommand_'
  , strChangelogUrl               : 
      'https://github.com/poziworld/PoziTone/blob/v%v/HISTORY_%lang.md'
  , strVersionParam               : '%v'
  , strLangParam                  : '%lang'
  , objSystemNotificationButtons  : {
        updated                   : [
            {
                objButton         : {
                    title         : chrome.i18n.getMessage(
                                      'systemNotificationUpdatedChanges'
                                    )
                  , iconUrl       : 'img/list_bullets_icon&16.png'
                }
              , strFunction       : 'seeChanges'
            }
          , {
                objButton         : {
                    title         : chrome.i18n.getMessage(
                                      'systemNotificationUpdatedDoNotNotify'
                                    )
                  , iconUrl       : 'img/off_icon&16.png'
                }
              , strFunction       : 'doNotNotifyOfUpdates'
            }
        ]
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
   * Clean up in case of browser (re-)load/crash, extension reload, etc.
   *
   * @type    method
   * @param   boolIsCalledFromOnInstalledListener
   *            Whether to set extension defaults on clean-up complete
   * @param   objDetails
   *            Reason - install/update/chrome_update - 
   *            and (optional) previous version
   * @return  void
   **/
  cleanUp : function( boolIsCalledFromOnInstalledListener, objDetails ) {
    strLog = 'cleanUp';
    Log.add( strLog );

    var arrSettingsToCleanUp  = [
                                    'objActiveButtons'
                                  , 'arrTabsIds'
                                ];

    StorageLocal.remove( arrSettingsToCleanUp, function() {
      if (
            typeof boolIsCalledFromOnInstalledListener !== 'undefined'
        &&  boolIsCalledFromOnInstalledListener
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
          typeof objDetails.boolWasUpdated === 'boolean'
      &&  objDetails.boolWasUpdated
    ) {
      StorageSync.get( null, function( objReturn ) {
        strLog = 'removeOldSettings';

        var
            arrSettingsToRemove   = []
          , objDeprecatedSettings = {
                arrActiveButtons                        : null
              , objActiveButtons                        : null
              , arrLastTracks                           : null
              , arrNotificationButtons                  : null
              , objOpenTabs                             : null
              , arrTabsIds                              : null
              , intLastTracksToKeep                     : null
              , boolNotificationShowStationLogo         : null
              , boolNotificationShowWhenStopped         : null
              , boolNotificationShowWhenMuted           : null
              , boolNotificationShowWhenNoTrackInfo     : null
              , strNotificationTitleFormat              : null
              , objSettings_ru_101                      : {
                    boolEnabled                         : null
                  , boolNotificationShowLogo            : null
                  , boolNotificationShowWhenStopped     : null
                  , boolNotificationShowWhenMuted       : null
                  , boolNotificationShowWhenNoTrackInfo : null
                }
              , objSettings_com_vk_audio                : {
                    boolEnabled                         : null
                  , boolNotificationShowLogo            : null
                  , boolNotificationShowWhenMuted       : null
                }
            }
          ;

        for ( miscSetting in objDeprecatedSettings ) {
          if ( objDeprecatedSettings.hasOwnProperty( miscSetting ) ) {
            if ( objDeprecatedSettings[ miscSetting ] === null ) {
              // Remove it only if it is present
              if ( objReturn[ miscSetting ] )
                arrSettingsToRemove.push( miscSetting );
            }
            else {
              // If deprecated subsetting is present in current setting object,
              // remove it preserving the rest.
              // Restore preserved in setExtensionDefaults().
              var
                  objCurrentSetting     = objReturn[ miscSetting ]
                , objDeprecatedSetting  = objDeprecatedSettings[ miscSetting ]
                ;

              if ( objCurrentSetting ) {
                for ( miscSubsetting in objDeprecatedSetting ) {
                  if ( objDeprecatedSetting.hasOwnProperty( miscSubsetting ) ) {
                    if ( typeof objCurrentSetting[ miscSubsetting ] === 
                          'undefined' )
                      delete objDeprecatedSetting[ miscSubsetting ];
                    
                    delete objCurrentSetting[ miscSubsetting ];
                  }
                }

                if ( ! Global.isEmpty( objDeprecatedSetting ) ) {
                  Background.objPreservedSettings[ miscSetting ] = 
                    objCurrentSetting;

                  arrSettingsToRemove.push( miscSetting );
                }
              }
            }
          }
        }

        if ( ! Global.isEmpty( arrSettingsToRemove ) ) {
          StorageSync.remove( arrSettingsToRemove, function() {
            strLog = 'removeOldSettings';
            Log.add( strLog + strLogDo, arrSettingsToRemove, true );

            if ( chrome.runtime.lastError ) {
              var
                  objLogDetails   = {}
                , strErrorMessage = chrome.runtime.lastError.message
                ;

              if ( typeof strErrorMessage === 'string' )
                objLogDetails = { strErrorMessage: strErrorMessage };

              Log.add( strLog + strLogError, objLogDetails, true );
              return;
            }

            StorageSync.get( null, function( objData ) {
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
    var funcSet = function( Storage, objSettings, strLogSuffix ) {
      Storage.get( null, function( objReturn ) {
        strLog = 'setExtensionDefaults, ' + strLogSuffix;
        Log.add( strLog );

        var objTempToSet = {};

        for ( var strSetting in objSettings ) {
          if ( objSettings.hasOwnProperty( strSetting ) ) {
            var miscSetting = objSettings[ strSetting ];

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
                  else {
                    var objSetting = 
                          Background.objPreservedSettings[ strSetting ];

                    if (
                          typeof objSetting !== 'undefined'
                      &&  typeof objSetting[ strSubsetting ] !== 'undefined'
                    ) {
                      objTempToSet[ strSetting ][ strSubsetting ] =
                        objSetting[ strSubsetting ];
                    }
                  }
                }
              }
          }
        }

        if ( ! Global.isEmpty( objTempToSet ) )
          Global.setStorageItems( Storage, objTempToSet, strLog );
        else
          Log.add( strLog + strLogDoNot );
      });
    }

    funcSet( StorageLocal,  objSettingsNotSyncable,   'local' );
    funcSet( StorageSync,   objSettingsSyncable,      'sync'  );
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

    StorageSync.get( arrVarsToGet, function( objReturn ) {
      strLog = 'saveRecentTrackInfo';
      Log.add( strLog, objStationInfo );

      var
          arrRecentTracks     = objReturn.arrRecentTracks
        // Don't include messages with player status (started, resumed, muted)
        , arrTrackInfo        = objStationInfo.strTrackInfo.split( "\n\n" )
        , strTrackInfo        = arrTrackInfo[ 0 ]
        , intIndex            = Global.returnIndexOfSubitemContaining(
                                    arrRecentTracks
                                  , strTrackInfo
                                )
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

      Global.setStorageItems( StorageSync, objReturn, strLog );
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
    var strReceiver = objMessage.strReceiver;

    if ( typeof strReceiver === 'string' ) {
      if ( strReceiver === 'background' ) {
        // A page asking to track some event
        var strMessageLog = objMessage.strLog;

        // TODO: Only for internal messages
        if ( typeof strMessageLog === 'string' )
          Log.add( strMessageLog, objMessage.objVars, true );

        // A page asking to make a call
        var boolMakeCall = objMessage.boolMakeCall;

        if ( typeof boolMakeCall === 'boolean' && boolMakeCall ) {
          var objXhr = new XMLHttpRequest();

          objXhr.open( 'HEAD', objMessage.objVars.strUrl, false );
          objXhr.onreadystatechange = function() {
            if ( objXhr.readyState === 4 && objXhr.status === 200 )
              objSendResponse( 
                parseInt( objXhr.getResponseHeader( 'Content-Length' ) )
              );
          }
          objXhr.send();
        }
      }

      // Don't break only when there is no receiver info
      return;
    }

    strLog = 'onMessageCallback';
    Log.add( strLog, objMessage );

    var
        strTrackInfo      = objMessage.objStationInfo.strTrackInfo
      , objDataToPreserve = {
                              // funcShowNotification
                                objMessage    : objMessage
                              , objSender     : objSender
                              , strTrackInfo  : strTrackInfo
                              // funcDoNot
                              , strLog        : strLog
                            }
      ;

    var funcShowNotification = function( objPreservedData ) {
      // Show notification if track info changed or extension asks to show it
      // again (for example, set of buttons needs to be changed)
      var
          strTrackInfo  = objPreservedData.strTrackInfo
        , objMessage    = objPreservedData.objMessage
        ;

      if (
            Background.arrTrackInfoPlaceholders.indexOf( strTrackInfo ) === -1
        &&  strTrackInfo !== Background.strPreviousTrack
        ||  objMessage.boolDisregardSameMessage
      ) {
        // Check for changes
        Global.getAllCommands();

        Global.showNotification(
            objMessage.boolIsUserLoggedIn
          , objMessage.boolDisregardSameMessage
          , objPreservedData.objSender.tab.id
          , objMessage.objPlayerInfo
          , objMessage.objStationInfo
          , objMessage.strCommand || ''
        );

        Background.strPreviousTrack = strTrackInfo;
      }
      else
        funcDoNot( objPreservedData );
    };

    var funcDoNot = function( objPreservedData ) {
      Log.add(
          objPreservedData.strLog + strLogDoNot
        , objPreservedData.strTrackInfo
      );
    };

    Global.checkIfModuleIsEnabled(
        objMessage.objPlayerInfo.strModule
      , objSender.tab.id
      , funcShowNotification
      , funcDoNot
      , objDataToPreserve
      , 'onMessageCallback'
    );
  }
  ,

  /**
   * Checks if there are any changes to open tabs, 
   * detects if supported sites were opened/closed.
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
        var
            strUrl      = objTab.url
          , miscModule  = Global.isValidUrl( strUrl )
          ;

        if ( strUrl && miscModule ) {
          Log.add( strLog + strLogSuccess, strUrl );

          var
              intWindowId   = objTab.windowId
            , intTabId      = objTab.id
            , funcPingPage  = function( miscModule ) {
                chrome.tabs.sendMessage(
                    intTabId
                  , 'Do you copy?'
                  , function( strResponse ) {
                      if ( strResponse !== 'Copy that.' ) {
                        var
                            objModule = Global.objModules[ miscModule ]
                          , arrCss    = objModule.arrCss
                          , intCss    = ( typeof arrCss !== 'undefined' ) ?
                                          arrCss.length : 0
                          , arrJs     = objModule.arrJs
                          , intJs     = ( typeof arrJs !== 'undefined' ) ?
                                          arrJs.length : 0
                          ;

                        for ( var j = 0; j < intCss; j++ ) {
                          chrome.tabs.executeScript(
                              intTabId
                            , { file: arrCss[ j ] }
                          );
                        }

                        for ( var k = 0; k < intJs; k++ ) {
                          chrome.tabs.executeScript(
                              intTabId
                            , { file: arrJs[ k ] }
                          );
                        }
                      }
                    }
                );
              }
            ;

          // If there are no open tabs for this windowId saved yet
          if ( Global.isEmpty( objOpenTabs[ intWindowId ] ) )
            objOpenTabs[ intWindowId ] = {};

          // Do not save all the properties of an open tab
          var objTabCopy  = {};

          objTabCopy.id   = objTab.id;
          objTabCopy.url  = objTab.url;

          objOpenTabs[ intWindowId ][ objTab.index ] = objTabCopy;

          funcPingPage( miscModule );
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
    StorageLocal.get(
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
    StorageLocal.get(
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
  ,

  /**
   * Opens the changelog
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  processButtonClick_seeChanges : function() {
    strLog = 'processButtonClick_seeChanges';
    Log.add( strLog, {} );

    var strUrl  = Background.strChangelogUrl
                    .replace(
                        Background.strVersionParam
                      , strConstExtensionVersion
                    )
                    .replace(
                        Background.strLangParam
                      , strConstExtensionLanguage
                    );

    Global.createTabOrUpdate( strUrl );
  }
  ,

  /**
   * Disables extension successful update notification
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  processButtonClick_doNotNotifyOfUpdates : function() {
    StorageSync.get( strConstGeneralSettings, function( objReturn ) {
      strLog = 'processButtonClick_doNotNotifyOfUpdates';
      Log.add( strLog, {} );

      var objGeneralSettings = objReturn[ strConstGeneralSettings ];

      if ( typeof objGeneralSettings === 'object' ) {
        objGeneralSettings.boolShowWasUpdatedNotification = false;

        Global.setStorageItems( StorageSync, objReturn, strLog );

        // If Options page is open, update it with a new value
        chrome.runtime.sendMessage(
          {
              strReceiver                       : 'options'
            , objVars                           : {
                boolShowWasUpdatedNotification  : false
              }
          }
        );
      }
    });
  }
};

/* =============================================================================

  3. Listeners

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

    if ( ~~ strNotificationId.indexOf( Global.strSystemNotificationId ) ) {
      // Check for changes
      Global.getAllCommands();

      var intNotificationTabId = 
            Global.getTabIdFromNotificationId( strNotificationId );

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
    else
      chrome.notifications.clear( strNotificationId, function() {} );
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
    if ( ~~ strNotificationId.indexOf( Global.strSystemNotificationId ) ) {
      // Check for changes
      Global.getAllCommands();

      StorageLocal.get( 'objActiveButtons', function( objReturn ) {
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
            intTabId    = Global.getTabIdFromNotificationId( strNotificationId )
          , arrButtons  = objReturn.objActiveButtons[ intTabId ]
          , arrButton   = arrButtons[ intButtonIndex ].split( '|' )
          , strFunction = Global
                            .objNotificationButtons[
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
          , Background.strProcessButtonClick + strFunction
        );
      });
    }
    else {
      var
          strNotification   = 
            strNotificationId.replace( Global.strSystemNotificationId, '' )
        , strFunctionAffix  = 
            Background
              .objSystemNotificationButtons
                [ strNotification ]
                  [ intButtonIndex ]
                          .strFunction
        , strFunction       = 
            Background.strProcessButtonClick + strFunctionAffix
        ;

      var funcToProceedWith = Background[ strFunction ];

      if ( typeof funcToProceedWith === 'function' )
        funcToProceedWith();

      chrome.notifications.clear( strNotificationId, function() {} );
    }
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
    // Check for changes
    Global.getAllCommands();

    StorageLocal.get( 'arrTabsIds', function( objData ) {
      strLog = 'chrome.commands.onCommand';

      // No saved data for some reason
      if ( Global.isEmpty( objData ) ) {
        Log.add( strLog + strLogNoSuccess, { strCommand : strCommand }, true );
        return;
      }
      else
        Log.add( strLog, { strCommand : strCommand }, true );

      var strMessagePrefix = Background.strProcessCommand;

      // For these it's the same as button click
      var arrCommands = [ 'add', 'favorite', 'next', 'previous', 'playStop' ];

      if ( ~ arrCommands.indexOf( strCommand ) )
        strMessagePrefix = Background.strProcessButtonClick;

      var
          arrTabsIds      = objData.arrTabsIds
        , intTabsIds      = arrTabsIds.length
        , intArrIndex     = intTabsIds - 1
        ;

      // The final step
      var funcSendMessage = function( objPreservedData ) {
        chrome.tabs.sendMessage(
            objPreservedData.intTabId
          , objPreservedData.strMessagePrefix + objPreservedData.strCommand
        );
      };

      // Callback when no active players.
      // Gets name, checks if enabled
      var funcGetModuleNameAndProceed = 
            function( intWindowId, intTabIndex, intTabId, strUrl ) {

        var
            miscModule            = Global.isValidUrl( strUrl )
          , funcCheckNextOpenTab  = function() { return 0 }
          ;

        if ( strUrl && miscModule ) {
          var objDataToPreserve = {
                                      intTabId          : intTabId
                                    , strMessagePrefix  : strMessagePrefix
                                    , strCommand        : strCommand
                                  };

          Global.checkIfModuleIsEnabled(
              miscModule
            , intTabId
            , funcSendMessage
            , funcCheckNextOpenTab
            , objDataToPreserve
            , 'findFirstOpenTabInvokeCallback'
          );
        }
        else
          funcCheckNextOpenTab();
      };

      // Tries to send to active players first
      var funcSendToActivePlayers = function( intArrIndex ) {
        if ( intArrIndex >= 0 ) {
          var intTabId = arrTabsIds[ intArrIndex ][ 0 ];

          chrome.tabs.sendMessage(
              intTabId
            , 'Ready for a command? Your name?'
            , function( objResponse ) {
                var funcLoopMore = function( objPreservedData ) {
                  objPreservedData.intArrIndex--;
                  funcSendToActivePlayers( objPreservedData.intArrIndex );
                };

                if (
                      typeof objResponse === 'object'
                  &&  objResponse.boolIsReady
                  &&  typeof objResponse.strModule === 'string'
                ) {
                  var objDataToPreserve = {
                        // funcSendMessage
                          intTabId          : intTabId
                        , strMessagePrefix  : strMessagePrefix
                        , strCommand        : strCommand
                        // funcLoopMore
                        , intArrIndex       : intArrIndex
                      };

                  Global.checkIfModuleIsEnabled(
                      objResponse.strModule
                    , intTabId
                    , funcSendMessage
                    , funcLoopMore
                    , objDataToPreserve
                    , 'funcSendToActivePlayers'
                  );
                }
                else
                  funcLoopMore( { intArrIndex: intArrIndex } );
              }
          );
        }
        else {
          // If no active players found, send to first open
          Log.add( strLog + strLogNoSuccess );
          Global.findFirstOpenTabInvokeCallback( funcGetModuleNameAndProceed );
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
    objDetails.currentVersion     = strConstExtensionVersion;
    objDetails.browserName        = bowser.name;
    objDetails.browserVersion     = bowser.version;
    objDetails.browserVersionFull = bowser.versionFull;
    objDetails.chromeVersion      = strConstChromeVersion;
    objDetails.chromeVersionFull  = bowser.chromeVersionFull;
    objDetails.language           = strConstExtensionLanguage;
    objDetails.userAgent          = bowser.userAgent;

    objDetails.boolWasUpdated     = (
          objDetails.reason === 'update'
      &&  typeof objDetails.previousVersion !== 'undefined'
      &&  objDetails.previousVersion < objDetails.currentVersion
    );

    Log.add( strLog, objDetails, true );

    Background.cleanUp( true, objDetails );
    Background.checkOpenTabs();

    if ( objDetails.boolWasUpdated ) {
      StorageSync.get( strConstGeneralSettings, function( objReturn ) {
        strLog = 'chrome.runtime.onInstalled, was updated';
        Log.add( strLog, {} );

        var objGeneralSettings = objReturn[ strConstGeneralSettings ];

        if (
              typeof objGeneralSettings === 'object'
          &&  objGeneralSettings.boolShowWasUpdatedNotification
        ) {
          var arrUpdatedButtons = 
                Background.objSystemNotificationButtons.updated;

          Global.showSystemNotification(
              'updated'
            , chrome.i18n.getMessage( 'systemNotificationUpdated' )
            , chrome.i18n.getMessage( 'extensionName' ) + 
                chrome.i18n.getMessage( 'systemNotificationUpdatedVersion' ) + 
                objDetails.currentVersion
            , null
            , [
                  arrUpdatedButtons[ 0 ].objButton
                , arrUpdatedButtons[ 1 ].objButton
              ]
          );
        }
      });
    }
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
    Background.checkOpenTabs();
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

  4. On Load

 ============================================================================ */

/**
 * Initialize
 *
 * @type    method
 * @param   No Parameters taken
 * @return  void
 **/
Background.init();