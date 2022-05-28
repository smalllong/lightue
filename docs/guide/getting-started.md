# Getting Started

## Core API
```js
var S = Lightue.useState(stateSrc)  // create state using stateSrc
var vm = Lightue(VDomSrc [, options ])  // options is optional
```

## Live example
<iframe height="480" style="width: 100%;" scrolling="no" title="Getting Started" src="https://codepen.io/lxl898/embed/gOvvOPy?default-tab=js%2Cresult&editable=true" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/lxl898/pen/gOvvOPy">
  Getting Started</a> by lxl (<a href="https://codepen.io/lxl898">@lxl898</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

As you can see, to create a simple Lightue application, first you need to specify some application states using [Lightue.useState()](../api/global#usestate-statesrc). Then create a Lightue instance using [Lightue()](../api/global) function which receives a [VDomSrc](../api/template) object as the first parameter (which works as a template).

At this time you'll be able to see the rendered result in browser. And when you change state, the rendered DOM will be updated. In the above example, we showed a single line text and changed it 2 seconds later.

In detail, the [Lightue](../api/global) function will create the Lightue Node tree according to [VDomSrc](../api/template), generate corresponding DOM elements, and append the generated DOM tree to document's body or other places specified by [el](../api/global#options) option.
