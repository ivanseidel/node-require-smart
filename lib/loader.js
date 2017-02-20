'use strict'

const fs = require('fs')
const path = require('path')

const utils = require('./utils')

exports.load = function (folder, opts) {
  // Reads the tree
  let treeSpecs = exports.readTree(folder, opts)

  // Sort file specs so that 'top' ones come first
  treeSpecs = treeSpecs.sort(exports.specsSorter)

  // Create empty root
  let root = {}

  // Load modules and attach to root
  treeSpecs.map(spec => {
    let requirePath = path.join(spec.folder, spec.file)
    let nodes = spec.absNodes

    exports.setProperty(root, nodes, require(requirePath), opts)
  })

  return root
}

/*
 * List files and converts them into specs. 
 * Do this recursivelly into folders if depth has not yet been reached.
 * Will concatenate all specs from nested resources and return a single ~flat~ unsorted array of specs
 */
exports.readTree = function load(folder, opts, parent = null) {
  opts = opts || utils.normalizeOpts(opts)

  // Initialize parent to root if not assigned
  let node = exports.fileToSpecs(null, folder, parent)

  // Get all files from the folder
  let files = utils.listFilesFromPath(folder, opts)

  // Parse each file's path
  let fileSpecs = files.map( file => exports.fileToSpecs(file, folder, node) )

  // Check if should load folders
  if (opts.depth === true || node.depth < opts.depth) {
    let folders = utils.listFoldersFromPath(folder, opts)

    // Iterate folders
    for (let k in folders) {
      // Join current folder with next lookup folder
      let nextFolder = path.join(folder, folders[k])

      // Load the folder tree
      let specs = exports.readTree(nextFolder, opts, node)

      // Join specs together
      fileSpecs = fileSpecs.concat(specs)
    }
  }

  return fileSpecs
}

/*
 * Returns a sort of "snapshot" of the object key and properties like folder, and file name.
 * Also keep track of the current depth
 */
exports.fileToSpecs = function (file, folder, parent) {
  // Increase depth using parent's depth
  let newDepth = parent ? parent.depth + 1 : 0
  
  // Parse node path in file or folder
  if (file !== null) {
    var relativeNodes = utils.pathNodesForFile(file)
  } else if (parent !== null) {
    var relativeNodes = [path.basename(folder)]
  } else {
    relativeNodes = []
  }

  // Join with parent's nodes
  let absoluteNodes = (parent ? parent.absNodes : []).concat(relativeNodes)

  return {
    depth: newDepth,
    file: file,
    folder: folder,
    absNodes: absoluteNodes,
    relNodes: relativeNodes,
  }
}

/*
 * Given an object, an array of nodes, and it's value:
 * traverse the object creating keys if needed, and setting the content to it's value.
 * if value is already set, will merge properties to it
 */
exports.setProperty = function (root, nodes, value, opts) {
  opts = opts || utils.normalizeOpts(opts)

  // Don't messup with nodes
  nodes = nodes.slice()

  // Start current node to root
  let currentRoot = root

  // Iterate nodes creating elements if needed
  while (nodes.length > 1) {
    let nextKey = nodes.shift()

    // Create element if needed
    if (! (nextKey in currentRoot)) {
      currentRoot[nextKey] = {}
    }

    // Set to currentRoot
    currentRoot = currentRoot[nextKey]
  }

  // Get last node key
  let nextKey = nodes.shift()

  if (nextKey === undefined || nextKey in currentRoot) {
    // Something is already in place, merge if allowed. Otherwise, throw new exception
    if (!opts.canMerge) {
      nextKey = nextKey || 'root'
      throw `Cannot load into '${nextKey}' property, because it's already set.` +
            `Override by setting 'canMerge' to true`
    }

    // Select root if nextKey is undefined, or the key if it's not
    // If nextKey is undefined, it means it is setting the root
    currentRoot = (nextKey === undefined ? currentRoot : currentRoot[nextKey])

    Object.assign(currentRoot, value);
  } else {
    // It's fine. Set it's key
    currentRoot[nextKey] = value
  }
}

/*
 * A really important step to make sure things get required in the best order
 * (root elements first)
 */
exports.specsSorter = function (specA, specB) {
  return specA.absNodes.length - specB.absNodes.length
}