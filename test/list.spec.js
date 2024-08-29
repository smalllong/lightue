import Lightue, { useState } from '../dist/lightue'
var { div, button } = (L = Lightue)

describe('list', () => {
  it('array state changed', () => {
    var S = useState({
        list: [2, 3, 5, 7],
      }),
      renderCount = 0

    var vm = L(
      div.list(() => {
        renderCount++
        return S.list.map((num) => div(num))
      }, div('end'))
    )

    expect(vm.el.children[0].children.length).toBe(5)
    expect(vm.el.textContent).toBe('2357end')
    expect(renderCount).toBe(1)
    S.list.push(11)
    expect(vm.el.children[0].children.length).toBe(6)
    expect(vm.el.textContent).toBe('235711end')
    expect(renderCount).toBe(1)
    S.list[2] = 432
    expect(vm.el.children[0].children.length).toBe(6)
    expect(vm.el.textContent).toBe('23432711end')
    expect(renderCount).toBe(1)
    S.list = [999, 888, 777]
    expect(vm.el.children[0].children.length).toBe(4)
    expect(vm.el.textContent).toBe('999888777end')
    expect(renderCount).toBe(2)
  })

  it('multiple array mapped VDomSrc changed', () => {
    var S = useState({
        list: [2, 3, 5],
        flag: 0,
      }),
      count = 0,
      innerCount = 0

    var vm = L(
      div.l1(() => {
        count++
        return S.list.map((item) => {
          innerCount++
          return div(item + 2, div.flag(S.$flag))
        })
      }),
      div.l2(() => {
        count++
        return S.list.map((item) => {
          innerCount++
          return div(item * 2, div.flag(S.$flag))
        })
      }),
      div.length(() => S.list.length)
    )

    function buildResult(arr, flag, cname) {
      return (
        '<!--arr start-->' +
        arr.map((n) => '<div>' + n + '<div class="flag">' + flag + '</div></div>').join('') +
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
    S.list[2] = 9
    expect(vm.el.children[0].innerHTML).toBe(buildResult([11, 10, 11], 1, 'l1'))
    expect(vm.el.children[1].innerHTML).toBe(buildResult([18, 16, 18], 1, 'l2'))
    expect(count).toBe(4)
    expect(innerCount).toBe(18)
  })

  it('multiple array mapped to one node', () => {
    var S = useState({
      list: [1, 2],
    })

    var vm = L(
      S.list.map((item) => div(item + 3)),
      S.list.map((item) => div(item * 3))
    )

    function buildResult(arr, arr2) {
      return (
        '<!--arr start-->' +
        arr.map((n) => '<div>' + n + '</div>').join('') +
        '<!--arr end--><!--arr start-->' +
        arr2.map((n) => '<div>' + n + '</div>').join('') +
        '<!--arr end-->'
      )
    }
    expect(vm.el.innerHTML).toBe(buildResult([4, 5], [3, 6]))

    S.list[0] = 0
    expect(vm.el.innerHTML).toBe(buildResult([3, 5], [0, 6]))

    S.list.push(3)
    expect(vm.el.innerHTML).toBe(buildResult([3, 5, 6], [0, 6, 9]))

    S.list[2] = 4
    expect(vm.el.innerHTML).toBe(buildResult([3, 5, 7], [0, 6, 12]))
    S.list[1] = 1
    expect(vm.el.innerHTML).toBe(buildResult([3, 4, 7], [0, 3, 12]))
  })

  it('complicated array state', () => {
    var S = useState({
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

    var vm = L(
      div.allTrue({
        $if: () => S.list.filter((item) => item.flag).length == S.list.length,
      }),
      div.list(S.list.map((item) => div(item.txt)))
    )

    expect(vm.el.innerHTML).toBe(
      '<!----><div class="list"><!--arr start--><div>foo</div><div>bar</div><!--arr end--></div>'
    )
    S.list[0].flag = true
    expect(vm.el.innerHTML).toBe(
      '<div class="allTrue"></div><div class="list"><!--arr start--><div>foo</div><div>bar</div><!--arr end--></div>'
    )
    S.list[0].txt = 'hello'
    expect(vm.el.innerHTML).toBe(
      '<div class="allTrue"></div><div class="list"><!--arr start--><div>hello</div><div>bar</div><!--arr end--></div>'
    )
    S.list.push({ flag: false, txt: 'abc' })
    expect(vm.el.innerHTML).toBe(
      '<!----><div class="list"><!--arr start--><div>hello</div><div>bar</div><div>abc</div><!--arr end--></div>'
    )
    S.list[2].flag = true
    S.list[2].txt = 'cde'
    expect(vm.el.innerHTML).toBe(
      '<div class="allTrue"></div><div class="list"><!--arr start--><div>hello</div><div>bar</div><div>cde</div><!--arr end--></div>'
    )
  })

  it('array item level state function', () => {
    var S = useState({
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

    var vm = L(
      div.list(() =>
        S.list.map((item) => {
          count++
          return button({ type: 'button', onclick: () => (item.txt += 'o') }, item.txt)
        })
      )
    )

    expect(count).toBe(2)
    expect(vm.el.textContent).toBe('foobar')
    vm.el.children[0].children[0].click()
    expect(count).toBe(3)
    expect(vm.el.textContent).toBe('fooobar')
    S.list = [{ txt: 'aaa' }, { txt: 'bbb' }]
    expect(count).toBe(5)
    expect(vm.el.textContent).toBe('aaabbb')
  })

  it('array splice', () => {
    var S = useState({
        list: ['foo', 'bar'],
      }),
      count = 0

    var vm = L(
      S.list.map((item) => {
        count++
        return div(item + '; ')
      })
    )

    expect(vm.el.textContent).toBe('foo; bar; ')
    expect(count).toBe(2)

    S.list.splice(1, 0, 'hello')
    expect(vm.el.textContent).toBe('foo; hello; bar; ')
    expect(count).toBe(4) // to be improved

    S.list.splice(0, 2, 'hi')
    expect(vm.el.textContent).toBe('hi; bar; ')
    expect(count).toBe(6)
  })

  it('array splice with index', () => {
    var S = useState({
        list: ['foo', 'bar'],
      }),
      count = 0

    var vm = L(
      S.list.map((item, index) => {
        count++
        return div(index + ': ' + item + '; ')
      })
    )

    expect(vm.el.textContent).toBe('0: foo; 1: bar; ')
    expect(count).toBe(2)

    S.list.splice(1, 0, 'hello')
    expect(vm.el.textContent).toBe('0: foo; 1: hello; 2: bar; ')
    expect(count).toBe(4)

    S.list.splice(0, 2, 'hi')
    expect(vm.el.textContent).toBe('0: hi; 1: bar; ')
    expect(count).toBe(6)
  })
})
