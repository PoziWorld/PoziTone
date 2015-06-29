var optionsApp = angular.module(
    'optionsApp'
  , [ 'ngRoute', 'optionsControllers' ]
  , function( $compileProvider ) {
      $compileProvider
        .aHrefSanitizationWhitelist(
          /^\s*(https?|ftp|mailto|chrome-extension):/
        );
    }
);

optionsApp.config( [
    '$routeProvider'
  , function( $routeProvider ) {
      $routeProvider
        .when( '/settings/:moduleId', {
            templateUrl : 'partials/settings.html'
          , controller  : 'SettingsCtrl'
        } )
        .when( '/about', {
            templateUrl : 'partials/about.html'
          , controller  : 'AboutCtrl'
        } )
        .when( '/help', {
            templateUrl : 'partials/help.html'
          , controller  : 'HelpCtrl'
        } )
        .otherwise( {
            redirectTo  : '/settings/general'
        } )
        ;
    }
] );

optionsApp.run( function( $rootScope ) {

  // Highlight a menu item corresponding to the active view on route change
  $rootScope.$on( '$routeChangeSuccess', function() {
    $rootScope.$$childHead.highlightActiveMenuItem();
  } );
} );

optionsApp.controller( 'MenuController', function( $scope, $rootScope, $location ) {

  /**
   * Get connected internal and external modules
   *
   * @type    method
   * @param   Storage
   *            Local or Sync Storage API
   * @param   $scope
   *            Object that refers to the application model;
   *            Execution context for expressions
   * @result  $scope.(in/ex)ternalModules
   *            Modules array
   * @return  void
   **/
  $scope.getModules = function( Storage ) {
    $rootScope.modules = {};

    Storage.get( null, function( objStorage ) {
      for ( var strKey in objStorage ) {
        if (
              objStorage.hasOwnProperty( strKey )
          &&  strKey.indexOf( strConstSettingsPrefix ) === 0
        ) {
          var
              strModule       = strKey.replace( strConstSettingsPrefix, '' )
            , objModule       = objStorage[ strKey ]
            ;

          objModule.id        = strModule;

          if ( Storage === StorageSync ) {
            // Check if internal module is available
            if (
                  ! Global.objModules[ strModule ]
              &&  strModule !== strConstGeneralSettingsSuffix
            ) {
              continue;
            }

            objModule.type    = 'internal';
            objModule.caption = chrome.i18n.getMessage( 'module_' + strModule );
          }
          else {
            objModule.type    = 'external';
            strModuleExternal =
              strModule.substr(
                  0
                , strModule.lastIndexOf( strConstExternalModuleSeparator )
              );
            objModule.caption = strModuleExternal;
          }

          // Keep settings in $rootScope
          $rootScope.modules[ strModule ] = objModule;
        }
      }
    } );
  };

  // Get available modules on load
  $scope.getModules( StorageSync );
  $scope.getModules( StorageLocal );

  /**
   * Highlight a menu item corresponding to the active view
   * Self-invoke
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  $scope.highlightActiveMenuItem = function() {
    var $targetMenuItem =
          document.querySelector(
            '[ng-href="#' + $location.path() + '"].menuItem'
          );

    if ( document.contains( $targetMenuItem ) ) {
      var $allMenuItemWraps = document.getElementsByClassName( 'menuItemWrap' );

      // Deselect previous active menu item
      for ( var j = 0, m = $allMenuItemWraps.length; j < m; j++ )
        $allMenuItemWraps[ j ].classList.remove( 'selected' );

      // Select current active menu item
      $targetMenuItem.parentNode.classList.add( 'selected' );
    }
  };

  // When all module menu items are templated
  $scope.$on( 'onLastModuleMenuItem', function(scope){
    scope.currentScope.highlightActiveMenuItem();
  });
} );

/**
 * List of modules navigational menu directive.
 **/
optionsApp.directive( 'moduleMenuItemDirective', function() {
  return function( scope, element, attributes ) {
    if ( scope.$last ) {
      // ng-repeat is asynchronous
      // http://www.nodewiz.biz/angular-js-final-callback-after-ng-repeat/
      setTimeout(
          function() {
            scope.$emit( 'onLastModuleMenuItem' );
          }
        , 1
      );
    }
  };
} );

/**
 * Add event listeners when all message CTAs got displayed.
 **/
optionsApp.directive( 'messageDisplayedWatcher', function() {
  return function( scope, element, attributes ) {
    // http://stackoverflow.com/a/21361421
    scope.$watch(
        function () {
          return element[ 0 ].childNodes.length;
        }
      , function ( intNewValue, intOldValue ) {
          if ( intNewValue !== intOldValue ) {
            Page.addDeveloperMessageEventListeners();
          }
        }
    );
  };
} );
