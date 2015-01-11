var jsonDiff = require('rfc6902-json-diff');

module.exports = function nodeValueJSONComparator(nodeNamesToCompare) {

   function mustCompareNode(node) {
      if (nodeNamesToCompare && nodeNamesToCompare.length) {
         return nodeNamesToCompare.indexOf(node.nodeName) !== -1;
      } else {
         return true;
      }
   }

   return function nodeValueJSONComparator(expected, actual) {

      var
         node = expected || actual,
         eVal = expected && expected.nodeValue,
         aVal = actual && actual.nodeValue,
         result, diff;


      if (mustCompareNode(node) && eVal && aVal) {
         try {
            eVal = eVal && JSON.parse(eVal);
            aVal = aVal && JSON.parse(aVal);

            diff = jsonDiff(aVal, eVal);

            if (diff.length > 0) {
               result = 'Attribute "config" differs. Expected:\n' + JSON.stringify(eVal, null, 2);
               result += '\nActual:\n' + JSON.stringify(aVal, null, 2);
               result += '\nDiff:\n' + JSON.stringify(diff, null, 2);

               return result;
            } else {
               return true;
            }
         } catch (e) {
            // ignore
         }
      }
   };
};