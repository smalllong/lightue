const fs = require('fs')
const terser = require("terser")
const zlib = require('zlib')

const src = fs.readFileSync('lightue.js').toString()

const minified = terser.minify(src).code

fs.writeFileSync('lightue.min.js', minified)

zlib.brotliCompress(minified, (err, result) => {
    fs.writeFileSync('lightue.min.js.br', result)
})