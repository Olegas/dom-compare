var assert = require("assert");
var xmldom = require("xmldom");
var parser = new xmldom.DOMParser();
var domCompare = require("../");
var compare = domCompare.compare;

describe('Compare', function () {
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
});