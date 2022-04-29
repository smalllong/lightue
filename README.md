# Lightue

A lightweight and simple model-view framework inspired by Vue.js

just around 1KB min+br (compared with vue.js 30.06 KiB)

## How to use:

```html
<script src='https://unpkg.com/lightue@0.2.1/lightue.min.js'></script>
<script src='your_script.js'></script>
```

Try the live example here: https://codepen.io/lxl898/pen/vYyooWK

## Compatability

Lightue supports all modern browsers except IE.
To get legacy browser support, you can choose version 0.1.2 which supports down to IE 10.

## Quick start

```js
// api
var S = Lightue.useState(stateSrc)  // create state using stateSrc
var vm = Lightue(VDomSrc [, options ])  // options is optional

// example
// specify application state
var S = Lightue.useState({
    text: 'Hello world!'
})
// create Lightue instance
var vm = Lightue({
    // for static content just specify statically
    hi: 'Hi world!',
    // for dynamic content that depends on state, use a state function (a function that uses state)
    hello: () => S.text
}, {
    el: '#app' // append to <div id='app'></div>
})
// change the state after 2 seconds and the DOM automatically get updated
setTimeout(function() {
    S.text = 'Hello again!'
}, 2000)
```
As you can see, to create a simple Lightue application, first you need to specify some application states using Lightue.useState(). Then create a Lightue instance using Lightue() function which receives a VDomSrc object as the first parameter (which works as a template).

At this time you'll be able to see the rendered result in browser. And when you change state, the rendered DOM will be updated. In the above example, we showed a single line text and changed it 2 seconds later.

In detail, the `Lightue` function will create the Lightue Node tree according to VDomSrc, generate corresponding DOM elements, and append the generated DOM tree to document's body or other places.

## Options

When calling a new Lightue, there can be an optional `options` object as a second parameter. Currently, there is only one option:
- el (string, optional)
    > When there is an `el` option, it specifies the mount point of the current Lightue. The value will be passed to `document.querySelector` then Lightue will append the generated DOM to this element. The default value is 'body'

## VDomSrc

The VDomSrc is a special structure used by Lightue to generate VDom(Lightue virtual DOM) and also generate real DOM nodes. It can have several different shapes:
- string | number
    > Render a simple div element with the string or number as content. You can see this as a shortcut to Object which only has `$$ (string | number)`
- Array
    > This will generate a wrapper element. Each item in the array is parsed as a VDomSrc and the results are appended in the wrapper one by one. You can see this as a shortcut to Object which only has `$$ (Array)`
- Object
    > This is the most crucial part of the VDomSrc structure. It will be rendered to a DOM element, and it has some special keys that are handled specially:
    - $class (object)
        > This specifies classes of the current element. The key is the class name, and the value is boolean indicating whether to add the class
    - $tag (string)
        > This is the tag name of the element, such as 'div', 'span', 'input'. When omitted, it is 'div' by default
    - $value
        > For input and textarea elements, `$value` will set their value property. Note this is different from setting `_value` which only sets the html attribute.
    - $$ (Array)
        > When there is a `$$` property and it's value is of type Array, each item in the array is parsed as a VDomSrc and the results are appended in current element one by one
    - $$ (Object)
        > When there is a `$$` property and it's value is of type Object, it will be treated as a VDomSrc and the result will append in current element
    - $$* (string | number)
        > When there is a property starts with `$$` and the value is of type `string | number` it will be rendered to a text node
    - $_*
        > When the property name starts with `$_`, it means to create a child element with a default `span` $tag. And the following * in the property name is used as the element class. The value is treated as a VDomSrc
    - _*
        > When a property starts with `_`, it's value will be assigned to the hyphenated version attribute. For example, `_dataSrc` property assigned to `data-src` attribute
    - on*
        > This is the event listener on the element. It can be a function that receive just event. It can also be an array whose first item is the listener function and following items are extra arguments passed to the listener
    - \* (not starts with `$`, `_` or `on`)
        > In other cases when property name does not starts with `$`, `_` or `on`, it will create a child element with a default `div` $tag. And the property name is used as the element class. The value is treated as a VDomSrc

## stateSrc

The stateSrc which passed into Lightue.useState is an object. The `useState` method will turn it into a reactive state. When you reassign a property of it, it will notify the relavant state function to rerender. Here's another example:
```js
var S = Lightue.useState({
    width: 20,
    height: 30
})
setInterval(function() {
    S.width ++
}, 500)
setInterval(function() {
    S.height ++
}, 800)
var vm = Lightue({
    $$: 'width and height are: ',
    result: () => S.width + ':' + S.height,
    rect: {
        _style: () => 'background-color: green; width: '+S.width+'px; height: '+S.height+'px',
    }
})
```

Nested states are supported, so this will work:
```js
var S = Lightue.useState({
    size: {
        width: 20,
        height: 30
    }
})
setInterval(function() {
    S.size.width ++
}, 500)
```

Arrays are also supported, so this will also work:
```js
var S = Lightue.useState({
    size: [20, 30]
})
setInterval(function() {
    S.size[0] ++
}, 500)
```

Try the live example here: https://codepen.io/lxl898/pen/vYyooWK and other demos in the demo folder.

That's it. Just modify the state and dependent places will automatically update itself in DOM.

## Tag shortcuts

Lightue comes with some html tag shortcut methods. For example:

```js
// instead of writing:
var L = Lightue
var vm = L({$tag: 'table',
    $$: [{$tag: 'tr',
        $$: [{$tag: 'td'}]
    }]
})
// it's simpler to write:
var L = Lightue
var vm = L(L.table({
    $$: [L.tr({
        $$: [L.td()]
    })]
}))
```

If you have any advices or concerns, you can leave an issue :-)
