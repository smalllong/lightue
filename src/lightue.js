import Node from './Node'
import { useState, watchEffect } from './useState'

// Main app, it's just a fragment auto mount to body
function Lightue(props, ...rawChildren) {
  var vm = new Node('', props, ...rawChildren)
  var el = document.querySelector(props?.$el || 'body')
  el.innerHTML = ''
  el.appendChild(vm.el)
  vm.el = el
  vm.el.VNode = vm
  vm.el.querySelector('[autofocus]')?.focus()
  return vm
}

// turn prop function to prop state
function useProp(props) {
  var S = useState({})
  watchEffect(() => {
    var p = props()
    for (var i in p) S[i] = p[i]
  })
  return S
}

function useComp(func) {
  function getComp(className) {
    // call comp
    return function (props, ...args) {
      var tmp = func(useProp(props), ...args)
      if (className) {
        tmp.el.classList.add(className)
      }
      return tmp
    }
  }
  return new Proxy(getComp(), {
    get: function (_src, key) {
      return getComp(key)
    },
  })
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
    'video',
    'audio',
  ]
  for (var i in htmlTags) {
    var o = htmlTags[i]
    window[o] = (function (o) {
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

window.L = Lightue
window.useState = useState
window.watchEffect = watchEffect
window.useProp = useProp
window.useComp = useComp
window.Node = Node
