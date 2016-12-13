const fs = require('fs')
const path = require('path')
// import async from 'async'
const _ = require('lodash')
const globby = require('globby')

module.exports = function (options) {
  // let logger = Logger({logLevel: logLevel || LogLevels.info})

  function buildOne (p, f, r) {
    f = path.join(p, f)
    p = path.dirname(f)

    var data = fs.readFileSync(f, 'utf8')
    var lines = data.split('\n')

    for (var i = 0; i < lines.length; i++) {
      if (_.startsWith(lines[i], '\\ir')) {
        var incFile = path.join(p, lines[i].substr(4))

        lines[i] = buildOne(path.dirname(incFile), path.basename(incFile), true)
      }
    }

    const res = lines.join('\n')

    if (!r && options.writeFiles) fs.writeFileSync(path.join(p, 'schema1.sql'), res, 'utf8')

    return res
  }

  const pattern = []

  if (options.oneFile) {
    pattern.push('__init__.sql')
  } else {
    pattern.push('**/__init__.sql')
    pattern.push('!__init__.sql')
  }

  return globby(pattern, {cwd: options.rootPath}).then(function (files) {
    const c = files.reduce(function (content, file) {
      return options.writeFiles ? '' : content + buildOne(options.rootPath, file)
    }, '')

    return c
  })
}
