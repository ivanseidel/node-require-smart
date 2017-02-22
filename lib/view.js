'use strict'

const fs = require('fs')
const path = require('path')

const utils = require('./utils')
const loader = require('./loader')

const nothing = str => str;

var painter = {
  dim: nothing,
  red: nothing,
  blue: nothing,
  cyan: nothing,
  green: nothing,
  white: nothing,
  yellow: nothing,
  magenta: nothing,
}

// If chalk is available, then use it
try { painter = require('chalk') } catch (e) {}

/*
 * This will print a clear vision of what's going to be included where
 */
module.exports = function (folder, opts) {
  // Make sure we are dealing with the absolute path here
  folder = utils.absolutePathFor(folder)

  // Get current folder name
  var folderBase = path.basename(folder)

  // A few helping variables
  const POINTER = painter.white('.')

  // Logs header
  var header = pad(` Loading tree for '${folderBase}' as root `, 80, '=', true, true)
  console.log()
  console.log(painter.blue(header))
  console.log()
    

  // Reads the tree
  var treeSpecs = loader.readTree(folder, opts)

  // Sort file specs so that 'top' ones come first
  treeSpecs = treeSpecs.sort(loader.specsSorter)

  // Keep track of all loaded trees
  var loadedTree = []

  // Load modules and attach to root
  treeSpecs.map(spec => {
    var absNodes = spec.absNodes
    var filePath = path.relative(folder, spec.folder)
    var folderPath = spec.file 

    // Check if it will be merged (if already exists, or, its root)
    var absNodesStr = absNodes.join('/')
    var willMerge = loadedTree.indexOf(absNodesStr) >= 0 || (absNodesStr == '')
    loadedTree.push(absNodesStr)

    // Log information
    var info = ''

    info += painter.dim(' ▪ ')

    // Will it merge?
    info += (willMerge ? painter.blue('[WILL MERGE]') : painter.cyan('[ WILL SET ]'))

    // Compile object path
    info += ' ' + painter.dim(painter.red('root'))
    info += absNodes.length > 0 ? painter.dim(POINTER) : ''
    info += painter.dim(painter.cyan(absNodes.slice(0, -1).join(POINTER)))

    // Compile last path (if existent)
    var lastNode = absNodes.slice(-1)[0]
    if (lastNode) {
      info += (absNodes.length > 1 ? POINTER : '') + painter.yellow(lastNode)
    }

    // Pad with spaces
    absNodesStr = absNodesStr || 'root'

    // Final line string
    info += ' with:'

    // Present path
    info += painter.dim('\n                require( ' + painter.dim('\''))

    // info += painter.dim('-> ')
    info += painter.cyan(filePath ? filePath + '/' : '') + painter.yellow(spec.file)
    info += painter.dim('\'') + painter.dim( ' )' )
    console.log(info)
    console.log()
  })

  // Logs footer
  var footer = pad('', header.length, '=', true)
  console.log(painter.blue(footer))
  console.log()
}

// Right or/and Left pad string with wanted char
function pad(string, len, fill, right, left) {
  string = string || ''
  fill = fill || ' '
  right = right === undefined ? true : right
  left = left === undefined ? false : left

  // Avoid infinite loop
  if (!right && !left)
    right = true;

  // Make sure at least one char is in place
  fill = (fill.length <= 0 ? ' ' : fill)

  while (string.length < len) {
    string = (left ? fill : '') + string + (right ? fill : '')
  }

  return string
}