# State Driven

Lightue apps' DOMs are driven by states. When state changed, corresponding DOM will also change.

## Create states

To create a state, pass an object to [Lightue.useState](../api/global#useState-stateSrc-):

```js
var S = Lightue.useState({
  width: 20,
  height: 30,
  colors: {
    bgColor: 'red',
  },
})
```

Now you've obtained a reactive state. States are recursively reactive, which means the above `S.colors` is also reactive.

## Use states

To show the state onto the page, you need to put it into VDomSrc using state function (a function that uses state):

```js
  myElement: {
    anotherElement: () => S.width
    // a single state function can be abbreviated by adding $ to the rightmost key:
    // anotherElement: S.$width
  },
```

This will output:

```html
<div class="my-element">
  <div class="another-element">20</div>
</div>
```

But also builds up a relationship between state function `() => S.width` and element `anotherElement`, so that when `S.width` changed, the state function will run again and the element will be rerendered.

The above example is quite simple, but you can also use some more complex state functions such as `() => "the width*2 is: "+S.width*2`.

State functions can also be used on other parts of VDomSrc such as attributes and classes:

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

## Render list using array states

With the above knowledge, it's very natural for us to render a list using an array state function with array's map method:

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

And it'll also be very easy to change the rendered list by changing the array state:

```js
// push a new item
S.list.push(23)
// replace an item
S.list[3] = 321
// replace the whole list
S.list = [999, 888, 777]
```
