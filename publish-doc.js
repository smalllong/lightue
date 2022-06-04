var packageJson = require('./package.json'),
  fs = require('fs'),
  install = fs.readFileSync('docs/guide/install.md', { encoding: 'utf-8' }),
  installZh = fs.readFileSync('docs/zh/guide/install.md', { encoding: 'utf-8' })

fs.writeFileSync('docs/guide/install.md', install.replace('{{version}}', packageJson.version))
fs.writeFileSync('docs/zh/guide/install.md', installZh.replace('{{version}}', packageJson.version))
