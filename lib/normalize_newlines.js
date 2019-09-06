(function(){

  "use strict";

  module.exports = function normalizeNewlines(str) {
    // First replace all CR+LF newlines then replace CR newlines
    return str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  };

})();
