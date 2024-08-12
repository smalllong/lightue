import Node, { useState, watchEffect } from './Node'

// Main app, it's just a fragment auto mount to body
function Lightue(props, ...rawChildren) {
  var vm = new Node('', props, ...rawChildren)
  var el = document.querySelector(props?.$el || 'body')
  el.innerHTML = ''
  el.appendChild(vm.el)
  vm.el = el
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
    'fragment',
    'div',
    'span',
    'strong',
    'form',
    'label',
    'input',
    'select',
    'option',
    'textarea',
    'img',
    'button',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'a',
    'b',
    'nav',
    'ul',
    'li',
    'section',
    'header',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'main',
    'footer',
    'p',
  ]
  for (var i in htmlTags) {
    var o = htmlTags[i]
    Lightue[o] = (function (o) {
      if (o == 'fragment') o = ''
      function getTagClassWrapper(className) {
        return (...args) => new Node(o + (className ? '.' + className : ''), ...args)
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
