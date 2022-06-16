var L = Lightue
var S = L.useState({
  curDemo: 0,
})

function DemoGrowingRect() {
  var S = Lightue.useState({
    width: 20,
    height: 30,
  })
  var growWidth = setInterval(function () {
    S.width++
  }, 500)
  var growHeight = setInterval(function () {
    S.height++
  }, 800)
  return {
    $cleanup: () => {
      clearInterval(growWidth)
      clearInterval(growHeight)
    },
    $$: 'width and height are: ',
    result: () => S.width + ':' + S.height,
    rect: {
      _style: () => 'background-color: green; width: ' + S.width + 'px; height: ' + S.height + 'px',
    },
  }
}

function DemoDateRangeSelect() {
  var S = L.useState({
    selectStart: null,
    selectEnd: null,
  })
  function select(date) {
    if (S.selectStart && S.selectStart < date && S.selectEnd == null) S.selectEnd = date
    else {
      S.selectStart = date
      S.selectEnd = null
    }
  }
  function dateEquals(d1, d2) {
    if (d1 == null || d2 == null) return false
    return d1.getTime() == d2.getTime()
  }

  var today = new Date(),
    y = today.getFullYear(),
    m = today.getMonth()

  return {
    weekTitle: [
      { $$: 'Sunday', $_end: '*' },
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      { $$: 'Saterday', $_end: '*' },
    ],
    months: L.for(13, function (i) {
      var month = new Date(y, m + i),
        monthLength = new Date(y, m + i + 1, 0).getDate()
      return {
        name: month.getFullYear() + '/' + (month.getMonth() + 1),
        days: L.for(month.getDay()).concat(
          L.for(monthLength, function (j) {
            var d = new Date(y, m + i, j + 1)
            return {
              $class: {
                deepBlue: () => dateEquals(d, S.selectStart) || (S.selectEnd && dateEquals(d, S.selectEnd)),
                lightBlue: () => d > S.selectStart && S.selectEnd && d < S.selectEnd,
              },
              $$: j + 1,
              onclick: (e) => select(d),
            }
          })
        ),
      }
    }),
    selectedText: {
      $class: { hidden: () => S.selectEnd == null },
      $$: () =>
        S.selectEnd == null ? '' : S.selectStart.toLocaleDateString() + '~' + S.selectEnd.toLocaleDateString(),
    },
  }
}

function DemoSimplifyRatio() {
  var S = L.useState({
    w: '1',
    h: '1',
  })
  var vm = {
    inputs: {
      width: L.input({
        _type: 'number',
        oninput: (e) => (S.w = e.target.value),
        _value: () => S.w,
      }),
      $$: ':',
      height: L.input({
        _type: 'number',
        oninput: (e) => (S.h = e.target.value),
        _value: () => S.h,
      }),
    },
    result: {
      label: 'the ratio simplified is:',
      content: () => calcRatio(S.w, S.h),
    },
  }
  return vm

  // greatest common divider
  function getGCD(a, b) {
    if (a == '' || b == '') return null
    if (a == b) return a
    if (a < b) {
      var c = a
      a = b
      b = c
    }
    var r = a % b
    if (r == 0) return b
    else if (r == 1) return 1
    else return getGCD(b, r)
  }

  function calcRatio(a, b) {
    var gcd = getGCD(a, b)
    if (gcd) return a / gcd + ':' + b / gcd
    else return ''
  }
}

function DemoList() {
  var S = L.useState({
      list: [],
      newTitle: false,
    }),
    count = 0
  var changeList = setInterval(() => {
    count++
    S.newTitle = !S.newTitle
    if (S.newTitle) {
      S.list.push(Math.random())
    } else {
      var temp = []
      for (var i = 0; i < count; i++) {
        temp.push(Math.random())
      }
      S.list = temp
    }
  }, 3000)
  return {
    $cleanup: () => clearInterval(changeList),
    title: {
      $class: { newTitle: () => S.newTitle, oldTitle: () => !S.newTitle },
      content: () => (S.newTitle ? 'item pushed' : 'list changed'),
    },
    theList: {
      beforeList: () => 'The list starts with length: ' + S.list.length,
      $$: () => S.list.map((num) => ({ randomNum: num })),
      afterList: 'The list ends',
    },
  }
}

function DemoForm() {
  var S = L.useState({
    formData: {
      name: 'ABC',
      description: "I'm new to Lightue!\nHow about you?",
      workDone: true,
      group: 'groupA',
    },
  })
  return {
    demoForm: L.form({
      $$: [
        L.label({
          $_: 'name: ',
          $$: L.input({
            _type: 'text',
            $value: () => S.formData.name,
            oninput: (e) => (S.formData.name = e.target.value),
          }),
        }),
        L.label({
          $_: 'description: ',
          $$: {
            $tag: 'textarea',
            $value: () => S.formData.description,
            oninput: (e) => (S.formData.description = e.target.value),
          },
        }),
        L.label({
          $_: 'work done? ',
          $$: L.input({
            _type: 'checkbox',
            $checked: () => S.formData.workDone,
            onchange: (e) => (S.formData.workDone = e.target.checked),
          }),
        }),
        L.label({
          $_: 'group: ',
          $$: L.select({
            $$: ['', 'groupA', 'groupB', 'groupC', 'groupD'].map((op) =>
              L.option({
                _value: op,
                $$: op,
              })
            ),
            $value: () => S.formData.group,
            onchange: (e) => (S.formData.group = e.target.value),
          }),
        }),
      ],
      result: () => JSON.stringify(S.formData),
    }),
  }
}

function DemoComp() {
  var S = L.useState({
    aaa: 123,
    bbb: {
      ccc: '345',
    },
  })

  function Btn(props, onclick) {
    var P = L.useProp(props)
    return {
      desc: () => 'component received param text: ' + P.text,
      btn: L.button({
        _type: 'button',
        $$: P.$text,
        onclick: onclick,
      }),
    }
  }

  return {
    states: {
      $$: 'parent states:',
      aaa: () => 'aaa: ' + S.aaa,
      bbbccc: () => 'bbb.ccc: ' + S.bbb.ccc,
    },
    btn1: Btn(
      () => ({ text: S.aaa }),
      () => (S.aaa += 4)
    ),
    btn2: Btn(
      () => ({ text: S.bbb.ccc }),
      () => (S.bbb.ccc += 5)
    ),
  }
}

function showDemo(e) {
  S.curDemo = this.value
}

function DemoRadio(index, name, checked) {
  return {
    $tag: 'label',
    $class: {
      current: () => S.curDemo == index,
    },
    demoRadio: L.input({
      _type: 'radio',
      _name: 'demo',
      _value: index,
      _checked: checked ? 'checked' : null,
      onchange: showDemo,
    }),
    $$t: name,
  }
}

var demos = [DemoComp, DemoGrowingRect, DemoDateRangeSelect, DemoSimplifyRatio, DemoList, DemoForm]

var vm = L({
  selectDemo: demos.map(function (demo, i) {
    return DemoRadio(i, demo.name, i == 0)
  }),
  demosGround: {
    demosGroundItem: () => demos[S.curDemo](),
  },
})
