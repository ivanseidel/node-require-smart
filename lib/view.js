'use strict'

const fs = require('fs')
const path = require('path')

const utils = require('./utils')
const loader = require('./loader')

const nothing = str => str;

var painter = {
  dim: nothing,
  red: nothing,
  white: nothing,
  blue: nothing,
  green: nothing,
  yellow: nothing,
  magenta: nothing,
}

// If chalk is available, then use it
try { painter = require('chalk') } catch (e) {}

/*
 * This will print a clear vision of what's going to be included where
 */
module.exports = function (folder, opts) {
  let folderBase = path.basename(folder)

  // A few helping variables
  const POINTER = painter.white('.')

  // Logs header
  let header = pad(` Loading tree for '${folderBase}' as root `, 90, '=', true, true)
  let footer = pad('', header.length, '=', true)
  console.log(painter.blue(footer))
  console.log(painter.blue(header))
  console.log(painter.blue(footer))
  console.log()
    

  // Reads the tree
  let treeSpecs = loader.readTree(folder, opts)

  // Sort file specs so that 'top' ones come first
  treeSpecs = treeSpecs.sort(loader.specsSorter)

  // Keep track of all loaded trees
  let loadedTree = []

  // Load modules and attach to root
  treeSpecs.map(spec => {
    let absNodes = spec.absNodes
    let filePath = path.relative(folder, spec.folder)
    let folderPath = spec.file 

    // Check if it will be merged (if already exists, or, its root)
    let absNodesStr = absNodes.join('/')
    let willMerge = loadedTree.indexOf(absNodesStr) >= 0 || (absNodesStr == '')
    loadedTree.push(absNodesStr)

    // Log information
    let info = ''

    info += painter.dim(' ▪ ')
    // Will it merge?
    info += (willMerge ? painter.blue('[ MERGE ]') : painter.cyan('[  SET  ]'))
    // Compile object path
    info += ' ' + painter.cyan(absNodes.slice(0, -1).join(POINTER))
    // Compile last path (if existent)
    let lastNode = absNodes.slice(-1)[0]
    if (lastNode) {
      info += (absNodes.length > 1 ? POINTER : '') + painter.yellow(lastNode)
    } else {
      info += painter.red('root')
    }

    // Pad with spaces
    absNodesStr = absNodesStr || 'root'
    // info = info + pad('', 40 - absNodesStr.length, ' ')

    // Present path
    info += painter.dim('\n             require( ' + painter.dim('\''))
    // info += painter.dim('-> ')
    info += painter.cyan(filePath ? filePath + '/' : '') + painter.yellow(spec.file)
    info += painter.dim('\'') + painter.dim( ' )' )
    console.log(info)
    console.log()
  })

  // Logs footer
  console.log()
  console.log(painter.blue(footer))
  console.log()
}

// Right or/and Left pad string with wanted char
function pad(string, len, fill = ' ', right = true, left = false) {
  string = string || ''

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