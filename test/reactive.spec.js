var L = require('../dist/cjs')

describe('reactive', () => {
  it('state changed', () => {
    var S = L.useState({
      foo: 'bar',
      width: 20,
    })

    var vm = L({
      _style: () => 'width: ' + S.width + 'px',
      $$: () => S.foo,
    })

    expect(vm.el.style.width).toBe('20px')
    expect(vm.el.textContent).toBe('bar')
    S.width = 30
    S.foo = 'aaa'
    expect(vm.el.style.width).toBe('30px')
    expect(vm.el.textContent).toBe('aaa')
  })

  it('array state changed', () => {
    var S = L.useState({
      list: [2, 3, 5, 7],
    })

    var vm = L({
      list: () => S.list,
    })

    expect(vm.el.children[0].children.length).toBe(4)
    expect(vm.el.textContent).toBe('2357')
    S.list.push(11)
    expect(vm.el.children[0].children.length).toBe(5)
    expect(vm.el.textContent).toBe('235711')
    S.list[2] = 432
    expect(vm.el.children[0].children.length).toBe(5)
    expect(vm.el.textContent).toBe('23432711')
    S.list = [999, 888, 777]
    expect(vm.el.children[0].children.length).toBe(3)
    expect(vm.el.textContent).toBe('999888777')
  })

  it('conditionally render', () => {
    var S = L.useState({
      showElem: true,
      content: '111',
      showBaz: false,
    })
    var vm = L({
      foo: {
        $if: () => S.showElem,
        $$: () => S.content,
      },
      bar: '333',
      baz: {
        $if: () => S.showBaz,
        $$: 'aaa',
      }
    })
    expect(vm.el.innerHTML).toBe('<div class="foo">111</div><div class="bar">333</div><!--baz-->')
    S.showElem = false
    expect(vm.el.innerHTML).toBe('<!--foo--><div class="bar">333</div><!--baz-->')
    S.content = '222'
    S.showElem = true
    expect(vm.el.innerHTML).toBe('<div class="foo">222</div><div class="bar">333</div><!--baz-->')
    S.showBaz = true
    expect(vm.el.innerHTML).toBe('<div class="foo">222</div><div class="bar">333</div><div class="baz">aaa</div>')
  })

  it('watchEffect', () => {
    var S = L.useState({
        foo: 'bar',
      }),
      temp = 1

    L.watchEffect(() => S.foo && temp++)

    expect(temp).toBe(2)
    S.foo = false
    expect(temp).toBe(2)
    S.foo = '234'
    expect(temp).toBe(3)
  })
})
