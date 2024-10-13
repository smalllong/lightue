import ListNode from "./ListNode";
import { isObj } from "./utils";

var _dep = null; // effect to rerun

export function useState(src) {
  var S,
    isArr = Array.isArray(src),
    subStates = isArr ? [] : {},
    descs = {},
    deps = {},
    depNodes = [];
  // in 0.1.x version, hack for Date as JSON copy can't copy Date
  if (src instanceof Date) S = new Date(src);
  else S = JSON.parse(JSON.stringify(src));
  S._ls = true;
  S._target = src;
  Object.keys(src)
    .concat(isArr ? ["_length"] : null)
    .forEach(function (key) {
      deps[key] = new Set();
      descs[key] = {
        get: function () {
          _dep && deps[key].add(_dep);
          if (isArr && key == "_length") return src.length;
          var result = src[key];
          subStates[key] =
            subStates[key] || (isObj(result) ? useState(result) : result);
          return subStates[key];
        },
        set: function (value) {
          var regather = false;
          if (value && value._ls) {
            // already a state, just use
            if (src[key] == value._target) return true;
            src[key] = value._target;
            subStates[key] = value;
          } else {
            src[key] = value;
            if (isObj(value)) {
              subStates[key] = useState(value);
              regather = false;
            } else {
              delete subStates[key];
            }
          }
          deps[key] && deps[key].forEach((dep) => dep(regather));
          if (isArr) {
            key = Number(key);
            !isNaN(key) && key >= 0 && this.splice(key, 1, value);
          }
        },
        enumerable: true,
        configurable: true,
      };
      descs["$" + key] = {
        get: function () {
          return () => this[key];
        },
        enumerable: false,
        configurable: true,
      };
    });
  if (isArr) {
    descs.map = {
      get: function () {
        return (renderItem) => {
          let newNode = new ListNode(this, renderItem);
          depNodes.push(newNode);
          return newNode;
        };
      },
    };
    descs.splice = {
      get: function () {
        return (index, remove, ...insert) => {
          let oldLength = src.length;
          src.splice(index, remove, ...insert);
          let newStates = insert.map((item) =>
            isObj(item) ? useState(item) : item
          );
          subStates.splice(index, remove, ...newStates);
          depNodes.forEach((listNode) => {
            listNode.splice(index, remove, ...newStates);
          });
          var newLength = src.length;
          oldLength != newLength &&
            deps._length &&
            deps._length.forEach((dep) => dep());
        };
      },
    };
    descs.push = {
      get: function () {
        return (...insert) => {
          this.splice(this._length, 0, ...insert);
        };
      },
    };
  }
  Object.defineProperties(S, descs);
  return S;
}

// run effect and gather deps (states that used in this effect) for rerun
// cb: callback after effect runs which doesn't gather deps
export function watchEffect(effect, cb) {
  function runEffect(regather) {
    var _depStashed;
    if (regather) {
      // support nested watching
      _depStashed = _dep;
      _dep = runEffect;
    }
    var v = effect();
    if (regather) {
      _dep = _depStashed || null;
    }
    cb?.(v, runEffect);
  }
  runEffect(true);
  return runEffect;
}
