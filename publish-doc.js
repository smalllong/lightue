import fs from 'fs'
import packageJson from './package.json' assert {type: 'json'}

const install = fs.readFileSync('docs/guide/install.md', { encoding: 'utf-8' })
const installZh = fs.readFileSync('docs/zh/guide/install.md', { encoding: 'utf-8' })

fs.writeFileSync('docs/guide/install.md', install.replace('{{version}}', packageJson.version))
fs.writeFileSync('docs/zh/guide/install.md', installZh.replace('{{version}}', packageJson.version))
