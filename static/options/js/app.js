var optionsApp = angular.module(
    'optionsApp'
  , [ 'ngRoute', 'optionsControllers' ]
  , function( $compileProvider ) {
      var currentImgSrcSanitizationWhitelist = $compileProvider.imgSrcSanitizationWhitelist();
      var newImgSrcSanitizationWhiteList =
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

/**
 * Resolve promise.
 *
 * @callback funcResolve
 */

/**
 * Reject promise.
 *
 * @callback funcReject
 */

optionsApp.service( 'OptionsPageToOpenService', function( $rootScope, $location ) {
  var promise = new Promise( function( funcResolve, funcReject ) {
    Global.getStorageItems(
        StorageLocal
      , 'strOptionsPageToOpen'
      , strLog
      , function( objReturn ) {
          var strOptionsPageToOpen = objReturn.strOptionsPageToOpen;

          if ( strOptionsPageToOpen !== '' ) {
            var strPath = '/' + strOptionsPageToOpen;

            if ( strOptionsPageToOpen === 'settingsGeneral' ) {
              strPath = '/settings/general';
            }
            else if ( strOptionsPageToOpen === 'modulesBuiltIn' ) {
              strPath = '/settings/modules/built-in';
            }
            else if ( strOptionsPageToOpen === 'modulesExternal' ) {
              strPath = '/settings/modules/external';
            }
            else if ( strOptionsPageToOpen === 'voiceControl' ) {
              strPath = '/settings/voice-control';
            }

            var objItems = {
                boolOpenOptionsPageOnRestart : false
              , strOptionsPageToOpen : ''
            };

            Global.setStorageItems(
                StorageLocal
              , objItems
              , strLog + strConstGenericStringSeparator + 'resetOptionsPageToOpen'
              , function() {
                  funcResolve();

                  $rootScope.boolPreventLocationOverriding = true;
                  $location.path( strPath );
                }
              , undefined
              , objItems
              , true
            );
          }
          else {
            funcResolve();
          }
        }
    );
  } );

  return {
      promise : promise
  };
} );

/**
 * Get built-in and external connected modules.
 *
 * @todo Replace with Global.getModules().
 *
 * @param {Storage} Storage - Local or Sync Storage API.
 * @param $rootScope
 * @param {funcResolve} funcResolve - Resolve promise.
 * @param {funcReject} funcReject - Reject promise.
 **/

function getModules( Storage, $rootScope, funcResolve, funcReject ) {
  var arrModulesNames = $rootScope.arrModulesNames;

  /**
   * @todo Switch to Global.getStorageItems().
   */
  Storage.get( null, function( objStorage ) {
    for ( var strKey in objStorage ) {
      if ( objStorage.hasOwnProperty( strKey ) && strKey.indexOf( strConstSettingsPrefix ) === 0 ) {
        var strModule = strKey.replace( strConstSettingsPrefix, '' );
        var objGlobalModule = Global.objModules[ strModule ];
        var objModule = objStorage[ strKey ];

        objModule.id = strModule;

        /**
         * @todo Avoid confusion when StorageSync === StorageLocal.
         */
        if ( Storage === StorageSync ) {
          // Check if built-in module is available
          if ( ! objGlobalModule && strModule !== strConstGeneralSettingsSuffix ) {
            continue;
          }

          var strModuleVar = 'module_' + strModule;

          objModule.type = 'built-in';
          objModule.caption = poziworldExtension.i18n.getMessage( strModuleVar );
          objModule.captionLong = poziworldExtension.i18n.getMessage( strModuleVar + '_long' );

          if ( objGlobalModule ) {
            var boolIsAvailable = objGlobalModule.boolIsAvailable;

            objModule.boolIsAvailable = typeof boolIsAvailable !== 'boolean' || boolIsAvailable;
          }

          if ( strModule !== strConstGeneralSettingsSuffix ) {
            arrModulesNames.push( {
                strModuleId : strModule
              , strModuleName :  objModule.caption
            } );
          }

          $rootScope.intModulesBuiltIn++;
        }
        else {
          var strModuleExternal = strModule.substr( 0, strModule.lastIndexOf( strConstExternalModuleSeparator ) );

          objModule.type = 'external';
          objModule.caption = strModuleExternal;
          /**
           * @todo Get i18n variotions of name.
           */
          objModule.name = objStorage[ strKey ].strName || strModuleExternal;

          arrModulesNames.push( {
              strModuleId : strModule
            , strModuleName :  objModule.name
          } );

          $rootScope.intModulesExternal++;

          /**
           * @todo Avoid name clashes.
           */
          $rootScope.objExternalModules[ strModuleExternal ] = objModule;
        }

        // Keep settings in $rootScope
        $rootScope.objModules[ strModule ] = objModule;
      }
    }

    /*
     * Sort modules by name disregarding letter case.
     *
     * Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Sorting_with_map
     */

    // temporary array holds objects with position and sort-value
    var mapped = arrModulesNames.map( function( el, i ) {
      return { index: i, value: el.strModuleName.toLowerCase() };
    } );

    // sorting the mapped array containing the reduced values
    mapped.sort( function( a, b ) {
      return +( a.value > b.value ) || +( a.value === b.value ) - 1;
    } );

    // container for the resulting order
    $rootScope.arrModulesNames = mapped.map( function( el ) {
      return arrModulesNames[ el.index ];
    } );

    funcResolve();
  } );
}

optionsApp.service( 'ModulesBuiltInService', function( $rootScope ) {
  var promise = new Promise( function( funcResolve, funcReject ) {
    getModules( StorageSync, $rootScope, funcResolve, funcReject );
  } );

  return {
      promise : promise
  };
} );

optionsApp.service( 'ModulesExternalService', function( $rootScope ) {
  var promise = new Promise( function( funcResolve, funcReject ) {
    getModules( StorageLocal, $rootScope, funcResolve, funcReject );
  } );

  return {
      promise : promise
  };
} );

optionsApp.config( function( $routeProvider ) {
  var resolve = {
      'OptionsPageToOpenServiceData' : function( OptionsPageToOpenService ) {
        return OptionsPageToOpenService.promise;
      }
    , 'ModulesBuiltInServiceData' : function( ModulesBuiltInService ) {
        return ModulesBuiltInService.promise;
      }
    , 'ModulesExternalServiceData' : function( ModulesExternalService ) {
        return ModulesExternalService.promise;
      }
  };

  // IMPORTANT!
  // If any URLs to change, also change logic in optionsApp.run
  $routeProvider
    .when( '/settings/voice-control', {
        templateUrl : 'partials/voice-control.html'
      , controller : 'VoiceControlCtrl'
      , resolve : resolve
    } )
    .when( '/settings/:moduleId', {
        templateUrl : 'partials/settings.html'
      , controller : 'SettingsCtrl'
      , resolve : resolve
    } )
    .when( '/settings/modules/built-in', {
        templateUrl : 'partials/settings-modules-list.html'
      , controller : 'SettingsModulesListCtrl'
      , resolve : resolve
    } )
    .when( '/settings/modules/built-in/:moduleId', {
        templateUrl : 'partials/settings.html'
      , controller : 'SettingsCtrl'
      , resolve : resolve
    } )
    .when( '/settings/modules/external', {
        templateUrl : 'partials/external-modules-list.html'
      , controller : 'ExternalModulesListCtrl'
      , resolve : resolve
    } )
    .when( '/settings/modules/external/:moduleId', {
        templateUrl : 'partials/settings.html'
      , controller : 'SettingsCtrl'
      , resolve : resolve
    } )
    .when( '/projects', {
        templateUrl : 'partials/projects.html'
      , controller : 'ProjectsCtrl'
      , resolve : resolve
    } )
    .when( '/contribution', {
        templateUrl : 'partials/contribution.html'
      , controller : 'ContributionCtrl'
      , resolve : resolve
    } )
    .when( '/feedback', {
        templateUrl : 'partials/feedback.html'
      , controller : 'FeedbackCtrl'
      , resolve : resolve
    } )
    .when( '/about', {
        templateUrl : 'partials/about.html'
      , controller : 'AboutCtrl'
      , resolve : resolve
    } )
    .when( '/help', {
        templateUrl : 'partials/help.html'
      , controller : 'HelpCtrl'
      , resolve : resolve
    } )
    .when( '/❤', {
        templateUrl : 'partials/❤.html'
      , controller : '❤Ctrl'
      , resolve : resolve
    } )
    .otherwise( {
        redirectTo  : '/settings/general'
    } )
    ;
} );

optionsApp.run( function( $rootScope, $location ) {
  var strLog = strLog = 'optionsApp.run';
  Log.add( strLog, $location );

  $rootScope.objModules = {};
  $rootScope.objExternalModules = {};
  $rootScope.arrModulesNames = [];
  $rootScope.intModulesBuiltIn = 0;
  $rootScope.intModulesExternal = 0;

  // Track external links clicks
  var $$externalLinks = null
    , $$externalLinkTarget
    , objExternalLinkTargetDataset
    , objLogDetails = objConstUserSetUp
    , strBeingTrackedClass = 'trackExternalLink'
    , arrExternalLinkClassList
    ;

  const objExternalLinks = {
      'features' : {
          'ru' : 'https://github.com/PoziWorld/PoziTone/blob/develop/README_ru.md#Возможности'
        , 'default' : 'https://github.com/PoziWorld/PoziTone/blob/develop/README_en.md#features'
      }
  };

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

        // Insert href
        const strId = $$externalLink.getAttribute( 'data-id' );

        if ( strId !== '' && strId in objExternalLinks ) {
          const strRequestedLang = $$externalLink.getAttribute( 'data-lang' );
          const objLinks = objExternalLinks[ strId ];
          const strChosenLang = strRequestedLang in objLinks
            ? strRequestedLang
            : 'default'
            ;

          $$externalLink.href = objLinks[ strChosenLang ];
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

  /**
   * Content pages need scroll enforced in Material Design-enabled Extensions page.
   * Otherwise, they spread to 100vh, but are not scrollable.
   *
   * @param {Object} objNewRoute - Details about the route being loaded.
   */

  $rootScope.checkScrollEnforcement = function ( objNewRoute ) {
    const objRouteConfig = objNewRoute.$$route;

    if ( objRouteConfig ) {
      const strController = objRouteConfig.controller;

      if ( typeof strController === 'string' && strController !== '' ) {
        document.documentElement.setAttribute( 'data-scrollable', strController.replace( 'Ctrl', '' ) !== decodeURIComponent( escape ( window.atob( '4p2k' ) ) ) )
      }
    }
  };

  // Remove external links listeners
  $rootScope.$on( '$routeChangeStart', function() {
    $rootScope.toggleExternalLinksListeners( false );
  } );

  // Highlight a menu item corresponding to the active view on route change
  $rootScope.$on( '$routeChangeSuccess', function() {
    $rootScope.$$childHead.highlightActiveMenuItem();
    $rootScope.checkScrollEnforcement( arguments[ 1 ] );
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
  $scope.arrPages = [ 'projects', 'contribution', 'feedback', 'about', 'help', '❤' ];

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

      // Select current active menu item and make sure it's in viewport
      const $active = $targetMenuItem.parentNode;

      $active.classList.add( 'selected' );

      // In Chrome, on Options page load, it starts from a small size window,
      // then gets resized. Wait for the resize to finish.
      // 'resize' event fired twice. First one, when window.innerHeight is 150px.
      if ( window.innerHeight > 150 ) {
        scrollIntoViewIfNeeded( $active );
      }
      else {
        function delayedScrollIntoViewIfNeeded() {
          scrollIntoViewIfNeeded( $active );
        }

        window.removeEventListener( 'resize', delayedScrollIntoViewIfNeeded );
        window.addEventListener( 'resize', delayedScrollIntoViewIfNeeded );
      }
    }
  };

  // When all module menu items are templated
  $scope.$on( 'onLastModuleMenuItem', function( scope ) {
    scope.currentScope.highlightActiveMenuItem();
  } );

  /**
   * If the element is not in the viewport at the moment, scroll until it is.
   *
   * @param {Node} $element - The element to scroll into view.
   */

  function scrollIntoViewIfNeeded( $element ) {
    if ( ! isElementInViewport( $element.firstElementChild ) ) {
      $element.scrollIntoView( {
          behavior : 'smooth'
        , block : 'end'
      } );
    }
  }

  /**
   * @copyright https://gist.github.com/davidtheclark/5515733
   */

  function isElementInViewport( $el ) {
    var rect = $el.getBoundingClientRect();

    return (
          rect.top >= 0
      &&  rect.left >= 0
      &&  rect.bottom <= ( window.innerHeight || document.documentElement.clientHeight )
      &&  rect.right <= ( window.innerWidth || document.documentElement.clientWidth )
    );
  }
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

      poziworldExtension.i18n.init()
        .then( Page.localize.bind( null, strPage, '#' + strId ) );

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
