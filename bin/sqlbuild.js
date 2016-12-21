#! /usr/bin/env node

const program = require('commander')
const chalk = require('chalk')

const pkg = require('../package.json')
const sqlbuild = require('..')

program
  .version(pkg.version)
  .usage('[options] <dir>')
  // .arguments('<dir>')
  .option('-v, --verbose', 'prints all filenames', false)
  .option('-q, --quiet', 'prints no filenames', false)
  .option('-d, --debug', 'prints debug info', false)

  //  .option('-1, --one-file', 'create all-in-one "schema.sql"-file', false)
  .option('-r, --recursive', 'create a schema.sql-file per "init.sql"-file in sub-dirs', false)

  .option('-i, --init-filename [name]', 'Name of init-file [init.sql]', 'init.sql')
  .option('-f, --schema-filename [name]', 'Name of output-file [schema.sql]', 'schema.sql')

  .option('-w, --write-file', 'create "schema.sql"-file, without that flag it writes to stdout', false)

  .parse(process.argv)

sqlbuild(program).then(function () {
  return
}).catch(function (e) {
  console.error(chalk.bold.red(e.message))
})
