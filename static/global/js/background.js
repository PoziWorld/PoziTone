/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2016 PoziWorld
  License                 :           pozitone.com/license
  File                    :           global/js/background.js
  Description             :           Background JavaScript

  Table of Contents:

    Constants
    Background
      init()
      checkIfUpdatedSilently()
      onUpdatedCallback()
      preventCheckForSilentUpdate()
      cleanUp()
      removeOldSettings()
      setDefaults()
      setExtensionDefaults()
      saveRecentTrackInfo()
      onMessageCallback()
      checkOpenTabs()
      checkIfOpenTabChangedDomainOnUpdated()
      checkIfOpenTabChangedDomainOnReplaced()
      checkIfHostnameChanged()
      processButtonClick_seeChanges()
      processButtonClick_doNotNotifyOfUpdates()
      resetDevelopersMessageVars()
      createBrowserActionContextMenu()
      onBrowserActionContextMenuItemClick()
    Listeners
      runtime.onMessage + runtime.onMessageExternal
      notifications.onClicked
      notifications.onButtonClicked
      commands.onCommand
      runtime.onInstalled
      runtime.onStartup
      tabs.onUpdated
      tabs.onReplaced
      tabs.onRemoved
      alarms.onAlarm
      contextMenus.onClicked

 ============================================================================ */

/* =============================================================================

  Constants

 ============================================================================ */

const
    objSettingsNotSyncable = {
        strLatestTrackedVersion : strConstExtensionVersion
      , objActiveButtons : {}
      , objOpenTabs : {}
      , arrTabsIds : []
      , strOptionsPageToOpen : ''
      , boolOpenOptionsPageOnRestart : false
    }
  , objSettingsSyncable = {
        arrRecentTracks : []
      , intRecentTracksToKeep : 10

      , boolIsMessageForThisVersionAvailable : false
      , boolWasMessageForThisVersionClosed : false

      , objSettings_general : {
            uiLanguage : 'browserDefault'
          , strJoinUeip : 'no'

          , boolEnableVoiceControl : false
          , boolAutoActivateVoiceControl : false
          , boolAutoReactivateVoiceControl : false

          , boolEnableExternalModulesSupport : false
          , boolShowAdvancedSettings : false
          , boolShowPlayerEventNotification : true
          , boolShowShortcutsInNotification : true
          , boolShowWasUpdatedNotification : true
          , intVolumeDelta : 10
        }
      , objSettings_ru_101 : {
            boolIsEnabled : false
          , boolShowNotificationLogo : true
          , strNotificationLogo : 'station'
          , strNotificationTitleFormat : 'short'
          , boolShowKbpsInfo : true
          , arrAvailableNotificationTitleFormats : [
                'short'
              , 'noStationInfo'
            ]
          , arrAvailableNotificationButtons : [
                'addAuth'
              , 'favoriteAuth'
              , 'playStop'
              , 'muteUnmute'
              , 'volumeUp'
              , 'volumeDown'
            ]
          , arrActiveNotificationButtons : [
                'addAuth'
              , 'muteUnmute'
            ]
          , boolShowNotificationWhenStopped : false
          , boolShowNotificationWhenMuted : false
          , boolShowNotificationWhenNoTrackInfo : false
          , boolUseGeneralVolumeDelta : true
          , intVolumeDelta : 10
        }
      , objSettings_com_classicalradio : {
            boolIsEnabled : false
          , boolShowNotificationLogo : true
          , strNotificationTitleFormat : 'short'
          , boolShowKbpsInfo : true
          , arrAvailableNotificationButtons : [
                'favoriteAuth'
              , 'playStop'
              , 'muteUnmute'
              , 'volumeUp'
              , 'volumeDown'
            ]
          , arrActiveNotificationButtons : [
                'playStop'
              , 'muteUnmute'
            ]
          , boolShowNotificationWhenMuted : false
          , boolShowNotificationWhenNoTrackInfo : false
          , boolUseGeneralVolumeDelta : true
          , intVolumeDelta : 10
        }
      , objSettings_fm_di : {
            boolIsEnabled : false
          , boolShowNotificationLogo : true
          , strNotificationLogo : 'station'
          , strNotificationTitleFormat : 'short'
          , arrAvailableNotificationTitleFormats : [
                'short'
              , 'noStationInfo'
            ]
          , arrAvailableNotificationButtons : [
                'playStop'
              , 'muteUnmute'
            ]
          , arrActiveNotificationButtons : [
                'playStop'
              , 'muteUnmute'
            ]
          , boolShowNotificationWhenMuted : false
        }
      , objSettings_com_google_play_music : {
            boolIsEnabled : false
          , strNotificationIconFormat : 'trackImage'
          , arrAvailableNotificationIconFormats : [
                'playerLogo'
              , 'stationLogo'
              , 'trackImage'
            ]
          , strNotificationTitleFormat : 'short'
          , arrAvailableNotificationTitleFormats : [
                'short'
              , 'long'
              , 'playerName'
              , 'noStationInfo'
            ]
          , arrAvailableNotificationButtons : [
                'favoriteAuth'
              , 'next'
              , 'previous'
              , 'playStop'
              , 'muteUnmute'
            ]
          , arrActiveNotificationButtons : [
                'next'
              , 'playStop'
            ]
          , boolShowNotificationWhenMuted : false
          , boolUseGeneralVolumeDelta : true
          , intVolumeDelta : 10
        }
      , objSettings_com_jazzradio : {
            boolIsEnabled : false
          , boolShowNotificationLogo : true
          , strNotificationTitleFormat : 'short'
          , boolShowKbpsInfo : true
          , arrAvailableNotificationButtons : [
                'favoriteAuth'
              , 'playStop'
              , 'muteUnmute'
              , 'volumeUp'
              , 'volumeDown'
            ]
          , arrActiveNotificationButtons : [
                'playStop'
              , 'muteUnmute'
            ]
          , boolShowNotificationWhenMuted : false
          , boolShowNotificationWhenNoTrackInfo : false
          , boolUseGeneralVolumeDelta : true
          , intVolumeDelta : 10
        }
      , objSettings_ru_ok_audio : {
            boolIsEnabled : false
          , boolShowNotificationLogo : true
          , strNotificationLogo : 'site'
          , arrAvailableNotificationButtons : [
                'addAuth'
              , 'nextAuth'
              , 'previousAuth'
              , 'playStop'
              , 'muteUnmute'
            ]
          , arrActiveNotificationButtons : [
                'addAuth'
              , 'nextAuth'
            ]
          , boolShowNotificationWhenMuted : false
        }
      , objSettings_com_radiotunes : {
            boolIsEnabled : false
          , boolShowNotificationLogo : true
          , strNotificationTitleFormat : 'short'
          , boolShowKbpsInfo : true
          , arrAvailableNotificationButtons : [
                'favoriteAuth'
              , 'playStop'
              , 'muteUnmute'
              , 'volumeUp'
              , 'volumeDown'
            ]
          , arrActiveNotificationButtons : [
                'playStop'
              , 'muteUnmute'
            ]
          , boolShowNotificationWhenMuted : false
          , boolShowNotificationWhenNoTrackInfo : false
          , boolUseGeneralVolumeDelta : true
          , intVolumeDelta : 10
        }
      , objSettings_com_rockradio : {
            boolIsEnabled : false
          , boolShowNotificationLogo : true
          , strNotificationTitleFormat : 'short'
          , boolShowKbpsInfo : true
          , arrAvailableNotificationButtons : [
                'favoriteAuth'
              , 'playStop'
              , 'muteUnmute'
              , 'volumeUp'
              , 'volumeDown'
            ]
          , arrActiveNotificationButtons : [
                'playStop'
              , 'muteUnmute'
            ]
          , boolShowNotificationWhenMuted : false
          , boolShowNotificationWhenNoTrackInfo : false
          , boolUseGeneralVolumeDelta : true
          , intVolumeDelta : 10
        }
      , objSettings_com_soundcloud : {
            boolIsEnabled : false
          , boolShowNotificationLogo : true
          , strNotificationLogo : 'site'
          , strNotificationTitleFormat : 'short'
          , arrAvailableNotificationButtons : [
                'favoriteAuth'
              , 'next'
              , 'previous'
              , 'playStop'
              , 'muteUnmute'
            ]
          , arrActiveNotificationButtons : [
                'next'
              , 'playStop'
            ]
          , boolShowNotificationWhenMuted : false
        }
      , objSettings_com_vk_audio                  : {
            boolIsEnabled : false
          , boolShowNotificationLogo : true
          , strNotificationLogo : 'site'
          , arrAvailableNotificationButtons : [
                'addAuth'
              , 'nextAuth'
              , 'previousAuth'
              , 'playStop'
            ]
          , arrActiveNotificationButtons : [
                'addAuth'
              , 'nextAuth'
            ]
          , boolShowNotificationWhenMuted : false
        }
      , objSettings_com_vgmradio : {
            boolIsEnabled : false
          , boolShowNotificationLogo : true
          , strNotificationLogo : 'station'
          , arrAvailableNotificationButtons : [
                'playStop'
              , 'muteUnmute'
              , 'volumeUp'
              , 'volumeDown'
            ]
          , arrActiveNotificationButtons : [
                'playStop'
              , 'muteUnmute'
            ]
          , boolShowNotificationWhenStopped : false
          , boolShowNotificationWhenMuted : false
          , boolUseGeneralVolumeDelta : true
          , intVolumeDelta : 10
        }
    }
  ;

/* =============================================================================

  Background

 ============================================================================ */

var Background = {
    strObjOpenTabsName : 'objOpenTabs'
  , intCheckSettingsTimeout : 50
  , boolWasAnyChromeEventFired : false
  , objPreservedSettings : {}
  , strPreviousTrack : ''
  , arrTrackInfoPlaceholders : [
        ''
      , '...'
      , 'Ожидаем следующий трек'
      , 'Ожидаем следующий трек...'
      , 'Ждём название трека...'
    ]
  , strProcessButtonClick : 'processButtonClick_'
  , strProcessCommand : 'processCommand_'
  , strChangelogUrl : 'https://github.com/poziworld/PoziTone/blob/v%v/HISTORY_%lang.md'
  , objSystemNotificationButtons : {
        updated : [
            {
                objButton : {
                    title : 'systemNotificationUpdatedChanges'
                  , iconUrl : 'global/img/list_bullets_icon&16.png'
                }
              , strFunction : 'seeChanges'
            }
          , {
                objButton : {
                    title : 'systemNotificationUpdatedDoNotNotify'
                  , iconUrl : 'global/img/off_icon&16.png'
                }
              , strFunction : 'doNotNotifyOfUpdates'
            }
        ]
    }

  , strBrowserActionContextMenuIdPrefix : 'browserAction' + strConstGenericStringSeparator
  ,

  /**
   * Initialize
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  init : function() {
    Background.checkIfUpdatedSilently();

    Global.getModules( StorageLocal, undefined, function ( objModules ) {
      Global.objExternalModules = objModules;
    } );

    pozitone.background.checkForManagementPermission();
    pozitone.background.checkOptionsPageToOpenOnRestart();
  }
  ,

  /**
   * When updated on a browser start-up or when the extension was disabled,
   * it doesn't fire onInstalled, and that causes the new settings
   * not being applied
   *
   * TODO: utilize chrome.management.onEnabled.addListener(function callback)
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  checkIfUpdatedSilently : function() {
    var funcCheck = function() {
      StorageLocal.get( 'strLatestTrackedVersion', function( objReturn ) {
        strLog = 'checkIfUpdatedSilently';
        Log.add( strLog, {} );

        var strLatestTrackedVersion = objReturn.strLatestTrackedVersion;

        if (  typeof strLatestTrackedVersion === 'string'
          &&  (     strLatestTrackedVersion < strConstExtensionVersion
                ||  strLatestTrackedVersion === ''
              )
          ||  typeof strLatestTrackedVersion === 'undefined'
        ) {
          var objDetails = {};

          Background.cleanUp( true, objDetails );
          Background.checkOpenTabs();
          Background.onUpdatedCallback( strLog, objDetails );
        }
      });
    };

    setTimeout(
        function() {
          // Do not proceed if one of the chrome events fired
          if ( ! Background.boolWasAnyChromeEventFired )
            funcCheck();
        }
      , Background.intCheckSettingsTimeout
    );
  }
  ,

  /**
   * Do stuff when updated
   *
   * @type    method
   * @param   strLogFromCaller
   *            strLog
   * @param   objDetails
   *            - Optional. Reason - install/update/chrome_update
   *            - Optional. Previous version
   * @return  void
   **/
  onUpdatedCallback : function( strLogFromCaller, objDetails ) {
    strLog = 'onUpdatedCallback';

    // Save this version number
    Global.setStorageItems(
        StorageLocal
      , { strLatestTrackedVersion : strConstExtensionVersion }
      , strLog + ', save version'
    );

    // Show a notification
    objDetails.boolWasUpdated = true;

    StorageSync.get( strConstGeneralSettings, function( objReturn ) {
      strLog = 'onUpdatedCallback, ' + strLogFromCaller;
      Log.add( strLog, objDetails );

      var objGeneralSettings = objReturn[ strConstGeneralSettings ];

      if (  typeof objGeneralSettings === 'object'
        &&  objGeneralSettings.boolShowWasUpdatedNotification
      ) {
        var arrButtonsUpdated = Background.objSystemNotificationButtons.updated;

        Global.showSystemNotification(
            'updated'
          , poziworldExtension.i18n.getMessage( 'systemNotificationUpdated' )
          , poziworldExtension.i18n.getMessage( 'extensionName' ) +
              poziworldExtension.i18n.getMessage( 'systemNotificationUpdatedVersion' ) +
              strConstExtensionVersionName
          , null
          , [
                arrButtonsUpdated[ 0 ].objButton
              , arrButtonsUpdated[ 1 ].objButton
            ]
        );
      }
    });
  }
  ,

  /**
   * Prevent from unnecessary check and setting defaults twice
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  preventCheckForSilentUpdate : function() {
    Background.boolWasAnyChromeEventFired = true;
  }
  ,

  /**
   * Clean up in case of browser (re-)load/crash, extension reload, etc.
   *
   * TODO: Nothing to clean up on install, so skip.
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

    var arrSettingsToCleanUp = [
        'objActiveButtons'
      , 'arrTabsIds'
    ];

    StorageLocal.remove( arrSettingsToCleanUp, function() {
      if (  typeof boolIsCalledFromOnInstalledListener === 'boolean'
        &&  boolIsCalledFromOnInstalledListener
      ) {
        Background.removeOldSettings( objDetails );
      }
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

    if (  typeof objDetails.boolWasUpdated === 'boolean'
      &&  objDetails.boolWasUpdated
    ) {
      StorageSync.get( null, function( objReturn ) {
        strLog = 'removeOldSettings';

        var arrSettingsToRemove = []
          , objDeprecatedSettings = {
                arrActiveButtons : null
              , objActiveButtons : null
              , arrLastTracks : null
              , arrNotificationButtons : null
              , objOpenTabs : null
              , arrTabsIds : null
              , intLastTracksToKeep : null
              , boolNotificationShowStationLogo : null
              , boolNotificationShowWhenStopped : null
              , boolNotificationShowWhenMuted : null
              , boolNotificationShowWhenNoTrackInfo : null
              , strNotificationTitleFormat : null
              , objSettings_ru_101 : {
                    boolEnabled : null
                  , boolNotificationShowLogo : null
                  , boolNotificationShowWhenStopped : null
                  , boolNotificationShowWhenMuted : null
                  , boolNotificationShowWhenNoTrackInfo : null
                  , arrNotificationButtons : []
                }
              , objSettings_ru_ok_audio : {
                    arrNotificationButtons : []
                }
              , objSettings_com_vk_audio : {
                    boolEnabled : null
                  , boolNotificationShowLogo : null
                  , boolNotificationShowWhenMuted : null
                  , arrNotificationButtons : []
                  , arrAvailableNotificationButtons : []
                  , boolShowKbpsInfo : []
                }
              , objSettings_fm_di : {
                    arrNotificationButtons : []
                }
            }
          ;

        for ( let miscSetting in objDeprecatedSettings ) {
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
                for ( var miscSubsetting in objDeprecatedSetting ) {
                  if ( objDeprecatedSetting.hasOwnProperty( miscSubsetting ) ) {
                    // Special treatment for arrNotificationButtons:
                    // if arrNotificationButtons was set and not empty,
                    // then preserve by renaming the ones in need
                    var arrOldButtons = objCurrentSetting[ miscSubsetting ];

                    if (
                          miscSubsetting === 'arrNotificationButtons'
                      &&  Array.isArray( arrOldButtons )
                      &&  ! Global.isEmpty( arrOldButtons )
                    ) {
                      objCurrentSetting.arrActiveNotificationButtons =
                        arrOldButtons.map( function( strButton ) {
                          return strButton
                            .replace( 'add',      'addAuth'       )
                            .replace( 'favorite', 'favoriteAuth'  )
                            .replace( 'next',     'nextAuth'      )
                            .replace( 'previous', 'previousAuth'  )
                            ;
                        } );

                      // Preserved, can be deleted now
                      delete objCurrentSetting[ miscSubsetting ];
                    }
                    else {
                      if ( typeof objCurrentSetting[ miscSubsetting ] ===
                            'undefined' )
                        delete objDeprecatedSetting[ miscSubsetting ];

                      delete objCurrentSetting[ miscSubsetting ];
                    }
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

            Background.setExtensionDefaults( objDetails );
          });
        }
        else {
          Log.add( strLog + strLogDoNot );

          Background.setExtensionDefaults( objDetails );
        }
      });
    }
    else {
      Log.add( strLog + strLogDoNot );

      Background.setExtensionDefaults( objDetails );
    }
  }
  ,

  /**
   * Set extension defaults
   *
   * @type    method
   * @param   Storage
   *            StorageSync or StorageLocal
   * @param   objSettings
   *            Default settings
   * @param   strLogSuffix
   *            Type of storage to report in the log
   * @param   objDetails
   *            Optional. Reason - install/update/chrome_update -
   *            and (optional) previous version
   * @param   funcSuccessCallback
   *            Optional. Function to run on success.
   * @param   funcErrorCallback
   *            Optional. Function to run on error.
   * @param   funcHadBeenSetCallback
   *            Optional. Function to run when there is nothing to set.
   * @return  void
   **/
  setDefaults : function(
      Storage
    , objSettings
    , strLogSuffix
    , objDetails
    , funcSuccessCallback
    , funcErrorCallback
    , funcHadBeenSetCallback
  ) {
    Storage.get( null, function( objReturn ) {
      strLog = 'setExtensionDefaults, ' + strLogSuffix;
      Log.add( strLog );

      var objTempToSet = {}
        , intSettings = 0
        , intSettingsHadBeenSet = 0
        ;

      for ( var strSetting in objSettings ) {
        if ( objSettings.hasOwnProperty( strSetting ) ) {
          var miscSetting = objSettings[ strSetting ]
            , miscReturnSetting = objReturn[ strSetting ]
            ;

          // If a new setting introduced, set its default
          if ( typeof miscReturnSetting === 'undefined' ) {
            objTempToSet[ strSetting ] = miscSetting;
          }
          else {
            intSettingsHadBeenSet++;
          }

          if (
                typeof miscSetting === 'object'
            &&  ! Array.isArray( miscSetting )
          ) {
            for ( var strSubsetting in miscSetting ) {
              if ( miscSetting.hasOwnProperty( strSubsetting ) ) {
                // If a new subsetting introduced, set its default
                if (
                      typeof miscReturnSetting !== 'undefined'
                  &&  typeof miscReturnSetting[ strSubsetting ] === 'undefined'
                ) {
                  // If the setting has been set before.
                  if ( typeof objTempToSet[ strSetting ] === 'undefined' )
                    // Preserve other subsettings.
                    objTempToSet[ strSetting ] = miscReturnSetting;

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

          intSettings++;
        }
      }

      // TODO: Check whether this is being called twice
      if ( ! Global.isEmpty( objTempToSet ) ) {
        // Once installed and defaults are set, open Options page
        function funcCallback() {
          if ( typeof objDetails === 'object' && objDetails.reason === 'install' ) {
            Global.openOptionsPage( 'install' );
          }

          if ( typeof funcSuccessCallback === 'function' ) {
            funcSuccessCallback();
          }
        }

        Global.setStorageItems(
            Storage
          , objTempToSet
          , strLog
          , funcCallback
          , funcErrorCallback
        );
      }
      else {
        Log.add( strLog + strLogDoNot );

        if (  intSettingsHadBeenSet === intSettings
          &&  typeof funcHadBeenSetCallback === 'function'
        ) {
          funcHadBeenSetCallback();
        }
      }
    } );
  }
  ,

  /**
   * Set extension defaults
   *
   * @type    method
   * @param   objDetails
   *            Reason - install/update/chrome_update -
   *            and (optional) previous version
   * @return  void
   **/
  setExtensionDefaults : function( objDetails ) {
    Background.setDefaults(
        StorageLocal
      , objSettingsNotSyncable
      , 'local'
      , objDetails
    );

    Background.setDefaults(
        StorageSync
      , objSettingsSyncable
      , 'sync'
      , objDetails
    );
  }
  ,

  /**
   * Save Last Track info
   *
   * @type    method
   * @param   objStationInfo
   *            Last Track + Station info.
   * @param   boolExternal
   *            Optional. Whether the request is sent from another extension/app.
   * @param   objSender
   *            Optional. Sender of the request.
   * @return  void
   **/
  saveRecentTrackInfo : function( objStationInfo, boolExternal, objSender ) {
    var arrVarsToGet = [ 'arrRecentTracks', 'intRecentTracksToKeep' ];

    StorageSync.get( arrVarsToGet, function( objReturn ) {
      strLog = 'saveRecentTrackInfo';
      Log.add( strLog, objStationInfo );

      var arrRecentTracks = objReturn.arrRecentTracks
        // Don't include messages with player status (started, resumed, muted)
        , arrTrackInfo = objStationInfo.strTrackInfo.split( "\n\n" )
        , strTrackInfo = arrTrackInfo[ 0 ]
        , intIndex = Global.returnIndexOfSubitemContaining( arrRecentTracks, strTrackInfo )
        , arrTempRecentTrack  = []
        ;

      if ( intIndex !== -1 ) {
        if ( intIndex !== ( arrRecentTracks.length - 1 ) ) {
          arrRecentTracks.splice( intIndex, 1 );
        }
        // Don't save if it is already at the last position in the array
        else {
          return;
        }
      }
      else {
        var intRecentTracksExcess = arrRecentTracks.length - objReturn.intRecentTracksToKeep
          , intRecentTracksToRemove = ( intRecentTracksExcess < 0
                                          ? -1
                                          : intRecentTracksExcess
                                      ) + 1
          ;

        arrRecentTracks.splice( 0, intRecentTracksToRemove );
      }

      // Using array instead of object because of QUOTA_BYTES_PER_ITEM
      // developer.chrome.com/extensions/storage.html#property-sync-QUOTA_BYTES_PER_ITEM
      arrTempRecentTrack[ 0 ] = strTrackInfo;
      arrTempRecentTrack[ 1 ] = objStationInfo.strStationName;
      arrTempRecentTrack[ 2 ] = objStationInfo.strLogoUrl;

      if ( typeof boolExternal === 'boolean' && boolExternal ) {
        arrTempRecentTrack[ 3 ] = objSender.id;
      }

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
   *            Sender of a message
   * @param   funcSendResponse
   *            Used to send a response
   * @param   boolExternal
   *            Optional. Whether a message is sent from another extension/app
   * @return  void
   **/
  onMessageCallback : function( objMessage, objSender, funcSendResponse, boolExternal ) {
    if ( typeof boolExternal !== 'boolean' || ! boolExternal ) {
      var strReceiver = objMessage.strReceiver
        , objRequest = objMessage.objPozitoneApiRequest
        ;

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
            var funcCallback = function( objXhr, funcSendResponse ) {
              funcSendResponse(
                parseInt( objXhr.getResponseHeader( 'Content-Length' ) )
              );
            };

            Global.makeHttpRequest(
                objMessage.objVars.strUrl
              , funcCallback
              , funcSendResponse
            );
          }

          if ( poziworldExtension.utils.isType( objMessage.extensionReloadRequested, 'boolean' ) ) {
            pozitone.background.reloadExtension();
          }
        }

        // Don't break only when there is no receiver info
        return;
      }
      else if ( typeof objRequest === 'object' && ! Array.isArray( objRequest ) ) {
        // TODO: Optimize to not repeat
        pozitone.api.processRequest(
            objMessage
          , objSender
          , funcSendResponse
        );

        return;
      }
    }
    else {
      pozitone.api.processRequest(
          objMessage
        , objSender
        , funcSendResponse
      );

      return;
    }

    pozitone.background.processMediaNotificationRequest(
        objMessage
      , objSender
      , funcSendResponse
      , boolExternal
    );
  }
  ,

  /**
   * Check whether there is an appropriate module for the site in the tab.
   *
   * @type    method
   * @param   objTab
   *            Properties of the tab.
   * @param   objOpenTabs
   *            All currently open tabs and their properties.
   * @return  object
   **/
  checkTab : function( objTab, objOpenTabs ) {
    objOpenTabs = objOpenTabs || {};

    var strUrl = objTab.url;

    if ( typeof strUrl === 'string' && strUrl !== '' ) {
      var strModuleId = Global.getModuleId( strUrl );

      if ( strUrl && typeof strModuleId === 'string' ) {
        Log.add( strLog + strLogSuccess, strUrl );

        var intWindowId = objTab.windowId
          , intTabId = objTab.id
          ;

        // If there are no open tabs for this windowId saved yet
        if ( Global.isEmpty( objOpenTabs[ intWindowId ] ) ) {
          objOpenTabs[ intWindowId ] = {};
        }

        // Do not save all the properties of an open tab
        var objTabCopy = {};

        objTabCopy.id = objTab.id;
        objTabCopy.url = objTab.url;

        objOpenTabs[ intWindowId ][ objTab.index ] = objTabCopy;

        if ( pozitone.global.isModuleBuiltIn( strModuleId )  ) {
          var strTabStatus = objTab.status
            , boolIsTabLoading = typeof strTabStatus === 'string' && strTabStatus === 'loading'
            ;

          if ( ! pozitone.global.isModuleBuiltInApiCompliant( strModuleId, true ) || boolIsTabLoading ) {
            var objDataToPreserve = {
                strModuleId : strModuleId
              , intTabId : intTabId
              , objTab : objTab
            };

            Global.isModuleEnabled(
                strModuleId
              , intTabId
              , pozitone.background.injectModuleFiles
              , pozitone.background.logModuleNotEnabled
              , objDataToPreserve
              , 'funcCheckTabBeforeInjecting'
              , false
            );
          }
        }
      }
    }

    return objOpenTabs;
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
              objSavedTab : objSavedTab || {}
            , intRemovedTabId : intRemovedTabId || -1
          }
      );

      var objOpenTabs = {};

      for ( var i = 0, objTab; objTab = tabs[ i ]; i++ ) {
        objOpenTabs = Background.checkTab( objTab );

        // chrome.tabs.onReplaced
        if (  typeof objSavedTab === 'object'
          &&  typeof intRemovedTabId === 'number'
          &&  objSavedTab.index === objTab.index
        ) {
          Background.checkIfHostnameChanged(
              objSavedTab
            , objTab
            , intRemovedTabId
          );
        }
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
    Global.getSavedOpenTabs( function( objReturn ) {
      strLog = 'checkIfOpenTabChangedDomainOnUpdated';
      Log.add( strLog, objTab );

      var objSavedTabs = objReturn[ Background.strObjOpenTabsName ]
        , objSavedWindow = objSavedTabs[ objTab.windowId ]
        ;

      if ( typeof objSavedWindow === 'object' ) {
        var objSavedTab = objSavedWindow[ objTab.index ];

        if ( typeof objSavedTab === 'object' ) {
          Background.checkIfHostnameChanged( objSavedTab, objTab );
        }
      }
    } );
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
    Global.getSavedOpenTabs( function( objReturn ) {
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
    } );
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
            objSavedTab : objSavedTab
          , objTab : objTab
          , intRemovedTabId : intRemovedTabId || -1
        }
    );

    // http://stackoverflow.com/a/8498668/561712
    var $aSavedTab = document.createElement( 'a' )
      , $aTab = document.createElement( 'a' )
      ;

    $aSavedTab.href = objSavedTab.url;
    $aTab.href = objTab.url;

    if ( $aSavedTab.hostname !== $aTab.hostname ) {
      Log.add( strLog + strLogSuccess );

      var intTabId = objTab.id;

      if ( typeof intRemovedTabId === 'number' ) {
        intTabId = intRemovedTabId;
      }

      Global.removeNotification( intTabId );
    }
  }
  ,

  /**
   * Open the changelog.
   **/

  processButtonClick_seeChanges : function() {
    strLog = 'processButtonClick_seeChanges';
    Log.add( strLog, {} );

    const strCurrentLanguage = poziworldExtension.i18n.getLanguage();
    // Currently the changelog is available only in Russian and English
    const strTargetLanguage = ~ [ 'ru', 'be', 'uk' ].indexOf( strCurrentLanguage ) ? 'ru' : 'en';
    const strUrl = Background.strChangelogUrl
      .replace( strConstVersionParam, strConstExtensionVersion )
      .replace( strConstLangParam, strTargetLanguage )
      ;

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
  ,

  /**
   * Resets developers message vars.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  resetDevelopersMessageVars : function() {
    Global.setStorageItems(
        StorageSync
      , {
            boolIsMessageForThisVersionAvailable  : false
          , boolWasMessageForThisVersionClosed    : false
        }
      , strLog + ', reset developers message vars'
      , function() {
          Global.checkForDevelopersMessage();
        }
    );
  }
  ,

  /**
   * Create a menu that gets shown when right-clicked on PoziTone icon next
   * to the address bar.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  createBrowserActionContextMenu : function() {
    strLog = 'createBrowserActionContextMenu';
    Log.add( strLog, {} );

    var arrParentContextMenus = [
            'voiceControl'
          , 'modulesBuiltIn'
          , 'modulesExternal'
          , 'info'
        ]
      , arrInfoContextMenus = [
            'projects'
          , 'contribution'
          , 'feedback'
          , 'about'
        ]
      , i
      , l = arrParentContextMenus.length
      , m = arrInfoContextMenus.length
      , strContextMenu
      , objContextMenuProperties
      , arrPromises = []
      ;

    function createContextMenu( objProperties ) {
      var promise = new Promise( function ( funcResolve, funcReject ) {
        chrome.contextMenus.create(
            objProperties
          , function() {
              Global.checkForRuntimeError(
                  funcResolve
                , funcReject
              );
            }
        );
      } );

      arrPromises.push( promise );
    }

    function createContextMenuSeparator( strContextMenu ) {
      createContextMenu( {
          type : 'separator'
        , id : Background.strBrowserActionContextMenuIdPrefix + strContextMenu
        , contexts : [ 'browser_action' ]
      } );
    }

    function createGenericContextMenuProperties( strContextMenu ) {
      return {
          title : poziworldExtension.i18n.getMessage( strContextMenu )
        , contexts : [ 'browser_action' ]
      };
    }

    function createOptionsPageLinkContextMenuProperties(
        strContextMenu
      , strParentContextMenu
    ) {
      objContextMenuProperties = createGenericContextMenuProperties( strContextMenu );

      objContextMenuProperties.id =
          Background.strBrowserActionOptionsPageContextMenuIdPrefix
        + strContextMenu
        ;

      if ( typeof strParentContextMenu === 'string' && strParentContextMenu !== '' ) {
        objContextMenuProperties.parentId =
            Background.strBrowserActionOptionsPageContextMenuIdPrefix
          + strParentContextMenu
          ;
      }

      objContextMenuProperties.onclick = Background.onBrowserActionContextMenuItemClick;

      return objContextMenuProperties;
    }

    function createOptionsPageLinkContextMenu(
        strContextMenu
      , strParentContextMenu
    ) {
      createContextMenu(
          createOptionsPageLinkContextMenuProperties(
              strContextMenu
            , strParentContextMenu
          )
      );
    }

    // Rate Extension
    objContextMenuProperties = createGenericContextMenuProperties( 'rateExtensionShort' );
    objContextMenuProperties.id = Background.strBrowserActionRateExtensionContextMenuId;
    objContextMenuProperties.onclick = Background.onBrowserActionContextMenuItemClick;

    createContextMenu( objContextMenuProperties );

    // Separator
    createContextMenuSeparator( 'separator1' );

    // Parents
    for ( i = 0; i < l; i++ ) {
      strContextMenu = arrParentContextMenus[ i ];

      createOptionsPageLinkContextMenu( strContextMenu );
    }

    // Info
    for ( i = 0; i < m; i++ ) {
      strContextMenu = arrInfoContextMenus[ i ];

      createOptionsPageLinkContextMenu( strContextMenu, 'info' );
    }

    Promise
      .all( arrPromises )
      .then( function (  ) {
        pozitone.background.fireCallbacks( 'browserActionContextMenuCreated' );
      } )
      ;

    // Create separator in Opera before Options context menu.
    createContextMenuSeparator( 'separator2' );
  }
  ,

  /**
   * Fired when a browser action context menu item is clicked.
   *
   * @param {Object} objInfo - Information sent when a context menu item is clicked.
   * @param {Object} objTab - The details of the tab where the click took place. If the click did not take place in a tab, this parameter will be missing.
   **/

  onBrowserActionContextMenuItemClick : function( objInfo, objTab ) {
    var strLog = strLog = 'Background.onBrowserActionContextMenuItemClick';
    var strOption;

    Log.add( strLog, objInfo );

    var strMenuItemId = objInfo.menuItemId
      , strBrowserActionOptionsPageContextMenuIdPrefix =
          Background.strBrowserActionOptionsPageContextMenuIdPrefix
      , intOptionsPageIndex = strMenuItemId.indexOf(
          strBrowserActionOptionsPageContextMenuIdPrefix
        )
      ;

    if ( ~ intOptionsPageIndex ) {
      var strPage = strMenuItemId.substr( strBrowserActionOptionsPageContextMenuIdPrefix.length );
      var objItems = { strOptionsPageToOpen : strPage };

      strOption = strPage;

      if ( strPage !== '' ) {
        Global.setStorageItems(
            StorageLocal
          , objItems
          , strLog
          , function() {
              Global.openOptionsPage( strLog );
            }
          , undefined
          , objItems
          , true
        );
      }
    }
    else if ( ~ strMenuItemId.indexOf( Background.strBrowserActionRateExtensionContextMenuId ) ) {
      strOption = 'rate';

      Global.createTabOrUpdate( pozitone.global.getRatingUrl() );
    }

    // Track clicks
    var objLogDetails = objConstUserSetUp;

    objLogDetails.strContext = 'browserAction';
    objLogDetails.strOption = strOption;

    Log.add( 'contextMenuClick', objLogDetails, true );
  }
};


Background.strBrowserActionOptionsPageContextMenuIdPrefix =
    Background.strBrowserActionContextMenuIdPrefix
  + 'optionsPage'
  + strConstGenericStringSeparator
  ;

Background.strBrowserActionRateExtensionContextMenuId =
    Background.strBrowserActionContextMenuIdPrefix + 'rateExtension'
  ;

/* =============================================================================

  Listeners

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
  function( objMessage, objSender, funcSendResponse ) {
    Background.preventCheckForSilentUpdate();

    Background.onMessageCallback( objMessage, objSender, funcSendResponse );

    // Indicate that the response function will be called asynchronously
    return true;
  }
);

chrome.runtime.onMessageExternal.addListener(
  function( objMessage, objSender, funcSendResponse ) {
    Background.preventCheckForSilentUpdate();

    Background.onMessageCallback( objMessage, objSender, funcSendResponse, true );

    // Indicate that the response function will be called asynchronously
    return true;
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
    Background.preventCheckForSilentUpdate();

    strLog = 'chrome.notifications.onClicked';
    Log.add( strLog, { strNotificationId : strNotificationId }, true, true );

    if ( ~~ strNotificationId.indexOf( Global.strSystemNotificationId ) ) {
      // Check for changes
      Global.getAllCommands();

      var intNotificationTabId = Global.getTabIdFromNotificationId( strNotificationId );

      var funcFocusTab = function( intWindowId, intTabIndex, intTabId ) {
        if ( intNotificationTabId === intTabId )
          chrome.windows.update(
              intWindowId
            , { focused: true }
            , function() {
                chrome.tabs.update(
                    intTabId
                  , { active: true }
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
    else {
      chrome.notifications.clear( strNotificationId, function() {} );
    }
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
    Background.preventCheckForSilentUpdate();

    if ( ~~ strNotificationId.indexOf( Global.strSystemNotificationId ) ) {
      // Check for changes
      Global.getAllCommands();

      StorageLocal.get( [ 'arrTabsIds', 'objActiveButtons' ], function( objReturn ) {
        strLog = 'chrome.notifications.onButtonClicked';
        Log.add(
            strLog
          , {
                strNotificationId : strNotificationId
              , intButtonIndex : intButtonIndex
              , objActiveButtons : objReturn
            }
        );

        var intTabId = Global.getTabIdFromNotificationId( strNotificationId )
          , arrButtons = objReturn.objActiveButtons[ intTabId ]
          , arrButton = arrButtons[ intButtonIndex ].split( '|' )
          , strFunction = Global.objNotificationButtons[ arrButton[ 0 ] ][ arrButton[ 1 ] ].strFunction
          , strModuleId = strNotificationId.replace( strConstNotificationId, '' ).replace( strConstNotificationIdSeparator + intTabId, '' )
          ;

        Log.add(
            strLog + strLogDo
          , {
                strButton0 : arrButtons[ 0 ]
              , strButton1 : arrButtons[ 1 ]
              , strFunction : strFunction
              , strModuleId : strModuleId
            }
          , true
        );

        if (  pozitone.global.isModuleBuiltIn( strModuleId )
          &&  ! pozitone.global.isModuleBuiltInApiCompliant( strModuleId, true )
        ) {
          chrome.tabs.sendMessage(
              intTabId
            , Background.strProcessButtonClick + strFunction
          );
        }
        else {
          pozitone.api.sendCallToTab( strModuleId, intTabId, 'button', strFunction );
        }
      } );
    }
    else {
      var strNotification = strNotificationId.replace( Global.strSystemNotificationId, '' )
        , strFunctionAffix = Background.objSystemNotificationButtons[ strNotification ][ intButtonIndex ].strFunction
        , strFunction = Background.strProcessButtonClick + strFunctionAffix
        ;

      var funcToProceedWith = Background[ strFunction ];

      if ( typeof funcToProceedWith === 'function' ) {
        funcToProceedWith();
      }

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
    Background.preventCheckForSilentUpdate();

    // Check for changes
    Global.getAllCommands();

    StorageLocal.get( 'arrTabsIds', function( objData ) {
      strLog = 'chrome.commands.onCommand';

      // No saved data for some reason
      if ( Global.isEmpty( objData ) ) {
        Log.add( strLog + strLogNoSuccess, { strCommand : strCommand }, true );
        return;
      }
      else {
        Log.add( strLog, { strCommand : strCommand }, true );
      }

      var strMessagePrefix = Background.strProcessCommand;

      // For these it's the same as button click
      var arrCommands = [
          'add'
        , 'favorite'
        , 'next'
        , 'previous'
        , 'playStop'
        , 'volumeUp'
        , 'volumeDown'
      ];

      if ( ~ arrCommands.indexOf( strCommand ) ) {
        strMessagePrefix = Background.strProcessButtonClick;
      }

      var arrTabsIds = objData.arrTabsIds
        , intTabsIds = arrTabsIds.length
        , intArrIndex = intTabsIds - 1
        ;

      // The final step
      var funcSendMessage = function( objPreservedData ) {
        if (  pozitone.global.isModuleBuiltIn( objPreservedData.strModuleId )
          &&  ! pozitone.global.isModuleBuiltInApiCompliant( objPreservedData.strModuleId, true )
        ) {
          chrome.tabs.sendMessage(
              objPreservedData.intTabId
            , objPreservedData.strMessagePrefix + objPreservedData.strCommand
          );
        }
        else {
          pozitone.api.sendCallToTab(
              objPreservedData.strModuleId
            , objPreservedData.intTabId
            , 'command'
            , objPreservedData.strCommand
          );
        }
      };

      // Callback when no active players.
      // Gets name, checks if enabled
      var funcGetModuleNameAndProceed = function( intWindowId, intTabIndex, intTabId, strUrl ) {

        var strModule = Global.getModuleId( strUrl )
          , funcCheckNextOpenTab = function() {
              return 0;
            }
          ;

        if ( strUrl && strModule ) {
          var objDataToPreserve = {
            // TODO: Unify naming
              strModuleId : strModule
            , intTabId : intTabId
            , strMessagePrefix : strMessagePrefix
            , strCommand : strCommand
          };

          Global.isModuleEnabled(
              strModule
            , intTabId
            , funcSendMessage
            , funcCheckNextOpenTab
            , objDataToPreserve
            , 'findFirstOpenTabInvokeCallback'
            , pozitone.global.isModuleExternal( strModule )
          );
        }
        else {
          funcCheckNextOpenTab();
        }
      };

      // Tries to send to active players first
      var funcSendToActivePlayers = function( intArrIndex ) {
        if ( intArrIndex >= 0 ) {
          var arrTabInfo = arrTabsIds[ intArrIndex ]
            , intTabId = arrTabInfo[ 0 ]
            , strModuleId = arrTabInfo[ 1 ]
            , funcOnSendMessageResponse = function ( objResponse, boolExternal, objSender ) {
                var funcLoopMore = function( objPreservedData ) {
                  objPreservedData.intArrIndex--;
                  funcSendToActivePlayers( objPreservedData.intArrIndex );
                };

                if (  typeof objResponse === 'object'
                  &&  objResponse.boolIsReady
                  &&  typeof objResponse.strModule === 'string'
                ) {
                  var strModule = objResponse.strModule;

                  if ( typeof boolExternal === 'boolean' && boolExternal ) {
                    strModule += strConstGenericStringSeparator + objSender.id;
                  }

                  var objDataToPreserve = {
                    // funcSendMessage
                    // TODO: Unify naming
                      strModuleId : strModule
                    , intTabId : intTabId
                    , strMessagePrefix : strMessagePrefix
                    , strCommand : strCommand
                    // funcLoopMore
                    , intArrIndex : intArrIndex
                  };

                  Global.isModuleEnabled(
                      strModule
                    , intTabId
                    , funcSendMessage
                    , funcLoopMore
                    , objDataToPreserve
                    , 'funcSendToActivePlayers'
                    , boolExternal
                  );
                }
                else {
                  funcLoopMore( { intArrIndex: intArrIndex } );
                }
              }
            ;

          if (  pozitone.global.isModuleBuiltIn( strModuleId )
            &&  ! pozitone.global.isModuleBuiltInApiCompliant( strModuleId, true )
          ) {
            chrome.tabs.sendMessage(
                intTabId
              , 'Ready for a command? Your name?'
              , function( objResponse ) {
                  funcOnSendMessageResponse( objResponse );
                }
            );
          }
          else {
            pozitone.api.sendCallToTab(
                strModuleId
              , intTabId
              , 'command'
              , 'status'
              , funcOnSendMessageResponse
            );
          }
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
 *            and (optional) previous version.
 * @return  void
 **/
chrome.runtime.onInstalled.addListener(
  function( objDetails ) {
    Background.preventCheckForSilentUpdate();

    strLog = strConstLogOnInstalled;

    // Copy user set-up details
    // TODO: Replace with Object.assign() when supported
    for ( var miscProperty in objConstUserSetUp ) {
      if ( objConstUserSetUp.hasOwnProperty( miscProperty ) ) {
        objDetails[ miscProperty ] = objConstUserSetUp[ miscProperty ];
      }
    }

    Log.add( strLog, objDetails, true );

    pozitone.background.checkOptionsPageToOpenOnRestart();
    Background.cleanUp( true, objDetails );
    Background.checkOpenTabs();

    var strPreviousVersion = objDetails.previousVersion;

    if ( objDetails.reason === 'update' ) {
      if (  typeof strPreviousVersion === 'string'
        &&  strPreviousVersion < strConstExtensionVersion
      ) {
        Background.onUpdatedCallback( strLog, objDetails );
        Background.resetDevelopersMessageVars();
      }
      // In case of a manual update to a lower version
      else if (
            typeof strPreviousVersion === 'string'
        &&  strPreviousVersion > strConstExtensionVersion
      ) {
        Background.resetDevelopersMessageVars();
      }
      // Clicked Refresh on Extensions page
      else {
        Global.checkForDevelopersMessage();
      }
    }
    else {
      Global.checkForDevelopersMessage();
    }

    poziworldExtension.i18n.init()
      .then( Background.createBrowserActionContextMenu );
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
    Background.preventCheckForSilentUpdate();

    strLog = 'chrome.runtime.onStartup';
    Log.add( strLog, {}, true );

    Background.cleanUp();
    Background.checkOpenTabs();

    poziworldExtension.i18n.init()
      .then( Background.createBrowserActionContextMenu );
  }
);

/**
 * When tab is updated (most likely NOT loaded from cache), recheck open tabs.
 * So that if we, for example, changed URL of tab which would get commands,
 * after it has been changed, another one gets commands.
 *
 * @type    method
 * @param   intTabId
 *            ID of the tab.
 * @param   objChangeInfo
 *            Lists the changes to the state of the tab that was updated.
 * @param   objTab
 *            Gives the state of the tab that was updated.
 * @return  void
 **/
chrome.tabs.onUpdated.addListener(
  function( intTabId, objChangeInfo, objTab ) {
    Background.preventCheckForSilentUpdate();

    strLog = 'chrome.tabs.onUpdated';
    Log.add( strLog, objChangeInfo );

    var strStatus = objChangeInfo.status;

    if ( typeof strStatus === 'string' ) {
      if ( strStatus === 'loading' ) {
        Background.checkIfOpenTabChangedDomainOnUpdated( objTab );

        Global.getSavedOpenTabs( function( objReturn ) {
          strLog = 'chrome.tabs.onUpdated, complete';
          Log.add( strLog );

          var objOpenTabs = Background.checkTab( objTab, objReturn.objOpenTabs );

          // TODO: Prevent exceeding max number of write operations
          Global.saveOpenTabs( objOpenTabs );

          if ( Global.isEmpty( objOpenTabs ) ) {
            strLog = 'chrome.tabs.onUpdated, complete';
            Log.add( strLog + strLogNoSuccess );
          }
        } );
      }
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
    Background.preventCheckForSilentUpdate();

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
    Background.preventCheckForSilentUpdate();

    strLog = 'chrome.tabs.onRemoved';
    Log.add( strLog, intTabId );

    // TODO: When multiple tabs get closed at (almost) the same time,
    // wait for the following to finish with setTimeout
    Background.checkOpenTabs();
    Global.removeNotification( intTabId );
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
chrome.alarms.onAlarm.addListener(
  function( objAlarm ) {
    var strAlarmName = objAlarm.name;

    if (
          typeof strAlarmName === 'string'
      &&  strAlarmName === strConstDevelopersMessageAlarmName
    ) {
      Global.checkForDevelopersMessage();
    }
  }
);
