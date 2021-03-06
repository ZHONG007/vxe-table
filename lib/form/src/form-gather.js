"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = require("vue");

var _utils = require("../../tools/utils");

var _util = require("./util");

var _formItem = require("./form-item");

var _default = (0, _vue.defineComponent)({
  name: 'VxeFormGather',
  props: _formItem.formItemProps,
  setup: function setup(props, _a) {
    var slots = _a.slots;
    var refElem = (0, _vue.ref)();
    var $xeform = (0, _vue.inject)('$xeform', {});
    var formGather = (0, _vue.inject)('xeformgather', null);
    var defaultSlot = slots.default;
    var formItem = (0, _util.createItem)($xeform, props);
    var xeformitem = {
      formItem: formItem
    };
    formItem.children = [];
    (0, _vue.provide)('xeformgather', xeformitem);
    (0, _util.watchItem)(props, formItem);
    (0, _vue.onMounted)(function () {
      (0, _util.assemItem)($xeform, refElem.value, formItem, formGather);
    });
    (0, _vue.onUnmounted)(function () {
      (0, _util.destroyItem)($xeform, formItem);
    });

    if (process.env.NODE_ENV === 'development') {
      (0, _vue.nextTick)(function () {
        if ($xeform && $xeform.props.customLayout) {
          (0, _utils.errLog)('vxe.error.errConflicts', ['custom-layout', '<form-gather ...>']);
        }
      });
    }

    var renderVN = function renderVN() {
      return (0, _vue.h)('div', {
        ref: refElem
      }, defaultSlot ? defaultSlot() : []);
    };

    return renderVN;
  }
});

exports.default = _default;