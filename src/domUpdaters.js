// this file contains methods that actually do the dom updating for various parts in VDomSrc

import Node from './Node'
import { isPrimitive, safeRemove } from './utils'

export default {
  $class: (j) => (el, v) => el.classList[v ? 'add' : 'remove'](j),
  $if: (key) => (el, v) => {
    var node = el.VNode
    // stop handling detached el
    if (el != node.el) return
    if (!node.placeholder) node.placeholder = new Comment(key)
    if (v && node.isStashed) {
      node.placeholder.parentNode?.insertBefore(el, node.placeholder)
      node.placeholder.remove()
      node.isStashed = false
    } else if (!v && !node.isStashed) {
      el.parentNode?.insertBefore(node.placeholder, el)
      el.remove()
      node.isStashed = true
    }
  },
  _: (attr) => (el, v) => v != null && v !== false ? el.setAttribute(attr, v) : el.removeAttribute(attr),
  child: (i) => (el, c) => {
    var node = el.VNode
    // remove last render
    if (Array.isArray(c)) {
      node.childArr.forEach((n) => safeRemove(n.el))
    } else {
      safeRemove(node.lastNodes[i]?.el)
      safeRemove(node.lastNodes[i]?.placeholder)
    }

    if (c == null) return

    // render and append
    if (Array.isArray(c)) {
      // initialize array el placeholder
      if (!node.arrStart) {
        node.arrStart = new Comment('arr start')
        node.arrEnd = new Comment('arr end')
        el.appendChild(node.arrStart)
        el.appendChild(node.arrEnd)
      }
      var tempFragment = document.createDocumentFragment()
      if (c._ls) c._depNodes.push([node, c, (a) => a])
      if (c._mappedFrom) c._mappedFrom[0].push([node, ...c._mappedFrom.slice(1)])
      node.childArr = c.map(wrapNode)
      node.childArr.forEach((n) => appendNode(tempFragment, n))
      el.insertBefore(tempFragment, node.arrEnd)
    } else {
      node.lastNodes[i] = wrapNode(c)
      appendNode(el, node.lastNodes[i])
    }
  },
}

// wrap any child into a real or fake Node
function wrapNode(value) {
  if (isPrimitive(value)) return { el: document.createTextNode(value) }
  else if (value instanceof Node) return value
}

// append child node's el to parent node's el, no matter the child is stashed or not
function appendNode(el, node) {
  el.appendChild(node.isStashed ? node.placeholder : node.el)
}
