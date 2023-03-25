import { hyphenate, isObj, isPrimitive, moveArr, safeRemove } from './utils'
import domUpdaters from './domUpdaters'
import Lightue from './lightue'
var _dep = null,
  _rendering = false // executing user render function

// elKey can be a custom setting function
function mapDom(value, el, elKey) {
  var setter = typeof elKey == 'function' ? elKey : undefined,
    lastV
  if (typeof value == 'function') {
    return watchEffect(
      value,
      (v, wel, updateDom) => {
        if (isObj(v)) {
          // for obj always rerender even if it's the same obj
          lastV = NaN
        } else {
          if (v == lastV) return
          lastV = v
        }
        setter ? setter(wel, v, updateDom) : (wel[elKey] = v)
      },
      el ? (window.WeakRef ? new WeakRef(el) : el) : null
    )
  } else setter ? setter(el, value) : (el[elKey] = value)
}

// VDOM Node
// ndataKey: original key in VDomSrc
// key: a className to be added
// appendToEl: append new el to it
// ndataValue: a cache to avoid rerun of ndata
// originalEl: if passed, new el will replace this el in situ
function Node(ndata, ndataKey, key, appendToEl, ndataValue, originalEl) {
  ndataKey = String(ndataKey)
  this.key = key || ''

  var genNode = (ndata, updateDom) => {
    if (isPrimitive(ndata) || Array.isArray(ndata) || ndata == null) {
      if (!this.el) {
        // first time create
        this.tag = ndataKey.slice(0, 2) == '$_' ? 'span' : 'div'
        this.el = document.createElement(this.tag)
        if (originalEl && originalEl.parentNode) {
          originalEl.parentNode.insertBefore(this.el, originalEl)
          safeRemove(originalEl)
        } else appendToEl && appendToEl.appendChild(this.el)
        originalEl = this.el
        key && this.el.classList.add(key)
        this.texts = {}
        this.childArr = []
        this.el.VNode = this
        if (isPrimitive(ndata)) {
          domUpdaters.createTexts(this, '$$', ndata)
        } else if (Array.isArray(ndata)) {
          this.arrStart = new Comment('arr start')
          this.arrEnd = new Comment('arr end')
          this.el.appendChild(this.arrStart)
          this.el.appendChild(this.arrEnd)
          this.arrUpdate = updateDom
          domUpdaters.$$arr(this)(this.el, ndata)
        }
      } else {
        // update
        if (isPrimitive(ndata)) {
          domUpdaters.texts('$$')(this.el, ndata)
        } else if (Array.isArray(ndata)) {
          domUpdaters.$$arr(this)(this.el, ndata)
        }
      }
      return
    }
    this.tag = (ndata && ndata.$tag) || (ndataKey.slice(0, 2) == '$_' ? 'span' : 'div')
    this.el = document.createElement(this.tag)
    if (originalEl && originalEl.parentNode) {
      originalEl.parentNode.insertBefore(this.el, originalEl)
      safeRemove(originalEl)
    } else appendToEl && appendToEl.appendChild(this.el)
    originalEl = this.el
    key && this.el.classList.add(key)
    this.texts = {}
    this.childArr = []
    this.el.VNode = this
    for (var i in ndata) {
      let o = ndata[i]
      // skip handle null and undefined, but for boolean properties, treat them falsy
      if (i != '$if' && i != '$checked' && o == null) continue
      if (i[0] == '$') {
        //lightue directives
        if (i.slice(0, 2) == '$$') {
          var _depStashed = _dep
          _dep = null // avoid gather deps when getting oValue
          var oValue = typeof o == 'function' ? o() : o
          _dep = _depStashed
          if (i == '$$' && Array.isArray(oValue)) {
            this.arrStart = new Comment('arr start')
            this.arrEnd = new Comment('arr end')
            this.el.appendChild(this.arrStart)
            this.el.appendChild(this.arrEnd)
            this.arrUpdate = mapDom(o, this.el, domUpdaters.$$arr(this))
          } else if (isObj(oValue)) {
            this._addChild(o, i)
          } else if (isPrimitive(oValue)) {
            domUpdaters.createTexts(this, i, oValue)
            mapDom(o, this.el, domUpdaters.texts(i))
          }
        } else if (i.slice(0, 2) == '$_') {
          //span element shortcut
          this._addChild(o, i, hyphenate(i.slice(2)))
        } else if (i == '$if') {
          // conditionally switch between elem and its placeholder
          let bo = typeof o == 'function' ? () => Boolean(o()) : Boolean(o)
          mapDom(bo, this.el, domUpdaters.$if(key))
        } else if (i == '$class') {
          Object.keys(o).forEach((j) => {
            mapDom(o[j], this.el, domUpdaters.$class(hyphenate(j)))
          })
        } else if (i == '$value' && ['input', 'textarea', 'select'].indexOf(this.tag) > -1) mapDom(o, this.el, 'value')
        else if (i == '$checked' && this.tag == 'input') mapDom(o, this.el, 'checked')
        else if (i == '$cleanup') this.cleanup = o
      } else if (i[0] == '_') {
        mapDom(o, this.el, domUpdaters._(hyphenate(i.slice(1))))
      } else if (i.slice(0, 2) == 'on') this.el.addEventListener(i.slice(2), o)
      else this._addChild(o, i, hyphenate(i))
    }
  }

  if (typeof ndata == 'function') {
    mapDom(ndata, null, (el, v, updateDom) => {
      genNode(v, updateDom)
    })
  } else genNode(ndata)
}

Node.prototype._addChild = function (o, i, key) {
  new Node(o, i, key, this.el)
}

export default Node

var registry = window.FinalizationRegistry && new FinalizationRegistry((h) => {
  h.set.delete(h.item)
})
export function useState(src) {
  if (!isObj(src) || src._ls) return src
  var deps = {},
    subStates = Array.isArray(src) ? [] : {},
    depNodes = []
  return new Proxy(src, {
    get: function (src, key) {
      if (key == '_ls') return true
      if (key == '_target') return src
      if (key == '_deps') return deps
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
            if (isObj(item)) subStates[i] = subStates[i] || useState(item)
            return callback(subStates[i] || item, i)
          })
          result._mappedFrom = [depNodes, src, callback]
          return result
        }
      }

      if (Array.isArray(src) && key == 'move')
        return (itemIndex, newIndex) => {
          moveArr(src, itemIndex, newIndex)
          moveArr(subStates, itemIndex, newIndex)
          for (var arr of depNodes) {
            var node = arr[0]
            moveArr(node.childArr, itemIndex, newIndex)
            node.el.insertBefore(node.childArr[newIndex].el, node.childArr[newIndex + 1]?.el || node.arrEnd)
          }
        }

      if (src[key] != null && !src.hasOwnProperty(key)) {
        // prototype methods or array's length, reimplement or return src's
        if (Array.isArray(src)) {
          // reimplement splice
          if (key == 'splice')
            return (index, remove, ...insert) => {
              var oldLength = src.length
              src.splice(index, remove, ...insert)
              subStates.splice(index, remove, ...new Array(insert.length))
              var newLength = src.length
              for (var arr of depNodes) {
                var node = arr[0],
                  cb = arr[2],
                  newElsFragment = new DocumentFragment()
                for (var i = 0; i < remove; i++) safeRemove(node.childArr[index + i]?.el)
                var newNodes = insert.map((item, i) => {
                  var curIndex = index + i
                  if (isObj(item)) subStates[curIndex] = useState(item)
                  _dep = [node.arrUpdate, node.el]
                  _rendering = true
                  var v = cb(subStates[curIndex] || item, curIndex)
                  _rendering = false
                  _dep = null
                  var newNode = new Node(v, curIndex, node.key + '-item')
                  newElsFragment.appendChild(newNode.el)
                  return newNode
                })
                node.el.insertBefore(newElsFragment, node.childArr[index + remove]?.el || node.arrEnd)
                node.childArr.splice(index, remove, ...newNodes)
              }
              oldLength != newLength && deps._length && deps._length.forEach((dep) => dep())
            }
        }
        if (!Array.isArray(src) && typeof src[key] == 'function') return src[key].bind(src)
        return src[key]
      }

      // avoid conflict of subStates array
      if (Array.isArray(src) && key == 'length') key = '_length'
      if (!deps[key]) deps[key] = new Set()
      if (_dep) {
        deps[key].add(_dep[0])
        // GC dep with el
        if (_dep[1] && registry)
          registry.register(_dep[1], {
            set: deps[key],
            item: _dep[0],
          })
      }
      if (Array.isArray(src) && key == '_length') return src.length
      var result = src[key]
      if (isObj(result)) subStates[key] = subStates[key] || useState(result)

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
          subStates[key] = useState(value)
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

// run effect and gather deps for rerun
// cb: callback after effect runs which doesn't gather deps
// weakEl: a WeakRef for cleanup
export function watchEffect(effect, cb, weakEl) {
  function runEffect(regather) {
    var wel = weakEl?.deref ? weakEl.deref() : weakEl
    if (weakEl && !wel) return
    regather && (_dep = [runEffect, wel])
    _rendering = true
    var v = effect()
    _rendering = false
    regather && (_dep = null)
    cb?.(v, wel, runEffect)
  }
  runEffect(true)
  return runEffect
}
