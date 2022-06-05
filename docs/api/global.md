# Global methods

## Lightue(VDomSrc [, options ])

The `Lightue` itself is a function accepts [VDomSrc](./template) and options. When being called, it will parse the VDomSrc and create the Lightue Node tree according to VDomSrc, generate corresponding DOM elements, and append the generated DOM tree to document's body or other places specified by `el` option.

### options

When calling a new Lightue, there can be an optional `options` object as a second parameter. Currently, there is only one option:

- el (string, optional)
  > When there is an `el` option, it specifies the mount point of the current Lightue. The value will be passed to `document.querySelector` then Lightue will append the generated DOM to this element. The default value is 'body'

## useState(stateSrc)

The stateSrc which passed into Lightue.useState is an object. The `useState` method will turn it into a reactive state. When you reassign a property of it, it will notify the relavant state function to rerender. Here's an example:

```js
var S = Lightue.useState({
  width: 20,
  height: 30,
})
setInterval(function () {
  S.width++
}, 500)
setInterval(function () {
  S.height++
}, 800)
var vm = Lightue({
  $$: 'width and height are: ',
  result: () => S.width + ':' + S.height,
  rect: {
    _style: () => 'background-color: green; width: ' + S.width + 'px; height: ' + S.height + 'px',
  },
})
```

Nested states are supported, so this will work:

```js
var S = Lightue.useState({
  size: {
    width: 20,
    height: 30,
  },
})
setInterval(function () {
  S.size.width++
}, 500)
```

Arrays are also supported, so this will also work:

```js
var S = Lightue.useState({
  size: [20, 30],
})
setInterval(function () {
  S.size[0]++
}, 500)
```

Try the live example here: https://codepen.io/lxl898/pen/vYyooWK and other demos in the demo folder.

That's it. Just modify the state and dependent places will automatically update itself in DOM.

## watchEffect(effect)

The effect is a state function. When calling watchEffect, the effect will be executed immediately. Later when one of the states that used by effect changes, the effect will run again automatically. You can think of these states are being watched for rerunning the effect.

## Tag & class shortcuts

Lightue comes with some html tag and class shortcut methods. These methods take in a VDomSrc, transform it and return a new VDomSrc with modified $tag and $class.

For example:

```js
// instead of writing:
var L = Lightue
var vm = L({
  myList: {
    $tag: 'ul',
    $$: [
      {
        $tag: 'li',
        $class: { listRow: 1 },
        $$: {
          $tag: 'label',
          $class: { listLabel: 1 },
          $$: 'hello',
        },
      },
    ],
  },
})
// it's simpler to write:
var { ul, li, label } = (L = Lightue)
var vm = L({
  myList: ul([
    li.listRow({
      $$: label.listLabel('hello'),
    }),
  ]),
})
```