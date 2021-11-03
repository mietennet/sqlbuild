#! /usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const chokidar = require('chokidar')
const shell = require('shelljs')

const pkg = require('../package.json')
const sqlbuild = require('..')

program
  .version(pkg.version)
  .usage('[options] <dir>')
  // .arguments('<dir>')
  .option('-v, --verbose', 'prints all filenames', false)
  .option('-q, --quiet', 'prints no filenames', false)
  .option('-d, --debug', 'prints debug info', false)
  .option('-t, --timing', 'prints times taken per log line', false)
  //  .option('-1, --one-file', 'create all-in-one "schema.sql"-file', false)
  .option(
    '-r, --recursive',
    'create a schema.sql-file per "init.sql"-file in sub-dirs',
    false
  )
  .option(
    '-i, --init-filename [name]',
    'Name of init-file [init.sql]',
    'init.sql'
  )
  .option(
    '-o, --schema-filename [name]',
    'Name of output-file [schema.sql]',
    'schema.sql'
  )
  .option(
    '-w, --write-file',
    'create "schema.sql"-file, without that flag it writes to stdout',
    false
  )
  .option('-W, --watch', 'watch for changes', false)
  .option('-E, --exec [cmd]', 'excute command', false)
  .option('-e  --exec-mode', 'errors while execute are ok', false)
  .option('-m, --exec-msg [msg]', 'print message when -E returns with 0', '')
  .parse(process.argv)

function run(changedFile) {
  sqlbuild(program, changedFile)
    .then(function() {
      if (program.exec) {
        const start = new Date()
        if (shell.exec(program.exec).code !== 0) {
          if (!program.execMode) {
            console.error(chalk.bold.red('Error: execute failed'))
            shell.exit(1)
          }
        } else {
          if (program.execMsg) {
            const timeMsg = program.timing
              ? chalk.grey(` (${new Date() - start} ms)`)
              : ''
            console.log(
              '--' + chalk.green('  success  ') + program.execMsg + timeMsg
            )
          }
        }
      }

      return
    })
    .catch(function(e) {
      console.error(chalk.bold.red(e.message))
    })
}

run()

if (program.watch) {
  const ignoredFiles = new RegExp(
    [
      'node_modules',
      '.git',
      program.schemaFilename ? program.schemaFilename : undefined
    ]
      .filter(function(e) {
        return e !== undefined
      })
      .join('|'),
    'i'
  )

  const watcher = chokidar.watch('**/*.sql', {
    ignored: ignoredFiles,
    persistent: true
  })

  watcher.on('change', run)
}
