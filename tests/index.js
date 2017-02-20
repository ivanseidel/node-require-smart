'use strict'

const chalk = require('chalk')

const tests = [
  ... require('./tests.utils'),
  ... require('./tests.load'),
]

// Run tests
var allTestsOk = true

console.log()
console.log(chalk.yellow('Testing slick-load'))
console.log()

tests.map( executeTest )

console.log()
console.log(chalk[allTestsOk ? 'yellow' : 'red']('Completed'))
console.log()

process.exit(allTestsOk ? 0 : 1)

// Execute a single test
function executeTest (test) {
  let retVal = true;
  
  try {
    retVal = test()
  } catch (e) {
    retVal = e.stack || e
  }

  if(retVal === true || retVal === undefined) {
    showTestSuccess(test.name)
  } else {
    showTestError(test.name, retVal)
    allTestsOk = false
  }
}

function showTestError(testName, retVal = '') {
  console.log(chalk.red(` ✕  ${testName}`))
    
  // Format lines in indentation
  const SPACER = '    '
  retVal = SPACER + retVal.toString().split('\n').join('\n' + SPACER)
  console.log(chalk.blue(retVal))
}

function showTestSuccess(testName) {
  console.log(chalk.green(` ✓  ${testName}`))
}