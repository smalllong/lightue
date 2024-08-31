# Lightue

<a href="https://npmjs.com/package/lightue"><img src="https://img.shields.io/npm/v/lightue.svg" alt="npm-v"></a>
<a href="https://npmjs.com/package/lightue"><img src="https://img.shields.io/npm/dt/lightue.svg" alt="npm-d"></a>
<a href="https://deno.bundlejs.com/?q=lightue&config=%7B%22compression%22%3A%22brotli%22%7D"><img src="https://deno.bundlejs.com/?q=lightue&badge&config=%7B%22compression%22%3A%22brotli%22%7D" alt="brotli"></a>

A lightweight and simple web frontend model-view framework inspired by Vue.js

## Highlights

- Super lightweight (<2.5KB min+br)
- State driven automatic dom updates
- JS functional style template, great native editor support
- Flexible function style components
- Low overhead, easily setup and run

## Document has been moved to https://lightue.netlify.app/ or https://lightue.pages.dev/

If you have any advices or concerns, you can leave an issue :-)

## How to release a new version

- change to new version number in package.json
- `bun dist`
- commit the change (potentially together with other changes)
- `git tag -a ${new version number}`, add release description
- `npm publish`
