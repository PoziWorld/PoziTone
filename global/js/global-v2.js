/* =============================================================================

  Product: PoziTone
  Author: PoziWorld
  Copyright: (c) 2016 PoziWorld
  License: pozitone.com/license

  Table of Contents:

    Global2
      isModuleBuiltIn()
      isModuleBuiltInApiCompliant()
      isModuleExternal()
    On Load
      Initialize

 ============================================================================ */

( function() {
  'use strict';

  function Global2() {

  }

  /**
   * Checks whether the module is built-in.
   *
   * @type    method
   * @param   strModuleId
   *            Module ID.
   * @return  boolean
   **/

  Global2.prototype.isModuleBuiltIn = function ( strModuleId ) {
    return strModuleId in Global.objModules;
  };

  /**
   * Checks whether the module is built-in and API compliant.
   *
   * @type    method
   * @param   strModuleId
   *            Module ID.
   * @param   boolIsBuiltIn
   *            Optional. Whether the module is built-in.
   * @return  boolean
   **/

  Global2.prototype.isModuleBuiltInApiCompliant = function ( strModuleId, boolIsBuiltIn ) {
    if ( boolIsBuiltIn || this.isModuleBuiltIn( strModuleId ) ) {
      var objModule = Global.objModules[ strModuleId ];

      return typeof objModule.boolIsApiCompliant === 'boolean' && objModule.boolIsApiCompliant;
    }

    return false;
  };

  /**
   * Checks whether the module is external.
   *
   * @type    method
   * @param   strModuleId
   *            Module ID.
   * @return  boolean
   **/

  Global2.prototype.isModuleExternal = function ( strModuleId ) {
    return ! this.isModuleBuiltIn( strModuleId );
  };

  pozitone.global = new Global2();
} )();

/* =============================================================================

  On Load

 ============================================================================ */

/**
 * Initializes.
 *
 * @type    method
 * @param   No Parameters taken
 * @return  void
 **/

Global.init();
