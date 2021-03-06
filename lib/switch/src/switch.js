"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = require("vue");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _conf = _interopRequireDefault(require("../../v-x-e-table/src/conf"));

var _size = require("../../hooks/size");

var _utils = require("../../tools/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default2 = (0, _vue.defineComponent)({
  name: 'VxeSwitch',
  props: {
    modelValue: [String, Number, Boolean],
    disabled: Boolean,
    size: {
      type: String,
      default: function _default() {
        return _conf.default.switch.size || _conf.default.size;
      }
    },
    openLabel: String,
    closeLabel: String,
    openValue: {
      type: [String, Number, Boolean],
      default: true
    },
    closeValue: {
      type: [String, Number, Boolean],
      default: false
    },
    openIcon: String,
    closeIcon: String
  },
  emits: ['update:modelValue', 'change', 'focus', 'blur'],
  setup: function setup(props, context) {
    var emit = context.emit;

    var xID = _xeUtils.default.uniqueId();

    var computeSize = (0, _size.useSize)(props);
    var reactData = (0, _vue.reactive)({
      isActivated: false,
      hasAnimat: false,
      offsetLeft: 0
    });
    var $xeswitch = {
      xID: xID,
      props: props,
      context: context,
      reactData: reactData
    };
    var refButton = (0, _vue.ref)();
    var switchMethods = {};
    var computeOnShowLabel = (0, _vue.computed)(function () {
      return (0, _utils.getFuncText)(props.openLabel);
    });
    var computeOffShowLabel = (0, _vue.computed)(function () {
      return (0, _utils.getFuncText)(props.closeLabel);
    });
    var computeIsChecked = (0, _vue.computed)(function () {
      return props.modelValue === props.openValue;
    });

    var _atimeout;

    var clickEvent = function clickEvent(evnt) {
      if (!props.disabled) {
        var isChecked = computeIsChecked.value;
        clearTimeout(_atimeout);
        var value = isChecked ? props.closeValue : props.openValue;
        reactData.hasAnimat = true;
        emit('update:modelValue', value);
        switchMethods.dispatchEvent('change', {
          value: value
        }, evnt);
        _atimeout = setTimeout(function () {
          reactData.hasAnimat = false;
        }, 400);
      }
    };

    var focusEvent = function focusEvent(evnt) {
      reactData.isActivated = true;
      switchMethods.dispatchEvent('focus', {
        value: props.modelValue
      }, evnt);
    };

    var blurEvent = function blurEvent(evnt) {
      reactData.isActivated = false;
      switchMethods.dispatchEvent('blur', {
        value: props.modelValue
      }, evnt);
    };

    switchMethods = {
      dispatchEvent: function dispatchEvent(type, params, evnt) {
        emit(type, Object.assign({
          $switch: $xeswitch,
          $event: evnt
        }, params));
      },
      focus: function focus() {
        var btnElem = refButton.value;
        reactData.isActivated = true;
        btnElem.focus();
        return (0, _vue.nextTick)();
      },
      blur: function blur() {
        var btnElem = refButton.value;
        btnElem.blur();
        reactData.isActivated = false;
        return (0, _vue.nextTick)();
      }
    };
    Object.assign($xeswitch, switchMethods);

    var renderVN = function renderVN() {
      var _a;

      var disabled = props.disabled,
          openIcon = props.openIcon,
          closeIcon = props.closeIcon;
      var isChecked = computeIsChecked.value;
      var vSize = computeSize.value;
      var onShowLabel = computeOnShowLabel.value;
      var offShowLabel = computeOffShowLabel.value;
      return (0, _vue.h)('div', {
        class: ['vxe-switch', isChecked ? 'is--on' : 'is--off', (_a = {}, _a["size--" + vSize] = vSize, _a['is--disabled'] = disabled, _a['is--animat'] = reactData.hasAnimat, _a)]
      }, [(0, _vue.h)('button', {
        ref: refButton,
        class: 'vxe-switch--button',
        type: 'button',
        disabled: disabled,
        onClick: clickEvent,
        onFocus: focusEvent,
        onBlur: blurEvent
      }, [(0, _vue.h)('span', {
        class: 'vxe-switch--label vxe-switch--label-on'
      }, [openIcon ? (0, _vue.h)('i', {
        class: ['vxe-switch--label-icon', openIcon]
      }) : (0, _vue.createCommentVNode)(), onShowLabel]), (0, _vue.h)('span', {
        class: 'vxe-switch--label vxe-switch--label-off'
      }, [closeIcon ? (0, _vue.h)('i', {
        class: ['vxe-switch--label-icon', closeIcon]
      }) : (0, _vue.createCommentVNode)(), offShowLabel]), (0, _vue.h)('span', {
        class: 'vxe-switch--icon'
      })])]);
    };

    $xeswitch.renderVN = renderVN;
    return $xeswitch;
  },
  render: function render() {
    return this.renderVN();
  }
});

exports.default = _default2;