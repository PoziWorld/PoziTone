/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2014 PoziWorld
  License                 :           pozitone.com/license
  File                    :           js/options.js
  Description             :           Options JavaScript

  Table of Contents:

  0. Globals
  1. Options
      init()
      removeNotAvailable()
      parseQueryString()
      openPageSubpage()
      setPageValues()
      getAvailableOptions()
      onSettingChange()
      switchPage()
      addEventListeners()
      chooseSubpage()
      displayCurrentVersion()
      removeModuleNotifications()
      initEeLauncher()
  2. Listeners
      runtime.onMessage
  3. Events

 ============================================================================ */

/* =============================================================================

  0. Globals

 ============================================================================ */

const
    strNotAvailableOperaSettingsClass = 'moduleAvailableNotificationButtons'
  , strModuleLocalPrefix              = 'module_'
  , strChosenSubpageId                = 'chosenSubpage'
  , strSettingsId                     = 'settings'
  , strSettingsSavedId                = 'settingsSaved'
  , strModuleSubpageIdPrefix          = 'settings_'
  , strSettingsSubpageClass           = 'settingsSubpage'
  , strVersionId                      = 'version'
  , strEnableModule                   = 'boolIsEnabled'

  , strEeLauncherKeyword              = 'help'
  , strEeLauncherId                   = 'helpMenuItem'
  , strHelpInfoToSubmitId             = 'helpInfoToSubmit'
  , strHelpSubmitInfoCtaId            = 'helpSubmitInfoCta'
  ;

var
    objParams                 = {}

  , $allInputs // All <input />
  , intInputs  // Num of $allInputs
  , $settingsSaved
  , $settingsSubpages
  , $chosenSubpage

  , intSettingsSubpages
  ;

/* =============================================================================

  1. Options

 ============================================================================ */

var Options = {

  /**
   * Initialize
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  init : function() {
    Options.removeNotAvailable();
    Page.localize( 'options' );
    Options.setPageValues();
    Options.getAvailableOptions();
    Options.addEventListeners();
    Options.parseQueryString();
    Options.openPageSubpage();
    Options.displayCurrentVersion();
    Options.initEeLauncher();
  }
  ,

  /**
   * If some settings n/a for this browser, remove them
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  removeNotAvailable : function() {
    if ( bowser.name === 'Opera' ) {
      var $elements =
            document
              .getElementsByClassName( strNotAvailableOperaSettingsClass );

      for ( var i = ( $elements.length - 1 ); i >= 0; i-- ) {
        var $element = $elements[i];

        $element.parentNode.removeChild( $element );
      }
    }
  }
  ,

  /**
   * Parse query string (get key/value pairs)
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  parseQueryString : function() {
    // Split into key/value pairs
    var objQueries = window.location.search.substring( 1 ).split( '&' );

    // Convert the array of strings into an object
    for ( var i = 0, l = objQueries.length; i < l; i++ ) {
      var arrTemp = objQueries[ i ].split( '=' );

      objParams[ arrTemp[ 0 ] ] = arrTemp[ 1 ];
    }
  }
  ,

  /**
   * If the query string has page parameter, open an appropriate page.
   * Same for a subpage.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  openPageSubpage : function() {
    var
        strPage         = objParams[ 'page' ]
      , strSubpage      = objParams[ 'subpage' ]
      , boolIsValidPage = typeof strPage === 'string'
      ;

    if ( boolIsValidPage && strPage !== '' ) {
      Options.switchPage( strPage );

      if ( typeof strSubpage === 'string' && strSubpage !== '' ) {
        Options.chooseSubpage( strSubpage );

        document
          .querySelector( '[data-subpage="' + strSubpage + '"].switchSubpage' )
            .parentNode.classList.add( 'selected' );
      }
    }
    else if ( boolIsValidPage && strPage === '' || ! boolIsValidPage ) {
      // Open first page from nav
      document.querySelector( '.switchSubpage' ).click();
    }
  }
  ,

  /**
   * Set values when DOM is ready
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  setPageValues : function() {
    $allInputs          = document.querySelectorAll( '.subpage input' );
    intInputs           = $allInputs.length;

    $settingsSaved      = document.getElementById( strSettingsSavedId );
    $settingsSubpages   =
      document.getElementsByClassName( strSettingsSubpageClass );
    intSettingsSubpages = $settingsSubpages.length;

    $chosenSubpage      = document.getElementById( strChosenSubpageId );
  }
  ,

  /**
   * Get available options and set their stored values
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  getAvailableOptions : function() {
    var arrAvailableOptions = [];

    for ( var i = 0; i < intSettingsSubpages; i++ ) {
      var
          objSettingsSubpage        = $settingsSubpages[ i ]
        , strModule                 =
            objSettingsSubpage.id.replace( strModuleSubpageIdPrefix, '' )
        , strStorageVar             = strConstSettingsPrefix + strModule
        ;

      arrAvailableOptions.push( strStorageVar );
    }

    StorageSync.get( arrAvailableOptions, function( objStorageData ) {
      for ( var strKey in objStorageData ) {
        if ( objStorageData.hasOwnProperty( strKey ) ) {
          var
              objModuleSettings         = objStorageData[ strKey ]
            , strModule                 = strKey
                                            .replace(
                                                strConstSettingsPrefix
                                              , ''
                                            )
            , strModuleSubpageId        = strModuleSubpageIdPrefix + strModule
            , $moduleSubpage            = document
                                            .getElementById(
                                              strModuleSubpageId
                                            )
            , $allModuleSubpageInputs   = $moduleSubpage
                                            .getElementsByTagName( 'input' )
            , intModuleSubpageInputs    = $allModuleSubpageInputs.length
            ;

          for ( i = 0; i < intModuleSubpageInputs; i++ ) {
            var
                $input            = $allModuleSubpageInputs[ i ]
              , strVarName        = $input.name
              , strVarType        = $input.type
              , strVarValue       = $input.value
              , miscStorageVar    = objModuleSettings[ strVarName ]
              ;

            if ( typeof miscStorageVar !== 'undefined' ) {
              if ( strVarType === 'checkbox' ) {
                if ( typeof miscStorageVar === 'boolean' )
                  $input.checked = miscStorageVar;
                else if (
                      typeof miscStorageVar === 'object'
                  &&  miscStorageVar.indexOf( strVarValue ) !== -1
                )
                  $input.checked = true;
              }
              else if (
                    strVarType === 'radio'
                &&  typeof miscStorageVar === 'string'
                &&  miscStorageVar === strVarValue
              )
                $input.checked = true;
              else if (
                    ~ [ 'number', 'range' ].indexOf( strVarType )
                &&  (
                          typeof miscStorageVar === 'string'
                      ||  typeof miscStorageVar === 'number'
                    )
              )
                $input.value = miscStorageVar;
            }
          }
        }
      }
    });
  }
  ,

  /**
   * Assign change listeners for settings
   *
   * @type    method
   * @param   objEvent
   * @return  void
   **/
  onSettingChange : function( objEvent ) {
    var
        $this                 = objEvent.target
      , objTemp               = {}
      , objModuleSettings     = {}
      , miscSetting
      , strModuleSettings
      , strChosenSubpageValue = $chosenSubpage.value
      ;

    if ( $this.type === 'checkbox' && $this.value === 'on' ) {
      var boolIsChecked = $this.checked;

      miscSetting = boolIsChecked;

      if ( $this.name === strEnableModule && ! boolIsChecked )
        Options.removeModuleNotifications( strChosenSubpageValue );
    }
    else if ( $this.type === 'checkbox' && $this.value !== 'on' ) {
      var
          $moduleSubpage  = document
                              .getElementById(
                                strModuleSubpageIdPrefix + strChosenSubpageValue
                              )
        , $group          = $moduleSubpage.querySelectorAll(
                              'input[name="' + $this.name + '"]'
                            )
        , arrTemp         = []
        ;

      for ( var i = 0, l = $group.length; i < l; i++ ) {
        var $groupEl = $group[ i ];

        if ( $groupEl.checked )
          arrTemp.push( $groupEl.value );
      }

      miscSetting = arrTemp;
    }
    else if ( $this.type === 'radio' )
      miscSetting = $this.value;
    else if ( $this.type === 'number' )
      miscSetting = parseInt( $this.value );

    strModuleSettings = strConstSettingsPrefix + strChosenSubpageValue;

    // TODO: Is there a need for objTemp?
    objTemp[ strModuleSettings ] = {};
    objTemp[ strModuleSettings ][ $this.name ] = miscSetting;
    objModuleSettings[ $this.name ] = miscSetting;

    if ( ! Global.isEmpty( objTemp ) )
      StorageSync.get( strModuleSettings, function( objReturn ) {
        for ( var strKey in objModuleSettings ) {
          if ( objModuleSettings.hasOwnProperty( strKey ) )
            objReturn[ strModuleSettings ][ strKey ] = 
              objModuleSettings[ strKey ];
        }

        // TODO: Add callback to Global.setStorageItems() and then utilize it
        StorageSync.set( objReturn, function() {
          Page.showSuccess( $settingsSaved );

          // Debug
          StorageSync.get( null, function(data) {
            console.log(data);
          });
        });
      });
  }
  ,

  /**
   * Switch page
   *
   * @type    method
   * @param   miscParam
   *            Event object or ID
   * @return  void
   **/
  switchPage : function( miscParam ) {
    var
        boolIsMiscParamObject = typeof miscParam === 'object'
      , $target
      , strPageId
      ;

    if ( boolIsMiscParamObject ) {
      $target   = miscParam.target;
      strPageId = $target.dataset.page;

      // TODO: Works only for General now
      if ( ! $target.classList.contains( 'menuItem' ) )
        $target   =
          document
            .querySelector( '[data-page="' + strPageId + '"].switchPage' );
    }
    else {
      strPageId = miscParam;
      $target   =
        document.querySelector( '[data-page="' + strPageId + '"].switchPage' );
    }

    var
        $page   = document.getElementById( strPageId )
      ;

    if ( document.contains( $page ) ) {
      // 1. Hide all pages, show called.
      var $allPages = document.getElementsByClassName( 'page' );

      for ( var i = 0, l = $allPages.length; i < l; i++ )
        $allPages[ i ].style.display = 'none';

      $page.style.display = 'block';

      // 2. Make menu link active.
      // TODO: Switch to querySelector(All)? Performance vs Less code
      var
          $allMenuLinks =
            document.getElementById( 'menu' ).getElementsByTagName( 'li' )
        ;

      for ( var j = 0, m = $allMenuLinks.length; j < m; j++ )
        $allMenuLinks[ j ].classList.remove( 'selected' );

      if ( document.contains( $target ) )
        $target.parentNode.classList.add( 'selected' );

      if ( boolIsMiscParamObject ) {
        var strNewUrl = $target.href;

        // TODO: Do not push if URL is the same
        window.history.pushState( { path: strNewUrl }, '', strNewUrl );
      }

      // 3. Page-specific logic
      if ( strPageId === 'help' ) {
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
      }
    }
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
    addEvent(
        document.getElementsByClassName( 'switchPage' )
      , 'click'
      , function( objEvent ) {
          Options.switchPage( objEvent );

          objEvent.preventDefault();
        }
    );

    addEvent(
        document.getElementsByClassName( 'switchSubpage' )
      , 'click'
      , function( objEvent ) {
          Options.switchPage( objEvent );
          Options.chooseSubpage( objEvent );

          objEvent.preventDefault();
        }
    );

    addEvent(
        $allInputs
      , 'change'
      , function( objEvent ) { Options.onSettingChange( objEvent ); }
    );

    addEvent(
        document.getElementById( strHelpSubmitInfoCtaId )
      , 'click'
      , function( objEvent ) {
          var $element = objEvent.target;

          $element.disabled = true;
          Log.setPropertiesOnUserRecord(
              objConstUserSetUp
            , function() {
                $element.innerText =
                  chrome.i18n.getMessage( 'optionsHelpSubmitInfoCtaSuccess' );
              }
          );

        }
    );
  }
  ,

  /**
   * Show an appropriate subpage
   *
   * @type    method
   * @param   miscVar
   *            Event object or subpage ID
   * @return  void
   **/
  chooseSubpage : function( miscVar ) {
    var
        $option
      , strSubpage
      ;

    if ( typeof miscVar === 'object' ) {
      $option     = miscVar.target;
      strSubpage  = $option.dataset.subpage;
    }
    else {
      strSubpage  = miscVar
      $option     = document.querySelector(
                      '[data-subpage="' + strSubpage + '"].switchSubpage'
                    );
    }

    if ( $option !== null ) {
      var $targetSubpage  = document.getElementById(
                              strModuleSubpageIdPrefix + strSubpage
                            );

      if ( document.contains( $targetSubpage ) ) {
        for ( var i = 0; i < intSettingsSubpages; i++ )
          $settingsSubpages[ i ].style.display = 'none';

        $targetSubpage.style.display = 'block';

        // Save chosen module for later use
        $chosenSubpage.value = strSubpage;
      }
    }
  }
  ,

  /**
   * Display current version on About page
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  displayCurrentVersion : function() {
    document.getElementById( strVersionId ).innerHTML = 
      strConstExtensionVersion;
  }
  ,

  /**
   * Remove all notifications for a module when just disabled it
   *
   * @type    method
   * @param   strModule
   *            Remove notifications of this module
   * @return  void
   **/
  removeModuleNotifications : function( strModule ) {
    StorageLocal.get( 'arrTabsIds', function( objData ) {
      var arrTabsIds = objData.arrTabsIds;

      if ( typeof arrTabsIds === 'undefined' )
        return;

      for ( var i = 0, l = arrTabsIds.length; i < l; i++ ) {
        var arrTabId = arrTabsIds[ i ];

        if ( arrTabId[ 1 ] === strModule )
          Global.removeNotification( arrTabId[ 0 ], strModule );
      }
    });
  }
  ,

  /**
   * Initialize E.E. launcher (waits for a command)
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  initEeLauncher : function() {
    // http://stackoverflow.com/a/18272907
    var strInput = '';

    window.addEventListener( 'keypress', function( objEvent ) {
      var c = String.fromCharCode( objEvent.keyCode );

      strInput += c.toLowerCase();

      if ( strInput.length > strEeLauncherKeyword.length )
        strInput = strInput.slice( 1 );

      if ( strInput == strEeLauncherKeyword )
        document.getElementById( strEeLauncherId ).click();
    } );
  }
};

/* =============================================================================

  2. Listeners

 ============================================================================ */

/**
 * Listens for messages from other pages
 *
 * @type    method
 * @param   objMessage
 *            Message received
 * @param   objSender
 *            Sender of the message
 * @return  void
 **/
chrome.runtime.onMessage.addListener(
  function( objMessage, objSender, objSendResponse ) {
    if ( objMessage.strReceiver === 'options' ) {
      var objVars = objMessage[ 'objVars' ];

      for ( strProp in objVars ) {
        if ( objVars.hasOwnProperty( strProp ) )
          document.querySelector( '[name="' + strProp + '"]' ).checked = 
            objVars[ strProp ];
      }
    }
  }
);

/* =============================================================================

  3. Events

 ============================================================================ */

document.addEventListener( 'DOMContentLoaded', Options.init );