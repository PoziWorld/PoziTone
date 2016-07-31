/* =============================================================================

  Product: PoziTone module API
  Author: PoziWorld
  Copyright: (c) 2016 PoziWorld
  License: pozitone.com/license

  Table of Contents:

    Api
      getApiVersion()
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

 ============================================================================ */

( function() {
  'use strict';

  function Api() {
    var strVersion = '0.3.1';

    this.strMediaInfoDivider = ' – ';
    this.strCallDivider = '/';
    this.strTriggerPlayerActionMethodPrefix = 'triggerPlayerAction_';

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

  Api.prototype.init = function ( strPozitoneEdition, pageWatcher, boolUseOperaAddonId ) {
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

  Api.prototype.connectModule = function ( objSettings, funcSuccessCallback, funcErrorCallback ) {
    var self = this;

    self.sendMessage(
        {
          objPozitoneApiRequest : {
              strVersion : self.getApiVersion()
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

  Api.prototype.onConnectModuleResponse = function (
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

  Api.prototype.openModuleSettings = function ( strModuleId, funcSuccessCallback, funcErrorCallback ) {
    var self = this;

    self.sendMessage(
        {
          objPozitoneApiRequest : {
              strVersion : self.getApiVersion()
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

  Api.prototype.sendMediaEvent = function ( objData, funcSuccessCallback, funcErrorCallback ) {
    var self = this;

    self.sendMessage(
        {
          objPozitoneApiRequest : {
              strVersion : self.getApiVersion()
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

  Api.prototype.sendMessage = function ( objMessage, funcCallback ) {
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
   * @return  void
   **/

  Api.prototype.processRequest = function ( objMessage, objSender, funcSendResponse ) {
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

  Api.prototype.forwardCallToTab = function ( objRequest, objSender, funcSendResponse, arrCall ) {
    var intTabId = parseInt( arrCall[ 1 ] );

    arrCall = arrCall.slice( 2 );

    chrome.tabs.sendMessage(
        intTabId
      , {
          objPozitoneApiRequest : {
              strVersion : this.getApiVersion()
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

  Api.prototype.processButtonCall = function ( objRequest, objSender, funcSendResponse, arrCall ) {
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

  Api.prototype.processCommandCall = function ( objRequest, objSender, funcSendResponse, arrCall ) {
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

  Api.prototype.createCallString = function ( arrCallParameters ) {
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

  Api.prototype.sendResponse = function ( funcSendResponse, objResponseDetails ) {
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
    objResponseDetails.strStatusText = chrome.i18n.getMessage( 'pozitoneModuleApiStatusCode' + intStatusCode );
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
   * Provide artist name and media name, get a line consisting of both inputs.
   *
   * @type    method
   * @param   strArtist
   *            Artist (singer, band, etc.) name.
   * @param   strMediaTitle
   *            Media (song, video, etc.) title.
   * @return  string
   **/

  Api.prototype.setMediaInfo = function ( strArtist, strMediaTitle ) {
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

  Api.prototype.convertImageSrcToDataUrl = function ( strImgSrc, funcCallback, intBorder, strBorderColor ) {
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

  Api.prototype.convertVolumeToPercent = function ( flVolume ) {
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

  Api.prototype.convertPercentToVolume = function ( intVolume ) {
    return parseFloat( ( intVolume / 100 ).toFixed( 2 ) );
  };

  /**
   * Check whether the object/array is empty.
   *
   * @type    method
   * @param   objToTest
   *            Object to check against.
   * @return  bool
   **/

  Api.prototype.isEmpty = function ( objToTest ) {
    for ( var i in objToTest ) {
      return false;
    }

    return true;
  };

  if ( typeof pozitoneModule === 'undefined' ) {
    window.pozitoneModule = {};
  }

  pozitoneModule.api = new Api();
} )();
