<script setup>
import packageJson from '../../package.json'
</script>

# Install

Use the CDN file and there will be `Lightue` in the global scope:

`<script src="https://unpkg.com/lightue@{{packageJson.version}}/dist/lightue.min.js"></script>`

Or install it ( `yarn add lightue` ) and bundle it using either rollup or webpack

```js
import L from 'lightue' // ESM
// or
const L = require('lightue') // CJS
```
