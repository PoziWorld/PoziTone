/* =============================================================================

  Product: PoziTone
  Author: PoziWorld
  Copyright: (c) 2016 PoziWorld
  License: pozitone.com/license

  Table of Contents:

    Popup
      init()
      populateRecentTracks()
      addEventListeners()
      onCopyToClipboardCtaClick()
      requestClipboardWritePermission()
      copyToClipboard()
      trackData()
      composeRecentTrackActionUrl()
      encodeQuery()
    Events

 ============================================================================ */

/* =============================================================================

  Popup

 ============================================================================ */

( function () {
  window.strPage = 'browser-action';

  const strLogPage = 'browserAction';
  const strLogPageDivider = '.';

  const strListId = 'recentTracks';
  const strListElementSelector = '.recentTrack';
  const strListElementInfoSelector = '.recentTrackInfo';

  const strRecentTrackActionUrl = 'https://go.pozitone.com/s/?';

  setUp();

  /**
   * Make the logic readily available.
   */

  function setUp() {
    document.addEventListener( 'DOMContentLoaded', init );
  }

  /**
   * Initialize the view.
   **/

  function init() {
    populateRecentTracks();
    Page.trackPageView();
  }

  /**
   * Populate the Recently Played list.
   **/

  function populateRecentTracks() {
    StorageSync.get( 'arrRecentTracks', function( objReturn ) {
      var arrRecentTracks = objReturn.arrRecentTracks
        , strHtml = ''
        ;

      for ( var i = ( arrRecentTracks.length - 1 ); i >= 0; i-- ) {
        var arrRecentTrack = arrRecentTracks[ i ]
          , strSrc = arrRecentTrack[ 2 ]
          , strExtensionId = arrRecentTrack[ 3 ]
          ;

        // External module
        if ( typeof strExtensionId === 'string' && strExtensionId !== '' ) {
          strSrc = 'chrome-extension://'
            + strExtensionId
            + ( strSrc[ 0 ] === '/' ? '' : '/' )
            + strSrc
            ;
        }

        strHtml += Page.template(
            'recentTrackRow'
          , {
                track : arrRecentTrack[ 0 ]
              , src : strSrc
              , alt : arrRecentTrack[ 1 ]
            }
        );
      }

      var boolIsNullCase = strHtml === ''
        , $content = document.getElementById( strListId )
        ;

      if ( ! boolIsNullCase ) {
        $content.innerHTML = strHtml;
      }

      poziworldExtension.i18n.init()
        .then( Page.localize.bind( null, 'popup' ) )
        .then( addEventListeners )
        .then( setLinksUrls.bind( null, boolIsNullCase, $content ) );
    } );
  }

  /**
   * Add event listeners.
   **/

  function addEventListeners() {
    addEvent(
        document.getElementById( 'toolbarOpenOptionsPageBtn' )
      , 'click'
      , function() {
          const strLog = 'toolbar';

          trackData(
              strLog
            , 'openOptions'
            , { strPage : strPage }
          );

          Global.openOptionsPage( strLogPage + strLogPageDivider + strLog );
        }
    );

    addEvent(
        document.getElementById( 'toolbarClosePopupPageBtn' )
      , 'click'
      , function() {
          trackData(
              'toolbar'
            , 'closePopup'
            , { strPage : strPage }
          );

          window.close();
        }
    );

    Page.addDevelopersMessageEventListeners();

    addEvent(
        document.querySelectorAll( '#tunesSuggestionInfo a' )
      , 'click'
      , function( objEvent ) {
          const $this = objEvent.target;

          trackData(
              'tunesSuggestion'
            , 'followLink'
            , { strPerformer : $this.dataset.performer }
          );

          Global.createTabOrUpdate( $this.href );

          objEvent.preventDefault();
        }
    );

    addEvent(
        document.getElementsByClassName( 'recentTrack' )
      , 'mouseleave'
      , function( objEvent ) {
          const $this = objEvent.currentTarget;

          $this.querySelector( '.fadeOutFadeIn' ).classList.remove( 'show' );
          $this.querySelector( '.fadeInFadeOut' ).classList.remove( 'show' );
        }
    );

    addEvent(
        document.getElementsByClassName( 'providerAction' )
      , 'click'
      , function( objEvent ) {
          const $this = objEvent.currentTarget;
          const strProvider = $this.dataset.provider;
          const strTrack = $this.parentNode.parentNode.dataset.track;
          const strUrl = composeRecentTrackActionUrl( strProvider, strTrack );

          trackData(
              'recentTracks'
            , 'providerAction'
            , { strProvider : strProvider }
          );

          Global.createTabOrUpdate( strUrl );
        }
    );

    addEvent(
        document.getElementsByClassName( 'copyToClipboard' )
      , 'click'
      , onCopyToClipboardCtaClick
    );
  }

  /**
   * "Copy to clipboard" call-to-action is clicked on.
   *
   * @param {Event} objEvent - MouseEvent object.
   **/

  function onCopyToClipboardCtaClick( objEvent ) {
    chrome.permissions.contains( { permissions : [ 'clipboardWrite' ] }, function( boolIsGranted ) {
      if ( boolIsGranted ) {
        copyToClipboard( objEvent );
      }
      else {
        requestClipboardWritePermission( objEvent );
      }
    } );
  }

  /**
   * "clipboardWrite" permission hasn't been granted yet, request it.
   *
   * @param {Event} objEvent - MouseEvent object.
   **/

  function requestClipboardWritePermission( objEvent ) {
    const strLog = 'requestClipboardWritePermission';
    const $privacyStatementsContainer = document.getElementById( 'privacyStatementsContainer' );

    Page.toggleElement( $privacyStatementsContainer, true );

    chrome.permissions.request( { permissions: [ 'clipboardWrite' ] }, function( boolIsGranted ) {
      Global.checkForRuntimeError(
          function() {
            trackData(
                'recentTracks'
              , strLog
              , { boolIsGranted : boolIsGranted }
            );

            if ( boolIsGranted ) {
              copyToClipboard( objEvent );
            }
          }
        , undefined
        , { strAction : strLog }
        , true
      );

      Page.toggleElement( $privacyStatementsContainer, false );
    } );
  }

  /**
   * "clipboardWrite" permission granted, copy to clipboard.
   *
   * @param {Event} objEvent - MouseEvent object.
   **/

  function copyToClipboard( objEvent ) {
    let $this = objEvent.currentTarget || objEvent.target;
    const $text = $this.closest( strListElementSelector );

    if ( ! $text ) {
      /**
       * @todo Track.
       */
      return;
    }

    const $trackInfo = $text.querySelector( strListElementInfoSelector );

    if ( ! $trackInfo ) {
      /**
       * @todo Track.
       */
      return;
    }

    trackData(
        'recentTracks'
      , 'copyToClipboard'
    );

    // http://stackoverflow.com/a/11128179/561712
    var objSelection = window.getSelection();
    var objRange = document.createRange();

    objRange.selectNodeContents( $trackInfo );
    objSelection.removeAllRanges();
    objSelection.addRange( objRange );

    document.execCommand( 'copy' );
    objSelection.removeAllRanges();

    // Clicked on (target is) the button icon
    if ( ! $this.classList.contains( 'cta' ) ) {
      $this = $this.parentNode;
    }

    Page.showSuccess( $this.children[ 0 ] );
    Page.showSuccess( $this.children[ 1 ] );
  }

  /**
   * If user participates in UEIP, track some helpful insights.
   *
   * @param {string} strLog - The log entry marker.
   * @param {string} strAction - The action being tracked.
   * @param {Object} [objData] - Additional data to track.
   **/

  function trackData( strLog, strAction, objData ) {
    let objTrackingData = {
        strAction : strAction
      , strLanguage : poziworldExtension.i18n.getLanguage()
      , strVersion : strConstExtensionVersion
      , strVersionName : strConstExtensionVersionName
    };

    if ( typeof objData === 'object' && ! Global.isEmpty( objData ) ) {
      for ( let strKey in objData ) {
        if ( objData.hasOwnProperty( strKey ) && typeof strKey === 'string' ) {
          objTrackingData[ strKey ] = objData[ strKey ];
        }
      }
    }

    if ( typeof strLog === 'string' && strLog !== '' ) {
      strLog = strLogPage + strLogPageDivider + strLog;
    }
    else {
      strLog = strLogPage;
    }

    chrome.runtime.sendMessage(
      {
          strReceiver : 'background'
        , strLog : strLog
        , objVars : objTrackingData
      }
    );
  }

  /**
   * Compose a URL from the given parameters
   *
   * @param {string} strProvider - Service provider.
   * @param {string} strQuery - Query.
   * @return {string}
   **/

  function composeRecentTrackActionUrl( strProvider, strQuery ) {
    if (  typeof strProvider === 'undefined'
      ||  typeof strQuery === 'undefined'
      ||  strProvider === ''
      ||  strQuery === ''
    ) {
      return '';
    }

    return strRecentTrackActionUrl
              +  'p=' + strProvider
              + '&q=' + encodeQuery( strQuery )
              + '&v=' + strConstExtensionVersion
              + '&l=' + poziworldExtension.i18n.getLanguage()
              ;
  }

  /**
   * Encode query
   *
   * @param {string} strQuery - Query.
   * @return {string}
   **/

  function encodeQuery( strQuery ) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
    return encodeURIComponent( strQuery )
              // Note that although RFC3986 reserves "!", RFC5987 does not,
              // so we do not need to escape it
              .replace( /['()]/g, escape ) // i.e., %27 %28 %29
              .replace( /\*/g, '%2A' )
              // The following are not required for percent-encoding
              // per RFC5987, so we can allow for a little better readability
              // over the wire: |`^
              .replace( /%(?:7C|60|5E)/g, unescape )
              ;
  }

  /**
   * The null case (when there are no items in the Recently Played list) shows suggestions for different styles of music. The text comes from the translation, but the translation doesn't contain URLs.
   *
   * @param {boolean} nullCase - Whether there are any items in the Recently Played list.
   * @param {HTMLElement} container
   */

  function setLinksUrls( nullCase, container ) {
    if ( nullCase ) {
      container.querySelector( '[data-performer="funbox"]' ).href = 'https://vk.com/funboxband';
      container.querySelector( '[data-performer="nickybutter"]' ).href = 'https://soundcloud.com/nickybutter';
      container.querySelector( '[data-performer="theroux"]' ).href = 'https://soundcloud.com/theroux';
      container.querySelector( '[data-performer="emilyclibourn"]' ).href = 'https://soundcloud.com/emilyclibourn';
    }
  }
} )();
