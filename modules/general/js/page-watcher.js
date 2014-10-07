/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2014 PoziWorld
  License                 :           pozitone.com/license
  File                    :           js/page-watcher.js
  Description             :           General Page Watcher JavaScript

  Table of Contents:

  1. General Page Watcher
      getVolumeDeltaSettings()
      processButtonClick_volumeUp()
      processButtonClick_volumeDown()

 ============================================================================ */

/* =============================================================================

  1. General Page Watcher

 ============================================================================ */

var GeneralPageWatcher = {

  /**
   * Get general (default) volume delta settings and for the current player.
   *
   * @type    method
   * @param   funcSetVolume
   *            Callback to set changed volume level.
   * @return  void
   **/
  getVolumeDeltaSettings : function( funcSetVolume ) {
    var arrSettings = [ strModuleSettings, strConstGeneralSettings ];

    StorageSync.get( arrSettings, function( objReturn ) {
      var
          objModuleSettings   = objReturn[ strModuleSettings ]
        , objGeneralSettings  = objReturn[ strConstGeneralSettings ]
        ;

      // Use general delta if set to do so, use player's own delta otherwise
      if (
              typeof objModuleSettings === 'object'
          &&  typeof objModuleSettings.boolUseGeneralVolumeDelta === 'boolean'
      ) {
        if (
              objModuleSettings.boolUseGeneralVolumeDelta
          &&  typeof objGeneralSettings === 'object'
        ) {
          var intGeneralVolumeDelta = objGeneralSettings.intVolumeDelta;

          if (
                typeof intGeneralVolumeDelta === 'number'
            &&  intGeneralVolumeDelta > 0
          )
            funcSetVolume( intGeneralVolumeDelta );
        }
        else {
          var intModuleVolumeDelta = objModuleSettings.intVolumeDelta;

          if (
                typeof intModuleVolumeDelta === 'number'
            &&  intModuleVolumeDelta > 0
          )
            funcSetVolume( intModuleVolumeDelta );
        }
      }
    });
  }
  ,

  /**
   * Simulate "volume up" player method
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  processButtonClick_volumeUp : function() {
    PageWatcher.changeVolume( 'up' );
  }
  ,

  /**
   * Simulate "volume up" player method
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  processButtonClick_volumeDown : function() {
    PageWatcher.changeVolume( 'down' );
  }
};