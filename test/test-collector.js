var assert = require("assert");
var xmldom = require("xmldom");
var parser = new xmldom.DOMParser();
var domCompare = require("../");
var compare = domCompare.compare;

describe("Error collection", function(){

   it("In case root node differs - no any other checks are made", function(){

      var doc1 = parser.parseFromString("<root1 attr='1'><a></a></root1>");
      var doc2 = parser.parseFromString("<root2 attr2='1'><b></b></root2>");

      var result = compare(doc1, doc2, {});

      var failures = result.getDifferences();

      assert.equal(1, failures.length);
      assert.equal("Expected element 'root1' instead of 'root2'", failures[0].message);

   });

   describe("Attributes", function(){

      it("All attributes at single node are compared", function(){

         var doc1 = parser.parseFromString("<root><a attr1='1' attr2='2' attr3='3'></a></root>");
         var doc2 = parser.parseFromString("<root><a attr1='10' attr2='2' attr4='4'></a></root>");

         var result = compare(doc1, doc2, {});

         var failures = result.getDifferences();

         assert.equal(3, failures.length);
         assert.equal("Attribute 'attr1': expected value '1' instead of '10'", failures[0].message);
         assert.equal("Attribute 'attr3' is missed", failures[1].message);
         assert.equal("Extra attribute 'attr4'", failures[2].message);

      });

      it("All attributes that are not found is reported", function(){

         var doc1 = parser.parseFromString("<root><a attr1='1' attr2='2' attr3='3'></a></root>");
         var doc2 = parser.parseFromString("<root><a attr1='1'></a></root>");

         var result = compare(doc1, doc2, {});

         var failures = result.getDifferences();

         assert.equal(2, failures.length);
         assert.equal("Attribute 'attr2' is missed", failures[0].message);
         assert.equal("Attribute 'attr3' is missed", failures[1].message);

         // Case: Target has no attributes at all
         doc1 = parser.parseFromString("<root><a attr2='2' attr3='3'></a></root>");
         doc2 = parser.parseFromString("<root><a></a></root>");

         result = compare(doc1, doc2, {});

         failures = result.getDifferences();

         assert.equal(2, failures.length);
         assert.equal("Attribute 'attr2' is missed", failures[0].message);
         assert.equal("Attribute 'attr3' is missed", failures[1].message);

      });

      it("All extra attributes is reported", function(){

         var doc1 = parser.parseFromString("<root><a attr1='1'></a></root>");
         var doc2 = parser.parseFromString("<root><a attr1='1' attr2='2' attr3='3'></a></root>");

         var result = compare(doc1, doc2, {});

         var failures = result.getDifferences();

         assert.equal(2, failures.length);
         assert.equal("Extra attribute 'attr2'", failures[0].message);
         assert.equal("Extra attribute 'attr3'", failures[1].message);

         // Case: Source has no attributes at all
         doc1 = parser.parseFromString("<root><a></a></root>");
         doc2 = parser.parseFromString("<root><a attr2='2' attr3='3'></a></root>");

         result = compare(doc1, doc2, {});

         failures = result.getDifferences();

         assert.equal(2, failures.length);
         assert.equal("Extra attribute 'attr2'", failures[0].message);
         assert.equal("Extra attribute 'attr3'", failures[1].message);

      });

   });

   describe("Nodes comparison", function(){

      it("Differences reported by types first", function(){
         var doc1 = parser.parseFromString("<root><a /></root>");
         var doc2 = parser.parseFromString("<root>TextTextText</root>");

         var result = compare(doc1, doc2, {});

         var failures = result.getDifferences();

         assert.equal(1, failures.length);
         assert.equal("Expected node of type 1 (element) instead of 3 (text node)", failures[0].message);
      });

      it("... and by node names then", function(){
         var doc1 = parser.parseFromString("<root><a /></root>");
         var doc2 = parser.parseFromString("<root><b /></root>");

         var result = compare(doc1, doc2, {});

         var failures = result.getDifferences();

         assert.equal(1, failures.length);
         assert.equal("Expected element 'a' instead of 'b'", failures[0].message);
      });

      describe("Elements", function(){

      });

      describe("Text nodes", function(){

         it("Extra nodes reported", function(){
            var doc1 = parser.parseFromString("<root>First<a /></root>");
            var doc2 = parser.parseFromString("<root>First<a />Second</root>");

            var result = compare(doc1, doc2, {});

            var failures = result.getDifferences();

            assert.equal(1, failures.length);
            assert.equal("Extra text node 'Second'", failures[0].message);
         });

         it("Not found nodes reported", function(){
            var doc1 = parser.parseFromString("<root>First<a />Second</root>");
            var doc2 = parser.parseFromString("<root>First<a /></root>");

            var result = compare(doc1, doc2, {});

            var failures = result.getDifferences();

            assert.equal(1, failures.length);
            assert.equal("Text node 'Second' is missed", failures[0].message);

            doc1 = parser.parseFromString("<root>First  <a />  Second</root>");
            doc2 = parser.parseFromString("<root>  First<a /></root>");

            result = compare(doc1, doc2, { stripSpaces: true });

            failures = result.getDifferences();

            assert.equal(1, failures.length);
            assert.equal("Text node 'Second' is missed", failures[0].message);
         });

         it("Different content reported", function(){
            var doc1 = parser.parseFromString("<root>Foo<a /></root>");
            var doc2 = parser.parseFromString("<root>Bar<a /></root>");

            var result = compare(doc1, doc2, {});

            var failures = result.getDifferences();

            assert.equal(1, failures.length);
            assert.equal("Expected text 'Foo' instead of 'Bar'", failures[0].message);
         })

      })

   });


   describe("Custom comparison routine", function(){

      it("User can provide custom comparison routine, it can be used to extended reporting", function(){

         var doc1 = parser.parseFromString("<root><a attr='10' /></root>");
         var doc2 = parser.parseFromString("<root><a attr='20' /></root>");

         var result = compare(doc1, doc2, {
            comparators: {
               ATTRIBUTE_NODE: function(e, a) {
                  if(e.nodeValue > a.nodeValue)
                     return "Actual value is less than expected";
                  else if(e.nodeValue < a.nodeValue)
                     return "Actual value is greater than expected";
               }
            }
         });

         var failures = result.getDifferences();

         assert.equal(1, failures.length);
         assert.equal("Actual value is greater than expected", failures[0].message);


      });

      it("Custom comparison routine can ignore node differences", function(){

         var doc1 = parser.parseFromString("<root><a attr='10' /></root>");
         var doc2 = parser.parseFromString("<root><a attr='20' /></root>");

         var result = compare(doc1, doc2, {
            comparators: {
               ATTRIBUTE_NODE: function() {
                  return true;
               }
            }
         });

         var failures = result.getDifferences();

         assert.equal(0, failures.length);

      });

      it("Custom comparison routine can skip node checking. It will be processed by common routine.", function(){

         var doc1 = parser.parseFromString("<root><a attr='10' m='2'/></root>");
         var doc2 = parser.parseFromString("<root><a attr='20' m='3'/></root>");

         var result = compare(doc1, doc2, {
            comparators: {
               ATTRIBUTE_NODE: function(e, a) {
                  if(e.nodeName == 'attr') {
                     if(e.nodeValue > a.nodeValue)
                        return "Actual value is less than expected";
                     else if(e.nodeValue < a.nodeValue)
                        return "Actual value is greater than expected";
                  }
               }
            }
         });

         var failures = result.getDifferences();

         assert.equal(2, failures.length);
         assert.equal("Actual value is greater than expected", failures[0].message);
         assert.equal("Attribute 'm': expected value '2' instead of '3'", failures[1].message);


      });

   });


   describe("Calling user-provided callback for formatting failure", function () {

      it("User can provide a custom callback function for modifying the format of the failure", function () {

         var doc1 = parser.parseFromString("<root1 attr='1'><a></a></root1>");
         var doc2 = parser.parseFromString("<root2 attr2='1'><b></b></root2>");

         var result = compare(doc1, doc2, {
            formatFailure: function (failure, nodeElem) {
               failure.nodeName = nodeElem.nodeName;
               failure.randomKey = "random-value";
               return failure;
            }
         });

         var failures = result.getDifferences();

         assert.equal(1, failures.length);
         assert.equal("Expected element 'root1' instead of 'root2'", failures[0].message);

         assert.equal(failures[0].nodeName, "#document");
         assert.equal(failures[0].randomKey, "random-value");

      });

   });


});