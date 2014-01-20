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
    2.a.                            Initialize defaults

 ==================================================================================== */

/* ====================================================================================

  1.                              Global

 ==================================================================================== */

var Global = {
    intNotificationCount          : 1
  , intNoVolume                   : 0              // Uppod JS API (volume 0-100)
  , objOpenTab                    : {}
  , strValidUrl                   : '101.ru/'
  , strNotificationId             : 'pozitone_tab' // We'll add tab ID when displaying
  , strNotificationIconUrl        : 'img/notification-icon-80.png'
  , strNoTrackInfo                : '...'
  , strPlayerIsOffClass           : 'play'
  , objSettingsDefaults           : {
        boolShowNotificationWhenStopped         : { miscDefault : false }
      , boolShowNotificationWhenMuted           : { miscDefault : false }
      , boolShowNotificationWhenNoTrackInfo     : { miscDefault : false }
      , strNotificationTitleFormat              : { miscDefault : 'short' }
      , arrNotificationButtons                  : {
            miscDefault           : [ 'add', 'muteUnmute' ]
          , arrActiveButtons      : []
          , add                   : {
                loggedIn          : {
                    objButton     : {
                        title     : chrome.i18n.getMessage( 'poziNotificationButtonsAddLoggedInTitle' )
                      , iconUrl   : 'img/round_plus_icon&16.png'
                    }
                  , strFunction   : 'processButtonClickAdd'
                }
            }
          , favorite              : {
                loggedIn          : {
                    objButton     : {
                        title     : chrome.i18n.getMessage( 'poziNotificationButtonsFavoriteLoggedInTitle' )
                      , iconUrl   : 'img/emotion_smile_icon&16.png'
                    }
                  , strFunction   : 'processButtonClickFavorite'
                }
            }
          , playStop              : {
                play              : {
                    objButton     : {
                        title     : chrome.i18n.getMessage( 'poziNotificationButtonsPlayTitle' )
                      , iconUrl   : 'img/playback_play_icon&16.png'
                    }
                  , strFunction   : 'processButtonClickPlayStop'
                }
              , stop              : {
                    objButton     : {
                        title     : chrome.i18n.getMessage( 'poziNotificationButtonsStopTitle' )
                      , iconUrl   : 'img/playback_stop_icon&16.png'
                    }
                  , strFunction   : 'processButtonClickPlayStop'
                }
            }
          , muteUnmute            : {
                mute              : {
                    objButton     : {
                        title     : chrome.i18n.getMessage( 'poziNotificationButtonsMuteTitle' )
                      , iconUrl   : 'img/sound_mute_icon&16.png'
                    }
                  , strFunction   : 'processButtonClickMute'
                }
              , unmute            : {
                    objButton     : {
                        title     : chrome.i18n.getMessage( 'poziNotificationButtonsUnmuteTitle' )
                      , iconUrl   : 'img/sound_high_icon&16.png'
                    }
                  , strFunction   : 'processButtonClickUnmute'
                }
            }
        }
    }
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
      ;

    chrome.notifications.clear( objThis.strNotificationId + intTabId, function() {
      chrome.storage.sync.get(
          [
              'boolShowNotificationWhenStopped'
            , 'boolShowNotificationWhenMuted'
            , 'boolShowNotificationWhenNoTrackInfo'
            , 'strNotificationTitleFormat'
            , 'arrNotificationButtons'
          ]
        , function( objData ) {

            if (
                  boolDisregardSameMessage === false
              &&  objData.boolShowNotificationWhenStopped === false
              &&  objTempPlayerInfo.strStatus === Global.strPlayerIsOffClass
            )
              return false;

            if (
                  boolDisregardSameMessage === false
              &&  objData.boolShowNotificationWhenMuted === false
              &&  objTempPlayerInfo.intVolume === Global.intNoVolume
            )
              return false;

            if (
                  boolDisregardSameMessage === false
              &&  objData.boolShowNotificationWhenNoTrackInfo === false
              &&  objTempStationInfo.strTrackInfo === Global.strNoTrackInfo
            )
              return false;

            var
                strTitleFormat = objData.strNotificationTitleFormat
              , arrButtons     = objData.arrNotificationButtons
              ;

            if ( strTitleFormat === 'noStationInfo' )
              objNotificationOptions.title = chrome.i18n.getMessage( 'poziNotificationTitle' );
            else if ( strTitleFormat === 'short' )
              objNotificationOptions.title = objTempStationInfo.strStationName;
            else if ( strTitleFormat === 'long' )
              objNotificationOptions.title = objTempStationInfo.strStationNamePlusDesc;

            if ( arrButtons.length !== 0 ) {
              // Save active buttons for the listener
              var arrActiveButtons = Global.objSettingsDefaults.arrNotificationButtons.arrActiveButtons = [];

              objNotificationOptions.buttons = [];

              // TODO: Combine all following buttons' check into one
              if ( arrButtons.indexOf( 'add' ) !== -1 && boolUserLoggedIn === true ) {
                objNotificationOptions.buttons.push(
                  Global.objSettingsDefaults.arrNotificationButtons.add.loggedIn.objButton
                );

                arrActiveButtons.push( 'add|loggedIn' );
              }

              if ( arrButtons.indexOf( 'favorite' ) !== -1 && boolUserLoggedIn === true ) {
                objNotificationOptions.buttons.push(
                  Global.objSettingsDefaults.arrNotificationButtons.favorite.loggedIn.objButton
                );

                arrActiveButtons.push( 'favorite|loggedIn' );
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
            }

            chrome.notifications.create( objThis.strNotificationId + intTabId, objNotificationOptions, objThis.showNotificationCallback.bind( objThis ) );
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