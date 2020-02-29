function Lightue(data, op) {
  op = op || {}
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
  function arrayPush() {
    var args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments))
    var originalLength = this.length
    Array.prototype.push.apply(this, args)
    for (var i in args) {
      var newNode = new Node(this, originalLength + i, this.$node, hyphenate(this.$node.key)+'-item', this.length + i)
      newNode.render()
      this.$node.el.appendChild(newNode.el)
      this.$node.childNodes.push(newNode)
    }
  }

  //grab ndata from parent to make it newest (avoid value assign)
  function Node(ndataParent, ndataKey, parentNode, key, index) {  // VDOM Node
    var ndata = ndataParent[ndataKey], theNode = this
    if (typeof ndata == 'object' && ndata != null) {
      lightAssign(ndata, '$node', this)
      lightAssign(ndata, '$render', this.render.bind(this))
    }
    Object.defineProperty(this, 'ndata', {
      get: function() {
        ndata = ndataParent[ndataKey]
        //$$ shorthand
        if (typeof ndata != 'object' || Array.isArray(ndata))
          ndata = {
            $$: ndata,
          }
        return ndata
      }
    })
    this.parent = parentNode
    this.key = key || ''
    this.index = index || -1
    this.childNodes = []
    this.classes = []
    this.el = document.createElement(this.ndata.$tag || (ndataKey.slice(0, 2) == '$_'?'span':'div'))
    this.texts = {}
    for (var i in this.ndata) {
      var o = this.ndata[i]
      if (i[0] == '$') {  //lightue directives
        if (i.slice(0, 2) == '$$') { //array or textNode
          if (i == '$$' && Array.isArray(o)) {
            this.childNodes = o.map(function(cdata, i) {
              var newNode = new Node(o, String(i), theNode, hyphenate(theNode.key)+'-item', i)
              theNode.el.appendChild(newNode.el)
              return newNode
            })
            lightAssign(o, 'push', arrayPush)
          } else if (typeof o == 'string') {
            this.texts[i] = document.createTextNode(o)
            this.el.appendChild(this.texts[i])
          }
        } else if (i.slice(0, 2) == '$_') { //span element shortcut
          var newNode = new Node(this.ndata, i, this, hyphenate(i.slice(2)))
          this.el.appendChild(newNode.el)
          this.childNodes.push(newNode)
        }
      } else if (i[0] == '_') {
      } else if (i.slice(0, 2) == 'on') {
        (function(o) {
          theNode.el.addEventListener(i.slice(2), function(e) {
            var e2 = Object.create(e)
            e2.$data = theNode.ndata
            e2.$node = theNode
            e2.$render = theNode.render.bind(theNode)
            e2.$index = theNode.index
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
    if (this.el.className != '')
      this.el.className = ''
    this.classes = []
    for (var i in this.ndata) {
      var o = this.ndata[i]
      if (i[0] == '$') {  //lightue directives
        if (i.slice(0, 2) == '$$') {
          if (typeof o == 'string')
            this.texts[i].textContent = o
        } else if (i == '$class') {
          if (Array.isArray(o)) {
            this.classes = o
          } else {
            for (var j in o) {
              if (o[j]) this.classes.push(hyphenate(j))
            }
          }
        }
      } else if (i[0] == '_') {
        this.el.setAttribute(hyphenate(i.slice(1)), o)
      }
    }
    if (this.key)
      this.classes.push(this.key)
    for (var i in this.classes) this.el.classList.add(this.classes[i])
    
    for (var i in this.childNodes) this.childNodes[i].render()
  }

  var root = new Node({data: data}, 'data', null, 'root')
  root.render()
  document.querySelector(op.el || 'body').appendChild(root.el)
  return data
}