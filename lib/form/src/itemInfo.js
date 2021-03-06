"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ItemInfo = void 0;

var _xeUtils = _interopRequireDefault(require("xe-utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ItemInfo =
/** @class */
function () {
  function ItemInfo($xeform, item) {
    Object.assign(this, {
      id: _xeUtils.default.uniqueId('item_'),
      title: item.title,
      field: item.field,
      span: item.span,
      align: item.align,
      titleAlign: item.titleAlign,
      titleWidth: item.titleWidth,
      titlePrefix: item.titlePrefix,
      titleSuffix: item.titleSuffix,
      titleOverflow: item.titleOverflow,
      resetValue: item.resetValue,
      visibleMethod: item.visibleMethod,
      visible: item.visible,
      folding: item.folding,
      collapseNode: item.collapseNode,
      className: item.className,
      itemRender: item.itemRender,
      // 渲染属性
      showError: false,
      errRule: null,
      slots: item.slots,
      children: []
    });
  }

  ItemInfo.prototype.update = function (name, value) {
    this[name] = value;
  };

  return ItemInfo;
}();

exports.ItemInfo = ItemInfo;