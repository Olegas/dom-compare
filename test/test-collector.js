var assert = require("assert");
var xmldom = require("xmldom");
var parser = new xmldom.DOMParser();
var compare = require("../lib/compare");

describe("Error collection", function(){

   it("In case root node differs - no any other checks are made", function(){

      var doc1 = parser.parseFromString("<root1 attr='1'><a></a></root1>");
      var doc2 = parser.parseFromString("<root2 attr2='1'><b></b></root2>");

      var result = compare(doc1, doc2, {});

      var failures = result.getFailures();

      assert.equal(1, failures.length);
      assert.equal("Expected element 'root1' instead of 'root2'", failures[0].message);

   });

   describe("Attributes", function(){

      it("All attributes at single node are compared", function(){

         var doc1 = parser.parseFromString("<root><a attr1='1' attr2='2' attr3='3'></a></root>");
         var doc2 = parser.parseFromString("<root><a attr1='10' attr2='2' attr4='4'></a></root>");

         var result = compare(doc1, doc2, {});

         var failures = result.getFailures();

         assert.equal(3, failures.length);
         assert.equal("Attribute attr1: expected value '1' instead of '10'", failures[0].message);
         assert.equal("Attribute 'attr3' is not found", failures[1].message);
         assert.equal("Extra attribute 'attr4'", failures[2].message);

      });

      it("All attributes that are not found is reported", function(){

         var doc1 = parser.parseFromString("<root><a attr1='1' attr2='2' attr3='3'></a></root>");
         var doc2 = parser.parseFromString("<root><a attr1='1'></a></root>");

         var result = compare(doc1, doc2, {});

         var failures = result.getFailures();

         assert.equal(2, failures.length);
         assert.equal("Attribute 'attr2' is not found", failures[0].message);
         assert.equal("Attribute 'attr3' is not found", failures[1].message);

         // Case: Target has no attributes at all
         doc1 = parser.parseFromString("<root><a attr2='2' attr3='3'></a></root>");
         doc2 = parser.parseFromString("<root><a></a></root>");

         result = compare(doc1, doc2, {});

         failures = result.getFailures();

         assert.equal(2, failures.length);
         assert.equal("Attribute 'attr2' is not found", failures[0].message);
         assert.equal("Attribute 'attr3' is not found", failures[1].message);

      });

      it("All extra attributes is reported", function(){

         var doc1 = parser.parseFromString("<root><a attr1='1'></a></root>");
         var doc2 = parser.parseFromString("<root><a attr1='1' attr2='2' attr3='3'></a></root>");

         var result = compare(doc1, doc2, {});

         var failures = result.getFailures();

         assert.equal(2, failures.length);
         assert.equal("Extra attribute 'attr2'", failures[0].message);
         assert.equal("Extra attribute 'attr3'", failures[1].message);

         // Case: Source has no attributes at all
         doc1 = parser.parseFromString("<root><a></a></root>");
         doc2 = parser.parseFromString("<root><a attr2='2' attr3='3'></a></root>");

         result = compare(doc1, doc2, {});

         failures = result.getFailures();

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

         var failures = result.getFailures();

         assert.equal(1, failures.length);
         assert.equal("Expected node of type 1 (element) instead of 3 (text node)", failures[0].message);
      });

      it("... and by node names then", function(){
         var doc1 = parser.parseFromString("<root><a /></root>");
         var doc2 = parser.parseFromString("<root><b /></root>");

         var result = compare(doc1, doc2, {});

         var failures = result.getFailures();

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

            var failures = result.getFailures();

            assert.equal(1, failures.length);
            assert.equal("Extra text node 'Second'", failures[0].message);
         });

         it("Not found nodes reported", function(){
            var doc1 = parser.parseFromString("<root>First<a />Second</root>");
            var doc2 = parser.parseFromString("<root>First<a /></root>");

            var result = compare(doc1, doc2, {});

            var failures = result.getFailures();

            assert.equal(1, failures.length);
            assert.equal("Text node 'Second' is not found", failures[0].message);

            doc1 = parser.parseFromString("<root>First  <a />  Second</root>");
            doc2 = parser.parseFromString("<root>  First<a /></root>");

            result = compare(doc1, doc2, { stripSpaces: true });

            failures = result.getFailures();

            assert.equal(1, failures.length);
            assert.equal("Text node 'Second' is not found", failures[0].message);
         });

         it("Different content reported", function(){
            var doc1 = parser.parseFromString("<root>Foo<a /></root>");
            var doc2 = parser.parseFromString("<root>Bar<a /></root>");

            var result = compare(doc1, doc2, {});

            var failures = result.getFailures();

            assert.equal(1, failures.length);
            assert.equal("Expected text 'Foo' instead of 'Bar'", failures[0].message);
         })

      })

   });






});