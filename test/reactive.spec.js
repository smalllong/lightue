import Lightue, { useState, watchEffect, Node, useProp, useComp } from '../dist/lightue'
var { div } = (L = Lightue)

describe('reactive', () => {
  it('state changed', () => {
    var S = useState({
      foo: 'bar',
      width: 20,
    })

    var vm = L(div({ style: () => 'width: ' + S.width + 'px' }, () => S.foo))

    expect(vm.el.children[0].style.width).toBe('20px')
    expect(vm.el.children[0].textContent).toBe('bar')
    S.width = 30
    S.foo = 'aaa'
    expect(vm.el.children[0].style.width).toBe('30px')
    expect(vm.el.children[0].textContent).toBe('aaa')
  })

  it('state function shortcut', () => {
    var S = useState({
      foo: 'bar',
    })
    var vm = L(
      div.aaa(S.$foo),
      div.ccc(() => S.$foo + 'ddd')
    )
    expect(vm.el.innerHTML).toBe('<div class="aaa">bar</div><div class="ccc">barddd</div>')
    S.foo = 'bbb'
    expect(vm.el.innerHTML).toBe('<div class="aaa">bbb</div><div class="ccc">bbbddd</div>')
  })

  it('conditionally render', () => {
    var S = useState({
      showElem: true,
      content: '111',
      showBaz: false,
      aaa: 'aaa',
    })
    var vm = L(div.foo({ $if: S.$showElem }, S.$content), div.bar('333'), () => div.baz({ $if: S.$showBaz }, S.$aaa))
    expect(vm.el.innerHTML).toBe('<div class="foo">111</div><div class="bar">333</div><!---->')
    S.showElem = false
    expect(vm.el.innerHTML).toBe('<!----><div class="bar">333</div><!---->')
    S.content = '222'
    S.showElem = true
    expect(vm.el.innerHTML).toBe('<div class="foo">222</div><div class="bar">333</div><!---->')
    S.showBaz = true
    expect(vm.el.innerHTML).toBe('<div class="foo">222</div><div class="bar">333</div><div class="baz">aaa</div>')
    S.aaa = 'bbb' // ensure $if not break when element rerendered
    S.showBaz = false
    expect(vm.el.innerHTML).toBe('<div class="foo">222</div><div class="bar">333</div><!---->')
    S.showBaz = true
    expect(vm.el.innerHTML).toBe('<div class="foo">222</div><div class="bar">333</div><div class="baz">bbb</div>')
  })

  it('watchEffect', () => {
    var S = useState({
        foo: 'bar',
      }),
      temp = 1

    watchEffect(() => S.foo && temp++)

    expect(temp).toBe(2)
    S.foo = false
    expect(temp).toBe(2)
    S.foo = '234'
    expect(temp).toBe(3)
  })

  it('nested state function', () => {
    var S = useState({
        a: 2,
        b: 'foo',
        c: 'cc',
      }),
      renderCount = 0

    var vm = L(() => {
      renderCount++
      return new Node('h' + S.a + '.dynamic', div.bar(S.$b), S.c)
    })

    expect(vm.el.innerHTML).toBe('<h2 class="dynamic"><div class="bar">foo</div>cc</h2>')
    expect(renderCount).toBe(1)
    S.c += 'c'
    expect(vm.el.innerHTML).toBe('<h2 class="dynamic"><div class="bar">foo</div>ccc</h2>')
    expect(renderCount).toBe(2)
    S.b += 'o'
    expect(vm.el.innerHTML).toBe('<h2 class="dynamic"><div class="bar">fooo</div>ccc</h2>')
    expect(renderCount).toBe(2)
    S.a++
    expect(vm.el.innerHTML).toBe('<h3 class="dynamic"><div class="bar">fooo</div>ccc</h3>')
    expect(renderCount).toBe(3)
  })

  it('useProp', () => {
    var S = useState({
      foo: 123,
    })

    function CompA(props) {
      var P = useProp(props)
      return div.bar(P.$propA)
    }

    var vm = L(div.instance(CompA(() => ({ propA: S.foo + 321 }))))

    expect(vm.el.innerHTML).toBe('<div class="instance"><div class="bar">444</div></div>')
    S.foo = 222
    expect(vm.el.innerHTML).toBe('<div class="instance"><div class="bar">543</div></div>')
  })

  it('useComp', () => {
    var S = useState({
      foo: 123,
    })

    var CompA = useComp(function (P) {
      return div.bar(P.$propA)
    })

    var vm = L(
      div.instance(CompA(() => ({ propA: S.foo + 123 }))),
      div.instance2(CompA.myComp(() => ({ propA: S.foo + 321 })))
    )

    expect(vm.el.innerHTML).toBe(
      '<div class="instance"><div class="bar">246</div></div><div class="instance2"><div class="bar myComp">444</div></div>'
    )
    S.foo = 222
    expect(vm.el.innerHTML).toBe(
      '<div class="instance"><div class="bar">345</div></div><div class="instance2"><div class="bar myComp">543</div></div>'
    )
  })
})
