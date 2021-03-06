"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = require("vue");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _utils = require("../../tools/utils");

var _conf = _interopRequireDefault(require("../../v-x-e-table/src/conf"));

var _size = require("../../hooks/size");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default2 = (0, _vue.defineComponent)({
  name: 'VxeRadioButton',
  props: {
    modelValue: [String, Number, Boolean],
    label: {
      type: [String, Number, Boolean],
      default: null
    },
    title: [String, Number],
    content: [String, Number],
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

    var computeSize = (0, _size.useSize)(props);
    var $xeradiobutton = {
      xID: xID,
      props: props,
      context: context
    };
    var radioButtonMethods = {};
    var $xeradiogroup = (0, _vue.inject)('$xeradiogroup', null);
    var computeDisabled = (0, _vue.computed)(function () {
      return props.disabled || $xeradiogroup && $xeradiogroup.props.disabled;
    });
    var computeName = (0, _vue.computed)(function () {
      return $xeradiogroup ? $xeradiogroup.name : null;
    });
    var computeChecked = (0, _vue.computed)(function () {
      var modelValue = props.modelValue,
          label = props.label;
      return $xeradiogroup ? $xeradiogroup.props.modelValue === label : modelValue === label;
    });
    radioButtonMethods = {
      dispatchEvent: function dispatchEvent(type, params, evnt) {
        emit(type, Object.assign({
          $radioButton: $xeradiobutton,
          $event: evnt
        }, params));
      }
    };
    Object.assign($xeradiobutton, radioButtonMethods);

    var changeEvent = function changeEvent(evnt) {
      var label = props.label;
      var isDisabled = computeDisabled.value;

      if (!isDisabled) {
        if ($xeradiogroup) {
          $xeradiogroup.handleChecked({
            label: label
          }, evnt);
        } else {
          emit('update:modelValue', label);
          radioButtonMethods.dispatchEvent('change', {
            label: label
          }, evnt);
        }
      }
    };

    var renderVN = function renderVN() {
      var _a;

      var vSize = computeSize.value;
      var isDisabled = computeDisabled.value;
      var name = computeName.value;
      var checked = computeChecked.value;
      return (0, _vue.h)('label', {
        class: ['vxe-radio', 'vxe-radio-button', (_a = {}, _a["size--" + vSize] = vSize, _a['is--disabled'] = isDisabled, _a)],
        title: props.title
      }, [(0, _vue.h)('input', {
        class: 'vxe-radio--input',
        type: 'radio',
        name: name,
        checked: checked,
        disabled: isDisabled,
        onChange: changeEvent
      }), (0, _vue.h)('span', {
        class: 'vxe-radio--label'
      }, slots.default ? slots.default({}) : (0, _utils.getFuncText)(props.content))]);
    };

    Object.assign($xeradiobutton, {
      renderVN: renderVN,
      dispatchEvent: dispatchEvent
    });
    return renderVN;
  }
});

exports.default = _default2;