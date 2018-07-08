const fs = require('fs')
const path = require('path')

const utils = require('./utils')

exports.load = function (folder, opts) {
  opts = utils.normalizeOpts(opts || {})

  // Make sure we are dealing with the absolute path here
  folder = utils.absolutePathFor(folder)

  // Reads the tree
  var treeSpecs = exports.readTree(folder, opts)

  // Sort file specs so that 'top' ones come first
  treeSpecs = treeSpecs.sort(exports.specsSorter)

  // Create empty root
  var root = {}

  // Load modules and attach to root
  treeSpecs.map(spec => {
    var requirePath = path.join(spec.folder, spec.file)
    var nodes = spec.absNodes

    exports.setProperty(root, nodes, require(requirePath), opts)
  })

  return root
}

/*
 * List files and converts them into specs. 
 * Do this recursivelly into folders if depth has not yet been reached.
 * Will concatenate all specs from nested resources and return a single ~flat~ unsorted array of specs
 */
exports.readTree = function load(folder, opts, parent) {
  opts = opts || utils.normalizeOpts(opts)
  parent = parent || null

  // Initialize parent to root if not assigned
  var node = exports.fileToSpecs(null, folder, parent)

  // Get all files from the folder
  var files = utils.listFilesFromPath(folder, opts)

  // Parse each file's path
  var fileSpecs = files.map( file => exports.fileToSpecs(file, folder, node, opts))

  // Check if should load folders
  if (opts.depth === true || node.depth < opts.depth) {
    var folders = utils.listFoldersFromPath(folder, opts)

    // Iterate folders
    for (var k in folders) {
      // Join current folder with next lookup folder
      var nextFolder = path.join(folder, folders[k])

      // Load the folder tree
      var specs = exports.readTree(nextFolder, opts, node)

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
exports.fileToSpecs = function (file, folder, parent, opts) {
  // Increase depth using parent's depth
  var newDepth = parent ? parent.depth + 1 : 0
  
  // Parse node path in file or folder
  if (file !== null) {
    var relativeNodes = utils.pathNodesForFile(file, opts)
  } else if (parent !== null) {
    var relativeNodes = utils.pathNodesForFile(path.basename(folder), opts)
  } else {
    var relativeNodes = []
  }

  // Join with parent's nodes
  var absoluteNodes = (parent ? parent.absNodes : []).concat(relativeNodes)

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
  var currentRoot = root

  // Iterate nodes creating elements if needed
  while (nodes.length > 1) {
    var nextKey = nodes.shift()

    // Create element if needed
    if (! (nextKey in currentRoot)) {
      currentRoot[nextKey] = {}
    }

    // Set to currentRoot
    currentRoot = currentRoot[nextKey]
  }

  // Get last node key
  var nextKey = nodes.shift()

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

    // Only merge if it's an object
    if(typeof currentRoot === 'object')
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
exports.specsSorter = (specA, specB) => specA.absNodes.length - specB.absNodes.length
