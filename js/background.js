/* ====================================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013 PoziWorld
  File                    :           js/background.js
  Description             :           Background JavaScript

  Table of Contents:

  1.                              Background
    1.a.                            init()
    1.b.                            setExtensionDefaults()
  2.                              Listeners
    2.a.                            runtime.onMessage
    2.b.                            browserAction.onClicked
    2.c.                            notifications.onButtonClicked
    2.d.                            commands.onCommand
    2.e.                            runtime.onInstalled
  3.                              On Load
    3.a.                            Inject Page Watcher
    3.b.                            Initialize extension defaults

 ==================================================================================== */

/* ====================================================================================

  1.                              Background

 ==================================================================================== */

var Background = {
    strPreviousTrack        : ''
  ,

  /**
   * 1.a.
   *
   * Initialize defaults
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
   * Set extension defaults
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  setExtensionDefaults : function() {
    chrome.storage.sync.get( null, function( objReturn ) {
      var
          objTemp                                   = {}
          // TODO: Get defaults from Global
        , objSettingsDefaults                       = {
              boolShowNotificationWhenStopped       : false
            , boolShowNotificationWhenMuted         : false
            , boolShowNotificationWhenNoTrackInfo   : false
            , strNotificationTitleFormat            : 'short'
            , arrNotificationButtons                : [ 'add', 'muteUnmute' ]
            , objOpenTabs                           : {}
          }
        ;

      for ( var strSetting in objSettingsDefaults ) {
        if ( objSettingsDefaults.hasOwnProperty( strSetting ) ) {
          // If a new setting introduced, set its default
          if ( !objReturn[ strSetting ] )
            objTemp[ strSetting ] = objSettingsDefaults[ strSetting ];
        }
      }

      if ( Global.isEmpty( objTemp ) !== true )
        chrome.storage.sync.set( objTemp, function() {
          // Debug
          chrome.storage.sync.get( null, function( objData ) {
            console.log( 'Background setExtensionDefaults' );
            console.log( objData );
          });
        });
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
  function( objMessage, objSender, sendResponse ) {
    var strTrackInfo = objMessage.objStationInfo.strTrackInfo;

    // Debug
    console.log( 'Background onMessage' );
    console.log( objMessage );

    // Show notification if track info changed or extension asks to show it again
    // (set of buttons needs to be changed, for example)
    if (
          strTrackInfo !== '' && strTrackInfo !== Background.strPreviousTrack 
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
      console.log( 'Previous Track: ' + Background.strPreviousTrack );
      console.log( 'Current Track: ' + strTrackInfo );
    }
  }
);

/**
 * 2.b.
 *
 * Activates the Tab when clicked on browser icon
 *
 * @type    method
 * @param   objCurrentTab
 *            Current tab details
 * @return  void
 **/
chrome.browserAction.onClicked.addListener(
  function( objCurrentTab ) {
    var funcHighlightTab = function( intWindowId, intTabIndex ) {
      chrome.tabs.highlight( { windowId: intWindowId, tabs: [ intTabIndex ] }, function() {} );
    };

    Global.findFirstOpenTabInvokeCallback( funcHighlightTab );
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
      console.log( 'Background get arrActiveButtons' );
      console.log( objReturn );

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
    console.log( 'Background onInstalled' );
    console.log( objDetails );

    Background.setExtensionDefaults();
  }
);

/* ====================================================================================

  3.                              On Load

 ==================================================================================== */

/**
 * 3.a.
 *
 * Checks whether tab is open. 
 * If yes, injects Page Watcher.
 *
 * @type    method
 * @param   objMessage
 *            Message received
 * @param   objSender
 *            Sender of the message
 * @return  void
 **/
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
          chrome.tabs.executeScript( intTabId, { file: '/js/uppod-player-api.js' } );
          chrome.tabs.executeScript( intTabId, { file: '/js/page-watcher.js' } );
        }
      });
    }
  }

  if ( Global.isEmpty( objOpenTabs ) !== true )
    Global.saveOpenTabs( objOpenTabs );
  else
    console.log( 'Could not find open PoziTab.' );
});

/**
 * 3.b.
 *
 * Initialize extension defaults on load
 *
 * @type    method
 * @param   No Parameters taken
 * @return  void
 **/
Background.init();