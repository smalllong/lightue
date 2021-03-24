var L = Lightue
var S = L.useState({
  curDemo: 0
})

function DemoGrowingRect() {
  var S = Lightue.useState({
    width: 20,
    height: 30
  })
  setInterval(function() {
    S.width ++
  }, 500)
  setInterval(function() {
      S.height ++
  }, 800)
  return {
      $$: 'width and height are: ',
      get result() {return S.width + ':' + S.height},
      rect: {
          get _style() {return 'background-color: green; width: '+S.width+'px; height: '+S.height+'px'},
      }
  }
}

function DemoDateRangeSelect() {
  var S = L.useState({
    selectStart: null, 
    selectEnd: null,
  })
  function select(e, date) {
    if (S.selectStart && S.selectStart < date && S.selectEnd == null)
      S.selectEnd = date
    else {
      S.selectStart = date
      S.selectEnd = null
    }
  }
  function dateEquals(d1, d2) {
    if (d1 == null || d2 == null) return false
    return d1.getTime() == d2.getTime()
  }

  var today = new Date(), y = today.getFullYear(), m = today.getMonth()

  return {
    weekTitle: [{$$: 'Sunday', $_end: '*'}, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', {$$: 'Saterday', $_end: '*'}],
    months: L.for(13, function(i) {
      var month = new Date(y, m+i), monthLength = new Date(y, m+i+1, 0).getDate()
      return {
        name: month.getFullYear()+'/'+(month.getMonth()+1),
        days: L.for(month.getDay()).concat(L.for(monthLength, function(j) {
          var d = new Date(y, m+i, j+1)
          return {
            $class: {
              get deepBlue() {return dateEquals(d, S.selectStart) || S.selectEnd && dateEquals(d, S.selectEnd)},
              get lightBlue() {return d > S.selectStart && S.selectEnd && d < S.selectEnd}
            },
            $$: j+1,
            onclick: [select, d],
          }
        })),
      }
    }),
    selectedText: {
      $class: {get hidden() {return S.selectEnd == null}},
      get $$() {return S.selectEnd == null ? '' : S.selectStart.toLocaleDateString() + '~' + S.selectEnd.toLocaleDateString()},
    },
  }
}

function DemoSimplifyRatio() {
  var vm = {
    inputs: {
      width: {
        $tag: 'input',
        _type: 'number',
        oninput: showRatio,
      },
      $$: ':',
      height: {
        $tag: 'input',
        _type: 'number',
        oninput: showRatio,
      },
    },
    result: {
      label: 'the ratio simplified is:',
      content: '',
    }
  }
  return vm
  
  function getGCD(a, b) { // greatest common divider
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
    if (gcd) return a/gcd + ':' + b/gcd
    else return ''
  }
  
  function showRatio() {
    vm.result.content = calcRatio(vm.inputs.width.$value, vm.inputs.height.$value)
  }
}

function showDemo(e) {
  S.curDemo = this.value
}

function DemoRadio(index, name, checked) {
  return {$tag: 'label',
    $class: {
      get current() {return S.curDemo == index}
    },
    $$: {$tag: 'input', _type: 'radio',
      _name: 'demo',
      _value: index,
      _checked: checked ? 'checked' : null,
      onchange: showDemo,
  }, $$t: name}
}

var demos = [DemoGrowingRect, DemoDateRangeSelect, DemoSimplifyRatio]

var vm = L({
  selectDemo: demos.map(function(demo, i) {return DemoRadio(i, demo.name, i==0)}),
  demosGround: demos.map(function(demo, i) {
    return {
      get _style() {return S.curDemo == i ? '' : 'display: none'},
      $$: demo()
    }
  })
})