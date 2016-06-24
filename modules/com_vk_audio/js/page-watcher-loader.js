/* =============================================================================

  Product: PoziTone
  Author: PoziWorld
  Copyright: (c) 2016 PoziWorld
  License: pozitone.com/license

 ============================================================================ */

// Choose the right PageWatcher to initialize, the one for the old site or for the redesigned one.

( function (  ) {
  if ( document.contains( document.getElementById( 'page_header_cont' ) ) ) {
    pozitone.pageWatcherV2.init();
  }
  else {
    pozitone.pageWatcherV1.init();
  }
} )();
