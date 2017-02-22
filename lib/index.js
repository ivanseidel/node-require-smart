'use strict'

const view = require('./view')
const utils = require('./utils')
const loader = require('./loader')
const callPath = require('./callPath')

// Loader is the root action
var RequireSmart = loader.load

// Expose loader as well
RequireSmart.loader = loader

// Expose utils
RequireSmart.utils = utils

// Expose view
RequireSmart.view = view

// Expose caller
RequireSmart.callPath = callPath

// Expose API (root is load)
module.exports = RequireSmart