const path = require('path')
const chalk = require('chalk')
const assert = require('assert')

const RequireSmart = require('../')

module.exports = [
  setPropertySucceeds,
  setPropertyWithoutMergeEnabled,
  testIfLoadsFilesFromFolder,
  testCustomOptions
]

function testCustomOptions() {
  const folder = path.join(__dirname, 'testFolder')

  // Load tree
  var loaded = RequireSmart(folder, { uppercaseTokens: null })

  // Expectation of result
  var expectation = {
    root: true,
    a: {
      index: true,
      mergingTest: true,
      success: 'success'
    },
    b: {
      bA: 1,
      bB: 2,
      bC: 3,
    },
    c: {
      cA: 1,
      cB: 2,
      cC: 3,
    },
    nested: {
      settings: {
        here: 'nested.settings.here'
      },
      object: {
        here: 'nested.object.here'
      }
    },
    'custom-name': {
      'weird_name': {
        test: true
      }
    },
    multipath: {
      'folder-name': true,
    }
  }

  assert.deepEqual(loaded, expectation)
}

// Check listing from directory
function testIfLoadsFilesFromFolder() {
  const folder = path.join(__dirname, 'testFolder')

  // Load tree
  var loaded = RequireSmart(folder)

  // Expectation of result
  var expectation = {
    root: true,
    a: {
      index: true,
      mergingTest: true,
      success: 'success'
    },
    b: {
      bA: 1,
      bB: 2,
      bC: 3,
    },
    c: {
      cA: 1,
      cB: 2,
      cC: 3,
    },
    nested: {
      settings: {
        here: 'nested.settings.here'
      },
      object: {
        here: 'nested.object.here'
      }
    },
    customName: {
      weirdName: {
        test: true
      }
    },
    multipath: {
      folderName: true,
    }
  }

  assert.deepEqual(loaded, expectation)
}

// Check listing from directory
function setPropertySucceeds() {
  var root = {}

  // Set root
  RequireSmart.loader.setProperty(root, [], {a: 1, b: 2, c: 3})

  // Set inner element
  RequireSmart.loader.setProperty(root, ['d'], 4)
  RequireSmart.loader.setProperty(root, ['e', 'inner'], 5)
  RequireSmart.loader.setProperty(root, ['f', 'inner', 'other'], 6)
  RequireSmart.loader.setProperty(root, ['f', 'inner', 'value'], 7)
  RequireSmart.loader.setProperty(root, ['g'], {other: 8})
  RequireSmart.loader.setProperty(root, ['g'], {value: 9})

  // Expectation of result
  var expectation = {
    a: 1,
    b: 2,
    c: 3,
    d: 4,
    e: {
      inner: 5,
    },
    f: {
      inner: {
        other: 6,
        value: 7,
      }
    },
    g: {
      other: 8,
      value: 9,
    }
  }

  // Check results
  assert.deepEqual(root, expectation)
}

// Check if it throws exception if cannot merge
function setPropertyWithoutMergeEnabled() {
  var root = {}
  var opts = {canMerge: false}
  var expectedError = /Cannot load into/

  // Set root should fail, because it needs to merge
  assert.throws( () => {
    RequireSmart.loader.setProperty(root, [], {a: 1, b: 2, c: 3}, opts)
  }, expectedError)

  // Sets properties (should pass)
  RequireSmart.loader.setProperty(root, ['a'], {d: true}, opts)

  // Set root should fail, because it's already set and needs to merge
  assert.throws( () => {
    RequireSmart.loader.setProperty(root, ['a'], {a: 1, b: 2, c: 3}, opts)
  }, /Cannot load into/)
}
