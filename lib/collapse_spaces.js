(function(){

  "use strict";

  module.exports = function collapseSpaces(str) {
    return str.replace(/\s\s+/g, ' ');
  };

})();
