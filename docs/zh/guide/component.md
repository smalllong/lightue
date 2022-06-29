# 组件

在大型应用中，我们常常会在多个地方有相同的 UI/逻辑片段。相比于到处复制粘贴代码，更好的做法是创建可复用的叫做组件的代码片段。

## 基础

在 Lightue 中，你可以简单地使用返回 VDomSrc 的[工厂函数](https://www.geeksforgeeks.org/what-are-factory-functions-in-javascript/)来作为组件。组件名的首字母大写，以将它们与普通函数区分开：

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

## 静态参数

既然组件只是函数，我们可以自然地进行传参：

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

## 动态属性

传参给组件仅仅是给组件第一次创建内部状态和 VDomSrc 时提供了初始值。但如果你想要组件动态地响应父组件的状态变化，你需要使用组件属性：

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

另外你也可以使用 [useComp](../api/global#useComp-comp-) 来定义组件。它会帮你在第一个参数上应用 `useProp` 。它也允许你给创建的组件实例再添加HTML类名：

```js
var CompA = L.useComp(function (P) { // P is already processed by useProp
  return {
    bar: P.$propA,
  }
})

var vm = L({
  instance: CompA(() => ({ propA: S.foo + 123 })), // directly call it just like above
  instance2: CompA.myComp(() => ({ propA: S.foo + 321 })), // easily add 'my-comp' class to this instance
})
```
