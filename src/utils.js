export function hyphenate(str) {
  return str.replace(/\B([A-Z])/g, "-$1").toLowerCase();
}

export function isObj(data) {
  return typeof data == "object" && data != null;
}

export function isPrimitive(data) {
  return ["string", "number"].indexOf(typeof data) > -1;
}

export function moveArr(arr, from, to) {
  var itemArr = arr.splice(from, 1);
  arr.splice(to, 0, itemArr[0]);
}

export function safeRemove(node) {
  node?.cleanup?.();
  node?.currentEl?.remove();
}
