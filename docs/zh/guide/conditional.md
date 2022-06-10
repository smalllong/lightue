# 条件渲染

要将一个元素有条件的渲染（在某些情况隐藏），主要有两种方式：

## 类名 + display:none

这种方式下元素将始终在 DOM 中，适合于大概率展示或频繁切换显隐的情况。

```js
var S = L.useState({
  showEl: false,
})
L({
  someElement: {
    $class: {
      hideMe: () => !S.showEl,
    },
  },
})
```

```css
.hide-me {
  display: none;
}
```

## $if

这种方式下，[$if](../api/template#$if -boolean-) 为 falsy 时，元素会被移出 DOM 替换为注释节点，为 truthy 时再将原节点放回 DOM，适合于小概率展示或显隐切换不频繁的情况。

```js
var S = L.useState({
  showEl: true,
})
L({
  someElement: {
    $if: () => S.showEl,
  },
})
```
