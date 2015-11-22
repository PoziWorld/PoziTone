var optionsApp = angular.module(
    'optionsApp'
  , [ 'ngRoute', 'optionsControllers' ]
  , function( $compileProvider ) {
      var
          currentImgSrcSanitizationWhitelist = $compileProvider.imgSrcSanitizationWhitelist()
        , newImgSrcSanitizationWhiteList =
              currentImgSrcSanitizationWhitelist.toString().slice( 0, -1 )
            + '|chrome-extension:'
            + currentImgSrcSanitizationWhitelist.toString().slice( -1 )
        ;

      $compileProvider
        .imgSrcSanitizationWhitelist( newImgSrcSanitizationWhiteList )
        .aHrefSanitizationWhitelist(
          /^\s*(https?|ftp|mailto|chrome-extension):/
        )
        ;
    }
);

optionsApp.config( [ '$routeProvider', function( $routeProvider ) {
  // IMPORTANT!
  // If any URLs to change, also change logic in optionsApp.run
  $routeProvider
    .when( '/settings/:moduleId', {
        templateUrl : 'partials/settings.html'
      , controller  : 'SettingsCtrl'
    } )
    .when( '/settings/modules/built-in', {
        templateUrl : 'partials/settings-modules-list.html'
      , controller  : 'SettingsModulesListCtrl'
    } )
    .when( '/settings/modules/built-in/:moduleId', {
        templateUrl : 'partials/settings.html'
      , controller  : 'SettingsCtrl'
    } )
    .when( '/projects', {
        templateUrl : 'partials/projects.html'
      , controller  : 'ProjectsCtrl'
    } )
    .when( '/contribution', {
        templateUrl : 'partials/contribution.html'
      , controller  : 'ContributionCtrl'
    } )
    .when( '/feedback', {
        templateUrl : 'partials/feedback.html'
      , controller  : 'FeedbackCtrl'
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
} ] );

optionsApp.run( function( $rootScope, $location ) {
  var strLog = strLog = 'optionsApp.run';
  Log.add( strLog, $location );

  Global.getStorageItems(
      StorageLocal
    , 'strOptionsPageToOpen'
    , strLog
    , function( objReturn ) {
        var strOptionsPageToOpen = objReturn.strOptionsPageToOpen;

        if ( strOptionsPageToOpen !== '' ) {
          var strPath = '/' + strOptionsPageToOpen;

          if ( strOptionsPageToOpen === 'modulesBuiltIn' ) {
            strPath = '/settings/modules/built-in';
          }

          var objItems = { strOptionsPageToOpen : '' };

          Global.setStorageItems(
              StorageLocal
            , objItems
            , strLog + strConstGenericStringSeparator + 'resetOptionsPageToOpen'
            , function() {
                $rootScope.boolPreventLocationOverriding = true;
                $location.path( strPath );
              }
            , undefined
            , objItems
            , true
          );
        }
      }
  );

  /**
   * Get built-in and external connected modules
   *
   * @type    method
   * @param   Storage
   *            Local or Sync Storage API
   * @return  void
   **/
  $rootScope.getModules = function( Storage ) {
    $rootScope.objModules = {};

    Storage.get( null, function( objStorage ) {
      for ( var strKey in objStorage ) {
        if (
              objStorage.hasOwnProperty( strKey )
          &&  strKey.indexOf( strConstSettingsPrefix ) === 0
        ) {
          var
              strModule       = strKey.replace( strConstSettingsPrefix, '' )
            , strModuleVar    = 'module_' + strModule
            , objModule       = objStorage[ strKey ]
            ;

          objModule.id        = strModule;

          if ( Storage === StorageSync ) {
            // Check if built-in module is available
            if (
                  ! Global.objModules[ strModule ]
              &&  strModule !== strConstGeneralSettingsSuffix
            ) {
              continue;
            }

            objModule.type    = 'built-in';
            objModule.caption = chrome.i18n.getMessage( strModuleVar );
            objModule.captionLong =
              chrome.i18n.getMessage( strModuleVar + '_long' );
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
          $rootScope.objModules[ strModule ] = objModule;
        }
      }
    } );
  };

  // Get available modules on load
  $rootScope.getModules( StorageSync );
  $rootScope.getModules( StorageLocal );

  // Track external links clicks
  var $$externalLinks = null
    , $$externalLinkTarget
    , objExternalLinkTargetDataset
    , objLogDetails = objConstUserSetUp
    , strBeingTrackedClass = 'trackExternalLink'
    , arrExternalLinkClassList
    ;

  /**
   * Find all external links and add or remove listeners.
   *
   * @type    method
   * @param   boolAddListeners
   *            Whether to add or remove listeners.
   * @param   strContainerId
   *            ID of the container of the external links.
   * @param   strPage
   *            Name of the page.
   * @param   strSubpage
   *            Optional. Name of the subpage.
   * @param   strSubsection
   *            Optional. Name of the subpage.
   * @return  void
   **/
  $rootScope.toggleExternalLinksListeners = function(
      boolAddListeners
    , strContainerId
    , strPage
    , strSubpage
    , strSubsection
  ) {
    if ( typeof boolAddListeners === 'boolean' && boolAddListeners ) {
      $$externalLinks =
        document
          .getElementById( strContainerId )
          .getElementsByClassName( 'externalLink' )
        ;

      objLogDetails.strPage = strPage;
      objLogDetails.strSubpage = strSubpage;
      objLogDetails.strSubsection = strSubsection;

      [].forEach.call( $$externalLinks, function ( $$externalLink ) {
        arrExternalLinkClassList = $$externalLink.classList;

        if ( ! $$externalLink.classList.contains( strBeingTrackedClass ) ) {
          $$externalLink.addEventListener( 'click', function( objEvent ) {
            $rootScope.trackExternalLinkClick( objEvent );
          } );

          arrExternalLinkClassList.add( strBeingTrackedClass );
        }
      } );
    }
    else if ( $$externalLinks && $$externalLinks.length ) {
      [].forEach.call( $$externalLinks, function ( $$externalLink ) {
        $$externalLink.removeEventListener( 'click', function( objEvent ) {
          $rootScope.trackExternalLinkClick( objEvent );
        } );
      } );
    }
  };

  /**
   * When a link leading to any website is clicked, track click.
   *
   * @type    method
   * @param   objEvent
   *            MouseEvent object.
   * @return  void
   **/
  $rootScope.trackExternalLinkClick = function( objEvent ) {
    // Clone
    var objLogDetailsLocal = JSON.parse( JSON.stringify( objLogDetails ) );

    $$externalLinkTarget = objEvent.target;
    objExternalLinkTargetDataset = $$externalLinkTarget.dataset;
    objLogDetailsLocal.strId =  objExternalLinkTargetDataset.id;

    if ( typeof objExternalLinkTargetDataset.params !== 'undefined' ) {
      var objParams = JSON.parse( objExternalLinkTargetDataset.params )
        , strKey
        ;

      for ( strKey in objParams ) {
        objLogDetailsLocal[ strKey ] = objParams[ strKey ];
      }
    }

    Log.add( 'externalLinkClick', objLogDetailsLocal, true );

    Global.createTabOrUpdate( $$externalLinkTarget.href );

    objEvent.preventDefault();
  };

  // Remove external links listeners
  $rootScope.$on( '$routeChangeStart', function() {
    $rootScope.toggleExternalLinksListeners( false );
  } );

  // Highlight a menu item corresponding to the active view on route change
  $rootScope.$on( '$routeChangeSuccess', function() {
    $rootScope.$$childHead.highlightActiveMenuItem();
  } );

  $rootScope.strRateUrl = strConstRateUrl;

  // Track rating stars clicks
  var $$stars = document.getElementsByClassName( 'rateCtaStar' );

  [].forEach.call( $$stars, function( $$star ) {
    $$star.addEventListener( 'click', function ( objEvent ) {
      $$target = objEvent.target;

      if ( $$target.className === 'rateCtaStar' ) {
        Log.add(
            'rateCtaClick'
          , { intRating : $$target.innerText }
          , true
        );

        Global.createTabOrUpdate( $$target.parentNode.href );

        objEvent.preventDefault();
      }
    } );
  } );
} );

optionsApp.controller( 'MenuController', function( $scope, $rootScope, $location ) {
  $scope.arrPages = [ 'projects', 'contribution', 'feedback', 'about', 'help' ];

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
            Page.addDevelopersMessageEventListeners();
          }
        }
    );
  };
} );

var optionsControllers = angular.module( 'optionsControllers', [] );

// Output string/message in the appropriate language
optionsControllers.directive( 'localize', function( $rootScope ) {
  return function localize( $scope, element, attributes ) {
    $scope.$watch( function() {
      var strId = attributes.id;

      Page.localize( strPage, '#' + strId );

      $rootScope.toggleExternalLinksListeners(
          true
        , strId
        , strPage
        , strSubpage
        , strSubsection
      );
    } );
  };
} );
