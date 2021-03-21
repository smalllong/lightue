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
    var originalLength = this.length
    Array.prototype.push.apply(this, arguments)
    for (var i=0; i<arguments.length; i++) {
      var newNode = new Node(this, originalLength + i, this.$node, hyphenate(this.$node.key)+'-item')
      this.$node._addChild(newNode)
    }
  }

  //make a reactive shortcut to DOM API
  // op.get/op.set: custom methods when the getting and setting of the value in DOM is not directly assign
  function mapDom(obj, key, el, elKey, enumerable, op) {
    op = op || {}
    op.get = op.get || function(el, elKey) {return el[elKey]}
    op.set = op.set || function(el, elKey, v) {el[elKey] = v}
    var property = Object.getOwnPropertyDescriptor(obj, key);
    var setter = property && property.set;
    var set = function(v) {
      if (op.convert) v = op.convert(v)
      if (v == op.get(el, elKey)) return
      setter && setter.call(this, v)
      op.set(el, elKey, v)
    }
    if (property && property.get) {
      Lightue._dep = {
        notify: function() {
          var v = obj[key]
          if (op.convert) v = op.convert(v)
          if (v == op.get(el, elKey)) return
          op.set(el, elKey, v)
        }
      }
    }
    set(obj[key])
    if (property && property.get)
      Lightue._dep = null
    Object.defineProperty(obj, key, {
      get: property && property.get || function() {
        return op.get(el, elKey)
      },
      set: set,
      enumerable: enumerable || false,
      configurable: true
    })
  }

  //grab ndata from parent to make it newest (avoid value assign)
  function Node(ndataParent, ndataKey, parentNode, key) {  // VDOM Node
    ndataKey = String(ndataKey)
    var theNode = this
    var ndata = this.ndata = ndataParent[ndataKey]
    this.parent = parentNode
    this.key = key || ''
    this.childNodes = []
    this.classes = []
    this.el = document.createElement(ndata && ndata.$tag || (ndataKey.slice(0, 2) == '$_'?'span':'div'))
    key && this.el.classList.add(key)
    if (typeof ndata == 'string' || typeof ndata == 'number') {
      mapDom(ndataParent, ndataKey, this.el, 'textContent', true)
      this.el.textContent = ndata
    } else if (Array.isArray(ndata)) {
      this._setChildren(ndata)
    } else if (typeof ndata == 'object' && ndata != null) {
      lightAssign(ndata, '$node', this)
      if (ndata.$tag == 'input' || ndata.$tag == 'textarea')
        mapDom(ndata, '$value', this.el, 'value')
      this.texts = {}
      for (var i in ndata) {
        var o = ndata[i]
        if (i[0] == '$') {  //lightue directives
          if (i.slice(0, 2) == '$$') { //array or textNode
            if (i == '$$' && Array.isArray(o)) {
              this._setChildren(o)
            } else if (typeof o == 'string' || typeof o == 'number') {
              this.texts[i] = document.createTextNode(o)
              this.el.appendChild(this.texts[i])
              mapDom(ndata, i, this.texts[i], 'textContent', true)
            }
          } else if (i.slice(0, 2) == '$_') { //span element shortcut
            this._addChild(new Node(ndata, i, this, hyphenate(i.slice(2))))
          } else if (i == '$class') {
            Object.keys(o).forEach(function(j) {
              mapDom(o, j, theNode.el, 'classList', true, {
                get: function(el, elKey) {
                  return el.classList.contains(hyphenate(j))
                },
                set: function(el, elKey, v) {
                  el.classList[v ? 'add' : 'remove'](hyphenate(j))
                },
                convert: Boolean
              })
            })
          }
        } else if (i[0] == '_') {
          mapDom(ndata, i, this.el, hyphenate(i.slice(1)), true, {
            get: function(el, elKey) {
              return el.getAttribute(elKey)
            },
            set: function(el, elKey, v) {
              el.setAttribute(elKey, v)
            }
          })
        } else if (i.slice(0, 2) == 'on') {
          (function(o) {
            theNode.el.addEventListener(i.slice(2), function(e) {
              if (Array.isArray(o))
                o[0].apply(theNode.ndata, [e].concat(o.slice(1)))
              else o(e)
            })
          })(o)
        } else {
          this._addChild(new Node(ndata, i, this, hyphenate(i)))
        }
      }
    }
  }

  Node.prototype._addChild = function(childNode) {
    this.el.appendChild(childNode.el)
    this.childNodes.push(childNode)
  }

  Node.prototype._setChildren = function(arr) {
    lightAssign(arr, '$node', this)
    var theNode = this
    this.childNodes = arr.map(function(cdata, i) {
      var newNode = new Node(arr, i, theNode, hyphenate(theNode.key)+'-item')
      theNode.el.appendChild(newNode.el)
      return newNode
    })
    lightAssign(arr, 'push', arrayPush)
  }

  var root = new Node({data: data}, 'data', null, 'root')
  document.querySelector(op.el || 'body').appendChild(root.el)
  return data
}

Lightue._dep = null

Lightue.useState = function(src) {
  var S = JSON.parse(JSON.stringify(src)), descs = {}, deps = {}
  Object.keys(src).forEach(function(key) {
    deps[key] = []
    descs[key] = {
      get: function() {
        Lightue._dep && deps[key].push(Lightue._dep)
        return src[key]
      },
      set: function(v) {
        src[key] = v
        deps[key].forEach(function(dep) {
          dep.notify()
        })
      },
      enumerable: true,
      configurable: true
    }
  })
  Object.defineProperties(S, descs)
  return S
}

//methods
Lightue.for = function(count, generateItem) {
  var arr = []
  for (var i = 0; i < count; i++)
    arr.push(generateItem?generateItem(i):'')
  return arr
}