var _dep = null,
  _rendering = false // executing user render function

function Lightue(data, op = {}) {
  var vm = new Node({ root: data }, 'root', 'root', document.querySelector(op.el || 'body')),
    toFocus = vm.el.querySelector('[autofocus]')
  toFocus && toFocus.focus()
  return vm
}
Lightue._abortDep = false // user can abort dependent update

function hyphenate(str) {
  return str.replace(/\B([A-Z])/g, '-$1').toLowerCase()
}

// elKey can be a custom setting function
function mapDom(obj, key, el, elKey) {
  var getter
  typeof obj[key] == 'function' && (getter = obj[key])
  function updateDom(regather) {
    if (regather && getter) _dep = updateDom
    _rendering = true
    var v = getter ? getter() : obj[key]
    _rendering = false
    if (regather && getter) _dep = null
    typeof elKey == 'function' ? elKey(el, v) : (el[elKey] = v)
  }
  updateDom(true)
}

function isPrimitive(data) {
  return ['string', 'number'].indexOf(typeof data) > -1
}
function isObj(data) {
  return typeof data == 'object' && data != null
}

function assignObj(target, obj) {
  for (var i in obj) target[i] = obj[i]
}

function safeRemove(el) {
  if (!el) return
  el.VNode && el.VNode.cleanup && el.VNode.cleanup()
  el.remove()
}

// VDOM Node
// grab ndata from parent to make it newest (avoid value assign)
function Node(ndataParent, ndataKey, key, appendToEl, ndataValue, originalEl) {
  this.ndataKey = ndataKey = String(ndataKey)
  var ndata = ndataParent[ndataKey],
    $$cache
  ndataValue = ndataValue || (typeof ndata == 'function' ? ndata() : ndata)
  if (isPrimitive(ndataValue) || Array.isArray(ndataValue) || ndataValue == null) {
    ndata = { $$: ndata }
    $$cache = ndataValue
  } else if (typeof ndata == 'function') ndata = ndataValue
  this.key = key || ''
  this.childArrEls = []
  this.childEls = {}
  this.tag = (ndata && ndata.$tag) || (ndataKey.slice(0, 2) == '$_' ? 'span' : 'div')
  this.el = document.createElement(this.tag)
  if (originalEl && originalEl.parentNode) {
    originalEl.parentNode.insertBefore(this.el, originalEl)
    safeRemove(originalEl)
  } else appendToEl && appendToEl.appendChild(this.el)
  key && this.el.classList.add(key)
  this.texts = {}
  this.el.VNode = this
  for (var i in ndata) {
    var o = ndata[i]
    // skip handle null and undefined, but for boolean properties, treat them falsy
    if (i != '$if' && i != '$checked' && o == null) continue
    if (i[0] == '$') {
      //lightue directives
      if (i.slice(0, 2) == '$$') {
        var _depStashed = _dep
        _dep = null // avoid gather deps when getting oValue
        var oValue = $$cache || (typeof o == 'function' ? o() : o)
        _dep = _depStashed
        if (i == '$$' && Array.isArray(oValue)) {
          this.arrStart = new Comment('arr start')
          this.arrEnd = new Comment('arr end')
          this.el.appendChild(this.arrStart)
          this.el.appendChild(this.arrEnd)
          mapDom(ndata, i, this.el, (el, v) => {
            var tempFragment = document.createDocumentFragment(),
              newEls = []
            if (Array.isArray(v)) {
              if (v._ls) v._depNodes.push([this, v, (a) => a])
              if (v._mappedFrom) v._mappedFrom[0].push([this, ...v._mappedFrom.slice(1)])
              newEls = v.map((item, j) => {
                return new Node(v, j, hyphenate(ndataKey) + '-item', tempFragment).el
              })
            } else newEls.push(tempFragment.appendChild(document.createElement('span')))
            this.el.insertBefore(tempFragment, this.arrEnd)
            this.childArrEls.forEach(safeRemove)
            this.childArrEls = newEls
          })
        } else if (isObj(oValue)) {
          this._addChild(o, ndata, i)
        } else if (isPrimitive(oValue)) {
          this.texts[i] = document.createTextNode(oValue)
          this.el.appendChild(this.texts[i])
          mapDom(ndata, i, this.texts[i], 'textContent')
        }
      } else if (i.slice(0, 2) == '$_') {
        //span element shortcut
        this._addChild(o, ndata, i, hyphenate(i.slice(2)))
      } else if (i == '$if') {
        // conditionally switch between elem and its placeholder
        mapDom(ndata, i, this.el, (el, v) => {
          if (!this.placeholder) this.placeholder = new Comment(key)
          if (v && this.isStashed) {
            this.placeholder.parentNode.insertBefore(this.el, this.placeholder)
            this.placeholder.remove()
            this.isStashed = false
          } else if (!v && !this.isStashed) {
            this.el.parentNode.insertBefore(this.placeholder, this.el)
            this.el.remove()
            this.isStashed = true
          }
        })
      } else if (i == '$class') {
        Object.keys(o).forEach((j) => {
          mapDom(o, j, this.el, function (el, v) {
            el.classList[v ? 'add' : 'remove'](hyphenate(j))
          })
        })
      } else if (i == '$value' && ['input', 'textarea', 'select'].indexOf(this.tag) > -1)
        mapDom(ndata, '$value', this.el, 'value')
      else if (i == '$checked' && this.tag == 'input') mapDom(ndata, '$checked', this.el, 'checked')
      else if (i == '$cleanup') this.cleanup = o
    } else if (i[0] == '_') {
      ;((attr) => {
        mapDom(ndata, i, this.el, function (el, v) {
          v != null && v !== false ? el.setAttribute(attr, v) : el.removeAttribute(attr)
        })
      })(hyphenate(i.slice(1)))
    } else if (i.slice(0, 2) == 'on') this.el.addEventListener(i.slice(2), o)
    else this._addChild(o, ndata, i, hyphenate(i))
  }
}

Node.prototype._addChild = function (o, ndata, i, key) {
  if (typeof o == 'function')
    mapDom(ndata, i, this.el, (el, v) => {
      // only create new VNode when first render or obj rerender
      if (!this.childEls[i] || isObj(v)) this.childEls[i] = new Node(ndata, i, key, this.el, v, this.childEls[i]).el
    })
  else new Node(ndata, i, key, this.el)
}

function useState(src, depProxy) {
  if (!isObj(src) || src._ls) return src
  var deps = depProxy._deps, // get deps from dep proxy tree
    subStates = Array.isArray(src) ? [] : {},
    depNodes = []
  return new Proxy(src, {
    get: function (src, key) {
      if (key == '_ls') return true
      if (key == '_target') return src
      if (key == '_depNodes') return depNodes
      if (typeof key == 'string' && key[0] == '$') {
        var result = () => this.get(src, key.slice(1))
        result.toString = result
        return result
      }

      // When array's 'map' is used to render list, trap it
      if (Array.isArray(src) && key == 'map' && _rendering) {
        return function (callback) {
          var result = src.map((item, i) => {
            if (isObj(item)) subStates[i] = subStates[i] || useState(item, depProxy[i])
            return callback(subStates[i] || item, i)
          })
          result._mappedFrom = [depNodes, src, callback]
          return result
        }
      }

      // prototype methods or array's length, reimplement or return src's
      if (src[key] != null && !src.hasOwnProperty(key)) {
        // reimplement splice
        if (Array.isArray(src) && key == 'splice')
          return (index, remove, ...insert) => {
            var oldLength = src.length
            src.splice(index, remove, ...insert)
            subStates.splice(index, remove, ...new Array(insert.length))
            var newLength = src.length
            for (var arr of depNodes) {
              var node = arr[0],
                cb = arr[2],
                newElsFragment = new DocumentFragment()
              for (var i = 0; i < remove; i++) safeRemove(node.childArrEls[index + i])
              var newEls = insert.map((item, i) => {
                var curIndex = index + i
                if (isObj(item)) subStates[curIndex] = useState(item, depProxy[curIndex])
                function updateDom(regather, skip) {
                  regather && (_dep = updateDom)
                  var newDomSrc = cb(subStates[curIndex] || item, curIndex),
                    wrapper = {}
                  regather && (_dep = null)
                  wrapper[curIndex] = newDomSrc
                  var newNode = new Node(wrapper, curIndex, hyphenate(node.ndataKey) + '-item')
                  if (skip) return newNode.el
                  else {
                    node.el.insertBefore(newNode.el, node.childArrEls[curIndex] || node.arrEnd)
                    node.childArrEls[curIndex] && safeRemove(node.childArrEls[curIndex])
                    node.childArrEls.splice(curIndex, 1, newNode.el)
                  }
                }
                var newEl = updateDom(true, true)
                newElsFragment.appendChild(newEl)
                return newEl
              })
              node.el.insertBefore(newElsFragment, node.childArrEls[index + remove] || node.arrEnd)
              node.childArrEls.splice(index, remove, ...newEls)
            }
            oldLength != newLength && deps._length && deps._length.forEach((dep) => dep())
          }
        if (!Array.isArray(src) && typeof src[key] == 'function') return src[key].bind(src)
        return src[key]
      }

      // avoid conflict of subStates array
      if (Array.isArray(src) && key == 'length') key = '_length'
      if (!deps[key]) deps[key] = new Set()
      _dep && deps[key].add(_dep)
      if (Array.isArray(src) && key == '_length') return src.length
      var result = src[key]
      if (isObj(result)) subStates[key] = subStates[key] || useState(result, depProxy[key])

      return subStates[key] || result
    },
    set: function (src, key, value) {
      // when setting length, src[key] will usually equal to value, but we still want dep call
      if (!(Array.isArray(src) && key == 'length') && src[key] == value) return true
      var regather = false // is it needed to regather deps
      if (value && value._ls) {
        // already a state, just use
        if (src[key] == value._target) return true
        src[key] = value._target
        subStates[key] = value
      } else {
        // create new state & cache
        src[key] = value
        if (isObj(value)) {
          subStates[key] = useState(value, depProxy[key])
          regather = true
        } else {
          if (Array.isArray(src) && key == 'length') {
            regather = true
            key = '_length'
          } else delete subStates[key]
        }
      }
      if (!Lightue._abortDep) {
        deps[key] && deps[key].forEach((dep) => dep(regather))
        if (Array.isArray(src)) {
          key = Number(key)
          !isNaN(key) && key >= 0 && this.get(src, 'splice')(key, 1, value)
        }
      }
      return true
    },
  })
}

Lightue.useState = function (src) {
  // dep proxy tree (even if the state subtree changed, deps still kept)
  function genDepProxy() {
    return new Proxy(
      {},
      {
        get: (src, key) => {
          if (!src[key]) src[key] = key == '_deps' ? {} : genDepProxy()
          return src[key]
        },
      }
    )
  }
  return useState(src, genDepProxy())
}

// run effect and gather deps for rerun
Lightue.watchEffect = function (effect) {
  var runEffect = (regather) => {
    regather && (_dep = runEffect)
    effect()
    regather && (_dep = null)
  }
  runEffect(true)
}

// turn prop function to prop state
Lightue.useProp = function (props) {
  var S = Lightue.useState({})
  Lightue.watchEffect(() => {
    var p = props()
    for (var i in p) S[i] = p[i]
  })
  return S
}

//methods
Lightue.for = function (count, generateItem) {
  var arr = []
  for (var i = 0; i < count; i++) arr.push(generateItem ? generateItem(i) : '')
  return arr
}
;(function () {
  var htmlTags = [
    'div',
    'span',
    'form',
    'label',
    'input',
    'select',
    'option',
    'img',
    'button',
    'table',
    'tr',
    'td',
    'a',
    'ul',
    'li',
    'section',
    'header',
    'footer',
    'p',
  ]
  for (var i in htmlTags) {
    var o = htmlTags[i]
    Lightue[o] = (function (o) {
      function getTagClassWrapper(className) {
        return function (data) {
          var tmp = {
            $tag: o,
          }
          if (className) {
            tmp.$class = {}
            tmp.$class[className] = 1
          }
          if (isPrimitive(data) || Array.isArray(data)) {
            tmp.$$ = data
            return tmp
          } else if (isObj(data)) {
            data.$tag = o
            if (isObj(data.$class) && tmp.$class) assignObj(data.$class, tmp.$class)
            else if (tmp.$class) data.$class = tmp.$class
            return data
          } else if (data == null || typeof data == 'undefined') return tmp
        }
      }
      return new Proxy(getTagClassWrapper(), {
        get: function (src, key) {
          return getTagClassWrapper(key)
        },
      })
    })(o)
  }
})()

export default Lightue
