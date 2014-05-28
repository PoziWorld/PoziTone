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
  2. Listeners
      chrome.storage.onChanged
  3. Events

 ============================================================================ */

/* =============================================================================

  1. Log

 ============================================================================ */

var
    strLog                = ''
  , strLogDo              = ', do'
  , strLogDoNot           = ', do not'
  , strLogDone            = ', done'
  , strLogError           = ', error'
  , strLogSuccess         = ', success'
  , strLogNoSuccess       = ', no success'

  , strJoinUeipObj        = 'objSettings_general'
  , strJoinUeipVar        = 'strJoinUeip'
  , strJoinUeipAgreed     = 'yes'

  , Log                   = {
      strJoinUeip         : null
    , intTrackCount       : 0
    , intTrackCountMax    : 20
    , intTrackCountDelay  : 150
  ,

  /**
   * Initialize
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  init : function() {
    chrome.storage.sync.get( strJoinUeipObj, function( objReturn ) {
      if (
            typeof objReturn[ strJoinUeipObj ] === 'object'
        &&  typeof objReturn[ strJoinUeipObj ][ strJoinUeipVar ] === 'string'
      )
        Log.strJoinUeip = objReturn[ strJoinUeipObj ][ strJoinUeipVar ];
    });
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
    var funcTrack = function(
                        strEvent
                      , miscVar
                      , boolTrack
                      , boolDoNotSendData
                    ) {
      var funcTrackRetry;

      if (
            Log.strJoinUeip === strJoinUeipAgreed
        &&  typeof boolTrack !== 'undefined'
        &&  boolTrack
      ) {
        if ( typeof boolDoNotSendData !== 'undefined' && boolDoNotSendData )
          miscVar = {};
        else if ( Array.isArray( miscVar ) )
          miscVar = Global.convertArrToObj( miscVar );

        mixpanel.track( strEvent, miscVar );
      }
      // If storage hasn't returned value yet and at least one try left
      else if (
            Log.strJoinUeip === null
        &&  Log.intTrackCount < Log.intTrackCountMax
      ) {
        funcTrackRetry  = setTimeout(
                              function() {
                                funcTrack(
                                    strEvent
                                  , miscVar
                                  , boolTrack
                                  , boolDoNotSendData
                                );
                              }
                            , Log.intTrackCountDelay
                          );
        Log.intTrackCount++;
      }

      // Reset if value received
      if ( typeof Log.strJoinUeip === 'string' )
        Log.intTrackCount = 0;
    };

    funcTrack( strEvent, miscVar, boolTrack, boolDoNotSendData );
  }
};

/* =============================================================================

  2. Listeners

 ============================================================================ */

/**
 * Fired when one or more items change.
 *
 * @type    method
 * @param   objMessage
 *            Message received
 * @param   objSender
 *            Sender of the message
 * @return  void
 **/
chrome.storage.onChanged.addListener(
  function( objChanges, strAreaName ) {
    if (
          typeof objChanges[ strJoinUeipObj ] === 'object'
      &&  typeof objChanges[ strJoinUeipObj ].newValue === 'object'
      &&  typeof 
            objChanges[ strJoinUeipObj ].newValue[ strJoinUeipVar ] === 'string'
    )
      Log.strJoinUeip = objChanges[ strJoinUeipObj ].newValue[ strJoinUeipVar ];
    else if (
          typeof objChanges[ strJoinUeipObj ] === 'object'
      &&  typeof objChanges[ strJoinUeipObj ].newValue === 'undefined'
      &&  typeof objChanges[ strJoinUeipObj ].oldValue === 'object'
    )
      Log.strJoinUeip = null;
  }
);

/* =============================================================================

  3. Events

 ============================================================================ */

document.addEventListener( 'DOMContentLoaded', Log.init );