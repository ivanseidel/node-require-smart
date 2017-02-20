const path = require('path')
const chalk = require('chalk')
const assert = require('assert')

const SlickLoad = require('../')

module.exports = [
  testIfViewDoesntFails
]

// Check if view works
function testIfViewDoesntFails() {
  SlickLoad.view(__dirname + '/testFolder') 
}