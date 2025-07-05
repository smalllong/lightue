import ListNode from './ListNode'
import { isObj, moveArr } from './utils'

var _dep = null // [effect to rerun, element for GC]
var registry =
  window.FinalizationRegistry &&
  new FinalizationRegistry((h) => {
    h.set.delete(h.item)
  })
export function useState(src) {
  if (!isObj(src) || src._ls) return src
  var deps = {},
    isArr = Array.isArray(src),
    subStates = isArr ? src.map((item) => (isObj(item) ? useState(item) : item)) : {},
    depNodes = []
  return new Proxy(src, {
    get: function (src, key, receiver) {
      if (key == '_ls') return true // marks this is a lightue state object
      if (key == '_target') return src
      if (key == '_deps') return deps
      if (key == '_depNodes') return depNodes
      if (typeof key == 'string' && key[0] == '$') {
        var result = () => this.get(src, key.slice(1))
        result.toString = result
        return result
      }

      // When array's 'map' is used to render list, trap it
      if (isArr && key == 'map') {
        return (renderItem) => {
          let newNode = new ListNode(receiver, renderItem)
          depNodes.push(newNode)
          return newNode
        }
      }

      // todo
      // if (isArr && key == 'move')
      //   return (itemIndex, newIndex) => {
      //     moveArr(src, itemIndex, newIndex)
      //     moveArr(subStates, itemIndex, newIndex)
      //     for (var node of depNodes) {
      //       moveArr(node.childArr, itemIndex, newIndex)
      //       node.el.insertBefore(node.childArr[newIndex].el, node.childArr[newIndex + 1]?.el || node.arrEnd)
      //     }
      //   }

      if (src[key] != null && !src.hasOwnProperty(key)) {
        // prototype methods or array's length, reimplement or return src's
        if (isArr) {
          // reimplement splice, to sync dom with array state
          if (key == 'splice')
            return (index, remove, ...insert) => {
              let oldLength = src.length
              src.splice(index, remove, ...insert)
              let newStates = insert.map((item) => (isObj(item) ? useState(item) : item))
              subStates.splice(index, remove, ...newStates)
              depNodes.forEach((listNode) => {
                listNode.splice(index, remove, ...newStates)
              })
              var newLength = src.length
              oldLength != newLength && deps._length && deps._length.forEach((dep) => dep())
            }
        }
        if (!isArr && typeof src[key] == 'function') return src[key].bind(src)
        return src[key]
      }

      // avoid conflict of subStates array
      if (isArr && key == 'length') key = '_length'
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
      if (isArr && key == '_length') return src.length
      var result = src[key]
      if (isObj(result)) subStates[key] = subStates[key] || useState(result)

      return subStates[key] || result
    },
    set: function (src, key, value) {
      // when setting length, src[key] will usually equal to value, but we still want dep call
      if (!(isArr && key == 'length') && src[key] == value) return true
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
          if (isArr && key == 'length') {
            regather = true
            key = '_length'
          } else delete subStates[key]
        }
      }
      deps[key] && deps[key].forEach((dep) => dep(regather))
      if (isArr) {
        key = Number(key)
        !isNaN(key) && key >= 0 && this.get(src, 'splice')(key, 1, value)
      }
      return true
    },
  })
}

// run effect and gather deps (states that used in this effect) for rerun
// cb: callback after effect runs which doesn't gather deps
// weakEl: a WeakRef for cleanup
export function watchEffect(effect, cb, weakEl) {
  function runEffect(regather) {
    var wel = weakEl?.deref ? weakEl.deref() : weakEl,
      _depStashed
    if (weakEl && !wel) return
    if (regather) {
      // support nested watching
      _depStashed = _dep
      _dep = [runEffect, wel]
    }
    var v = effect()
    if (regather) {
      _dep = _depStashed || null
    }
    cb?.(v, wel, runEffect)
  }
  runEffect(true)
  return runEffect
}
