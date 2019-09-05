(function(){

  "use strict";

  module.exports = function collapseSpaces(str) {
    // Replace all whitespace with the space character and then collapse all white space to one space character
    return str.replace(/\s/g, ' ').replace(/\s\s+/g, ' ');
  };

})();
