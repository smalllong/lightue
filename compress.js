const fs = require('fs')
const terser = require("terser")

const src = fs.readFileSync('iife.js').toString()

const minified = terser.minify(src).code

fs.writeFileSync('lightue.min.js', minified)
