/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2015 PoziWorld
  License                 :           pozitone.com/license
  File                    :           global/js/const.js
  Description             :           Constants JavaScript

  Table of Contents:

    Constants
    Storage

 ============================================================================ */

/* =============================================================================

  Constants

 ============================================================================ */

const
    // Extension
    strConstExtensionId           = chrome.runtime.id
  , strConstExtensionName         = chrome.i18n.getMessage( 'extensionName' )
  , strConstExtensionVersion      = chrome.runtime.getManifest().version
  , strConstExtensionLanguage     = chrome.i18n.getMessage( 'lang' )
  , objConstExtensionManifest     = chrome.runtime.getManifest()

    // Browser & UI
  , boolConstIsBowserAvailable    = typeof bowser === 'object'
  , strConstChromeVersion         =
      boolConstIsBowserAvailable ? bowser.chromeVersion : ''
  , boolConstUseOptionsUi         =
          boolConstIsBowserAvailable
      &&  strConstChromeVersion >= '40.0'
      &&  bowser.name !== 'Opera'

    // URLs
  , strConstMessageUrl            =
      'http://poziworld.github.io/PoziTone/message/v%v/?lang=%lang&ref=ext&ueip='
  , strConstVersionParam          = '%v'
  , strConstLangParam             = '%lang'

    // External modules & Notifications
  , strConstExternalModuleSeparator     = '_'
  , strConstNotificationIdSeparator     = '_'
  , strConstNotificationLinesSeparator  = "\n\n"
  , strConstNotificationId              =
      strConstExtensionName + strConstNotificationIdSeparator

    // Developers Message: Browser Action settings (tooltip, badge)
  , strConstTitleOnDevelopersMessageText  =
      chrome.i18n.getMessage( 'messageFromDevelopersTooltipText' )
  , strConstBadgeOnDevelopersMessageText  = '!'
  , strConstBadgeOnDevelopersMessageColor = [ 255, 0, 0, 122 ]

    // Developers Message: Alarm
  , strConstDevelopersMessageAlarmName          = 'developersMessage'
  , intConstDevelopersMessageAlarmDelayMinutes  = 1440

    // Settings
  , strConstSettingsPrefix        = 'objSettings_'
  , strConstGeneralSettingsSuffix = 'general'
  , strConstGeneralSettings       =
      strConstSettingsPrefix + strConstGeneralSettingsSuffix

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

  Storage

 ============================================================================ */

var
    StorageApi                    = chrome.storage
  , StorageSync                   = StorageApi.sync
  , StorageLocal                  = StorageApi.local
  ;
