(function(){

   "use strict";
   function factory(type) {
      function _describeNode(node) {
         var parent = node.parentNode,
             myName = node.nodeName,
             sameSiblings = parent && parent.getElementsByTagName && parent.getElementsByTagName(myName),
             i, l;

         if(node.nodeType == type.DOCUMENT_NODE)
            return "";

         if(sameSiblings && sameSiblings.length > 1) {
            if(node.hasAttribute('id'))
               return myName + "[@id='" + node.getAttribute('id') + "']";
            for(i = 0, l = sameSiblings.length; i < l; i++) {
               if(sameSiblings.item(i) == node)
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

      return function (node) {

         var res;

         if(!node)
            return "";

         if(node.nodeType == type.DOCUMENT_NODE)
            return "/";

         _processNode(node, res = []);
         return res.join('/');

      };
   }

   if((this || (0,eval)('this')).document) {
      define(['./node_types'], function(node_types) {

         return factory(node_types);
      });
   }
   else {
      var node_types = require('./node_types');
      module.exports = factory(node_types);
   }


})();
