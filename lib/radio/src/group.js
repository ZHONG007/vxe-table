"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = require("vue");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _conf = _interopRequireDefault(require("../../v-x-e-table/src/conf"));

var _size = require("../../hooks/size");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default2 = (0, _vue.defineComponent)({
  name: 'VxeRadioGroup',
  props: {
    modelValue: [String, Number, Boolean],
    disabled: Boolean,
    size: {
      type: String,
      default: function _default() {
        return _conf.default.radio.size || _conf.default.size;
      }
    }
  },
  emits: ['update:modelValue', 'change'],
  setup: function setup(props, context) {
    var slots = context.slots,
        emit = context.emit;

    var xID = _xeUtils.default.uniqueId();

    var $xeradiogroup = {
      xID: xID,
      props: props,
      context: context,
      name: _xeUtils.default.uniqueId('xegroup_')
    };
    var radioGroupMethods = {};
    (0, _size.useSize)(props);
    var radioGroupPrivateMethods = {
      handleChecked: function handleChecked(params) {
        emit('update:modelValue', params.label);
        radioGroupMethods.dispatchEvent('change', params);
      }
    };
    radioGroupMethods = {
      dispatchEvent: function dispatchEvent(type, params, evnt) {
        emit(type, Object.assign({
          $radioGroup: $xeradiogroup,
          $event: evnt
        }, params));
      }
    };

    var renderVN = function renderVN() {
      return (0, _vue.h)('div', {
        class: 'vxe-radio-group'
      }, slots.default ? slots.default({}) : []);
    };

    Object.assign($xeradiogroup, radioGroupPrivateMethods, {
      renderVN: renderVN,
      dispatchEvent: dispatchEvent
    });
    (0, _vue.provide)('$xeradiogroup', $xeradiogroup);
    return renderVN;
  }
});

exports.default = _default2;