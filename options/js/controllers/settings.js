// Controller for General and Modules' Settings
optionsControllers.controller( 'SettingsCtrl',  function(
    $scope
  , $rootScope
  , $route
  , $routeParams
  , $location
) {
  // If there are no enabled modules, show modules list - START
  var objModules = $rootScope.objModules
    , strKey
    , intEnabledModules = 0
    , objModule
    , boolIsEnabled
    ;

  for ( strKey in objModules ) {
    if ( objModules.hasOwnProperty( strKey ) ) {
      objModule = objModules[ strKey ];
      boolIsEnabled = objModule.boolIsEnabled;

      if ( typeof boolIsEnabled === 'boolean' && boolIsEnabled ) {
        intEnabledModules++;
      }
    }
  }

  if (  intEnabledModules === 0
    &&  typeof $rootScope.boolWasPageJustOpened !== 'boolean'
  ) {
    $rootScope.boolWasPageJustOpened = true;

    var boolPreventLocationOverriding = $rootScope.boolPreventLocationOverriding;

    if (  typeof boolPreventLocationOverriding !== 'boolean'
      ||  ! boolPreventLocationOverriding
    ) {
      $location.path( '/settings/modules/built-in' );
      return;
    }
  }
  // If there are no enabled modules, show modules list - END

  var boolShowAdvancedSettings = $rootScope.objModules[ strConstGeneralSettingsSuffix ].boolShowAdvancedSettings
    , strRouteModuleId = $routeParams.moduleId
    , strModuleId = strRouteModuleId || strConstGeneralSettingsSuffix
    ;

  objModule = $rootScope.objModules[ strModuleId ];

      // Buttons
  var arrAvailableNotificationButtons = objModule.arrAvailableNotificationButtons
    , arrActiveNotificationButtons = objModule.arrActiveNotificationButtons
      // Icon Formats
    , arrAvailableNotificationIconFormats = objModule.arrAvailableNotificationIconFormats
      // Title Formats
    , arrAvailableNotificationTitleFormats = objModule.arrAvailableNotificationTitleFormats
    ;

  // Remember chosen settings subpage
  strChosenSettingsSubpage = strModuleId;

  // When settings get saved, they use strChosenSettingsSubpage.
  // But this one belongs only to general, thus we need to have a way
  // to override strChosenSettingsSubpage.
  if ( typeof boolShowAdvancedSettings === 'boolean' ) {
    $scope.boolShowAdvancedSettings = boolShowAdvancedSettings;
    $scope.strConstGeneralSettingsSuffix = strConstGeneralSettingsSuffix;
  }

  // Checks if array is not empty.
  // If so, creates it in $scope.
  function checkArray( arrVar, strArrVarName ) {
    if ( Array.isArray( arrVar ) && ! Global.isEmpty( arrVar ) ) {
      $scope[ strArrVarName ] = arrVar;

      return true;
    }

    return false;
  }

  $scope.objModule = objModule;

  // Available buttons
  $scope.boolProvidesButtons =
    checkArray(
        arrAvailableNotificationButtons
      , 'arrAvailableNotificationButtons'
    );

  // Active buttons
  $scope.boolHasActiveButtons =
    checkArray(
        arrActiveNotificationButtons
      , 'arrActiveNotificationButtons'
    );

  // Icon Formats
  $scope.boolProvidesIconFormats =
    checkArray(
        arrAvailableNotificationIconFormats
      , 'arrAvailableNotificationIconFormats'
    );

  // Title Formats
  $scope.boolProvidesTitleFormats =
    checkArray(
        arrAvailableNotificationTitleFormats
      , 'arrAvailableNotificationTitleFormats'
    );

  $scope.format = 'M/d/yy h:mm:ss a';

  // $includeContentLoaded doesn't trigger on Voice control page
  if ( ! strRouteModuleId ) {
    $settingsSaved = document.getElementById( 'settingsSaved' );
  }

  // On settings page loaded
  $scope.$on( '$includeContentLoaded', function( $scope ) {
    Options.setPageValues();

    Page.localize( strPage, '#content' );

    strSubpage = 'settings';
    strSubsection = strModuleId;

    Page.trackPageView( strSubpage, strSubsection );

    $rootScope.toggleExternalLinksListeners(
        true
      , 'content'
      , strPage
      , strSubpage
      , strSubsection
    );
  } );

  /**
   * TODO
   *
   * @type    method
   * @param   funcResolve
   * @param   funcReject
   * @return  void
   **/

  $scope.requestManagementPermission = function( funcResolve, funcReject ) {
    // TODO
    funcReject();
  };

  /**
   * Force "page refresh" if some changes can be reflected only after refresh.
   **/

  $scope.forcePageRefresh = function() {
    $route.reload();
  };

  /**
   * Save new setting value.
   *
   * @param {(Event|Object)} event - Event object.
   * @param {string} [groupModel] - Checkbox group model name.
   * @param {string} [moduleOverride] - If the setting belongs to a different module, then the rest on the current Options page.
   * @param {function} [callbackBefore] - Additional logic to do before saving.
   * @param {function} [callbackAfter] - Additional logic to do after saving.
   **/

  $scope.inputChange = function ( event, groupModel, moduleOverride, callbackBefore, callbackAfter ) {
    if ( poziworldExtension.utils.isType( callbackBefore, 'function' ) ) {
      new Promise( callbackBefore )
        .then( onSettingChange.bind( null, event, groupModel, moduleOverride, callbackAfter ) );
    }
    else {
      onSettingChange( event, groupModel, moduleOverride, callbackAfter );
    }
  };

  /**
   * Handle dropdown (select) value change.
   *
   * @param {string} id - Dropdown element ID attribute.
   * @param callback
   */

  $scope.handleDropdownChange = function ( id, callback ) {
    this.$parent.inputChange(
      {
        target: document.getElementById( id ),
      },
      undefined,
      undefined,
      undefined,
      callback
    );
  };

  /**
   * Apply the UI language change.
   */

  $scope.changeUiLanguage = function () {
    pozitone.global.reloadExtensionAndOptions( 'settingsGeneral', 'changeUiLanguage' );
  };

  /**
   * Process the setting change.
   *
   * @param {(Event|Object)} $event - Event object.
   * @param {string} [strGroupModel] - Checkbox group model name.
   * @param {string} [strModuleOverride] - If the setting belongs to a different module, then the rest on the current Options page.
   * @param {function} [funcDoAfter] - Additional logic to do after saving.
   */

  function onSettingChange( $event, strGroupModel, strModuleOverride, funcDoAfter ) {
    Options.onSettingChange( $event, strModuleOverride );

    var _target     = $event.target
      , strName     = _target.name
      , strValue    = _target.value
      , boolChecked = _target.checked
      ;

    // ng-model doesn't work right for checkbox group
    if ( typeof strGroupModel === 'string' ) {
      var arrGroup = $scope.objModule[ strGroupModel ];

      // Save if just selected and not in array yet
      if ( boolChecked && ~~ arrGroup.indexOf( strValue ) ) {
        arrGroup.push( strValue );
      }
      // Remove if just unselected and in array
      else if ( ! boolChecked && ~ arrGroup.indexOf( strValue ) ) {
        arrGroup.splice( arrGroup.indexOf( strValue ), 1 );
      }
    }

    // model doesn't get changed for some reason
    if ( typeof strModuleOverride === 'string' ) {
      if ( _target.type === 'checkbox' ) {
        $scope[ strName ] = boolChecked;
        $rootScope.objModules[ strModuleOverride ][ strName ] = boolChecked;
      }
    }

    // Track setting change if needed
    if ( _target.getAttribute( 'data-track-setting-change' ) ) {
      var miscTrackedValue;

      // TODO: Add other types
      if ( _target.type === 'checkbox' ) {
        miscTrackedValue = boolChecked;
      }
      else if ( _target.tagName === 'SELECT' ) {
        miscTrackedValue = _target.value;
      }

      chrome.runtime.sendMessage(
        {
            strReceiver     : 'background'
          , strLog          : 'settingChange'
          , objVars         : {
                strName     : strName
              , miscValue   : miscTrackedValue
              , strModule   : strModuleId
            }
        }
      );
    }

    if ( typeof funcDoAfter === 'function' ) {
      funcDoAfter();
    }
  }
} );
