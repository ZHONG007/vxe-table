import { defineComponent, h, ref, computed, onUnmounted, watch, reactive, nextTick } from 'vue';
import XEUtils from 'xe-utils';
import GlobalConfig from '../../v-x-e-table/src/conf';
import { useSize } from '../../hooks/size';
import { createResizeEvent } from '../../tools/resize';
import { browse } from '../../tools/dom';
import { GlobalEvent } from '../../tools/event';
export default defineComponent({
    name: 'VxeList',
    props: {
        data: Array,
        height: [Number, String],
        maxHeight: [Number, String],
        loading: Boolean,
        className: [String, Function],
        size: { type: String, default: function () { return GlobalConfig.list.size || GlobalConfig.size; } },
        autoResize: { type: Boolean, default: function () { return GlobalConfig.list.autoResize; } },
        syncResize: [Boolean, String, Number],
        scrollY: Object
    },
    emits: [
        'scroll'
    ],
    setup: function (props, context) {
        var slots = context.slots, emit = context.emit;
        var xID = XEUtils.uniqueId();
        var computeSize = useSize(props);
        var reactData = reactive({
            scrollYLoad: false,
            bodyHeight: 0,
            rowHeight: 0,
            topSpaceHeight: 0,
            items: []
        });
        var refElem = ref();
        var refVirtualWrapper = ref();
        var refVirtualBody = ref();
        var internalData = {
            fullData: [],
            lastScrollLeft: 0,
            lastScrollTop: 0,
            scrollYStore: {
                startIndex: 0,
                endIndex: 0,
                visibleSize: 0,
                offsetSize: 0,
                rowHeight: 0
            }
        };
        var refMaps = {
            refElem: refElem
        };
        var $xelist = {
            xID: xID,
            props: props,
            context: context,
            reactData: reactData,
            internalData: internalData,
            getRefMaps: function () { return refMaps; }
        };
        var listMethods = {};
        var computeSYOpts = computed(function () {
            return Object.assign({}, GlobalConfig.list.scrollY, props.scrollY);
        });
        var computeStyles = computed(function () {
            var height = props.height, maxHeight = props.maxHeight;
            var style = {};
            if (height) {
                style.height = "" + (isNaN(height) ? height : height + "px");
            }
            else if (maxHeight) {
                style.height = 'auto';
                style.maxHeight = "" + (isNaN(maxHeight) ? maxHeight : maxHeight + "px");
            }
            return style;
        });
        var updateYSpace = function () {
            var scrollYLoad = reactData.scrollYLoad;
            var scrollYStore = internalData.scrollYStore, fullData = internalData.fullData;
            reactData.bodyHeight = scrollYLoad ? fullData.length * scrollYStore.rowHeight : 0;
            reactData.topSpaceHeight = scrollYLoad ? Math.max(scrollYStore.startIndex * scrollYStore.rowHeight, 0) : 0;
        };
        var handleData = function () {
            var scrollYLoad = reactData.scrollYLoad;
            var fullData = internalData.fullData, scrollYStore = internalData.scrollYStore;
            reactData.items = scrollYLoad ? fullData.slice(scrollYStore.startIndex, scrollYStore.endIndex) : fullData.slice(0);
            return nextTick();
        };
        var updateYData = function () {
            handleData();
            updateYSpace();
        };
        var computeScrollLoad = function () {
            return nextTick().then(function () {
                var scrollYLoad = reactData.scrollYLoad;
                var scrollYStore = internalData.scrollYStore;
                var virtualBodyElem = refVirtualBody.value;
                var sYOpts = computeSYOpts.value;
                var rowHeight = 0;
                var firstItemElem;
                if (virtualBodyElem) {
                    if (sYOpts.sItem) {
                        firstItemElem = virtualBodyElem.querySelector(sYOpts.sItem);
                    }
                    if (!firstItemElem) {
                        firstItemElem = virtualBodyElem.children[0];
                    }
                }
                if (firstItemElem) {
                    rowHeight = firstItemElem.offsetHeight;
                }
                rowHeight = Math.max(20, rowHeight);
                scrollYStore.rowHeight = rowHeight;
                // ?????? Y ??????
                if (scrollYLoad) {
                    var scrollBodyElem = refVirtualWrapper.value;
                    var visibleYSize = Math.max(8, Math.ceil(scrollBodyElem.clientHeight / rowHeight));
                    var offsetYSize = sYOpts.oSize ? XEUtils.toNumber(sYOpts.oSize) : (browse.edge ? 10 : 0);
                    scrollYStore.offsetSize = offsetYSize;
                    scrollYStore.visibleSize = visibleYSize;
                    scrollYStore.endIndex = Math.max(scrollYStore.startIndex, visibleYSize + offsetYSize, scrollYStore.endIndex);
                    updateYData();
                }
                else {
                    updateYSpace();
                }
                reactData.rowHeight = rowHeight;
            });
        };
        /**
         * ???????????????
         */
        var clearScroll = function () {
            var scrollBodyElem = refVirtualWrapper.value;
            if (scrollBodyElem) {
                scrollBodyElem.scrollTop = 0;
            }
            return nextTick();
        };
        /**
         * ????????????????????????????????????????????????
         * @param {Number} scrollLeft ?????????
         * @param {Number} scrollTop ?????????
         */
        var scrollTo = function (scrollLeft, scrollTop) {
            var scrollBodyElem = refVirtualWrapper.value;
            if (XEUtils.isNumber(scrollLeft)) {
                scrollBodyElem.scrollLeft = scrollLeft;
            }
            if (XEUtils.isNumber(scrollTop)) {
                scrollBodyElem.scrollTop = scrollTop;
            }
            if (reactData.scrollYLoad) {
                return new Promise(function (resolve) { return setTimeout(function () { return resolve(nextTick()); }, 50); });
            }
            return nextTick();
        };
        /**
         * ???????????????
         */
        var refreshScroll = function () {
            var lastScrollLeft = internalData.lastScrollLeft, lastScrollTop = internalData.lastScrollTop;
            return clearScroll().then(function () {
                if (lastScrollLeft || lastScrollTop) {
                    internalData.lastScrollLeft = 0;
                    internalData.lastScrollTop = 0;
                    return scrollTo(lastScrollLeft, lastScrollTop);
                }
            });
        };
        /**
         * ??????????????????
         */
        var recalculate = function () {
            var el = refElem.value;
            if (el.clientWidth && el.clientHeight) {
                return computeScrollLoad();
            }
            return Promise.resolve();
        };
        var loadYData = function (evnt) {
            var scrollYStore = internalData.scrollYStore;
            var startIndex = scrollYStore.startIndex, endIndex = scrollYStore.endIndex, visibleSize = scrollYStore.visibleSize, offsetSize = scrollYStore.offsetSize, rowHeight = scrollYStore.rowHeight;
            var scrollBodyElem = evnt.target;
            var scrollTop = scrollBodyElem.scrollTop;
            var toVisibleIndex = Math.floor(scrollTop / rowHeight);
            var offsetStartIndex = Math.max(0, toVisibleIndex - 1 - offsetSize);
            var offsetEndIndex = toVisibleIndex + visibleSize + offsetSize;
            if (toVisibleIndex <= startIndex || toVisibleIndex >= endIndex - visibleSize - 1) {
                if (startIndex !== offsetStartIndex || endIndex !== offsetEndIndex) {
                    scrollYStore.startIndex = offsetStartIndex;
                    scrollYStore.endIndex = offsetEndIndex;
                    updateYData();
                }
            }
        };
        var scrollEvent = function (evnt) {
            var scrollBodyElem = evnt.target;
            var scrollTop = scrollBodyElem.scrollTop;
            var scrollLeft = scrollBodyElem.scrollLeft;
            var isX = scrollLeft !== internalData.lastScrollLeft;
            var isY = scrollTop !== internalData.lastScrollTop;
            internalData.lastScrollTop = scrollTop;
            internalData.lastScrollLeft = scrollLeft;
            if (reactData.scrollYLoad) {
                loadYData(evnt);
            }
            listMethods.dispatchEvent('scroll', { scrollLeft: scrollLeft, scrollTop: scrollTop, isX: isX, isY: isY }, evnt);
        };
        listMethods = {
            dispatchEvent: function (type, params, evnt) {
                emit(type, Object.assign({ $list: $xelist, $event: evnt }, params));
            },
            /**
             * ????????????
             * @param {Array} datas ??????
             */
            loadData: function (datas) {
                var scrollYStore = internalData.scrollYStore;
                var sYOpts = computeSYOpts.value;
                var fullData = datas || [];
                Object.assign(scrollYStore, {
                    startIndex: 0,
                    endIndex: 1,
                    visibleSize: 0
                });
                internalData.fullData = fullData;
                reactData.scrollYLoad = !!sYOpts.enabled && sYOpts.gt > -1 && sYOpts.gt <= fullData.length;
                handleData();
                return computeScrollLoad().then(function () {
                    refreshScroll();
                });
            },
            /**
             * ??????????????????
             * @param {Array} datas ??????
             */
            reloadData: function (datas) {
                clearScroll();
                return listMethods.loadData(datas);
            },
            recalculate: recalculate,
            scrollTo: scrollTo,
            refreshScroll: refreshScroll,
            clearScroll: clearScroll
        };
        Object.assign($xelist, listMethods);
        watch(function () { return props.data; }, function (value) {
            listMethods.loadData(value || []);
        });
        watch(function () { return props.syncResize; }, function (value) {
            if (value) {
                recalculate();
                nextTick(function () { return setTimeout(function () { return recalculate(); }); });
            }
        });
        var resizeObserver;
        nextTick(function () {
            GlobalEvent.on($xelist, 'resize', function () {
                recalculate();
            });
            if (props.autoResize) {
                var el = refElem.value;
                resizeObserver = createResizeEvent(function () { return recalculate(); });
                resizeObserver.observe(el);
            }
            listMethods.loadData(props.data || []);
        });
        onUnmounted(function () {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
            GlobalEvent.off($xelist, 'resize');
        });
        var renderVN = function () {
            var _a;
            var className = props.className, loading = props.loading;
            var bodyHeight = reactData.bodyHeight, topSpaceHeight = reactData.topSpaceHeight, items = reactData.items;
            var vSize = computeSize.value;
            var styles = computeStyles.value;
            return h('div', {
                ref: refElem,
                class: ['vxe-list', className ? (XEUtils.isFunction(className) ? className({ $list: $xelist }) : className) : '', (_a = {},
                        _a["size--" + vSize] = vSize,
                        _a['is--loading'] = loading,
                        _a)]
            }, [
                h('div', {
                    ref: refVirtualWrapper,
                    class: 'vxe-list--virtual-wrapper',
                    style: styles,
                    onScroll: scrollEvent
                }, [
                    h('div', {
                        class: 'vxe-list--y-space',
                        style: {
                            height: bodyHeight ? bodyHeight + "px" : ''
                        }
                    }),
                    h('div', {
                        ref: refVirtualBody,
                        class: 'vxe-list--body',
                        style: {
                            marginTop: topSpaceHeight ? topSpaceHeight + "px" : ''
                        }
                    }, slots.default ? slots.default({ items: items, $list: $xelist }) : [])
                ]),
                h('div', {
                    class: ['vxe-list--loading vxe-loading', {
                            'is--visible': loading
                        }]
                }, [
                    h('div', {
                        class: 'vxe-loading--spinner'
                    })
                ])
            ]);
        };
        $xelist.renderVN = renderVN;
        return $xelist;
    },
    render: function () {
        return this.renderVN();
    }
});
