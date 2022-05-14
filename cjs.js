'use strict';

var _dep = null,
  _arrToNode = new WeakMap(),
  _rendering = false; // executing user render function

function Lightue(data, op = {}) {
  return new Node({ data: data }, 'data', 'root', document.querySelector(op.el || 'body'))
}
Lightue._abortDep = false; // user can abort dependent update

function hyphenate(str) {
  return str.replace(/\B([A-Z])/g, '-$1').toLowerCase()
}

// elKey can be a custom setting function
function mapDom(obj, key, el, elKey) {
  if (obj[key] == null) return
  var getter;
  typeof obj[key] == 'function' && (getter = obj[key]);
  function updateDom(regather) {
    if (regather && getter) _dep = updateDom;
    _rendering = true;
    var v = getter ? getter() : obj[key];
    _rendering = false;
    typeof elKey == 'function' ? elKey(el, v) : (el[elKey] = v);
    if (regather && getter) _dep = null;
  }
  updateDom(true);
}

function isPrimitive(data) {
  return ['string', 'number'].indexOf(typeof data) > -1
}
function isObj(data) {
  return typeof data == 'object' && data != null
}

function assignObj(target, obj) {
  for (var i in obj) target[i] = obj[i];
}

function extendFunc(original, coming, initial) {
  if (typeof original == 'function') {
    return function (...args) {
      original.call(this, ...args);
      coming.call(this, ...args);
    }
  } else
    return function (...args) {
      initial && initial.call(this, ...args);
      coming.call(this, ...args);
    }
}

// VDOM Node
// grab ndata from parent to make it newest (avoid value assign)
function Node(ndataParent, ndataKey, key, appendToEl, ndataValue, originalEl) {
  this.ndataKey = ndataKey = String(ndataKey);
  var ndata = ndataParent[ndataKey];
  ndataValue = ndataValue || (typeof ndata == 'function' ? ndata() : ndata);
  if (isPrimitive(ndataValue) || Array.isArray(ndataValue) || ndataValue == null) ndata = { $$: ndata };
  else if (typeof ndata == 'function') ndata = ndataValue;
  this.key = key || '';
  this.childArrEls = [];
  this.childEls = {};
  this.tag = (ndata && ndata.$tag) || (ndataKey.slice(0, 2) == '$_' ? 'span' : 'div');
  this.el = document.createElement(this.tag);
  if (originalEl && originalEl.parentNode) {
    originalEl.parentNode.insertBefore(this.el, originalEl);
    originalEl.remove();
  } else appendToEl && appendToEl.appendChild(this.el);
  key && this.el.classList.add(key);
  this.texts = {};
  this.el.VNode = this;
  for (var i in ndata) {
    var o = ndata[i];
    if (i[0] == '$') {
      var oValue = typeof o == 'function' ? o() : o;
      //lightue directives
      if (i.slice(0, 2) == '$$') {
        if (i == '$$' && Array.isArray(oValue)) {
          this.arrStart = new Comment('arr start');
          this.arrEnd = new Comment('arr end');
          this.el.appendChild(this.arrStart);
          this.el.appendChild(this.arrEnd);
          mapDom(ndata, i, this.el, (el, v) => {
            var tempFragment = document.createDocumentFragment(),
              newEls = [];
            if (Array.isArray(v)) {
              if (v.$mappedFrom) _arrToNode.set(v.$mappedFrom, this);
              newEls = v.map((item, j) => {
                return new Node(v, j, hyphenate(ndataKey) + '-item', tempFragment).el
              });
            } else newEls.push(tempFragment.appendChild(document.createElement('span')));
            this.el.insertBefore(tempFragment, this.arrEnd);
            this.childArrEls.forEach((child) => child.remove());
            this.childArrEls = newEls;
          });
        } else if (i == '$$' && isObj(oValue)) {
          this._addChild(o, ndata, i);
        } else if (isPrimitive(oValue)) {
          this.texts[i] = document.createTextNode(oValue);
          this.el.appendChild(this.texts[i]);
          mapDom(ndata, i, this.texts[i], 'textContent');
        }
      } else if (i.slice(0, 2) == '$_') {
        //span element shortcut
        new Node(ndata, i, hyphenate(i.slice(2)), this.el);
      } else if (i == '$class') {
        Object.keys(o).forEach((j) => {
          mapDom(o, j, this.el, function (el, v) {
            el.classList[v ? 'add' : 'remove'](hyphenate(j));
          });
        });
      } else if (i == '$value' && ['input', 'textarea'].indexOf(this.tag) > -1)
        mapDom(ndata, '$value', this.el, 'value');
    } else if (i[0] == '_') {
((attr) => {
        mapDom(ndata, i, this.el, function (el, v) {
          v != null ? el.setAttribute(attr, v) : el.removeAttribute(attr);
        });
      })(hyphenate(i.slice(1)));
    } else if (i.slice(0, 2) == 'on') this.el.addEventListener(i.slice(2), o);
    else this._addChild(o, ndata, i, hyphenate(i));
  }
}

Node.prototype._addChild = function (o, ndata, i, key) {
  if (typeof o == 'function')
    mapDom(ndata, i, this.el, (el, v) => {
      // only create new VNode when first render or obj rerender
      if (!this.childEls[i] || isObj(v)) this.childEls[i] = new Node(ndata, i, key, this.el, v, this.childEls[i]).el;
    });
  else new Node(ndata, i, key, this.el);
};

Lightue.useState = function (src) {
  if (!isObj(src) || src._ls) return src
  var deps = {},
    subStates = {},
    depItem;
  function set(src, key, value) {
    var regather = false; // is it needed to regather deps
    if (value && value._ls) {
      // already a state, just use
      src[key] = value._target;
      subStates[key] = value;
    } else {
      // create new state & cache
      src[key] = value;
      if (isObj(value)) {
        subStates[key] = Lightue.useState(value);
        regather = true;
      } else {
        delete subStates[key];
      }
    }
    if (!Lightue._abortDep) {
      deps[key] && deps[key].forEach((dep) => dep(regather));
      if (Array.isArray(src)) {
        key = parseInt(key);
        key >= 0 && depItem && depItem(value, key);
      }
    }
    return true
  }
  if (Array.isArray(src))
    return new Proxy(src, {
      get: function (src, key) {
        if (key == '_ls') return true
        if (key == '_target') return src

        // When array's 'map' is used to render list, trap it
        if (key == 'map' && _rendering) {
          return function (callback) {
            var result = src.map((item, i) => {
              if (isObj(item)) subStates[i] = subStates[i] || Lightue.useState(item);
              return callback(subStates[i] || item, i)
            });
            result.$mappedFrom = src;
            depItem = extendFunc(depItem, (item, i) => {
              if (isObj(item)) {
                subStates[i] = Lightue.useState(item);
              }
              var node = _arrToNode.get(src),
                newDomSrc,
                wrapper = {};
              _rendering = true;
              newDomSrc = callback(subStates[i] || item, i);
              _rendering = false;
              wrapper[i] = newDomSrc;
              var newNode = new Node(wrapper, i, hyphenate(node.ndataKey) + '-item');
              node.el.insertBefore(newNode.el, node.childArrEls[i] || node.arrEnd);
              node.childArrEls[i] && node.childArrEls[i].remove();
              node.childArrEls.splice(i, 1, newNode.el);
            });
            return result
          }
        }

        if (src[key] != null && !src.hasOwnProperty(key)) return src[key]
        if (!deps[key]) deps[key] = new Set();
        _dep && deps[key].add(_dep);
        var result = src[key];
        if (isObj(result)) subStates[key] = subStates[key] || Lightue.useState(result);

        return subStates[key] || result
      },
      set: set,
    })
  return new Proxy(src, {
    get: function (src, key) {
      if (key == '_ls') return true
      if (key == '_target') return src
      if (src[key] != null && !src.hasOwnProperty(key)) {
        if (typeof src[key] == 'function') return src[key].bind(src)
        return src[key]
      }
      if (!deps[key]) deps[key] = new Set();
      _dep && deps[key].add(_dep);
      var result = src[key];
      if (isObj(result)) subStates[key] = subStates[key] || Lightue.useState(result);
      return subStates[key] || result
    },
    set: set,
  })
};

//methods
Lightue.for = function (count, generateItem) {
  var arr = [];
  for (var i = 0; i < count; i++) arr.push(generateItem ? generateItem(i) : '');
  return arr
}
;(function () {
  var htmlTags = [
    'div',
    'span',
    'form',
    'label',
    'input',
    'select',
    'img',
    'button',
    'table',
    'tr',
    'td',
    'a',
    'ul',
    'li',
  ];
  for (var i in htmlTags) {
    var o = htmlTags[i];
    Lightue[o] = (function (o) {
      function getTagClassWrapper(className) {
        return function (data) {
          var tmp = {
            $tag: o,
          };
          if (className) {
            tmp.$class = {};
            tmp.$class[className] = 1;
          }
          if (isPrimitive(data) || Array.isArray(data)) {
            tmp.$$ = data;
            return tmp
          } else if (isObj(data)) {
            data.$tag = o;
            if (isObj(data.$class) && tmp.$class) assignObj(data.$class, tmp.$class);
            else if (tmp.$class) data.$class = tmp.$class;
            return data
          } else if (data == null || typeof data == 'undefined') return tmp
        }
      }
      return new Proxy(getTagClassWrapper(), {
        get: function (src, key) {
          return getTagClassWrapper(key)
        },
      })
    })(o);
  }
})();

module.exports = Lightue;
