// Controller for Our Projects page
optionsControllers.controller( 'ProjectsCtrl', function( $scope, $rootScope ) {
  $scope.boolIsNotOperaAddon = ! boolConstIsOperaAddon;

  $scope.arrProjects = [
      {
          strName : 'Scroll To Top Button'
        , strAbbreviation : 'sttb'
        , strImageFileName : 'sttb-icon-38.svg'
        , strChromeLink : 'https://chrome.google.com/webstore/detail/scroll-to-top-button/chinfkfmaefdlchhempbfgbdagheknoj'
        , strOperaLink : 'https://addons.opera.com/extensions/details/scroll-to-top-button/'
      }
    , {
          strName : 'Print Waste Minimizer'
        , strAbbreviation : 'pwm'
        , strImageFileName : 'pwm-icon-128.svg'
        , strChromeLink : 'https://chrome.google.com/webstore/detail/print-waste-minimizer/nhglpabogkpplpcemgiaopjoehcpajdk'
        , strOperaLink : 'https://addons.opera.com/extensions/details/print-waste-minimizer/'
      }
  ];

  Page.localize( strPage, '#content' );

  strSubpage = 'projects';
  strSubsection = undefined;

  Page.trackPageView( strSubpage );

  $rootScope.toggleExternalLinksListeners(
      true
    , 'content'
    , strPage
    , strSubpage
  );
} );

// Controller for Contribution page
optionsControllers.controller( 'ContributionCtrl', function( $scope, $rootScope ) {
  Page.localize( strPage, '#content' );

  strSubpage = 'contribution';
  strSubsection = undefined;

  Page.trackPageView( strSubpage );

  $rootScope.toggleExternalLinksListeners(
      true
    , 'content'
    , strPage
    , strSubpage
  );

  document.getElementById( 'installationLink' ).href = strConstInstallationUrl;
  document.getElementById( 'rateLink' ).href = strConstRateUrl;
} );

// Controller for Feedback page
optionsControllers.controller( 'FeedbackCtrl', function( $scope, $rootScope ) {
  Page.localize( strPage, '#content' );

  strSubpage = 'feedback';
  strSubsection = undefined;

  Page.trackPageView( strSubpage );

  $rootScope.toggleExternalLinksListeners(
      true
    , 'content'
    , strPage
    , strSubpage
  );

  document.getElementById( 'reviewLink' ).href = strConstRateUrl;
  document.getElementById( 'bugLink' ).href = strConstBugsUrl;
  document.getElementById( 'incentiveLink' ).href = objConst.strIncentiveCarrotUrl;
} );

// Controller for About page
optionsControllers.controller( 'AboutCtrl', function( $scope, $rootScope ) {
  document.getElementById( 'logo' ).alt = strConstExtensionName;
  document.getElementById( 'name' ).textContent = strConstExtensionName;
  document.getElementById( 'version' ).textContent = strConstExtensionVersionName;

  Page.localize( strPage, '#content' );

  strSubpage = 'about';
  strSubsection = undefined;

  Page.trackPageView( strSubpage );

  $rootScope.toggleExternalLinksListeners(
      true
    , 'content'
    , strPage
    , strSubpage
  );
} );

// Controller for Help page
optionsControllers.controller( 'HelpCtrl', function( $scope ) {
  Options.removeNotAvailable();
  Page.localize( strPage, '#content' );

  strSubpage = 'help';
  strSubsection = undefined;

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
} );
