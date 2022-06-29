# 全局方法

## Lightue(VDomSrc [, options ])

`Lightue` 自己是一个接收[VDomSrc](./template)和 options 选项的函数。当调用时，它会解析 VDomSrc 并创建 Lightue 节点树，同时生成相应的 DOM 元素，然后将生成的 DOM 树插入到 body 或[el](../api/global#options)选项指定的其他元素末尾。

### options

当调用 Lightue 时，可以传入一个可选的 options 对象作为第二个参数。目前它只含有一个选项：

- el (string, optional)
当传入一个 `el` 选项时，它声明了当前 Lightue 的挂载点。这个值会传给 `document.querySelector` 然后 Lightue 会将生成的 DOM 插入到此节点末尾。默认值为 'body'

## useState(stateSrc)

传给 Lightue.useState 的 stateSrc 是一个对象。 `useState` 方法会将其转换成一个响应式状态并返回。当你改变状态的一个属性时，它会通知相关的状态函数重新渲染。一个例子：

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

状态可以嵌套：

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

也可以包含数组：

```js
var S = Lightue.useState({
  size: [20, 30],
})
setInterval(function () {
  S.size[0]++
}, 500)
```

在[这里](https://codepen.io/lxl898/pen/vYyooWK)或者 demo 文件夹下查看更多示例.

就是这样，只要改变状态，依赖此状态的地方就会自动更新。

## watchEffect(effect)

effect 是一个状态函数。当调用 watchEffect 时，effect 会首先被立即执行。然后当此 effect 中使用的状态变化后，此 effect 会自动再次执行。你可以认为这些状态被观测用来再次执行 effect。

## useProp(props)

创建子组件的属性状态。参数 `props` 是一个父组件的状态函数，返回一个对象。 `useProp` 的返回值是一个供子组件使用的状态，会响应父组件状态的变化。

## useComp(comp)

创建一个工厂函数组件。参数 `comp` 是一个返回VDomSrc的工厂函数。与直接使用工厂函数相比， `useComp` 的优势在于它自动在第一个参数上调用了 `useProp` ；并且在使用时可以继续方便地通过点操作添加HTML类名。

## 标签&类简写

Lightue 自带一些 HTML 标签和类的简写方法。这些方法接收一个 VDomSrc，改变它然后返回一个$tag和$class 改变过的 VDomSrc。

例如:

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
