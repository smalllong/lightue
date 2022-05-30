<script setup>
import packageJson from '../../../package.json'
</script>

# 安装

如下使用CDN文件，便会在全局有一个 `Lightue`：

`<script src="https://unpkg.com/lightue@{{packageJson.version}}/dist/lightue.min.js"></script>`

或者也可以使用 `yarn add lightue` 安装然后用rollup或webpack打包

```js
import L from 'lightue' // ESM
// or
const L = require('lightue') // CJS
```
