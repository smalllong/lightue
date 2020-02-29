var L = Lightue
function select(e, date) {
  if (selectStart && selectStart < date && selectEnd == null)
    selectEnd = date
  else {
    selectStart = date
    selectEnd = null
  }
  vm.$render()
}
function dateEquals(d1, d2) {
  if (d1 == null || d2 == null) return false
  return d1.getTime() == d2.getTime()
}

var today = new Date(), y = today.getFullYear(), m = today.getMonth(), selectStart, selectEnd

var vm = L({
  weekTitle: [{$$: '周', $_end: '日'}, '周一', '周二', '周三', '周四', '周五', {$$: '周', $_end: '六'}],
  months: L.for(13, function(i) {
    var month = new Date(y, m+i), monthLength = new Date(y, m+i+1, 0).getDate()
    return {
      name: month.getFullYear()+'年'+(month.getMonth()+1)+'月',
      days: L.for(month.getDay()).concat(L.for(monthLength, function(j) {
        var d = new Date(y, m+i, j+1)
        return {
          $class: {
            get deepBlue() {return dateEquals(d, selectStart) || selectEnd && dateEquals(d, selectEnd)},
            get lightBlue() {return d > selectStart && selectEnd && d < selectEnd}
          },
          $$: j+1,
          onclick: [select, d],
        }
      })),
    }
  }),
  selectedText: {
    $class: {get hidden() {return selectEnd == null}},
    get $$() {return selectEnd == null ? '' : selectStart.toLocaleDateString() + '~' + selectEnd.toLocaleDateString()},
  },
})