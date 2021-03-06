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
  name: 'VxePulldown',
  props: {
    disabled: Boolean,
    placement: String,
    size: {
      type: String,
      default: function _default() {
        return _conf.default.size;
      }
    },
    destroyOnClose: Boolean,
    transfer: Boolean
  },
  emits: ['hide-panel'],
  setup: function setup(props, context) {
    var slots = context.slots,
        emit = context.emit;

    var xID = _xeUtils.default.uniqueId();

    var computeSize = (0, _size.useSize)(props);
    var reactData = (0, _vue.reactive)({
      inited: false,
      panelIndex: 0,
      panelStyle: null,
      panelPlacement: null,
      visiblePanel: false,
      animatVisible: false,
      isActivated: false
    });
    var refElem = (0, _vue.ref)();
    var refPulldowContent = (0, _vue.ref)();
    var refPulldowPnanel = (0, _vue.ref)();
    var refMaps = {
      refElem: refElem
    };
    var $xepulldown = {
      xID: xID,
      props: props,
      context: context,
      reactData: reactData,
      getRefMaps: function getRefMaps() {
        return refMaps;
      }
    };
    var pulldownMethods = {};

    var updateZindex = function updateZindex() {
      if (reactData.panelIndex < (0, _utils.getLastZIndex)()) {
        reactData.panelIndex = (0, _utils.nextZIndex)();
      }
    };

    var isPanelVisible = function isPanelVisible() {
      return reactData.visiblePanel;
    };
    /**
     * 手动更新位置
     */


    var updatePlacement = function updatePlacement() {
      return (0, _vue.nextTick)().then(function () {
        var transfer = props.transfer,
            placement = props.placement;
        var panelIndex = reactData.panelIndex,
            visiblePanel = reactData.visiblePanel;

        if (visiblePanel) {
          var targetElem = refPulldowContent.value;
          var panelElem = refPulldowPnanel.value;

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
              var left = boundingLeft;
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
          }
        }

        return (0, _vue.nextTick)();
      });
    };

    var hidePanelTimeout;
    /**
     * 显示下拉面板
     */

    var showPanel = function showPanel() {
      if (!reactData.inited) {
        reactData.inited = true;
      }

      return new Promise(function (resolve) {
        if (!props.disabled) {
          clearTimeout(hidePanelTimeout);
          reactData.isActivated = true;
          reactData.animatVisible = true;
          setTimeout(function () {
            reactData.visiblePanel = true;
            updatePlacement();
            setTimeout(function () {
              resolve(updatePlacement());
            }, 40);
          }, 10);
          updateZindex();
        } else {
          resolve((0, _vue.nextTick)());
        }
      });
    };
    /**
     * 隐藏下拉面板
     */


    var hidePanel = function hidePanel() {
      reactData.visiblePanel = false;
      return new Promise(function (resolve) {
        if (reactData.animatVisible) {
          hidePanelTimeout = window.setTimeout(function () {
            reactData.animatVisible = false;
            resolve((0, _vue.nextTick)());
          }, 350);
        } else {
          resolve((0, _vue.nextTick)());
        }
      });
    };
    /**
     * 切换下拉面板
     */


    var togglePanel = function togglePanel() {
      if (reactData.visiblePanel) {
        return hidePanel();
      }

      return showPanel();
    };

    var handleGlobalMousewheelEvent = function handleGlobalMousewheelEvent(evnt) {
      var disabled = props.disabled;
      var visiblePanel = reactData.visiblePanel;
      var panelElem = refPulldowPnanel.value;

      if (!disabled) {
        if (visiblePanel) {
          if ((0, _dom.getEventTargetNode)(evnt, panelElem).flag) {
            updatePlacement();
          } else {
            hidePanel();
            pulldownMethods.dispatchEvent('hide-panel', {}, evnt);
          }
        }
      }
    };

    var handleGlobalMousedownEvent = function handleGlobalMousedownEvent(evnt) {
      var disabled = props.disabled;
      var visiblePanel = reactData.visiblePanel;
      var el = refElem.value;
      var panelElem = refPulldowPnanel.value;

      if (!disabled) {
        reactData.isActivated = (0, _dom.getEventTargetNode)(evnt, el).flag || (0, _dom.getEventTargetNode)(evnt, panelElem).flag;

        if (visiblePanel && !reactData.isActivated) {
          hidePanel();
          pulldownMethods.dispatchEvent('hide-panel', {}, evnt);
        }
      }
    };

    var handleGlobalBlurEvent = function handleGlobalBlurEvent(evnt) {
      if (reactData.visiblePanel) {
        reactData.isActivated = false;
        hidePanel();
        pulldownMethods.dispatchEvent('hide-panel', {}, evnt);
      }
    };

    pulldownMethods = {
      dispatchEvent: function dispatchEvent(type, params, evnt) {
        emit(type, Object.assign({
          $pulldown: $xepulldown,
          $event: evnt
        }, params));
      },
      isPanelVisible: isPanelVisible,
      togglePanel: togglePanel,
      showPanel: showPanel,
      hidePanel: hidePanel
    };
    Object.assign($xepulldown, pulldownMethods);
    (0, _vue.nextTick)(function () {
      _event.GlobalEvent.on($xepulldown, 'mousewheel', handleGlobalMousewheelEvent);

      _event.GlobalEvent.on($xepulldown, 'mousedown', handleGlobalMousedownEvent);

      _event.GlobalEvent.on($xepulldown, 'blur', handleGlobalBlurEvent);
    });
    (0, _vue.onUnmounted)(function () {
      _event.GlobalEvent.off($xepulldown, 'mousewheel');

      _event.GlobalEvent.off($xepulldown, 'mousedown');

      _event.GlobalEvent.off($xepulldown, 'blur');
    });

    var renderVN = function renderVN() {
      var _a, _b;

      var destroyOnClose = props.destroyOnClose,
          transfer = props.transfer,
          disabled = props.disabled;
      var inited = reactData.inited,
          isActivated = reactData.isActivated,
          animatVisible = reactData.animatVisible,
          visiblePanel = reactData.visiblePanel,
          panelStyle = reactData.panelStyle,
          panelPlacement = reactData.panelPlacement;
      var vSize = computeSize.value;
      return (0, _vue.h)('div', {
        ref: refElem,
        class: ['vxe-pulldown', (_a = {}, _a["size--" + vSize] = vSize, _a['is--visivle'] = visiblePanel, _a['is--disabled'] = disabled, _a['is--active'] = isActivated, _a)]
      }, [(0, _vue.h)('div', {
        ref: refPulldowContent,
        class: 'vxe-pulldown--content'
      }, slots.default ? slots.default({
        $pulldown: $xepulldown
      }) : []), (0, _vue.h)(_vue.Teleport, {
        to: 'body',
        disabled: transfer ? !inited : true
      }, [(0, _vue.h)('div', {
        ref: refPulldowPnanel,
        class: ['vxe-table--ignore-clear vxe-pulldown--panel', (_b = {}, _b["size--" + vSize] = vSize, _b['is--transfer'] = transfer, _b['animat--leave'] = animatVisible, _b['animat--enter'] = visiblePanel, _b)],
        placement: panelPlacement,
        style: panelStyle
      }, slots.dropdown ? [(0, _vue.h)('div', {
        class: 'vxe-pulldown--wrapper'
      }, !inited || destroyOnClose && !visiblePanel && !animatVisible ? [] : slots.dropdown({
        $pulldown: $xepulldown
      }))] : [])])]);
    };

    $xepulldown.renderVN = renderVN;
    return $xepulldown;
  },
  render: function render() {
    return this.renderVN();
  }
});

exports.default = _default2;