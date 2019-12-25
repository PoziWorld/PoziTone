// Controller for External Modules list page
optionsControllers.controller( 'ExternalModulesListCtrl', function( $scope, $rootScope ) {
  $scope.arrExternalModules = [
      {
          strModuleId : 'com_youtube'
        , strChromeUrl : 'https://chrome.google.com/webstore/detail/youtube-embedded-player-p/bajalgkbfjloemafmkiheboebghhibbg'
        , strOperaUrl : 'https://addons.opera.com/extensions/details/youtube-embedded-player-pozitone-module/'
      }
    , {
          strModuleId : 'com_soundcloud'
        , strChromeUrl : 'https://chrome.google.com/webstore/detail/soundcloud-widget-poziton/fpkahopapmbodflbcjpdejckahglfmdl?hl=en'
        , strOperaUrl : 'https://addons.opera.com/extensions/details/soundcloud-widget-pozitone-module/'
      }
    , {
          strModuleId : 'ru_sovyatnik'
        , strChromeUrl : 'https://chrome.google.com/webstore/detail/sovyatnik-pozitone-module/ihdoljplikdgegdooeohfmgaaabcbmpn'
        , strOperaUrl : 'https://addons.opera.com/extensions/details/soviatnik-pozitone-modul/'
      }
  ];

  Page.localize( strPage, '#content' );

  strSubpage = 'modules-external';
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

  /**
   * When a link leading to any website is clicked, track click.
   *
   * @type    method
   * @param   objEvent
   *            MouseEvent object.
   * @return  void
   **/

  $scope.install = function( objEvent ) {
    const strModuleId = objEvent.target.getAttribute( 'data-module-id' );
    const strUrlType = boolConstIsOperaAddon
      ? 'strOperaUrl'
      : 'strChromeUrl'
      ;
    const strUrl = $scope.arrExternalModules.filter( function( objExternalModule ) {
      return strModuleId === objExternalModule.strModuleId;
    } )[ 0 ][ strUrlType ];

    Global.createTabOrUpdate( strUrl );
  };
} );
