dom-compare
===========

[![Build Status](https://travis-ci.org/Olegas/dom-compare.png)](https://travis-ci.org/Olegas/dom-compare)

NodeJS module to compare two dom trees

**EARLY DEVELOPMENT STAGE**

**NOT COMPLETE, NOT STABLE API**

DOM Comparison
--------------

Consider two documents. Expected:
```xml
<document>
    <!-- comment -->
    <element attribute="10" attributeX="100">
        <text>  text content </text>
        <inner>
            <node />
        </inner>
    </element>
    <![CDATA[  cdata node]]>
</document>
```
and actual one:
```xml
<document>
    <element attribute="100">
        <text>text content</text>
        <inner />
        <inner2 />
    </element>
    <![CDATA[cdata node  ]]>
</document>
```

```javascript
var compare = require('dom-compare').compare,
    reporter = require('dom-compare').GroupingReporter,
    expected = ..., // expected DOM tree
    actual = ..., // actual one
    result, diff, groupedDiff;

// compare to DOM trees, get a result object
result = compare(expected, actual);

// get comparison result
console.log(result.getResult()); // false cause' trees are different

// get all differences
diff = result.getDifferences(); // array of strings, each one is comparison error

// differences, groupped by node XPath
grouped = reporter.getDifferences(result);

// string representation
console.log(report.report(result));
```

DOM Canonic Form
----------------

Implemented as [XMLSerializer](https://developer.mozilla.org/en-US/docs/XMLSerializer) interface


Simple rules
 1. Every node (text, node, attribute) on a new line
 2. Empty tags - in a short form
 3. Node indent - 4 spaces, attribute indent - 2 spaces
 4. Attributes are sorted alphabetically

Consider the following XML-document...
```xml
<document>
  <element>DOM Compare</element>
  <emptyNode></emptyNode>
  <element attribute1="value" attribute2="value">
    <element>Text node</element>
  </element>
</document>
```
...and code snippet...
```javascript
var canonizingSerializer = new (require('dom-compare').XMLSerializer)();
var doc = ...; // parse above document somehow 
console.log(canonizingSerializer.serializeToString(doc));
```
You'll receive the following output
```xml
<document>
    <element>
        DOM Compare
    </element>
    <emptyNode />
    <element
      attribute1="value"
      attribute2="value">
        <element>
            Text node
        </element>
    </element>
</document>
```
