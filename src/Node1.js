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
// key: key of this node in VDomSrc, such as 'div.root'
// props: object containing attributes and Lightue directives
// rawChildren: raw child nodes in VDomSrc
export default function Node(key, props, ...rawChildren) {
  if (isPrimitive(props) || props instanceof Node || typeof props == 'function' || Array.isArray(props)) {
    rawChildren.unshift(props)
    props = null
  }

  var keyParts = key.split('.')
  this.tag = keyParts[0]
  this.el = this.tag ? document.createElement(this.tag) : document.createDocumentFragment()
  if (keyParts.length > 1) {
    keyParts.forEach((part, i) => {
      i > 0 && this.el.classList.add(part)
    })
  }
  this.el.VNode = this
  for (var i in props) {
    let o = props[i]
    // skip handle null and undefined, but for boolean properties, treat them falsy
    if (i != '$if' && i != '$checked' && o == null) continue
    if (i[0] == '$') {
      //lightue directives
      if (i == '$if') {
        // conditionally switch between elem and its placeholder
        let bo = typeof o == 'function' ? () => Boolean(o()) : Boolean(o)
        mapDom(bo, this.el, domUpdaters.$if(key))
      } else if (i == '$class') {
        Object.keys(o).forEach((j) => {
          mapDom(o[j], this.el, domUpdaters.$class(j))
        })
      } else if (i == '$value' && ['input', 'textarea', 'select'].indexOf(this.tag) > -1) mapDom(o, this.el, 'value')
      else if (i == '$checked' && this.tag == 'input') mapDom(o, this.el, 'checked')
      else if (i == '$cleanup') this.cleanup = o
    } else if (i.slice(0, 2) == 'on') this.el.addEventListener(i.slice(2), o)
    else mapDom(o, this.el, domUpdaters._(hyphenate(i)))
  }
  // for remove previous nodes
  this.lastNodes = []
  // todo: support dynamic list in children
  for (var i in rawChildren) {
    mapDom(rawChildren[i], this.el, (el, c) => {
      // remove last render
      this.lastNodes[i]?.el?.remove()
      this.lastNodes[i]?.placeholder?.remove()

      if (c == null) return
      var append = (item) => {
        var result
        if (isPrimitive(item)) result = { el: document.createTextNode(item) }
        else if (item instanceof Node) result = item
        this.lastNodes[i] = result
        if (result.isStashed) {
          el.appendChild(result.placeholder)
        } else {
          el.appendChild(result.el)
        }
      }
      if (Array.isArray(c)) {
        mapDom(c, null, (el, v, updateDom) => {
          this.arrStart = new Comment('arr start')
          this.arrEnd = new Comment('arr end')
          this.el.appendChild(this.arrStart)
          this.el.appendChild(this.arrEnd)
          this.arrUpdate = updateDom
          domUpdaters.$$arr(this)(this.el, c)
        })
      } else {
        append(c)
      }
    })
  }
}

var registry =
  window.FinalizationRegistry &&
  new FinalizationRegistry((h) => {
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
