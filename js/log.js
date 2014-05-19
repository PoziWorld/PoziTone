/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2014 PoziWorld
  License                 :           pozitone.com/license
  File                    :           js/log.js
  Description             :           Log JavaScript

  Table of Contents:

  1. Log
      init()
      add()
  2. Events

 ============================================================================ */

/* =============================================================================

  1. Log

 ============================================================================ */

var
    strLog          = ''
  , strLogDo        = ', do'
  , strLogDoNot     = ', do not'
  , strLogDone      = ', done'
  , strLogError     = ', error'
  , strLogSuccess   = ', success'
  , strLogNoSuccess = ', no success'

  , Log             = {

  /**
   * Initialize
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  init : function() {
  }
  ,

  /**
   * Add new item to the log (console.log + track)
   *
   * @type    method
   * @param   strEvent
   *            Event name/desc
   * @param   miscVar
   *            Optional. Var to output contents of
   * @param   boolTrack
   *            Optional. Whether to track this
   * @param   boolDoNotSendData
   *            Optional. Whether to send details of the event
   * @return  void
   **/
  add : function( strEvent, miscVar, boolTrack, boolDoNotSendData ) {
    if ( typeof miscVar === 'undefined' )
      miscVar = {};

    // Debug
    console.log( strEvent, miscVar );

    // Tracking
    if ( typeof boolTrack !== 'undefined' && boolTrack ) {
      if ( typeof boolDoNotSendData !== 'undefined' && boolDoNotSendData )
        miscVar = {};
      else if ( Array.isArray( miscVar ) )
        miscVar = Global.convertArrToObj( miscVar );

      mixpanel.track( strEvent, miscVar );
    }
  }
};

/* =============================================================================

  2. Events

 ============================================================================ */

document.addEventListener( 'DOMContentLoaded', Log.init );