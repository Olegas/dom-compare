(function(){

   "use strict";

   var type = require('./node_types');

   function _describeNode(node) {
      var parent = node.parentNode,
          myName = node.nodeName,
          sameSiblings,
          i, l;

      // Find all siblings that have the same name.
      if (parent && parent.childNodes && parent.childNodes.length) {
         sameSiblings = [];
         for(i = 0, l = parent.childNodes.length; i < l; i++) {
            if (parent.childNodes[i].nodeName === myName) {
               sameSiblings.push(parent.childNodes[i]);
            }
         }
      }

      if(node.nodeType == type.DOCUMENT_NODE)
         return "";

      if(sameSiblings && sameSiblings.length > 1) {
         if(node.hasAttribute('id'))
            return myName + "[@id='" + node.getAttribute('id') + "']";
         for(i = 0, l = sameSiblings.length; i < l; i++) {
            if(sameSiblings[i] == node)
               return myName + "[" + (i + 1) + "]";
         }
         throw new Error("Node is not found, but should be!");
      } else
         return myName;
   }

   function _processNode(node, res) {

      res.unshift(_describeNode(node));
      if(node.parentNode)
         _processNode(node.parentNode, res);

   }

   module.exports = function revXPath(node) {

      var res;

      if(!node)
         return "";

      if(node.nodeType == type.DOCUMENT_NODE)
         return "/";

      _processNode(node, res = []);
      return res.join('/');

   };


})();