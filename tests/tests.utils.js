const path = require('path')
const chalk = require('chalk')
const assert = require('assert')

const SlickLoad = require('../')

module.exports = [
  fileName,
  sanitizeName,
  pathNodesForFile,
  listFilesFromPath,
  listFoldersFromPath,
]


// Test if conversion of path to array is correct
function pathNodesForFile() {
  var tests = {
    '': [],
    'index.js': [],
    'some.path.js': ['some', 'path'],
    '1.3.spaces   between.1.some_text': ['1', '3', 'spacesBetween', '1', 'someText'],
    'some.really.long.path.here.that.might.cause.problem': 
      ['some','really','long','path','here','that','might','cause','problem'],
  }

  // Test each case
  for (var input in tests) {
    var expectedOutput = tests[input]

    var pathNodes = SlickLoad.utils.pathNodesForFile(input)

    assert.deepEqual(expectedOutput, pathNodes)
  }
}

// Check listing files from directory
function listFilesFromPath() {
  const folder = path.join(__dirname, 'testFolder')

  var files = SlickLoad.utils.listFilesFromPath(folder)

  // Expected files
  var expected = [
    'a.js',
    'b.js',
    'c.json',
    'b.bC.js',
    'index.js',
    'nested.object.here.js',
    'custom-name.weird_name.test.js',
  ]
  
  assert.deepEqual(files.sort(), expected.sort())
}

// Check listing folders from directory
function listFoldersFromPath() {
  const folder = path.join(__dirname, 'testFolder')

  var folders = SlickLoad.utils.listFoldersFromPath(folder)

  // Expected files
  var expected = ['a', 'nested']
  
  assert.deepEqual(folders.sort(), expected.sort())
}

// Check if sanitization is ok
function sanitizeName() {
  var tests = {
    'some-name.js': 'someName.js',
    'some_other-name weird.js': 'someOtherNameWeird.js',
    'some.untrimmed    string.js': 'some.untrimmedString.js',
    'some-strange-name.other_strange_name.js': 'someStrangeName.otherStrangeName.js',
  }

  // Test each case
  for (var input in tests) {
    var expectedOutput = tests[input]

    var sanitized = SlickLoad.utils.sanitizeName(input)

    // Compare outputs
    assert(expectedOutput, sanitized)
  }
}

// Check if sanitization is ok
function fileName() {
  var tests = {
    'js': 'js',
    'somefile.js': 'somefile',
    'somefile.json': 'somefile',
    'somefile.json.js': 'somefile.json',
    'somefile.something': 'somefile.something',
    'somefile.something': 'somefile.something',
  }

  // Test each case
  for (var input in tests) {
    var expectedOutput = tests[input]

    var fileName = SlickLoad.utils.fileName(input)

    // Compare outputs
    assert(expectedOutput, fileName)
  }
}