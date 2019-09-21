(function(){

   "use strict";

   var type = require('./node_types');
   var Collector = require('./collector');
   var collapseSpaces = require('./collapse_spaces');
   var normalizeNewlines = require('./normalize_newlines');

   function Comparator(options, collector) {
      this._options = options || {};
      if(!collector)
         throw new Error("Collector instance must be specified");
      this._collector = collector;
   }

   Comparator.prototype._filterNodes = function(list) {
      var ret = [],
         i, l, item;
      for (i = 0, l = list.length; i < l; i++) {
         item = list.item(i);
         if (item.nodeType == type.COMMENT_NODE && !this._options.compareComments)
            continue;
         if (item.nodeType == type.TEXT_NODE && ("" + item.nodeValue).trim() == "")
            continue;
         ret.push(item);
      }
      return ret;
   };

   Comparator.prototype._compareNodeList = function(left, right) {
      var lLeft = this._filterNodes(left),
         lRight = this._filterNodes(right),
         i, l, result = true;

      for (i = 0, l = Math.max(lLeft.length, lRight.length); i < l; i++) {
         if(lLeft[i] && lRight[i]) {
            if (!this.compareNode(lLeft[i], lRight[i])) {
               result = false;
            }
         }
         else {
            this._collector.collectFailure(lLeft[i], lRight[i]);
            result = false;
         }
      }
      return result;
   };

   Comparator.prototype._compareAttributes = function(expected, actual) {
      var aExpected = {}, aActual = {},
         i, l;

      if (!expected && !actual)
         return true;



      for(i = 0, l = expected.length; i < l; i++) {
         aExpected[expected[i].nodeName] = expected[i];
      }

      for(i = 0, l = actual.length; i < l; i++) {
         aActual[actual[i].nodeName] = actual[i];
      }

      for(i in aExpected) {
         // both nodes has an attribute
         if(aExpected.hasOwnProperty(i) && aActual.hasOwnProperty(i)) {
            // but values is differ
            var vExpected = aExpected[i].nodeValue;
            var vActual = aActual[i].nodeValue;
            if(this._options.stripSpaces && aExpected[i].nodeType != type.CDATA_SECTION_NODE) {
               vExpected = vExpected.trim();
               vActual = vActual.trim();
            }
            if(this._options.collapseSpaces && aExpected[i].nodeType != type.CDATA_SECTION_NODE) {
               vExpected = collapseSpaces(vExpected);
               vActual = collapseSpaces(vActual);
            }
            if(this._options.normalizeNewlines) {
               vExpected = normalizeNewlines(vExpected);
               vActual = normalizeNewlines(vActual);
            }
            if(vExpected !== vActual) {
               if(!this._collector.collectFailure(aExpected[i], aActual[i]))
                  return false;
            }
            // remove to check for extra/missed attributes;
            delete aActual[i];
            delete aExpected[i];
         }
      }

      // report all missed attributes
      for(i in aExpected) {
         if(aExpected.hasOwnProperty(i))
            if(!this._collector.collectFailure(aExpected[i], null))
               return false;
      }

      // report all extra attributes
      for(i in aActual) {
         if(aActual.hasOwnProperty(i))
            if(!this._collector.collectFailure(null, aActual[i]))
               return false;
      }

      return true;
   };

   Comparator.prototype.compareNode = function(left, right) {
      var vLeft, vRight, r;

      if (typeof left === 'string' || typeof right === 'string') {
         throw new Error('String comparison is not supported. You must parse string to document to perform comparison.');
      }

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
            case type.DOCUMENT_FRAGMENT_NODE:
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
               if (this._options.collapseSpaces && left.nodeType !== type.CDATA_SECTION_NODE) {
                  vLeft = collapseSpaces(vLeft);
                  vRight = collapseSpaces(vRight);
               }
               if (this._options.normalizeNewlines) {
                  vLeft = normalizeNewlines(vLeft);
                  vRight = normalizeNewlines(vRight);
               }
               r = vLeft === vRight;
               return !r ? this._collector.collectFailure(left, right) : r;
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
