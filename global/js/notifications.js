/* =============================================================================

  PoziTone
  © 2013-2018 PoziWorld, Inc.
  https://pozitone.com

 ============================================================================ */

( function () {
  'use strict';

  /**
   * Callback in case of success.
   *
   * @callback funcSuccessCallback
   */

  /**
   * Enhance functionality of https://developer.chrome.com/extensions/notifications
   *
   * @constructor
   */

  function Notifications() {
    /**
     * Known API error messages.
     *
     * @typedef {Object} Errors
     * @property {string} type - What the error relates to.
     */

    const objApiErrorMessages = {
      buttons: 'Adding buttons to notifications is not supported.'
    };

    /**
     * Check whether the last runtime error is what is expected.
     *
     * @param {string} strErrorMessage - https://developer.chrome.com/extensions/runtime#property-lastError
     * @param {Errors~type} strType
     * @return {boolean}
     * @private
     */

    Notifications.prototype._isKnownErrorMessage = function ( strErrorMessage, strType ) {
      Log.add( 'pozitone.notifications._getApiErrorMessage' );

      return strErrorMessage === objApiErrorMessages[ strType ];
    };
  }

  /**
   * https://developer.chrome.com/extensions/notifications#method-create
   *
   * @param {string} [strNotificationId] - Identifier of the notification. If not set or empty, an ID will automatically be generated. If it matches an existing notification, this method first clears that notification before proceeding with the create operation. The identifier may not be longer than 500 characters.
   * @param {Object} objNotificationOptions - Contents of the notification.
   * @param {funcSuccessCallback} [funcSuccessCallback] - If successfully created.
   */

  Notifications.prototype.create = function ( strNotificationId, objNotificationOptions, funcSuccessCallback ) {
    Log.add( 'pozitone.notifications.create', strNotificationId, objNotificationOptions );

    const _this = this;
    const options = localize( objNotificationOptions );

    chrome.notifications.create(
      strNotificationId,
      options,
      function ( strNotificationId ) {
        Global.checkForRuntimeError(
          funcSuccessCallback,
          function ( strErrorMessage ) {
            // Opera doesn't allow buttons
            if ( _this._isKnownErrorMessage( strErrorMessage, 'buttons' ) ) {
              delete options.buttons;

              chrome.notifications.create(
                strNotificationId,
                options,
                funcSuccessCallback
              );
            }
          }
        );
      }
    );
  };

  /**
   * The notification title and the buttons' captions need to be localized right before the notification is shown, as i18n API is async.
   *
   * @param {Object} options
   * @return {Object}
   */

  function localize( options ) {
    options = localizeTitle( options );

    const buttons = options.buttons;

    if ( Array.isArray( buttons ) && buttons.length ) {
      buttons.forEach( localizeTitle );

      options.buttons = buttons;
    }

    return options;
  }

  /**
   * Notification itself and buttons are captioned with the “title” property, which needs to be localized.
   *
   * @param {Object} object
   * @return {Object}
   */

  function localizeTitle( object ) {
    const title = object.title;

    if ( poziworldExtension.utils.isNonEmptyString( title ) ) {
      object.title = poziworldExtension.i18n.getMessage( title );
    }

    return object;
  }

  if ( typeof pozitone === 'undefined' ) {
    window.pozitone = {};
  }

  pozitone.notifications = new Notifications();
} )();
