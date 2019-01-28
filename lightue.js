function Lightue(data, op = {}) {
  //assign a non-enumerable value
  function lightAssign(obj, key, val) {
    Object.defineProperty(obj, key, {
      value: val,
      enumerable: false,
      writable: true,
      configurable: true
    })
  }

  function hyphenate(str) {
    return str.replace(/\B([A-Z])/g, '-$1').toLowerCase()
  }

  //extend array functions
  function arrayPush(...args) {
    Array.prototype.push.apply(this, args)
    args.forEach((ndata, i) => {
      var newNode = new Node(ndata, this.$node, hyphenate(this.$node.key)+'-item', this.length + i)
      newNode.render()
      this.$node.el.appendChild(newNode.el)
      this.$node.childNodes.push(newNode)
    })
  }

  function Node(ndata, parent = null, key = '', index = 0) {  // VDOM Node
    //$inner shorthand
    if (typeof ndata != 'object' || Array.isArray(ndata))
      ndata = {
        $inner: ndata
      }

    this.parent = parent
    this.ndata = ndata
    ndata.$node = this
    this.key = key
    this.index = index
    this.childNodes = []
    this.classes = new Set()
    this.create()
  }

  Node.prototype.create = function() {
    this.el = document.createElement(this.ndata.$tag || 'div')
    for (var i in this.ndata) {
      var o = this.ndata[i]
      if (i.startsWith('$')) {  //lightue directives
        if (i == '$inner') {
          if (Array.isArray(o)) {
            this.childNodes = o.map((cdata, i) => {
              var newNode = new Node(cdata, this, hyphenate(this.key)+'-item', i)
              this.el.appendChild(newNode.el)
              return newNode
            })
            lightAssign(o, '$node', this)
            lightAssign(o, 'push', arrayPush)
          }
        }
      } else if (i.startsWith('_')) {
      } else if (i.startsWith('on')) {
        (o => {
          this.el.addEventListener(i.slice(2), e => {
            var e2 = Object.create(e)
            e2.$data = this.ndata
            e2.$node = this
            e2.$index = this.index
            e2.$argus = o.slice(1)
            o[0](e2)
          })
        })(o)
      } else {
        var newNode = new Node(o, this, hyphenate(i))
        this.el.appendChild(newNode.el)
        this.childNodes.push(newNode)
      }
    }
  }

  Node.prototype.render = function() {
    this.el.className = ''
    this.classes.clear()
    for (var i in this.ndata) {
      var o = this.ndata[i]
      if (i.startsWith('$')) {  //lightue directives
        if (i == '$inner') {
          if (typeof o == 'string')
            this.el.textContent = o
        } else if (i == '$class') {
          if (Array.isArray(o)) {
            this.classes = new Set(o)
          } else if (o instanceof Set) {
            this.classes = o
          } else {
            for (var j in o) {
              if (o[j]) this.classes.add(hyphenate(j))
            }
          }
        }
      } else if (i.startsWith('_')) {
        this.el.setAttribute(hyphenate(i.slice(1)), o)
      }
    }
    if (this.key)
      this.classes.add(this.key)
    this.classes.forEach(c => this.el.classList.add(c))
    
    this.childNodes.forEach(c => c.render())
  }

  this.root = new Node(data, null, 'root')
  this.root.render()
  this.data = data
  if (op.created) op.created()
  window.addEventListener('DOMContentLoaded', () => {
    document.querySelector(op.el || 'body').appendChild(this.root.el)
    if (op.mounted) op.mounted()
  })
}