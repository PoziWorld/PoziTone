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
    Background.setExtensionDefaults();
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
          objTemp                   = {}
          // TODO: Get defaults from Global
        , objSettingsDefaults       = {
              boolShowNotificationWhenStopped       : false
            , boolShowNotificationWhenMuted         : false
            , boolShowNotificationWhenNoTrackInfo   : false
            , strNotificationTitleFormat            : 'short'
            , arrNotificationButtons                : [ 'add', 'muteUnmute' ]
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
    if ( typeof Global.objOpenTab.windowId === 'number' && typeof Global.objOpenTab.index === 'number' )
      chrome.tabs.highlight( { windowId: Global.objOpenTab.windowId, tabs: [ Global.objOpenTab.index ] }, function() {} );
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
    var
        arrButton   = Global.objSettingsDefaults.arrNotificationButtons.arrActiveButtons[ intButtonIndex ].split( '|' )
      , intTabId    = parseInt( strNotificationId.replace( Global.strNotificationId, '' ) )
      ;

    chrome.tabs.sendMessage(
        intTabId
      , 'processButtonClick_' + Global.objSettingsDefaults.arrNotificationButtons[ arrButton[ 0 ] ][ arrButton[ 1 ] ].strFunction
    );
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

    chrome.tabs.sendMessage(
        Global.objOpenTab.id
      , strMessagePrefix + strCommand
    );
  }
);

/* ====================================================================================

  3.                              On Load

 ==================================================================================== */

/**
 * 3.a.
 *
 * Checks whether tab is open. If yes, injects Page Watcher
 *
 * @type    method
 * @param   objMessage
 *            Message received
 * @param   objSender
 *            Sender of the message
 * @return  void
 **/
chrome.tabs.query( {}, function( tabs ) {
  for ( var i = 0, objTab; objTab = tabs[i]; i++ ) {
    if ( objTab.url && Global.isValidUrl( objTab.url ) ) {
      console.log( 'Found open PoziTab: ' + objTab.url );
      Global.saveOpenTabObj( objTab ); // TODO: Multiple open 101.ru pages will overwrite this
      chrome.tabs.executeScript( objTab.id, { file: '/js/page-watcher.js' } );
      return true;
    }
  }
  console.log( 'Could not find open PoziTab.' );
  return false;
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