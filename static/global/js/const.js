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
  , strConstExtensionVersionName  = objConstExtensionManifest.version_name || strConstExtensionVersion

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
      'https://poziworld.github.io/PoziTone/message/v%v/?lang=%lang&ref=ext&ueip='
  , strConstTranslationUrl = 'https://www.transifex.com/poziworld/pozitone/'

    // External modules, separators, and Notifications
  , strConstGenericStringSeparator      = '_'
  , strConstExternalModuleSeparator     = strConstGenericStringSeparator
  , strConstNotificationIdSeparator     = strConstGenericStringSeparator
  , strConstNotificationLinesSeparator  = "\n\n"
  , strConstNotificationId              =
      strConstExtensionName + strConstNotificationIdSeparator

    // Developers Message: Browser Action settings (tooltip, badge)
  , strConstBadgeOnDevelopersMessageText  = '1'
  , strConstBadgeOnDevelopersMessageColor = [ 44, 160, 44, 255 ]

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
          , currentVersionName    : strConstExtensionVersionName
          , browserName           : bowser.name
          , browserVersion        : bowser.version
          , browserVersionFull    : bowser.versionFull
          , chromeVersion         : strConstChromeVersion
          , chromeVersionFull     : bowser.chromeVersionFull
          , userAgent             : bowser.userAgent

          /**
           * @todo Use a listener instead of poziworldExtension.i18n.saveExtensionLanguage
           */

          , language              : ''
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
