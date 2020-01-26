// Controller for Sister Projects page
optionsControllers.controller( 'ProjectsCtrl', function( $scope, $rootScope ) {
  $scope.boolIsNotOperaAddon = ! boolConstIsOperaAddon;

  $scope.arrProjects = [
      {
          strName : 'Swaggy'
        , strAbbreviation : 'swaggy'
        , strImageFileName : 'swaggy-icon-48.svg'
          /**
           * @todo More suitable var names
           */
        , strChromeLink : 'https://chrome.google.com/webstore/detail/beblcchllamebejoakjbhhajpmlkjoaf'
        , strOperaLink : 'https://chrome.google.com/webstore/detail/beblcchllamebejoakjbhhajpmlkjoaf'
      }
    , {
          strName : 'PoziWorld Elf'
        , strAbbreviation : 'pe'
        , strImageFileName : 'pe-icon-64.png'
          /**
           * @todo More suitable var names
           */
        , strChromeLink : 'https://github.com/PoziWorld/PoziWorld-Elf'
        , strOperaLink : 'https://github.com/PoziWorld/PoziWorld-Elf'
      }
    , {
          strName : 'Scroll To Top Button'
        , strAbbreviation : 'sttb'
        , strImageFileName : 'sttb-icon-50.svg'
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

  document.getElementById( 'installationLink' ).href = pozitone.global.getInstallationUrl();
  document.getElementById( 'rateLink' ).href = pozitone.global.getRatingUrl();
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

  document.getElementById( 'reviewLink' ).href = pozitone.global.getRatingUrl();
  document.getElementById( 'bugLink' ).href = pozitone.global.getFeedbackUrl();
  document.getElementById( 'incentiveLink' ).href = objConst.strIncentiveCarrotUrl;
} );

// Controller for About page
optionsControllers.controller( 'AboutCtrl', function( $scope, $rootScope ) {
  document.getElementById( 'logo' ).alt = strConstExtensionName;
  document.getElementById( 'name' ).textContent = strConstExtensionName;
  document.getElementById( 'version' ).textContent = strConstExtensionVersionName;

  Page.localize( strPage, '#content' );
  setLinks();

  strSubpage = 'about';
  strSubsection = undefined;

  Page.trackPageView( strSubpage );

  $rootScope.toggleExternalLinksListeners(
      true
    , 'content'
    , strPage
    , strSubpage
  );

  /**
   * Some links come from the translation files and don't have URLs, so it's easier to make updates to the URLs.
   * Others use Markdown, so the markup is not hardcoded in the translation files.
   */

  function setLinks() {
    const translationPortalLink = document.querySelector( '[data-id="translation"]' );
    const translatedByText = document.getElementById( 'translatedBy' );

    if ( translationPortalLink ) {
      translationPortalLink.href = strConstTranslationUrl;
    }

    if ( translatedByText ) {
      translatedByText.innerHTML = translatedByText.innerHTML.replace(
          // Markdown-style link: [John Doe](https://www.transifex.com/user/profile/john.doe777/)
          /(\[)([^\]]+\.?)(\])(\()(http[s]:\/\/(-\.)?([^\s\/?\.\#\-]+\.?)+(\/[^\s]*)?)(\))/g
        , '<a href="$5" target="_blank" class="externalLink" data-id="translator" data-params="{ &quot;strTranslator&quot; : &quot;$2&quot; }">$2</a>'
      );
    }
  }
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

// Controller for ❤ page
optionsControllers.controller( '❤Ctrl', function( $scope ) {
  document.getElementById( 'header' ).hidden = true;
  document.getElementById( 'toolbar' ).hidden = true;
  document.getElementById( 'footer' ).hidden = true;

  const $$ascii = document.getElementById( '❤❤' );
  const strReadyAttribute = 'data-ready';
  const boolIsReady = JSON.parse( $$ascii.getAttribute( strReadyAttribute ) );

  if ( ! boolIsReady ) {
    $$ascii.textContent = window.atob( $$ascii.textContent );
    $$ascii.setAttribute( strReadyAttribute, true );
  }

  strSubpage = '❤';
  strSubsection = undefined;

  Page.trackPageView( '❤' );
} );
