(function(){

  "use strict";

  module.exports = function normalizeNewlines(str) {
    return str.replace(/\r\n/g, '\n');
  };

})();
