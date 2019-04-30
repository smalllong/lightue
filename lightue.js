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
    var originalLength = this.length
    Array.prototype.push.apply(this, args)
    args.forEach((ndata, i) => {
      var newNode = new Node(this, originalLength + i, this.$node, hyphenate(this.$node.key)+'-item', this.length + i)
      newNode.render()
      this.$node.el.appendChild(newNode.el)
      this.$node.childNodes.push(newNode)
    })
  }

  //grab ndata from parent to make it newest (avoid value assign)
  function Node(ndataParent, ndataKey, parentNode = null, key = '', index = -1) {  // VDOM Node
    var ndata = ndataParent[ndataKey]
    if (typeof ndata == 'object' && ndata != null) {
      lightAssign(ndata, '$node', this)
      lightAssign(ndata, '$render', this.render.bind(this))
    }
    Object.defineProperty(this, 'ndata', {
      get: () => {
        ndata = ndataParent[ndataKey]
        //$inner shorthand
        if (typeof ndata != 'object' || Array.isArray(ndata))
          ndata = {
            $inner: ndata
          }
        return ndata
      }
    })
    this.parent = parentNode
    this.key = key
    this.index = index
    this.childNodes = []
    this.classes = new Set()
    this.el = document.createElement(this.ndata.$tag || 'div')
    for (var i in this.ndata) {
      var o = this.ndata[i]
      if (i.startsWith('$')) {  //lightue directives
        if (i == '$inner') {
          if (Array.isArray(o)) {
            this.childNodes = o.map((cdata, i) => {
              var newNode = new Node(o, i, this, hyphenate(this.key)+'-item', i)
              this.el.appendChild(newNode.el)
              return newNode
            })
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
            e2.$render = this.render.bind(this)
            e2.$index = this.index
            e2.$argus = o.slice(1)
            o[0](e2)
          })
        })(o)
      } else {
        var newNode = new Node(this.ndata, i, this, hyphenate(i))
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

  var root = new Node({data: data}, 'data', null, 'root')
  root.render()
  document.querySelector(op.el || 'body').appendChild(root.el)
  return data
}