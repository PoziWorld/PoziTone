/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2015 PoziWorld
  License                 :           pozitone.com/license
  File                    :           js/const.js
  Description             :           Constants JavaScript

  Table of Contents:

  1. Constants
  2. Storage

 ============================================================================ */

/* =============================================================================

  1. Constants

 ============================================================================ */

const
    strConstExtensionId           = chrome.runtime.id
  , strConstExtensionName         = chrome.i18n.getMessage( 'extensionName' )
  , strConstExtensionVersion      = chrome.runtime.getManifest().version
  , strConstExtensionLanguage     = chrome.i18n.getMessage( 'lang' )

  , boolConstIsBowserAvailable    = typeof bowser === 'object'
  , strConstChromeVersion         =
      boolConstIsBowserAvailable ? bowser.chromeVersion : ''
  , boolConstUseOptionsUi         =
          boolConstIsBowserAvailable
      &&  strConstChromeVersion >= '40.0'
      &&  bowser.name !== 'Opera'

  , strConstNotificationIdSeparator     = '_'
  , strConstNotificationLinesSeparator  = "\n\n"
  , strConstNotificationId              = 
      strConstExtensionName + strConstNotificationIdSeparator

  , strConstSettingsPrefix        = 'objSettings_'
  , strConstGeneralSettings       = strConstSettingsPrefix + 'general'

  , strConstLogOnInstalled        = 'chrome.runtime.onInstalled'

  , objConstUserSetUp             = typeof bowser === 'object' ?
        {
            currentVersion        : strConstExtensionVersion
          , browserName           : bowser.name
          , browserVersion        : bowser.version
          , browserVersionFull    : bowser.versionFull
          , chromeVersion         : strConstChromeVersion
          , chromeVersionFull     : bowser.chromeVersionFull
          , language              : strConstExtensionLanguage
          , userAgent             : bowser.userAgent
        }
      : {}
  ;

/* =============================================================================

  2. Storage

 ============================================================================ */

var
    StorageApi                    = chrome.storage
  , StorageSync                   = StorageApi.sync
  , StorageLocal                  = StorageApi.local
  ;
