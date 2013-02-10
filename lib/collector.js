(function(){

   "use strict";

   var type = require('./node_types');

   var typeMap = {};

   typeMap[type.ATTRIBUTE_NODE] = "attribute";
   typeMap[type.ELEMENT_NODE] = "element";
   typeMap[type.TEXT_NODE] = "text node";
   typeMap[type.COMMENT_NODE] = "comment node";
   typeMap[type.CDATA_SECTION_NODE] = "CDATA node";

   function Collector(options) {
      this._failures = [];
      this._options = options || {};
   }

   Collector.prototype._describeNode = function(node) {
      if(node.nodeType == type.TEXT_NODE ||
         node.nodeType == type.CDATA_SECTION_NODE ||
         node.nodeType == type.COMMENT_NODE) {
         return "'" + (this._options.stripSpaces ? node.nodeValue.trim() : node.nodeValue) + "'";
      }
      else
         return node.nodeName;
   };

   Collector.prototype.getFailures = function() {
      return this._failures;
   };

   Collector.prototype.getResult = function() {
      return this._failures.length == 0
   };

   Collector.prototype.collectFailure = function(expected, actual) {

      var msg, canContinue = true, vExpected, vActual;

      if(expected && !actual) {
         msg = typeMap[expected.nodeType].charAt(0).toUpperCase() + typeMap[expected.nodeType].substr(1) +
            " " + this._describeNode(expected) + " is not found";
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
               if(vExpected == vActual)
                  throw new Error("Nodes are considered equal but shouldn't");
               else {
                  switch(expected.nodeType) {
                     case type.ATTRIBUTE_NODE:
                        msg = "Expected value '" + vExpected + "' instead of '" + vActual + "' for attribute " + expected.nodeName;
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
                        throw new Error("nodeValue is not equal, but nodeType is unexpected");
                  }
                  canContinue = true;
               }
            }
            else {
               msg = "Expected " + expected.nodeName + " instead of " + actual.nodeName;
               canContinue = false;
            }
         }
         else {
            msg = "Expected node of type " + expected.nodeType +
               " (" + this._describeNode(expected) + ") instead of " +
               actual.nodeType + " (" + this._describeNode(actual) + ")";
            canContinue = false;
         }
      }

      this._failures.push({
         message: msg
      });

      return canContinue;
   };

   module.exports = Collector;


})();