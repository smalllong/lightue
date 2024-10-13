// this file contains methods that actually do the dom updating for various parts in VDomSrc

import ListNode from "./ListNode";
import Node from "./Node";
import { isPrimitive, safeRemove } from "./utils";

const domUpdaters = {
  $class: (j) => (el, v) => el.classList[v ? "add" : "remove"](j),
  // conditionally switch between elem and its placeholder
  $if: (el, v) => {
    var node = el.VNode;
    // stop handling detached el
    if (el != node.el) return;
    if (!node.placeholder) node.placeholder = new Comment();
    if (v && node.isStashed) {
      node.placeholder.parentNode?.insertBefore(el, node.placeholder);
      node.placeholder.remove();
      node.isStashed = false;
    } else if (!v && !node.isStashed) {
      el.parentNode?.insertBefore(node.placeholder, el);
      el.remove();
      node.isStashed = true;
    }
  },
  _: (attr) => (el, v) =>
    v != null && v !== false
      ? el.setAttribute(attr, v)
      : el.removeAttribute(attr),
  item: (el, c, childNodes, i, arrEnd) => {
    let newNode = wrapNode(c);
    if (childNodes[i]) {
      el.insertBefore(newNode.currentEl, childNodes[i].currentEl);
      safeRemove(childNodes[i]);
    } else {
      el.insertBefore(newNode.currentEl, arrEnd);
    }
    childNodes[i] = newNode;
  },
  child: (i) => (el, c) => {
    var node = el.VNode;
    if (c instanceof ListNode) {
      const newList = c.mount(node, node[i]?.arrStart);
      node[i]?.unmount(node);
      node[i] = newList;
    } else if (Array.isArray(c)) {
      c.forEach((item) => {
        el.appendChild(wrapNode(item).currentEl);
      });
    } else {
      safeRemove(node.lastNodes[i]);
      if (c == null) return;
      node.lastNodes[i] = wrapNode(c);
      el.appendChild(node.lastNodes[i].currentEl);
    }
  },
};

// wrap any child into a real or fake Node
function wrapNode(value) {
  if (isPrimitive(value)) return { currentEl: document.createTextNode(value) };
  else if (value instanceof Node) return value;
}

export default domUpdaters;
