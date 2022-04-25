var Lightue = (function() {

var _dep = null, _arrToNode = new WeakMap(),
  _rendering = false // executing user render function

function Lightue(data, op = {}) {
  var root = new Node({ data: data }, 'data', 'root')
  document.querySelector(op.el || 'body').appendChild(root.el)
  return data
}
Lightue._abortDep = false  // user can abort dependent update

function hyphenate(str) {
  return str.replace(/\B([A-Z])/g, '-$1').toLowerCase()
}

// elKey can be a custom setting function
function mapDom(obj, key, el, elKey) {
  if (obj[key] == null) return
  var getter
  typeof obj[key] == 'function' && (getter = obj[key])
  function updateDom(regather) {
    if (regather && getter) _dep = updateDom
    _rendering = true
    var v = getter ? getter() : obj[key]
    _rendering = false
    typeof elKey == 'function' ? elKey(el, v) : (el[elKey] = v)
    if (regather && getter) _dep = null
  }
  updateDom(true)
}

function isPrimitive(data) {
  return ['string', 'number'].indexOf(typeof data) > -1
}
function isObj(data) {
  return typeof data == 'object' && data != null
}

//assign a non-enumerable value
function lightAssign(obj, key, val) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: false,
    writable: true,
    configurable: true,
  })
}

function extendFunc(original, coming, initial) {
  if (typeof original == 'function') {
    return function(...args) {
      original.call(this, ...args)
      coming.call(this, ...args)
    }
  } else return function(...args) {
    initial && initial.call(this, ...args)
    coming.call(this, ...args)
  }
}

function getLast(arr) {
  return arr[arr.length-1]
}

function insertAfter(newNode, node) {
  node.parentNode.insertBefore(newNode, node.nextSibling)
}

// VDOM Node
// grab ndata from parent to make it newest (avoid value assign)
function Node(ndataParent, ndataKey, key) {
  this.ndataKey = ndataKey = String(ndataKey)
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
  this.el.VNode = this
  for (var i in ndata) {
    var o = ndata[i],
      oValue = o
    if (i.slice(0, 2) != 'on' && typeof o == 'function') oValue = o()
    if (i[0] == '$') {
      //lightue directives
      if (i.slice(0, 2) == '$$') {
        if (i == '$$' && Array.isArray(oValue)) {
          this.arrStart = new Comment('arr start')
          this.arrEnd = new Comment('arr end')
          this.el.appendChild(this.arrStart)
          this.el.appendChild(this.arrEnd)
          mapDom(ndata, i, this.el, (el, v) => {
            var tempFragment = document.createDocumentFragment(),
              newEls = []
            if (Array.isArray(v)) {
              if (v.$mappedFrom) _arrToNode.set(v.$mappedFrom, this)
              newEls = v.map((item, j) => {
                var newNode = new Node(v, j, hyphenate(ndataKey) + '-item')
                return tempFragment.appendChild(newNode.el)
              })
            }
            else newEls.push(tempFragment.appendChild(document.createElement('span')))
            this.el.insertBefore(tempFragment, this.arrEnd)
            this.childArrEls.forEach((child) => child.remove())
            this.childArrEls = newEls
          })
        } else if (i == '$$' && isObj(oValue)) {
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
  if (typeof o == 'function' && isObj(oValue))
    mapDom(ndata, i, this.el, (el, v) => {
      this.childEls[i] && this.childEls[i].remove()
      setTimeout(() => {
        this.childEls[i] = this.el.appendChild(new Node(ndata, i, key).el)
      })
    })
  else this.el.appendChild(new Node(ndata, i, key).el)
}

Lightue.useState = function (src) {
  if (!isObj(src) || src._ls) return src
  var deps = {}, subStates = {}, depItem, hash = Math.random()
  function set(src, key, value) {
    var regather = false  // is it needed to regather deps
    if (value && value._ls) {  // already a state, just use
      src[key] = value._target
      subStates[key] = value
    } else {  // create new state & cache
      src[key] = value
      if (isObj(value)) {
        subStates[key] = Lightue.useState(value)
        regather = true
      } else {
        delete subStates[key]
      }
    }
    if (!Lightue._abortDep) {
      deps[key] && deps[key].forEach((dep) => dep(regather))
      if (Array.isArray(src)) {
        key = parseInt(key)
        key >=0 && depItem && depItem(value, key)
      }
    }
    return true
  }
  if (Array.isArray(src))
    return new Proxy(src, {
      get: function(src, key) {
        if (key == '_ls') return true
        if (key == '_target') return src

        // When array's 'map' is used to render list, trap it
        if (key=='map' && _rendering) {
          return function(callback) {
            var result = src.map((item, i) => {
              if (isObj(item))
                subStates[i] = subStates[i] || Lightue.useState(item)
              return callback(subStates[i] || item, i)
            })
            result.$mappedFrom = src
            depItem = extendFunc(depItem, (item, i) => {
              if (isObj(item)) {
                subStates[i] = Lightue.useState(item)
              }
              var node = _arrToNode.get(src),
                newDomSrc,
                wrapper = {}
              _rendering = true
              newDomSrc = callback(subStates[i] || item, i)
              _rendering = false
              wrapper[i] = newDomSrc
              var newNode = new Node(wrapper, i, hyphenate(node.ndataKey) + '-item')
              node.el.insertBefore(newNode.el, node.childArrEls[i] || node.arrEnd )
              node.childArrEls[i] && node.childArrEls[i].remove()
              node.childArrEls.splice(i, 1, newNode.el)
            })
            return result
          }
        }

        if (src[key] != null && !src.hasOwnProperty(key)) return src[key]
        if (!deps[key]) deps[key] = new Set()
        _dep && deps[key].add(_dep)
        var result = src[key]
        if (isObj(result))
          subStates[key] = subStates[key] || Lightue.useState(result)

        return subStates[key] || result
      },
      set: set,
    })
  return new Proxy(src, {
    get: function(src, key) {
      if (key == '_ls') return true
      if (key == '_target') return src
      if (src[key] != null && !src.hasOwnProperty(key)) {
        if (typeof src[key] == 'function') return src[key].bind(src)
        return src[key]
      }
      if (!deps[key]) deps[key] = new Set()
      _dep && deps[key].add(_dep)
      var result = src[key]
      if (isObj(result))
        subStates[key] = subStates[key] || Lightue.useState(result)
      return subStates[key] || result
    },
    set: set,
  })
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

return Lightue
})()
