import Node from './Node'
import { safeRemove } from './utils'

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
  createTexts: (node, i, v) => {
    node.texts[i] = document.createTextNode(v)
    node.el.appendChild(node.texts[i])
  },
  texts: (i) => (el, v) => (el.VNode.texts[i].textContent = v),
  _: (attr) => (el, v) => v != null && v !== false ? el.setAttribute(attr, v) : el.removeAttribute(attr),
  $$arr: (node, key) => (el, v) => {
    var tempFragment = document.createDocumentFragment(),
      newNodes = []
    if (v._ls) v._depNodes.push([node, v, (a) => a])
    if (v._mappedFrom) v._mappedFrom[0].push([node, ...v._mappedFrom.slice(1)])
    newNodes = v.map((item, j) => {
      return new Node(item, j, node.key + '-item', tempFragment)
    })
    node.el.insertBefore(tempFragment, node.arrEnd)
    node.childArr.forEach(n => safeRemove(n.el))
    node.childArr = newNodes
  },
}
