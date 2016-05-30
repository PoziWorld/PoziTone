/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2016 PoziWorld
  License                 :           pozitone.com/license
  File                    :           global/js/api.js
  Description             :           PoziTone Host API JavaScript

  Table of Contents:

    Api
      getApiVersion()
      processRequest()
      processModuleCall()
      connectModule()
      openModuleSettings()
      processMediaCall()
      sendError()
      sendResponse()
      sendCallToTab()
      createCallString()

 ============================================================================ */

( function() {
  'use strict';

  function Api() {
    var strVersion = '0.2';

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
                if ( strCall === 'module' ) {
                  this.processModuleCall( objRequest, objSender, funcSendResponse );
                }
                else if ( strCall.indexOf( 'module-settings-page/' ) === 0 ) {
                  this.openModuleSettings( objRequest, objSender, funcSendResponse, strCall );
                }
                else if ( strCall === 'media' ) {
                  this.processMediaCall( objRequest, objSender, funcSendResponse );
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
            , true
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
   * @return  void
   **/

  Api.prototype.sendCallToTab = function (
      strModuleId
    , intTabId
    , strCall
    , strCallParameter
    , funcCallback
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

  pozitone.api = new Api();
} )();
