// Controller for Modules list page
optionsControllers.controller( 'SettingsModulesListCtrl', function( $scope, $rootScope ) {
  var objGlobalModules = $scope.objGlobalModules = Global.objModules;

  $scope.intModules = 0;
  $scope.intEnabledModules = 0;
  $scope.intChanges = 0;
  $scope.boolIsTogglingInProgress = false;

  var objModules = $scope.objModules
    , objModule
    , strModuleId
    ;

  chrome.permissions.getAll( function( objPermissions ) {
    var arrAllPermittedOrigins = objPermissions.origins
      , arrModuleOrigins
      , intModuleOrigins
      , intPermittedModuleOrigins
      , arrPermittedModulesIds = []
      ;

    // TODO: When all module origins are permitted, and enabled in storage,
    // only then show module as enabled.
    if (  typeof arrAllPermittedOrigins === 'object'
      &&  Array.isArray( arrAllPermittedOrigins )
    ) {
      for ( strModuleId in objGlobalModules ) {
        if ( objGlobalModules.hasOwnProperty( strModuleId ) ) {
          intPermittedModuleOrigins = 0;
          arrModuleOrigins = objGlobalModules[ strModuleId ].arrOrigins;
          intModuleOrigins = arrModuleOrigins.length;

          arrModuleOrigins.forEach( function( strOrigin ) {
            if ( arrAllPermittedOrigins.indexOf( strOrigin ) !== -1 ) {
              intPermittedModuleOrigins++;
            }
          } );

          if ( intPermittedModuleOrigins === intModuleOrigins ) {
            arrPermittedModulesIds.push( strModuleId );
          }
        }
      }

      Log.add(
          'getPermittedModules'
        , {
              arrModulesIds : arrPermittedModulesIds
            , intModules : arrPermittedModulesIds.length
          }
        , true
      );
    }
  } );

  for ( strModuleId in objModules ) {
    if (  objModules.hasOwnProperty( strModuleId )
      &&  strModuleId !== strConstGeneralSettingsSuffix
    ) {
      $scope.intModules++;

      if ( objModules[ strModuleId ].boolIsEnabled ) {
        $scope.intEnabledModules++;
      }
    }
  }

  Page.localize( strPage, '#content' );

  strSubpage = 'modules-built-in';
  strSubsection = undefined;

  Page.trackPageView( strSubpage );

  $rootScope.toggleExternalLinksListeners(
      true
    , 'content'
    , strPage
    , strSubpage
  );

  /**
   * When a link leading to any website is clicked, track click.
   *
   * @type    method
   * @param   objEvent
   *            MouseEvent object.
   * @return  void
   **/
  $scope.trackExternalLinkClick = function( objEvent ) {
    $rootScope.trackExternalLinkClick( objEvent );
  };

  // Sticky element - START
  var $$stickyElement = document.querySelector( '.initSticky' )
    , intOrigOffsetY =
          document.getElementById( 'modulesListPageHeading' ).offsetHeight
        - document.getElementById( 'modulesListForm' ).style.marginTop
    ;

  Page.initStickyElement( $$stickyElement, intOrigOffsetY );
  // Sticky element - END

  var $$checkboxes = document.getElementsByClassName( 'modulesListItemCheckbox' )
    , $$privacyStatementsContainer = document.getElementById( 'privacyStatementsContainer' )
    ;

  /**
   * Enable/disable all/chosen modules.
   *
   * @type    method
   * @param   boolEnable
   *            Whether to enable or disable.
   * @param   arrCheckboxesToSave
   *            Optional. Array of checkboxes whose new state to be saved.
   * @return  void
   **/
  $scope.toggleModules = function( boolEnable, arrCheckboxesToSave ) {
    if ( typeof boolEnable !== 'boolean' ) {
      return;
    }

    if ( $scope.boolIsTogglingInProgress ) {
      setTimeout(
          function() {
            $scope.toggleModules( boolEnable, arrCheckboxesToSave );
          }
        , 10
      );

      return;
    }

    $scope.boolIsTogglingInProgress = true;

    var strEnable = boolEnable.toString()
      , arrOrigins = []
      , objModulesSettings = {}
      , arrModulesIds = []
      , arrCheckboxesToChange = []
      ;

    [].forEach.call( arrCheckboxesToSave || $$checkboxes, function( $$checkbox ) {
      if ( $$checkbox.dataset.wasEnabled !== strEnable ) {
        var strModuleId = $$checkbox.dataset.moduleId
          , strModuleSettings = strConstSettingsPrefix + strModuleId
          ;

        arrModulesIds.push( strModuleId );
        arrCheckboxesToChange.push( $$checkbox );

        // Copy just value, no reference
        objModulesSettings[ strModuleSettings ] = JSON.parse( JSON.stringify(
          $scope.$parent.objModules[ strModuleId ]
        ) );

        objModulesSettings[ strModuleSettings ].boolIsEnabled = boolEnable;

        $scope.objGlobalModules[ strModuleId ].arrOrigins
          .forEach( function( strOrigin ) {
            arrOrigins.push( strOrigin );
          } );
      }
    } );

    if ( ! Global.isEmpty( arrOrigins ) ) {
      if ( boolEnable ) {
        $scope.enableModules(
            arrOrigins
          , objModulesSettings
          , arrModulesIds
          , arrCheckboxesToChange
        );
      }
      else {
        // TODO: Block until enable is done
        $scope.disableModules(
            arrOrigins
          , objModulesSettings
          , arrModulesIds
          , arrCheckboxesToChange
        );
      }
    }
    else {
      $scope.boolIsTogglingInProgress = false;
    }
  };

  /**
   * Enable all/chosen modules.
   *
   * @type    method
   * @param   arrOrigins
   *            List of origin permissions.
   * @param   objModulesSettings
   *            Modules settings object.
   * @param   arrModulesIds
   *            Array of IDs of the modules.
   * @param   arrCheckboxesToChange
   *            Checkboxes which need to be toggled and/or
   *            whose data needs to change.
   * @return  void
   **/
  $scope.enableModules = function(
      arrOrigins
    , objModulesSettings
    , arrModulesIds
    , arrCheckboxesToChange
  ) {
    var objLogDetails = { arrModulesIds : arrModulesIds };

    $$privacyStatementsContainer.classList.remove( 'ng-hide' );

    chrome.permissions.request(
        { permissions: [ 'tabs' ], origins : arrOrigins }
      , function( boolArePermissionsGranted ) {
          var strPermissionsRequestLog = strLog = 'enableModules';

          function onFinished() {
            $$privacyStatementsContainer.classList.add( 'ng-hide' );

            $scope.boolIsTogglingInProgress = false;

            Log.add( strPermissionsRequestLog, objLogDetails, true );
          }

          Global.checkForRuntimeError(
              function() {
                objLogDetails.boolIsRuntimeLastErrorNotSet = true;

                if ( boolArePermissionsGranted ) {
                  objLogDetails.boolArePermissionsGranted = true;

                  Global.setStorageItems(
                      StorageSync
                    , objModulesSettings
                    , strPermissionsRequestLog
                    , function() {
                        $scope.changeCheckboxesState(
                            arrCheckboxesToChange
                          , true
                        );

                        $scope.saveModulesSettingsScope( objModulesSettings );

                        objLogDetails.boolAreStorageItemsSet = true;

                        onFinished();
                      }
                    , function() {
                        objLogDetails.boolAreStorageItemsSet = false;

                        onFinished();
                        // TODO: Show error message to user
                      }
                    , objLogDetails
                  );
                }
                else {
                  objLogDetails.boolArePermissionsGranted = false;
                  objLogDetails.boolAreStorageItemsSet = false;

                  onFinished();
                  // TODO: Show error message to user
                }
              }
            , function() {
                objLogDetails.boolIsRuntimeLastErrorNotSet = false;
                objLogDetails.boolArePermissionsGranted = false;
                objLogDetails.boolAreStorageItemsSet = false;

                onFinished();
                // TODO: Show error message to user
              }
            , objLogDetails
            , true
          );
        }
    );
  };

  /**
   * Disable all/chosen modules.
   *
   * @type    method
   * @param   arrOrigins
   *            List of origin permissions.
   * @param   objModulesSettings
   *            Modules settings object.
   * @param   arrModulesIds
   *            Array of IDs of the modules.
   * @param   arrCheckboxesToChange
   *            Checkboxes which need to be toggled.
   * @return  void
   **/
  $scope.disableModules = function(
      arrOrigins
    , objModulesSettings
    , arrModulesIds
    , arrCheckboxesToChange
  ) {
    var objLogDetails = {
            arrModulesIds : arrModulesIds
          , boolIsNotRemovingTabsPermission : true
        }
      , objPermissions = { origins : arrOrigins }
      ;

    if ( $scope.intEnabledModules - arrCheckboxesToChange.length === 0 ) {
      objPermissions.permissions = [ 'tabs' ];
      objLogDetails.boolIsNotRemovingTabsPermission = false;
    }

    chrome.permissions.remove(
        objPermissions
      , function( boolArePermissionsRemoved ) {
          var strPermissionsRemoveLog = strLog = 'disableModules';

          function onFinished() {
            $scope.boolIsTogglingInProgress = false;

            Log.add( strPermissionsRemoveLog, objLogDetails, true );
          }

          Global.checkForRuntimeError(
              function() {
                objLogDetails.boolIsRuntimeLastErrorNotSet = true;

                if ( boolArePermissionsRemoved ) {
                  objLogDetails.boolArePermissionsRemoved = true;

                  Global.setStorageItems(
                      StorageSync
                    , objModulesSettings
                    , strPermissionsRemoveLog
                    , function() {
                        $scope.changeCheckboxesState(
                            arrCheckboxesToChange
                          , false
                        );

                        $scope.saveModulesSettingsScope( objModulesSettings );

                        objLogDetails.boolAreStorageItemsSet = true;

                        onFinished();
                      }
                    , function() {
                        objLogDetails.boolAreStorageItemsSet = false;

                        onFinished();
                        // TODO: Show error message to user
                      }
                    , objLogDetails
                  );
                }
                else {
                  objLogDetails.boolArePermissionsGranted = false;
                  objLogDetails.boolAreStorageItemsSet = false;

                  onFinished();
                  // TODO: Show error message to user
                }
              }
            , function() {
                objLogDetails.boolIsRuntimeLastErrorNotSet = false;
                objLogDetails.boolArePermissionsGranted = false;
                objLogDetails.boolAreStorageItemsSet = false;

                onFinished();
                // TODO: Show error message to user
              }
            , objLogDetails
            , true
          );
        }
    );
  };

  /**
   * Mark boxes checked or unchecked.
   *
   * @type    method
   * @param   arrCheckboxesToChange
   *            Checkboxes which need to be checked or unchecked.
   * @param   boolCheck
   *            Whether to check or uncheck.
   * @return  void
   **/
  $scope.changeCheckboxesState = function(
      arrCheckboxesToChange
    , boolCheck
  ) {
    if (  ! Array.isArray( arrCheckboxesToChange )
      ||  typeof boolCheck !== 'boolean'
    ) {
      return;
    }

    arrCheckboxesToChange.forEach( function( $$checkbox ) {
      if ( boolCheck ) {
        $scope.intEnabledModules++;
      }
      else {
        $scope.intEnabledModules--;
      }

      $$checkbox.dataset.wasEnabled = boolCheck;
      $$checkbox.checked = boolCheck;
      delete $$checkbox.dataset.toSave;
    } );

    $scope.$apply();
  };

  /**
   * Remember new module state until one of the buttons is clicked.
   *
   * @type    method
   * @param   $event
   *            Event object.
   * @return  void
   **/
  $scope.prepareModuleForSaving = function( $event ) {
    var $$target = $event.target;

    // Gets saved as string, not boolean
    if ( typeof $$target.dataset.toSave !== 'string' ) {
      $$target.dataset.toSave = true;
      $scope.intChanges++;
    }
    else {
      delete $$target.dataset.toSave;
      $scope.intChanges--;
    }
  };

  /**
   * Enable checked modules and disable unchecked.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  $scope.saveChanges = function() {
    var arrEnabledCheckboxesToSave = []
      , arrDisabledCheckboxesToSave = []
      ;

    [].forEach.call( $$checkboxes, function( $$checkbox ) {
      if ( typeof $$checkbox.dataset.toSave === 'string' ) {
        if ( $$checkbox.dataset.wasEnabled === 'false' ) {
          arrEnabledCheckboxesToSave.push( $$checkbox );
        }
        else {
          arrDisabledCheckboxesToSave.push( $$checkbox );
        }
      }
    } );

    if ( ! Global.isEmpty( arrEnabledCheckboxesToSave ) ) {
      $scope.toggleModules( true, arrEnabledCheckboxesToSave );
    }

    if ( ! Global.isEmpty( arrDisabledCheckboxesToSave ) ) {
      $scope.toggleModules( false, arrDisabledCheckboxesToSave );
    }
  };

  /**
   * When switching Options tabs (pages, subpages),
   * changes should be preserved.
   *
   * @type    method
   * @param   objModulesSettings
   *            Modules settings object.
   * @return  void
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
} );
