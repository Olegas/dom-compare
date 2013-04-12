(function(){

   "use strict";

   module.exports = {
      compare: require('./lib/compare'),
      XMLSerializer: require('./lib/canonizer'),
      revXPath: require('./lib/revxpath'),
      GroupingReporter: require('./lib/reporters/groupingReporter.js')
   };

})();