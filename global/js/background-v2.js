/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2016 PoziWorld
  License                 :           pozitone.com/license
  File                    :           global/js/background-v2.js
  Description             :           Background JavaScript v2

  Table of Contents:

    Background2
      checkForManagementPermission()
      addManagementOnInstalledListener()
      processMediaNotificationRequest()
      injectModuleFiles()
      logModuleNotEnabled()
    On Load
      Initialize

 ============================================================================ */

( function() {
  'use strict';

  function Background2() {

  }

  /**
   * Check whether "management" permission had been granted.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  Background2.prototype.checkForManagementPermission = function (  ) {
    var self = this;

    chrome.permissions.contains(
        { permissions : [ 'management' ] }
      , function( hasPermission ) {
          if ( hasPermission ) {
            self.addManagementOnInstalledListener();
          }
        }
    );
  };

  /**
   * Add a listener to watch for new external modules being installed.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  Background2.prototype.addManagementOnInstalledListener = function (  ) {

    /**
     * Fired when an app or extension has been installed.
     *
     * @type    method
     * @param   objExtensionInfo
     *            Information about an installed extension, app, or theme.
     * @return  void
     **/

    chrome.management.onInstalled.addListener(
      function( objExtensionInfo ) {
        var strExtensionId = objExtensionInfo.id;

        // TODO: Turn into an API call and utilize
        chrome.runtime.sendMessage(
            strExtensionId
          , 'greetings'
          , function( objSettings ) {
              // Handle errors
              if ( chrome.runtime.lastError ) {
                var objLogDetails   = {}
                  , strErrorMessage = chrome.runtime.lastError.message
                  ;

                if ( typeof strErrorMessage === 'string' ) {
                  objLogDetails.strErrorMessage = strErrorMessage;
                  objLogDetails.strExtensionId  = strExtensionId;
                }

                Log.add( strLog + strLogError, objLogDetails, true );
                return;
              }

              if ( typeof objSettings === 'object' ) {
                for ( strModuleSettings in objSettings ) {
                  var objModuleSettings = objSettings[ strModuleSettings ];

                  if (
                        objSettings.hasOwnProperty( strModuleSettings )
                    &&  typeof objModuleSettings === 'object'
                    &&  strModuleSettings.indexOf( strConstSettingsPrefix ) === 0
                  ) {
                    var strModuleSettingsPlusId   =
                            strModuleSettings
                          + strConstExternalModuleSeparator
                          + strExtensionId
                      , objModuleSettingsWrapper  = {}
                      ;

                    objModuleSettingsWrapper[ strModuleSettingsPlusId ] =
                      objModuleSettings;

                    // Background.setDefaults(
                    //     StorageLocal
                    //   , objModuleSettingsWrapper
                    //   , 'local'
                    // );
                  }
                }
              }
            }
        );
      }
    );
  };

  /**
   * Show a notification if the module which sent the request is enabled.
   *
   * @type    method
   * @param   objData
   *            Media-related data.
   * @param   objSender
   *            Sender of the request.
   * @param   funcSendResponse
   *            Used to send a response.
   * @param   boolExternal
   *            Optional. Whether the request is sent from another extension/app.
   * @return  void
   **/

  Background2.prototype.processMediaNotificationRequest = function (
      objData
    , objSender
    , funcSendResponse
    , boolExternal
  ) {
    strLog = 'Background2.processMediaNotificationRequest';
    Log.add( strLog, objData );

    // Additional info is retrieved from messages.json.
    // Modules send event names which are translated properly.
    var strAdditionalInfo = objData.objStationInfo.strAdditionalInfo
      , boolIsAdditionalInfoRecognized = false
      ;

    if ( typeof strAdditionalInfo === 'string' && strAdditionalInfo !== '' ) {
      var arrSubstitutions;

      switch ( strAdditionalInfo ) {
        case 'onFavorite':
          strAdditionalInfo = 'notificationFavoriteStatusSuccess';
          boolIsAdditionalInfoRecognized = true;
          break;
        case 'onFirstPlay':
          strAdditionalInfo = 'notificationPlayerStatusChangeStarted';
          boolIsAdditionalInfoRecognized = true;
          break;
        case 'onPlay':
          strAdditionalInfo = 'notificationPlayerStatusChangeResumed';
          boolIsAdditionalInfoRecognized = true;
          break;
        case 'onPause':
          strAdditionalInfo = 'notificationPlayerStatusChangeStopped';
          boolIsAdditionalInfoRecognized = true;
          break;
        case 'onMute':
          strAdditionalInfo = 'notificationButtonsMuteFeedback';
          boolIsAdditionalInfoRecognized = true;
          break;
        case 'onUnmute':
          strAdditionalInfo = 'notificationButtonsUnmuteFeedback';
          boolIsAdditionalInfoRecognized = true;
          break;
        case 'onVolumeChange':
          strAdditionalInfo = 'notificationButtonsVolumeChangeFeedback';
          arrSubstitutions = [ objData.objPlayerInfo.intVolume ];
          boolIsAdditionalInfoRecognized = true;
          break;
        default:
          objData.objStationInfo.strAdditionalInfo = ! boolExternal && ! pozitone.global.isModuleBuiltInApiCompliant( objData.objPlayerInfo.strModule, true )
              ? strAdditionalInfo
              : ''
              ;
      }

      if ( boolIsAdditionalInfoRecognized ) {
        objData.objStationInfo.strAdditionalInfo = chrome.i18n.getMessage( strAdditionalInfo, arrSubstitutions );
      }
    }

    var strModule = objData.objPlayerInfo.strModule
      , strTrackInfo = objData.objStationInfo.strTrackInfo
      , objDataToPreserve = {
          // funcShowNotification
            objData : objData
          , objSender : objSender
          , strTrackInfo : strTrackInfo
          // funcDoNot
          , strLog : strLog
        }
      ;

    if ( typeof boolExternal === 'boolean' && boolExternal ) {
      strModule += strConstGenericStringSeparator + objSender.id;
    }

    var funcShowNotification = function( objPreservedData ) {
      // Show notification if track info changed or extension asks to show it
      // again (for example, set of buttons needs to be changed)
      var strTrackInfo = objPreservedData.strTrackInfo
        , objData = objPreservedData.objData
        ;

      if (  ~~ Background.arrTrackInfoPlaceholders.indexOf( strTrackInfo )
        &&  strTrackInfo !== Background.strPreviousTrack
        ||  objData.boolDisregardSameMessage
      ) {
        // Check for changes
        Global.getAllCommands();

        Global.showNotification(
            objData.boolIsUserLoggedIn
          , objData.boolDisregardSameMessage
          , objPreservedData.objSender.tab.id
          , objData.objPlayerInfo
          , objData.objStationInfo
          , objData.strCommand || ''
          , boolExternal
          , objSender
        );

        Background.strPreviousTrack = strTrackInfo;
      }
      else {
        funcDoNot( objPreservedData );
      }
    };

    var funcDoNot = function( objPreservedData ) {
      Log.add(
          objPreservedData.strLog + strLogDoNot
        , objPreservedData.strTrackInfo
      );
    };

    Global.isModuleEnabled(
        strModule
      , objSender.tab.id
      , funcShowNotification
      , funcDoNot
      , objDataToPreserve
      , 'onMessageCallback'
      , boolExternal
    );
  };

  /**
   * A page is supported by one of the built-in modules and the module is enabled,
   * inject its files into the page.
   *
   * @type    method
   * @param   objPreservedData
   *            Contains module ID and tab ID.
   * @return  void
   **/

  Background2.prototype.injectModuleFiles = function ( objPreservedData ) {
    strLog = 'Background2.injectModuleFiles';
    Log.add( strLog, objPreservedData );

    if ( typeof objPreservedData !== 'object' || Array.isArray( objPreservedData ) ) {
      return;
    }

    var intTabId = objPreservedData.intTabId
      , strModuleId = objPreservedData.strModuleId
      ;

    if ( typeof intTabId !== 'number' || typeof strModuleId !== 'string' ) {
      return;
    }

    chrome.tabs.sendMessage(
        intTabId
      , 'Do you copy?'
      , function( miscResponse ) {
          if (  typeof miscResponse === 'undefined'
            ||  miscResponse !== 'Copy that.'
            &&  typeof miscResponse.objPozitoneApiResponse === 'undefined'
          ) {
            var objModule = Global.objModules[ strModuleId ]
              , arrCss = objModule.arrCss
              , intCss = ( typeof arrCss !== 'undefined' )
                  ? arrCss.length
                  : 0
              , arrJs = objModule.arrJs
              , intJs = ( typeof arrJs !== 'undefined' )
                  ? arrJs.length
                  : 0
              , funcCallback = function() {
                  Global.checkForRuntimeError(
                      undefined
                    , undefined
                    , { strModuleId : strModuleId }
                    , false
                  );
                }
              ;

            strLog = 'injectModuleFiles';
            Log.add( strLog, { strModuleId : strModuleId }, true );

            for ( var j = 0; j < intCss; j++ ) {
              chrome.tabs.executeScript(
                  intTabId
                , { file: arrCss[ j ], runAt: 'document_end' }
                , function() {
                    funcCallback();
                  }
              );
            }

            for ( var k = 0; k < intJs; k++ ) {
              chrome.tabs.executeScript(
                  intTabId
                , { file: arrJs[ k ], runAt: 'document_end' }
                , function() {
                    funcCallback();
                  }
              );
            }
          }
        }
    );
  };

  /**
   * A page is supported by one of the built-in modules, but the module is not enabled.
   *
   * @type    method
   * @param   objPreservedData
   *            Contains module ID and tab ID.
   * @param   strModuleId
   *            Module ID.
   * @param   objModuleSettings
   *            Module settings retrieved from Storage.
   * @return  void
   **/

  Background2.prototype.logModuleNotEnabled = function ( objPreservedData, strModuleId, objModuleSettings ) {
    if (  typeof objModuleSettings === 'object'
      &&  objModuleSettings.boolIsEnabled === false
    ) {
      // On VK, it's the same when refreshed and it's not when History API is used.
      // On OK, it's both when refreshed and it's not when History API is used.
      // On both, it's not when PoziTone is reloaded or url is "https://ok.ru/" and title is "https://ok.ru".
      var boolIsTitleSameAsUrl;

      if ( typeof objPreservedData === 'object' ) {
        var objTab = objPreservedData.objTab;

        if ( typeof objTab === 'object' ) {
          boolIsTitleSameAsUrl = ( objTab.title === objTab.url );
        }
      }

      strLog = 'logModuleNotEnabled';
      Log.add(
          strLog
        , {
              strModuleId : strModuleId
            , boolIsTitleSameAsUrl : boolIsTitleSameAsUrl
          }
        , true
      );
    }
  };

  pozitone.background = new Background2();
} )();

/* =============================================================================

  On Load

 ============================================================================ */

/**
 * Initialize
 *
 * @type    method
 * @param   No Parameters taken
 * @return  void
 **/

Background.init();
