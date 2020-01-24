const compress = require('iltorb').compressSync
const fs = require('fs')
const terser = require("terser")

const src = fs.readFileSync('lightue.js').toString()

const minified = terser.minify(src).code

fs.writeFileSync('lightue.min.js', minified)
fs.writeFileSync('lightue.min.js.br', compress(Buffer.from(minified)))