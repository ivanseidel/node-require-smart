const RequireSmart = require('../../')

exports.doLoad = function() {
    return RequireSmart('../testFolder')
}

exports.callPath = function() {
  return RequireSmart.callPath()
}