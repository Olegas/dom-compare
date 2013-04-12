(function() {

   "use strict";

   module.exports = {
      report: function(res) {
         var _res = this.getDefferences(res);
         return Object.keys(_res).map(function(path){
            return [path, "\n\t", _res[path].join('\n\t')].join('');
         }.bind(this)).join('\n');
      },
      getDefferences: function(res) {
         var _res = {};
         res.getDifferences().forEach(function(f){
            (_res[f.node] = (_res[f.node] || [])).push(f.message);
         }.bind(this));
         return _res;
      }
   };

})();