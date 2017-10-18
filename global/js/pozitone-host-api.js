/* =============================================================================

  Product: PoziTone host API
  Author: PoziWorld
  Copyright: (c) 2016 PoziWorld
  License: pozitone.com/license

  Table of Contents:

    Api
      getApiVersion()
      processRequest()
      processModuleCall()
      connectModule()
      openModuleSettings()
      processMediaCall()
      processSettingsCall()
      getVolumeDeltaSettings()
      processVoiceControlCall()
      getVoiceControlStatus()
      changeVoiceControlStatus()
      addOnVoiceControlDeactivationListener()
      sendError()
      sendResponse()
      sendCallToTab()
      createCallString()
      isInternalCall()

 ============================================================================ */

( function() {
  'use strict';

  function Api() {
    var strVersion = '0.5.0';

    this.strCallDivider = '/';

    /**
     * Return API version.
     *
     * @type    method
     * @param   No Parameters Taken
     * @return  string
     **/

    Api.prototype.getApiVersion = function () {
      return strVersion;
    };
  }

  /**
   * Process PoziTone API request.
   *
   * @type    method
   * @param   objMessage
   *            Message received.
   * @param   objSender
   *            Sender of a message.
   * @param   funcSendResponse
   *            Used to send a response.
   * @return  void
   **/

  Api.prototype.processRequest = function ( objMessage, objSender, funcSendResponse ) {
    strLog = 'Api.processRequest';
    Log.add(
        strLog
      , {
            objMessage : objMessage
          , objSender : objSender
        }
    );

    var objRequest = objMessage.objPozitoneApiRequest;

    if ( typeof objRequest === 'object' && ! Array.isArray( objRequest ) ) {
      if ( ! Global.isEmpty( objRequest ) ) {
        var strCall = objRequest.strCall;

        if ( typeof strCall === 'string' ) {
          if ( strCall !== '' ) {
            var strMethod = objRequest.strMethod;

            if ( typeof strMethod === 'string' ) {
              if ( strMethod !== '' ) {
                /**
                 * @todo var arrCall = strCall.split( this.strCallDivider );
                 */

                if ( strCall === 'module' ) {
                  this.processModuleCall( objRequest, objSender, funcSendResponse );
                }
                else if ( strCall.indexOf( 'module-settings-page/' ) === 0 ) {
                  this.openModuleSettings( objRequest, objSender, funcSendResponse, strCall );
                }
                else if ( strCall === 'media' ) {
                  this.processMediaCall( objRequest, objSender, funcSendResponse );
                }
                else if ( strCall.indexOf( 'settings/' ) === 0 ) {
                  this.processSettingsCall( objRequest, objSender, funcSendResponse, strCall );
                }
                else if ( strCall.indexOf( 'voice-control/' ) === 0 ) {
                  this.processVoiceControlCall( objRequest, objSender, funcSendResponse, strCall );
                }
                else {
                  this.sendError( funcSendResponse, 4 );
                }
              }
              else {
                this.sendError( funcSendResponse, 5 );
              }
            }
            else {
              this.sendError( funcSendResponse, 1, 'strMethod', 'string' );
            }
          }
          else {
            this.sendError( funcSendResponse, 3 );
          }
        }
        else {
          this.sendError( funcSendResponse, 1, 'strCall', 'string' );
        }
      }
      else {
        this.sendError( funcSendResponse, 2 );
      }
    }
    else if ( typeof objRequest !== 'undefined' ) {
      this.sendError( funcSendResponse, 1, 'objPozitoneApiRequest', 'object' );
    }
    else {
      this.sendError( funcSendResponse, 0 );
    }
  };

  /**
   * Process PoziTone API 'module' call.
   *
   * @type    method
   * @param   objRequest
   *            API request properties object.
   * @param   objSender
   *            Sender of a message.
   * @param   funcSendResponse
   *            Used to send a response.
   * @return  void
   **/

  Api.prototype.processModuleCall = function ( objRequest, objSender, funcSendResponse ) {
    strLog = 'Api.processModuleCall';
    Log.add(
        strLog
      , {
            objRequest : objRequest
          , objSender : objSender
        }
    );

    var strMethod = objRequest.strMethod;

    if ( strMethod === 'POST' ) {
      var objData = objRequest.objData;

      if ( typeof objData === 'object' && ! Array.isArray( objData ) ) {
        if ( ! Global.isEmpty( objData ) ) {
          this.connectModule( objData, objSender, funcSendResponse );
        }
        else {
          this.sendError( funcSendResponse, 7 );
        }
      }
      else {
        this.sendError( funcSendResponse, 1, 'objData', 'object' );
      }
    }
    else {
      this.sendError( funcSendResponse, 6, strMethod );
    }
  };

  /**
   * Connect module to PoziTone.
   *
   * @type    method
   * @param   objSettings
   *            Module settings.
   * @param   objSender
   *            Sender of a message.
   * @param   funcSendResponse
   *            Used to send a response.
   * @return  void
   **/

  Api.prototype.connectModule = function ( objSettings, objSender, funcSendResponse ) {
    var self = this;

    strLog = 'Api.connectModule';
    Log.add( strLog, objSettings );

    function funcSuccessCallback() {
      self.sendResponse(
          funcSendResponse
        , {
              strMessage : 'ConnectModuleSuccess'
            , intStatusCode : 201
            , strApiVersion : self.getApiVersion()
          }
      );
    }

    function funcErrorCallback() {
      self.sendResponse(
          funcSendResponse
        , {
              strMessage : 'ConnectModuleError'
            , intStatusCode : 500
            , strApiVersion : self.getApiVersion()
          }
      );
    }

    function funcHadBeenConnectedCallback() {
      self.sendResponse(
          funcSendResponse
        , {
              strMessage : 'ConnectModuleHadBeenConnected'
            , intStatusCode : 409
            , strApiVersion : self.getApiVersion()
          }
      );
    }

    // In case the external extension supports multiple players at once
    for ( var strModuleSettings in objSettings ) {
      var objModuleSettings = objSettings[ strModuleSettings ];

      if (  objSettings.hasOwnProperty( strModuleSettings )
        &&  typeof objModuleSettings === 'object'
        &&  ! Array.isArray( objModuleSettings )
      ) {
        // TODO: Accept a URL instead and change it to a proper format
        if (  strModuleSettings.indexOf( strConstSettingsPrefix ) !== 0
          ||  ! /^([A-Za-z0-9_])\w+$/g.test( strModuleSettings )
        ) {
          self.sendError( funcSendResponse, 0 );

          return;
        }

        var boolIsEnabled = objModuleSettings.boolIsEnabled
          , boolShowNotificationWhenMuted = objModuleSettings.boolShowNotificationWhenMuted
          ;

        if ( typeof boolIsEnabled === 'undefined' ) {
          self.sendError( funcSendResponse, 8, 'boolIsEnabled' );

          return;
        }
        else if ( typeof boolIsEnabled !== 'boolean' ) {
          self.sendError( funcSendResponse, 1, 'boolIsEnabled', 'boolean' );

          return;
        }
        else if ( typeof boolShowNotificationWhenMuted === 'undefined' ) {
          self.sendError( funcSendResponse, 8, 'boolShowNotificationWhenMuted' );

          return;
        }
        else if ( typeof boolShowNotificationWhenMuted !== 'boolean' ) {
          self.sendError( funcSendResponse, 1, 'boolShowNotificationWhenMuted', 'boolean' );

          return;
        }
        else {
          // TODO: Add more error handling
        }

        var strModuleSettingsPlusId =
                strModuleSettings
              + strConstExternalModuleSeparator
              + objSender.id
          , objModuleSettingsWrapper = {}
          ;

        objModuleSettingsWrapper[ strModuleSettingsPlusId ] =
          objModuleSettings;

        Background.setDefaults(
            StorageLocal
          , objModuleSettingsWrapper
          , 'local'
          , undefined
          , funcSuccessCallback
          , funcErrorCallback
          , funcHadBeenConnectedCallback
        );
      }
    }
  };

  /**
   * Open module settings subpage in PoziTone Options page.
   *
   * @type    method
   * @param   objRequest
   *            API request properties object.
   * @param   objSender
   *            Sender of a message.
   * @param   funcSendResponse
   *            Used to send a response.
   * @param   strCall
   *            PoziTone API "URL".
   * @return  void
   **/

  Api.prototype.openModuleSettings = function ( objRequest, objSender, funcSendResponse, strCall ) {
    strLog = 'Api.openModuleSettings';
    Log.add(
        strLog
      , {
            objRequest : objRequest
          , objSender : objSender
        }
    );

    var strMethod = objRequest.strMethod;

    if ( strMethod === 'GET' ) {
      var strModuleId = strCall.replace( 'module-settings-page/', '' )
        , strFullModuleId = strModuleId + strConstGenericStringSeparator + objSender.id
        , strModuleSettingsObjName = strConstSettingsPrefix + strFullModuleId
        ;

      Global.getStorageItems(
          StorageLocal
        , strModuleSettingsObjName
        , 'Api.openModuleSettings.getModuleSettings'
        , function( objReturn ) {
            var objModuleSettings = objReturn[ strModuleSettingsObjName ];

            if ( typeof objModuleSettings === 'object'
              && ! Array.isArray( objModuleSettings )
              && ! Global.isEmpty( objModuleSettings )
            ) {
              var objItems = { strOptionsPageToOpen : 'settings/modules/external/' + strFullModuleId };

              Global.setStorageItems(
                  StorageLocal
                , objItems
                , 'Api.openModuleSettings.setOptionsPageToOpen'
                , function() {
                    Global.openOptionsPage( strLog );
                  }
                , undefined
                , objItems
                , true // TODO: Add to UEIPPS
              );
            }
            else {
              // TODO: Add error handling
            }
          }
      );
    }
    else {
      this.sendError( funcSendResponse, 6, strMethod );
    }
  };

  /**
   * Process PoziTone API 'media' call.
   *
   * @type    method
   * @param   objRequest
   *            API request properties object.
   * @param   objSender
   *            Sender of a message.
   * @param   funcSendResponse
   *            Used to send a response.
   * @return  void
   **/

  Api.prototype.processMediaCall = function ( objRequest, objSender, funcSendResponse ) {
    strLog = 'Api.processMediaCall';
    Log.add(
        strLog
      , {
            objRequest : objRequest
          , objSender : objSender
        }
    );

    var strMethod = objRequest.strMethod;

    if ( strMethod === 'POST' ) {
      var objData = objRequest.objData;

      if ( typeof objData === 'object' && ! Array.isArray( objData ) ) {
        if ( ! Global.isEmpty( objData ) ) {
          pozitone.background.processMediaNotificationRequest(
              objData
            , objSender
            , funcSendResponse
            , objSender.id !== chrome.runtime.id
          );
        }
        else {
          this.sendError( funcSendResponse, 7 );
        }
      }
      else {
        this.sendError( funcSendResponse, 1, 'objData', 'object' );
      }
    }
    else {
      this.sendError( funcSendResponse, 6, strMethod );
    }
  };

  /**
   * Process PoziTone API 'settings' call.
   *
   * @type    method
   * @param   objRequest
   *            API request properties object.
   * @param   objSender
   *            Sender of a message.
   * @param   funcSendResponse
   *            Used to send a response.
   * @param   strCall
   *            PoziTone API "URL".
   * @return  void
   **/

  Api.prototype.processSettingsCall = function ( objRequest, objSender, funcSendResponse, strCall ) {
    strLog = 'Api.processSettingsCall';
    Log.add(
        strLog
      , {
            objRequest : objRequest
          , objSender : objSender
        }
    );

    var strMethod = objRequest.strMethod;

    if ( strMethod === 'GET' ) {
      if ( typeof strCall === 'string' ) {
        if ( strCall !== '' ) {
          var arrCall = strCall.split( this.strCallDivider );
          var strModuleId = arrCall[ 1 ];

          if ( typeof strModuleId === 'string' ) {
            if ( strModuleId !== 'general' ) {
              if ( strModuleId !== '' ) {
                var boolIsModuleBuiltIn = pozitone.global.isModuleBuiltIn( strModuleId );
                var boolIsModuleExternal = pozitone.global.isModuleExternal( strModuleId );

                // TODO: Create isModuleRecognized method
                if ( boolIsModuleBuiltIn || boolIsModuleExternal ) {
                  var strSpecificSettings = arrCall[ 2 ];

                  if ( typeof strSpecificSettings === 'string' && strSpecificSettings !== '' ) {
                    if ( strSpecificSettings === 'volume-delta' ) {
                      this.getVolumeDeltaSettings( objRequest, objSender, funcSendResponse, strModuleId, boolIsModuleBuiltIn );
                    }
                    else {
                      this.sendError( funcSendResponse, 4 );
                    }
                  }
                  else {
                    this.sendError( funcSendResponse, 4 );
                  }
                }
                else {
                  this.sendError( funcSendResponse, 4 );
                }
              }
              else {
                this.sendError( funcSendResponse, 8, 'strModuleId' );
              }
            }
            else {
              this.sendError( funcSendResponse, 4 );
            }
          }
          else {
            this.sendError( funcSendResponse, 4 );
          }
        }
        else {
          this.sendError( funcSendResponse, 8, 'strCall' );
        }
      }
      else {
        this.sendError( funcSendResponse, 1, 'strCall', 'string' );
      }
    }
    else {
      this.sendError( funcSendResponse, 6, strMethod );
    }
  };

  /**
   * Get module settings specific to volume delta.
   *
   * @type    method
   * @param   objRequest
   *            API request properties object.
   * @param   objSender
   *            Sender of a message.
   * @param   funcSendResponse
   *            Used to send a response.
   * @param   strModuleId
   *            ID of the module the settings are being requested for.
   * @param   boolIsModuleBuiltIn
   *            Whether the module is built-in or external.
   * @return  void
   **/

  Api.prototype.getVolumeDeltaSettings = function (
      objRequest
    , objSender
    , funcSendResponse
    , strModuleId
    , boolIsModuleBuiltIn
  ) {
    strLog = 'Api.getVolumeDeltaSettings';
    Log.add(
        strLog
      , {
            objRequest : objRequest
          , objSender : objSender
          , strModuleId : strModuleId
          , boolIsModuleBuiltIn : boolIsModuleBuiltIn
        }
    );

    if ( typeof strModuleId === 'string' ) {
      var promiseGetGeneralSettings = new Promise( function( funcResolve, funcReject ) {
        // TODO: Create getGeneralSettings method
        Global.getStorageItems(
            StorageSync
          , strConstGeneralSettings
          , 'getGeneralSettings'
          , function( objReturn ) {
              var objGeneralSettings = objReturn[ strConstGeneralSettings ];

              if ( typeof objGeneralSettings === 'object' && ! Array.isArray( objGeneralSettings ) ) {
                funcResolve( objGeneralSettings );
              }
              else {
                funcReject();
              }
            }
          , funcReject
        );
      } );

      var strModuleSettings = strConstSettingsPrefix + strModuleId;

      if ( ! boolIsModuleBuiltIn ) {
        strModuleSettings += strConstGenericStringSeparator + objSender.id;
      }

      var promiseGetModuleSettings = new Promise( function( funcResolve, funcReject ) {
        // TODO: Create getModuleSettings method
        Global.getStorageItems(
            boolIsModuleBuiltIn ? StorageSync : StorageLocal
          , strModuleSettings
          , 'getModuleSettings'
          , function( objReturn ) {
              var objModuleSettings = objReturn[ strModuleSettings ];

              if ( typeof objModuleSettings === 'object' && ! Array.isArray( objModuleSettings ) ) {
                funcResolve( objModuleSettings );
              }
              else {
                funcReject();
              }
            }
          , funcReject
        );
      } );

      Promise
        .all( [ promiseGetGeneralSettings, promiseGetModuleSettings ] )
        .then( function ( arrSettings ) {
          var objGeneralSettings = arrSettings[ 0 ];
          var objModuleSettings = arrSettings[ 1 ];

          // Use general delta if set to do so, use player's own delta otherwise
          if (  typeof objModuleSettings === 'object'
            &&  typeof objModuleSettings.boolUseGeneralVolumeDelta === 'boolean'
          ) {
            if (  objModuleSettings.boolUseGeneralVolumeDelta
              &&  typeof objGeneralSettings === 'object'
            ) {
              var intGeneralVolumeDelta = objGeneralSettings.intVolumeDelta;

              if (  typeof intGeneralVolumeDelta === 'number'
                &&  intGeneralVolumeDelta > 0
              ) {
                funcSendResponse( intGeneralVolumeDelta );
              }
            }
            else {
              var intModuleVolumeDelta = objModuleSettings.intVolumeDelta;

              if (  typeof intModuleVolumeDelta === 'number'
                &&  intModuleVolumeDelta > 0
              ) {
                funcSendResponse( intModuleVolumeDelta );
              }
            }
          }
        } )
        ;
    }
    else {
      this.sendError( funcSendResponse, 1, 'strModuleId', 'string' );
    }
  };

  /**
   * Used to send a response.
   *
   * @callback Api~funcSendResponse
   */

  /**
   * Process PoziTone API 'voice-control' call.
   *
   * @param {Object} objRequest - API request properties object.
   * @param {Object} objSender - Sender of a message.
   * @param {Api~funcSendResponse} funcSendResponse - Used to send a response.
   * @param {string} strCall - PoziTone API "URL".
   **/

  Api.prototype.processVoiceControlCall = function ( objRequest, objSender, funcSendResponse, strCall ) {
    strLog = 'Api.processVoiceControlCall';
    Log.add(
        strLog
      , {
            objRequest : objRequest
          , objSender : objSender
        }
    );

    var strMethod = objRequest.strMethod;
    var arrCall;
    var strCommand;

    if ( strMethod === 'GET' ) {
      if ( typeof strCall === 'string' ) {
        if ( strCall !== '' ) {
          arrCall = strCall.split( this.strCallDivider );
          strCommand = arrCall[ 1 ];
          var strSubcommand = arrCall[ 2 ];

          if ( typeof strCommand === 'string' && strCommand !== '' ) {
            if ( strCommand === 'status' ) {
              if ( typeof strSubcommand === 'string' && strSubcommand !== '' ) {
                if ( strSubcommand === 'deactivation' ) {
                  this.addOnVoiceControlDeactivationListener( objRequest, objSender, funcSendResponse );
                }
                else {
                  this.sendError( funcSendResponse, 4 );
                }
              }
              else {
                this.getVoiceControlStatus( objRequest, objSender, funcSendResponse );
              }
            }
            else {
              this.sendError( funcSendResponse, 4 );
            }
          }
          else {
            this.sendError( funcSendResponse, 4 );
          }
        }
        else {
          this.sendError( funcSendResponse, 8, 'strCall' );
        }
      }
      else {
        this.sendError( funcSendResponse, 1, 'strCall', 'string' );
      }
    }
    else if ( strMethod === 'POST' ) {
      var objData = objRequest.objData;

      if ( typeof objData === 'object' && ! Array.isArray( objData ) ) {
        if ( ! Global.isEmpty( objData ) ) {
          if ( typeof strCall === 'string' ) {
            if ( strCall !== '' ) {
              arrCall = strCall.split( this.strCallDivider );
              strCommand = arrCall[ 1 ];

              if ( typeof strCommand === 'string' && strCommand !== '' ) {
                if ( strCommand === 'status' ) {
                  this.changeVoiceControlStatus( objData, objSender, funcSendResponse );
                }
                else {
                  this.sendError( funcSendResponse, 4 );
                }
              }
              else {
                this.sendError( funcSendResponse, 4 );
              }
            }
            else {
              this.sendError( funcSendResponse, 8, 'strCall' );
            }
          }
          else {
            this.sendError( funcSendResponse, 1, 'strCall', 'string' );
          }
        }
        else {
          this.sendError( funcSendResponse, 7 );
        }
      }
      else {
        this.sendError( funcSendResponse, 1, 'objData', 'object' );
      }
    }
    else {
      this.sendError( funcSendResponse, 6, strMethod );
    }
  };

  /**
   * Get status of voice control: whether it's enabled/allowed and currently connected.
   *
   * @param {Object} objRequest - API request properties object.
   * @param {Object} objSender - Sender of a message.
   * @param {Api~funcSendResponse} funcSendResponse - Used to send a response.
   **/

  Api.prototype.getVoiceControlStatus = function ( objRequest, objSender, funcSendResponse ) {
    strLog = 'Api.getVoiceControlStatus';
    Log.add(
        strLog
      , {
            objRequest : objRequest
          , objSender : objSender
        }
    );

    var promiseGetGeneralSettings = new Promise( function( funcResolve, funcReject ) {
      /**
       * @todo Create getGeneralSettings method
       */

      Global.getStorageItems(
          StorageSync
        , strConstGeneralSettings
        , 'getGeneralSettings'
        , function( objReturn ) {
            var objGeneralSettings = objReturn[ strConstGeneralSettings ];

            if ( typeof objGeneralSettings === 'object' && ! Array.isArray( objGeneralSettings ) ) {
              funcResolve( objGeneralSettings );
            }
            else {
              funcReject();
            }
          }
        , funcReject
      );
    } );

    promiseGetGeneralSettings
      .then( function ( objGeneralSettings ) {
        funcSendResponse( {
            boolEnableVoiceControl : objGeneralSettings.boolEnableVoiceControl
          , boolIsConnected : pozitone.voiceControl.isConnected()
        } );
      } )
      .catch( function () {
        /**
         * @todo Send error
         */
      } )
      ;
  };

  /**
   * Get status of voice control: whether it's enabled/allowed and currently connected.
   *
   * @param {Object} objStatus - Object containing properties to change.
   * @param {Object} objSender - Sender of a message.
   * @param {Api~funcSendResponse} funcSendResponse - Used to send a response.
   **/

  Api.prototype.changeVoiceControlStatus = function ( objStatus, objSender, funcSendResponse ) {
    strLog = 'Api.changeVoiceControlStatus';
    Log.add(
        strLog
      , {
            objStatus : objStatus
          , objSender : objSender
        }
    );

    if ( ! this.isInternalCall( objSender ) ) {
      return;
    }

    var boolIsConnected = objStatus.boolIsConnected;

    if ( typeof boolIsConnected === 'boolean' && boolIsConnected ) {
      pozitone.voiceControl.connectNative(
          function () {
            funcSendResponse( true );
          }
        , function () {
            funcSendResponse( false );
          }
      );
    }
  };

  /**
   * Notify when voice control app gets shut down.
   *
   * @param {Object} objRequest - API request properties object.
   * @param {Object} objSender - Sender of a message.
   * @param {Api~funcSendResponse} funcSendResponse - Used to send a response.
   **/

  Api.prototype.addOnVoiceControlDeactivationListener = function ( objRequest, objSender, funcSendResponse ) {
    strLog = 'Api.addOnVoiceControlDeactivationListener';
    Log.add(
        strLog
      , {
            objRequest : objRequest
          , objSender : objSender
        }
    );

    pozitone.voiceControl.addPortOnDisconnectListener( function () {
      // By the time this gets called, the messaging port might have got disconnected.
      // For example, the page got closed.
      try {
        funcSendResponse();
      }
      catch( objError ) {
        strLog = 'Api.addOnVoiceControlDeactivationListener, callback, disconnected port';
        Log.add(
            strLog
          , {
                objRequest : objRequest
              , objSender : objSender
              , objError : objError
            }
        );
      }
    } );
  };

  /**
   * Send PoziTone API request error to the sender.
   *
   * @type    method
   * @param   funcSendResponse
   *            Used to send a response.
   * @param   intErrorCode
   *            API error code.
   * @param   strErrorMessageArg1
   *            Optional. Argument to be a part of the error message.
   * @param   strErrorMessageArg2
   *            Optional. Argument to be a part of the error message.
   * @return  void
   **/

  Api.prototype.sendError = function (
      funcSendResponse
    , intErrorCode
    , strErrorMessageArg1
    , strErrorMessageArg2
  ) {
    var objErrorMessages = {
            0 : 'UnrecognizedMessage'
          , 1 : 'TypeofMismatch'
          , 2 : 'RequestObjectCantBeEmpty'
          , 3 : 'CallNotSpecified'
          , 4 : 'CallUnknown'
          , 5 : 'MethodNotSpecified'
          , 6 : 'MethodNotSupported'
          , 7 : 'DataObjectCantBeEmpty'
          , 8 : 'MissingRequiredParameter'
        }
      , objError = {
            intErrorCode : intErrorCode
          , strMessage : 'Error' + objErrorMessages[ intErrorCode ]
          , arrMessageArguments : [ strErrorMessageArg1, strErrorMessageArg2 ]
          , intStatusCode : 400
          , strApiVersion : this.getApiVersion()
        }
      ;

    strLog = 'Api.sendError';
    Log.add( strLog, objError );

    this.sendResponse( funcSendResponse, objError );
  };

  /**
   * Send response to the sender of PoziTone API request.
   *
   * @type    method
   * @param   funcSendResponse
   *            Used to send a response.
   * @param   objResponseDetails
   *            Optional. Argument to be a part of the error message.
   * @return  void
   **/

  Api.prototype.sendResponse = function ( funcSendResponse, objResponseDetails ) {
    strLog = 'Api.sendResponse';
    Log.add( strLog, objResponseDetails );

    if ( typeof objResponseDetails !== 'object' || Array.isArray( objResponseDetails ) ) {
      // TODO: Send 500
      return;
    }

    var intStatusCode = objResponseDetails.intStatusCode;

    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Response_codes
    if ( typeof intStatusCode !== 'number' || intStatusCode < 100 || intStatusCode > 599 ) {
      // TODO: Send 500
      return;
    }

    var arrMessageArguments = objResponseDetails.arrMessageArguments;

    objResponseDetails.strVersion = this.getApiVersion();
    objResponseDetails.strStatusText = chrome.i18n.getMessage( 'apiStatusCode' + intStatusCode );
    objResponseDetails.strMessage = chrome.i18n.getMessage(
        'api' + objResponseDetails.strMessage
      , arrMessageArguments
    );

    // Only used for constructing error message
    if ( Array.isArray( arrMessageArguments ) ) {
      delete objResponseDetails.arrMessageArguments;
    }

    funcSendResponse( { objPozitoneApiResponse : objResponseDetails } );
  };

  /**
   * Send PoziTone API 'button' or 'command' call to the tab.
   *
   * @type    method
   * @param   strModuleId
   *            Target extension module ID.
   * @param   intTabId
   *            Target tab ID.
   * @param   strCall
   *            Specify call being sent.
   * @param   strCallParameter
   *            Button clicked.
   * @param   funcCallback
   *            Optional. Function to call on response.
   * @param   boolIsExternal
   *            Optional. Whether the request is sent from another extension/app.
   * @return  void
   **/

  Api.prototype.sendCallToTab = function (
      strModuleId
    , intTabId
    , strCall
    , strCallParameter
    , funcCallback
    , boolIsExternal
  ) {
    strLog = 'Api.sendCallToTab';
    Log.add(
        strLog
      , {
            strModuleId : strModuleId
          , intTabId : intTabId
          , strCall : strCall
          , strCallParameter : strCallParameter
          , funcCallback : funcCallback
        }
    );

    if ( boolIsExternal || pozitone.global.isModuleExternal( strModuleId ) ) {
      var arrModuleId = strModuleId.split( strConstNotificationIdSeparator )
        , intModuleIdLen = arrModuleId.length
        , strExtensionId = arrModuleId[ intModuleIdLen - 1 ]
        ;

      chrome.runtime.sendMessage(
          strExtensionId
        , {
            objPozitoneApiRequest : {
                strVersion : this.getApiVersion()
              , strCall : this.createCallString( [ 'tab', intTabId, strCall, strCallParameter ] )
              , strMethod : 'GET'
            }
          }
        , function ( objResponse ) {
            if ( typeof funcCallback === 'function' && typeof objResponse === 'object' ) {
              funcCallback( objResponse, true, { id : strExtensionId } );
            }
          }
      );
    }
    else {
      chrome.tabs.sendMessage(
          intTabId
        , {
            objPozitoneApiRequest : {
                strVersion : this.getApiVersion()
              , strCall : this.createCallString( [ strCall, strCallParameter ] )
              , strMethod : 'GET'
            }
          }
        , function ( objResponse ) {
            if ( typeof funcCallback === 'function' && typeof objResponse === 'object' ) {
              funcCallback( objResponse, false );
            }
          }
      );
    }
  };

  /**
   * Provide array of call parameters, get call string.
   *
   * @type    method
   * @param   arrCallParameters
   *            Array of call parameters.
   * @return  string
   **/

  Api.prototype.createCallString = function ( arrCallParameters ) {
    strLog = 'Api.createCallString';
    Log.add( strLog, { arrCallParameters : arrCallParameters } );

    return arrCallParameters.join( this.strCallDivider );
  };

  /**
   * Check whether the call was triggered by some PoziTone extension page.
   *
   * @param {Object} objSender - Sender of a message.
   * @return {string}
   **/

  Api.prototype.isInternalCall = function ( objSender ) {
    strLog = 'Api.isInternalCall';
    Log.add( strLog, objSender );

    return objSender.id === strConstExtensionId && objSender.url.indexOf( 'chrome-extension://' + strConstExtensionId ) === 0;
  };

  pozitone.api = new Api();
} )();
