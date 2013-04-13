dom-compare
===========

[![Build Status](https://travis-ci.org/Olegas/dom-compare.png)](https://travis-ci.org/Olegas/dom-compare)

NodeJS module to compare two dom trees

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

One can compare them, get the result (is them equals, or not), and get extended report (why them are different).

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
diff = result.getDifferences(); // array of diff-objects

// differences, grouped by node XPath
grouped = reporter.getDifferences(result); // object, key - node XPATH, value - array of differences (strings)

// string representation
console.log(report.report(result));
```

Diff-object has a following form:

```javascript
{
    node: "/document/element",
    message: "Attribute 'attribute': expected value '10' instead of '100'";
}
```

By using `GroupongReporter` one can get a result of a following type

```javascript
{
    '/document/element': [
        "Attribute 'attribute': expected value '10' instead of '100'",
        "Extra attribute 'attributeX'"
    ]    
}
```

### Comparison options

Comparison function can take a third argument with options like this:
```javascript
var options = {
    stripSpaces: true,
    compareComments: true
};

result = compare(expected, actual, options);
```
#### Comments comparison
By default, all comments are ignored. Set `compareComments` options to `true` to compare them too.


#### Whitespace comparison
By default, all text nodes (text, CDATA, comments if enabled as mentioned above) compared with respect 
to leading and trailing whitespaces.
Set `stripSpaces` option to `true` to automatically strip spaces in text and comment nodes. This option
doesn't change the way CDATA sections is compared, they are always compared with respect to whitespaces.

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
