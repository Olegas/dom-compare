dom-compare
===========

[![Build Status](https://travis-ci.org/Olegas/dom-compare.png)](https://travis-ci.org/Olegas/dom-compare)

NodeJS module to compare two dom trees

**EARLY DEVELOPMENT STAGE**

**NOT COMPLETE, NOT STABLE API**

DOM Comparison
--------------

```javascript
var compare = require('dom-compare').comapre;
var expected = ...; // expected DOM tree
var actual = ...; // acutal one

var result = compare(expected, actual);

console.log(result.getResult()); // true if equal

var differences = result.getDifferences(); // array of strings, each one is comparison error

var groupedDiffs = result.getDifferences({ grouped: true }); // comparison errors, grouped by expected node XPath

```

DOM Canonic Form
----------------
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
var canonize = require('dom-compare').canonize;
var doc = ...; // parse above document somehow 
console.log(canonize(doc));
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
