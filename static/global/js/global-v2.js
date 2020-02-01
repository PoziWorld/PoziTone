/* =============================================================================

  Product: PoziTone
  Author: PoziWorld
  Copyright: (c) 2016 PoziWorld
  License: pozitone.com/license

  Table of Contents:

    Global2
      isModuleBuiltIn()
      isModuleBuiltInApiCompliant()
      isModuleExternal()
    On Load
      Initialize

 ============================================================================ */

( function () {
  'use strict';

  /**
   * Browser-specific extension-related URLs.
   *
   * @typedef {object} ExtensionStoreSpecificUrls
   * @property {string} chrome - URL for an extension installed via the Chrome Web Store.
   * @property {string} edge - URL for an extension for the new Microsoft Edge.
   * @property {string} opera - URL for an extension installed via the Opera add-ons catalogue.
   */

  /**
   * Browser-specific extension-related URLs.
   *
   * @typedef {object} Urls
   * @property {ExtensionStoreSpecificUrls} installation
   * @property {ExtensionStoreSpecificUrls} rating
   * @property {ExtensionStoreSpecificUrls} feedback
   */

  const URLS = {
    installation: {
      chrome: 'https://chrome.google.com/webstore/detail/pozitone/bdglbogiolkffcmojmmkipgnpkfipijm',
      edge: 'https://microsoftedge.microsoft.com/addons/detail/mnfohmojhhcbbnafeehfhghjaeaokjbl',
      opera: 'https://addons.opera.com/extensions/details/pozitone/',
    },
    rating: {
      chrome: 'https://chrome.google.com/webstore/detail/pozitone/bdglbogiolkffcmojmmkipgnpkfipijm/reviews',
      edge: 'https://microsoftedge.microsoft.com/addons/detail/mnfohmojhhcbbnafeehfhghjaeaokjbl',
      opera: 'https://addons.opera.com/extensions/details/pozitone/#rating-form',
    },
    feedback: {
      chrome: 'https://chrome.google.com/webstore/detail/pozitone/bdglbogiolkffcmojmmkipgnpkfipijm/support',
      edge: 'https://feedback.pozitone.com/',
      opera: 'https://addons.opera.com/extensions/details/pozitone/#feedback-container',
    },
    swaggyProject: {
      chrome: 'https://chrome.google.com/webstore/detail/beblcchllamebejoakjbhhajpmlkjoaf',
      edge: 'https://github.com/PoziWorld/Swaggy',
      opera: 'https://chrome.google.com/webstore/detail/beblcchllamebejoakjbhhajpmlkjoaf',
    },
    poziworldElfProject: {
      chrome: 'https://github.com/PoziWorld/PoziWorld-Elf',
      edge: 'https://github.com/PoziWorld/PoziWorld-Elf',
      opera: 'https://github.com/PoziWorld/PoziWorld-Elf',
    },
    scrollToTopButtonProject: {
      chrome: 'https://chrome.google.com/webstore/detail/scroll-to-top-button/chinfkfmaefdlchhempbfgbdagheknoj',
      edge: 'https://microsoftedge.microsoft.com/addons/detail/dobeplcigkjlbajngcgnndecohjkjmia',
      opera: 'https://addons.opera.com/extensions/details/scroll-to-top-button/',
    },
    printWasteMinimizerProject: {
      chrome: 'https://chrome.google.com/webstore/detail/print-waste-minimizer/nhglpabogkpplpcemgiaopjoehcpajdk',
      edge: 'https://microsoftedge.microsoft.com/addons/detail/badkpckfhemokiobdfnjepgnllimkbia',
      opera: 'https://addons.opera.com/extensions/details/print-waste-minimizer/',
    },
  };

  setUp();

  /**
   * Make the logic readily available.
   */

  function setUp() {
    exposeApi();
  }

  /**
   * Create an instance of the Global2 API and expose it to other parts of the extension.
   */

  function exposeApi() {
    if ( typeof pozitone === 'undefined' ) {
      window.pozitone = {};
    }

    pozitone.global = new Global2();
  }

  /**
   * @constructor
   */

  function Global2() {
  }

  /**
   * Checks whether the module is built-in.
   *
   * @type    method
   * @param   strModuleId
   *            Module ID.
   * @return  boolean
   **/

  Global2.prototype.isModuleBuiltIn = function ( strModuleId ) {
    return strModuleId in Global.objModules;
  };

  /**
   * Checks whether the module is built-in and API compliant.
   *
   * @type    method
   * @param   strModuleId
   *            Module ID.
   * @param   boolIsBuiltIn
   *            Optional. Whether the module is built-in.
   * @return  boolean
   **/

  Global2.prototype.isModuleBuiltInApiCompliant = function ( strModuleId, boolIsBuiltIn ) {
    if ( boolIsBuiltIn || this.isModuleBuiltIn( strModuleId ) ) {
      var objModule = Global.objModules[ strModuleId ];

      return typeof objModule.boolIsApiCompliant === 'boolean' && objModule.boolIsApiCompliant;
    }

    return false;
  };

  /**
   * Checks whether the module is external.
   *
   * @type    method
   * @param   strModuleId
   *            Module ID.
   * @return  boolean
   **/

  Global2.prototype.isModuleExternal = function ( strModuleId ) {
    return ! this.isModuleBuiltIn( strModuleId );
  };

  /**
   * Don't show these buttons, if they've been clicked for this track already.
   *
   * @return {string[]} - Messages-indicators.
   */

  Global2.prototype.getAddTrackToPlaylistFeedbackMessages = function () {
    return [
      poziworldExtension.i18n.getMessage( 'notificationAddTrackToPlaylistFeedbackSuccessfullyAdded' ),
      poziworldExtension.i18n.getMessage( 'notificationAddTrackToPlaylistFeedbackAlreadyInPlaylist' ),
    ];
  };

  /**
   * Don't show these buttons, if they've been clicked for this track already.
   *
   * @return {string} - Message-indicator.
   */

  Global2.prototype.getFavoriteStatusSuccess = function () {
    return poziworldExtension.i18n.getMessage( 'notificationFavoriteStatusSuccess' );
  };

  /**
   * Some changes might require reloading the extension and reopening the Options page.
   *
   * @param {string} optionsPageTab - The options page tab/section/“subpage” to reopen after the extension reload.
   * @param {string} [logMessage] - The log message passed to the background view.
   */

  Global2.prototype.reloadExtensionAndOptions = function ( optionsPageTab, logMessage ) {
    Global.setStorageItems(
      StorageLocal,
      {
        boolOpenOptionsPageOnRestart: true,
        strOptionsPageToOpen: optionsPageTab,
      },
      strLog + ', reopen Options',
      pozitone.background ?
        pozitone.background.reloadExtension :
        requestExtensionReload.bind( null, logMessage )
    );
  };

  /**
   * Return browser-specific extension installation URL.
   *
   * @returns {string}
   */

  Global2.prototype.getInstallationUrl = function () {
    return getUrl( 'installation' );
  };

  /**
   * Return browser-specific extension rating/review URL.
   *
   * @returns {string}
   */

  Global2.prototype.getRatingUrl = function () {
    return getUrl( 'rating' );
  };

  /**
   * Return browser-specific extension feedback/issue reporting URL.
   *
   * @returns {string}
   */

  Global2.prototype.getFeedbackUrl = function () {
    return getUrl( 'feedback' );
  };

  /**
   * Return browser-specific sister project URL.
   *
   * @param {string} urlId
   * @returns {string}
   */

  Global2.prototype.getSisterProjectUrl = function ( urlId ) {
    return getUrl( urlId );
  };

  /**
   * Ask the background view to handle the extension reload.
   *
   * @param {string} logMessage - The log message passed to the background view.
   */

  function requestExtensionReload( logMessage ) {
    chrome.runtime.sendMessage(
      {
        strReceiver: 'background',
        strLog: logMessage,
        extensionReloadRequested: true,
      }
    );
  }

  /**
   * Return an extension-related URL depending on the browser.
   *
   * @param {('installation'|'rating'|'feedback')} urlType
   */

  function getUrl( urlType ) {
    return URLS[ urlType ][ poziworldExtension.utils.getExtensionStoreType() ];
  }
} )();

/* =============================================================================

  On Load

 ============================================================================ */

/**
 * Initializes.
 *
 * @type    method
 * @param   No Parameters taken
 * @return  void
 **/

Global.init();
