# 模板语法

Lightue使用一种特殊JavaScript对象作为模板，也称为VDomSrc，表示它是Lightue用来生成VDom和真实DOM节点的原始数据。

## 元素

在VDomSrc中，一个HTML元素常常是一个对象，而且嵌套的对象可以表示嵌套的HTML元素；元素的内容可以用以 `$$` 开头的属性声明，标签则可以用 `$tag` 声明 （默认为 `div`）：
```js
  foo: {
    bar: {
      $tag: 'section',
      baz: {
        $$: 'content',
        $$1: ' and ',
        $$2: 'another content',
      },
    },
  },
```
将输出：
```html
<div class="foo">
  <section class="bar">
    <div class="baz">content and another content</div>
  </section>
</div>
```

一个只有 `$$` 属性的对象常常可以简写。驼峰式键名会解析为短横线类名。所以：
```js
  myElement: {
    anotherElement: '123'
  },
```
将输出：
```html
<div class="my-element">
  <div class="another-element">123</div>
</div>
```

如果你的子元素不需要类名，你可以使用 `$$` 开头的属性：
```js
$$: {
  $$: {
    $$: '123'
  },
  $$1: {
    $$: 'hi'
  },
}
```
将输出：
```html
<div>
  <div>123</div>
  <div>hi</div>
</div>
```
可以看到，这种情况下只有 `$$` 属性的对象无法简写。另外我建议始终设置一个键（类名）这样代码可以更加清晰。

## 属性 & 类

要设置HTML元素的属性，需要在对象中使用 `_` 开头的属性：
```js
  foo: {
    _hidden: true,
    _dataTest: 'some data',
    $$: 'you can\'t see me',
  },
```
将输出：
```html
<div class="foo" hidden="true" data-test="some data">
  you can't see me
</div>
```

要设置元素的类，使用 `_class`（会覆盖键的类）或 `$class`（对象形式）：
```js
  foo: {
    _class: 'bar',
    $$: '123',
  },
```
将输出：
```html
<div class="bar">
  123
</div>
```
以及：
```js
  foo: {
    $class: {bar: 1},
    $$: '123',
  },
```
将输出：
```html
<div class="foo bar">
  123
</div>
```

## 列表

你当然可以使用数组来生成列表：
```js
  list: {
    $tag: 'ul',
    $$: [
      {
        $tag: 'li',
        $$: 'first item',
      },
      {
        $tag: 'li',
        $$: 'second item',
      },
    ]
  }
```
将输出：
```html
<ul class="list">
  <!--arr start-->
  <li class="list-item">first item</li>
  <li class="list-item">second item</li>
  <!--arr end-->
</ul>
```

现在你已经掌握使用VDomSrc的基础。接下来可以在[标签&类简写](../api/global#标签&类简写)和[VDomSrc的API](../api/template)查看更多信息。
