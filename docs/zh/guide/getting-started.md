# 开始上手

## 核心 API
```js
var S = Lightue.useState(stateSrc)  // create state using stateSrc
var vm = Lightue(VDomSrc [, options ])  // options is optional
```

## 在线示例
<iframe height="480" style="width: 100%;" scrolling="no" title="Getting Started" src="https://codepen.io/lxl898/embed/gOvvOPy?default-tab=js%2Cresult&editable=true" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/lxl898/pen/gOvvOPy">
  Getting Started</a> by lxl (<a href="https://codepen.io/lxl898">@lxl898</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

你已经看到，要创建一个简单的Lightue应用，首先你需要使用[Lightue.useState()](../api/global#useState-stateSrc-)声明一些应用状态。然后用[Lightue()](../api/global)函数接收一个[VDomSrc](../api/template)作为模板来创建一个应用实例。

这时你已经可以在浏览器中看到渲染结果。当你改变状态时，渲染的DOM将会自动更新。在上面的例子中，我们展示了一行文字并在2秒后改变了它。

深入细节，[Lightue](../api/global)函数会根据[VDomSrc](../api/template)创建一个Lightue节点树，并生成相应的DOM元素，然后将生成的DOM树插入到body或[el](../api/global#options)选项指定的其他元素末尾。
