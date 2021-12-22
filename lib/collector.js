(function(){

   "use strict";

   var type = require('./node_types');
   var revxpath = require('./revxpath.js');
   var collapseSpaces = require('./collapse_spaces');
   var normalizeNewlines = require('./normalize_newlines');

   var typeMap = {},
       comparatorTypeMap = {};

   typeMap[type.ATTRIBUTE_NODE] = "attribute";
   typeMap[type.ELEMENT_NODE] = "element";
   typeMap[type.TEXT_NODE] = "text node";
   typeMap[type.COMMENT_NODE] = "comment node";
   typeMap[type.CDATA_SECTION_NODE] = "CDATA node";
   typeMap[type.DOCUMENT_NODE] = "document";
   typeMap[type.DOCUMENT_FRAGMENT_NODE] = "document fragment";

   Object.keys(type).forEach(function(k){
      comparatorTypeMap[type[k]] = k;
   });

   function Collector(options) {
      this._diff = [];
      this._options = options || {};
   }

   Collector.prototype._describeNode = function(node) {
      if(node.nodeType == type.TEXT_NODE ||
         node.nodeType == type.CDATA_SECTION_NODE ||
         node.nodeType == type.COMMENT_NODE) {
         var nodeValue = node.nodeValue;

         if(this._options.stripSpaces) {
            nodeValue = nodeValue.trim();
         }
         if(this._options.collapseSpaces) {
            nodeValue = collapseSpaces(nodeValue);
         }
         if(this._options.normalizeNewlines) {
            nodeValue = normalizeNewlines(nodeValue);
         }

         return "'" + nodeValue + "'";
      }
      else
         return "'" + node.nodeName + "'";
   };

   Collector.prototype.getDifferences = function() {
      return this._diff;
   };

   Collector.prototype.getResult = function() {
      return this._diff.length == 0
   };

   Collector.prototype.collectFailure = function(expected, actual) {

      var msg, canContinue = true, vExpected, vActual, ref = expected || actual, cmprtr, r;

      if(this._options.comparators && (cmprtr = this._options.comparators[comparatorTypeMap[ref.nodeType]])) {
         if(!(cmprtr instanceof Array))
            cmprtr = [ cmprtr ];
         for(var i = 0, l = cmprtr.length; i < l; i++) {
            r = cmprtr[i](expected, actual);
            if(r) {
               // true -> ignore differences. Stop immediately, continue;
               if(r === true) {
                  return true;
               }
               // string - treat as error message, continue;
               else if(typeof r == 'string') {
                  msg = r;
                  canContinue = true;
               }
               // object - .message = error message, .stop - stop flag
               else if(typeof r == 'object') {
                  msg = r.message;
                  canContinue = !(!!r.stop);
               }
               break;
            }

         }
      }

      if(!msg) {

         if(expected && !actual) {
            msg = typeMap[expected.nodeType].charAt(0).toUpperCase() + typeMap[expected.nodeType].substr(1) +
               " " + this._describeNode(expected) + " is missed";
            canContinue = true;
         }
         else if(!expected && actual) {
            msg = "Extra " + typeMap[actual.nodeType] + " " + this._describeNode(actual);
            canContinue = true;
         }
         else {
            if(expected.nodeType == actual.nodeType) {
               if(expected.nodeName == actual.nodeName) {
                  vExpected = expected.nodeValue;
                  vActual = actual.nodeValue;
                  if(this._options.stripSpaces && expected.nodeType != type.CDATA_SECTION_NODE) {
                     vExpected = vExpected.trim();
                     vActual = vActual.trim();
                  }
                  if(this._options.collapseSpaces && expected.nodeType != type.CDATA_SECTION_NODE) {
                     vExpected = collapseSpaces(vExpected);
                     vActual = collapseSpaces(vActual);
                  }
                  if(this._options.normalizeNewlines) {
                     vExpected = normalizeNewlines(vExpected);
                     vActual = normalizeNewlines(vActual);
                  }
                  if(vExpected == vActual)
                     throw new Error("Nodes are considered equal but shouldn't");
                  else {
                     switch(expected.nodeType) {
                        case type.ATTRIBUTE_NODE:
                           msg = "Attribute '" + expected.nodeName + "': expected value '" + vExpected + "' instead of '" + vActual + "'";
                           break;
                        case type.COMMENT_NODE:
                           msg = "Expected comment value '" + vExpected + "' instead of '" + vActual + "'";
                           break;
                        case type.CDATA_SECTION_NODE:
                           msg = "Expected CDATA value '" + vExpected + "' instead of '" + vActual + "'";
                           break;
                        case type.TEXT_NODE:
                           msg = "Expected text '" + vExpected + "' instead of '" + vActual + "'";
                           break;
                        default:
                            //if they are the same class of objects and undefined nodeType, assumes attribute
                            //TODO remove when jsdom fix this
                            if (expected.constructor === actual.constructor) {
                              msg =
                                "Attribute '" +
                                expected.nodeName +
                                "': expected value '" +
                                vExpected +
                                "' instead of '" +
                                vActual +
                                "'";
                              break;
                            }
                           throw new Error("nodeValue is not equal, but nodeType is unexpected");
                     }
                     canContinue = true;
                  }
               }
               else {
                  msg = "Expected " + typeMap[expected.nodeType] +
                     " '" + expected.nodeName + "' instead of '" + actual.nodeName + "'";
                  canContinue = false;
               }
            }
            else {
               msg = "Expected node of type " + expected.nodeType +
                  " (" + typeMap[expected.nodeType] + ") instead of " +
                  actual.nodeType + " (" + typeMap[actual.nodeType] + ")";
               canContinue = false;
            }
         }
      }

      this._diff.push({
         node: revxpath(ref.ownerElement || ref.parentNode),
         message: msg
      });

      return canContinue;
   };

   module.exports = Collector;


})();
