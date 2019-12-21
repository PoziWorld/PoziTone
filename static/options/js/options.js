/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2016 PoziWorld
  License                 :           pozitone.com/license
  File                    :           options/js/options.js
  Description             :           Options JavaScript

  Table of Contents:

    Globals
    Options
      init()
      removeNotAvailable()
      setPageValues()
      onSettingChange()
      addEventListeners()
      removeModuleNotifications()
      initEeLauncher()
    Listeners
      runtime.onMessage
    Events

 ============================================================================ */

/* =============================================================================

  Globals

 ============================================================================ */

const
    strPage                           = 'options'
  , strMainHeadingId                  = 'extensionName'
  , strNotAvailableOperaSettingsClass = 'moduleAvailableNotificationButtons'
  , strModuleLocalPrefix              = 'module_'
  , strSettingsId                     = 'settings'
  , strSettingsSavedId                = 'settingsSaved'
  , strModuleSubpageId                = 'settings_module'
  , strModuleSubpageIdPrefix          = 'settings_'
  , strSettingsSubpageClass           = 'settingsSubpage'
  , strMenuItemSelectedClass          = 'selected'
  , strEnableModule                   = 'boolIsEnabled'

  , strEeLauncherKeyword              = 'help'
  , strEeLauncherId                   = 'helpMenuItem'
  , strHelpInfoToSubmitId             = 'helpInfoToSubmit'
  , strHelpSubmitInfoCtaId            = 'helpSubmitInfoCta'
  ;

var
    objParams                         = {}
  , strSubpage
  , strSubsection

  , $allInputs // All <input />
  , intInputs  // Num of $allInputs
  , $settingsSaved
  , $settingsSubpages

  , strChosenSettingsSubpage
  , intSettingsSubpages
  ;

/* =============================================================================

  Options

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
    // Hide h1 in Chrome 40.0+ because new Options UI has heading already
    if ( boolConstUseOptionsUi ) {
      document.getElementById( strMainHeadingId ).remove();
    }

    poziworldExtension.i18n.init()
      .then( Page.localize.bind( null, strPage ) );
    Options.setPageValues();
    Options.addEventListeners();
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
   * Set values when DOM is ready
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  setPageValues : function() {
    $allInputs = document.querySelectorAll( '.subpage input' );
    intInputs = $allInputs.length;

    $settingsSaved = document.getElementById( strSettingsSavedId );
    $settingsSubpages = document.getElementsByClassName( strSettingsSubpageClass );
    intSettingsSubpages = $settingsSubpages.length;
  }
  ,

  /**
   * Assign change listeners for settings
   *
   * @type    method
   * @param   objEvent
   *            Event object
   * @param   strModuleOverride
   *            When settings get saved, they use strChosenSettingsSubpage.
   *            This one lets override strChosenSettingsSubpage.
   * @return  void
   **/
  onSettingChange : function( objEvent, strModuleOverride ) {
    var $this = objEvent.target
      , objTemp = {}
      , objModuleSettings = {}
      , miscSetting
      , strModule = strChosenSettingsSubpage
      , strModuleSettings
      ;

    if ( typeof strModuleOverride === 'string' ) {
      strModule = strModuleOverride;
    }

    var boolIsExternal = strModule !== 'general' && pozitone.global.isModuleExternal( strModule )
      , StorageTemp = boolIsExternal ? StorageLocal : StorageSync
      ;

    if ( $this.type === 'checkbox' && $this.value === 'on' ) {
      var boolIsChecked = $this.checked;

      miscSetting = boolIsChecked;

      if ( $this.name === strEnableModule && ! boolIsChecked ) {
        Options.removeModuleNotifications( strModule );
      }
    }
    else if ( $this.type === 'checkbox' && $this.value !== 'on' ) {
      var $moduleSubpage  = document.getElementById( strModuleSubpageId )
        , $group = $moduleSubpage.querySelectorAll( 'input[name="' + $this.name + '"]' )
        , arrTemp = []
        ;

      for ( var i = 0, l = $group.length; i < l; i++ ) {
        var $groupEl = $group[ i ];

        if ( $groupEl.checked ) {
          arrTemp.push( $groupEl.value );
        }
      }

      miscSetting = arrTemp;
    }
    else if ( $this.type === 'radio' || $this.tagName === 'SELECT' ) {
      miscSetting = $this.value;
    }
    else if ( $this.type === 'number' ) {
      miscSetting = parseInt( $this.value );
    }

    if ( typeof miscSetting === 'undefined' ) {
      return;
    }

    strModuleSettings = strConstSettingsPrefix + strModule;

    // TODO: Is there a need for objTemp?
    objTemp[ strModuleSettings ] = {};
    objTemp[ strModuleSettings ][ $this.name ] = miscSetting;
    objModuleSettings[ $this.name ] = miscSetting;

    if ( ! Global.isEmpty( objTemp ) ) {
      StorageTemp.get( strModuleSettings, function( objReturn ) {
        for ( var strKey in objModuleSettings ) {
          if ( objModuleSettings.hasOwnProperty( strKey ) )
            objReturn[ strModuleSettings ][ strKey ] = 
              objModuleSettings[ strKey ];
        }

        // TODO: Add callback to Global.setStorageItems() and then utilize it
        StorageTemp.set( objReturn, function() {
          Page.showSuccess( $settingsSaved );

          // Debug
          StorageTemp.get( null, function(data) {
            console.log(data);
          } );
        } );
      } );
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
                  poziworldExtension.i18n.getMessage( 'optionsHelpSubmitInfoCtaSuccess' );
              }
          );

        }
    );
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
    let strInput = '';

    window.addEventListener( 'keypress', function( objEvent ) {
      var c = String.fromCharCode( objEvent.keyCode );

      strInput += c.toLowerCase();

      if ( ~ strInput.indexOf( strEeLauncherKeyword ) ) {
        strInput = '';

        document.getElementById( strEeLauncherId ).click();
      }
      else if ( ~ strInput.indexOf( window.atob( 'bGlh' ) ) ) {
        strInput = '';

        location.href='#/❤';
      }
    } );
  }
};

/* =============================================================================

  Listeners

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
  function( objMessage, objSender, funcSendResponse ) {
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

  Events

 ============================================================================ */

document.addEventListener( 'DOMContentLoaded', Options.init );
