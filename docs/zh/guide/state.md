# 状态驱动

Lightue应用的DOM由状态驱动。当状态改变时，相应的DOM也会变化。

## 创建状态

要创建一个状态，需要传一个对象给 [Lightue.useState](../api/global#useState-stateSrc-)：

```js
var S = Lightue.useState({
  width: 20,
  height: 30,
  colors: {
    bgColor: 'red',
  },
})
```

现在你便获得了一个响应式状态。状态是递归响应式的，即上面的 `S.colors` 也是响应式的。

## 使用状态

要将状态展示在页面上，你需要用状态函数（使用了状态的函数）将其放入VDomSrc中：

```js
  myElement: {
    anotherElement: () => S.width
  },
```
将输出：
```html
<div class="my-element">
  <div class="another-element">20</div>
</div>
```

同时这也在状态函数 `() => S.width` 和元素 `anotherElement` 间建立了联系，所以当 `S.width` 改变时，状态函数将再次执行，元素也会重新渲染。

上面的例子相当简单，不过你也可以使用更加复杂的状态函数，例如 `() => "the width*2 is: "+S.width*2` 。

状态函数也可以用在VDomSrc的其它部分，比如属性和类：

```js
  myElement: {
    anotherElement: {
      _style: () => 'width:'+S.width+'px',
      $class: {
        isWide: () => S.width > 300,
      },
    }
  },
```

## 数组状态渲染列表

有了上面的知识，我们可以借助数组的map方法非常自然地用数组状态函数来渲染一个列表：

```js
var S = L.useState({
  list: [2, 3, 5, 7, 11, 13, 17, 19],
})
L({
  $tag: 'ul',
  $$: () =>
    S.list.map((num) => ({
      $tag: 'li',
      $$: num,
    })),
})
```

并且也可以简单地通过修改数组状态来达到修改渲染后列表的效果：

```js
// push a new item
S.list.push(23)
// replace an item
S.list[3] = 321
// replace the whole list
S.list = [999, 888, 777]
```
