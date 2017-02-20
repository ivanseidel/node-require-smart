'use strict'

const view = require('./view')
const utils = require('./utils')
const loader = require('./loader')

// Loader is the root action
var SlickLoad = loader.load

// Expose loader as well
SlickLoad.loader = loader

// Expose utils
SlickLoad.utils = utils

// Expose view
SlickLoad.view = view

// Expose API (root is load)
module.exports = SlickLoad