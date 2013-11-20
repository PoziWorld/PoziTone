/* ====================================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013 PoziWorld
  File                    :           js/background.js
  Description             :           Background JavaScript

  Table of Contents:

  1.                              Background
    1.a.                            init()
  2.                              Background Listeners
    2.a.                            runtime.onMessage
    2.a.                            browserAction.onClicked
  3.                              On Load
    3.a.                            inject Page Watcher
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
    chrome.storage.sync.get( null, function( objReturn ) {
      var
          objTemp                   = {}
          objSettingsDefaults       = {
              'boolShowNotificationWhenStopped'         : false
            , 'boolShowNotificationWhenMuted'           : false
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
          // chrome.storage.sync.get( null, function(data) {
            // console.log(data);
          // });
        });
    });
  }
};

/* ====================================================================================

  2.                              Background Listeners

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
    var strTrack = objMessage.strTrack;

    console.log( objMessage ); // Debug

    if ( strTrack !== '' && strTrack !== Background.strPreviousTrack ) {
      Global.showNotification( strTrack, objMessage.objPlayerInfo );
      Background.strPreviousTrack = strTrack;
    }
    else { // Debug
      console.log( 'Previous Track: ' + Background.strPreviousTrack );
      console.log( 'Current Track: ' + strTrack );
    }
  }
);

/**
 * 2.b.
 *
 * Activates the Tab when clicked on browser icon
 *
 * @type    method
 * @param   objMessage
 *            Message received
 * @param   objSender
 *            Sender of the message
 * @return  void
 **/
chrome.browserAction.onClicked.addListener(
  function( objCurrentTab ) {
    if ( typeof Global.objOpenTab.windowId === 'number' && typeof Global.objOpenTab.index === 'number' )
      chrome.tabs.highlight( { windowId: Global.objOpenTab.windowId, tabs: [ Global.objOpenTab.index ] }, function() {} );
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
      Global.saveOpenTabObj( objTab );
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