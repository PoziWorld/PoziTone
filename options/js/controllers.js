var optionsControllers = angular.module( 'optionsControllers', [] );

// Controller for General and Modules' Settings
optionsControllers.controller( 'SettingsCtrl',
  function( $scope, $rootScope, $routeParams ) {
    var
        boolShowAdvancedSettings              =
          $rootScope
            .modules[ strConstGeneralSettingsSuffix ]
              .boolShowAdvancedSettings

      , strModuleId                           = $routeParams.moduleId
      , objModule                             =
          $rootScope.modules[ strModuleId ]
        // Buttons
      , arrAvailableNotificationButtons       =
          objModule.arrAvailableNotificationButtons
      , arrActiveNotificationButtons          =
          objModule.arrActiveNotificationButtons

        // Title Formats
      , arrAvailableNotificationTitleFormats  =
          objModule.arrAvailableNotificationTitleFormats
      ;

    // Remember chosen settings subpage
    strChosenSettingsSubpage = strModuleId;

    // When settings get saved, they use strChosenSettingsSubpage.
    // But this one belongs only to general, thus we need to have a way
    // to override strChosenSettingsSubpage.
    if ( typeof boolShowAdvancedSettings === 'boolean' ) {
      $scope.boolShowAdvancedSettings         = boolShowAdvancedSettings;
      $scope.strConstGeneralSettingsSuffix    = strConstGeneralSettingsSuffix;
    }

    // Checks if array is not empty.
    // If so, creates it in $scope.
    function checkArray( arrVar, strArrVarName ) {
      if (
            Array.isArray( arrVar )
        &&  ! Global.isEmpty( arrVar )
      ) {
        $scope[ strArrVarName ] = arrVar;

        return true;
      }

      return false;
    }

    $scope.objModule                          = objModule;

    // Available buttons
    $scope.boolProvidesButtons                =
      checkArray(
          arrAvailableNotificationButtons
        , 'arrAvailableNotificationButtons'
      );

    // Active buttons
    $scope.boolHasActiveButtons               =
      checkArray(
          arrActiveNotificationButtons
        , 'arrActiveNotificationButtons'
      );

    // Title Formats
    $scope.boolProvidesTitleFormats           =
      checkArray(
          arrAvailableNotificationTitleFormats
        , 'arrAvailableNotificationTitleFormats'
      );

    $scope.format                             = 'M/d/yy h:mm:ss a';

    // On settings page loaded
    $scope.$on( '$includeContentLoaded', function( $scope ) {
      Options.setPageValues();
      Page.localize( strPage, '#content' );
      Page.trackPageView( 'settings', strModuleId );
    } );

    // On setting change
    $scope.inputChange = function( $event, strGroupModel, strModuleOverride ) {
      Options.onSettingChange( $event, strModuleOverride );

      var
          _target     = $event.target
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
          $rootScope.modules[ strModuleOverride ][ strName ] = boolChecked;
        }
      }

      // Track setting change if needed
      if ( _target.getAttribute( 'data-track-setting-change' ) ) {
        var miscTrackedValue;

        // TODO: Add other types
        if ( _target.type === 'checkbox' ) {
          miscTrackedValue = boolChecked;
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
    };
  }
);

// Output string/message in the appropriate language
optionsControllers.directive( 'localize', function() {
  return function localize( scope, element, attributes ) {
    scope.$watch( function() {
      Page.localize( strPage, '#' + attributes.id );
    } );
  };
} );

// Controller for About page
optionsControllers.controller( 'AboutCtrl', [ '$scope',
  function( $scope ) {
    Options.displayCurrentVersion();
    Page.localize( strPage, '#content' );
    Page.trackPageView( 'about' );
  } ]
);

// Controller for Help page
optionsControllers.controller( 'HelpCtrl', [ '$scope',
  function( $scope ) {
    Options.removeNotAvailable();
    Page.localize( strPage, '#content' );
    Page.trackPageView( 'help' );

    // Show debug info
    var strHtml = '';

    for ( var miscProperty in objConstUserSetUp ) {
      if ( objConstUserSetUp.hasOwnProperty( miscProperty ) ) {
        strHtml += Page.template(
            'helpInfoToSubmitTmpl'
          , {
                key   : miscProperty
              , value : objConstUserSetUp[ miscProperty ]
            }
        );
      }
    }

    if ( strHtml !== '' )
      document.getElementById( strHelpInfoToSubmitId ).innerHTML = strHtml;
  } ]
);
