#! /usr/bin/env node

const program = require('commander')
const pkg = require('../package.json')

const sbuild = require('..')

const path = require('path')

program
  .version(pkg.version)
  .usage('[options] <file ...>')
  .arguments('<dir>')
  .option('-1, --one-file', 'create all-in-one "schema.sql"-file')
  .option('-s, --per-schema', 'create a schema.sql-file per "__init__.sql"-file ')
  .option('-i, --init-filename [name]', 'Name of init-file [__init__.sql]', '__init__.sql')
  .option('-f, --schema-filename [name]', 'Name of output-file [schemal.sql]', '__init__.sql')
  .option('-w, --write-file', 'create "schema.sql"-file, without that flag it writes to stdout')
  .parse(process.argv)

sbuild({
  rootPath: 'sample/' || path.basename(process.cwd()),
  oneFile: (program.oneFile),
  writeFiles: (program.writeFile)
}).then(function (res) {
  if (res) console.log(res)
  return
})
