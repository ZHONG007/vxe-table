"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = require("vue");

var _util = require("./util");

var _default = (0, _vue.defineComponent)({
  name: 'VxeOptgroup',
  props: {
    label: {
      type: [String, Number, Boolean],
      default: ''
    },
    visible: {
      type: Boolean,
      default: null
    },
    className: [String, Function],
    disabled: Boolean
  },
  setup: function setup(props, _a) {
    var slots = _a.slots;
    var elem = (0, _vue.ref)();
    var $xeselect = (0, _vue.inject)('$xeselect', {});
    var option = (0, _util.createOption)($xeselect, props);
    var xeoption = {
      option: option
    };
    option.options = [];
    (0, _vue.provide)('xeoptgroup', xeoption);
    (0, _util.watchOption)(props, option);
    (0, _vue.onMounted)(function () {
      (0, _util.assemOption)($xeselect, elem.value, option);
    });
    (0, _vue.onUnmounted)(function () {
      (0, _util.destroyOption)($xeselect, option);
    });
    return function () {
      return (0, _vue.h)('div', {
        ref: elem
      }, slots.default ? slots.default() : []);
    };
  }
});

exports.default = _default;