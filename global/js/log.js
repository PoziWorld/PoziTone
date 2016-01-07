/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2016 PoziWorld
  License                 :           pozitone.com/license
  File                    :           global/js/log.js
  Description             :           Log JavaScript

  Table of Contents:

    Log
      init()
      add()
      setPropertiesOnUserRecord()
    Listeners
      StorageApi.onChanged
    Events

 ============================================================================ */

/* =============================================================================

  Log

 ============================================================================ */

const
    strLogDo              = ', do'
  , strLogDoNot           = ', do not'
  , strLogDone            = ', done'
  , strLogError           = ', error'
  , strLogSuccess         = ', success'
  , strLogNoSuccess       = ', no success'

  , strJoinUeipVar        = 'strJoinUeip'
  , strJoinUeipAgreed     = 'yes'
  ;

var
    strLog                = ''

  , Log                   = {
      strJoinUeip         : null
    , strLastTrackedEvent : ''
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
    StorageSync.get( strConstGeneralSettings, function( objReturn ) {
      var objGeneralSettings = objReturn[ strConstGeneralSettings ];

      if (
            typeof objGeneralSettings === 'object'
        &&  typeof objGeneralSettings[ strJoinUeipVar ] === 'string'
      )
        Log.strJoinUeip = objGeneralSettings[ strJoinUeipVar ];
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

        if (
              strEvent !== Log.strLastTrackedEvent
          ||  ! Global.isEmpty( miscVar )
        ) {
          mixpanel.track( strEvent, miscVar );
          Log.strLastTrackedEvent = strEvent;

          if ( strEvent === strConstLogOnInstalled )
            Log.setPropertiesOnUserRecord( miscVar );
        }
      }
      // If storage hasn't returned value yet and at least one try left
      // TODO: Use observer/deferred instead
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
  ,

  /**
   * Set properties on a user record
   *
   * @type    method
   * @param   objProperties
   *            The properties to set
   * @param   funcCallback
   *            Optional. Callback
   * @return  void
   **/
  setPropertiesOnUserRecord : function( objProperties, funcCallback ) {
    mixpanel.identify( mixpanel.get_distinct_id() );
    mixpanel.people.set( objProperties, funcCallback );
  }
};

/* =============================================================================

  Listeners

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
StorageApi.onChanged.addListener(
  function( objChanges, strAreaName ) {
    if ( strAreaName === 'sync' ) {
      var objGeneralSettings = objChanges[ strConstGeneralSettings ];

      if (
            typeof objGeneralSettings === 'object'
        &&  typeof objGeneralSettings.newValue === 'object'
        &&  typeof objGeneralSettings.newValue[ strJoinUeipVar ] === 'string'
      )
        Log.strJoinUeip = objGeneralSettings.newValue[ strJoinUeipVar ];
      else if (
            typeof objGeneralSettings === 'object'
        &&  typeof objGeneralSettings.newValue === 'undefined'
        &&  typeof objGeneralSettings.oldValue === 'object'
      )
        Log.strJoinUeip = null;
    }
  }
);

/* =============================================================================

  Events

 ============================================================================ */

document.addEventListener( 'DOMContentLoaded', Log.init );
