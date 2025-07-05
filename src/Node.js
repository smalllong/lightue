import { hyphenate, isPrimitive } from './utils'
import { watchEffect } from './useState'
import domUpdaters from './domUpdaters'
import ListNode from './ListNode'

// VDOM Node
// key: key of this node in VDomSrc, such as 'div.root'
// props: object containing attributes and Lightue directives
// rawChildren: raw child nodes in VDomSrc
export default function Node(key, props, ...rawChildren) {
  if (isPrimitive(props) || props instanceof Node || props instanceof ListNode || typeof props == 'function' || Array.isArray(props)) {
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
        this.bindDom(o, domUpdaters.$if)
      } else if (i == '$class') {
        Object.keys(o).forEach((j) => {
          this.bindDom(o[j], domUpdaters.$class(j))
        })
      } else if (i == '$value' && ['input', 'textarea', 'select'].indexOf(this.tag) > -1) this.bindDom(o, 'value')
      else if (i == '$checked' && this.tag == 'input') this.bindDom(o, 'checked')
      else if (i == '$cleanup') this.cleanup = o
    } else if (i.slice(0, 2) == 'on') this.el.addEventListener(i.slice(2), o)
    else this.bindDom(o, domUpdaters._(hyphenate(i)))
  }
  // for remove previous nodes
  this.lastNodes = []
  // todo: support dynamic list in children
  for (var i in rawChildren) {
    this.bindDom(rawChildren[i], domUpdaters.child(Number(i)))
  }
}

// bind value to automatically update the dom if value is a function
Node.prototype.bindDom = function (value, domUpdater) {
  // it can be simplified as the property name to update
  const updateDom = typeof domUpdater == 'string' ? (el, v) => (el[domUpdater] = v) : domUpdater

  if (typeof value == 'function') {
    watchEffect(value, (finalValue) => updateDom(this.el, finalValue), this.el)
  } else {
    updateDom(this.el, value)
  }
}
// The element that should be in dom
Object.defineProperty(Node.prototype, 'currentEl', {
  get: function () {
    return this.isStashed ? this.placeholder : this.el
  },
})
