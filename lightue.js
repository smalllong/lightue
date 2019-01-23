// event handlers that can hold argus
function LightueHandler(handler, ...argus) {
  this.handler = handler
  this.argus = argus
}

function Lightue(op) {

  function hyphenate(str) {
    return str.replace(/\B([A-Z])/g, '-$1').toLowerCase()
  }

  function Node(ndata, parent = null, key = '', index = 0) {  // VDOM Node
    //$inner shorthand
    if (typeof ndata != 'object' || Array.isArray(ndata))
      ndata = {
        $inner: ndata
      }

    this.parent = parent
    this.el = document.createElement(ndata.$tag || 'div')
    this.ndata = ndata
    this.key = key
    this.index = index
    this.classes = new Set()
    this.render()
  }

  Node.prototype.render = function() {
    this.classes.clear()
    if (Array.isArray(this.ndata.$class)) {
      this.classes = new Set(this.ndata.$class)
    } else if (this.ndata.$class!=null && !(this.ndata.$class instanceof Set)) {
      for (var i in this.ndata.$class) {
        if (this.ndata.$class[i]) this.classes.add(hyphenate(i))
      }
    }
    this.el.innerHTML = ''
    for (var i in this.ndata) {
      var o = this.ndata[i]
      if (i.startsWith('$')) {  //lightue directives
        if (i == '$inner') {
          if (typeof o == 'string')
            this.el.textContent = o
          else if (Array.isArray(o))
            o.forEach((child, i) => {
              this.el.appendChild((new Node(child, this, hyphenate(this.key)+'-item', i)).el)
            })
        }
      } else if (i.startsWith('_')) {
        this.el.setAttribute(hyphenate(i.slice(1)), o)
      } else if (i.startsWith('on')) {
        (o => {
          this.el.addEventListener(i.slice(2), e => {
            var e2 = Object.create(e)
            e2.$data = this.ndata
            e2.$node = this
            e2.$index = this.index
            if (o instanceof LightueHandler) {
              e2.$argus = o.argus
              o.handler(e2)
            } else
              o(e2)
          })
        })(o)
      } else {
        this.el.appendChild((new Node(o, this, hyphenate(i))).el)
      }
    }
    this.el.classText = ''
    if (this.key)
      this.classes.add(this.key)
    this.classes.forEach(c => {
      this.el.classList.add(c)
    })
  }

  this.$root = new Node(op, null, 'root')
  this.data = op
  window.addEventListener('DOMContentLoaded', () => {
    document.querySelector(op.el || 'body').appendChild(this.$root.el)
  })
}