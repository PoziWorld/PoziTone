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
