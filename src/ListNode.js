import domUpdaters from "./domUpdaters";
import { watchEffect } from "./useState";
import { safeRemove } from "./utils";

// A dynamic list mapped from an array state
export default function ListNode(arrState, renderItem) {
  this.arr = arrState; // arr state
  this.renderItem = renderItem; // user's mapper
  this.childNodes = [];
}

ListNode.prototype.mount = function (parentNode, oldListStart) {
  this.parentNode = parentNode;
  this.arrStart = new Comment("arr start");
  this.arrEnd = new Comment("arr end");
  parentNode.el.insertBefore(this.arrStart, oldListStart);
  parentNode.el.insertBefore(this.arrEnd, oldListStart);
  this.arr.forEach((item, i) => this.bindItemDom(item, i));
  return this;
};

ListNode.prototype.unmount = function (parentNode) {
  parentNode.el.removeChild(this.arrStart);
  parentNode.el.removeChild(this.arrEnd);
  this.childNodes.forEach(safeRemove);
  this.parentNode = null;
  this.arr = null;
};

ListNode.prototype.bindItemDom = function (item, i) {
  watchEffect(
    () => this.renderItem(item, i),
    (finalValue) =>
      domUpdaters.item(
        this.parentNode.el,
        finalValue,
        this.childNodes,
        i,
        this.arrEnd
      ),
    this.parentNode.el
  );
};

ListNode.prototype.splice = function (index, remove, ...insertArrState) {
  if (remove == insertArrState.length) {
    // no need to rerender other items as array length not changed
    insertArrState.forEach((item, i) => this.bindItemDom(item, index + i));
    return;
  }
  // bind new nodes
  insertArrState.forEach((item, i) => this.bindItemDom(item, index + i));
  // refresh index changed nodes
  for (let i = index + insertArrState.length; i < this.arr._length; i++) {
    this.bindItemDom(this.arr[i], i);
  }
  // remove extra nodes
  if (this.childNodes.length > this.arr._length) {
    for (let i = this.arr._length; i < this.childNodes.length; i++) {
      safeRemove(this.childNodes[i]);
    }
  }
};
