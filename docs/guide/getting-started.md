# Getting Started

## How to use

Use the CDN file and there will be `Lightue` in the global scope

```html
<script src="https://unpkg.com/lightue@0.2.7/lightue.min.js"></script>
<script src="your_script.js"></script>
```

Or install it ( `yarn add lightue` ) and bundle it using either rollup or webpack

```js
import L from 'lightue' // ESM
// or
const L = require('lightue') // CJS
```

## Quick start

```js
// api

var S = Lightue.useState(stateSrc)  // create state using stateSrc
var vm = Lightue(VDomSrc [, options ])  // options is optional
Lightue.watchEffect(effect)  // setup an effect that reruns when state changed
```

```js
// example

// specify application state
var S = Lightue.useState({
  text: 'Hello world!',
})
// create Lightue instance
var vm = Lightue(
  {
    // for static content just specify statically
    hi: 'Hi world!',
    // for dynamic content that depends on state, use a state function (a function that uses state)
    hello: () => S.text,
  },
  {
    el: '#app', // append to <div id='app'></div>
  }
)
// change the state after 2 seconds and the DOM automatically get updated
setTimeout(function () {
  S.text = 'Hello again!'
}, 2000)
// pass a state function to watchEffect to save text into localStorage whenever it changes
Lightue.watchEffect(() => localStorage.setItem('text', S.text))
```

As you can see, to create a simple Lightue application, first you need to specify some application states using Lightue.useState(). Then create a Lightue instance using Lightue() function which receives a VDomSrc object as the first parameter (which works as a template).

At this time you'll be able to see the rendered result in browser. And when you change state, the rendered DOM will be updated. In the above example, we showed a single line text and changed it 2 seconds later.

In detail, the `Lightue` function will create the Lightue Node tree according to VDomSrc, generate corresponding DOM elements, and append the generated DOM tree to document's body or other places specified by `el` option.
