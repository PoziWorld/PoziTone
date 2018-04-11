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

    chrome.notifications.create(
      strNotificationId,
      objNotificationOptions,
      function ( strNotificationId ) {
        Global.checkForRuntimeError(
          funcSuccessCallback,
          function ( strErrorMessage ) {
            // Opera doesn't allow buttons
            if ( _this._isKnownErrorMessage( strErrorMessage, 'buttons' ) ) {
              delete objNotificationOptions.buttons;

              chrome.notifications.create(
                strNotificationId,
                objNotificationOptions,
                funcSuccessCallback
              );
            }
          }
        );
      }
    );
  };

  if ( typeof pozitone === 'undefined' ) {
    window.pozitone = {};
  }

  pozitone.notifications = new Notifications();
} )();
