SGlobal = useState
  curDemo: 0

DemoComp = =>
  S = useState
    aaa: 123
    bbb:
      ccc: '345'

  Btn = (props, onclick) =>
    P = useProp props
    div {},
      div.desc => "component received param text: " + P.text
      button.btn
        _type: 'button'
        onclick: onclick
        P.$text

  div {},
    div.states 'parent states:',
      div style: 'margin-left: 20px', => JSON.stringify S
    Btn (-> {text: S.aaa}),
      -> S.aaa += 4
    Btn (-> {text: S.bbb.ccc}),
      -> S.bbb.ccc += 5

DemoGrowingRect = =>
  S = useState
    width: 20
    height: 30
  
  growWidth = setInterval =>
    S.width++
  , 500
  
  growHeight = setInterval =>
    S.height++
  , 800
  
  div
    $cleanup: =>
      clearInterval growWidth
      clearInterval growHeight
    'width and height are: '
    div.result => "#{S.width}:#{S.height}"
    div.rect
      style: => "background-color: green; width: #{S.width}px; height: #{S.height}px"

DemoDateRangeSelect = =>
  S = useState
    selectStart: null
    selectEnd: null
  
  selectDate = (date) =>
    if S.selectStart and S.selectStart < date and S.selectEnd == null
      S.selectEnd = date
    else
      S.selectStart = date
      S.selectEnd = null
  
  dateEquals = (d1, d2) =>
    if d1 == null or d2 == null
      false
    else
      d1.getTime() == d2.getTime()

  today = new Date()
  y = today.getFullYear()
  m = today.getMonth()

  div {},
    div.weekTitle {},
      div('Sunday', span.end '*')
      div 'Monday'
      div 'Tuesday'
      div 'Wednesday'
      div 'Thursday'
      div 'Friday'
      div 'Saterday', span.end '*'
    div.months (for i in [0...13]
        month = new Date y, m + i
        monthLength = new Date(y, m + i + 1, 0).getDate()
        div div.name "#{month.getFullYear()}/#{month.getMonth() + 1}",
          div.days {},
            (for j in [0...month.getDay()]
              div()
            ).concat(
              for j in [0...monthLength]
                do (d = new Date y, m + i, j + 1) =>
                  div
                    $class:
                      deepBlue: => dateEquals(d, S.selectStart) or (S.selectEnd and dateEquals(d, S.selectEnd))
                      lightBlue: => d > S.selectStart and S.selectEnd and d < S.selectEnd
                    onclick: (e) => selectDate d
                  , j + 1
            )
      ),
    div.selectedText
      $class: hidden: => S.selectEnd == null
    , =>
      if S.selectEnd == null
        ''
      else
        "#{S.selectStart.toLocaleDateString()}~#{S.selectEnd.toLocaleDateString()}"

DemoSimplifyRatio = =>
  S = useState
    w: '1'
    h: '1'
  calcRatio = (a, b) =>
    gcd = getGCD a, b
    if gcd
      "#{a / gcd}:#{b / gcd}"
    else
      ''
  # greatest common divider
  getGCD = (a, b) =>
    if a == '' or b == ''
      null
    else if a == b
      a
    else
      if a < b
        c = a
        a = b
        b = c
      r = a % b
      if r == 0
        b
      else if r == 1
        1
      else
        getGCD b, r
  
  div {},
    div.inputs {},
      input.width
        type: 'number'
        value: => S.w
        oninput: (e) => S.w = e.target.value
      ':'
      input.height
        type: 'number'
        value: => S.h
        oninput: (e) => S.h = e.target.value
    div.result
      div.label 'the ratio simplified is:'
      div.content => calcRatio S.w, S.h

DemoList = =>
  S = useState
    list: []
    action: 'change'
    newTitle: false
    count: 0
  
  count = 0
  
  changeList = setInterval =>
    count++
    S.newTitle = !S.newTitle
    if S.action == 'push'
      S.action = 'splice'
      S.list.splice 2, 2, 'spliced item'
    else if S.action == 'change'
      S.action = 'push'
      S.list.push Math.random()
    else
      temp = []
      for i in [0...count]
        temp.push Math.random()
      S.list = temp
      S.action = 'change'
  , 2500
  
  div
    $cleanup: => clearInterval changeList
    div.title
      $class: newTitle: => S.newTitle
    , div.content => "List #{S.action}d"
    div.theList
      div.beforeList => "The list starts with length: #{S.list.length}"
      => S.list.map (num) => div.randomNum num
      div.afterList 'The list ends'

DemoForm = =>
  S = useState
    formData:
      name: 'ABC'
      description: "I'm new to Lightue!\nHow about you?"
      workDone: true
      group: 'groupA'
  
  form.demoForm {},
    label {},
      'name: '
      input
        type: 'text'
        $value: => S.formData.name
        oninput: (e) => S.formData.name = e.target.value
    label {},
      'description: '
      textarea
        $value: => S.formData.description
        oninput: (e) => S.formData.description = e.target.value
    label {},
      'work done? '
      input
        type: 'checkbox'
        $checked: => S.formData.workDone
        onchange: (e) => S.formData.workDone = e.target.checked
    label {},
      'group: '
      select
        $value: => S.formData.group
        onchange: (e) => S.formData.group = e.target.value
      , ['', 'groupA', 'groupB', 'groupC', 'groupD'].map (op) =>
        option
          value: op
        , op
    div.result => JSON.stringify S.formData

showDemo = (e) ->
  SGlobal.curDemo = Number @value

DemoRadio = (index, name, checked) =>
  label
    $class:
      current: =>
        SGlobal.curDemo == index
    input.demoRadio
      type: 'radio'
      name: 'demo'
      value: index
      checked: if checked then 'checked' else null
      onchange: showDemo
    name

demos = [DemoComp, DemoGrowingRect, DemoDateRangeSelect, DemoSimplifyRatio, DemoList, DemoForm]

L(
  div.selectDemo {},
    demos.map (demo, i) =>
      DemoRadio i, demo.name, i == 0
  div.demosGround {},
    div => demos[SGlobal.curDemo]()
)
