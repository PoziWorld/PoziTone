/*!
  * Bowser - a browser detector
  * https://github.com/ded/bowser
  * MIT License | (c) Dustin Diaz 2014
  */

!function (name, definition) {
  if (typeof module != 'undefined' && module.exports)
    module.exports['browser'] = definition()
  else if (typeof define == 'function')
    define(definition)
  else
    this[name] = definition()
}('bowser', function () {

  function detect(ua) {

    function getFirstMatch(regex) {
      var match = ua.match(regex);
      return (match && match.length > 1 && match[1]) || '';
    }

    var versionIdentifier = getFirstMatch(/version\/(\d+(\.\d+)?)/i)
      , result

    if (/opera|opr/i.test(ua)) {
      result = {
        name: 'Opera'
      , version: versionIdentifier || getFirstMatch(/(?:opera|opr)[\s\/](\d+(\.\d+)?)/i)
      , versionFull: getFirstMatch(/(?:opera|opr)\/(\d+(\.\d+)+(\.\d+)+( \([a-zA-Z0-9 ]{1,50}\))?)/i)
      }
    }
    else if (/yabrowser/i.test(ua)) {
      result = {
        name: 'Yandex.Browser'
      , version: getFirstMatch(/(?:yabrowser)\/(\d+(\.\d+)?)/i)
      , versionFull: getFirstMatch(/(?:yabrowser)\/(\d+(\.\d+)+(\.\d+)?)/i)
      }
    }
    else if (/mrchrome soc/i.test(ua)) {
      result = {
        name: 'Amigo'
      , version: getFirstMatch(/(?:chrome)\/(\d+(\.\d+)?)/i)
      , versionFull: getFirstMatch(/(?:chrome)\/(\d+(\.\d+)+(\.\d+)?)/i)
      }

      result.chromeVersion = result.version;
      result.chromeVersionFull = result.versionFull;
    }
    else if (/nichrome\/self/i.test(ua)) {
      result = {
        name: 'Rambler-Browser'
      , version: getFirstMatch(/(?:nichrome\/self)\/(\d+(\.\d+)?)/i)
      , versionFull: getFirstMatch(/(?:chrome)\/(\d+(\.\d+)+(\.\d+)?)/i)
      }
    }
    else if (/dragon/i.test(ua)) {
      result = {
        name: 'Comodo Dragon'
      , version: getFirstMatch(/(?:dragon)\/(\d+(\.\d+)?)/i)
      , versionFull: getFirstMatch(/(?:dragon)\/(\d+(\.\d+)+(\.\d+)?)/i)
      }
    }
    else if (/corom/i.test(ua)) {
      result = {
        name: 'Cốc Cốc'
      , version: getFirstMatch(/(?:corom)\/(\d+(\.\d+)?)/i)
      , versionFull: getFirstMatch(/(?:corom)\/(\d+(\.\d+)+(\.\d+)?)/i)
      }
    }
    else if (/sleipnir/i.test(ua)) {
      result = {
        name: 'Sleipnir'
      , version: getFirstMatch(/(?:sleipnir)\/(\d+(\.\d+)?)/i)
      , versionFull: getFirstMatch(/(?:sleipnir)\/(\d+(\.\d+)+(\.\d+)?)/i)
      }
    }
    else if (/spark/i.test(ua)) {
      result = {
        name: 'Spark'
      , version: getFirstMatch(/(?:spark)\/(\d+(\.\S+)?)/i)
      , versionFull: getFirstMatch(/(?:spark)\/(\d+(\.\S+)?)/i)
      }
    }
    else if (/iron/i.test(ua)) {
      result = {
        name: 'SRWare Iron'
      , version: getFirstMatch(/(?:iron)\/(\d+(\.\d+)?)/i)
      , versionFull: getFirstMatch(/(?:iron)\/(\d+(\.\d+)+(\.\d+)?)/i)
      }
    }
    else if (/u01-04/i.test(ua)) {
      result = {
        name: 'Uran'
      , version: getFirstMatch(/(?:chrome)\/(\d+(\.\d+)?)/i)
      , versionFull: getFirstMatch(/(?:chrome)\/(\d+(\.\d+)+(\.\d+)?)/i)
      }

      result.chromeVersion = result.version;
      result.chromeVersionFull = result.versionFull;
    }
    else if (/ edg\//i.test(ua)) {
      result = {
        name: 'Edge (Chromium)'
      , version: getFirstMatch(/(?:edg)\/(\d+(\.\d+)?)/i)
      , versionFull: getFirstMatch(/(?:edg)\/(\d+(\.\d+)+(\.\d+)?)/i)
      }

      result.chromeVersion = result.version;
      result.chromeVersionFull = result.versionFull;
    }
    else if (/chrome|crios/i.test(ua)) {
      result = {
        name: 'Chrome' // or a few others that don't identify themselves
      , version: getFirstMatch(/(?:chrome|crios)\/(\d+(\.\d+)?)/i)
      , versionFull: getFirstMatch(/(?:chrome|crios)\/(\d+(\.\d+)+(\.\d+)?)/i)
      }

      result.chromeVersion = result.version;
      result.chromeVersionFull = result.versionFull;
    }
    else result = {
        name: 'Unknown'
      }

    if ( typeof result.name !== 'undefined' && [ 'Amigo', 'Chrome', 'Unknown', 'Uran', 'Edge (Chromium)' ].indexOf(result.name) === -1 ) {
      result.chromeVersion = getFirstMatch(/(?:chrome|crios)\/(\d+(\.\d+)?)/i);
      result.chromeVersionFull = getFirstMatch(/(?:chrome|crios)\/(\d+(\.\d+)+(\.\d+)?)/i);
    }

    result.userAgent = ua

    return result
  }

  var bowser = detect(typeof navigator !== 'undefined' ? navigator.userAgent : '')

  return bowser
});
