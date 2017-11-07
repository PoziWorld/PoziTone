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

const
    strPage = 'browser-action'
  , strListId = 'recentTracks'
  , strListElementSelector = '.recentTrack'
  , strListElementInfoSelector = '.recentTrackInfo'
  , strRecentTrackActionUrl = 'https://go.pozitone.com/s/?'
  ;

var Popup = {
  /**
   * Initialize
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  init : function() {
    Popup.populateRecentTracks();
    Page.trackPageView();
  }
  ,

  /**
   * Populate Last Tracks list
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  populateRecentTracks : function() {
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

      Page.localize( 'popup' );
      Popup.addEventListeners();

      if ( boolIsNullCase ) {
        $content.querySelector( '[data-performer="funbox"]' ).href = 'https://vk.com/funboxband';
        $content.querySelector( '[data-performer="nickybutter"]' ).href = 'https://soundcloud.com/nickybutter';
        $content.querySelector( '[data-performer="theroux"]' ).href = 'https://soundcloud.com/theroux';
        $content.querySelector( '[data-performer="emilyclibourn"]' ).href = 'https://soundcloud.com/emilyclibourn';
      }
    } );
  }
  ,

  /**
   * Add event listeners
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  addEventListeners : function() {
    const _this = this;

    addEvent(
        document.getElementById( 'toolbarOpenOptionsPageBtn' )
      , 'click'
      , function( objEvent ) {
          var strLog = 'browserAction.toolbar';

          // Track clicks
          chrome.runtime.sendMessage(
            {
                strReceiver : 'background'
              , strLog : strLog
              , objVars : {
                    strAction : 'openOptions'
                  , strPage : strPage
                }
            }
          );

          Global.openOptionsPage( strLog );
        }
    );

    addEvent(
        document.getElementById( 'toolbarClosePopupPageBtn' )
      , 'click'
      , function( objEvent ) {
          // Track clicks
          chrome.runtime.sendMessage(
            {
                strReceiver : 'background'
              , strLog : 'browserAction.toolbar'
              , objVars : {
                    strAction : 'closePopup'
                  , strPage : strPage
                }
            }
          );

          window.close();
        }
    );

    Page.addDevelopersMessageEventListeners();

    addEvent(
        document.querySelectorAll( '#tunesSuggestionInfo a' )
      , 'click'
      , function( objEvent ) {
          var $this = objEvent.target;

          // Track clicks
          chrome.runtime.sendMessage(
            {
                strReceiver : 'background'
              , strLog : 'browserAction.tunesSuggestion'
              , objVars : {
                    strPerformer : $this.dataset.performer
                }
            }
          );

          Global.createTabOrUpdate( $this.href );

          objEvent.preventDefault();
        }
    );

    addEvent(
        document.getElementsByClassName( 'recentTrack' )
      , 'mouseleave'
      , function( objEvent ) {
          var $this = objEvent.currentTarget;

          $this.querySelector( '.fadeOutFadeIn' ).classList.remove( 'show' );
          $this.querySelector( '.fadeInFadeOut' ).classList.remove( 'show' );
        }
    );

    addEvent(
        document.getElementsByClassName( 'providerAction' )
      , 'click'
      , function( objEvent ) {
          var $this = objEvent.currentTarget
            , strProvider = $this.dataset.provider
            , strTrack = $this.parentNode.parentNode.dataset.track
            , strUrl = Popup.composeRecentTrackActionUrl( strProvider, strTrack )
            ;

          // Track clicks
          chrome.runtime.sendMessage(
            {
                strReceiver : 'background'
              , strLog : 'browserAction.recentTracks'
              , objVars : {
                    strAction : 'providerAction'
                  , strProvider : strProvider
                  , strLanguage : strConstExtensionLanguage
                  , strVersion : strConstExtensionVersion
                  , strVersionName : strConstExtensionVersionName
                }
            }
          );

          Global.createTabOrUpdate( strUrl );
        }
    );

    addEvent(
        document.getElementsByClassName( 'copyToClipboard' )
      , 'click'
      , _this.onCopyToClipboardCtaClick.bind( _this )
    );
  }
  ,

  /**
   * "Copy to clipboard" call-to-action is clicked on.
   *
   * @param {Event} objEvent - MouseEvent object.
   **/

  onCopyToClipboardCtaClick : function( objEvent ) {
    const _this = this;

    chrome.permissions.contains( { permissions : [ 'clipboardWrite' ] }, function( boolIsGranted ) {
      if ( boolIsGranted ) {
        _this.copyToClipboard( objEvent );
      }
      else {
        _this.requestClipboardWritePermission( objEvent );
      }
    } );
  }
  ,

  /**
   * "clipboardWrite" permission hasn't been granted yet, request it.
   *
   * @param {Event} objEvent - MouseEvent object.
   **/

  requestClipboardWritePermission : function( objEvent ) {
    const _this = this;
    const strLog = 'requestClipboardWritePermission';
    const $privacyStatementsContainer = document.getElementById( 'privacyStatementsContainer' );

    Page.toggleElement( $privacyStatementsContainer, true );

    chrome.permissions.request( { permissions: [ 'clipboardWrite' ] }, function( boolIsGranted ) {
      Global.checkForRuntimeError(
          function() {
            _this.trackData( strLog, { boolIsGranted : boolIsGranted } );

            if ( boolIsGranted ) {
              _this.copyToClipboard( objEvent );
            }
          }
        , undefined
        , { strAction : strLog }
        , true
      );

      Page.toggleElement( $privacyStatementsContainer, false );
    } );
  }
  ,

  /**
   * "clipboardWrite" permission granted, copy to clipboard.
   *
   * @param {Event} objEvent - MouseEvent object.
   **/

  copyToClipboard : function( objEvent ) {
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

    this.trackData( 'copyToClipboard' );

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
  ,

  /**
   * If user participates in UEIP, track some helpful insights.
   *
   * @param {string} strAction - The action being tracked.
   * @param {Object} [objData] - Additional data to track.
   **/

  trackData : function( strAction, objData ) {
    let objTrackingData = {
        strAction : strAction
      , strLanguage : strConstExtensionLanguage
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

    chrome.runtime.sendMessage(
      {
          strReceiver : 'background'
        , strLog : 'browserAction.recentTracks'
        , objVars : objTrackingData
      }
    );
  }
  ,

  /**
   * Compose a URL from the given parameters
   *
   * @type    method
   * @param   strProvider
   *            Service provider
   * @param   strQuery
   *            Query
   * @return  string
   **/

  composeRecentTrackActionUrl : function( strProvider, strQuery ) {
    if (  typeof strProvider === 'undefined'
      ||  typeof strQuery === 'undefined'
      ||  strProvider === ''
      ||  strQuery === ''
    ) {
      return '';
    }

    return strRecentTrackActionUrl
              +  'p=' + strProvider
              + '&q=' + Popup.encodeQuery( strQuery )
              + '&v=' + strConstExtensionVersion
              + '&l=' + strConstExtensionLanguage
              ;
  }
  ,

  /**
   * Encode query
   *
   * @type    method
   * @param   strQuery
   *            Query
   * @return  string
   **/

  encodeQuery : function( strQuery ) {
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
};

/* =============================================================================

  Events

 ============================================================================ */

document.addEventListener( 'DOMContentLoaded', Popup.init );
