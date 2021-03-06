"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assemItem = assemItem;
exports.createItem = createItem;
exports.destroyItem = destroyItem;
exports.isFormItem = isFormItem;
exports.watchItem = watchItem;

var _vue = require("vue");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _itemInfo = require("./itemInfo");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isFormItem(item) {
  return item instanceof _itemInfo.ItemInfo;
}

function createItem($xeform, _vm) {
  return isFormItem(_vm) ? _vm : new _itemInfo.ItemInfo($xeform, _vm);
}

function watchItem(props, formItem) {
  Object.keys(props).forEach(function (name) {
    (0, _vue.watch)(function () {
      return props[name];
    }, function (value) {
      formItem.update(name, value);
    });
  });
}

function assemItem($xeform, el, formItem, formGather) {
  var reactData = $xeform.reactData;
  var staticItems = reactData.staticItems;
  var parentElem = el.parentNode;
  var parentItem = formGather ? formGather.formItem : null;
  var parentItems = parentItem ? parentItem.children : staticItems;

  if (parentElem) {
    parentItems.splice(_xeUtils.default.arrayIndexOf(parentElem.children, el), 0, formItem);
    reactData.staticItems = staticItems.slice(0);
  }
}

function destroyItem($xeform, formItem) {
  var reactData = $xeform.reactData;
  var staticItems = reactData.staticItems;

  var index = _xeUtils.default.findIndexOf(staticItems, function (item) {
    return item.id === formItem.id;
  });

  if (index > -1) {
    staticItems.splice(index, 1);
  }

  reactData.staticItems = staticItems.slice(0);
}