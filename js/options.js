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
      getAvailableOptions()
      onSettingChange()
      switchPage()
      populateModulesList()
      onChooseModuleChange()
      chooseModule()
  2. Events

 ============================================================================ */

/* =============================================================================

  0. Globals

 ============================================================================ */

var
    $allInputs // All <input />
  , intInputs  // Num of $allInputs
  , $settingsSaved
  , $settingsSubpages
  , $chooseModuleForm
  , $chooseModule
  , $chosenModule

  , strModuleLocalPrefix      = 'poziModule_'
  , strChooseModuleFormId     = 'chooseModuleForm'
  , strChooseModuleId         = 'chooseModule'
  , strChosenModuleId         = 'chosenModule'
  , strModulesListId          = 'chooseModuleList'
  , strSettingsId             = 'settings'
  , strSettingsSavedId        = 'settingsSaved'
  , strModuleSettingsPrefix   = 'objSettings_'
  , strModuleSubpageIdPrefix  = 'settings_'
  , strModuleSubpageClass     = 'module'

  , intSettingsSubpages
  ;

// code.tutsplus.com/tutorials/from-jquery-to-javascript-a-reference--net-23703
var addEvent = (function () {
  var filter = function( el, type, fn ) {
    for ( var i = 0, len = el.length; i < len; i++ )
      addEvent( el[i], type, fn );
  };

  if ( document.addEventListener )
    return function ( el, type, fn ) {
      if ( el && el.nodeName || el === window )
        el.addEventListener( type, fn, false );
      else if ( el && el.length )
        filter( el, type, fn );
    };
})();

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
    Page.localize( 'Options' );

    // Set global values
    $allInputs          = document.querySelectorAll( '.subpage input' );
    intInputs           = $allInputs.length;

    $settingsSaved      = document.getElementById( strSettingsSavedId );
    $settingsSubpages   = document
                            .getElementsByClassName( strModuleSubpageClass );
    intSettingsSubpages = $settingsSubpages.length;

    $chooseModuleForm   = document.getElementById( strChooseModuleFormId );
    $chooseModule       = document.getElementById( strChooseModuleId );
    $chosenModule       = document.getElementById( strChosenModuleId );


    Options.getAvailableOptions();
    Options.populateModulesList();


    addEvent(
        document.getElementsByClassName( 'switchPage' )
      , 'click'
      , function( objEvent ) { Options.switchPage( objEvent ); }
    );

    addEvent(
        $chooseModule
      , 'change'
      , function( objEvent ) { Options.onChooseModuleChange( objEvent ); }
    );

    addEvent(
        $chooseModule
      , 'keyup'
      , function( objEvent ) { Options.onChooseModuleChange( objEvent ); }
    );

    addEvent(
        $chooseModule
      , 'input'
      , function( objEvent ) { Options.onChooseModuleChange( objEvent ); }
    );

    addEvent(
        $chooseModuleForm
      , 'submit'
      , function( objEvent ) {
          Options.chooseModule( objEvent );
          return false;
        }
    );

    addEvent(
        $allInputs
      , 'change'
      , function( objEvent ) { Options.onSettingChange( objEvent ); }
    );
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
        , strModule                 = objSettingsSubpage
                                        .id
                                          .replace(
                                              strModuleSubpageIdPrefix
                                            , ''
                                          )
        , strStorageVar             = strModuleSettingsPrefix + strModule
        ;

      arrAvailableOptions.push( strStorageVar );
    }

    chrome.storage.sync.get( arrAvailableOptions, function( objStorageData ) {
      for ( var strKey in objStorageData ) {
        if ( objStorageData.hasOwnProperty( strKey ) ) {
          var
              objModuleSettings         = objStorageData[ strKey ]
            , strModule                 = strKey
                                            .replace(
                                                strModuleSettingsPrefix
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
    $settingsSaved.className = 'reset';

    var
        $this                 = objEvent.target
      , objTemp               = {}
      , objModuleSettings     = {}
      , miscSetting
      , strModuleSettings
      , strChosenModuleValue  = $chosenModule.value
      ;

    if ( $this.type === 'checkbox' && $this.value === 'on' )
      miscSetting = $this.checked;
    else if ( $this.type === 'checkbox' && $this.value !== 'on' ) {
      var
          $moduleSubpage  = document
                              .getElementById(
                                strModuleSubpageIdPrefix + strChosenModuleValue
                              )
        , $group          = $moduleSubpage.querySelectorAll(
                              'input[name="' + $this.name + '"]'
                            )
        , arrTemp         = []
        ;

      for ( var i = 0; i < $group.length; i++ ) {
        var $groupEl = $group[ i ];

        if ( $groupEl.checked )
          arrTemp.push( $groupEl.value );
      }

      miscSetting = arrTemp;
    }
    else if ( $this.type === 'radio' )
      miscSetting = $this.value;

    strModuleSettings = strModuleSettingsPrefix + strChosenModuleValue;

    // TODO: Is there a need for objTemp?
    objTemp[ strModuleSettings ] = {};
    objTemp[ strModuleSettings ][ $this.name ] = miscSetting;
    objModuleSettings[ $this.name ] = miscSetting;

    if ( ! Global.isEmpty( objTemp ) )
      chrome.storage.sync.get( strModuleSettings, function( objReturn ) {
        for ( var strKey in objModuleSettings ) {
          if ( objModuleSettings.hasOwnProperty( strKey ) )
            objReturn[ strModuleSettings ][ strKey ] = 
              objModuleSettings[ strKey ];
        }

        chrome.storage.sync.set( objReturn, function() {
          $settingsSaved.className = 'show';

          // Debug
          chrome.storage.sync.get( null, function(data) {
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
   * @param   objEvent
   * @return  void
   **/
  switchPage : function( objEvent ) {
    var
        $target     = objEvent.target
      , strPageId   = $target.hash.replace( '#', '' )
      , $page       = document.getElementById( strPageId )
      ;

    if ( document.contains( $page ) ) {
      // 1. Hide all pages, show called.
      var $allPages = document.getElementsByClassName( 'page' );

      for ( var i = 0, intPages = $allPages.length; i < intPages; i++ )
        $allPages[ i ].style.display = 'none';

      $page.style.display = 'block';

      // 2. Make menu link active.
      // TODO: Switch to querySelector(All)? Performance vs Less code
      var $allMenuLinks = document
                            .getElementById( 'menu' )
                              .getElementsByTagName( 'li' );

      for ( var j = 0, intMenuLinks = $allMenuLinks.length; j < intMenuLinks; j++ )
        $allMenuLinks[ j ].classList.remove( 'selected' );

      $target.parentNode.classList.add( 'selected' );
    }

    return false;
  }
  ,

  /**
   * Populate modules list
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  populateModulesList : function() {
    var
        $options    = document.getElementById( strModulesListId ).children
      ;

    for ( var i = 0, intOptions = $options.length; i < intOptions; i++ ) {
      var
          $this         = $options[ i ]
        , strValue      = strModuleLocalPrefix + $this.dataset.module
        , strLocalValue = chrome.i18n.getMessage( strValue )
        ;

      $this.value = strLocalValue;
      $this.dataset.lowercasevalue = strLocalValue.toLowerCase();
    }

    $chooseModule.placeholder = 
      chrome.i18n.getMessage( $chooseModule.dataset.placeholder );
  }
  ,

  /**
   * If value equals one of the options, choose that option automatically
   *
   * @type    method
   * @param   objEvent
   * @return  void
   **/
   onChooseModuleChange: function( objEvent ) {
    var
        strValue  = $chooseModule.value.toLowerCase()
      , $option   = document.querySelector(
          '#chooseModuleList [data-lowercasevalue="' + strValue + '"]'
        )
      ;

    if ( $option !== null )
      Options.chooseModule();
  }
  ,

  /**
   * When choose module form submitted
   *
   * @type    method
   * @param   objEvent
   * @return  void
   **/
  chooseModule : function( objEvent ) {
    var
        strValue  = $chooseModule.value.toLowerCase()
      , $option   = document.querySelector(
          '#chooseModuleList [data-lowercasevalue="' + strValue + '"]'
        )
      ;

    if ( $option !== null ) {
      var
          strModuleName   = $option.dataset.module
        , $targetSubpage  = document.getElementById(
                              strModuleSubpageIdPrefix + strModuleName
                            )
        ;

      if ( document.contains( $targetSubpage ) ) {
        for ( var i = 0; i < intSettingsSubpages; i++ )
          $settingsSubpages[ i ].style.display = 'none';

        $targetSubpage.style.display = 'block';

        // Save chosen module for later use
        $chosenModule.value = strModuleName;

        // Clear current form value, so the placeholder is visible
        $chooseModule.value = '';
      }
    }

    if ( typeof objEvent !== 'undefined' )
      objEvent.preventDefault();
  }
};

/* =============================================================================

  2. Events

 ============================================================================ */

document.addEventListener( 'DOMContentLoaded', Options.init );