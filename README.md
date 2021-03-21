# lightue

A lightweight and simple model-view framework inspired by Vue.js

just 1.11KiB min+br (compared with vue.js 30.06 KiB)

## How to use:

```html
<script src='https://unpkg.com/lightue@0.0.1/lightue.min.js'></script>
<script src='your_script.js'></script>
```

## Quick start

```js
var vm = Lightue(VDomSrc)
```
This will create the Lightue Node instance and append the generated DOM to document's body. The returned vm is the View Model which we can use to control the generated DOM easily.

## VDomSrc

The VDomSrc is a special structure used by Lightue to generate VDom(Lightue virtual DOM) and also generate real DOM nodes. It can have several different shapes:
- string | number
    > Render a simple div element with the string or number as content. You can see this as a shortcut to Object which only has `$$ (string | number)`
- Array
    > This will generate a wrapper element. Each item in the array is parsed as a VDomSrc and the results are appended in the wrapper one by one. You can see this as a shortcut to Object which only has `$$ (Array)`
- Object
    > This is the most crucial part of the VDomSrc structure. It will be rendered to a DOM element, and it has some special keys that are handled specially:
    - $tag (string)
        > This is the tag name of the element, such as 'div', 'span', 'input'. When omitted, it is 'div' by default
    - $$ (Array)
        > When there is a `$$` property and it's value is of type Array, each item in the array is parsed as a VDomSrc and the results are appended in current element one by one.
    - $$* (string | number)
        > When there is a property starts with `$$` and the value is of type `string | number` it will be rendered to a text node
    - _*
        > When a property starts with `_`, it's a reactive mapping to the hyphenated version attribute. For example, `_dataSrc` property maps to `data-src` attribute.
    - on*
        > To be added

## View Model

After processed by Lightue, the VDomSrc becomes a View Model. Generally it has the same structure as VDomSrc but it added more things:
- string | number
    > If the original VDomSrc is string or number, in View Model it become reactive which means you can directly get and set it and the result is just like getting and setting using DOM API
- Array
    > It now has a reactive `push` method, so when you do push, new element will appear
- $value (string)
    > For input and textarea elements, there is a $value property which can be used to get/set value of them

It includes some special notations to simplify the code.