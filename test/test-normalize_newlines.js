var assert = require('assert');
var normalizeNewlines = require('../lib/normalize_newlines');

describe('normalize_newlines', function () {
  it('should transform CR+LF to LF', function() {
    var input = '\r\n';
    var expected = '\n';
    assert.equal(normalizeNewlines(input), expected);
  });

  it('should transform CR to LF', function() {
    var input = '\r';
    var expected = '\n';
    assert.equal(normalizeNewlines(input), expected);
  });

  it('should transform mixed CR+LF and LF to LF', function() {
    var input = '\n\r\n\n\r\n\n';
    var expected = '\n\n\n\n\n';
    assert.equal(normalizeNewlines(input), expected);
  });

  it('should transform mixed CR+LF and CR to LF', function() {
    var input = '\r\n\r\n\r \r\n\r';
    var expected = '\n\n\n \n\n';
    assert.equal(normalizeNewlines(input), expected);
  });

  it('should transform mixed CR and LF to LF', function() {
    var input = '\n\n\r \n\r';
    var expected = '\n\n\n \n\n';
    assert.equal(normalizeNewlines(input), expected);
  });

  it('should transform mixed CR+LF and CR and LF to LF', function() {
    var input = '\n\r\n\r\n\n\r \n\r\n\r';
    var expected = '\n\n\n\n\n \n\n\n';
    assert.equal(normalizeNewlines(input), expected);
  });
});
