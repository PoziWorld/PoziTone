/* =============================================================================

  PoziTone
  © 2013-2018 PoziWorld, Inc.
  https://pozitone.com

 ============================================================================ */

( function () {
  'use strict';

  /**
   * Resolve promise.
   *
   * @callback funcResolve
   */

  /**
   * Reject promise.
   *
   * @callback funcReject
   */

  /**
   * The platform natively supports only a limited set of locales (https://developer.chrome.com/webstore/i18n?csw=1#localeTable).
   * Use a third-party tool to support all locales (languages).
   * Replace chrome.i18n.getMessage with pozitone.i18n.getMessage.
   *
   * @constructor
   */

  function I18n() {
    /**
     * https://github.com/i18next/i18next-browser-languageDetector#detector-options.
     */

    const i18nextBrowserLanguageDetectorOptions = {
      order: [
        'browserExtension'
      ]
    };

    /**
     * https://github.com/i18next/i18next-xhr-backend#backend-options.
     */

    const i18nextXhrBackendOptions = {
      loadPath: chrome.runtime.getURL( '_locales/{{lng}}/messages.json' ),
      async: false
    };

    /**
     * @todo Get dynamically or don't forget to update.
     */

    const arrSupportedLocales = [
      'be',
      'en_US',
      'es',
      'it',
      'pl',
      'ru',
      'uk'
    ];

    const defaultLocale = 'en_US';

    /**
     * https://github.com/i18next/i18next-browser-languageDetector#adding-own-detection-functionality
     */

    const browserExtensionDetector = {
      name: 'browserExtension',
      lookup: function () {
        let strLanguageCode = chrome.i18n.getUILanguage();

        if ( strLanguageCode ) {
          strLanguageCode = formatLanguageCode(strLanguageCode);
        }

        if ( strLanguageCode && isSupported( strLanguageCode ) ) {
          return strLanguageCode;
        }
        else {
          const arrLanguageCodes = navigator.languages;

          if ( Array.isArray( arrLanguageCodes ) ) {
            for ( let i = 0, l = arrLanguageCodes.length; i < l; i++ ) {
              strLanguageCode = formatLanguageCode( arrLanguageCodes[ i ] );

              if ( isSupported( strLanguageCode ) ) {
                return strLanguageCode;
              }
            }
          }
        }

        return defaultLocale;
      }
    };

    const languageDetector = new i18nextBrowserLanguageDetector();

    languageDetector.addDetector( browserExtensionDetector );

    /**
     * https://www.i18next.com/configuration-options.html
     */

    const i18nextOptions = {
      initImmediate: false,
      detection: i18nextBrowserLanguageDetectorOptions,
      backend: i18nextXhrBackendOptions,
      fallbackLng: {
        'default': [
          defaultLocale
        ]
      },
      load: 'currentOnly',
      ns: 'messages',
      defaultNS: 'messages'
    };

    /**
     * https://www.i18next.com/api.html#t
     *
     * @callback I18n~t
     */

    /**
     * @typedef {I18n~t} T
     */

    let translationFunction;

    /**
     * Convert the format returned by APIs (“-” as a separator) to the format used by extensions (“_” as a separator).
     *
     * @param {string} strLanguageCode - en-US, en, ru
     * @return {string} - en_US, en, ru
     */

    function formatLanguageCode( strLanguageCode ) {
      return strLanguageCode.replace( '-', '_' );
    }

    /**
     * Check whether there is a PoziTone translation for the provided locale.
     *
     * @param {string} strLanguageCode - en_US, en, ru
     * @return {boolean}
     */

    function isSupported( strLanguageCode ) {
      return arrSupportedLocales.indexOf( strLanguageCode ) > -1;
    }

    /**
     * Return language detector.
     *
     * @return {i18nextBrowserLanguageDetector}
     */

    I18n.prototype.getLanguageDetector = function () {
      Log.add( 'pozitone.i18n.getLanguageDetector' );

      return languageDetector;
    };

    /**
     * Return i18next options.
     *
     * @return {Object}
     */

    I18n.prototype.getI18nextOptions = function () {
      Log.add( 'pozitone.i18n.getI18nextOptions' );

      return i18nextOptions;
    };

    /**
     * Return translation function.
     *
     * @return {T}
     */

    I18n.prototype.getTranslationFunction = function () {
      Log.add( 'pozitone.i18n.getTranslationFunction' );

      return translationFunction;
    };

    /**
     * Save translation function.
     *
     * @param {T} t
     * @return {boolean} - Whether the operation succeeded.
     */

    I18n.prototype.setTranslationFunction = function ( t ) {
      Log.add( 'pozitone.i18n.setTranslationFunction' );

      if ( typeof t === 'function' ) {
        translationFunction = t;

        return true;
      }

      return false;
    };

    this.init();
  }

  /**
   * Initialize.
   */

  I18n.prototype.init = function () {
    Log.add( 'pozitone.i18n.init' );

    const initPromise = new Promise( this.initI18next.bind( this ) );

    initPromise
      .then( this.handleInitSuccess.bind( this ) )
      .catch( this.handleInitError.bind( this ) )
      ;
  };

  /**
   * Initialize i18next.
   *
   * @param {funcResolve} funcResolve
   * @param {funcReject} funcReject
   */

  I18n.prototype.initI18next = function ( funcResolve, funcReject ) {
    Log.add( 'pozitone.i18n.initI18next' );

    const _this = this;
    const _funcResolve = funcResolve;
    const _funcReject = funcReject;

    return i18next
      .use( _this.getLanguageDetector() )
      .use( i18nextXHRBackend )
      .init(
        _this.getI18nextOptions(),
        _this.handleI18nextInitCallback.bind( _this, _funcResolve, _funcReject )
      );
  };

  /**
   * Initialization succeeded.
   */

  I18n.prototype.handleInitSuccess = function () {
    Log.add( 'pozitone.i18n.handleInitSuccess' );
  };

  /**
   * Initialization failed.
   *
   * @param {string[]} [arrErrors]
   */

  I18n.prototype.handleInitError = function ( arrErrors ) {
    Log.add( 'pozitone.i18n.handleInitError', arrErrors, true );
  };

  /**
   * Called after all translations were loaded or with an error when failed (in case of using a backend).
   *
   * @param {funcResolve} funcResolve
   * @param {funcReject} funcReject
   * @param {string[]} [arrErrors]
   * @param {T} [t]
   */

  I18n.prototype.handleI18nextInitCallback = function ( funcResolve, funcReject, arrErrors, t ) {
    Log.add( 'pozitone.i18n.handleI18nextInitCallback' );

    this.checkForInitErrors( arrErrors, funcReject );
    this.checkForInitSuccess( t, funcResolve, funcReject );
  };

  /**
   * Check whether initialization failed (in case of using a backend).
   *
   * @param {string[]} [arrErrors]
   * @param {funcReject} funcReject
   */

  I18n.prototype.checkForInitErrors = function ( arrErrors, funcReject ) {
    Log.add( 'pozitone.i18n.checkForInitErrors', arrErrors );

    if ( Array.isArray( arrErrors ) ) {
      funcReject( arrErrors );
    }
  };

  /**
   * Check whether initialization succeeded (in case of using a backend).
   *
   * @param {T} [t]
   * @param {funcResolve} funcResolve
   * @param {funcReject} funcReject
   */

  I18n.prototype.checkForInitSuccess = function ( t, funcResolve, funcReject ) {
    Log.add( 'pozitone.i18n.checkForInitSuccess' );

    if ( this.setTranslationFunction( t ) ) {
      funcResolve();

      this.saveExtensionLanguage();
    }
    else {
      funcReject();
    }
  };

  /**
   * Remember the set language (used for debugging).
   */

  I18n.prototype.saveExtensionLanguage = function () {
    Log.add( 'pozitone.i18n.saveExtensionLanguage' );

    /**
     * @todo Use a listener instead, fire callbacks here.
     */

    if ( typeof objConstUserSetUp === 'object' ) {
      objConstUserSetUp.language = this.getLanguage();
    }
  };

  /**
   * https://developer.chrome.com/extensions/i18n#method-getMessage replacement.
   *
   * @param {string} strKey - The name of the message, as specified in the messages.json file.
   * @param {(string|number)[]} [arrSubstitutions]
   * @return {string}
   */

  I18n.prototype.getMessage = function ( strKey, arrSubstitutions ) {
    Log.add( 'pozitone.i18n.getMessage', strKey );

    const t = this.getTranslationFunction();

    if ( t ) {
      // i18next treats messages.json keys as objects:
      // To get translation for “extensionName”, get “message” property of the “extensionName” object
      const strObjectProperty = '.message';
      const strLookup = strKey + strObjectProperty;
      let strMessage = t( strLookup );

      if ( Array.isArray( arrSubstitutions ) ) {
        // Find all $PLACEHOLDER$ variables in the message property
        // Example: find “$VOLUME_LEVEL$” in “Sound volume — $VOLUME_LEVEL$%”
        const arrPlaceholders = strMessage.match( /(\$.[A-Z0-9_]*\$)/g );

        if ( Array.isArray( arrPlaceholders ) ) {
          for ( let i = 0, l = arrPlaceholders.length; i < l; i++ ) {
            const strPlaceholder = arrPlaceholders[ i ];
            // $VOLUME_LEVEL$ -> volume_level
            const strPlaceholderKey = strPlaceholder.replace( /\$/g, '' ).toLowerCase();
            // In messages.json, indices start with 1 ("content": "$1"), but from 0 in the array
            const intSubstitutionIndex = Number( t( strKey + '.placeholders.' + strPlaceholderKey + '.content' ).replace( /\$/, '' ) ) - 1;

            strMessage = strMessage.replace( arrPlaceholders[ i ], arrSubstitutions[ intSubstitutionIndex ] );
          }
        }
      }
      // Translation isn't found: Output as it is, but without “debugging” info
      else if ( strMessage === strLookup ) {
        strMessage = strKey;
      }

      return strMessage;
    }

    return this.handleTranslationException();
  };

  /**
   * Most likely, third-party tool hasn't been initialized.
   *
   * @return {string}
   */

  I18n.prototype.handleTranslationException = function () {
    Log.add( 'pozitone.i18n.handleTranslationException' );

    return 'i18n services not initialized.';
  };

  /**
   * Return the current detected or set language.
   * https://www.i18next.com/api.html#language
   *
   * @return {string}
   */

  I18n.prototype.getLanguage = function () {
    Log.add( 'pozitone.i18n.getLanguage' );

    return i18next.language;
  };

  if ( typeof pozitone === 'undefined' ) {
    window.pozitone = {};
  }

  // Fallback for content scripts
  if ( typeof Log === 'undefined' ) {
    window.Log = {
      add: function () {}
    };
  }

  pozitone.i18n = new I18n();
} )();
