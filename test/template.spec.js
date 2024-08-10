var L = require('../dist/cjs'),
  { div, span, section, input } = L

describe('template', () => {
  it('create root element', () => {
    L(div.root('hello', ' world'))
    expect(document.body).toMatchSnapshot()
  })

  it('create child elements', () => {
    L(div.hi('hello'), div.foo(div.barBaz('123')), div(345), section(), 'yes')
    expect(document.body).toMatchSnapshot()
  })

  it('not create null or undefined', () => {
    L(div.root(null, undefined))
    expect(document.body).toMatchSnapshot()
  })

  it('not show $if', () => {
    L(
      div.foo({ $if: false }, 'bar'),
      div.undefined({ $if: undefined }, 'should not be in DOM'),
      div.aaa({ $if: true }, 'bbb')
    )
    expect(document.body).toMatchSnapshot()
  })

  it('create child span element', () => {
    L(span.hi('hello'), div.foo(span.bar(234)))
    expect(document.body).toMatchSnapshot()
  })

  it('simple array', () => {
    L(div.root(...[1, 2, 3, 4].map((n) => div(n))))
    expect(document.body).toMatchSnapshot()
  })

  it('$class', () => {
    L(
      div.aaa(
        {
          $class: { foo: 1, bar: 0 },
        },
        'bbb'
      )
    )
    expect(document.body).toMatchSnapshot()
  })

  it('$value', () => {
    var vm = L(input.aaa({ $value: 'hello' }))
    expect(vm.el.children[0].value).toBe('hello')
  })

  it('$checked', () => {
    var vm = L(input.aaa({ type: 'checkbox', $checked: 1 }))
    expect(vm.el.children[0].checked).toBe(true)
  })

  it('attributes', () => {
    L(
      input.aaa({
        type: 'checkbox',
        dataFoo: 'bar',
      })
    )
    expect(document.body).toMatchSnapshot()
  })

  it('listener', () => {
    var onclick = jest.fn()
    var vm = L(
      div.root({
        onclick,
      })
    )
    vm.el.children[0].dispatchEvent(new MouseEvent('click'))
    expect(onclick).toHaveBeenCalled()
  })

  it('$cleanup', () => {
    var cleanup = jest.fn(),
      S = L.useState({
        curComp: 0,
      })
    function comp1() {
      return div({
        $cleanup: cleanup,
      })
    }
    function comp2() {
      return div()
    }
    var comps = [comp1, comp2]
    L(() => comps[S.curComp]())
    setTimeout(() => {
      expect(cleanup).not.toHaveBeenCalled()
      S.curComp = 1
      setTimeout(() => expect(cleanup).toHaveBeenCalled())
    })
  })
})
