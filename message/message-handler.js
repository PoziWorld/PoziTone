( function() {
  var
      strQueryString  = location.search
    , strIndicator    = '?lang='
    ;

  if ( strQueryString.indexOf( strIndicator ) === 0 && strQueryString.length > 7 ) {
    var
        strLang   = strQueryString.replace( strIndicator, '' )
      , $message  = document.getElementById( strLang )
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
    var strTitle = $message.getAttribute( 'data-title' );

    document.title = strTitle;

    $message.style.display = 'block';
    $message.setAttribute( 'hidden', false );
  }

  function showDefaultMessage() {
    var $defaultMessage = document.getElementById( 'en' );

    showMessage( $defaultMessage );
  }
} )();
