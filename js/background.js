/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2014 PoziWorld
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

var Background = {
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
    var arrSettingsToCleanUp  = [
                                    'objActiveButtons'
                                  , 'arrTabsIds'
                                ];

    chrome.storage.sync.remove( arrSettingsToCleanUp, function() {
      console.log( 'Background cleanUp' );

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
    if (
          objDetails.reason === 'update'
      &&  typeof objDetails.previousVersion !== 'undefined'
      &&  objDetails.previousVersion < chrome.app.getDetails().version
    ) {
      chrome.storage.sync.get( null, function( objReturn ) {
        var
            arrTempToRemove     = []
          , arrSettingsToRemove = [
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
          var i = 0, intSettingsToRemove = arrSettingsToRemove.length;
          i < intSettingsToRemove;
          i++
        ) {
          var strSettingToRemove = arrSettingsToRemove[ i ];

          // Remove it only if it is present
          if ( objReturn[ strSettingToRemove ] )
            arrTempToRemove.push( strSettingToRemove );
        }

        if ( ! Global.isEmpty( arrTempToRemove ) ) {
          chrome.storage.sync.remove( arrTempToRemove, function() {
            // Debug
            console.log(
                'Background removeOldSettings, arrTempToRemove'
              , arrTempToRemove
            );

            chrome.storage.sync.get( null, function( objData ) {
              console.log( 'Background removeOldSettings', objData );
            });

            Background.setExtensionDefaults();
          });
        }
        else
          Background.setExtensionDefaults();
      });
    }
    else
      Background.setExtensionDefaults();
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
      // 1. To set
      var
          objTempToSet                                  = {}
        , objSettingsDefaults                           = {
              objActiveButtons                          : {}
            , objOpenTabs                               : {}
            , arrTabsIds                                : []
            , arrRecentTracks                           : []
            , intRecentTracksToKeep                     : 10

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
          // If a new setting introduced, set its default
          if ( typeof objReturn[ strSetting ] === 'undefined' )
            objTempToSet[ strSetting ] = objSettingsDefaults[ strSetting ];
        }
      }

      if ( ! Global.isEmpty( objTempToSet ) )
        chrome.storage.sync.set( objTempToSet, function() {
          // Debug
          chrome.storage.sync.get( null, function( objData ) {
            console.log( 'Background setExtensionDefaults ', objData );
          });
        });
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
      var
          arrRecentTracks = objReturn.arrRecentTracks
        // Don't include messages with player status (started, resumed, muted)
        , arrTrackInfo    = objStationInfo.strTrackInfo.split( "\n\n" )
        , strTrackInfo    = arrTrackInfo[ 0 ]
        ;

      // Don't save if already in array
      if (
        arrRecentTracks
          .map(
            function ( arrSub ) {
              return arrSub[0]
            }
          )
            .indexOf( strTrackInfo ) !== -1
      )
        return;

      var
          intRecentTracksExcess     = arrRecentTracks.length - 
                                        objReturn.intRecentTracksToKeep
        , intRecentTracksToRemove   = (
                                        intRecentTracksExcess < 0 ?
                                          -1 : intRecentTracksExcess
                                      ) + 1
        , arrTempRecentTrack        = []
        ;

      arrRecentTracks.splice( 0, intRecentTracksToRemove );

      // Using array instead of object because of QUOTA_BYTES_PER_ITEM
      // developer.chrome.com/extensions/storage.html#property-sync-QUOTA_BYTES_PER_ITEM
      arrTempRecentTrack[ 0 ] = strTrackInfo;
      arrTempRecentTrack[ 1 ] = objStationInfo.strStationName;
      arrTempRecentTrack[ 2 ] = objStationInfo.strLogoUrl;

      arrRecentTracks.push( arrTempRecentTrack );

      chrome.storage.sync.set( objReturn, function() {
        if ( chrome.runtime.lastError ) {
          // Debug
          console.log( 'Can\'t save Last Track info' );
        }

        // Debug
        chrome.storage.sync.get( null, function( objData ) {
          console.log( 'Background new track to arrRecentTracks ', objData );
        });
      });
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
    var strTrackInfo = objMessage.objStationInfo.strTrackInfo;

    // Debug
    console.log( 'Background onMessage ', objMessage );

    // Show notification if track info changed or extension asks to show it
    // again (set of buttons needs to be changed, for example)
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
      );

      Background.strPreviousTrack = strTrackInfo;
    }
    else { // Debug
      console.log( 'Don\'t show notification. Current Track: ' + strTrackInfo );
    }
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
      var objOpenTabs = {};

      for ( var i = 0, objTab; objTab = tabs[i]; i++ ) {
        if ( objTab.url && Global.isValidUrl( objTab.url ) ) {
          console.log( 'Found open PoziTab: ' + objTab.url );

          var
              intWindowId = objTab.windowId
            , intTabId    = objTab.id
            ;

          // If there are no open tabs for this windowId saved yet
          if ( Global.isEmpty( objOpenTabs[ objTab.windowId ] ) )
            objOpenTabs[ objTab.windowId ] = {};

          objOpenTabs[ objTab.windowId ][ objTab.index ] = objTab;

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

      Global.saveOpenTabs( objOpenTabs );

      if ( ! Global.isEmpty( objOpenTabs ) ) {
        // TODO: Can exceed max number of write operations
      }
      else
        console.log( 'Could not find open PoziTab.' );
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
    // Debug
    console.log( 'Background.checkIfOpenTabChangedDomainOnReplaced' );

    chrome.storage.sync.get(
        Background.strObjOpenTabsName
      , function( objReturn ) {
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
                    // Debug
                    console.log(
                      'Background.checkIfOpenTabChangedDomainOnReplaced match'
                    );

                    Background.checkOpenTabs( objSavedTab, intRemovedTabId );
                    return;
                  }
                }
              }
            }
          }

          // Debug
          console.log(
            'Background.checkIfOpenTabChangedDomainOnReplaced no match'
          );

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
    // http://stackoverflow.com/a/8498668/561712
    var
        $aSavedTab  = document.createElement( 'a' )
      , $aTab       = document.createElement( 'a' )
      ;

    $aSavedTab.href = objSavedTab.url;
    $aTab.href      = objTab.url;

    if ( $aSavedTab.hostname !== $aTab.hostname ) {
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
 * Listens for clicks on notification
 *
 * @type    method
 * @param   strNotificationId
 *            Notification ID
 * @param   intButtonIndex
 *            Notification button index
 * @return  void
 **/
chrome.notifications.onClicked.addListener(
  function( strNotificationId, intButtonIndex ) {
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
    var intTabId = 
      parseInt( strNotificationId.replace( Global.strNotificationId, '' ) );

    chrome.storage.sync.get( 'objActiveButtons', function( objReturn ) {
      // Debug
      console.log( 'Background get objActiveButtons ', objReturn );

      var
          arrButton   = objReturn
                        .objActiveButtons[ intTabId ][ intButtonIndex ]
                          .split( '|' )
        , strFunction = Global
                          .objSettingsDefaults
                            .arrNotificationButtons[
                              arrButton[ 0 ] ][ arrButton[ 1 ]
                            ]
                              .strFunction
        ;

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

    // Debug
    console.log( 'Background onCommand: ' + strCommand );

    var strMessagePrefix = 'processCommand_';

    // For these it's the same as button click
    if ( strCommand === 'add' || strCommand === 'playStop' )
      strMessagePrefix = 'processButtonClick_';

    chrome.storage.sync.get( 'arrTabsIds', function( objData ) {
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
                  funcSendMessage( null, null, intTabId );
                  console.log( 'Background onCommand: active player found' );
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
          console.log( 'Background onCommand: no active player found' );
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
 *            Reason event is being dispatched, previous version
 * @return  void
 **/
chrome.runtime.onInstalled.addListener(
  function( objDetails ) {
    // Debug
    console.log( 'Background chrome.runtime.onInstalled ', objDetails );

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
    // Debug
    console.log( 'Background chrome.runtime.onStartup' );

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
    // Debug
    console.log(
        'Background chrome.tabs.onUpdated '
      , JSON.stringify( objChangeInfo )
    );

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
    // Debug
    console.log(
        'Background chrome.tabs.onReplaced '
      , JSON.stringify( intAddedTabId )
      , JSON.stringify( intRemovedTabId )
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
    // Debug
    console.log( 'Background chrome.tabs.onRemoved' );

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