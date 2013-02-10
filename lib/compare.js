(function () {

   "use strict";

   var type = require('./node_types');
   var Collector = require('./collector');

   function Comparator(options, collector) {
      this._options = options || {};
      if(!collector)
         throw new Error("Collector instance must be specified");
      this._collector = collector;
   }

   Comparator.prototype._sortAttributes = function(a, b) {
      return a.nodeName < b.nodeName ? -1 : 1;
   };

   Comparator.prototype._filterNodes = function(list) {
      var ret = [],
         i, l, item;
      for (i = 0, l = list.length; i < l; i++) {
         item = list.item(i);
         if (item.nodeType == type.COMMENT_NODE && !this._options.compareComments)
            continue;
         ret.push(item);
      }
      return ret;
   };

   Comparator.prototype._compareNodeList = function(left, right) {
      var lLeft = this._filterNodes(left),
         lRight = this._filterNodes(right),
         i, l;

      for (i = 0, l = Math.max(lLeft.length, lRight.length); i < l; i++) {
         if(lLeft[i] && lRight[i]) {
            if (!this.compareNode(lLeft[i], lRight[i]))
               return false;
         }
         else {
            return this._collector.collectFailure(lLeft[i], lRight[i]);
         }
      }
      return true;
   };

   Comparator.prototype._compareAttributes = function(left, right) {
      var aLeft = [], aRight = [],
         i, l, src;

      if (!left && !right)
         return true;

      if(left && right) {
         src = left.length > right.length ? left : right;
      }
      else {
         src = left || right;
      }

      Object.keys(src).map(function (i) {
         return parseInt(i, 10);
      }).filter(function (i) {
         return typeof(i) == 'number' && i >= 0;
      }).sort(function (a, b) {
         return a < b ? -1 : 1;
      }).forEach(function (k) {
         if(left && left[k])
            aLeft.push(left[k]);
         if(right && right[k])
            aRight.push(right[k]);
      });

      aLeft = aLeft.sort(this._sortAttributes);
      aRight = aRight.sort(this._sortAttributes);

      for (i = 0, l = Math.max(aLeft.length, aRight.length); i < l; i++) {
         if(aLeft[i] && aRight[i]) {
            if (aLeft[i].nodeName != aRight[i].nodeName || aLeft[i].nodeValue != aRight[i].nodeValue) {
               if(!this._collector.collectFailure(aLeft[i], aRight[i]))
                  return false;
            }
         }
         else {
            if(!this._collector.collectFailure(aLeft[i], aRight[i]))
               return false;
         }
      }
      return true;
   };

   Comparator.prototype.compareNode = function(left, right) {
      var vLeft, vRight, r;

      if (left.nodeName === right.nodeName && left.nodeType == right.nodeType) {
         switch (left.nodeType) {
            case type.DOCUMENT_NODE:
               return this.compareNode(left.documentElement, right.documentElement);
            case type.ELEMENT_NODE:
               return this._compareAttributes(left.attributes, right.attributes) &&
                     this._compareNodeList(left.childNodes, right.childNodes);
            case type.TEXT_NODE:
               // fallthrough
            case type.CDATA_SECTION_NODE:
               // fallthrough
            case type.COMMENT_NODE:
               if (left.nodeType == type.COMMENT_NODE && !this._options.compareComments)
                  return true;
               vLeft = "" + left.nodeValue;
               vRight = "" + right.nodeValue;
               if (this._options.stripSpaces && left.nodeType !== type.CDATA_SECTION_NODE) {
                  vLeft = vLeft.trim();
                  vRight = vRight.trim();
               }
               r = vLeft === vRight;
               return !r ? this._collector.collectFailure(left, right) : r;
               break;
            default:
               throw Error("Node type " + left.nodeType + " comparison is not implemented");
         }
      } else
         return this._collector.collectFailure(left, right);
   };

   module.exports = function(a, b, options) {


      var collector = new Collector(options);
      var comparator = new Comparator(options, collector);
      comparator.compareNode(a, b);

      return collector;

   };

})();