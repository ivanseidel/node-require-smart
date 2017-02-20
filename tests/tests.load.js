const path = require('path')
const chalk = require('chalk')
const assert = require('assert')

const SlickLoad = require('../')

module.exports = [
  setPropertySucceeds,
  setPropertyWithoutMergeEnabled,
  testIfLoadsFilesFromFolder,
]

// Check listing from directory
function testIfLoadsFilesFromFolder() {
  const folder = path.join(__dirname, 'testFolder')

  // Load tree
  let loaded = SlickLoad(folder)

  // Expectation of result
  let expectation = {
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
    }
  }

  assert.deepEqual(loaded, expectation)
}

// Check listing from directory
function setPropertySucceeds() {
  let root = {}

  // Set root
  SlickLoad.loader.setProperty(root, [], {a: 1, b: 2, c: 3})

  // Set inner element
  SlickLoad.loader.setProperty(root, ['d'], 4)
  SlickLoad.loader.setProperty(root, ['e', 'inner'], 5)
  SlickLoad.loader.setProperty(root, ['f', 'inner', 'other'], 6)
  SlickLoad.loader.setProperty(root, ['f', 'inner', 'value'], 7)
  SlickLoad.loader.setProperty(root, ['g'], {other: 8})
  SlickLoad.loader.setProperty(root, ['g'], {value: 9})

  // Expectation of result
  let expectation = {
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
  let root = {}
  let opts = {canMerge: false}
  let expectedError = /Cannot load into/

  // Set root should fail, because it needs to merge
  assert.throws( () => {
    SlickLoad.loader.setProperty(root, [], {a: 1, b: 2, c: 3}, opts)
  }, expectedError)

  // Sets properties (should pass)
  SlickLoad.loader.setProperty(root, ['a'], {d: true}, opts)

  // Set root should fail, because it's already set and needs to merge
  assert.throws( () => {
    SlickLoad.loader.setProperty(root, ['a'], {a: 1, b: 2, c: 3}, opts)
  }, /Cannot load into/)
}