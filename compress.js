const fs = require('fs')
const terser = require("terser")

const src = fs.readFileSync('dist/iife.js').toString()

const minified = terser.minify(src).code

fs.writeFileSync('dist/lightue.min.js', minified)
