(function() {

   "use strict";

   module.exports = {
      report: function(res) {
         var _res = this.getDifferences(res);
         return Object.keys(_res).map(function(path){
            var message = _res[path].map(function(message){
               return message.replace(/\n/g, '\n\t\t');
            }).join('\n\t');
            return [path, "\n\t", message].join('');
         }).join('\n');
      },
      getDifferences: function(res) {
         var _res = {};
         res.getDifferences().forEach(function(f){
            (_res[f.node] = (_res[f.node] || [])).push(f.message);
         });
         return _res;
      }
   };

})();