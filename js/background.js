/* ====================================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2014 PoziWorld
  File                    :           js/background.js
  Description             :           Background JavaScript

  Table of Contents:

  1.                              Background
    1.a.                            init()
    1.b.                            setExtensionDefaults()
    1.c.                            saveRecentTrackInfo()
    1.d.                            onMessageCallback()
    1.e.                            checkOpenTabs()
  2.                              Listeners
    2.a.                            runtime.onMessage + runtime.onMessageExternal
    2.b.                            notifications.onClicked
    2.c.                            notifications.onButtonClicked
    2.d.                            commands.onCommand
    2.e.                            runtime.onInstalled
    2.f.                            tabs.onUpdated
    2.g.                            tabs.onRemoved
  3.                              On Load
    3.a.                            Initialize extension defaults

 ==================================================================================== */

/* ====================================================================================

  1.                              Background

 ==================================================================================== */

var Background = {
    strPreviousTrack              : ''
  , arrTrackInfoPlaceholders      : [
      , ''
      , '...'
      , 'Ожидаем следующий трек...'
      , 'Ждём название трека...'
    ]
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
    Background.checkOpenTabs();
  }
  ,

  /**
   * 1.b.
   *
   * Set extension defaults
   *
   * @type    method
   * @param   objDetails
   *            Reason - install/update/chrome_update - 
   *            and (optional) previous version
   * @return  void
   **/
  setExtensionDefaults : function( objDetails ) {
    chrome.storage.sync.get( null, function( objReturn ) {
      // 1. To set
      var
          objTempToSet                                  = {}
        , objSettingsDefaults                           = {
              objOpenTabs                               : {}
            , arrRecentTracks                           : []
            , intRecentTracksToKeep                     : 10
            
            , objSettings_ru_101                        : {
                  boolEnabled                           : true
                , boolNotificationShowLogo              : true
                , strNotificationTitleFormat            : 'short'
                , arrNotificationButtons                : [ 'add', 'muteUnmute' ]
                , boolNotificationShowWhenStopped       : false
                , boolNotificationShowWhenMuted         : false
                , boolNotificationShowWhenNoTrackInfo   : false
              }
            , objSettings_com_vk_audio                  : {
                  boolEnabled                           : true
                , boolNotificationShowLogo              : true
                , arrNotificationButtons                : [ 'add', 'next' ]
                , boolNotificationShowWhenMuted         : false
              }
          }
        ;

      // Some vars have been renamed, remove old ones if updated
//      if (
//            objDetails.reason === 'update'
//        &&  typeof objDetails.previousVersion !== 'undefined'
//        &&  objDetails.previousVersion < chrome.app.getDetails().version
//      ) {
//        var
//            arrSettingsToRemove = [
//            ]
//          ;
//
//        chrome.storage.sync.remove( arrSettingsToRemove, function() {});
//      }

      for ( var strSetting in objSettingsDefaults ) {
        if ( objSettingsDefaults.hasOwnProperty( strSetting ) ) {
          // If a new setting introduced, set its default
          if ( typeof objReturn[ strSetting ] === 'undefined' )
            objTempToSet[ strSetting ] = objSettingsDefaults[ strSetting ];
        }
      }

      if ( Global.isEmpty( objTempToSet ) !== true )
        chrome.storage.sync.set( objTempToSet, function() {
          // Debug
          chrome.storage.sync.get( null, function( objData ) {
            console.log( 'Background setExtensionDefaults ', objData );
          });
        });

      // 2. To remove
      var
          arrTempToRemove                           = []
        , arrSettingsToRemove                       = [
              'arrLastTracks'
            , 'arrNotificationButtons'
            , 'intLastTracksToKeep'
            , 'boolNotificationShowStationLogo'
            , 'boolNotificationShowWhenStopped'
            , 'boolNotificationShowWhenMuted'
            , 'boolNotificationShowWhenNoTrackInfo'
            , 'strNotificationTitleFormat'
          ]
        ;

      for ( var i = 0; i < arrSettingsToRemove.length; i++ ) {
        var strSettingToRemove = arrSettingsToRemove[ i ];

        if ( objReturn[ strSettingToRemove ] )
          arrTempToRemove.push( strSettingToRemove );
      }

      if ( Global.isEmpty( arrTempToRemove ) !== true )
        chrome.storage.sync.remove( arrTempToRemove, function() {
          // Debug
          chrome.storage.sync.get( null, function( objData ) {
            console.log( 'Background setExtensionDefaults remove', objData );
          });
        });
    });
  }
  ,

  /**
   * 1.c.
   *
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
        // Don't include messages with player status (started, resumed, muted, etc.)
        , arrTrackInfo    = objStationInfo.strTrackInfo.split( "\n\n" )
        , strTrackInfo    = arrTrackInfo[ 0 ]
        ;

      // Don't save if already in array
      if ( arrRecentTracks.map( function ( arrSub ) { return arrSub[0] } ).indexOf( strTrackInfo ) !== -1 )
        return;

      var
          intRecentTracksExcess     = arrRecentTracks.length - objReturn.intRecentTracksToKeep
        , intRecentTracksToRemove   = ( intRecentTracksExcess < 0 ? -1 : intRecentTracksExcess ) + 1
        , arrTempRecentTrack        = []
        ;

      arrRecentTracks.splice( 0, intRecentTracksToRemove );

      // Using array instead of object because of QUOTA_BYTES_PER_ITEM
      // https://developer.chrome.com/extensions/storage.html#property-sync-QUOTA_BYTES_PER_ITEM
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
   * 1.d.
   *
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

    // Show notification if track info changed or extension asks to show it again
    // (set of buttons needs to be changed, for example)
    if (
          Background.arrTrackInfoPlaceholders.indexOf( strTrackInfo ) === -1
      &&  strTrackInfo !== Background.strPreviousTrack
      ||  objMessage.boolDisregardSameMessage === true
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
   * 1.e.
   *
   * Checks if there are any changes to open tabs, 
   * detects if supported sites were opened/closed.
   * 
   * TODO: Auto-injection (inject required module detector
   * which will then inject correct PageWatcher).
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  checkOpenTabs : function() {
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
          if ( Global.isEmpty( objOpenTabs[ objTab.windowId ] ) === true )
            objOpenTabs[ objTab.windowId ] = {};

          objOpenTabs[ objTab.windowId ][ objTab.index ] = objTab;

          chrome.tabs.sendMessage( intTabId, 'Do you copy?', function( strResponse ) {
            if ( strResponse !== 'Copy that.' ) {
    //          chrome.tabs.executeScript( intTabId, { file: '/modules/ru_101/js/uppod-player-api.js' } );
    //          chrome.tabs.executeScript( intTabId, { file: '/modules/ru_101/js/page-watcher.js' } );
            }
          });
        }
      }

      if ( Global.isEmpty( objOpenTabs ) !== true )
        Global.saveOpenTabs( objOpenTabs );
      else
        console.log( 'Could not find open PoziTab.' );
    });
  }
};

/* ====================================================================================

  2.                              Listeners

 ==================================================================================== */

/**
 * 2.a.
 *
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
 * 2.b.
 *
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
 * 2.c.
 *
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
    var intTabId = parseInt( strNotificationId.replace( Global.strNotificationId, '' ) );

    chrome.storage.sync.get( 'arrActiveButtons', function( objReturn ) {
      // Debug
      console.log( 'Background get arrActiveButtons ', objReturn );

      var arrButton = objReturn.arrActiveButtons[ intButtonIndex ].split( '|' );

      chrome.tabs.sendMessage(
          intTabId
        , 'processButtonClick_' + Global.objSettingsDefaults.arrNotificationButtons[ arrButton[ 0 ] ][ arrButton[ 1 ] ].strFunction
      );
    });
  }
);

/**
 * 2.d.
 *
 * Listens for hotkeys
 *
 * @type    method
 * @param   strNotificationId
 *            Notification ID
 * @param   intButtonIndex
 *            Notification button index
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

    var funcSendMessage = function( intWindowId, intTabIndex, intTabId ) {
      chrome.tabs.sendMessage(
          intTabId
        , strMessagePrefix + strCommand
      );
    };

    Global.findFirstOpenTabInvokeCallback( funcSendMessage );
  }
);

/**
 * 2.e.
 *
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
    console.log( 'Background onInstalled ', objDetails );

    Background.setExtensionDefaults( objDetails );
  }
);

/**
 * 2.f.
 *
 * When tab updates, recheck open tabs. 
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
    var strStatus = objChangeInfo.status;

    if ( typeof strStatus !== 'undefined' && strStatus === 'complete' )
      Background.checkOpenTabs();
  }
);

/**
 * 2.g.
 *
 * When tab closes, recheck open tabs. 
 * So that if we closed tab which would get commands, after it has been closed,
 * another one gets commands.
 *
 * @type    method
 * @param   objDetails
 *            Reason event is being dispatched, previous version
 * @return  void
 **/
chrome.tabs.onRemoved.addListener(
  function() {
    Background.checkOpenTabs();
  }
);

/* ====================================================================================

  3.                              On Load

 ==================================================================================== */

/**
 * 3.a.
 *
 * Initialize extension defaults on load
 *
 * @type    method
 * @param   No Parameters taken
 * @return  void
 **/
Background.init();