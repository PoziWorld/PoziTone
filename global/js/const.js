/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2016 PoziWorld
  License                 :           pozitone.com/license
  File                    :           global/js/const.js
  Description             :           Constants JavaScript

  Table of Contents:

    Constants
    Storage
    PoziTone

 ============================================================================ */

'use strict';

/* =============================================================================

  Constants

 ============================================================================ */

const
    // Extension
    strConstExtensionId           = chrome.runtime.id
  , objConstExtensionManifest     = chrome.runtime.getManifest()
  , strConstExtensionName         = objConstExtensionManifest.name
  , strConstExtensionVersion      = objConstExtensionManifest.version
  , strConstExtensionLanguage     = chrome.i18n.getMessage( 'lang' )

    // Browser & UI
  , boolConstIsBowserAvailable    = typeof bowser === 'object'
  , boolConstIsOpera              =
      boolConstIsBowserAvailable && bowser.name === 'Opera'
  , boolConstIsYandex             =
      boolConstIsBowserAvailable && bowser.name === 'Yandex.Browser'
  , boolConstIsOperaAddon         = boolConstIsOpera || boolConstIsYandex
  , strConstChromeVersion         =
      boolConstIsBowserAvailable ? bowser.chromeVersion : ''
  , boolConstUseOptionsUi         =
      strConstChromeVersion >= '40.0' && ! boolConstIsOpera

    // URLs
  , strConstVersionParam          = '%v'
  , strConstLangParam             = '%lang'
  , strConstMessageUrl            =
      'http://poziworld.github.io/PoziTone/message/v%v/?lang=%lang&ref=ext&ueip='
  , strConstInstallationUrl       = ! boolConstIsOperaAddon
      ? 'https://chrome.google.com/webstore/detail/pozitone/bdglbogiolkffcmojmmkipgnpkfipijm'
      : 'https://addons.opera.com/extensions/details/pozitone/'
  , strConstRateUrl               =
        strConstInstallationUrl
      + ( ! boolConstIsOperaAddon
          ? '/reviews'
          : '#feedback-container'
        )
  , strConstBugsUrl               =
        strConstInstallationUrl
      + ( ! boolConstIsOperaAddon
          ? '/support'
          : '?reports#feedback-container'
        )

    // External modules, separators, and Notifications
  , strConstGenericStringSeparator      = '_'
  , strConstExternalModuleSeparator     = strConstGenericStringSeparator
  , strConstNotificationIdSeparator     = strConstGenericStringSeparator
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

  , objConstUserSetUp             = boolConstIsBowserAvailable
      ? {
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

  , objConst = {
        strIncentiveCarrotUrl : 'https://cash.me/$PoziTone'
    }
  ;

/* =============================================================================

  Storage

 ============================================================================ */

var StorageApi = chrome.storage
  , StorageLocal = StorageApi.local
  , StorageSync = StorageApi.sync || StorageLocal
  ;

/* =============================================================================

  PoziTone

 ============================================================================ */

var pozitone = {};
