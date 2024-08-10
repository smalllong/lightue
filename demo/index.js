var L = Lightue,
  { div, span, label, input, form, textarea, select, option } = L
var S = L.useState({
  curDemo: 0,
})

function DemoComp() {
  var S = L.useState({
    aaa: 123,
    bbb: {
      ccc: '345',
    },
  })

  function Btn(props, onclick) {
    var P = L.useProp(props)
    return div(
      div.desc(() => 'component received param text: ' + P.text),
      L.button.btn(
        {
          _type: 'button',
          onclick,
        },
        P.$text
      )
    )
  }

  return div(
    div.states(
      'parent states:',
      div.aaa(() => 'aaa: ' + S.aaa),
      div.bbbccc(() => 'bbb.ccc: ' + S.bbb.ccc)
    ),
    Btn(
      () => ({ text: S.aaa }),
      () => (S.aaa += 4)
    ),
    Btn(
      () => ({ text: S.bbb.ccc }),
      () => (S.bbb.ccc += 5)
    )
  )
}

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
  return div(
    {
      $cleanup: () => {
        clearInterval(growWidth)
        clearInterval(growHeight)
      },
    },
    'width and height are: ',
    div.result(() => S.width + ':' + S.height),
    div.rect({
      style: () => 'background-color: green; width: ' + S.width + 'px; height: ' + S.height + 'px',
    })
  )
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

  return div(
    div.weekTitle(
      div('Sunday', span.end('*')),
      div('Monday'),
      div('Tuesday'),
      div('Wednesday'),
      div('Thursday'),
      div('Friday'),
      div('Saterday', span.end('*'))
    ),
    div.months(
      ...L.for(13, function (i) {
        var month = new Date(y, m + i),
          monthLength = new Date(y, m + i + 1, 0).getDate()
        return div(
          div.name(month.getFullYear() + '/' + (month.getMonth() + 1)),
          div.days(
            ...L.for(month.getDay()).concat(
              L.for(monthLength, function (j) {
                var d = new Date(y, m + i, j + 1)
                return div(
                  {
                    $class: {
                      deepBlue: () => dateEquals(d, S.selectStart) || (S.selectEnd && dateEquals(d, S.selectEnd)),
                      lightBlue: () => d > S.selectStart && S.selectEnd && d < S.selectEnd,
                    },
                    onclick: (e) => select(d),
                  },
                  j + 1
                )
              })
            )
          )
        )
      })
    ),
    div.selectedText({ $class: { hidden: () => S.selectEnd == null } }, () =>
      S.selectEnd == null ? '' : S.selectStart.toLocaleDateString() + '~' + S.selectEnd.toLocaleDateString()
    )
  )
}

function DemoSimplifyRatio() {
  var S = L.useState({
    w: '1',
    h: '1',
  })
  return div(
    div.inputs(
      input.width({ type: 'number', value: () => S.w, oninput: (e) => (S.w = e.target.value) }),
      ':',
      input.height({ type: 'number', value: () => S.h, oninput: (e) => (S.h = e.target.value) })
    ),
    div.result(
      div.label('the ratio simplified is:'),
      div.content(() => calcRatio(S.w, S.h))
    )
  )

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
      action: 'change',
      newTitle: false,
      count: 0,
    }),
    count = 0
  var changeList = setInterval(() => {
    count++
    S.newTitle = !S.newTitle
    if (S.action == 'push') {
      S.action = 'splice'
      S.list.splice(2, 2, 1)
    } else if (S.action == 'change') {
      S.action = 'push'
      S.list.push(Math.random())
    } else {
      var temp = []
      for (var i = 0; i < count; i++) {
        temp.push(Math.random())
      }
      S.list = temp
      S.action = 'change'
    }
  }, 2500)
  return div(
    {
      $cleanup: () => clearInterval(changeList),
    },
    div.title(
      {
        $class: { newTitle: () => S.newTitle },
      },
      div.content(() => 'List ' + S.action + 'd')
    ),
    div.theList(
      div.beforeList(() => 'The list starts with length: ' + S.list.length),
      () => S.list.map((num) => div.randomNum(num)),
      div.afterList('The list ends')
    )
  )
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
  return form.demoForm(
    label(
      'name: ',
      input({ type: 'text', $value: () => S.formData.name, oninput: (e) => (S.formData.name = e.target.value) })
    ),
    label(
      'description: ',
      textarea({ $value: () => S.formData.description, oninput: (e) => (S.formData.description = e.target.value) })
    ),
    label(
      'work done? ',
      input({
        type: 'checkbox',
        $checked: () => S.formData.workDone,
        onchange: (e) => (S.formData.workDone = e.target.checked),
      })
    ),
    label('group: ', select({ $value: () => S.formData.group, onchange: (e) => (S.formData.group = e.target.value) }, ...['', 'groupA', 'groupB', 'groupC', 'groupD'].map((op) =>
      option({
        value: op,
      }, op)
    ))),
    div.result(() => JSON.stringify(S.formData))
  )
}

function showDemo(e) {
  S.curDemo = this.value
}

function DemoRadio(index, name, checked) {
  return label(
    {
      $class: {
        current: () => S.curDemo == index,
      },
    },
    input.demoRadio({
      type: 'radio',
      name: 'demo',
      value: index,
      checked: checked ? 'checked' : null,
      onchange: showDemo,
    }),
    name
  )
}

var demos = [DemoComp, DemoGrowingRect, DemoDateRangeSelect, DemoSimplifyRatio, DemoList, DemoForm]

var vm = L(
  div.selectDemo(
    ...demos.map(function (demo, i) {
      return DemoRadio(i, demo.name, i == 0)
    })
  ),
  div.demosGround(div(() => demos[S.curDemo]()))
)
