var L = Lightue
var S = L.useState({
  curDemo: 1
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
    weekTitle: [{$$: '周', $_end: '日'}, '周一', '周二', '周三', '周四', '周五', {$$: '周', $_end: '六'}],
    months: L.for(13, function(i) {
      var month = new Date(y, m+i), monthLength = new Date(y, m+i+1, 0).getDate()
      return {
        name: month.getFullYear()+'年'+(month.getMonth()+1)+'月',
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

function showDemo(e) {
  S.curDemo = this.value
}

function DemoRadio(index, name, checked) {
  return {$tag: 'label',
    $$: {$tag: 'input', _type: 'radio',
      _name: 'demo',
      _value: index,
      _checked: checked ? 'checked' : null,
      onchange: showDemo,
  }, $$t: name}
}

var vm = L({
  selectDemo: [DemoRadio(1, 'DemoGrowingRect', true), DemoRadio(2, 'DemoDateRangeSelect')],
  demos: [{
    get _style() {return S.curDemo == 1 ? '' : 'display: none'},
    demoComp: DemoGrowingRect()
  }, {
    get _style() {return S.curDemo == 2 ? '' : 'display: none'},
    demoComp: DemoDateRangeSelect()
  }]
})