"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = require("vue");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _conf = _interopRequireDefault(require("../../v-x-e-table/src/conf"));

var _size = require("../../hooks/size");

var _dom = require("../../tools/dom");

var _utils = require("../../tools/utils");

var _event = require("../../tools/event");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default2 = (0, _vue.defineComponent)({
  name: 'VxeButton',
  props: {
    /**
     * 按钮类型
     */
    type: String,
    className: String,

    /**
     * 按钮尺寸
     */
    size: {
      type: String,
      default: function _default() {
        return _conf.default.button.size || _conf.default.size;
      }
    },

    /**
     * 用来标识这一项
     */
    name: [String, Number],

    /**
     * 按钮内容
     */
    content: String,

    /**
     * 固定显示下拉面板的方向
     */
    placement: String,

    /**
     * 按钮状态
     */
    status: String,

    /**
     * 按钮的图标
     */
    icon: String,

    /**
     * 圆角边框
     */
    round: Boolean,

    /**
     * 圆角按钮
     */
    circle: Boolean,

    /**
     * 是否禁用
     */
    disabled: Boolean,

    /**
     * 是否加载中
     */
    loading: Boolean,

    /**
     * 在下拉面板关闭时销毁内容
     */
    destroyOnClose: Boolean,

    /**
     * 是否将弹框容器插入于 body 内
     */
    transfer: {
      type: Boolean,
      default: function _default() {
        return _conf.default.button.transfer;
      }
    }
  },
  emits: ['click', 'dropdown-click'],
  setup: function setup(props, context) {
    var slots = context.slots,
        emit = context.emit;

    var xID = _xeUtils.default.uniqueId();

    var computeSize = (0, _size.useSize)(props);
    var reactData = (0, _vue.reactive)({
      inited: false,
      showPanel: false,
      animatVisible: false,
      panelIndex: 0,
      panelStyle: {},
      panelPlacement: ''
    });
    var internalData = {
      showTime: null
    };
    var refElem = (0, _vue.ref)();
    var refButton = (0, _vue.ref)();
    var refBtnPanel = (0, _vue.ref)();
    var refMaps = {
      refElem: refElem
    };
    var $xebutton = {
      xID: xID,
      props: props,
      context: context,
      reactData: reactData,
      internalData: internalData,
      getRefMaps: function getRefMaps() {
        return refMaps;
      }
    };
    var buttonMethods = {};
    var computeIsFormBtn = (0, _vue.computed)(function () {
      var type = props.type;

      if (type) {
        return ['submit', 'reset', 'button'].indexOf(type) > -1;
      }

      return false;
    });
    var computeBtnType = (0, _vue.computed)(function () {
      var type = props.type;
      return type && type === 'text' ? type : 'button';
    });

    var updateZindex = function updateZindex() {
      if (reactData.panelIndex < (0, _utils.getLastZIndex)()) {
        reactData.panelIndex = (0, _utils.nextZIndex)();
      }
    };

    var updatePlacement = function updatePlacement() {
      return (0, _vue.nextTick)().then(function () {
        var transfer = props.transfer,
            placement = props.placement;
        var panelIndex = reactData.panelIndex;
        var targetElem = refButton.value;
        var panelElem = refBtnPanel.value;

        if (panelElem && targetElem) {
          var targetHeight = targetElem.offsetHeight;
          var targetWidth = targetElem.offsetWidth;
          var panelHeight = panelElem.offsetHeight;
          var panelWidth = panelElem.offsetWidth;
          var marginSize = 5;
          var panelStyle = {
            zIndex: panelIndex
          };

          var _a = (0, _dom.getAbsolutePos)(targetElem),
              boundingTop = _a.boundingTop,
              boundingLeft = _a.boundingLeft,
              visibleHeight = _a.visibleHeight,
              visibleWidth = _a.visibleWidth;

          var panelPlacement = 'bottom';

          if (transfer) {
            var left = boundingLeft + targetWidth - panelWidth;
            var top_1 = boundingTop + targetHeight;

            if (placement === 'top') {
              panelPlacement = 'top';
              top_1 = boundingTop - panelHeight;
            } else if (!placement) {
              // 如果下面不够放，则向上
              if (top_1 + panelHeight + marginSize > visibleHeight) {
                panelPlacement = 'top';
                top_1 = boundingTop - panelHeight;
              } // 如果上面不够放，则向下（优先）


              if (top_1 < marginSize) {
                panelPlacement = 'bottom';
                top_1 = boundingTop + targetHeight;
              }
            } // 如果溢出右边


            if (left + panelWidth + marginSize > visibleWidth) {
              left -= left + panelWidth + marginSize - visibleWidth;
            } // 如果溢出左边


            if (left < marginSize) {
              left = marginSize;
            }

            Object.assign(panelStyle, {
              left: left + "px",
              right: 'auto',
              top: top_1 + "px",
              minWidth: targetWidth + "px"
            });
          } else {
            if (placement === 'top') {
              panelPlacement = 'top';
              panelStyle.bottom = targetHeight + "px";
            } else if (!placement) {
              // 如果下面不够放，则向上
              if (boundingTop + targetHeight + panelHeight > visibleHeight) {
                // 如果上面不够放，则向下（优先）
                if (boundingTop - targetHeight - panelHeight > marginSize) {
                  panelPlacement = 'top';
                  panelStyle.bottom = targetHeight + "px";
                }
              }
            }
          }

          reactData.panelStyle = panelStyle;
          reactData.panelPlacement = panelPlacement;
          return (0, _vue.nextTick)();
        }
      });
    };

    var clickEvent = function clickEvent(evnt) {
      buttonMethods.dispatchEvent('click', {
        $event: evnt
      }, evnt);
    };

    var mousedownDropdownEvent = function mousedownDropdownEvent(evnt) {
      var isLeftBtn = evnt.button === 0;

      if (isLeftBtn) {
        evnt.stopPropagation();
      }
    };

    var clickDropdownEvent = function clickDropdownEvent(evnt) {
      var dropdownElem = evnt.currentTarget;
      var panelElem = refBtnPanel.value;

      var _a = (0, _dom.getEventTargetNode)(evnt, dropdownElem, 'vxe-button'),
          flag = _a.flag,
          targetElem = _a.targetElem;

      if (flag) {
        if (panelElem) {
          panelElem.dataset.active = 'N';
        }

        reactData.showPanel = false;
        setTimeout(function () {
          if (!panelElem || panelElem.dataset.active !== 'Y') {
            reactData.animatVisible = false;
          }
        }, 350);
        buttonMethods.dispatchEvent('dropdown-click', {
          name: targetElem.getAttribute('name'),
          $event: evnt
        }, evnt);
      }
    };

    var mouseenterEvent = function mouseenterEvent() {
      var panelElem = refBtnPanel.value;

      if (panelElem) {
        panelElem.dataset.active = 'Y';
        reactData.animatVisible = true;
        setTimeout(function () {
          if (panelElem.dataset.active === 'Y') {
            reactData.showPanel = true;
            updateZindex();
            updatePlacement();
            setTimeout(function () {
              if (reactData.showPanel) {
                updatePlacement();
              }
            }, 50);
          }
        }, 20);
      }
    };

    var mouseenterTargetEvent = function mouseenterTargetEvent() {
      var panelElem = refBtnPanel.value;

      if (panelElem) {
        panelElem.dataset.active = 'Y';

        if (!reactData.inited) {
          reactData.inited = true;
        }

        internalData.showTime = setTimeout(function () {
          if (panelElem.dataset.active === 'Y') {
            mouseenterEvent();
          } else {
            reactData.animatVisible = false;
          }
        }, 250);
      }
    };

    var closePanel = function closePanel() {
      var panelElem = refBtnPanel.value;
      clearTimeout(internalData.showTime);

      if (panelElem) {
        panelElem.dataset.active = 'N';
        setTimeout(function () {
          if (panelElem.dataset.active !== 'Y') {
            reactData.showPanel = false;
            setTimeout(function () {
              if (panelElem.dataset.active !== 'Y') {
                reactData.animatVisible = false;
              }
            }, 350);
          }
        }, 100);
      } else {
        reactData.animatVisible = false;
        reactData.showPanel = false;
      }
    };

    var mouseleaveEvent = function mouseleaveEvent() {
      closePanel();
    };

    var renderContent = function renderContent() {
      var content = props.content,
          icon = props.icon,
          loading = props.loading;
      var contVNs = [];

      if (loading) {
        contVNs.push((0, _vue.h)('i', {
          class: ['vxe-button--loading-icon', _conf.default.icon.BUTTON_LOADING]
        }));
      } else if (icon) {
        contVNs.push((0, _vue.h)('i', {
          class: ['vxe-button--icon', icon]
        }));
      }

      if (slots.default) {
        contVNs.push((0, _vue.h)('span', {
          class: 'vxe-button--content'
        }, slots.default({})));
      } else if (content) {
        contVNs.push((0, _vue.h)('span', {
          class: 'vxe-button--content'
        }, (0, _utils.getFuncText)(content)));
      }

      return contVNs;
    };

    buttonMethods = {
      dispatchEvent: function dispatchEvent(type, params, evnt) {
        emit(type, Object.assign({
          $button: $xebutton,
          $event: evnt
        }, params));
      },
      focus: function focus() {
        var btnElem = refButton.value;
        btnElem.focus();
        return (0, _vue.nextTick)();
      },
      blur: function blur() {
        var btnElem = refButton.value;
        btnElem.blur();
        return (0, _vue.nextTick)();
      }
    };
    Object.assign($xebutton, buttonMethods);
    (0, _vue.onMounted)(function () {
      _event.GlobalEvent.on($xebutton, 'mousewheel', function (evnt) {
        var panelElem = refBtnPanel.value;

        if (reactData.showPanel && !(0, _dom.getEventTargetNode)(evnt, panelElem).flag) {
          closePanel();
        }
      });
    });
    (0, _vue.onUnmounted)(function () {
      _event.GlobalEvent.off($xebutton, 'mousewheel');
    });

    var renderVN = function renderVN() {
      var _a, _b, _c, _d;

      var className = props.className,
          transfer = props.transfer,
          type = props.type,
          round = props.round,
          circle = props.circle,
          destroyOnClose = props.destroyOnClose,
          status = props.status,
          name = props.name,
          disabled = props.disabled,
          loading = props.loading;
      var inited = reactData.inited,
          showPanel = reactData.showPanel;
      var isFormBtn = computeIsFormBtn.value;
      var btnType = computeBtnType.value;
      var vSize = computeSize.value;

      if (slots.dropdowns) {
        return (0, _vue.h)('div', {
          ref: refElem,
          class: ['vxe-button--dropdown', className, (_a = {}, _a["size--" + vSize] = vSize, _a['is--active'] = showPanel, _a)]
        }, [(0, _vue.h)('button', {
          ref: refButton,
          class: ['vxe-button', "type--" + btnType, (_b = {}, _b["size--" + vSize] = vSize, _b["theme--" + status] = status, _b['is--round'] = round, _b['is--circle'] = circle, _b['is--disabled'] = disabled || loading, _b['is--loading'] = loading, _b)],
          name: name,
          type: isFormBtn ? type : 'button',
          disabled: disabled || loading,
          onMouseenter: mouseenterTargetEvent,
          onMouseleave: mouseleaveEvent,
          onClick: clickEvent
        }, renderContent().concat([(0, _vue.h)('i', {
          class: "vxe-button--dropdown-arrow " + _conf.default.icon.BUTTON_DROPDOWN
        })])), (0, _vue.h)(_vue.Teleport, {
          to: 'body',
          disabled: transfer ? !inited : true
        }, [(0, _vue.h)('div', {
          ref: refBtnPanel,
          class: ['vxe-button--dropdown-panel', (_c = {}, _c["size--" + vSize] = vSize, _c['animat--leave'] = reactData.animatVisible, _c['animat--enter'] = showPanel, _c)],
          placement: reactData.panelPlacement,
          style: reactData.panelStyle
        }, inited ? [(0, _vue.h)('div', {
          class: 'vxe-button--dropdown-wrapper',
          onMousedown: mousedownDropdownEvent,
          onClick: clickDropdownEvent,
          onMouseenter: mouseenterEvent,
          onMouseleave: mouseleaveEvent
        }, destroyOnClose && !showPanel ? [] : slots.dropdowns({}))] : [])])]);
      }

      return (0, _vue.h)('button', {
        ref: refButton,
        class: ['vxe-button', "type--" + btnType, (_d = {}, _d["size--" + vSize] = vSize, _d["theme--" + status] = status, _d['is--round'] = round, _d['is--circle'] = circle, _d['is--disabled'] = disabled || loading, _d['is--loading'] = loading, _d)],
        name: name,
        type: isFormBtn ? type : 'button',
        disabled: disabled || loading,
        onClick: clickEvent
      }, renderContent());
    };

    $xebutton.renderVN = renderVN;
    return $xebutton;
  },
  render: function render() {
    return this.renderVN();
  }
});

exports.default = _default2;