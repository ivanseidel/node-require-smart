const path = require('path')
const chalk = require('chalk')
const assert = require('assert')

const RequireSmart = require('../')

const testCaller = require('./testCaller')

module.exports = [
  callerKnowsLocation,
  relativeCallIsEqualToAbsolute
]

// Check caller knows this folder
function callerKnowsLocation() {
  // Caller is the index.js
  assert.equal(RequireSmart.callPath(), path.join(__dirname, 'index.js'))

  // Caller is this file
  assert.equal(testCaller.callPath(), path.join(__dirname, 'tests.relative.js'))
}

// Check if calling an absolute path results in the same as a relative one
function relativeCallIsEqualToAbsolute() {
  // To compare
  var expectation = RequireSmart(__dirname + '/testFolder')

  // Caller is the index.js
  assert.deepEqual(expectation, RequireSmart('./testFolder'))

  // Caller is this file
  assert.deepEqual(expectation, testCaller.doLoad())
}

