# Component

In large applications, we will usually have same pieces of UI/logic being used at multiple places. Instead of copy and paste everywhere, we can create reusable pieces of code which is called components to make our application's code better.

## Basic

In Lightue, you can simply use [factory functions](https://www.geeksforgeeks.org/what-are-factory-functions-in-javascript/) which return VDomSrc as components. Use uppercase for the first letter to differentiate them from regular functions:

```js
function CompA() {
  return {
    $class: { compA: 1 },
    $$: "I'm component A",
  }
}
function CompB() {
  // components can have their own states
  var S = L.useState({
    name: 'B',
  })
  return {
    $class: { compB: 1 },
    $$: () => "I'm component " + S.name,
  }
}
L({
  aaa: CompA(),
  bbb: CompB(),
  ccc: {
    ddd: CompB(),
    eee: CompA(),
  },
})
```

## Static Params

Since components are just functions, it's natural to pass params to them:

```js
function CompA(param1, param2) {
  return {
    $class: { compA: param1 },
    $$: 'param2: ' + param2,
  }
}
function CompB(name) {
  // use param as initial value for inner state
  var S = L.useState({
    name: name,
  })
  return {
    $class: { compB: 1 },
    $$: () => "I'm component " + S.name,
  }
}
L({
  aaa: CompA(true, 123),
  bbb: CompB('B'),
})
```

## Dynamic Props

Using the params can only gives you an initial value being used to generate inner state and the VDomSrc for the first time. But if you want to dynamically react to changes of parent component's state, you need to use Props:

```js
var S = L.useState({
  foo: 123,
  bar: 'hello',
})

function CompA(props, param1) {
  var P = L.useProp(props)
  return {
    param1: 'static param1: ' + param1,
    name: () => 'prop name is: ' + P.name,
    age: () => 'prop age is: ' + P.age,
    // prop is actually a state, so $ shortcut applies
    simpleName: P.$name,
    simpleAge: P.$age,
  }
}

L({
  aaa: CompA(
    () => ({
      name: S.bar + ' CompA',
      age: S.foo,
    }),
    'hello'
  ),
})
setInterval(() => S.foo++, 1000)
```
