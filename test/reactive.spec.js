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
      }),
      renderCount = 0

    var vm = L({
      list: () => {
        renderCount++
        return S.list
      },
    })

    expect(vm.el.children[0].children.length).toBe(4)
    expect(vm.el.textContent).toBe('2357')
    expect(renderCount).toBe(1)
    S.list.push(11)
    expect(vm.el.children[0].children.length).toBe(5)
    expect(vm.el.textContent).toBe('235711')
    expect(renderCount).toBe(1)
    S.list[2] = 432
    expect(vm.el.children[0].children.length).toBe(5)
    expect(vm.el.textContent).toBe('23432711')
    expect(renderCount).toBe(1)
    S.list = [999, 888, 777]
    expect(vm.el.children[0].children.length).toBe(3)
    expect(vm.el.textContent).toBe('999888777')
    expect(renderCount).toBe(2)
  })

  it('multiple array mapped VDomSrc changed', () => {
    var S = L.useState({
        list: [2, 3, 5],
        flag: 0,
      }),
      count = 0,
      innerCount = 0

    var vm = L({
      l1: () => {
        count++
        return S.list.map((item) => {
          innerCount++
          return {
            $$: item + 2,
            flag: S.$flag,
          }
        })
      },
      l2: () => {
        count++
        return S.list.map((item) => {
          innerCount++
          return {
            $$: item * 2,
            flag: S.$flag,
          }
        })
      },
      length: () => S.list.length,
    })

    function buildResult(arr, flag, cname) {
      return (
        '<!--arr start-->' +
        arr.map((n) => '<div class="' + cname + '-item">' + n + '<div class="flag">' + flag + '</div></div>').join('') +
        '<!--arr end-->'
      )
    }

    expect(vm.el.children[0].innerHTML).toBe(buildResult([4, 5, 7], 0, 'l1'))
    expect(vm.el.children[1].innerHTML).toBe(buildResult([4, 6, 10], 0, 'l2'))
    expect(vm.el.children[2].textContent).toBe('3')
    expect(count).toBe(2)
    expect(innerCount).toBe(6)
    S.list.push(7)
    expect(vm.el.children[0].innerHTML).toBe(buildResult([4, 5, 7, 9], 0, 'l1'))
    expect(vm.el.children[1].innerHTML).toBe(buildResult([4, 6, 10, 14], 0, 'l2'))
    expect(vm.el.children[2].textContent).toBe('4')
    expect(count).toBe(2)
    expect(innerCount).toBe(8)
    S.flag++
    expect(vm.el.children[0].innerHTML).toBe(buildResult([4, 5, 7, 9], 1, 'l1'))
    expect(vm.el.children[1].innerHTML).toBe(buildResult([4, 6, 10, 14], 1, 'l2'))
    expect(count).toBe(2)
    expect(innerCount).toBe(8)
    S.list[1] = 4
    expect(vm.el.children[0].innerHTML).toBe(buildResult([4, 6, 7, 9], 1, 'l1'))
    expect(vm.el.children[1].innerHTML).toBe(buildResult([4, 8, 10, 14], 1, 'l2'))
    expect(count).toBe(2)
    expect(innerCount).toBe(10)
    S.list = [9, 8, 7]
    expect(vm.el.children[0].innerHTML).toBe(buildResult([11, 10, 9], 1, 'l1'))
    expect(vm.el.children[1].innerHTML).toBe(buildResult([18, 16, 14], 1, 'l2'))
    expect(count).toBe(4)
    expect(innerCount).toBe(16)
  })

  it('complicated array state', () => {
    var S = L.useState({
      list: [
        {
          flag: false,
          txt: 'foo',
        },
        {
          flag: true,
          txt: 'bar',
        },
      ],
    })

    var vm = L({
      allTrue: {
        $if: () => S.list.filter((item) => item.flag).length == S.list.length,
      },
      list: () =>
        S.list.map((item) => ({
          $$: item.txt,
        })),
    })

    expect(vm.el.innerHTML).toBe(
      '<!--all-true--><div class="list"><!--arr start--><div class="list-item">foo</div><div class="list-item">bar</div><!--arr end--></div>'
    )
    S.list[0].flag = true
    expect(vm.el.innerHTML).toBe(
      '<div class="all-true"></div><div class="list"><!--arr start--><div class="list-item">foo</div><div class="list-item">bar</div><!--arr end--></div>'
    )
    S.list.push({ flag: false, txt: 'abc' })
    expect(vm.el.innerHTML).toBe(
      '<!--all-true--><div class="list"><!--arr start--><div class="list-item">foo</div><div class="list-item">bar</div><div class="list-item">abc</div><!--arr end--></div>'
    )
    S.list[2].flag = true
    S.list[2].txt = 'cde'
    expect(vm.el.innerHTML).toBe(
      '<div class="all-true"></div><div class="list"><!--arr start--><div class="list-item">foo</div><div class="list-item">bar</div><div class="list-item">cde</div><!--arr end--></div>'
    )
  })

  it('array item level state function', () => {
    var S = L.useState({
        list: [
          {
            txt: 'foo',
          },
          {
            txt: 'bar',
          },
        ],
      }),
      count = 0

    var vm = L({
      list: () =>
        S.list.map((item) => () => {
          count++
          return {
            $tag: 'button',
            _type: 'button',
            $$: item.txt,
            onclick: () => (item.txt += 'o'),
          }
        }),
    })

    expect(count).toBe(2)
    expect(vm.el.textContent).toBe('foobar')
    vm.el.children[0].children[0].click()
    expect(count).toBe(3)
    expect(vm.el.textContent).toBe('fooobar')
    S.list = [{ txt: 'aaa' }, { txt: 'bbb' }]
    expect(count).toBe(5)
    expect(vm.el.textContent).toBe('aaabbb')
  })

  it('conditionally render', () => {
    var S = L.useState({
      showElem: true,
      content: '111',
      showBaz: false,
      aaa: 'aaa',
    })
    var vm = L({
      foo: {
        $if: () => S.showElem,
        $$: () => S.content,
      },
      bar: '333',
      baz: () => ({
        $if: () => S.showBaz,
        $$: S.aaa,
      }),
    })
    expect(vm.el.innerHTML).toBe('<div class="foo">111</div><div class="bar">333</div><!--baz-->')
    S.showElem = false
    expect(vm.el.innerHTML).toBe('<!--foo--><div class="bar">333</div><!--baz-->')
    S.content = '222'
    S.showElem = true
    expect(vm.el.innerHTML).toBe('<div class="foo">222</div><div class="bar">333</div><!--baz-->')
    S.showBaz = true
    expect(vm.el.innerHTML).toBe('<div class="foo">222</div><div class="bar">333</div><div class="baz">aaa</div>')
    S.aaa = 'bbb' // ensure $if not break when element rerendered
    S.showBaz = false
    expect(vm.el.innerHTML).toBe('<div class="foo">222</div><div class="bar">333</div><!--baz-->')
    S.showBaz = true
    expect(vm.el.innerHTML).toBe('<div class="foo">222</div><div class="bar">333</div><div class="baz">bbb</div>')
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

  it('state function shortcut', () => {
    var S = L.useState({
      foo: 'bar',
    })
    var vm = L({
      aaa: S.$foo,
      ccc: () => S.$foo + 'ddd',
    })
    expect(vm.el.innerHTML).toBe('<div class="aaa">bar</div><div class="ccc">barddd</div>')
    S.foo = 'bbb'
    expect(vm.el.innerHTML).toBe('<div class="aaa">bbb</div><div class="ccc">bbbddd</div>')
  })

  it('nested state function', () => {
    var S = L.useState({
        a: 2,
        b: 'foo',
        c: 'cc',
      }),
      renderCount = 0

    var vm = L({
      dynamic: () => {
        renderCount++
        return {
          $tag: 'h' + S.a,
          bar: () => S.b,
          $$: S.c,
        }
      },
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
    var S = L.useState({
      foo: 123,
    })

    function CompA(props) {
      var P = L.useProp(props)
      return {
        bar: P.$propA,
      }
    }

    var vm = L({
      instance: CompA(() => ({ propA: S.foo + 321 })),
    })

    expect(vm.el.innerHTML).toBe('<div class="instance"><div class="bar">444</div></div>')
    S.foo = 222
    expect(vm.el.innerHTML).toBe('<div class="instance"><div class="bar">543</div></div>')
  })

  it('useComp', () => {
    var S = L.useState({
      foo: 123,
    })

    var CompA = L.useComp(function (P) {
      return {
        bar: P.$propA,
      }
    })

    var vm = L({
      instance: CompA(() => ({ propA: S.foo + 123 })),
      instance2: CompA.myComp(() => ({ propA: S.foo + 321 })),
    })

    expect(vm.el.innerHTML).toBe(
      '<div class="instance"><div class="bar">246</div></div><div class="instance2 my-comp"><div class="bar">444</div></div>'
    )
    S.foo = 222
    expect(vm.el.innerHTML).toBe(
      '<div class="instance"><div class="bar">345</div></div><div class="instance2 my-comp"><div class="bar">543</div></div>'
    )
  })
})
