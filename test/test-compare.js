var assert = require("assert");
var xmldom = require("xmldom");
var parser = new xmldom.DOMParser();
var domCompare = require("../");
var compare = domCompare.compare;

describe('Compare', function () {

   it('equal documents reports no differences', function() {
      assert.equal(true, compare(
          parser.parseFromString('<html><div /></html>'),
          parser.parseFromString('<html><div /></html>')
      ).getResult());
   });

   describe('Strings', function() {
      it('string comparison is not supported, error is thrown', function() {
         var errorText;
         try {
            compare('<html></html>', '<html></html>')
         } catch(e) {
            errorText = '' + e;
         }
         assert.equal(
             'Error: String comparison is not supported. You must parse string to document to perform comparison.',
             errorText);
      });
   });


   describe('Documents', function () {
      it('with different root node names are different', function () {
         var doc1 = parser.parseFromString("<doc />");
         var doc2 = parser.parseFromString("<div />");
         assert.equal(false, compare(doc1, doc2).getResult());
      });

      it('with same root node names are same', function () {
         var doc1 = parser.parseFromString("<doc />");
         var doc2 = parser.parseFromString("<doc />");
         assert.equal(true, compare(doc1, doc2).getResult());
      });

      it('with same attribute set but different order are same', function () {
         var doc1 = parser.parseFromString("<doc x='1' a='2' />");
         var doc2 = parser.parseFromString("<doc a='2' x='1' />");
         assert.equal(true, compare(doc1, doc2).getResult());
      });

      it('with different attributes set is different', function () {
         var doc1 = parser.parseFromString("<doc x='1' />");
         var doc2 = parser.parseFromString("<doc a='2' />");
         assert.equal(false, compare(doc1, doc2).getResult());
      });

      it('with same attributes but with different values is different', function () {
         var doc1 = parser.parseFromString("<doc a='1' />");
         var doc2 = parser.parseFromString("<doc a='2' />");
         assert.equal(false, compare(doc1, doc2).getResult());
      });
   });

   describe('Document fragments', function () {
      it('supported', function () {
         var doc = parser.parseFromString("<doc />");

         var frag1 = doc.createDocumentFragment();
         var frag2 = doc.createDocumentFragment();

         frag1.appendChild(doc.createElement('div'));
         frag2.appendChild(doc.createElement('div'));

         assert.equal(true, compare(frag1, frag2).getResult());
      });
   });

   describe('Nodes', function () {
      it('with different names are different', function () {
         var doc1 = parser.parseFromString("<doc><nodeA></doc>");
         var doc2 = parser.parseFromString("<doc><nodeB></doc>");
         assert.equal(false, compare(doc1, doc2).getResult());
      });

      it('with same names are same', function () {
         var doc1 = parser.parseFromString("<doc><nodeA></doc>");
         var doc2 = parser.parseFromString("<doc><nodeA></doc>");
         assert.equal(true, compare(doc1, doc2).getResult());
      });

      it('with same attribute set but different order are same', function () {
         var doc1 = parser.parseFromString("<doc><node x='1' a='2' /></doc>");
         var doc2 = parser.parseFromString("<doc><node a='2' x='1' /></doc>");
         assert.equal(true, compare(doc1, doc2).getResult());
      });

      it('with different attributes set is different', function () {
         var doc1 = parser.parseFromString("<doc><node x='1' /></doc>");
         var doc2 = parser.parseFromString("<doc><node a='2' /></doc>");
         assert.equal(false, compare(doc1, doc2).getResult());
      });

      it('with same attributes but with different values is different', function () {
         var doc1 = parser.parseFromString("<doc><node a='1' /></doc>");
         var doc2 = parser.parseFromString("<doc><node a='2' /></doc>");
         assert.equal(false, compare(doc1, doc2).getResult());

         describe("spaces matters", function(){

            it("", function(){
               var doc1 = parser.parseFromString("<doc><node a='1' /></doc>");
               var doc2 = parser.parseFromString("<doc><node a=' 1 ' /></doc>");
               assert.equal(false, compare(doc1, doc2).getResult());
            });

            it("but can be omitted", function(){
               doc1 = parser.parseFromString("<doc><node a='1' /></doc>");
               doc2 = parser.parseFromString("<doc><node a=' 1 ' /></doc>");
               assert.equal(true, compare(doc1, doc2, { stripSpaces: true }).getResult());
            });
         });

      });
   });

   describe('Node Lists', function () {
      it("order of child nodes matters", function () {
         var doc1 = parser.parseFromString("<doc><nodeA/><nodeB/></doc>");
         var doc2 = parser.parseFromString("<doc><nodeB/><nodeA/></doc>");
         assert.equal(false, compare(doc1, doc2).getResult());
      });

      it("full list of child nodes is compared", function() {
          var doc1 = parser.parseFromString("<doc><nodeA/><nodeB/></doc>");
          var doc2 = parser.parseFromString("<doc><nodeA/><nodeB/><nodeC/><nodeD/></doc>");
          assert.equal(false, compare(doc1, doc2).getResult());
          assert.equal(2, compare(doc1, doc2).getDifferences().length);
      });
   });

   describe("Text nodes", function () {

      describe('Comments', function () {
         it("normally comments are ignored", function () {
            var doc1 = parser.parseFromString("<doc><!-- doc1 --><node><!-- has --></node></doc>");
            var doc2 = parser.parseFromString("<doc><!-- doc2 --><node /></doc>");
            assert.equal(true, compare(doc1, doc2).getResult());

            doc1 = parser.parseFromString("<doc><!-- doc1 --></doc>");
            doc2 = parser.parseFromString("<doc><!-- doc2 --></doc>");
            assert.equal(true, compare(doc1, doc2).getResult());
         });

         it("when `compareComments` options is set - comments are compared too", function () {
            var doc1 = parser.parseFromString("<doc><!-- doc1 --></doc>");
            var doc2 = parser.parseFromString("<doc><!-- doc2 --></doc>");
            assert.equal(false, compare(doc1, doc2, { compareComments: true }).getResult());

            doc1 = parser.parseFromString("<doc><!-- doc1 --></doc>");
            doc2 = parser.parseFromString("<doc><!-- doc1 --></doc>");
            assert.equal(true, compare(doc1, doc2, { compareComments: true }).getResult());

            doc1 = parser.parseFromString("<doc><!-- doc1 --><node><!-- has --></node></doc>");
            doc2 = parser.parseFromString("<doc><!-- doc2 --><node /></doc>");
            assert.equal(false, compare(doc1, doc2, { compareComments: true }).getResult());
         });

         describe("Extra whitespace stripping", function () {
            it("normally all whitespaces at the beginning/end are preserved", function () {
               var doc1 = parser.parseFromString("<doc><!--doc1--></doc>");
               var doc2 = parser.parseFromString("<doc><!--doc1--></doc>");
               assert.equal(true, compare(doc1, doc2, { compareComments: true }).getResult());

               doc1 = parser.parseFromString("<doc><!--doc1--></doc>");
               doc2 = parser.parseFromString("<doc><!-- doc1--></doc>");
               assert.equal(false, compare(doc1, doc2, { compareComments: true }).getResult());

               doc1 = parser.parseFromString("<doc><!--doc1--></doc>");
               doc2 = parser.parseFromString("<doc><!--doc1 --></doc>");
               assert.equal(false, compare(doc1, doc2, { compareComments: true }).getResult());
            });

            it("`stripSpaces` option strips them", function () {
               var doc1 = parser.parseFromString("<doc><!--doc1--></doc>");
               var doc2 = parser.parseFromString("<doc><!--doc1--></doc>");
               assert.equal(true, compare(doc1, doc2, {
                  compareComments: true,
                  stripSpaces: true
               }).getResult());

               doc1 = parser.parseFromString("<doc><!--doc1--></doc>");
               doc2 = parser.parseFromString("<doc><!-- doc1--></doc>");
               assert.equal(true, compare(doc1, doc2, {
                  compareComments: true,
                  stripSpaces: true
               }).getResult());

               doc1 = parser.parseFromString("<doc><!--doc1--></doc>");
               doc2 = parser.parseFromString("<doc><!--doc1 --></doc>");
               assert.equal(true, compare(doc1, doc2, {
                  compareComments: true,
                  stripSpaces: true
               }).getResult());
            });
         });
      });

      describe("Text", function () {
         it("compared by default with all whitespaces", function () {
            var doc1 = parser.parseFromString("<doc><node>A</node>B</doc>");
            var doc2 = parser.parseFromString("<doc><node>A</node>B</doc>");
            assert.equal(true, compare(doc1, doc2).getResult());

            doc1 = parser.parseFromString("<doc><node>A</node>B</doc>");
            doc2 = parser.parseFromString("<doc><node>A</node> B</doc>");
            assert.equal(false, compare(doc1, doc2).getResult());

            doc1 = parser.parseFromString("<doc>B<node>A</node></doc>");
            doc2 = parser.parseFromString("<doc><node>A</node>B</doc>");
            assert.equal(false, compare(doc1, doc2).getResult());

            doc1 = parser.parseFromString("<doc><node>A</node></doc>");
            doc2 = parser.parseFromString("<doc><node> A </node></doc>");
            assert.equal(false, compare(doc1, doc2).getResult());
         });

         it("empty text nodes are always ignored", function(){

            var doc1 = parser.parseFromString("<doc>    <node /><b />    </doc>");
            var doc2 = parser.parseFromString("<doc><node />     <b /></doc>");
            assert.equal(true, compare(doc1, doc2).getResult());

         });

         it("set `stripSpaces` option to get rid of them", function () {
            var doc1 = parser.parseFromString("<doc><node>A</node></doc>");
            var doc2 = parser.parseFromString("<doc><node> A </node></doc>");
            assert.equal(true, compare(doc1, doc2, { stripSpaces: true }).getResult());
         });
      });

      describe("CDATA", function () {
         it("compared as text nodes but `stripSpaces` are not respected", function () {
            var doc1 = parser.parseFromString("<doc><![CDATA[data-data-data]]></doc>");
            var doc2 = parser.parseFromString("<doc><![CDATA[data-data-data]]></doc>");
            assert.equal(true, compare(doc1, doc2).getResult());

            doc1 = parser.parseFromString("<doc><![CDATA[data-data-data]]></doc>");
            doc2 = parser.parseFromString("<doc><![CDATA[data -data-data]]></doc>");
            assert.equal(false, compare(doc1, doc2).getResult());

            doc1 = parser.parseFromString("<doc><![CDATA[data-data-data]]></doc>");
            doc2 = parser.parseFromString("<doc><![CDATA[ data-data-data]]></doc>");
            assert.equal(false, compare(doc1, doc2).getResult());

            doc1 = parser.parseFromString("<doc><![CDATA[data-data-data]]></doc>");
            doc2 = parser.parseFromString("<doc><![CDATA[ data-data-data]]></doc>");
            assert.equal(false, compare(doc1, doc2, { stripSpaces: true }).getResult());
         });
      });
   });

   describe('Regression tests', function() {
      it('Issue #36', function() {
          var str1 = `<note>
<to>Tove</to>
<from>Jani</from>
<heading>Reminder</heading>
<body>I got changed</body>
</note>`;
          var str2 = `<note>
<to>Tove</to>
<from>Jani</from>
<heading>Reminder</heading>
<body>Don't forget me this weekend!</body>
<age>seventeen</age>
<address>street of freedom</address>
<anotherelement>
 <message>Hiyo</message>
</anotherelement>
</note>`;

          var doc1 = parser.parseFromString(str1);
          var doc2 = parser.parseFromString(str2);
          assert.equal(false, compare(doc1, doc2).getResult());
          var diff = compare(doc1, doc2).getDifferences();
          assert.equal(4, diff.length);
          assert.equal(
              "Expected text 'I got changed' instead of 'Don't forget me this weekend!'",
              diff[0].message);
          assert.equal(
              "Extra element 'age'",
              diff[1].message);
          assert.equal(
              "Extra element 'address'",
              diff[2].message);
          assert.equal(
              "Extra element 'anotherelement'",
              diff[3].message);
      });
   });
});