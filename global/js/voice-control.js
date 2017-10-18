/* =============================================================================

  Product: PoziTone
  Author: PoziWorld
  Copyright: (c) 2016-2017 PoziWorld
  License: pozitone.com/license

  Table of Contents:

    VoiceControl
      _getPermissionName()
      _getApplicationName()
      _checkForPermission()
      connectNative()
      _addPortOnMessageListener()
      addPortOnDisconnectListener()
      _addPermissionsOnAddedListener()
      _updateBrowserActionContextMenuItem()
      isConnected()

 ============================================================================ */

( function() {
  'use strict';

  function VoiceControl() {
    this._port = null;

    const strPermissionName = 'nativeMessaging';
    const strApplicationName = 'com.poziworld.elf';

    /**
     * Return permission name required for voice control.
     *
     * @return {string}
     **/

    VoiceControl.prototype._getPermissionName = function () {
      return strPermissionName;
    };

    /**
     * Return application name to connect to.
     *
     * @return {string}
     **/

    VoiceControl.prototype._getApplicationName = function () {
      return strApplicationName;
    };

    this._checkForPermission();
  }

  /**
   * Check whether "management" permission had been granted.
   **/

  VoiceControl.prototype._checkForPermission = function () {
    strLog = 'VoiceControl._checkForPermission';
    Log.add( strLog );

    const _this = this;

    chrome.permissions.contains( { permissions : [ _this._getPermissionName() ] }, function( boolIsGranted ) {
      if ( boolIsGranted ) {
        Global.getStorageItems(
            StorageSync
          , strConstGeneralSettings
          , 'getGeneralSettings'
          , function( objReturn ) {
              const objGeneralSettings = objReturn[ strConstGeneralSettings ];

              if ( typeof objGeneralSettings === 'object' && ! Array.isArray( objGeneralSettings ) ) {
                const boolAutoActivateVoiceControl = objGeneralSettings.boolAutoActivateVoiceControl;

                if ( typeof boolAutoActivateVoiceControl === 'boolean' && boolAutoActivateVoiceControl ) {
                  _this.connectNative();
                }
                else {
                  _this._updateBrowserActionContextMenuItem();
                }
              }
            }
          , function (  ) {
              _this._updateBrowserActionContextMenuItem();
            }
        );
      }
      else {
        _this._addPermissionsOnAddedListener();
      }
    } );
  };

  /**
   * Callback in case of success.
   *
   * @callback VoiceControl~funcSuccessCallback
   */

  /**
   * Callback in case of error.
   *
   * @callback VoiceControl~funcErrorCallback
   */

  /**
   * Connect to the voice control application.
   *
   * @param {VoiceControl~funcSuccessCallback} [funcSuccessCallback] - Function to run if successfully connected.
   * @param {VoiceControl~funcErrorCallback} [funcErrorCallback] - Function to run if didn't connect.
   **/

  VoiceControl.prototype.connectNative = function ( funcSuccessCallback, funcErrorCallback ) {
    strLog = 'VoiceControl.connectNative';
    Log.add( strLog );

    this._port = chrome.runtime.connectNative( this._getApplicationName() );

    if ( this._port ) {
      this._addPortOnMessageListener();
      this.addPortOnDisconnectListener();

      if ( typeof funcSuccessCallback === 'function' ) {
        funcSuccessCallback();
      }
    }
    else if ( typeof funcErrorCallback === 'function' ) {
      funcErrorCallback();
    }
  };

  /**
   * Add a listener to watch for messages from the application.
   **/

  VoiceControl.prototype._addPortOnMessageListener = function () {
    strLog = 'VoiceControl._addPortOnMessageListener';
    Log.add( strLog );

    const _this = this;

    /**
     * Fired when postMessage is called by the other end of the port.
     *
     * @param {Object} objMessage - The received message.
     * @param port - The port that received the message.
     **/

    this._port.onMessage.addListener( function( objMessage, port ) {
      strLog = 'VoiceControl._addPortOnMessageListener, onMessage';
      Log.add( strLog, objMessage );

      if ( typeof objMessage !== 'object' ) {
        return;
      }

      const objVoiceControlMessage = objMessage.objVoiceControlMessage;

      if ( typeof objVoiceControlMessage !== 'object' || Array.isArray( objVoiceControlMessage ) ) {
        return;
      }

      let strCommand = objVoiceControlMessage.strCommand;

      if ( typeof strCommand !== 'string' || strCommand === '' ) {
        return;
      }

      switch ( strCommand ) {
        case 'next':
          strCommand = 'next';
          break;

        case 'previous':
          strCommand = 'previous';
          break;

        case 'pause':
        case 'play':
        case 'stop':
        case 'toggle':
          strCommand = 'playStop';
          break;

        case 'mute':
        case 'unmute':
          strCommand = 'muteUnmute';
          break;

        case 'volume down':
          strCommand = 'volumeDown';
          break;

        case 'volume up':
          strCommand = 'volumeUp';
          break;

        case 'show notification':
          strCommand = 'showNotification';
          break;

        case 'open':
          const objCommandParameters = objVoiceControlMessage.objCommandParameters;

          if ( typeof objCommandParameters !== 'object' || Global.isEmpty( objCommandParameters ) ) {
            return;
          }

          let strWebpage = objCommandParameters.strWebpage;

          if ( typeof strWebpage !== 'string' || strWebpage === '' ) {
            return;
          }

          strWebpage = strWebpage.toLowerCase();

          switch ( strWebpage ) {
            case '101.ru':
            case 'classicalradio.com':
            case 'di.fm':
            case 'google.com':
            case 'jazzradio.com':
            case 'ok.ru':
            case 'play.google.com/music':
            case 'pozitone.com':
            case 'poziworld.com':
            case 'printwasteminimizer.com':
            case 'radiotunes.com':
            case 'rockradio.com':
            case 'soundcloud.com':
            case 'vgmradio.com':
            case 'vk.com':
            case 'yandex.ru':
              _this._openWebpage( strWebpage );
              return;

              break;
          }

          break;
      }

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

        // For these, it's the same as button click
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
              /**
               * @todo Unify naming
               */
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
                      /**
                       * @todo Unify naming
                       */
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
    } );
  };

  /**
   * @callback VoiceControl~funcCallback
   */

  /**
   * Add a listener to watch for the application disconnection.
   *
   * @param {VoiceControl~funcCallback} [funcCallback] - Function to run when the application gets deactivated.
   **/

  VoiceControl.prototype.addPortOnDisconnectListener = function ( funcCallback ) {
    strLog = 'VoiceControl.addPortOnDisconnectListener';
    Log.add( strLog );

    const _this = this;

    /**
     * Fired when the port is disconnected from the other end(s).
     * runtime.lastError may be set if the port was disconnected by an error.
     * If the port is closed via disconnect, then this event is only fired on the other end.
     * This event is fired at most once.
     *
     * @param port - The port that received the message.
     **/

    this._port.onDisconnect.addListener( function( port ) {
      strLog = 'VoiceControl._addPortOnMessageListener, onDisconnect';
      Log.add( strLog );

      _this._port = null;

      if ( typeof funcCallback === 'function' ) {
        strLog = 'VoiceControl._addPortOnMessageListener, onDisconnect, callback';
        Log.add( strLog );

        funcCallback();

        return;
      }

      Global.getStorageItems(
          StorageSync
        , strConstGeneralSettings
        , 'getGeneralSettings'
        , function( objReturn ) {
            const objGeneralSettings = objReturn[ strConstGeneralSettings ];

            if ( typeof objGeneralSettings === 'object' && ! Array.isArray( objGeneralSettings ) ) {
              const boolAutoReactivateVoiceControl = objGeneralSettings.boolAutoReactivateVoiceControl;

              if ( typeof boolAutoReactivateVoiceControl === 'boolean' && boolAutoReactivateVoiceControl ) {
                _this.connectNative();
              }
            }
          }
      );
    } );
  };

  /**
   * Add a listener to watch for the appropriate permission added.
   **/

  VoiceControl.prototype._addPermissionsOnAddedListener = function () {
    strLog = 'VoiceControl._addPermissionsOnAddedListener';
    Log.add( strLog );

    const _this = this;

    /**
     * Fired when the extension acquires new permissions.
     *
     * @param {Object} objPermissions - Permissions and origins added.
     **/

    chrome.permissions.onAdded.addListener( function( objPermissions ) {
      if ( typeof objPermissions === 'object' && ! Array.isArray( objPermissions ) ) {
        const arrPermissions = objPermissions.permissions;

        // The appropriate permission has been granted
        if ( Array.isArray( arrPermissions ) && ~ arrPermissions.indexOf( _this._getPermissionName() ) ) {
          // Automatically reopen Options
          Global.setStorageItems(
              StorageLocal
            , {
                  boolOpenOptionsPageOnRestart : true
                , strOptionsPageToOpen : 'voiceControl'
              }
            , strLog + ', reopen Options'
            , function () {
                chrome.runtime.reload();
              }
          );
        }
      }
    } );
  };

  /**
   * Update voice control menu item that is shown when right-clicked on PoziTone icon next to the address bar.
   **/

  VoiceControl.prototype._updateBrowserActionContextMenuItem = function () {
    strLog = 'VoiceControl._updateBrowserActionContextMenuItem';
    Log.add( strLog );

    const _this = this;

    pozitone.background.updateBrowserActionContextMenuItem(
        'voiceControl'
      , true
      , {
            title : chrome.i18n.getMessage( 'voiceControlActivate' )
          , onclick : function() {
              _this.connectNative();
              return false;
            }
        }
    );
  };

  /**
   * Check whether PoziTone is connected to the voice control app.
   *
   * @return {Boolean}
   **/

  VoiceControl.prototype.isConnected = function () {
    strLog = 'VoiceControl.isConnected';
    Log.add( strLog );

    return !! this._port;
  };

  /**
   * On command: open webpage.
   *
   * @param {string} strName - The name of the page to open.
   **/

  VoiceControl.prototype._openWebpage = function ( strName ) {
    strLog = 'VoiceControl._openWebpage';
    Log.add( strLog );

    // Convert human-friendly name returned by the API to the module name from Global.objModules
    var objModules = {
        '101.ru' : 'ru_101'
      , 'classicalradio.com' : 'com_classicalradio'
      , 'di.fm' : 'fm_di'
      , 'jazzradio.com' : 'com_jazzradio'
      , 'ok.ru' : 'ru_ok_audio'
      , 'play.google.com/music' : 'com_google_play_music'
      , 'radiotunes.com' : 'com_radiotunes'
      , 'rockradio.com' : 'com_rockradio'
      , 'soundcloud.com' : 'com_soundcloud'
      , 'vgmradio.com' : 'com_vgmradio'
      , 'vk.com' : 'com_vk_audio'
    };

    if ( strName in objModules ) {
      Global.createTabOrUpdate( Global.objModules[ objModules[ strName ] ].strDomain );
    }
    else {
      /**
       * @todo Is this safe enough? Supposedly, strName comes from the approved list above.
       */
      Global.createTabOrUpdate( 'https://' + strName + '/' );
    }
  };

  pozitone.voiceControl = new VoiceControl();
} )();
