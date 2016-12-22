const fs = require('fs')
const path = require('path')
// import async from 'async'
const _ = require('lodash')
const globby = require('globby')
const chalk = require('chalk')
const v = require('voca')

module.exports = function (options) {
  const dir = (options.args[0] || '.')
  if (options.debug) log('dir', dir)

  function log (status, msg) {
    if (!options.quiet || options.verbose || options.debug) {
      status = status || ''
      msg = msg || ''

      // const toJson = (!!msg) && (msg.constructor === Object || msg.constructor === Array)
      const toJson = typeof msg !== 'string'
      msg = toJson ? '\n    ' + v.replaceAll(JSON.stringify(msg, null, '  '), '\n', '\n    ') + '\n' : msg

      if ((status + msg) === '') {
        console.log('')
      } else {
        if (v.includes(msg, '\n')) {
          console.log('/*')
          console.log('  ' + chalk.green(v.pad(status, 11)))
          console.log(msg)
          console.log('*/\n')
        } else {
          console.log('--' + chalk.green(v.pad(status, 11)) + msg)
        }
      }
    }
  }

  function assert (val, msg) {
    if (!val) throw new Error(msg)
  }

  function buildOne (p, f, r) {
    f = path.join(p, f)
    p = path.dirname(f)

    assert(fs.existsSync(f), 'File not found! ' + f)
    if (options.verbose) log((r ? '+++++' : 'entry'), f)

    var data = fs.readFileSync(f, 'utf8')
    var lines = data.trim().split('\n')

    for (var i = 0; i < lines.length; i++) {
      if (_.startsWith(lines[i], '\\ir')) {
        var incFile = path.join(p, lines[i].substr(4))

        assert(fs.existsSync(incFile), incFile + ' File not found from ' + f)

        if (fs.statSync(incFile).isDirectory()) {
          incFile = path.join(incFile, options.initFilename)
          assert(fs.existsSync(incFile), incFile + ' File not found from ' + f)
        }

        lines[i] = buildOne(path.dirname(incFile), path.basename(incFile), true)
      } else {
        if (!options.writeFile) console.log(lines[i])
      }
    }

    const res = lines.join('\n')

    if ((!r || (options.recursive && path.basename(f) === options.initFilename)) && options.writeFile) {
      const outFile = path.join(p, options.schemaFilename)
      fs.writeFileSync(outFile, res + '\n', 'utf8')
      if (!options.quiet) {
        log('write', outFile)
        if (options.verbose) log()
      }
    }

    return res
  }

  if (options.debug) log('options', options)

  const pattern = []

  // if (options.oneFile) {
  //   pattern.push(options.initFilename)
  // } else {
  //   pattern.push('**/' + options.initFilename)
  //   pattern.push('!./' + options.initFilename)
  // }

  pattern.push(options.initFilename)
  if (options.debug) log('pattern', pattern)

  return globby(pattern, {cwd: dir}).then(function (files) {
    if (options.debug) log('entry file(s)', files)

    log()

    const c = files.reduce(function (content, file) {
      const nextContent = buildOne(dir, file)

      return options.writeFile ? '' : content + nextContent
    }, '')

    if (!options.verbose) log()

    return c
  })
}
