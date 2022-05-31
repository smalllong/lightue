var L = require('../dist/cjs')

describe('template', () => {
  it('create root element', () => {
    var vm = L({
      $$: 'hello',
      $$1: ' world',
    })
    expect(vm.el.outerHTML).toBe('<div class="root">hello world</div>')
  })

  it('create child element', () => {
    var vm = L({
      hi: 'hello',
      foo: {
        barBaz: '123',
      },
      $$: {
        $$: 345,
      },
    })
    expect(vm.el.children[0].outerHTML).toBe('<div class="hi">hello</div>')
    expect(vm.el.children[1].outerHTML).toBe('<div class="foo"><div class="bar-baz">123</div></div>')
    expect(vm.el.children[2].outerHTML).toBe('<div>345</div>')
  })

  it('create child span element', () => {
    var vm = L({
      $_hi: 'hello',
      foo: {
        $_bar: 234,
      },
    })
    expect(vm.el.children[0].outerHTML).toBe('<span class="hi">hello</span>')
    expect(vm.el.children[1].outerHTML).toBe('<div class="foo"><span class="bar">234</span></div>')
  })

  it('simple array', () => {
    var vm = L({
      $$: [1, 2, 3, 4],
    })
    expect(vm.el.innerHTML).toBe(
      '<!--arr start--><div class="root-item">1</div><div class="root-item">2</div><div class="root-item">3</div><div class="root-item">4</div><!--arr end-->'
    )
  })

  it('simple child array', () => {
    var vm = L({
      numbers: [5, 3, 1],
    })
    expect(vm.el.innerHTML).toBe(
      '<div class="numbers"><!--arr start--><div class="numbers-item">5</div><div class="numbers-item">3</div><div class="numbers-item">1</div><!--arr end--></div>'
    )
  })

  it('$class', () => {
    var vm = L({
      aaa: {
        $class: { foo: 1, bar: 0 },
        $$: 'bbb',
      },
    })
    expect(vm.el.innerHTML).toBe('<div class="aaa foo">bbb</div>')
  })

  it('$value', () => {
    var vm = L({
      aaa: L.input({
        $value: 'hello',
      }),
    })
    expect(vm.el.children[0].value).toBe('hello')
  })
})
