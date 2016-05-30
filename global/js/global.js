/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2016 PoziWorld
  License                 :           pozitone.com/license
  File                    :           global/js/global.js
  Description             :           Global JavaScript

  Table of Contents:

    Global
      init()
      getAllCommands()
      getStorageItems()
      setStorageItems()
      showNotification()
      showNotificationCallback()
      showSystemNotification()
      removeNotification()
      saveTabsIds()
      saveActiveButtons()
      getSavedOpenTabs()
      saveOpenTabs()
      getModuleId()
      getModuleIdFromProvided()
      getModules()
      isEmpty()
      findFirstOpenTabInvokeCallback()
      checkIfModuleIsEnabled()
      getTabIdFromNotificationId()
      composeNotificationId()
      returnIndexOfSubitemContaining()
      addShortcutInfo()
      createTabOrUpdate()
      makeHttpRequest()
      checkForDevelopersMessage()
      checkForRuntimeError()
      openOptionsPage()
    On Load
      Initialize

 ============================================================================ */

/* =============================================================================

  Global

 ============================================================================ */

const
    // Developers Message
    strDevelopersMessageBannerId              = 'pwMessage'
  , strDevelopersMessageBannerNotActiveClass  = 'notActive'
  ;

var Global                        = {
    intNoVolume                   : 0

  , strNotificationIdSeparator    : strConstNotificationIdSeparator
  , strNotificationId             : strConstNotificationId // + module + tab ID
  , strSystemNotificationId       : 
      strConstNotificationId + 'system' + strConstNotificationIdSeparator
  , strNotificationIconUrl        : 'global/img/notification-icon-80.png'
  , strSystemNotificationIconUrl  :
      'global/img/pozitone-notification-icon-80.png'
  , intNotificationsClearTimeout  : 4000

  , strOptionsUiUrlPrefix         : 'chrome://extensions?options='
  , strNoTrackInfo                : '...'
  , strPlayerIsOffClass           : 'play'

  // Embedded modules (replicates manifest's "content_scripts")
  , objModules                    : {
        ru_101                    : {
            objRegex              : /(http:\/\/|https:\/\/)101.ru\/.*/
          , arrHosts              : [
                '101.ru'
            ]
          , arrOrigins            : [
                '*://101.ru/*'
            ]
          , arrJs                 : [
                'global/js/const.js'
              , 'modules/ru_101/js/uppod-player-api.js'
              , 'modules/general/js/page-watcher.js'
              , 'modules/ru_101/js/page-watcher.js'
            ]
        }
      , fm_di : {
            objRegex : /(http:\/\/|https:\/\/)www.di.fm\/.*/
          , strImageFileName : 'di-logo-120.svg'
          , arrHosts : [
                'di.fm'
              , 'audioaddict.com'
            ]
          , arrOrigins : [
                '*://*.audioaddict.com/*'
              , '*://*.di.fm/*'
            ]
          , arrJs : [
                'global/js/const.js'
              , 'modules/general/js/page-watcher.js'
              , 'modules/fm_di/js/page-watcher.js'
            ]
        }
      , ru_ok_audio               : {
            objRegex              :
              // TODO: Cover all possible “OK” URLs
              /(http:\/\/|https:\/\/)(odnoklassniki.ru|ok.ru)\/.*/
          , strImageFileName      : 'ok-logo-80.svg'
          , arrHosts              : [
                'odnoklassniki.ru'
              , 'ok.ru'
            ]
          , arrOrigins            : [
                '*://*.odnoklassniki.ru/*'
              , '*://*.ok.ru/*'
            ]
          , arrJs                 : [
                'global/js/const.js'
              , 'modules/general/js/page-watcher.js'
              , 'modules/ru_ok_audio/js/page-watcher.js'
            ]
        }
      , com_vk_audio              : {
            objRegex              : /(http:\/\/|https:\/\/)vk.com\/.*/
          , strImageFileName      : 'vk-logo-80.svg'
          , arrHosts              : [
                'vk.com'
            ]
          , arrOrigins            : [
                '*://vk.com/*'
            ]
          , arrJs                 : [
                'global/js/const.js'
              , 'modules/general/js/page-watcher.js'
              , 'modules/com_vk_audio/js/page-watcher.js'
            ]
        }
      , com_vgmradio              : {
            objRegex              : /(http:\/\/|https:\/\/)vgmradio.com\/.*/
          , strImageFileName      : 'vgmradio-logo-120.svg'
          , arrHosts              : [
                'vgmradio.com'
            ]
          , arrOrigins            : [
                '*://vgmradio.com/*'
            ]
          , arrJs                 : [
                'global/js/const.js'
              , 'modules/general/js/page-watcher.js'
              , 'modules/com_vgmradio/js/page-watcher.js'
            ]
        }
  }

  // Don't show these buttons, if they've been clicked for this track already
  , arrAddTrackToPlaylistFeedback : [
        chrome.i18n.getMessage(
          'notificationAddTrackToPlaylistFeedbackSuccessfullyAdded'
        )
      , chrome.i18n.getMessage(
          'notificationAddTrackToPlaylistFeedbackAlreadyInPlaylist'
        )
    ]
  , strFavoriteStatusSuccess      : 
      chrome.i18n.getMessage( 'notificationFavoriteStatusSuccess' )

  , arrCommands                   : []
  , boolShowShortcuts             : true

  , objNotificationButtons        : {
        add                       : {
            loggedIn              : {
                objButton         : {
                    title         :
                      chrome.i18n.getMessage(
                        'notificationButtonsAddLoggedInTitle'
                      )
                  , iconUrl       : 'global/img/round_plus_icon&16.png'
                }
              , strFunction       : 'add'
            }
        }
      , addAuth                   : {
            loggedIn              : {
                objButton         : {
                    title         :
                      chrome.i18n.getMessage(
                        'notificationButtonsAddLoggedInTitle'
                      )
                  , iconUrl       : 'global/img/round_plus_icon&16.png'
                }
              , strFunction       : 'add'
            }
        }
      , favorite                  : {
            loggedIn              : {
                objButton         : {
                    title         : 
                      chrome.i18n.getMessage(
                        'notificationButtonsFavoriteLoggedInTitle'
                      )
                  , iconUrl       : 'global/img/emotion_smile_icon&16.png'
                }
              , strFunction       : 'favorite'
            }
        }
      , favoriteAuth              : {
            loggedIn              : {
                objButton         : {
                    title         :
                      chrome.i18n.getMessage(
                        'notificationButtonsFavoriteLoggedInTitle'
                      )
                  , iconUrl       : 'global/img/emotion_smile_icon&16.png'
                }
              , strFunction       : 'favorite'
            }
        }
      , next                      : {
            next                  : {
                objButton         : {
                    title         : 
                      chrome.i18n.getMessage(
                        'notificationButtonsNextTitle'
                      )
                  , iconUrl       : 'global/img/playback_next_icon&16.png'
                }
              , strFunction       : 'next'
            }
        }
      , nextAuth                  : {
            next                  : {
                objButton         : {
                    title         :
                      chrome.i18n.getMessage(
                        'notificationButtonsNextTitle'
                      )
                  , iconUrl       : 'global/img/playback_next_icon&16.png'
                }
              , strFunction       : 'next'
            }
        }
      , previous                  : {
            previous              : {
                objButton         : {
                    title         : 
                      chrome.i18n.getMessage(
                        'notificationButtonsPreviousTitle'
                      )
                  , iconUrl       : 'global/img/playback_prev_icon&16.png'
                }
              , strFunction       : 'previous'
            }
        }
      , previousAuth              : {
            previous              : {
                objButton         : {
                    title         :
                      chrome.i18n.getMessage(
                        'notificationButtonsPreviousTitle'
                      )
                  , iconUrl       : 'global/img/playback_prev_icon&16.png'
                }
              , strFunction       : 'previous'
            }
        }
      , playStop                  : {
            0                     : {
                objButton         : {
                    title         : 
                      chrome.i18n.getMessage(
                        'notificationButtonsPlayTitle'
                      )
                  , iconUrl       : 'global/img/playback_play_icon&16.png'
                }
              , strFunction       : 'playStop'
            }
          , 1                     : {
                objButton         : {
                    title         : 
                      chrome.i18n.getMessage(
                        'notificationButtonsStopTitle'
                      )
                  , iconUrl       : 'global/img/playback_stop_icon&16.png'
                }
              , strFunction       : 'playStop'
            }
        }
      , muteUnmute                : {
            mute                  : {
                objButton         : {
                    title         : 
                      chrome.i18n.getMessage(
                        'notificationButtonsMuteTitle'
                      )
                  , iconUrl       : 'global/img/sound_mute_icon&16.png'
                }
              , strFunction       : 'mute'
            }
          , unmute                : {
                objButton         : {
                    title         : 
                      chrome.i18n.getMessage(
                        'notificationButtonsUnmuteTitle'
                      )
                  , iconUrl       : 'global/img/sound_high_icon&16.png'
                }
              , strFunction       : 'unmute'
            }
        }
      , volumeUp                  : {
            volumeUp              : {
                objButton         : {
                    title         :
                      chrome.i18n.getMessage(
                        'notificationButtonsVolumeUpTitle'
                      )
                  , iconUrl       : 'global/img/sound_up_icon&16.png'
                }
              , strFunction       : 'volumeUp'
            }
        }
      , volumeDown                : {
            volumeDown            : {
                objButton         : {
                    title         :
                      chrome.i18n.getMessage(
                        'notificationButtonsVolumeDownTitle'
                      )
                  , iconUrl       : 'global/img/sound_down_icon&16.png'
                }
              , strFunction       : 'volumeDown'
            }
        }
    }
  ,

  /**
   * Things to do on initialization.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  init : function() {
    Global.getAllCommands();
  }
  ,

  /**
   * Gets all the registered extension commands and their shortcuts (if active).
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  getAllCommands : function() {
    StorageSync.get( strConstGeneralSettings, function( objReturn ) {
      if ( typeof strLog === 'string' ) {
        strLog = 'getAllCommands';
        Log.add( strLog, objReturn );
      }

      var objGeneralSettings = objReturn[ strConstGeneralSettings ];

      if (
            typeof objGeneralSettings === 'object'
        &&  objGeneralSettings.boolShowShortcutsInNotification
      ) {
        Global.boolShowShortcuts = true;

        chrome.commands.getAll( function( arrCommands ) {
          Global.arrCommands = arrCommands;
        } );
      }
      else
        Global.boolShowShortcuts = false;
    });
  }
  ,

  /**
   * Gets the requested data from StorageArea.
   *
   * @type    method
   * @param   Storage
   *            Target storage.
   * @param   miscGet
   *            A single key to get, list of keys to get, or a dictionary
   *            specifying default values (see description of the object).
   *            An empty list or object will return an empty result object.
   *            Pass in null to get the entire contents of storage.
   * @param   strLog
   *            Debug line "prefix".
   * @param   funcSuccessCallback
   *            Optional. Function to run on success.
   * @param   funcErrorCallback
   *            Optional. Function to run on error.
   * @param   objErrorLogDetails
   *            Optional. Data to be passed on error.
   * @param   boolTrackError
   *            Optional. Whether to track error if user participates in UEIP.
   * @return  void
   **/
  getStorageItems : function(
      Storage
    , miscGet
    , strLog
    , funcSuccessCallback
    , funcErrorCallback
    , objErrorLogDetails
    , boolTrackError
  ) {
    Storage.get( miscGet, function( objReturn ) {
      var strGetStorageItemsLog = strLog;
      Log.add( strLog + strLogDo, miscGet );

      Global.checkForRuntimeError(
          function() {
            if ( typeof funcSuccessCallback === 'function' ) {
              funcSuccessCallback( objReturn );
            }

            Log.add( strGetStorageItemsLog + strLogDone, objReturn );
          }
        , funcErrorCallback
        , objErrorLogDetails
        , boolTrackError
      );
    } );
  }
  ,

  /**
   * Sets multiple items in StorageArea.
   *
   * @type    method
   * @param   Storage
   *            Target storage.
   * @param   objItems
   *            An object which gives each key/val pair to update storage with.
   * @param   strLog
   *            Debug line "prefix".
   * @param   funcSuccessCallback
   *            Optional. Function to run on success.
   * @param   funcErrorCallback
   *            Optional. Function to run on error.
   * @param   objErrorLogDetails
   *            Optional. Data to be passed on error.
   * @param   boolTrackError
   *            Optional. Whether to track error if user participates in UEIP.
   * @return  void
   **/
  setStorageItems : function(
      Storage
    , objItems
    , strLog
    , funcSuccessCallback
    , funcErrorCallback
    , objErrorLogDetails
    , boolTrackError
  ) {
    Storage.set( objItems, function() {
      var strSetStorageItemsLog = strLog + ', setStorageItems';
      Log.add( strSetStorageItemsLog + strLogDo, objItems );

      Global.checkForRuntimeError(
          function() {
            if ( typeof funcSuccessCallback === 'function' ) {
              funcSuccessCallback();
            }

            Storage.get( null, function( objAllItemsAfterUpdate ) {
              Log.add(
                  strSetStorageItemsLog + strLogDone
                , objAllItemsAfterUpdate
              );
            });
          }
        , funcErrorCallback
        , objErrorLogDetails
        , boolTrackError
      );
    });
  }
  ,

  /**
   * Displays current track info via Notification.
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
   * @param   boolExternal
   *            Optional. Whether the request is sent from another extension/app.
   * @param   objSender
   *            Optional. Sender of the request.
   * @return  void
   **/
  showNotification : function(
      boolIsUserLoggedIn
    , boolDisregardSameMessage
    , intTabId
    , objPlayerInfo
    , objStationInfo
    , strCommand
    , boolExternal
    , objSender
  ) {
    strLog = 'showNotification';
    Log.add( strLog, objStationInfo );

    var objNotificationOptions = {
            type : 'basic'
          , title : ''
          , message : objStationInfo.strTrackInfo.trim()
          , iconUrl : Global.strNotificationIconUrl
        }
      , objTempPlayerInfo = objPlayerInfo
      , objTempStationInfo = objStationInfo
      , strModule = objTempPlayerInfo.strModule
      , strStorageVar = strConstSettingsPrefix + strModule
      , strNotificationId = Global.composeNotificationId( strModule, intTabId, boolExternal, objSender )
      ;

    if ( typeof boolExternal === 'boolean' && boolExternal ) {
      strStorageVar += strConstGenericStringSeparator + objSender.id;
    }

    // If Chrome supports showing additional info separately
    if ( objStationInfo.strAdditionalInfo !== '' ) {
      if ( strConstChromeVersion >= 31 && bowser.name !== 'Opera' ) {
        objNotificationOptions.contextMessage = objStationInfo.strAdditionalInfo;
      }
      else {
        objNotificationOptions.message += strConstNotificationLinesSeparator + objStationInfo.strAdditionalInfo;
      }
    }

    // Clear notification for this tab first, then display a new one
    // TODO: Add extension ID to strNotificationId when boolExternal === true
    chrome.notifications.clear( strNotificationId, function() {
      ( boolExternal ? StorageLocal : StorageSync ).get(
          strStorageVar
        , function( objReturn ) {
            var objData = objReturn[ strStorageVar ];

            // Whether to show notification or not
            if (  ! boolDisregardSameMessage
              &&  typeof objData.boolShowNotificationWhenStopped === 'boolean'
              &&  ! objData.boolShowNotificationWhenStopped
              &&  ! objTempPlayerInfo.boolIsPlaying
            ) {
              return false;
            }

            if (  ! boolDisregardSameMessage
              &&  typeof objData.boolShowNotificationWhenMuted === 'boolean'
              &&  ! objData.boolShowNotificationWhenMuted
              &&  (
                        objTempPlayerInfo.intVolume === Global.intNoVolume
                    ||  objTempPlayerInfo.boolIsMuted
                  )
            ) {
              return false;
            }

            if (  ! boolDisregardSameMessage
              &&  typeof objData.boolShowNotificationWhenNoTrackInfo === 'boolean'
              &&  ! objData.boolShowNotificationWhenNoTrackInfo
              &&  objTempStationInfo.strTrackInfo === Global.strNoTrackInfo
            ) {
              return false;
            }

            // Notification Icon Settings
            if (  typeof objData.boolShowNotificationLogo === 'boolean'
              &&  objData.boolShowNotificationLogo
              &&  objStationInfo.strLogoDataUri !== null
              &&  objStationInfo.strLogoDataUri !== ''
            ) {
              objNotificationOptions.iconUrl = objStationInfo.strLogoDataUri;
            }

            var strTitleFormat = objData.strNotificationTitleFormat || ''
              , arrButtons     = objData.arrActiveNotificationButtons
              ;

            // Notification Title Settings
            if ( strTitleFormat === 'short' ) {
              objNotificationOptions.title = objTempStationInfo.strStationName;
            }
            else if ( strTitleFormat === 'long' ) {
              objNotificationOptions.title = objTempStationInfo.strStationNamePlusDesc;
            }
            else {
              objNotificationOptions.title = chrome.i18n.getMessage( 'extensionName' );
            }

            // Notification Buttons Settings
            if ( arrButtons.length !== 0 ) {
              // Save active buttons for the listener
              var arrActiveButtons = []
                , objNotificationButtons = Global.objNotificationButtons
                , arrTrackInfo = objTempStationInfo.strTrackInfo.trim().split( strConstNotificationLinesSeparator )
                ;

              objNotificationOptions.buttons = [];

              if (
                    ~ arrButtons.indexOf( 'add' )
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
                  ~~  Global
                        .arrAddTrackToPlaylistFeedback
                          .indexOf( arrTrackInfo[ 1 ] )
                ) {
                  objNotificationOptions.buttons.push(
                    Global.addShortcutInfo(
                        objNotificationButtons.add.loggedIn.objButton
                      , 'add'
                    )
                  );

                  arrActiveButtons.push( 'add|loggedIn' );
                }
              }

              if (
                    ~ arrButtons.indexOf( 'addAuth' )
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
                  ~~  Global
                        .arrAddTrackToPlaylistFeedback
                          .indexOf( arrTrackInfo[ 1 ] )
                ) {
                  objNotificationOptions.buttons.push(
                    Global.addShortcutInfo(
                        objNotificationButtons.addAuth.loggedIn.objButton
                      , 'add'
                    )
                  );

                  arrActiveButtons.push( 'addAuth|loggedIn' );
                }
              }

              if (
                    ~ arrButtons.indexOf( 'favorite' )
                &&  boolIsUserLoggedIn
              ) {
                // Don't show button, if liked this track already
                // TODO: Show if track changed while waited for server response
                if (
                  ~~  Global
                        .strFavoriteStatusSuccess
                          .indexOf( arrTrackInfo[ 1 ] )
                ) {
                  objNotificationOptions.buttons.push(
                    Global.addShortcutInfo(
                        objNotificationButtons.favorite.loggedIn.objButton
                      , 'favorite'
                    )
                  );

                  arrActiveButtons.push( 'favorite|loggedIn' );
                }
              }

              if (
                    ~ arrButtons.indexOf( 'favoriteAuth' )
                &&  boolIsUserLoggedIn
              ) {
                // Don't show button, if liked this track already
                // TODO: Show if track changed while waited for server response
                if (
                  ~~  Global
                        .strFavoriteStatusSuccess
                          .indexOf( arrTrackInfo[ 1 ] )
                ) {
                  objNotificationOptions.buttons.push(
                    Global.addShortcutInfo(
                        objNotificationButtons.favoriteAuth.loggedIn.objButton
                      , 'favorite'
                    )
                  );

                  arrActiveButtons.push( 'favoriteAuth|loggedIn' );
                }
              }

              if (
                    ~ arrButtons.indexOf( 'next' )
                &&  (
                          boolIsUserLoggedIn
                      ||  (
                                typeof
                                  objTempPlayerInfo
                                    .boolCanPlayNextTrackLoggedOut ===
                                      'undefined'
                            ||  objTempPlayerInfo
                                  .boolCanPlayNextTrackLoggedOut
                          )
                    )
              ) {
                objNotificationOptions.buttons.push(
                  Global.addShortcutInfo(
                      objNotificationButtons.next.next.objButton
                    , 'next'
                  )
                );

                arrActiveButtons.push( 'next|next' );
              }

              if (
                    ~ arrButtons.indexOf( 'nextAuth' )
                &&  (
                          boolIsUserLoggedIn
                      ||  (
                                typeof
                                  objTempPlayerInfo
                                    .boolCanPlayNextTrackLoggedOut ===
                                      'undefined'
                            ||  objTempPlayerInfo
                                  .boolCanPlayNextTrackLoggedOut
                          )
                    )
              ) {
                objNotificationOptions.buttons.push(
                  Global.addShortcutInfo(
                      objNotificationButtons.nextAuth.next.objButton
                    , 'next'
                  )
                );

                arrActiveButtons.push( 'nextAuth|next' );
              }

              if (
                    ~ arrButtons.indexOf( 'previous' )
                &&  (
                          boolIsUserLoggedIn
                      ||  (
                                typeof
                                  objTempPlayerInfo
                                    .boolCanPlayPreviousTrackLoggedOut ===
                                      'undefined'
                            ||  objTempPlayerInfo
                                  .boolCanPlayPreviousTrackLoggedOut
                          )
                    )
              ) {
                objNotificationOptions.buttons.push(
                  Global.addShortcutInfo(
                      objNotificationButtons.previous.previous.objButton
                    , 'previous'
                  )
                );

                arrActiveButtons.push( 'previous|previous' );
              }

              if (
                    ~ arrButtons.indexOf( 'previousAuth' )
                &&  (
                          boolIsUserLoggedIn
                      ||  (
                                typeof
                                  objTempPlayerInfo
                                    .boolCanPlayPreviousTrackLoggedOut ===
                                      'undefined'
                            ||  objTempPlayerInfo
                                  .boolCanPlayPreviousTrackLoggedOut
                          )
                    )
              ) {
                objNotificationOptions.buttons.push(
                  Global.addShortcutInfo(
                      objNotificationButtons.previousAuth.previous.objButton
                    , 'previous'
                  )
                );

                arrActiveButtons.push( 'previousAuth|previous' );
              }

              if ( ~ arrButtons.indexOf( 'playStop' ) ) {
                objNotificationOptions.buttons.push(
                  Global.addShortcutInfo(
                      objNotificationButtons
                        .playStop[ ~~ objTempPlayerInfo.boolIsPlaying ]
                          .objButton
                    , 'playStop'
                  )
                );

                arrActiveButtons
                  .push( 'playStop|' + ~~ objTempPlayerInfo.boolIsPlaying );
              }

              if ( ~ arrButtons.indexOf( 'muteUnmute' ) ) {
                var strMuteUnmuteState  =
                      (
                            // TODO: Switch to 0-1
                            objTempPlayerInfo.intVolume > 0
                        &&  ! objTempPlayerInfo.boolIsMuted
                      )
                        ? 'mute'
                        : 'unmute'
                      ;

                objNotificationOptions.buttons.push(
                  Global.addShortcutInfo(
                      objNotificationButtons
                        .muteUnmute[ strMuteUnmuteState ]
                          .objButton
                    , 'muteUnmute'
                  )
                );

                arrActiveButtons.push( 'muteUnmute|' + strMuteUnmuteState );
              }

              if ( ~ arrButtons.indexOf( 'volumeUp' ) ) {
                objNotificationOptions.buttons.push(
                  Global.addShortcutInfo(
                      objNotificationButtons.volumeUp.volumeUp.objButton
                    , 'volumeUp'
                  )
                );

                arrActiveButtons.push( 'volumeUp|volumeUp' );
              }

              if ( ~ arrButtons.indexOf( 'volumeDown' ) ) {
                objNotificationOptions.buttons.push(
                  Global.addShortcutInfo(
                      objNotificationButtons.volumeDown.volumeDown.objButton
                    , 'volumeDown'
                  )
                );

                arrActiveButtons.push( 'volumeDown|volumeDown' );
              }
            }

            chrome.notifications.create( 
                strNotificationId
              , objNotificationOptions
              , function( strNotificationId ) {
                  // Catch errors
                  if ( chrome.runtime.lastError ) {
                    strLog = 'showNotification';

                    var objLogDetails   = {}
                      , strErrorMessage = chrome.runtime.lastError.message
                      ;

                    if ( typeof strErrorMessage === 'string' )
                      objLogDetails.strErrorMessage = strErrorMessage;

                    Log.add( strLog + strLogError, objLogDetails, true );

                    // Check if buttons can be added
                    var strButtonsMessage =
                          'Adding buttons to notifications is not supported.';

                    if ( strErrorMessage === strButtonsMessage ) {
                      // Try creating notification with no buttons
                      delete objNotificationOptions.buttons;

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
                              , boolExternal
                              , objSender
                            );

                            // This, probably, doesn't auto-close, so close it
                            setTimeout(
                                function() {
                                  chrome.notifications.clear(
                                      strNotificationId
                                    , function() {}
                                  );
                                }
                              , Global.intNotificationsClearTimeout
                            );
                          }
                      );
                    }
                    else
                      return;
                  }

                  Global.showNotificationCallback(
                      objTempPlayerInfo
                    , objTempStationInfo
                    , intTabId
                    , arrActiveButtons
                    , strCommand
                    , boolExternal
                    , objSender
                  );
                }
            );
          }
      );
    });
  }
  ,

  /**
   * Actions after notification has been displayed.
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
   * @param   boolExternal
   *            Optional. Whether the request is sent from another extension/app.
   * @param   objSender
   *            Optional. Sender of the request.
   * @return  void
   **/
  showNotificationCallback : function(
      objPlayerInfo
    , objStationInfo
    , intTabId
    , arrActiveButtons
    , strCommand
    , boolExternal
    , objSender
  ) {
    var strModule = objPlayerInfo.strModule;

    /* START Log */
    var arrTrackInfo = objStationInfo.strTrackInfo.split( strConstNotificationLinesSeparator )
      , funcLog = function() {
          strLog = 'showNotificationCallback';
          Log.add(
              strLog
            , {
                  strModule : strModule
                , strStationName : objStationInfo.strStationName
                , boolHasAddToPlaylistButton : objStationInfo.boolHasAddToPlaylistButton || 'n/a'
              }
            , true
          );
        }
      ;

    // There is no arrTrackInfo[ 1 ] only on track change (automatic and when
    // clicked 'next', too) and on 'showNotification' command
    if (  typeof arrTrackInfo[ 1 ] === 'undefined'
      &&  strCommand !== 'showNotification'
    ) {
      funcLog();
    }
    else {
      ( boolExternal ? StorageLocal : StorageSync ).get( 'arrRecentTracks', function( objReturn ) {
        if ( typeof objReturn.arrRecentTracks === 'object' ) {
          var arrLastTrack = objReturn.arrRecentTracks.pop();

          // Don't log when same player, station & track info as last track.
          // Even on page reload.
          if (
                (
                      arrLastTrack === undefined
                  ||  arrLastTrack[ 0 ] !== arrTrackInfo[ 0 ]
                  ||  arrLastTrack[ 1 ] !== objStationInfo.strStationName
                  ||  arrLastTrack[ 2 ] !== objStationInfo.strLogoUrl
                )
            &&  strCommand !== 'showNotification'
          ) {
            funcLog();
          }
        }
      });
    }
    /* END Log */

    Background.saveRecentTrackInfo( objStationInfo, boolExternal, objSender );
    Global.saveTabsIds( intTabId, strModule, boolExternal, objSender );
    Global.saveActiveButtons( intTabId, arrActiveButtons );
  }
  ,

  /**
   * Displays system notification.
   *
   * @type    method
   * @param   strNotificationType
   *            Type of the notification
   * @param   strTitle
   *            Optional. Title of the notification
   * @param   strMessage
   *            Optional. Message of the notification
   * @param   strIconUrl
   *            Optional. URL of the notification icon
   * @param   arrButtons
   *            Optional. Buttons of the notification
   * @return  void
   **/
  showSystemNotification : function(
      strNotificationType
    , strTitle
    , strMessage
    , strIconUrl
    , arrButtons
  ) {
    strLog = 'showSystemNotification';
    Log.add( strLog, strTitle + ' | ' + strMessage );

    var
        objNotificationOptions  = {
            type                : 'basic'
          , title               : strTitle || ''
          , message             : strMessage || ''
          , iconUrl             : 
              strIconUrl || Global.strSystemNotificationIconUrl
        }
      , strNotificationId       = 
          Global.strSystemNotificationId + strNotificationType
      ;

    if ( Array.isArray( arrButtons ) && arrButtons.length )
      objNotificationOptions.buttons = arrButtons;

    // Clear previous notification of this type first, then display a new one
    chrome.notifications.clear( strNotificationId, function() {
      chrome.notifications.create(
          strNotificationId
        , objNotificationOptions
        , function( strNotificationId ) {}
      );
    });
  }
  ,

  /**
   * Removes the notification for this tab.
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

              StorageLocal.get( arrVars, function( objData ) {
                strLog = 'removeNotification';
                var intChanges = 0;

                // Remove this notification's active buttons
                if ( typeof objData.objActiveButtons[ intTabId ] === 'object' ) {
                  delete objData.objActiveButtons[ intTabId ];
                  intChanges++;
                }

                // Remove this notification's tab id
                var arrTabsIds = objData.arrTabsIds
                  , intIndex = Global.returnIndexOfSubitemContaining( arrTabsIds, intTabId )
                  ;

                if ( intIndex !== -1 ) {
                  arrTabsIds.splice( intIndex, 1 );
                  intChanges++;
                }

                // "Submit" changes
                if ( intChanges > 0 ) {
                  Global.setStorageItems(
                      StorageLocal
                    , objData
                    , strLog + ', submit'
                  );
                }
              } );
            }
        }
      );
    };

    if ( typeof strModule === 'undefined' ) {
      StorageLocal.get( 'arrTabsIds', function( objData ) {
        strLog = 'removeNotification, strModule';
        Log.add( strLog, intTabId );

        var arrTabsIds = objData.arrTabsIds;

        if ( typeof arrTabsIds === 'undefined' )
          return;

        var intIndex = 
              Global.returnIndexOfSubitemContaining( arrTabsIds, intTabId );

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
   * Saves tab id, for which notification was shown, in storage for later use.
   * 
   * TODO: Use obj instead of arr?
   *
   * @type    method
   * @param   intTabId
   *            Tab ID info received from.
   * @param   strModule
   *            Module notification was displayed for.
   * @param   boolExternal
   *            Optional. Whether the request is sent from another extension/app.
   * @param   objSender
   *            Optional. Sender of the request.
   * @return  void
   **/
  saveTabsIds : function ( intTabId, strModule, boolExternal, objSender ) {
    StorageLocal.get( 'arrTabsIds', function( objData ) {
      strLog = 'saveTabsIds';
      Log.add( strLog, intTabId );

      if ( typeof objData.arrTabsIds === 'undefined' ) {
        objData.arrTabsIds = [];
      }

      if ( typeof boolExternal === 'boolean' && boolExternal ) {
        strModule += strConstGenericStringSeparator + objSender.id;
      }

      var arrTabsIds = objData.arrTabsIds
        , intIndex = Global.returnIndexOfSubitemContaining( arrTabsIds, intTabId )
        , intLastIndex = arrTabsIds.length - 1
        , intChanges = 0
        , arrToPush = [ intTabId, strModule ]
        , funcPush = function() {
            arrTabsIds.push( arrToPush );
            intChanges++;
          }
        ;

      // Save if it is not present or "reposition" to be the last
      if ( intIndex === -1 ) {
        funcPush();
      }
      else if ( intIndex !== intLastIndex ) {
        arrTabsIds.splice( intIndex, 1 );
        funcPush();
      }

      // "Submit" changes
      if ( intChanges > 0 ) {
        Global.setStorageItems( StorageLocal, objData, strLog );
      }
    });
  }
  ,

  /**
   * Saves active buttons (per notification's tab id) in storage for later use.
   *
   * @type    method
   * @param   intTabId
   *            Tab ID info received from
   * @param   arrActiveButtons
   *            Active buttons for current notification
   * @return  void
   **/
  saveActiveButtons : function ( intTabId, arrActiveButtons ) {
    StorageLocal.get( 'objActiveButtons', function( objData ) {
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

        Global.setStorageItems( StorageLocal, objData, strLog );
      }
    });
  }
  ,

  /**
   * Gets saved open tabs from Storage.
   *
   * @type    method
   * @param   funcSuccessCallback
   *            Function to run after Storage prompted.
   * @return  void
   **/
  getSavedOpenTabs : function( funcSuccessCallback ) {
    Global.getStorageItems(
        StorageLocal
      , 'objOpenTabs'
      , 'getSavedOpenTabs'
      , function( objReturn ) {
          if ( typeof funcSuccessCallback === 'function' ) {
            funcSuccessCallback( objReturn );
          }
        }
    );
  }
  ,

  /**
   * Saves open tabs objects for later use.
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
        if ( Global.isEmpty( objToSet.objOpenTabs[ intWindowId ] ) ) {
          objToSet.objOpenTabs[ intWindowId ] = {};
        }

        var objTempWindowTabs = objOpenTabs[ intWindowId ];

        for ( var intTabIndex in objTempWindowTabs ) {
          if ( objTempWindowTabs.hasOwnProperty( intTabIndex ) ) {
            objToSet.objOpenTabs[ intWindowId ][ intTabIndex ] =
              objTempWindowTabs[ intTabIndex ];
          }
        }
      }
    }

    Global.getSavedOpenTabs( function( objReturn ) {
      if (
        ! (
              Global.isEmpty( objToSet.objOpenTabs )
          &&  Global.isEmpty( objReturn.objOpenTabs )
        )
      ) {
        strLog = 'saveOpenTabs';

        Global.setStorageItems( StorageLocal, objToSet, strLog );
      }
    } );
  }
  ,

  /**
   * Get module ID by the provided URL.
   *
   * @type    method
   * @param   strUrl
   *            Provided URL.
   * @return  string / null
   **/
  getModuleId : function ( strUrl ) {
    var self = this
      , objModules = self.objModules
      , strModule = self.getModuleIdFromProvided( strUrl, objModules )
      ;

    if ( strModule ) {
      return strModule;
    }

    // Not built-in, check external
    var objExternalModules = self.objExternalModules;

    if ( typeof objExternalModules !== 'object' || Array.isArray( objExternalModules ) ) {
      var promise = new Promise( function( funcResolve, funcReject ) {
        self.getModules( StorageLocal, objExternalModules, funcResolve, funcReject );
      } );

      promise
        .then( function ( objExternalModules ) {
          return self.getModuleIdFromProvided( strUrl, objExternalModules );
        } )
        .catch( function () {
          return null;
        } )
        ;

      return promise;
    }
    else {
      return self.getModuleIdFromProvided( strUrl, objExternalModules );
    }
  }
  ,

  /**
   * Test URL against each of the modules RegExp.
   *
   * TODO: Better name
   *
   * @type    method
   * @param   strUrl
   *            URL to test.
   * @param   objModules
   *            Modules to check against.
   * @return  string / null
   **/
  getModuleIdFromProvided : function ( strUrl, objModules )
  {
    for ( var strModule in objModules ) {
      if ( objModules.hasOwnProperty( strModule ) ) {
            // Built-in
        var objRegex = objModules[ strModule ].objRegex
            // External
          , strRegex = objModules[ strModule ].strRegex
          ;

        // The ones from Storage aren't instanceof RegExp
        if ( objRegex instanceof RegExp && objRegex.test( strUrl )
          || typeof strRegex === 'string' && new RegExp( strRegex ).test( strUrl )
        ) {
          return strModule;
        }
      }
    }

    return null;
  }
  ,

  /**
   * Get built-in and external connected modules.
   *
   * @type    method
   * @param   Storage
   *            Local or Sync Storage API.
   * @param   objModules
   *            Optional. Where to save the data.
   * @param   funcSuccessCallback
   *            Optional. Function to run on success.
   * @param   funcErrorCallback
   *            Optional. Function to run on error.
   * @return  void
   **/
  getModules : function( Storage, objModules, funcSuccessCallback, funcErrorCallback )
  {
    if ( typeof objModules !== 'object' || Array.isArray( objModules ) ) {
      objModules = {};
    }

    var promise = new Promise( function( funcResolve, funcReject ) {
      Storage.get( null, function( objStorage ) {
        for ( var strKey in objStorage ) {
          if (  objStorage.hasOwnProperty( strKey )
            &&  strKey.indexOf( strConstSettingsPrefix ) === 0
          ) {
            var strModule = strKey.replace( strConstSettingsPrefix, '' )
              , objModule = objStorage[ strKey ]
              ;

            objModule.id = strModule;

            // TODO: Avoid confusion when StorageSync === StorageLocal
            if ( Storage === StorageSync ) {
              // Check if built-in module is available
              if (  ! Global.objModules[ strModule ]
                &&  strModule !== strConstGeneralSettingsSuffix
              ) {
                continue;
              }

              var strModuleVar = 'module_' + strModule;

              objModule.type = 'built-in';
              objModule.caption = chrome.i18n.getMessage( strModuleVar );
              objModule.captionLong = chrome.i18n.getMessage( strModuleVar + '_long' );
            }
            else {
              var intLastIndex = strModule.lastIndexOf( strConstExternalModuleSeparator )
                , strModuleExternal = strModule.substr( 0, intLastIndex )
                ;

              objModule.type = 'external';
              objModule.caption = strModuleExternal;
            }

            objModules[ strModule ] = objModule;
          }
        }

        funcResolve();
      } );
    } );

    promise
      .then( function () {
        if ( ! Global.isEmpty( objModules ) && typeof funcSuccessCallback === 'function' ) {
          funcSuccessCallback( objModules );
        }
        else if ( typeof funcErrorCallback === 'function' ) {
          funcErrorCallback();
        }
      } )
      .catch( function () {
        if ( typeof funcErrorCallback === 'function' ) {
          funcErrorCallback();
        }
      } )
      ;

    return promise;
  }
  ,

  /**
   * Checks whether the object/array is empty.
   *
   * @type    method
   * @param   objToTest
   *            Object to check against.
   * @return  bool
   **/
  isEmpty : function ( objToTest )
  {
    for ( var i in objToTest ) {
      return false;
    }

    return true;
  }
  ,

  /**
   * Makes an object out of an array.
   *
   * @type    method
   * @param   arrToConvert
   *            Array to convert.
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
   *            Callback to invoke when open tab found.
   * @return  void
   **/
  findFirstOpenTabInvokeCallback : function ( funcCallback )
  {
    Global.getSavedOpenTabs( function( objReturn ) {
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
                ) !== 0 ) {
                return;
              }
            }
          }
        }
      }
    } );
  }
  ,

  /**
   * Checks whether the module is enabled.
   *
   * @type    method
   * @param   strModule
   *            Module ID.
   * @param   intTabId
   *            ID of the tab the request is sent from.
   * @param   funcSuccessCallback
   *            Function to run on success.
   * @param   funcErrorCallback
   *            Function to run on error.
   * @param   objPreservedData
   *            Data preserved for a callback.
   * @param   strCallerLog
   *            strLog of the caller.
   * @param   boolExternal
   *            Optional. Whether a message is sent from another extension/app.
   * @return  integer
   **/
  checkIfModuleIsEnabled : function (
      strModule
    , intTabId
    , funcSuccessCallback
    , funcErrorCallback
    , objPreservedData
    , strCallerLog
    , boolExternal
  ) {
    var strObjSettings = strConstSettingsPrefix + strModule;

    ( boolExternal ? StorageLocal : StorageSync ).get( strObjSettings, function( objReturn ) {
      var objModuleSettings = objReturn[ strObjSettings ];

      if (  typeof objModuleSettings === 'object'
        &&  objModuleSettings.boolIsEnabled
      ) {
        strLog = 'checkIfModuleIsEnabled, ' + strCallerLog;
        Log.add( strLog + strLogSuccess, intTabId );

        if ( typeof funcSuccessCallback === 'function' ) {
          funcSuccessCallback( objPreservedData );
        }
      }
      else if ( typeof funcErrorCallback === 'function' ) {
        funcErrorCallback( objPreservedData );
      }
    } );
  }
  ,

  /**
   * Extracts tab ID from notification id.
   *
   * @type    method
   * @param   strNotificationId
   *            Notification ID.
   * @return  integer
   **/
  getTabIdFromNotificationId : function ( strNotificationId )
  {
    var arrNotificationId = strNotificationId.split( strConstNotificationIdSeparator )
      , intNotificationIdLen = arrNotificationId.length
      , intNotificationTabId = parseInt( arrNotificationId[ intNotificationIdLen - 1 ] )
      ;

    return intNotificationTabId;
  }
  ,

  /**
   * Composes notification ID.
   *
   * @type    method
   * @param   intTabId
   *            Tab ID notification belongs to.
   * @param   strModule
   *            Module notification was displayed for.
   * @param   boolExternal
   *            Optional. Whether the request is sent from another extension/app.
   * @param   objSender
   *            Optional. Sender of the request.
   * @return  string
   **/
  composeNotificationId : function ( strModule, intTabId, boolExternal, objSender )
  {
    return Global.strNotificationId
          + strModule
          + Global.strNotificationIdSeparator
          + ( boolExternal
                ? objSender.id + Global.strNotificationIdSeparator
                : '' )
          + intTabId;
  }
  ,

  /**
   * Finds item in subarray, returns its index.
   *
   * @type    method
   * @param   arrContainer
   *            Array containing arrays/objects
   * @param   miscItem
   *            What to look for
   * @param   miscProp
   *            Array index or object key
   * @return  integer
   **/
  returnIndexOfSubitemContaining : function ( arrContainer, miscItem, miscProp )
  {
    return arrContainer
            .map(
              function ( miscSub ) {
                miscProp = ( typeof miscProp === 'undefined' ) ? 0 : miscProp;

                return miscSub[ miscProp ]
              }
            )
              .indexOf( miscItem );
  }
  ,

  /**
   * Adds shortcut info to the title of the button
   *
   * @type    method
   * @param   objButton
   *            Button properties
   * @return  object
   **/
  addShortcutInfo : function ( objButton, strCommand )
  {
    if ( Global.boolShowShortcuts ) {
      // We need a copy, otherwise it will append info again and again
      var objButtonCopy   = ( typeof objButton === 'object' ) ?
                              JSON.parse( JSON.stringify( objButton ) ) : {};

      if ( typeof objButtonCopy.title === 'string' ) {
        var intCommandsIndex  = Global.returnIndexOfSubitemContaining(
                                    Global.arrCommands
                                  , strCommand
                                  , 'name'
                                );

        if ( intCommandsIndex !== -1 ) {
          var strShortcut = Global.arrCommands[ intCommandsIndex ].shortcut;

          if ( strShortcut !== '' )
            objButtonCopy.title += ' (' + strShortcut + ')';
        }
      }

      return objButtonCopy;
    }
    else
      return objButton;
  }
  ,

  /**
   * Creates tab if it is not open or makes it active
   *
   * @type    method
   * @param   strUrl
   *            URL to open
   * @return  void
   **/
  createTabOrUpdate : function ( strUrl )
  {
    if ( typeof strLog === 'string' ) {
      strLog = 'createTabOrUpdate';
      Log.add( strLog, strUrl );
    }

    var objUrl = { url: strUrl };

    if ( ~~ strUrl.indexOf( Global.strOptionsUiUrlPrefix ) ) {
      chrome.tabs.query( objUrl, function( objTabs ) {
        if ( objTabs.length ) {
          chrome.tabs.update( objTabs[0].id, { active: true } );
        }
        else {
          chrome.tabs.create( objUrl );
        }
      } );
    }
    else {
      chrome.tabs.create( objUrl );
    }
  }
  ,

  /**
   * Makes HTTP Request and runs callback on success
   *
   * @type    method
   * @param   strUrl
 *              URL of the request
   * @param   funcSuccessCallback
 *              Callback to run on success
   * @param   objCallbackData
 *              Additional data for the callback
   * @param   funcErrorCallback
 *              Callback to run on error
   * @return  void
   **/
  makeHttpRequest : function (
      strUrl
    , funcSuccessCallback
    , objCallbackData
    , funcErrorCallback
  )
  {
    var strLog = 'makeHttpRequest';
    Log.add( strLog + strLogDo, strUrl );

    var objXhr = new XMLHttpRequest();

    objXhr.open( 'HEAD', strUrl, true );
    objXhr.onreadystatechange = function() {
      if (
            objXhr.readyState === 4
        &&  objXhr.status === 200
        &&  typeof funcSuccessCallback === 'function'
      ) {
        Log.add( strLog + strLogSuccess, strUrl );

        funcSuccessCallback( objXhr, objCallbackData );
      }
      else if (
            objXhr.readyState === 4
        &&  objXhr.status === 404
        &&  typeof funcErrorCallback === 'function'
      ) {
        Log.add( strLog + strLogError, strUrl );

        funcErrorCallback( objXhr );
      }
    };

    objXhr.send();
  }
  ,

  /**
   * Check whether there is a message from developers for this PoziTone version
   *
   * @type    method
   * @param   boolWasCalledFromPage
   *            Whether this method was called from a page where a banner
   *            should be displayed
   * @return  void
   **/
  checkForDevelopersMessage : function( boolWasCalledFromPage ) {
    var arrVars = [
        'boolIsMessageForThisVersionAvailable'
      , 'boolWasMessageForThisVersionClosed'
    ];

    StorageSync.get( arrVars, function( objReturn ) {
      strLog = 'checkForDevelopersMessage';
      Log.add( strLog, objReturn );

      var
          boolIsMessageForThisVersionAvailable =
            objReturn.boolIsMessageForThisVersionAvailable
        , boolWasMessageForThisVersionClosed =
            objReturn.boolWasMessageForThisVersionClosed
        ;

      boolIsMessageForThisVersionAvailable =
            typeof boolWasMessageForThisVersionClosed === 'boolean'
        &&  boolWasMessageForThisVersionClosed
        ;

      boolWasMessageForThisVersionClosed =
            typeof boolIsMessageForThisVersionAvailable === 'boolean'
        &&  boolIsMessageForThisVersionAvailable
        ;

      if (
            ! boolIsMessageForThisVersionAvailable
        &&  ! boolWasMessageForThisVersionClosed
      ) {
        var strUrl  = strConstMessageUrl
                        .replace(
                            strConstVersionParam
                          , strConstExtensionVersion
                        )
                        .replace(
                            strConstLangParam
                          , strConstExtensionLanguage
                        );

        strUrl += Log.strJoinUeip;

        Global.makeHttpRequest(
            strUrl
          , funcOnDevelopersMessageAvailable
          , undefined
          , funcOnDevelopersMessageUnavailable
        );

        function funcOnDevelopersMessageAvailable() {
          strLog = 'checkForDevelopersMessage' + strLogSuccess;

          Global.setStorageItems(
              StorageSync
            , { boolIsMessageForThisVersionAvailable : true }
            , strLog
            , function() {
                funcSetBrowserAction();

                // On browser action popup/options page opening
                if ( boolWasCalledFromPage ) {
                  funcShowBanner();
                }
              }
          );
        }

        function funcOnDevelopersMessageUnavailable() {
          // Recheck for message
          chrome.alarms.create(
              strConstDevelopersMessageAlarmName
            , {
                delayInMinutes  : intConstDevelopersMessageAlarmDelayMinutes
              }
          );
        }
      }
      else if (
            boolIsMessageForThisVersionAvailable
        &&  ! boolWasMessageForThisVersionClosed
      ) {
        // On update/browser (re)start
        if ( ! boolWasCalledFromPage ) {
          funcSetBrowserAction();
        }
        // On browser action popup/options page opening
        else {
          funcShowBanner();
        }
      }
      else if (
            ! boolIsMessageForThisVersionAvailable
        &&  boolWasMessageForThisVersionClosed
      ) {
        //
      }

      function funcSetBrowserAction() {
        chrome.browserAction.setTitle( {
          title: strConstTitleOnDevelopersMessageText
        } );

        chrome.browserAction.setBadgeBackgroundColor( {
          color: strConstBadgeOnDevelopersMessageColor
        } );

        chrome.browserAction.setBadgeText( {
          text: strConstBadgeOnDevelopersMessageText
        } );
      }

      function funcShowBanner() {
        document.getElementById( strDevelopersMessageBannerId )
          .classList.remove( strDevelopersMessageBannerNotActiveClass );
      }
    } );
  }
  ,

  /**
   * Runtime sets an error variable when some call failed.
   *
   * @type    method
   * @param   funcCallback
   *            Do when runtime error is not set.
   * @param   funcErrorCallback
   *            Optional. Callback on error.
   * @param   objErrorLogDetails
   *            Optional. Data to be passed on error.
   * @param   boolTrackError
   *            Optional. Whether to track error if user participates in UEIP.
   * @return  boolean
   **/
  checkForRuntimeError : function(
      funcCallback
    , funcErrorCallback
    , objErrorLogDetails
    , boolTrackError
  ) {
    if ( chrome.runtime.lastError ) {
      if ( typeof objErrorLogDetails !== 'object' ) {
        objErrorLogDetails = {};
      }

      var strErrorMessage = chrome.runtime.lastError.message;

      if ( typeof strErrorMessage === 'string' ) {
        objErrorLogDetails.strErrorMessage = strErrorMessage;
      }

      Log.add(
          strLog + strLogError
        , objErrorLogDetails
        , boolTrackError || true
      );

      if ( typeof funcErrorCallback === 'function' ) {
        funcErrorCallback();
      }
    }
    else if ( typeof funcCallback === 'function' ) {
      funcCallback();
    }
  }
  ,

  /**
   * Opens Options page.
   *
   * @type    method
   * @param   strCaller
   *            Where this was called from (action or event name).
   * @return  boolean
   **/
  openOptionsPage : function( strCaller ) {
    if ( boolConstIsBowserAvailable && strConstChromeVersion >= '42.0' ) {
      chrome.runtime.openOptionsPage( function() {
        Global.checkForRuntimeError(
            undefined
          , undefined
          , { strCaller : strCaller || '' }
          , true
        );
      } );
    }
    else {
      // Link to new Options UI for 40+
      var strOptionsUrl =
            boolConstUseOptionsUi
              ? 'chrome://extensions?options=' + strConstExtensionId
              : chrome.extension.getURL( 'options/index.html' )
              ;

      Global.createTabOrUpdate( strOptionsUrl );
    }
  }
};

/* =============================================================================

  On Load

 ============================================================================ */

/**
 * Initializes.
 *
 * @type    method
 * @param   No Parameters taken
 * @return  void
 **/
Global.init();
