const compress = require('iltorb').compressSync
const fs = require('fs')
const minify = require("babel-minify")

const minified = minify(fs.readFileSync('lightue.js'), {
  removeConsole: true,
}).code

fs.writeFileSync('lightue.min.js', minified)

fs.writeFileSync('lightue.min.js.br', compress(Buffer.from(minified)))