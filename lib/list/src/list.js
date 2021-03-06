"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = require("vue");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _conf = _interopRequireDefault(require("../../v-x-e-table/src/conf"));

var _size = require("../../hooks/size");

var _resize = require("../../tools/resize");

var _dom = require("../../tools/dom");

var _event = require("../../tools/event");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default2 = (0, _vue.defineComponent)({
  name: 'VxeList',
  props: {
    data: Array,
    height: [Number, String],
    maxHeight: [Number, String],
    loading: Boolean,
    className: [String, Function],
    size: {
      type: String,
      default: function _default() {
        return _conf.default.list.size || _conf.default.size;
      }
    },
    autoResize: {
      type: Boolean,
      default: function _default() {
        return _conf.default.list.autoResize;
      }
    },
    syncResize: [Boolean, String, Number],
    scrollY: Object
  },
  emits: ['scroll'],
  setup: function setup(props, context) {
    var slots = context.slots,
        emit = context.emit;

    var xID = _xeUtils.default.uniqueId();

    var computeSize = (0, _size.useSize)(props);
    var reactData = (0, _vue.reactive)({
      scrollYLoad: false,
      bodyHeight: 0,
      rowHeight: 0,
      topSpaceHeight: 0,
      items: []
    });
    var refElem = (0, _vue.ref)();
    var refVirtualWrapper = (0, _vue.ref)();
    var refVirtualBody = (0, _vue.ref)();
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
      getRefMaps: function getRefMaps() {
        return refMaps;
      }
    };
    var listMethods = {};
    var computeSYOpts = (0, _vue.computed)(function () {
      return Object.assign({}, _conf.default.list.scrollY, props.scrollY);
    });
    var computeStyles = (0, _vue.computed)(function () {
      var height = props.height,
          maxHeight = props.maxHeight;
      var style = {};

      if (height) {
        style.height = "" + (isNaN(height) ? height : height + "px");
      } else if (maxHeight) {
        style.height = 'auto';
        style.maxHeight = "" + (isNaN(maxHeight) ? maxHeight : maxHeight + "px");
      }

      return style;
    });

    var updateYSpace = function updateYSpace() {
      var scrollYLoad = reactData.scrollYLoad;
      var scrollYStore = internalData.scrollYStore,
          fullData = internalData.fullData;
      reactData.bodyHeight = scrollYLoad ? fullData.length * scrollYStore.rowHeight : 0;
      reactData.topSpaceHeight = scrollYLoad ? Math.max(scrollYStore.startIndex * scrollYStore.rowHeight, 0) : 0;
    };

    var handleData = function handleData() {
      var scrollYLoad = reactData.scrollYLoad;
      var fullData = internalData.fullData,
          scrollYStore = internalData.scrollYStore;
      reactData.items = scrollYLoad ? fullData.slice(scrollYStore.startIndex, scrollYStore.endIndex) : fullData.slice(0);
      return (0, _vue.nextTick)();
    };

    var updateYData = function updateYData() {
      handleData();
      updateYSpace();
    };

    var computeScrollLoad = function computeScrollLoad() {
      return (0, _vue.nextTick)().then(function () {
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
        scrollYStore.rowHeight = rowHeight; // ?????? Y ??????

        if (scrollYLoad) {
          var scrollBodyElem = refVirtualWrapper.value;
          var visibleYSize = Math.max(8, Math.ceil(scrollBodyElem.clientHeight / rowHeight));
          var offsetYSize = sYOpts.oSize ? _xeUtils.default.toNumber(sYOpts.oSize) : _dom.browse.edge ? 10 : 0;
          scrollYStore.offsetSize = offsetYSize;
          scrollYStore.visibleSize = visibleYSize;
          scrollYStore.endIndex = Math.max(scrollYStore.startIndex, visibleYSize + offsetYSize, scrollYStore.endIndex);
          updateYData();
        } else {
          updateYSpace();
        }

        reactData.rowHeight = rowHeight;
      });
    };
    /**
     * ???????????????
     */


    var clearScroll = function clearScroll() {
      var scrollBodyElem = refVirtualWrapper.value;

      if (scrollBodyElem) {
        scrollBodyElem.scrollTop = 0;
      }

      return (0, _vue.nextTick)();
    };
    /**
     * ????????????????????????????????????????????????
     * @param {Number} scrollLeft ?????????
     * @param {Number} scrollTop ?????????
     */


    var scrollTo = function scrollTo(scrollLeft, scrollTop) {
      var scrollBodyElem = refVirtualWrapper.value;

      if (_xeUtils.default.isNumber(scrollLeft)) {
        scrollBodyElem.scrollLeft = scrollLeft;
      }

      if (_xeUtils.default.isNumber(scrollTop)) {
        scrollBodyElem.scrollTop = scrollTop;
      }

      if (reactData.scrollYLoad) {
        return new Promise(function (resolve) {
          return setTimeout(function () {
            return resolve((0, _vue.nextTick)());
          }, 50);
        });
      }

      return (0, _vue.nextTick)();
    };
    /**
     * ???????????????
     */


    var refreshScroll = function refreshScroll() {
      var lastScrollLeft = internalData.lastScrollLeft,
          lastScrollTop = internalData.lastScrollTop;
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


    var recalculate = function recalculate() {
      var el = refElem.value;

      if (el.clientWidth && el.clientHeight) {
        return computeScrollLoad();
      }

      return Promise.resolve();
    };

    var loadYData = function loadYData(evnt) {
      var scrollYStore = internalData.scrollYStore;
      var startIndex = scrollYStore.startIndex,
          endIndex = scrollYStore.endIndex,
          visibleSize = scrollYStore.visibleSize,
          offsetSize = scrollYStore.offsetSize,
          rowHeight = scrollYStore.rowHeight;
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

    var scrollEvent = function scrollEvent(evnt) {
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

      listMethods.dispatchEvent('scroll', {
        scrollLeft: scrollLeft,
        scrollTop: scrollTop,
        isX: isX,
        isY: isY
      }, evnt);
    };

    listMethods = {
      dispatchEvent: function dispatchEvent(type, params, evnt) {
        emit(type, Object.assign({
          $list: $xelist,
          $event: evnt
        }, params));
      },

      /**
       * ????????????
       * @param {Array} datas ??????
       */
      loadData: function loadData(datas) {
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
      reloadData: function reloadData(datas) {
        clearScroll();
        return listMethods.loadData(datas);
      },
      recalculate: recalculate,
      scrollTo: scrollTo,
      refreshScroll: refreshScroll,
      clearScroll: clearScroll
    };
    Object.assign($xelist, listMethods);
    (0, _vue.watch)(function () {
      return props.data;
    }, function (value) {
      listMethods.loadData(value || []);
    });
    (0, _vue.watch)(function () {
      return props.syncResize;
    }, function (value) {
      if (value) {
        recalculate();
        (0, _vue.nextTick)(function () {
          return setTimeout(function () {
            return recalculate();
          });
        });
      }
    });
    var resizeObserver;
    (0, _vue.nextTick)(function () {
      _event.GlobalEvent.on($xelist, 'resize', function () {
        recalculate();
      });

      if (props.autoResize) {
        var el = refElem.value;
        resizeObserver = (0, _resize.createResizeEvent)(function () {
          return recalculate();
        });
        resizeObserver.observe(el);
      }

      listMethods.loadData(props.data || []);
    });
    (0, _vue.onUnmounted)(function () {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      _event.GlobalEvent.off($xelist, 'resize');
    });

    var renderVN = function renderVN() {
      var _a;

      var className = props.className,
          loading = props.loading;
      var bodyHeight = reactData.bodyHeight,
          topSpaceHeight = reactData.topSpaceHeight,
          items = reactData.items;
      var vSize = computeSize.value;
      var styles = computeStyles.value;
      return (0, _vue.h)('div', {
        ref: refElem,
        class: ['vxe-list', className ? _xeUtils.default.isFunction(className) ? className({
          $list: $xelist
        }) : className : '', (_a = {}, _a["size--" + vSize] = vSize, _a['is--loading'] = loading, _a)]
      }, [(0, _vue.h)('div', {
        ref: refVirtualWrapper,
        class: 'vxe-list--virtual-wrapper',
        style: styles,
        onScroll: scrollEvent
      }, [(0, _vue.h)('div', {
        class: 'vxe-list--y-space',
        style: {
          height: bodyHeight ? bodyHeight + "px" : ''
        }
      }), (0, _vue.h)('div', {
        ref: refVirtualBody,
        class: 'vxe-list--body',
        style: {
          marginTop: topSpaceHeight ? topSpaceHeight + "px" : ''
        }
      }, slots.default ? slots.default({
        items: items,
        $list: $xelist
      }) : [])]), (0, _vue.h)('div', {
        class: ['vxe-list--loading vxe-loading', {
          'is--visible': loading
        }]
      }, [(0, _vue.h)('div', {
        class: 'vxe-loading--spinner'
      })])]);
    };

    $xelist.renderVN = renderVN;
    return $xelist;
  },
  render: function render() {
    return this.renderVN();
  }
});

exports.default = _default2;