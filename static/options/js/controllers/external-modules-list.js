// Controller for External Modules list page
optionsControllers.controller( 'ExternalModulesListCtrl', function( $scope, $rootScope ) {
  $scope.arrExternalModules = [
    {
      strModuleId: 'com_youtube',
      url: {
        chrome: 'https://chrome.google.com/webstore/detail/youtube-embedded-player-p/bajalgkbfjloemafmkiheboebghhibbg',
        opera: 'https://addons.opera.com/extensions/details/youtube-embedded-player-pozitone-module/',
        edge: 'https://microsoftedge.microsoft.com/addons/detail/endgoolfeicagiackhdalbfkinelcgin',
      },
    },
    {
      strModuleId: 'com_soundcloud',
      url: {
        chrome: 'https://chrome.google.com/webstore/detail/soundcloud-widget-poziton/fpkahopapmbodflbcjpdejckahglfmdl?hl=en',
        opera: 'https://addons.opera.com/extensions/details/soundcloud-widget-pozitone-module/',
        edge: 'https://microsoftedge.microsoft.com/addons/detail/imijjplgbohoagfnhbdlfhfcgfikgjab',
      },
    },
    {
      strModuleId: 'ru_sovyatnik',
      url: {
        chrome: 'https://chrome.google.com/webstore/detail/sovyatnik-pozitone-module/ihdoljplikdgegdooeohfmgaaabcbmpn',
        opera: 'https://addons.opera.com/extensions/details/soviatnik-pozitone-modul/',
        edge: 'https://microsoftedge.microsoft.com/addons/detail/fkgcpgookmofjfedpfhadkgkhddcdbpp',
      },
    },
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
    const moduleId = objEvent.target.getAttribute( 'data-module-id' );
    const MATCHING_RESULT_INDEX = 0;
    const MODULE_DETAILS_URL_KEY = 'url';
    const url = $scope.arrExternalModules.filter( function ( externalModuleDetails ) {
      return moduleId === externalModuleDetails.strModuleId;
    } )[ MATCHING_RESULT_INDEX ][ MODULE_DETAILS_URL_KEY ][ poziworldExtension.utils.getExtensionStoreType() ];

    Global.createTabOrUpdate( url );
  };
} );
