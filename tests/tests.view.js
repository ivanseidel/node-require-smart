const path = require('path')
const chalk = require('chalk')
const assert = require('assert')

const RequireSmart = require('../')

module.exports = [
  testIfViewDoesntFails
]

// Check if view works
function testIfViewDoesntFails() {
  RequireSmart.view(__dirname + '/testFolder') 
}