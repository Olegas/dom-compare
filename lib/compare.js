(function () {

   "use strict";

   var type = require('./node_types');

   function _sortAttributes(a, b) {
      return a.nodeName < b.nodeName ? -1 : 1;
   }

   function _filterNodes(list, options) {
      var ret = [],
         i, l, item;
      for (i = 0, l = list.length; i < l; i++) {
         item = list.item(i);
         if (item.nodeType == type.COMMENT_NODE && !options.compareComments)
            continue;
         ret.push(item);
      }
      return ret;
   }

   function _compareNodeList(left, right, options) {
      var lLeft = _filterNodes(left, options),
         lRight = _filterNodes(right, options),
         i, l;

      if (lLeft.length != lRight.length)
         return false;
      for (i = 0, l = lLeft.length; i < l; i++) {
         if (!_compareNode(lLeft[i], lRight[i], options))
            return false;
      }
      return true;
   }

   function _compareAttributes(left, right, options) {
      var aLeft = [], aRight = [],
         i, l;

      if (!left && !right)
         return true;
      if ((left && !right) || (right && !left))
         return false;
      if (left.length != right.length)
         return false;

      Object.keys(left).map(function (i) {
         return parseInt(i, 10);
      }).filter(function (i) {
            return typeof(i) == 'number' && i >= 0;
         }).sort(function (a, b) {
            return a < b ? -1 : 1;
         }).forEach(function (k) {
            aLeft.push(left[k]);
            aRight.push(right[k]);
         });

      aLeft = aLeft.sort(_sortAttributes);
      aRight = aRight.sort(_sortAttributes);

      for (i = 0, l = aLeft.length; i < l; i++) {
         if (aLeft[i].nodeName != aRight[i].nodeName || aLeft[i].nodeValue != aRight[i].nodeValue) {
            return false;
         }
      }
      return true;
   }

   function _compareNode(left, right, options) {
      var vLeft, vRight;

      if (left.nodeName === right.nodeName && left.nodeType == right.nodeType) {
         switch (left.nodeType) {
            case type.DOCUMENT_NODE:
               return _compareNode(left.documentElement, right.documentElement, options);
            case type.ELEMENT_NODE:
               if (_compareAttributes(left.attributes, right.attributes, options)) {
                  return _compareNodeList(left.childNodes, right.childNodes, options);
               } else
                  return false;
            case type.TEXT_NODE:
               // fallthrough
            case type.CDATA_SECTION_NODE:
               // fallthrough
            case type.COMMENT_NODE:
               if (left.nodeType == type.COMMENT_NODE && !options.compareComments)
                  return true;
               vLeft = "" + left.nodeValue;
               vRight = "" + right.nodeValue;
               if (options.stripSpaces && left.nodeType !== type.CDATA_SECTION_NODE) {
                  vLeft = vLeft.trim();
                  vRight = vRight.trim();
               }
               return vLeft === vRight;
               break;
            default:
               throw Error("Node type " + left.nodeType + " comparison is not implemented");
         }
      } else
         return false;
   }

   module.exports = function compare(a, b, options) {

      return _compareNode(a, b, options || {});

   };

})();