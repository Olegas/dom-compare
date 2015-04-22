(function(){

   "use strict";

   var libPrefix = process.env.COVER ? './lib-cov' : './lib';

   module.exports = process.browser ? {
      compare: require('./lib/compare'),
      XMLSerializer: require('./lib/canonizer'),
      revXPath: require('./lib/revxpath'),
      GroupingReporter: require('./lib/reporters/groupingReporter.js')
   } :
   {
      compare: require(libPrefix + '/compare'),
      XMLSerializer: require(libPrefix + '/canonizer'),
      revXPath: require(libPrefix + '/revxpath'),
      GroupingReporter: require(libPrefix + '/reporters/groupingReporter.js')
   };

})();