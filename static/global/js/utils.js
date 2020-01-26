( function () {
  'use strict';

  setUp();

  /**
   * Make the logic readily available.
   */

  function setUp() {
    exposeApi();
  }

  /**
   * Create an instance of the Utils API and expose it to other parts of the extension.
   */

  function exposeApi() {
    if ( typeof poziworldExtension === 'undefined' ) {
      window.poziworldExtension = {};
    }

    poziworldExtension.utils = new Utils();
  }

  /**
   * @constructor
   */

  function Utils() {
  }

  /**
   * Get the main extension settings (the ones set on the Options page).
   *
   * @param {string} logPrefix - Debug line "prefix".
   * @param {successCallback} [successCallback] - Function to run on success.
   * @param {errorCallback} [errorCallback] - Function to run on error.
   * @return
   **/

  Utils.prototype.getSettings = function ( logPrefix, successCallback, errorCallback ) {
    new Promise( getGeneralSettings.bind( null, logPrefix ) )
      .then( successCallback )
      .catch( errorCallback );
  };

  /**
   * Check whether the provided value is of 'string' type and non-empty.
   *
   * @param {*} value
   * @return {boolean}
   */

  Utils.prototype.isNonEmptyString = function ( value ) {
    return this.isType( value, 'string' ) && value !== '';
  };

  /**
   * Check whether the type of the parameter matches the provided string.
   *
   * @param {*} param
   * @param {string} type - The target type.
   */

  Utils.prototype.isType = function ( param, type ) {
    return Object.prototype.toString.call( param ).slice( 8, -1 ).toLowerCase() === type.toLowerCase();
  };

  /**
   * Detect the best suitable extension (add-on) store (catalogue).
   *
   * @returns {(ExtensionStoreSpecificUrls.chrome|ExtensionStoreSpecificUrls.edge|ExtensionStoreSpecificUrls.opera)}
   */

  Utils.prototype.getExtensionStoreType = function () {
    if ( boolConstIsOperaAddon ) {
      return 'opera';
    }

    if ( bowser.name === 'Edge (Chromium)' ) {
      return 'edge';
    }

    return 'chrome';
  };

  /**
   * Utilize legacy code to retrieve general (main - not each module's) settings.
   *
   * @param {string} logPrefix - Debug line "prefix".
   * @param {resolve} resolve
   * @param {reject} reject
   */

  function getGeneralSettings( logPrefix, resolve, reject ) {
    Global.getStorageItems(
      StorageSync,
      strConstGeneralSettings,
      logPrefix || 'getGeneralSettings',
      handleRetrievedSettings.bind( null, strConstGeneralSettings, resolve, reject ),
      reject
    );
  }

  /**
   * Verify integrity of the retrieved data and pass it along.
   *
   * @param {string} storageKey - The key of the settings in the Storage.
   * @param {resolve} resolve
   * @param {reject} reject
   * @param {Object} storageItems - Object with items in their key-value mappings.
   */

  function handleRetrievedSettings( storageKey, resolve, reject, storageItems ) {
    const settings = storageItems[ storageKey ];

    if ( poziworldExtension.utils.isType( settings, 'object' ) ) {
      resolve( settings );
    }
    else {
      reject();
    }
  }

  /**
   * Callback in case of success.
   *
   * @callback successCallback
   */

  /**
   * Callback in case of error.
   *
   * @callback errorCallback
   */

  /**
   * Resolve promise.
   *
   * @callback resolve
   */

  /**
   * Reject promise.
   *
   * @callback reject
   */
} )();

