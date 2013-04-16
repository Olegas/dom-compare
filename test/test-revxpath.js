var assert = require("assert");
var xmldom = require("xmldom");
var parser = new xmldom.DOMParser();
var domCompare = require("../");
var revxpath = domCompare.revXPath;

describe("Reverse XPath", function(){

   it("Builds a node path by its name", function(){

      var doc = parser.parseFromString("<doc><child><item /></child></doc>");

      var path = revxpath(doc.getElementsByTagName('item')[0]);

      assert.equal("/doc/child/item", path);

      path = revxpath(doc.documentElement);

      assert.equal("/doc", path);

      path = revxpath(doc);

      assert.equal("/", path);

   });

   describe("Multiple same named siblings", function(){

      it("number is added to a node name", function(){

         var doc = parser.parseFromString("<doc><child><item /><item><inner /></item></child></doc>");

         var path = revxpath(doc.getElementsByTagName('item')[0]);

         assert.equal("/doc/child/item[1]", path);

         path = revxpath(doc.getElementsByTagName('item')[1]);

         assert.equal("/doc/child/item[2]", path);

         path = revxpath(doc.getElementsByTagName('inner')[0]);

         assert.equal("/doc/child/item[2]/inner", path);

      });

      it("if ID attribute is present, it is used instead of number", function(){

         var doc = parser.parseFromString("<doc><child><item id='x'/><item id='y'/></child></doc>");

         var path = revxpath(doc.getElementById('x'));

         assert.equal("/doc/child/item[@id='x']", path);

         path = revxpath(doc.getElementById('y'));

         assert.equal("/doc/child/item[@id='y']", path);

      });

   });

});