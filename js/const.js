/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2014 PoziWorld
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
    strConstExtensionName         = chrome.i18n.getMessage( 'extensionName' )
  , strConstExtensionVersion      = chrome.runtime.getManifest().version
  , strConstExtensionLanguage     = chrome.i18n.getMessage( 'lang' )
  , strConstChromeVersion         = bowser.chromeVersion

  , strConstNotificationIdSeparator     = '_'
  , strConstNotificationLinesSeparator  = "\n\n"
  , strConstNotificationId              = 
      strConstExtensionName + strConstNotificationIdSeparator

  , strConstSettingsPrefix        = 'objSettings_'
  , strConstGeneralSettings       = strConstSettingsPrefix + 'general'
  ;

/* =============================================================================

  2. Storage

 ============================================================================ */

var
    StorageApi                    = chrome.storage
  , StorageSync                   = StorageApi.sync
  , StorageLocal                  = StorageApi.local
  ;
