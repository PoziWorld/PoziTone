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
      checkOptionsPageToOpenOnRestart()
      updateBrowserActionContextMenuItem()
      addListener()
      fireCallbacks()
    On Load
      Initialize

 ============================================================================ */

( function () {
  'use strict';

  let checkedOptionsPageToReopen = false;

  setUp();

  /**
   * Make the logic readily available.
   */

  function setUp() {
    exposeApi();
  }

  /**
   * Create an instance of the Background2 API and expose it to other parts of the extension.
   */

  function exposeApi() {
    if ( typeof pozitone === 'undefined' ) {
      window.pozitone = {};
    }

    pozitone.background = new Background2();
  }

  /**
   * Some Options changes, such as language and voice control, might require an extension reload.
   * After the Options page had been closed and the extension reloaded, the Options page should get reopened.
   *
   * @param {Object} storageData
   * @param {boolean} storageData.boolOpenOptionsPageOnRestart
   * @param {string} storageData.strOptionsPageToOpen
   */

  function reopenOptionsPage( storageData ) {
    const optionsPageReopenRequested = storageData.boolOpenOptionsPageOnRestart;

    if ( poziworldExtension.utils.isType( optionsPageReopenRequested, 'boolean' ) && optionsPageReopenRequested ) {
      const pageName = storageData.strOptionsPageToOpen;

      if ( poziworldExtension.utils.isNonEmptyString( pageName ) ) {
        Global.openOptionsPage( strLog );
      }
    }
  }

  /**
   * Identify whether it had already been checked whether the Options page (and what tab/section within the page) needs to be reopened.
   *
   * @return {boolean}
   */

  function hadCheckedOptionsPageToReopen() {
    return getCheckedOptionsPageToReopen();
  }

  /**
   * Return whether the Options page (and what tab/section/“subpage” within the page) needs to be reopened.
   *
   * @return {boolean}
   */

  function getCheckedOptionsPageToReopen() {
    return checkedOptionsPageToReopen;
  }

  /**
   * Save whether the Options page (and what tab/section/“subpage” within the page) needs to be reopened.
   *
   * @param {boolean} checked
   */

  function setCheckedOptionsPageToReopen( checked ) {
    checkedOptionsPageToReopen = checked;
  }

  /**
   * @constructor
   */

  function Background2() {
    this._objCallbacks = {
        browserActionContextMenuCreated : []
    };

    /**
     * Content scripts that are default for all page watchers.
     */

    const arrDefaultContentScripts = [
      'global/js/const.js',
      'global/js/i18next/i18next.min.js',
      'global/js/i18next/i18nextBrowserLanguageDetector.min.js',
      'global/js/i18next/i18nextXHRBackend.js',
      'global/js/i18n.js',
      'global/js/utils.js',
      'global/js/global.js',
    ];

    /**
     * Return content scripts that are default for all page watchers.
     *
     * @return {string[]}
     */

    Background2.prototype.getDefaultContentScripts = function () {
      Log.add( 'pozitone.background.getDefaultContentScripts' );

      return arrDefaultContentScripts;
    };
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
                var objLogDetails = {}
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

                  if (  objSettings.hasOwnProperty( strModuleSettings )
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
        objData.objStationInfo.strAdditionalInfo = poziworldExtension.i18n.getMessage( strAdditionalInfo, arrSubstitutions );
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
              , arrJs = pozitone.background.getDefaultContentScripts().concat( objModule.arrJs )
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

  /**
   * When PoziTone restart is needed, might need to reopen the last open page.
   **/

  Background2.prototype.checkOptionsPageToOpenOnRestart = function () {
    strLog = 'Background2.checkOptionsPageToOpenOnRestart';
    Log.add( strLog );

    if ( hadCheckedOptionsPageToReopen() ) {
      return;
    }

    Global.getStorageItems(
      StorageLocal,
      [
        'boolOpenOptionsPageOnRestart',
        'strOptionsPageToOpen',
      ],
      strLog,
      reopenOptionsPage
    );

    setCheckedOptionsPageToReopen( true );
  };

  /**
   * Called when the context menu has been updated.
   *
   * @callback onContextMenuUpdatedCallback
   */

  /**
   * Update a menu item that is shown when right-clicked on PoziTone icon next to the address bar.
   *
   * @param {string} strItemId - The ID of the context menu item to update.
   * @param {Boolean} [boolIsOptionsPageRelated] - Whether the item is related to Options page.
   * @param {Object} [objProperties] - The properties to update.
   * @param {onContextMenuUpdatedCallback} [funcCallback] - The callback.
   **/

  Background2.prototype.updateBrowserActionContextMenuItem = function ( strItemId, boolIsOptionsPageRelated, objProperties, funcCallback ) {
    strLog = 'Background2.updateBrowserActionContextMenuItem';
    Log.add( strLog );

    boolIsOptionsPageRelated = typeof boolIsOptionsPageRelated === 'boolean' && boolIsOptionsPageRelated;

    /**
     * @param {Boolean} [boolAddListener] - Whether to add listener if update fails.
     */

    function update( boolAddListener ) {
      chrome.contextMenus.update(
            Background[ boolIsOptionsPageRelated
              ? 'strBrowserActionOptionsPageContextMenuIdPrefix'
              : 'strBrowserActionContextMenuIdPrefix'
            ]
          + strItemId
        , objProperties
        , function () {
            /**
             * @todo Figure out why there is no error set, when not updated on start
             */

            Global.checkForRuntimeError(
                function () {
                  onRuntimeErrorCheckComplete( boolAddListener );
                }
              , function () {
                  onRuntimeErrorCheckComplete( boolAddListener );
                }
            );
          }
      );
    }

    /**
     * @param {Boolean} [boolAddListener] - Whether to add listener if update fails.
     */

    function onRuntimeErrorCheckComplete( boolAddListener ) {
      if ( typeof boolAddListener === 'boolean' && boolAddListener ) {
        pozitone.background.addListener( 'browserActionContextMenuCreated', update );
      }

      if ( typeof funcCallback === 'function' ) {
        funcCallback();
      }
    }

    update( true );
  };

  /**
   * Called when an event occurred.
   *
   * @callback onEventCallback
   */

  /**
   * Remember what callback to fire on a certain event.
   *
   * @param {string} strEventName - The name of the event to listen to.
   * @param {onEventCallback} [funcCallback] - The callback.
   **/

  Background2.prototype.addListener = function ( strEventName, funcCallback ) {
    strLog = 'Background2.addListener';
    Log.add( strLog );

    if ( typeof strEventName === 'string' && typeof funcCallback === 'function' ) {
      this._objCallbacks[ strEventName ].push( funcCallback );
    }
  };

  /**
   * An event occurred, fire its callbacks.
   *
   * @param {string} strEventName - The name of the event occurred.
   **/

  Background2.prototype.fireCallbacks = function ( strEventName ) {
    strLog = 'Background2.fireCallbacks';
    Log.add( strLog );

    if ( typeof strEventName === 'string' ) {
      var arrThisEventCallbacks = this._objCallbacks[ strEventName ];

      for ( var i = 0, l = arrThisEventCallbacks.length; i < l; i++ ) {
        arrThisEventCallbacks[ i ]();
      }
    }
  };

  /**
   * Some Options changes, such as language and voice control, might require an extension reload.
   * Close the Options page first, then reload the extension, which should automatically reopen the Options page.
   */

  Background2.prototype.reloadExtension = function () {
    const views = chrome.extension.getViews();

    while ( views.length ) {
      const view = views.shift();

      // Close all views that are not the background (check for the presence of the Background object)
      if ( ! Boolean( view.Background ) && ! view.closed ) {
        view.close();
      }
    }

    chrome.runtime.reload();
  };
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

poziworldExtension.i18n.init()
  .then( Background.init );
