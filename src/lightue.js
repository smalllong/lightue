import { isObj, isPrimitive } from './utils'
import Node, { useState, watchEffect } from './Node'

function Lightue(data, op) {
  var vm = new Node(data, 'root', 'root', document.querySelector(op?.el || 'body'))
  vm.el.querySelector('[autofocus]')?.focus()
  return vm
}

// user can abort dependent update by setting _abortDep to true and the set it back to false
// Lightue._abortDep = false

Lightue.useState = function (src) {
  return useState(src)
}

Lightue.watchEffect = watchEffect

// turn prop function to prop state
Lightue.useProp = function (props) {
  var S = Lightue.useState({})
  Lightue.watchEffect(() => {
    var p = props()
    for (var i in p) S[i] = p[i]
  })
  return S
}

Lightue.useComp = function (func) {
  function getComp(className) {
    // call comp
    return function (props, ...args) {
      var tmp = func(Lightue.useProp(props), ...args)
      if (className) {
        if (!tmp.$class) tmp.$class = {}
        tmp.$class[className] = 1
      }
      return tmp
    }
  }
  return new Proxy(getComp(), {
    get: function (src, key) {
      return getComp(key)
    },
  })
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
            if (isObj(data.$class) && tmp.$class) Object.assign(data.$class, tmp.$class)
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
