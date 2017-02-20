const fs = require('fs')
const path = require('path')


/*
 * Normalize options and set defaults to it.
 * Opts available:
 *   .canMerge [Boolean]: 
 *    True if can merge objects together
 *    False if is not allowed. 
 *    Keep in mind that: Depending on your code, 
 *    you might need to have access to the root thing
 *
 *   .depth [Boolean|Number]: 
 *    True if lookup folders recursivelly
 *    False if not lookup folders
 *    Number, to specify number of depth lookups
 *
 *   .fileNameParsing [Boolean]:
 *    True will parse file name as an path
 *    (some.file.js will set obj['some']['file'] to it's exports)
 *
 *   .fileNameSeparator [String]:
 *    Set to te separator in the file name. Default is to '.'
 *    For instance, set to '_' if your file names are like 'some_file.js'
 *
 *   .uppercaseTokens [Regex]:
 *    Set to the regex to match uppercase starting words, like:
 *    'some-crazy_name here.js' will be converted to 'someCrazyNameHere'
 */
exports.normalizeOpts = function (_opts) {
  var opts = Object.assign({
    depth: true,
    canMerge: true,
    indexNames: ['index'],
    extensions: ['.js', '.json'],
    fileNameParsing: true,
    fileNameSeparator: '.',
    uppercaseTokens: /[_\s-]\w/g
  }, _opts)

  return opts
}

/*
 * Returns the list of folders from the specified folder path
 */
exports.listFoldersFromPath = function (folderPath, opts) {
  opts = opts || exports.normalizeOpts(opts)

  var folders = fs.readdirSync(folderPath)

  // Filter out files that don't match extensions
  folders = folders.filter( (folder) => {
    // Check if is directory
    var isDirectory = fs.statSync(path.join(folderPath, folder)).isDirectory()

    return isDirectory
  })

  return folders
}

/*
 * List files from the specified folder path with the pattern
 */
exports.listFilesFromPath = function (folderPath, opts) {
  opts = opts || exports.normalizeOpts(opts)

  var files = fs.readdirSync(folderPath)

  // Filter out files that don't match extensions
  files = files.filter( (file) => {
    var extension = path.extname(file)

    // Check if is a file
    var isFile = fs.statSync(path.join(folderPath, file)).isFile()

    // Check if one of the extensions
    var isValidExtension = opts.extensions.indexOf(extension) >= 0

    // Return if it's valid
    return isFile && isValidExtension
  })

  return files
}

/*
 * Sanitizes a filename to be used to map to properties. Removes the extension from the file as well
 */
exports.sanitizeName = function (name, opts) {
  opts = opts || exports.normalizeOpts(opts)

  // Trim, remove multiple spaces and then replace with uppercase
  name = name.trim()
  name = name.replace(/\s(\s)+/g,' ');
  name = name.replace(opts.uppercaseTokens, function (str) {
    return str.slice(-1).toUpperCase()
  })

  return name
}

/*
 * Returns the filename without it's extension
 */
exports.fileName = function (fileName, opts) {
  opts = opts || exports.normalizeOpts(opts)
  
  var extension = path.extname(fileName)

  // Check if its really a extension (in extensions list)
  if (opts.extensions.indexOf(extension) < 0)
    // If not, return as it is
    return fileName

  // Remove extension and return
  fileName = path.basename(fileName, extension)

  return fileName
}

/*
 * Given a fileName, returns the 'path' to it's place, in Array form
 * Examples:
 *   'some.property.funny'                -> ['some', 'property', 'funny']
 *   'some-other-property.final thing.js' -> ['someOtherProperty', 'finalThing']
 */
exports.pathNodesForFile = function (fileName, opts) {
  opts = opts || exports.normalizeOpts(opts)

  fileName = fileName || ''

  fileName = exports.fileName(fileName)
  fileName = exports.sanitizeName(fileName)
  pathNodes = fileName.split(opts.fileNameSeparator)

  // Filter out empty path names
  pathNodes = pathNodes.filter( name => {
    return !!name
  })

  // Check if it's a index file (supposed to attach at root), return no relative nodes for it
  if (pathNodes.length == 1 && opts.indexNames.indexOf(pathNodes[0]) >= 0) {
    return []
  }

  return pathNodes
}