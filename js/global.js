/* ====================================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013 PoziWorld
  File                    :           js/global.js
  Description             :           Global JavaScript

  Table of Contents:

  1.                              Global
    1.a.                            init()
    1.b.                            showNotification()
    1.c.                            showNotificationCallback()
    1.d.                            isValidUrl()
    1.e.                            getValidUrl()
    1.f.                            saveOpenTabObj()
    1.g.                            isEmpty()
  2.                              On Load
    3.a.                            Initialize defaults

 ==================================================================================== */

/* ====================================================================================

  1.                              Global

 ==================================================================================== */

var Global = {
    intNotificationCount    : 1
  , intPlayStatus           : 1             // Uppod JS API (play 1, pause 0, stop -1)
  , intNoVolume             : 0             // Uppod JS API (volume 0-100)
  , objOpenTab              : {}
  , strNotificationId       : 'pozitone'
  , strValidUrl             : '101.ru/'
  , strNoTrackInfo          : '...'
  , strPlayerIsOffClass     : 'play'
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
   * Display current track info via Notification
   *
   * @type    method
   * @param   strTrackInfo
   *            Track info to display
   * @param   objPlayerInfo
   *            Player info (play status, volume, etc.)
   * @return  void
   **/
  showNotification : function( strTrackInfo, objPlayerInfo ) {
    var
        objNotificationOptions = {
          type:     'basic',
          title:    chrome.i18n.getMessage( 'poziNotificationTitle' ),
          message:  strTrackInfo,
          iconUrl:  'img/icon_64.png'
        }
      , objThis               = this
      , objTempPlayerInfo     = objPlayerInfo
      ;

    chrome.notifications.clear( objThis.strNotificationId, function() {
      chrome.storage.sync.get(
          [
              'boolShowNotificationWhenStopped'
            , 'boolShowNotificationWhenMuted'
            , 'boolShowNotificationWhenNoTrackInfo'
          ]
        , function( objData ) {

            if (
                  objData.boolShowNotificationWhenStopped === false
              &&  typeof objTempPlayerInfo !== 'undefined'
              &&  objTempPlayerInfo.status === Global.strPlayerIsOffClass
            )
              return false;

            if (
                  objData.boolShowNotificationWhenMuted === false
              &&  typeof objTempPlayerInfo !== 'undefined'
              &&  objTempPlayerInfo.volume === Global.intNoVolume
            )
              return false;

            if (
                  objData.boolShowNotificationWhenNoTrackInfo === false
              &&  strTrackInfo === Global.strNoTrackInfo
            )
              return false;

              chrome.notifications.create( objThis.strNotificationId, objNotificationOptions, objThis.showNotificationCallback.bind( objThis ) );
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
   * @param   No Parameters Taken
   * @return  void
   **/
  showNotificationCallback : function() {
    console.log( 'Successfully created PoziTone Notification # ' + this.intNotificationCount );
    this.intNotificationCount++;
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
    return strUrl.indexOf( this.getValidUrl() ) !== -1;
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
   * Saves open tab object for later use
   * TODO: Use localStorage, so if extension reloaded just check if tab still open rather than loop
   *
   * @type    method
   * @param   intId
   *            Open Tab ID
   * @return  void
   **/
  saveOpenTabObj : function ( objTab )
  {
    this.objOpenTab = objTab;
  }
  ,

  /**
   * 1.g.
   *
   * Checks whether object is empty
   *
   * @type    method
   * @param   objObj
   *            Object to check against
   * @return  bool
   **/
  isEmpty : function ( objObj )
  {
    return Object.keys( objObj ).length === 0;
  }
};

/* ====================================================================================

  2.                              On Load

 ==================================================================================== */

/**
 * 2.a.
 *
 * Initialize defaults on load
 *
 * @type    method
 * @param   No Parameters taken
 * @return  void
 **/
Global.init();