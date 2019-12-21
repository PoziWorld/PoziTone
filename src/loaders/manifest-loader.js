const path = require( 'path' );
const fs = require( 'fs' );
const { mergeDeep } = require( 'immutable' );

/**
 * https://nodejs.org/api/fs.html#fs_fs_readfilesync_path_options
 */

const PACKAGE_JSON_PATH = './package.json';
const PACKAGE_JSON_ENCODING = 'utf8';

/**
 * https://developer.chrome.com/extensions/options#full_page
 * https://developer.chrome.com/extensions/options#embedded_options
 * https://developer.mozilla.org/en-US/Add-ons/WebExtensions/manifest.json/options_ui#Syntax
 *
 * @type {string}
 */

const OPTIONS_PAGE_PATH = 'options/index.html';

/**
 * https://developer.mozilla.org/en-US/Add-ons/WebExtensions/manifest.json/applications#Extension_ID_format
 *
 * @type {string}
 */

const EXTENSION_ID_AFFIX = '@poziworld.com';

module.exports = adaptManifestJson;

/**
 * Build browser-specific manifest.json files, as not all manifest.json keys are supported by all browsers.
 * Also, copy over some details from package.json.
 *
 * https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Browser_compatibility_for_manifest.json
 *
 * Inspired by https://stackoverflow.com/a/44249538
 *
 * @param {string} source - Stringified original manifest.json's contents.
 * @return {string} - Stringified updated browser-specific manifest.json's contents.
 */

function adaptManifestJson( source ) {
  let manifestJsonAsJs = JSON.parse( source );
  const packageJsonContents = fs.readFileSync( PACKAGE_JSON_PATH, PACKAGE_JSON_ENCODING );
  const packageJsonAsJs = JSON.parse( packageJsonContents );
  let newProperties = {
    version: packageJsonAsJs.version,
    author: packageJsonAsJs.author,
    homepage_url: packageJsonAsJs.homepage,
  };

  /**
   * See supportedBrowsers in webpack.config.js.
   *
   * @todo Find a cleaner way.
   */

  const browserName = path.basename( this._compiler.outputPath );

  switch ( browserName ) {
    case 'chromium':
    {
      newProperties.background = {
        persistent: true,
      };
      newProperties.options_page = OPTIONS_PAGE_PATH;

      break;
    }
    case 'firefox':
    {
      newProperties.applications = {
        gecko: {
          id: packageJsonAsJs.name + EXTENSION_ID_AFFIX,
        }
      };
      newProperties.options_ui = {
        page: OPTIONS_PAGE_PATH,
        browser_style: true,
      };

      delete manifestJsonAsJs.version_name;

      break;
    }
  }

  const merged = mergeDeep( manifestJsonAsJs, newProperties );
  const mergedJson = JSON.stringify( merged );

  this.emitFile( 'manifest.json', mergedJson );

  return mergedJson;
}
