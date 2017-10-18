// Controller for Voice Control page
optionsControllers.controller( 'VoiceControlCtrl', function( $scope, $rootScope ) {
  Page.localize( strPage, '#content' );

  strSubpage = 'voice-control';
  strSubsection = undefined;

  Page.trackPageView( strSubpage );

  $rootScope.toggleExternalLinksListeners(
      true
    , 'content'
    , strPage
    , strSubpage
  );

  const $enableVoiceControl = document.getElementById( 'boolEnableVoiceControl' );
  const $voiceControlActivateCta = document.getElementById( 'voiceControlActivateCta' );
  let boolIsOnVoiceControlDeactivationListenerSet = false;
  const objModules = $rootScope.objModules;

  if ( typeof objModules === 'object' ) {
    var objGeneralSettings = objModules.general;

    if ( typeof objGeneralSettings !== 'object' ) {
      /**
       * @todo Logic below won't work, handle error
       */
    }
  }

  // Check whether it'd already been enabled
  chrome.permissions.contains( { permissions : [ 'nativeMessaging' ] }, function( boolIsGranted ) {
    if ( boolIsGranted ) {
      const boolEnableVoiceControl = objGeneralSettings.boolEnableVoiceControl;

      // Voice control 'Enabled' state had been saved
      if ( typeof boolEnableVoiceControl === 'boolean' && boolEnableVoiceControl ) {
        $enableVoiceControl.checked = true;
        $enableVoiceControl.disabled = false;
        $voiceControlActivateCta.disabled = false;

        return;
      }
    }

    $enableVoiceControl.checked = false;
    $enableVoiceControl.disabled = false;
    $voiceControlActivateCta.disabled = true;
  } );

  /**
   * Toggle voice control setting via permissions API and in storage
   *
   * @param {MouseEvent} objEvent - MouseEvent object.
   **/

  $scope.toggleVoiceControl = function( objEvent ) {
    // Avoid second click while in process
    $enableVoiceControl.disabled = true;

    // It just made it checked, so check for the opposite
    if ( $enableVoiceControl.checked ) {
      $scope.enableVoiceControl( objEvent );
    }
    else {
      $scope.disableVoiceControl( objEvent );
    }
  };

  /**
   * Request 'nativeMessaging' permission and save the state in storage.
   *
   * @param {MouseEvent} objEvent - MouseEvent object.
   **/

  $scope.enableVoiceControl = function( objEvent ) {
    const objLogDetails = {};

    chrome.permissions.request( { permissions: [ 'nativeMessaging' ] }, function( boolIsGranted ) {
      const strPermissionRequestLog = strLog = 'enableVoiceControl';

      function onFinished( boolIsEnabled ) {
        $enableVoiceControl.checked = boolIsEnabled;
        $enableVoiceControl.disabled = false;
        $voiceControlActivateCta.disabled = ! boolIsEnabled;

        Log.add( strPermissionRequestLog, objLogDetails, true );
      }

      Global.checkForRuntimeError(
          function() {
            objLogDetails.boolIsRuntimeLastErrorNotSet = true;

            if ( boolIsGranted ) {
              objLogDetails.boolIsPermissionGranted = true;
              objGeneralSettings.boolEnableVoiceControl = true;

              let objModulesSettings = {};

              objModulesSettings[ strConstGeneralSettings ] = objGeneralSettings;

              Global.setStorageItems(
                  StorageSync
                , objModulesSettings
                , strPermissionRequestLog
                , function() {
                    $scope.saveModulesSettingsScope( objModulesSettings );

                    objLogDetails.boolAreStorageItemsSet = true;

                    onFinished( true );
                  }
                , function() {
                    objLogDetails.boolAreStorageItemsSet = false;

                    onFinished( false );
                    /**
                     * @todo Show error message to user
                     */
                  }
                , objLogDetails
              );
            }
            else {
              objLogDetails.boolIsPermissionGranted = false;
              objLogDetails.boolAreStorageItemsSet = false;

              onFinished( false );
              /**
               * @todo Show error message to user
               */
            }
          }
        , function() {
            objLogDetails.boolIsRuntimeLastErrorNotSet = false;
            objLogDetails.boolIsPermissionGranted = false;
            objLogDetails.boolAreStorageItemsSet = false;

            onFinished( false );
            /**
             * @todo Show error message to user
             */
          }
        , objLogDetails
        , true
      );
    } );
  };

  /**
   * Request 'nativeMessaging' permission and save the state in storage.
   *
   * @param {MouseEvent} objEvent - MouseEvent object.
   **/

  $scope.disableVoiceControl = function( objEvent ) {
    const objLogDetails = {};

    chrome.permissions.remove( { permissions: [ 'nativeMessaging' ] }, function( boolIsRemoved ) {
      const strPermissionsRemoveLog = strLog = 'disableVoiceControl';

      function onFinished( boolIsDisabled ) {
        $enableVoiceControl.checked = ! boolIsDisabled;
        $enableVoiceControl.disabled = false;
        $voiceControlActivateCta.disabled = boolIsDisabled;

        Log.add( strPermissionsRemoveLog, objLogDetails, true );
      }

      Global.checkForRuntimeError(
          function() {
            objLogDetails.boolIsRuntimeLastErrorNotSet = true;

            if ( boolIsRemoved ) {
              objLogDetails.boolIsPermissionRemoved = true;
              objGeneralSettings.boolEnableVoiceControl = false;

              let objModulesSettings = {};

              objModulesSettings[ strConstGeneralSettings ] = objGeneralSettings;

              Global.setStorageItems(
                  StorageSync
                , objModulesSettings
                , strPermissionsRemoveLog
                , function() {
                    $scope.saveModulesSettingsScope( objModulesSettings );

                    objLogDetails.boolAreStorageItemsSet = true;

                    onFinished( true );
                  }
                , function() {
                    objLogDetails.boolAreStorageItemsSet = false;

                    onFinished( false );
                    /**
                     * @todo Show error message to user
                     */
                  }
                , objLogDetails
              );
            }
            else {
              objLogDetails.boolIsPermissionRemoved = false;
              objLogDetails.boolAreStorageItemsSet = false;

              onFinished( false );
              /**
               * @todo Show error message to user
               */
            }
          }
        , function() {
            objLogDetails.boolIsRuntimeLastErrorNotSet = false;
            objLogDetails.boolIsPermissionRemoved = false;
            objLogDetails.boolAreStorageItemsSet = false;

            onFinished( false );
            /**
             * @todo Show error message to user
             */
          }
        , objLogDetails
        , true
      );
    } );
  };

  /**
   * When switching Options tabs (pages, subpages),
   * changes should be preserved.
   *
   * @todo Get rid of this duplicate
   *
   * @param {Object} objModulesSettings - Modules settings object.
   **/
  $scope.saveModulesSettingsScope = function( objModulesSettings ) {
    if ( typeof objModulesSettings !== 'object' ) {
      return;
    }

    var strModuleSettings, strModuleId;

    for ( strModuleSettings in objModulesSettings ) {
      if ( objModulesSettings.hasOwnProperty( strModuleSettings ) ) {
        strModuleId = strModuleSettings.replace( strConstSettingsPrefix, '' );

        $scope.$parent.objModules[ strModuleId ] = objModulesSettings[ strModuleSettings ];
      }
    }

    $scope.intChanges = 0;

    $scope.$apply();
  };

  document.getElementById( 'voiceControlActivateCta' ).addEventListener( 'click', function( objEvent ) {
    pozitoneModule.api.activateVoiceControl(
        onVoiceControlAlreadyActivated
      , onVoiceControlNotActivated
    );
  } );

  function onVoiceControlAlreadyActivated() {
    $voiceControlActivateCta.disabled = true;
    $voiceControlActivateCta.title = chrome.i18n.getMessage( 'voiceControlAlreadyActivated' );

    if ( ! boolIsOnVoiceControlDeactivationListenerSet ) {
      pozitoneModule.api.addOnVoiceControlDeactivationListener( onVoiceControlNotActivated );
      boolIsOnVoiceControlDeactivationListenerSet = true;
    }
  }

  function onVoiceControlNotActivated() {
    $voiceControlActivateCta.disabled = false;
    $voiceControlActivateCta.title = '';

    boolIsOnVoiceControlDeactivationListenerSet = false;
  }

  pozitoneModule.api.getVoiceControlStatus( function( objStatus ) {
    var boolIsConnected = objStatus.boolIsConnected;

    if ( typeof boolIsConnected === 'boolean' && boolIsConnected ) {
      onVoiceControlAlreadyActivated();
    }
  } );

  /**
   * @todo onVoiceControlNotActivated() on disconnect
   */
} );
