dom-compare
===========

[![Build Status](https://travis-ci.org/Olegas/dom-compare.png)](https://travis-ci.org/Olegas/dom-compare)
[![Coverage Status](https://coveralls.io/repos/Olegas/dom-compare/badge.png?branch=master)](https://coveralls.io/r/Olegas/dom-compare)
[![NPM version](https://badge.fury.io/js/dom-compare.png)](http://badge.fury.io/js/dom-compare)
[![Dependency Status](https://gemnasium.com/Olegas/dom-compare.png)](https://gemnasium.com/Olegas/dom-compare)

**Breaking changes. v0.3.0 requires node version >=0.10**

NodeJS module to compare two DOM-trees

  * [DOM Comparison](#dom-comparison)
    * [Comparison options](#comparison-options)
        * [Comments comparison](#comments-comparison)
        * [Whitespace comparison](#whitespace-comparison)
        * [Custom comparators](#custom-comparators-since-03)
          * [Writing custom comparators](#writing-custom-comparators)
    * [Cli utility](#cli-utility)
  * [DOM Canonic Form](#dom-canonic-form)

Works with Node.JS v0.10+

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
groupedDiff = reporter.getDifferences(result); // object, key - node XPATH, value - array of differences (strings)

// string representation
console.log(reporter.report(result));
```

Diff-object has a following form:

```javascript
{
    node: "/document/element",
    message: "Attribute 'attribute': expected value '10' instead of '100'";
}
```

By using `GroupingReporter` one can get a result of a following type

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

#### Custom comparators (since 0.3)

**This is experimental feature and may change in future releases**
 
Sometimes one needs a special rules to compare some DOM elements.

Imagine you have some nodes with `config` attr which contains JSON data (see `samples/json-compare`). 
So, if you'd like to compare such documents, you will see something like this:

```
/document/div
	Attribute 'config': expected value '{"attr1":10,"attr2":30,"attr3":-1}' instead of '{"attr1":10,"attr2":20}'
```

This makes not much sense... You can use custom comparators option!

```javascript
var domcompare = require('dom-compare');

// create comparator for specified node name
// you can specify multiple node names here - pass multiple arguments
var configComparator = domcompare.comparators.jsonComparator('config')

var res = domcompare.compare(treeA, treeB, {
    comparators: {
        // for every attrbute difference, run custom comparison routine
        // you can pass multiple comparators here using array
        ATTRIBUTE_NODE: configComparator
    }
});
```

Bundled JSON comparator can parse node's value like JSON, and if it's parsed, 
compare using [rfc6902-json-diff](https://www.npmjs.com/package/rfc6902-json-diff) library.
Using comparators, you can get result like this:

```
/document/div
	Attribute "config" differs. Expected:
		{
		  "attr1": 10,
		  "attr2": 20
		}
		Actual:
		{
		  "attr1": 10,
		  "attr2": 30,
		  "attr3": -1
		}
		Diff:
		[
		  {
		    "op": "replace",
		    "path": "/attr2",
		    "value": 20
		  },
		  {
		    "op": "remove",
		    "path": "/attr3"
		  }
		]
```

##### Writing custom comparators

The comparator is a function. It receives two arguments: expected node and actual node.

Comparators can return following values:

  * any falsy value - skip to next comparator or (if no any) proceed as regular
  * `true` - ignore any differences, continue comparison
  * non empty string - difference found, string is treated as error message
  * object with fields: 
     * `message` - error message as above, 
     * `stop` - boolean flag, set to `true` to stop further comparison  
     
See `lib/comparators/jsonComparator.js` for a working example.

### Cli utility

When installed globally with `npm install -g dom-compare` cli utility is available. 
See usage information and command-line options with `domcompare --help`

You can try it on bundled samples:
```
  $ cd samples
  $ domcompare -s ./expected.xml ./actual.xml
  Documents are not equal
  /document/element
      Attribute 'attribute': expected value '10' instead of '100'
      Attribute 'attributeX' is missed
      Extra element 'inner2'
  /document/element/inner
      Element 'node' is missed
  /document
      Expected CDATA value '  cdata node' instead of 'cdata node  '
```

DOM Canonic Form
----------------

Implemented as [XMLSerializer](https://developer.mozilla.org/en-US/docs/XMLSerializer) interface


Simple rules
 1. Every node (text, node, attribute) on a new line
 2. Empty tags - in a short form
 3. Node indent - 4 spaces, attribute indent - 2 spaces
 4. Attributes are sorted alphabetically
 5. Attribute values are serialized in double quotes

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
