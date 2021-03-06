import { defineComponent, h, Teleport, ref, onUnmounted, reactive, nextTick } from 'vue';
import XEUtils from 'xe-utils';
import GlobalConfig from '../../v-x-e-table/src/conf';
import { useSize } from '../../hooks/size';
import { getAbsolutePos, getEventTargetNode } from '../../tools/dom';
import { getLastZIndex, nextZIndex } from '../../tools/utils';
import { GlobalEvent } from '../../tools/event';
export default defineComponent({
    name: 'VxePulldown',
    props: {
        disabled: Boolean,
        placement: String,
        size: { type: String, default: function () { return GlobalConfig.size; } },
        destroyOnClose: Boolean,
        transfer: Boolean
    },
    emits: [
        'hide-panel'
    ],
    setup: function (props, context) {
        var slots = context.slots, emit = context.emit;
        var xID = XEUtils.uniqueId();
        var computeSize = useSize(props);
        var reactData = reactive({
            inited: false,
            panelIndex: 0,
            panelStyle: null,
            panelPlacement: null,
            visiblePanel: false,
            animatVisible: false,
            isActivated: false
        });
        var refElem = ref();
        var refPulldowContent = ref();
        var refPulldowPnanel = ref();
        var refMaps = {
            refElem: refElem
        };
        var $xepulldown = {
            xID: xID,
            props: props,
            context: context,
            reactData: reactData,
            getRefMaps: function () { return refMaps; }
        };
        var pulldownMethods = {};
        var updateZindex = function () {
            if (reactData.panelIndex < getLastZIndex()) {
                reactData.panelIndex = nextZIndex();
            }
        };
        var isPanelVisible = function () {
            return reactData.visiblePanel;
        };
        /**
         * 手动更新位置
         */
        var updatePlacement = function () {
            return nextTick().then(function () {
                var transfer = props.transfer, placement = props.placement;
                var panelIndex = reactData.panelIndex, visiblePanel = reactData.visiblePanel;
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
                        var _a = getAbsolutePos(targetElem), boundingTop = _a.boundingTop, boundingLeft = _a.boundingLeft, visibleHeight = _a.visibleHeight, visibleWidth = _a.visibleWidth;
                        var panelPlacement = 'bottom';
                        if (transfer) {
                            var left = boundingLeft;
                            var top_1 = boundingTop + targetHeight;
                            if (placement === 'top') {
                                panelPlacement = 'top';
                                top_1 = boundingTop - panelHeight;
                            }
                            else if (!placement) {
                                // 如果下面不够放，则向上
                                if (top_1 + panelHeight + marginSize > visibleHeight) {
                                    panelPlacement = 'top';
                                    top_1 = boundingTop - panelHeight;
                                }
                                // 如果上面不够放，则向下（优先）
                                if (top_1 < marginSize) {
                                    panelPlacement = 'bottom';
                                    top_1 = boundingTop + targetHeight;
                                }
                            }
                            // 如果溢出右边
                            if (left + panelWidth + marginSize > visibleWidth) {
                                left -= left + panelWidth + marginSize - visibleWidth;
                            }
                            // 如果溢出左边
                            if (left < marginSize) {
                                left = marginSize;
                            }
                            Object.assign(panelStyle, {
                                left: left + "px",
                                top: top_1 + "px",
                                minWidth: targetWidth + "px"
                            });
                        }
                        else {
                            if (placement === 'top') {
                                panelPlacement = 'top';
                                panelStyle.bottom = targetHeight + "px";
                            }
                            else if (!placement) {
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
                return nextTick();
            });
        };
        var hidePanelTimeout;
        /**
         * 显示下拉面板
         */
        var showPanel = function () {
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
                }
                else {
                    resolve(nextTick());
                }
            });
        };
        /**
         * 隐藏下拉面板
         */
        var hidePanel = function () {
            reactData.visiblePanel = false;
            return new Promise(function (resolve) {
                if (reactData.animatVisible) {
                    hidePanelTimeout = window.setTimeout(function () {
                        reactData.animatVisible = false;
                        resolve(nextTick());
                    }, 350);
                }
                else {
                    resolve(nextTick());
                }
            });
        };
        /**
         * 切换下拉面板
         */
        var togglePanel = function () {
            if (reactData.visiblePanel) {
                return hidePanel();
            }
            return showPanel();
        };
        var handleGlobalMousewheelEvent = function (evnt) {
            var disabled = props.disabled;
            var visiblePanel = reactData.visiblePanel;
            var panelElem = refPulldowPnanel.value;
            if (!disabled) {
                if (visiblePanel) {
                    if (getEventTargetNode(evnt, panelElem).flag) {
                        updatePlacement();
                    }
                    else {
                        hidePanel();
                        pulldownMethods.dispatchEvent('hide-panel', {}, evnt);
                    }
                }
            }
        };
        var handleGlobalMousedownEvent = function (evnt) {
            var disabled = props.disabled;
            var visiblePanel = reactData.visiblePanel;
            var el = refElem.value;
            var panelElem = refPulldowPnanel.value;
            if (!disabled) {
                reactData.isActivated = getEventTargetNode(evnt, el).flag || getEventTargetNode(evnt, panelElem).flag;
                if (visiblePanel && !reactData.isActivated) {
                    hidePanel();
                    pulldownMethods.dispatchEvent('hide-panel', {}, evnt);
                }
            }
        };
        var handleGlobalBlurEvent = function (evnt) {
            if (reactData.visiblePanel) {
                reactData.isActivated = false;
                hidePanel();
                pulldownMethods.dispatchEvent('hide-panel', {}, evnt);
            }
        };
        pulldownMethods = {
            dispatchEvent: function (type, params, evnt) {
                emit(type, Object.assign({ $pulldown: $xepulldown, $event: evnt }, params));
            },
            isPanelVisible: isPanelVisible,
            togglePanel: togglePanel,
            showPanel: showPanel,
            hidePanel: hidePanel
        };
        Object.assign($xepulldown, pulldownMethods);
        nextTick(function () {
            GlobalEvent.on($xepulldown, 'mousewheel', handleGlobalMousewheelEvent);
            GlobalEvent.on($xepulldown, 'mousedown', handleGlobalMousedownEvent);
            GlobalEvent.on($xepulldown, 'blur', handleGlobalBlurEvent);
        });
        onUnmounted(function () {
            GlobalEvent.off($xepulldown, 'mousewheel');
            GlobalEvent.off($xepulldown, 'mousedown');
            GlobalEvent.off($xepulldown, 'blur');
        });
        var renderVN = function () {
            var _a, _b;
            var destroyOnClose = props.destroyOnClose, transfer = props.transfer, disabled = props.disabled;
            var inited = reactData.inited, isActivated = reactData.isActivated, animatVisible = reactData.animatVisible, visiblePanel = reactData.visiblePanel, panelStyle = reactData.panelStyle, panelPlacement = reactData.panelPlacement;
            var vSize = computeSize.value;
            return h('div', {
                ref: refElem,
                class: ['vxe-pulldown', (_a = {},
                        _a["size--" + vSize] = vSize,
                        _a['is--visivle'] = visiblePanel,
                        _a['is--disabled'] = disabled,
                        _a['is--active'] = isActivated,
                        _a)]
            }, [
                h('div', {
                    ref: refPulldowContent,
                    class: 'vxe-pulldown--content'
                }, slots.default ? slots.default({ $pulldown: $xepulldown }) : []),
                h(Teleport, {
                    to: 'body',
                    disabled: transfer ? !inited : true
                }, [
                    h('div', {
                        ref: refPulldowPnanel,
                        class: ['vxe-table--ignore-clear vxe-pulldown--panel', (_b = {},
                                _b["size--" + vSize] = vSize,
                                _b['is--transfer'] = transfer,
                                _b['animat--leave'] = animatVisible,
                                _b['animat--enter'] = visiblePanel,
                                _b)],
                        placement: panelPlacement,
                        style: panelStyle
                    }, slots.dropdown ? [
                        h('div', {
                            class: 'vxe-pulldown--wrapper'
                        }, !inited || (destroyOnClose && !visiblePanel && !animatVisible) ? [] : slots.dropdown({ $pulldown: $xepulldown }))
                    ] : [])
                ])
            ]);
        };
        $xepulldown.renderVN = renderVN;
        return $xepulldown;
    },
    render: function () {
        return this.renderVN();
    }
});
