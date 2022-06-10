# Conditional Rendering

To render an element conditionally (hide it in some cases), there are mainly two ways:

## classname + display:none

In this way, the element will always be in DOM. It suits cases when the element is very likely to be shown or it toggles frequently.

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

In this way, when [$if](../api/template#$if -boolean-) is falsy, the element will be moved out of DOM and replaced by a comment node. When the value turned to truthy, original element will be placed back to DOM. It suits cases when the element is not likely to be shown or it doesn't toggle frequently.

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
