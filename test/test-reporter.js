var assert = require("assert");
var xmldom = require("xmldom");
var parser = new xmldom.DOMParser();
var domCompare = require("../");
var compare = domCompare.compare;
var reporter = domCompare.GroupingReporter;

describe("Differences reporting", function(){

   describe("Grouping reporter", function(){

      it("grouping differences by source node XPath", function(){

         var doc = parser.parseFromString("<doc attr1='1' attr2='2'><node1 attrX='y'><inner1 /></node1><node2><inner /></node2></doc>");
         var doc2 = parser.parseFromString("<doc attr1='10'><node1 /><node2 /><extraNode /></doc>");

         var failures = reporter.getDefferences(compare(doc, doc2));

         assert.equal(3, Object.keys(failures).length);
         assert.equal(3, failures['/doc'].length);
         assert.equal(2, failures['/doc/node1'].length);
         assert.equal(1, failures['/doc/node2'].length);

         // check for results doplication
         failures = reporter.getDefferences(compare(doc, doc2));

         assert.equal(3, Object.keys(failures).length);
         assert.equal(3, failures['/doc'].length);
         assert.equal(2, failures['/doc/node1'].length);
         assert.equal(1, failures['/doc/node2'].length);

      });

   });

});