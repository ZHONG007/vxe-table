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

var _dom = require("../../tools/dom");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __assign = void 0 && (void 0).__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

var _default2 = (0, _vue.defineComponent)({
  name: 'VxeTooltip',
  props: {
    modelValue: Boolean,
    size: {
      type: String,
      default: function _default() {
        return _conf.default.tooltip.size || _conf.default.size;
      }
    },
    trigger: {
      type: String,
      default: function _default() {
        return _conf.default.tooltip.trigger;
      }
    },
    theme: {
      type: String,
      default: function _default() {
        return _conf.default.tooltip.theme;
      }
    },
    content: [String, Number],
    zIndex: [String, Number],
    isArrow: {
      type: Boolean,
      default: true
    },
    enterable: Boolean,
    leaveDelay: {
      type: Number,
      default: function _default() {
        return _conf.default.tooltip.leaveDelay;
      }
    },
    leaveMethod: Function
  },
  emits: ['update:modelValue'],
  setup: function setup(props, context) {
    var slots = context.slots,
        emit = context.emit;

    var xID = _xeUtils.default.uniqueId();

    var computeSize = (0, _size.useSize)(props);
    var reactData = (0, _vue.reactive)({
      target: null,
      isUpdate: false,
      isHover: false,
      visible: false,
      message: '',
      tipTarget: null,
      tipZindex: 0,
      tipStore: {
        style: {},
        placement: '',
        arrowStyle: {}
      }
    });
    var refElem = (0, _vue.ref)();
    var refMaps = {
      refElem: refElem
    };
    var $xetooltip = {
      xID: xID,
      props: props,
      context: context,
      reactData: reactData,
      getRefMaps: function getRefMaps() {
        return refMaps;
      }
    };
    var tooltipMethods = {};
    var targetActive;

    var updateTipStyle = function updateTipStyle() {
      var tipTarget = reactData.tipTarget,
          tipStore = reactData.tipStore;

      if (tipTarget) {
        var _a = (0, _dom.getDomNode)(),
            scrollTop = _a.scrollTop,
            scrollLeft = _a.scrollLeft,
            visibleWidth = _a.visibleWidth;

        var _b = (0, _dom.getAbsolutePos)(tipTarget),
            top_1 = _b.top,
            left = _b.left;

        var el = refElem.value;
        var marginSize = 6;
        var offsetHeight = el.offsetHeight;
        var offsetWidth = el.offsetWidth;
        var tipLeft = left;
        var tipTop = top_1 - offsetHeight - marginSize;
        tipLeft = Math.max(marginSize, left + Math.floor((tipTarget.offsetWidth - offsetWidth) / 2));

        if (tipLeft + offsetWidth + marginSize > scrollLeft + visibleWidth) {
          tipLeft = scrollLeft + visibleWidth - offsetWidth - marginSize;
        }

        if (top_1 - offsetHeight < scrollTop + marginSize) {
          tipStore.placement = 'bottom';
          tipTop = top_1 + tipTarget.offsetHeight + marginSize;
        }

        tipStore.style.top = tipTop + "px";
        tipStore.style.left = tipLeft + "px";
        tipStore.arrowStyle.left = left - tipLeft + tipTarget.offsetWidth / 2 + "px";
      }
    };

    var updateValue = function updateValue(value) {
      if (value !== reactData.visible) {
        reactData.visible = value;
        reactData.isUpdate = true;
        emit('update:modelValue', value);
      }
    };

    var updateZindex = function updateZindex() {
      if (reactData.tipZindex < (0, _utils.getLastZIndex)()) {
        reactData.tipZindex = (0, _utils.nextZIndex)();
      }
    };

    var clickEvent = function clickEvent() {
      if (reactData.visible) {
        tooltipMethods.close();
      } else {
        tooltipMethods.open();
      }
    };

    var targetMouseenterEvent = function targetMouseenterEvent() {
      tooltipMethods.open();
    };

    var targetMouseleaveEvent = function targetMouseleaveEvent() {
      var trigger = props.trigger,
          enterable = props.enterable,
          leaveDelay = props.leaveDelay;
      targetActive = false;

      if (enterable && trigger === 'hover') {
        setTimeout(function () {
          if (!reactData.isHover) {
            tooltipMethods.close();
          }
        }, leaveDelay);
      } else {
        tooltipMethods.close();
      }
    };

    var wrapperMouseenterEvent = function wrapperMouseenterEvent() {
      reactData.isHover = true;
    };

    var wrapperMouseleaveEvent = function wrapperMouseleaveEvent(evnt) {
      var leaveMethod = props.leaveMethod,
          trigger = props.trigger,
          enterable = props.enterable,
          leaveDelay = props.leaveDelay;
      reactData.isHover = false;

      if (!leaveMethod || leaveMethod({
        $event: evnt
      }) !== false) {
        if (enterable && trigger === 'hover') {
          setTimeout(function () {
            if (!targetActive) {
              tooltipMethods.close();
            }
          }, leaveDelay);
        }
      }
    };

    tooltipMethods = {
      dispatchEvent: function dispatchEvent(type, params, evnt) {
        emit(type, Object.assign({
          $tooltip: $xetooltip,
          $event: evnt
        }, params));
      },
      open: function open(target, message) {
        return tooltipMethods.toVisible(target || reactData.target, message);
      },
      close: function close() {
        reactData.tipTarget = null;
        Object.assign(reactData.tipStore, {
          style: {},
          placement: '',
          arrowStyle: null
        });
        updateValue(false);
        return (0, _vue.nextTick)();
      },
      toVisible: function toVisible(target, message) {
        targetActive = true;

        if (target) {
          var tipStore = reactData.tipStore;
          var el = refElem.value;
          var parentNode = el.parentNode;

          if (!parentNode) {
            document.body.appendChild(el);
          }

          if (message) {
            reactData.message = message;
          }

          reactData.tipTarget = target;
          updateValue(true);
          updateZindex();
          tipStore.placement = 'top';
          tipStore.style = {
            width: 'auto',
            left: 0,
            top: 0,
            zIndex: props.zIndex || reactData.tipZindex
          };
          tipStore.arrowStyle = {
            left: '50%'
          };
          return tooltipMethods.updatePlacement();
        }

        return (0, _vue.nextTick)();
      },
      updatePlacement: function updatePlacement() {
        return (0, _vue.nextTick)().then(function () {
          var tipTarget = reactData.tipTarget;
          var el = refElem.value;

          if (tipTarget && el) {
            updateTipStyle();
            return (0, _vue.nextTick)().then(updateTipStyle);
          }
        });
      }
    };
    Object.assign($xetooltip, tooltipMethods);
    (0, _vue.watch)(function () {
      return props.content;
    }, function () {
      reactData.message = props.content;
    });
    (0, _vue.watch)(function () {
      return props.modelValue;
    }, function () {
      if (!reactData.isUpdate) {
        if (props.modelValue) {
          tooltipMethods.open();
        } else {
          tooltipMethods.close();
        }
      }

      reactData.isUpdate = false;
    });
    (0, _vue.onMounted)(function () {
      (0, _vue.nextTick)(function () {
        var trigger = props.trigger,
            content = props.content,
            modelValue = props.modelValue;
        var wrapperElem = refElem.value;
        var parentNode = wrapperElem.parentNode;

        if (parentNode) {
          reactData.message = content;
          reactData.tipZindex = (0, _utils.nextZIndex)();

          _xeUtils.default.arrayEach(wrapperElem.children, function (elem, index) {
            if (index > 1) {
              parentNode.insertBefore(elem, wrapperElem);

              if (!reactData.target) {
                reactData.target = elem;
              }
            }
          });

          parentNode.removeChild(wrapperElem);
          var target = reactData.target;

          if (target) {
            if (trigger === 'hover') {
              target.onmouseleave = targetMouseleaveEvent;
              target.onmouseenter = targetMouseenterEvent;
            } else if (trigger === 'click') {
              target.onclick = clickEvent;
            }
          }

          if (modelValue) {
            tooltipMethods.open();
          }
        }
      });
    });
    (0, _vue.onBeforeUnmount)(function () {
      var trigger = props.trigger;
      var target = reactData.target;
      var wrapperElem = refElem.value;

      if (wrapperElem) {
        var parentNode = wrapperElem.parentNode;

        if (parentNode) {
          parentNode.removeChild(wrapperElem);
        }
      }

      if (target) {
        if (trigger === 'hover') {
          target.onmouseenter = null;
          target.onmouseleave = null;
        } else if (trigger === 'click') {
          target.onclick = null;
        }
      }
    });

    var renderVN = function renderVN() {
      var _a;

      var theme = props.theme,
          isArrow = props.isArrow,
          enterable = props.enterable;
      var isHover = reactData.isHover,
          visible = reactData.visible,
          tipStore = reactData.tipStore,
          message = reactData.message;
      var vSize = computeSize.value;
      var ons;

      if (enterable) {
        ons = {
          onMouseenter: wrapperMouseenterEvent,
          onMouseleave: wrapperMouseleaveEvent
        };
      }

      return (0, _vue.h)('div', __assign({
        ref: refElem,
        class: ['vxe-table--tooltip-wrapper', "theme--" + theme, (_a = {}, _a["size--" + vSize] = vSize, _a["placement--" + tipStore.placement] = tipStore.placement, _a['is--enterable'] = enterable, _a['is--visible'] = visible, _a['is--arrow'] = isArrow, _a['is--hover'] = isHover, _a)],
        style: tipStore.style
      }, ons), [(0, _vue.h)('div', {
        class: 'vxe-table--tooltip-content'
      }, slots.content ? slots.content({}) : (0, _utils.formatText)(message)), (0, _vue.h)('div', {
        class: 'vxe-table--tooltip-arrow',
        style: tipStore.arrowStyle
      })].concat(slots.default ? slots.default({}) : []));
    };

    $xetooltip.renderVN = renderVN;
    return $xetooltip;
  },
  render: function render() {
    return this.renderVN();
  }
});

exports.default = _default2;