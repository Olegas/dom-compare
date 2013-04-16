var assert = require("assert");
var xmldom = require("xmldom");
var parser = new xmldom.DOMParser();
var domCompare = require('../');
var canonize = (new (domCompare.XMLSerializer)()).serializeToString;

describe("Canonize", function(){
   it("can make a canonical form of a document", function(){
      var doc = parser.parseFromString("<doc a='x' z='y' b='1'><elem m='1' x='k' a='4'><a>" +
         "<!--COMMENT--></a><b><![CDATA[ cdata node]]></b></elem><x><z></z></x></doc>");
      var docCanon =
"<doc\n" +
"  a=\"x\"\n" +
"  b=\"1\"\n" +
"  z=\"y\">\n" +
"    <elem\n" +
"      a=\"4\"\n" +
"      m=\"1\"\n" +
"      x=\"k\">\n" +
"        <a>\n" +
"            <!--COMMENT-->\n" +
"        </a>\n" +
"        <b>\n" +
"            <![CDATA[ cdata node]]>\n" +
"        </b>\n" +
"    </elem>\n" +
"    <x>\n" +
"        <z />\n" +
"    </x>\n" +
"</doc>";
      assert.equal(docCanon, canonize(doc));
   });

   it("Default indent - 2 spaces for attributes and 4 spaces for nested elements", function(){
      var doc = parser.parseFromString("<doc a='1'><nested>text</nested></doc>");
      var docCanon =
"<doc\n" +
"  a=\"1\">\n" +
"    <nested>\n" +
"        text\n" +
"    </nested>\n" +
"</doc>";
      assert.equal(docCanon, canonize(doc));
   });

   it("Empty tags serialized in short form", function(){
      var doc = parser.parseFromString("<doc></doc>");
      var docCanon = "<doc />";
      assert.equal(docCanon, canonize(doc));

      doc = parser.parseFromString("<doc a='1'></doc>");
      docCanon =
"<doc\n" +
"  a=\"1\" />";
      assert.equal(docCanon, canonize(doc));
   });

   it("Any leading/triling whitespace in text and comment nodes is trimmed", function(){
      var doc = parser.parseFromString("<doc>  test<elem>   aaa   </elem><!--  comment  --></doc>");
      var docCanon =
"<doc>\n" +
"    test\n" +
"    <elem>\n" +
"        aaa\n" +
"    </elem>\n" +
"    <!--comment-->\n" +
"</doc>";
      assert.equal(docCanon, canonize(doc));
   });

   it("Attribute values serialized in double quotes", function(){
      var doc = parser.parseFromString("<doc><a href='\"x\"' alt=\"'x'\" /></doc>");
      var docCanon =
"<doc>\n" +
"    <a\n" +
"      alt=\"'x'\"\n" +
"      href=\"&quot;x&quot;\" />\n" +
"</doc>";
      assert.equal(docCanon, canonize(doc));
   });

});