# Template Syntax

Lightue uses a special JavaScript object as the template which is called VDomSrc, meaning that it is the source for Lightue to generate VDom and real DOM nodes.

## Element

In VDomSrc, an HTML element is usually an object, and nested objects can represent nested HTML elements, the content of the element can be specified by properties starts with `$$`, and the tag can be specified using `$tag` (default is `div`):
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
will output:
```html
<div class="foo">
  <section class="bar">
    <div class="baz">content and another content</div>
  </section>
</div>
```

An object which has only `$$` property can be abbreviated in most cases. And camelCase keys will be parsed to kebab-case classes. So:
```js
  myElement: {
    anotherElement: '123'
  },
```
will output:
```html
<div class="my-element">
  <div class="another-element">123</div>
</div>
```

If you don't need classes on the child elements, you can use properties starts with `$$`:
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
will output:
```html
<div>
  <div>123</div>
  <div>hi</div>
</div>
```
As you can see, in this case the simple `$$` only object can't be abbreviated. Also I suggest to always set a key (class) so it can be more specific.

## Attributes

To set attributes on elements, use properties starts with `_`:
```js
  foo: {
    _hidden: true,
    _dataTest: 'some data',
    $$: 'you can\'t see me',
  },
```
will output:
```html
<div class="foo" hidden="true" data-test="some data">
  you can't see me
</div>
```

## List

You can certainly generate a list using arrays:
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
will output:
```html
<ul class="list">
  <!--arr start-->
  <li class="list-item">first item</li>
  <li class="list-item">second item</li>
  <!--arr end-->
</ul>
```


Now you know the basics of using VDomSrc. Check out for more in [Tag & class shortcuts](../api/global#tag-class-shortcuts) and [API of VDomSrc](../api/template)
