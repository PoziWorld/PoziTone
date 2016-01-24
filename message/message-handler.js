( function() {
  'use strict';

  // Check whether there is a message in the requested language
  var strQueryString = location.search
    , strIndicator = '?lang='
    ;

  // Check whether the language is specified
  if ( strQueryString.indexOf( strIndicator ) === 0 && strQueryString.length > 7 ) {
    var strLang = strQueryString
                      .replace( strIndicator, '' )
                      .substr( 0, 2 )
      , $message = document.getElementById( strLang )
      ;

    if ( document.contains( $message ) ) {
      showMessage( $message );
    }
    else {
      showDefaultMessage();
    }
  }
  else {
    showDefaultMessage();
  }

  function showMessage( $message ) {
    document.title = $message.getAttribute( 'data-title' );

    $message.style.display = 'block';
    $message.setAttribute( 'hidden', false );
  }

  function showDefaultMessage() {
    var $defaultMessage = document.getElementById( 'en' );

    showMessage( $defaultMessage );
  }
} )();
