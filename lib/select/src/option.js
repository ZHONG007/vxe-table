"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = require("vue");

var _util = require("./util");

var _default = (0, _vue.defineComponent)({
  name: 'VxeOption',
  props: {
    value: null,
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
    var optgroup = (0, _vue.inject)('xeoptgroup', null);
    var option = (0, _util.createOption)($xeselect, props);
    option.slots = slots;
    (0, _util.watchOption)(props, option);
    (0, _vue.onMounted)(function () {
      (0, _util.assemOption)($xeselect, elem.value, option, optgroup);
    });
    (0, _vue.onUnmounted)(function () {
      (0, _util.destroyOption)($xeselect, option);
    });
    return function () {
      return (0, _vue.h)('div', {
        ref: elem
      });
    };
  }
});

exports.default = _default;