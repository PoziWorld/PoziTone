/* =============================================================================

  Product: PoziTone module SDK
  Author: PoziWorld
  Copyright: (c) 2016 PoziWorld
  License: pozitone.com/license

  Table of Contents:

    Sdk
      getSdkVersion()
      init()
      connectModule()
      onConnectModuleResponse()
      openModuleSettings()
      sendMediaEvent()
      sendMessage()
      processRequest()
      forwardCallToTab()
      processButtonCall()
      processCommandCall()
      createCallString()
      sendError()
      sendResponse()
      setMediaInfo()
      convertImageSrcToDataUrl()
      convertVolumeToPercent()
      convertPercentToVolume()
      changeVolume()
      getVolumeDeltaSettings()
      getVoiceControlStatus()
      activateVoiceControl()
      addOnVoiceControlDeactivationListener()
      isEmpty()

 ============================================================================ */

( function() {
  'use strict';

  function Sdk() {
    var strVersion = '1.0.1'; // semver.org

    this.strMediaInfoDivider = ' – ';
    this.strCallDivider = '/';
    this.strTriggerPlayerActionMethodPrefix = 'triggerPlayerAction_';

    /**
     * Return SDK version.
     *
     * @return {string}
     **/

    Sdk.prototype.getSdkVersion = function () {
      return strVersion;
    };
  }

  /**
   * Initialize.
   *
   * @type    method
   * @param   strPozitoneEdition
   *            PoziTone edition (alpha, beta, stable, test).
   * @param   pageWatcher
   *            Optional. Save PageWatcher instance.
   * @param   boolUseOperaAddonId
   *            Optional. IDs are different for Opera and Yandex.
   * @return  void
   **/

  Sdk.prototype.init = function ( strPozitoneEdition, pageWatcher, boolUseOperaAddonId ) {
    var objPozitoneEditions = {
          'built-in' : ''
        , 'test' : 'ioiggdgamcfglpihfidbphgoofpmncfi'
      };

    // Not Opera or Yandex
    if ( typeof boolUseOperaAddonId !== 'boolean' || ! boolUseOperaAddonId ) {
      objPozitoneEditions[ 'alpha' ] = 'lbjkjmmcckjjijnnhdabbnkddgmpinhc';
      objPozitoneEditions[ 'beta' ] = 'hfdnjjobhcbkciapachaegijeednggeh';
      objPozitoneEditions[ 'stable' ] = 'bdglbogiolkffcmojmmkipgnpkfipijm';
    }
    // Opera or Yandex
    else {
      objPozitoneEditions[ 'stable' ] = 'bnmpcdcpmgfekpcekglbeendkjkflldd';
    }

    if ( typeof strPozitoneEdition !== 'string'
      || typeof objPozitoneEditions[ strPozitoneEdition ] !== 'string'
    ) {
      strPozitoneEdition = 'test';
    }

    var strPozitoneId = objPozitoneEditions[ strPozitoneEdition ];

    this.strPozitoneId = strPozitoneId === ''
                            ? null
                            : strPozitoneId
                            ;
    this.pageWatcher = pageWatcher;
  };

  /**
   * Send request to PoziTone to connect the module.
   *
   * @type    method
   * @param   objSettings
   *            Module settings.
   * @param   funcSuccessCallback
   *            Optional. Function to run on success.
   * @param   funcErrorCallback
   *            Optional. Function to run on error.
   * @return  void
   **/

  Sdk.prototype.connectModule = function ( objSettings, funcSuccessCallback, funcErrorCallback ) {
    var self = this;

    self.sendMessage(
        {
          objPozitoneApiRequest : {
              strVersion : self.getSdkVersion()
            , strCall : 'module'
            , strMethod : 'POST'
            , objData : objSettings
          }
        }
      , function ( objResponse ) {
          // PoziTone is not found
          if ( typeof objResponse !== 'object' || Array.isArray( objResponse ) ) {
            self.onConnectModuleResponse( funcErrorCallback, objResponse, 404 );

            return;
          }

          objResponse = objResponse.objPozitoneApiResponse;

          // Bad response (treat as bad request)
          if ( typeof objResponse !== 'object' || Array.isArray( objResponse ) ) {
            self.onConnectModuleResponse( funcErrorCallback, objResponse, 400 );

            return;
          }

          var intStatusCode = objResponse.intStatusCode;

          // https://developer.mozilla.org/en-US/docs/Web/HTTP/Response_codes
          if ( typeof intStatusCode !== 'number' || intStatusCode < 100 || intStatusCode > 399 ) {
            self.onConnectModuleResponse(
                funcErrorCallback
              , objResponse
              , intStatusCode
              , objResponse.strApiVersion
            );
          }
          else {
            self.onConnectModuleResponse(
                funcSuccessCallback
              , objResponse
              , intStatusCode
              , objResponse.strApiVersion
            );
          }
        }
    );
  };

  /**
   * When there is an error connecting the module or
   * the module has been successfully connected.
   *
   * @type    method
   * @param   funcCallback
   *            Function to run.
   * @param   objResponse
   *            Response object.
   * @param   intStatusCode
   *            Response code as defined at
   *            https://developer.mozilla.org/en-US/docs/Web/HTTP/Response_codes
   * @param   strApiVersion
   *            Optional. PoziTone Host API version
   * @return  void
   **/

  Sdk.prototype.onConnectModuleResponse = function (
      funcCallback
    , objResponse
    , intStatusCode
    , strApiVersion
  ) {
    if ( typeof funcCallback === 'function' ) {
      funcCallback( objResponse, intStatusCode, strApiVersion );
    }
  };

  /**
   * Open module settings subpage in PoziTone Options page.
   *
   * @type    method
   * @param   strModuleId
   *            Module ID.
   * @param   funcSuccessCallback
   *            Optional. Function to run on success.
   * @param   funcErrorCallback
   *            Optional. Function to run on error.
   * @return  void
   **/

  Sdk.prototype.openModuleSettings = function ( strModuleId, funcSuccessCallback, funcErrorCallback ) {
    var self = this;

    self.sendMessage(
        {
          objPozitoneApiRequest : {
              strVersion : self.getSdkVersion()
            , strCall : 'module-settings-page/' + strModuleId
            , strMethod : 'GET'
          }
        }
      , function ( objResponse ) {
          // TODO: Add success and error handlers
        }
    );
  };

  /**
   * Send media event information to PoziTone.
   *
   * @type    method
   * @param   objData
   *            Media-related data.
   * @param   funcSuccessCallback
   *            Optional. Function to run on success.
   * @param   funcErrorCallback
   *            Optional. Function to run on error.
   * @return  void
   **/

  Sdk.prototype.sendMediaEvent = function ( objData, funcSuccessCallback, funcErrorCallback ) {
    var self = this;

    self.sendMessage(
        {
          objPozitoneApiRequest : {
              strVersion : self.getSdkVersion()
            , strCall : 'media'
            , strMethod : 'POST'
            , objData : objData
          }
        }
      , function ( objResponse ) {
          // TODO: Define what success and error are
          if ( typeof funcSuccessCallback === 'function' ) {
            funcSuccessCallback( objResponse );
          }

          if ( typeof funcErrorCallback === 'function' ) {
            funcErrorCallback( objResponse );
          }
        }
    );
  };

  /**
   * Send message via chrome.runtime.sendMessage.
   *
   * @type    method
   * @param   objMessage
   *            Message to send.
   * @param   funcCallback
   *            Optional. Function to run on response.
   * @return  void
   **/

  Sdk.prototype.sendMessage = function ( objMessage, funcCallback ) {
    var strPozitoneId = this.strPozitoneId;

    // External modules
    if ( strPozitoneId ) {
      chrome.runtime.sendMessage(
          strPozitoneId
        , objMessage
        , function ( objResponse ) {
            if ( typeof funcCallback === 'function' ) {
              funcCallback( objResponse );
            }
          }
      );
    }
    // Built-in modules
    else {
      chrome.runtime.sendMessage(
          objMessage
        , function ( objResponse ) {
            if ( typeof funcCallback === 'function' ) {
              funcCallback( objResponse );
            }
          }
      );
    }
  };

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
   * @param   pageWatcher
   *            Optional. Save PageWatcher instance.
   * @return  void
   **/

  Sdk.prototype.processRequest = function ( objMessage, objSender, funcSendResponse, pageWatcher ) {
    var objRequest = objMessage.objPozitoneApiRequest;

    if ( typeof objRequest === 'object' && ! Array.isArray( objRequest ) ) {
      if ( ! this.isEmpty( objRequest ) ) {
        var strCall = objRequest.strCall;

        if ( typeof strCall === 'string' ) {
          if ( strCall !== '' ) {
            var strMethod = objRequest.strMethod;

            if ( typeof strMethod === 'string' ) {
              if ( strMethod !== '' ) {
                var arrCall = strCall.split( '/' )
                  , strPrimaryCall = arrCall[ 0 ]
                  ;

                // Update instance
                if ( typeof this.pageWatcher === 'undefined' && typeof pageWatcher !== 'undefined' ) {
                  this.pageWatcher = pageWatcher;
                }

                if ( strPrimaryCall === 'tab' ) {
                  this.forwardCallToTab( objRequest, objSender, funcSendResponse, arrCall );
                }
                else if ( strPrimaryCall === 'button' ) {
                  this.processButtonCall( objRequest, objSender, funcSendResponse, arrCall );
                }
                else if ( strPrimaryCall === 'command' ) {
                  this.processCommandCall( objRequest, objSender, funcSendResponse, arrCall );
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
   * If the recipient is a tab, forward the call to that tab.
   *
   * @type    method
   * @param   objRequest
   *            API request properties object.
   * @param   objSender
   *            Sender of a message.
   * @param   funcSendResponse
   *            Used to send a response.
   * @param   arrCall
   *            Call "path" tree.
   * @return  void
   **/

  Sdk.prototype.forwardCallToTab = function ( objRequest, objSender, funcSendResponse, arrCall ) {
    var intTabId = parseInt( arrCall[ 1 ] );

    arrCall = arrCall.slice( 2 );

    chrome.tabs.sendMessage(
        intTabId
      , {
          objPozitoneApiRequest : {
              strVersion : this.getSdkVersion()
            , strCall : this.createCallString( arrCall )
            , strMethod : 'GET'
          }
        }
      , function ( objResponse ) {
          if ( typeof funcSendResponse === 'function' ) {
            funcSendResponse( objResponse );
          }
          else {
            // TODO: Add
          }
        }
    );
  };

  /**
   * Process PoziTone API 'button' call.
   *
   * @type    method
   * @param   objRequest
   *            API request properties object.
   * @param   objSender
   *            Sender of a message.
   * @param   funcSendResponse
   *            Used to send a response.
   * @param   arrCall
   *            Call "path" tree.
   * @return  void
   **/

  Sdk.prototype.processButtonCall = function ( objRequest, objSender, funcSendResponse, arrCall ) {
    var strMethod = objRequest.strMethod;

    if ( strMethod === 'GET' ) {
      var strButton = arrCall[ 1 ];

      if ( typeof strButton === 'string' && strButton !== '' ) {
        var pageWatcher = this.pageWatcher;

        // TODO: Combine with 'command'
        var funcToProceedWith = pageWatcher[ this.strTriggerPlayerActionMethodPrefix + strButton ];

        if ( typeof funcToProceedWith === 'function' ) {
          funcToProceedWith.call( pageWatcher );
        }
        else {
          // TODO: Add more error handling
        }
      }
      else {
        this.sendError( funcSendResponse, 1, 'strButton', 'string' );
      }
    }
    else {
      this.sendError( funcSendResponse, 6, strMethod );
    }
  };

  /**
   * Process PoziTone API 'command' call.
   *
   * @type    method
   * @param   objRequest
   *            API request properties object.
   * @param   objSender
   *            Sender of a message.
   * @param   funcSendResponse
   *            Used to send a response.
   * @param   arrCall
   *            Call "path" tree.
   * @return  void
   **/

  Sdk.prototype.processCommandCall = function ( objRequest, objSender, funcSendResponse, arrCall ) {
    var strMethod = objRequest.strMethod;

    if ( strMethod === 'GET' ) {
      var strCommand = arrCall[ 1 ];

      if ( typeof strCommand === 'string' && strCommand !== '' ) {
        var pageWatcher = this.pageWatcher;

        if ( strCommand === 'status' ) {
          var objResponse = {
              boolIsReady : pageWatcher.objPlayerInfo.boolIsReady
            , strModule : pageWatcher.objPlayerInfo.strModule
          };

          funcSendResponse( objResponse );
        }
        else {
          // TODO: Combine with 'button'
          var funcToProceedWith = pageWatcher[ this.strTriggerPlayerActionMethodPrefix + strCommand ];

          if ( typeof funcToProceedWith === 'function' ) {
            funcToProceedWith.call( pageWatcher );
          }
          else {
            // TODO: Add more error handling
          }
        }
      }
      else {
        this.sendError( funcSendResponse, 1, 'strButton', 'string' );
      }
    }
    else {
      this.sendError( funcSendResponse, 6, strMethod );
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

  Sdk.prototype.createCallString = function ( arrCallParameters ) {
    return arrCallParameters.join( this.strCallDivider );
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

  Sdk.prototype.sendError = function (
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
        }
      , objError = {
            intErrorCode : intErrorCode
          , strMessage : 'Error' + objErrorMessages[ intErrorCode ]
          , arrMessageArguments : [ strErrorMessageArg1, strErrorMessageArg2 ]
          , intStatusCode : 400
        }
      ;

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

  Sdk.prototype.sendResponse = function ( funcSendResponse, objResponseDetails ) {
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

    objResponseDetails.strVersion = this.getSdkVersion();
    objResponseDetails.strStatusText = poziworldExtension.i18n.getMessage( 'pozitoneModuleSdkStatusCode' + intStatusCode );
    objResponseDetails.strMessage = poziworldExtension.i18n.getMessage(
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
   * Provide artist name and media name, get a line consisting of both inputs.
   *
   * @type    method
   * @param   strArtist
   *            Artist (singer, band, etc.) name.
   * @param   strMediaTitle
   *            Media (song, video, etc.) title.
   * @return  string
   **/

  Sdk.prototype.setMediaInfo = function ( strArtist, strMediaTitle ) {
    // TODO: Handling of invalid/empty strings
    return strArtist.trim() + this.strMediaInfoDivider + strMediaTitle.trim();
  };

  /**
   * Provide relative image URL/src, get data URL.
   *
   * PoziTone can't access image files from other extensions.
   * Thus, images URLs have to be data URLs.
   *
   * @type    method
   * @param   strImgSrc
   *            Relative image URL.
   * @param   funcCallback
   *            Do when ready to provide data URL.
   * @param   intBorder
   *            Optional. Border to add to the image.
   * @param   strBorderColor
   *            Optional. Image border color.
   * @return  void
   **/

  Sdk.prototype.convertImageSrcToDataUrl = function ( strImgSrc, funcCallback, intBorder, strBorderColor ) {
    var $$image = new Image();

    $$image.onload = function () {
      var $$canvas = document.createElement( 'canvas' )
        , intLogoBorder = intBorder || 0
        , intLogoWidth = this.naturalWidth
        , intLogoHeight = this.naturalHeight
        , intCanvasWidth = intLogoWidth + 2 * intLogoBorder
        , intCanvasHeight = intLogoHeight + 2 * intLogoBorder
        ;

      $$canvas.width = intCanvasWidth;
      $$canvas.height = intCanvasHeight;

      var context = $$canvas.getContext( '2d' );

      // Solid bg
      context.fillStyle = strBorderColor || '#fff';
      context.fillRect( 0, 0, intCanvasWidth, intCanvasHeight );

      context.drawImage(
          this
        , intLogoBorder
        , intLogoBorder
        , intLogoWidth
        , intLogoHeight
      );

      funcCallback( $$canvas.toDataURL() );
    };

    $$image.setAttribute( 'crossOrigin', 'anonymous');
    $$image.src = strImgSrc;
  };

  /**
   * PoziTone operates with %. If the player operates with a 0–1 range,
   * the value has to be converted.
   *
   * @type    method
   * @param   flVolume
   *            A floating point volume number.
   * @return  integer
   **/

  Sdk.prototype.convertVolumeToPercent = function ( flVolume ) {
    return Math.round( flVolume.toFixed( 2 ) * 100 );
  };

  /**
   * PoziTone operates with %. If the player operates with a 0–1 range,
   * the value has to be converted.
   *
   * @type    method
   * @param   intVolume
   *            A floating point volume number.
   * @return  float
   **/

  Sdk.prototype.convertPercentToVolume = function ( intVolume ) {
    return parseFloat( ( intVolume / 100 ).toFixed( 2 ) );
  };

  /**
   * Request sound volume level change (up/down).
   *
   * @type    method
   * @param   strDirection
   *            'up' or 'down'.
   * @param   intVolume
   *            Sound volume level in % (0-100). TODO: Switch to 0-1
   * @param   funcSetVolume
   *            Different players set volume differently, leave it up to them.
   * @return  void
   **/

  Sdk.prototype.changeVolume = function ( strDirection, intVolume, funcSetVolume ) {
    // Can't be changed, reached the limit
    if (  strDirection === 'up' && intVolume >= 100
      ||  strDirection === 'down' && intVolume <= 0
    ) {
      return;
    }

    this.getVolumeDeltaSettings( strDirection, intVolume, funcSetVolume );
  };

  /**
   * Get module settings specific to volume delta.
   *
   * @type    method
   * @param   strDirection
   *            'up' or 'down'.
   * @param   intVolume
   *            Sound volume level in % (0-100). TODO: Switch to 0-1
   * @param   funcSetVolume
   *            Different players set volume differently, leave it up to them.
   * @return  void
   **/

  Sdk.prototype.getVolumeDeltaSettings = function ( strDirection, intVolume, funcSetVolume ) {
    var _this = this;

    _this.sendMessage(
        {
          objPozitoneApiRequest : {
              strVersion : _this.getSdkVersion()
            , strCall : _this.createCallString( [
                  'settings'
                , _this.pageWatcher.objPlayerInfo.strModule
                , 'volume-delta'
              ] )
            , strMethod : 'GET'
          }
        }
      , function ( intVolumeDelta ) {
          var intUpDown = 1;

          if ( strDirection === 'down' ) {
            intUpDown = -1;
          }

          intVolume += ( intUpDown * intVolumeDelta );

          if ( intVolume > 100 ) {
            intVolume = 100;
          }
          else if ( intVolume < 0 ) {
            intVolume = 0;
          }

          if ( typeof funcSetVolume === 'function' ) {
            funcSetVolume( intVolume );
          }
        }
    );
  };

  /**
   * Generic callback.
   *
   * @callback Sdk~funcCallback
   */

  /**
   * Get status of voice control: whether it's enabled/allowed and currently connected.
   *
   * Note: doesn't require .init().
   *
   * @param {Sdk~funcCallback} [funcCallback] - Callback on voice control status received.
   **/

  Sdk.prototype.getVoiceControlStatus = function ( funcCallback ) {
    var _this = this;

    _this.sendMessage(
        {
          objPozitoneApiRequest : {
              strVersion : _this.getSdkVersion()
            , strCall : _this.createCallString( [
                  'voice-control'
                , 'status'
              ] )
            , strMethod : 'GET'
          }
        }
      , function ( objStatus ) {
          if ( ! _this.isEmpty( objStatus ) && typeof funcCallback === 'function' ) {
            funcCallback( objStatus );
          }
        }
    );
  };

  /**
   * Callback in case of success.
   *
   * @callback Sdk~funcSuccessCallback
   */

  /**
   * Callback in case of error.
   *
   * @callback Sdk~funcErrorCallback
   */

  /**
   * Activate voice control app.
   *
   * Note: only for internal use within PoziTone.
   *
   * @param {Sdk~funcSuccessCallback} [funcSuccessCallback] - Function to run if successfully connected.
   * @param {Sdk~funcErrorCallback} [funcErrorCallback] - Function to run if didn't connect.
   **/

  Sdk.prototype.activateVoiceControl = function ( funcSuccessCallback, funcErrorCallback ) {
    var _this = this;

    _this.sendMessage(
        {
          objPozitoneApiRequest : {
              strVersion : _this.getSdkVersion()
            , strCall : _this.createCallString( [
                  'voice-control'
                , 'status'
              ] )
            , strMethod : 'POST'
            , objData : {
                boolIsConnected : true
              }
          }
        }
      , function ( boolIsConnected ) {
          if ( typeof boolIsConnected === 'boolean' && boolIsConnected ) {
            if ( typeof funcSuccessCallback === 'function' ) {
              funcSuccessCallback();
            }
          }
          else if ( typeof funcErrorCallback === 'function' ) {
            funcErrorCallback();
          }
        }
    );
  };

  /**
   * Get notified when voice control app gets shut down.
   *
   * @param {Sdk~funcCallback} [funcCallback] - Function to run when voice control gets deactivated.
   **/

  Sdk.prototype.addOnVoiceControlDeactivationListener = function ( funcCallback ) {
    var _this = this;

    _this.sendMessage(
        {
          objPozitoneApiRequest : {
              strVersion : _this.getSdkVersion()
            , strCall : _this.createCallString( [
                  'voice-control'
                , 'status'
                , 'deactivation'
              ] )
            , strMethod : 'GET'
          }
        }
      , function () {
          if ( typeof funcCallback === 'function' ) {
            funcCallback();
          }
        }
    );
  };

  /**
   * Check whether the object/array is empty.
   *
   * @type    method
   * @param   objToTest
   *            Object to check against.
   * @return  bool
   **/

  Sdk.prototype.isEmpty = function ( objToTest ) {
    for ( var i in objToTest ) {
      return false;
    }

    return true;
  };

  if ( typeof pozitoneModule === 'undefined' ) {
    window.pozitoneModule = {};
  }

  pozitoneModule.sdk = new Sdk();
} )();
