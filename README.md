# Lightue

A lightweight and simple model-view framework inspired by Vue.js

just 1.23KiB min+br (compared with vue.js 30.06 KiB)

## How to use:

```html
<script src='https://unpkg.com/lightue@0.1.2/lightue.min.js'></script>
<script src='your_script.js'></script>
```

Try the live example here: https://codepen.io/lxl898/pen/vYyooWK

## Compatability

Lightue supports all browsers down to IE10 because it is written in ES5 and it uses `classList` feature which IE9 doesn't support.

## Quick start

```js
// api
var vm = Lightue(VDomSrc [, options ])

// example
var vm = Lightue({
    hello: 'Hello world!'
}, {
    el: '#app'
})
setTimeout(function() {
    vm.hello = 'Hello again!'
}, 2000)
```
The `Lightue` function will create the Lightue Node instance and append the generated DOM to document's body or other places. The returned vm is the View Model which we can use to control the generated DOM easily. In the above example, we showed a single line text and changed it 2 seconds later.

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
    - $$ (Array)
        > When there is a `$$` property and it's value is of type Array, each item in the array is parsed as a VDomSrc and the results are appended in current element one by one
    - $$ (Object)
        > When there is a `$$` property and it's value is of type Object, it will be treated as a VDomSrc and the result will append in current element
    - $$* (string | number)
        > When there is a property starts with `$$` and the value is of type `string | number` it will be rendered to a text node
    - $_*
        > When the property name starts with `$_`, it means to create a child element with a default `span` $tag. And the following * in the property name is used as the element class. The value is treated as a VDomSrc
    - _*
        > When a property starts with `_`, it's a reactive mapping to the hyphenated version attribute. For example, `_dataSrc` property maps to `data-src` attribute
    - on*
        > This is the event listener on the element. It can be a function that receive just event. It can also be an array whose first item is the listener function and following items are extra arguments passed to the listener
    - \* (not starts with `$`, `_` or `on`)
        > In other cases when property name does not starts with `$`, `_` or `on`, it will create a child element with a default `div` $tag. And the property name is used as the element class. The value is treated as a VDomSrc

## View Model

After processed by Lightue, the VDomSrc becomes a View Model (still the same reference). Generally it has the same structure as VDomSrc but it added more things:
- string | number
    > If the original VDomSrc is string or number, in View Model it become reactive which means you can directly get and set it and the result is just like getting and setting using DOM API
- Array
    > It now has a reactive `push` method, so when you do push, new element will appear
- $value (string)
    > For input and textarea elements, there is a $value property which can be used to get/set value of them

## State and Auto Update

It can be annoying to always modifying the View Model by hand. Thus like in Vue and React, Lightue provides States, which can result in automatic updates of depedent DOM places. Here's how to use it:

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
    get result() {return S.width + ':' + S.height},
    rect: {
        get _style() {return 'background-color: green; width: '+S.width+'px; height: '+S.height+'px'},
    }
})
```
When using state in the VDomSrc, instead of using an ES5 getter, you can also just set it's value as a function which will be used as the getter. If you're in ES6 environment, arrow functions are also valid. The above example can be written as:
```js
var vm = Lightue({
    $$: 'width and height are: ',
    result: () => S.width + ':' + S.height,
    rect: {
        _style: () => 'background-color: green; width: '+S.width+'px; height: '+S.height+'px',
    }
})
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
