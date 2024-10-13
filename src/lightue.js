import { useState, watchEffect } from "./useState";
import Node from "./Node";

function Lightue(props, ...rawChildren) {
  var vm = new Node("", props, ...rawChildren);
  var el = document.querySelector(props?.$el || "body");
  el.innerHTML = "";
  el.appendChild(vm.el);
  vm.el = el;
  vm.el.VNode = vm;
  vm.el.querySelector("[autofocus]")?.focus();
  return vm;
}

Lightue.useState = function (src) {
  return useState(src);
};

Lightue.watchEffect = watchEffect;

// turn prop function to prop state
Lightue.useProp = function (props, ...keys) {
  var stateSrc = {}
  for (var key of keys) stateSrc[key] = ''
  var S = useState(stateSrc);
  watchEffect(() => {
    var p = props();
    for (var i in p) S[i] = p[i];
  });
  return S;
};

Lightue.loop = function (count, generateItem) {
  var arr = [];
  for (var i = 0; i < count; i++) arr.push(generateItem ? generateItem(i) : "");
  return arr;
};

var htmlTags = [
  "fragment",
  "div",
  "span",
  "strong",
  "form",
  "label",
  "input",
  "select",
  "option",
  "textarea",
  "img",
  "button",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "a",
  "b",
  "nav",
  "ul",
  "li",
  "section",
  "header",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "main",
  "footer",
  "p",
];
// in 0.1.x version, we can't use div.myClass(children), but we can use div('.myClass', children) 
for (let tag of htmlTags) {
  if (tag == "fragment") tag = "";
  Lightue[tag] = (className, ...args) => {
    if (typeof className == 'string' && className[0] == '.')
      return new Node(tag + className, ...args);
    else
      return new Node(tag, className, ...args);
  }
}

export default Lightue;
