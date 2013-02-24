(function() {

   "use strict";

   function GroupingReporter(result) {
      this._res = {};
      result.getDifferences().forEach(function(f){
         (this._res[f.node] = (this._res[f.node] || [])).push(f.message);
      }.bind(this));
   }

   GroupingReporter.prototype.getDifferences = function() {
      return this._res;
   };

   GroupingReporter.prototype.toString = function() {
      return Object.keys(this._res).map(function(path){
         return [path, "\n\t", this._res[path].join('\n\t')].join('');
      }.bind(this)).join('\n');
   };

   module.exports = GroupingReporter;

})();