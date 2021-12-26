function Lightue(data, op = {}) {
  //assign a non-enumerable value
  function lightAssign(obj, key, val) {
    Object.defineProperty(obj, key, {
      value: val,
      enumerable: false,
      writable: true,
      configurable: true,
    })
  }

  function hyphenate(str) {
    return str.replace(/\B([A-Z])/g, '-$1').toLowerCase()
  }

  // elKey can be a custom setting function
  function mapDom(obj, key, el, elKey) {
    if (obj[key] == null) return
    var getter
    typeof obj[key] == 'function' && (getter = obj[key])
    function updateDom() {
      var v = getter ? getter() : obj[key]
      typeof elKey == 'function' ? elKey(el, v) : (el[elKey] = v)
    }
    if (getter) Lightue._dep = updateDom
    updateDom()
    if (getter) Lightue._dep = null
  }

  function isPrimitive(data) {
    return ['string', 'number'].indexOf(typeof data) > -1
  }

  // VDOM Node
  // grab ndata from parent to make it newest (avoid value assign)
  function Node(ndataParent, ndataKey, key) {
    ndataKey = String(ndataKey)
    var ndata = ndataParent[ndataKey],
      ndataValue = typeof ndata == 'function' ? ndata() : ndata
    if (isPrimitive(ndataValue) || Array.isArray(ndataValue) || ndataValue == null) ndata = { $$: ndata }
    else if (typeof ndata == 'function') ndata = ndataValue
    this.key = key || ''
    this.childArrEls = []
    this.childEls = {}
    this.tag = (ndata && ndata.$tag) || (ndataKey.slice(0, 2) == '$_' ? 'span' : 'div')
    this.el = document.createElement(this.tag)
    key && this.el.classList.add(key)
    this.texts = {}
    for (var i in ndata) {
      var o = ndata[i],
        oValue = o
      if (i.slice(0, 2) != 'on' && typeof o == 'function') oValue = o()
      if (i[0] == '$') {
        //lightue directives
        if (i.slice(0, 2) == '$$') {
          if (i == '$$' && Array.isArray(oValue)) {
            mapDom(ndata, i, this.el, (el, v) => {
              var tempFragment = document.createDocumentFragment(),
                newEls = []
              if (v.length)
                newEls = v.map((item, j) => {
                  var newNode = new Node(v, j, hyphenate(ndataKey) + '-item')
                  return tempFragment.appendChild(newNode.el)
                })
              else newEls.push(tempFragment.appendChild(document.createElement('span')))
              this.el.insertBefore(tempFragment, this.childArrEls[0])
              this.childArrEls.forEach((child) => child.remove())
              this.childArrEls = newEls
            })
          } else if (i == '$$' && typeof oValue == 'object') {
            this._addChild(o, oValue, ndata, i)
          } else if (isPrimitive(oValue)) {
            this.texts[i] = document.createTextNode(oValue)
            this.el.appendChild(this.texts[i])
            mapDom(ndata, i, this.texts[i], 'textContent')
          }
        } else if (i.slice(0, 2) == '$_') {
          //span element shortcut
          this.el.appendChild(new Node(ndata, i, hyphenate(i.slice(2))).el)
        } else if (i == '$class') {
          Object.keys(o).forEach((j) => {
            mapDom(o, j, this.el, function (el, v) {
              el.classList[v ? 'add' : 'remove'](hyphenate(j))
            })
          })
        }
      } else if (i[0] == '_') {
        ;((attr) => {
          mapDom(ndata, i, this.el, function (el, v) {
            v != null ? el.setAttribute(attr, v) : el.removeAttribute(attr)
          })
        })(hyphenate(i.slice(1)))
      } else if (i.slice(0, 2) == 'on') {
        ;((o) => {
          this.el.addEventListener(i.slice(2), (e) => {
            if (Array.isArray(o)) o[0].apply(this.el, [e].concat(o.slice(1)))
            else o.call(this.el, e)
          })
        })(o)
      } else {
        this._addChild(o, oValue, ndata, i, hyphenate(i))
      }
    }
  }

  Node.prototype._addChild = function (o, oValue, ndata, i, key) {
    if (typeof o == 'function' && typeof oValue == 'object')
      mapDom(ndata, i, this.el, (el, v) => {
        this.childEls[i] && this.childEls[i].remove()
        setTimeout(() => {
          this.childEls[i] = this.el.appendChild(new Node(ndata, i, key).el)
        })
      })
    else this.el.appendChild(new Node(ndata, i, key).el)
  }

  var root = new Node({ data: data }, 'data', 'root')
  document.querySelector(op.el || 'body').appendChild(root.el)
  return data
}

Lightue._dep = null

Lightue.useState = function (src) {
  var S = JSON.parse(JSON.stringify(src)),
    descs = {},
    deps = {}
  Object.keys(src).forEach(function (key) {
    deps[key] = []
    descs[key] = {
      get: function () {
        Lightue._dep && deps[key].push(Lightue._dep)
        return src[key]
      },
      set: function (v) {
        src[key] = v
        deps[key].forEach((dep) => dep())
      },
      enumerable: true,
      configurable: true,
    }
  })
  Object.defineProperties(S, descs)
  return S
}

//methods
Lightue.for = function (count, generateItem) {
  var arr = []
  for (var i = 0; i < count; i++) arr.push(generateItem ? generateItem(i) : '')
  return arr
}
;(function () {
  var htmlTags = ['div', 'span', 'form', 'label', 'input', 'select', 'img', 'button', 'table', 'tr', 'td']
  for (var i in htmlTags) {
    var o = htmlTags[i]
    Lightue[o] = (function (o) {
      return function (data) {
        if (typeof data == 'object') {
          data.$tag = o
          return data
        } else if (typeof data == 'undefined') return { $tag: o }
      }
    })(o)
  }
})()
