var xmldom = require('tensor-xmldom');
var parser = new xmldom.DOMParser();
var fs = require('fs');
var lib = require('../../index');

var domExpected = parser.parseFromString(fs.readFileSync('./expected-attr.xml', 'utf8'), 'text/xml');
var domActual = parser.parseFromString(fs.readFileSync('./actual-attr.xml', 'utf8'), 'text/xml');


var jsonComparator = lib.comparators.jsonComparator('config');
var reporter = lib.GroupingReporter;
var compare = lib.compare;

var result = compare(domActual, domExpected, {
   comparators: {
      ATTRIBUTE_NODE: jsonComparator
   }
});

if (!result.getResult()) {
   console.log(reporter.report(result));
}


