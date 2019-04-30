function select(e) {
  if (selectStart && selectStart < e.$argus[0] && selectEnd == null)
    selectEnd = e.$argus[0]
  else {
    selectStart = e.$argus[0]
    selectEnd = null
  }
  vm.$render()
}

function createArr(length) {
  var res = []
  for (var i=0; i<length; i++) {
    res.push('')
  }
  return res
}
function dateEquals(d1, d2) {
  if (d1 == null || d2 == null) return false
  return d1.getTime() == d2.getTime()
}
function fillDate(date) {
  return ('0'+date).slice(-2)
}
//simple date format
function format(d, s) {
  return s.replace('YYYY', d.getFullYear()).replace('MM', this.fillDate(d.getMonth()+1))
}

var today = new Date(), y = today.getFullYear(), m = today.getMonth(), selectStart, selectEnd

var vm = Lightue({
  weekTitle: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  months: createArr(13).map((e, i) => {
    var month = new Date(y, m+i), monthLength = new Date(y, m+i+1, 0).getDate()
    return {
      name: format(month, 'YYYY年MM月'),
      days: createArr(month.getDay()).concat(createArr(monthLength).map((e, j) => {
        var d = new Date(y, m+i, j+1)
        return {
          $class: {
            get deepBlue() {return dateEquals(d, selectStart) || selectEnd && dateEquals(d, selectEnd)},
            get lightBlue() {return d > selectStart && selectEnd && d < selectEnd}
          },
          $inner: fillDate(j+1),
          onclick: [select, d],
        }
      })),
    }
  }),
  selectedText: {
    $class: {get hidden() {return selectEnd == null}},
    get $inner() {return selectEnd == null ? '' : selectStart.toLocaleDateString() + '~' + selectEnd.toLocaleDateString()},
  },
})