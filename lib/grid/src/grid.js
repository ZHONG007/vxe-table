"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = require("vue");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _utils = require("../../tools/utils");

var _dom = require("../../tools/dom");

var _conf = _interopRequireDefault(require("../../v-x-e-table/src/conf"));

var _vXETable = require("../../v-x-e-table");

var _props = _interopRequireDefault(require("../../table/src/props"));

var _emits = _interopRequireDefault(require("../../table/src/emits"));

var _size = require("../../hooks/size");

var _event = require("../../tools/event");

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

var __spreadArray = void 0 && (void 0).__spreadArray || function (to, from) {
  for (var i = 0, il = from.length, j = to.length; i < il; i++, j++) {
    to[j] = from[i];
  }

  return to;
};

var tableComponentPropKeys = Object.keys(_props.default);
var tableComponentMethodKeys = ['clearAll', 'syncData', 'updateData', 'loadData', 'reloadData', 'reloadRow', 'loadColumn', 'reloadColumn', 'getRowNode', 'getColumnNode', 'getRowIndex', 'getVTRowIndex', 'getVMRowIndex', 'getColumnIndex', 'getVTColumnIndex', 'getVMColumnIndex', 'createData', 'createRow', 'revertData', 'clearData', 'isInsertByRow', 'isUpdateByRow', 'getColumns', 'getColumnById', 'getColumnByField', 'getTableColumn', 'getData', 'getCheckboxRecords', 'getRowById', 'getRowid', 'getTableData', 'hideColumn', 'showColumn', 'resetColumn', 'refreshColumn', 'refreshScroll', 'recalculate', 'closeTooltip', 'isAllCheckboxChecked', 'isAllCheckboxIndeterminate', 'getCheckboxIndeterminateRecords', 'setCheckboxRow', 'isCheckedByCheckboxRow', 'isIndeterminateByCheckboxRow', 'toggleCheckboxRow', 'setAllCheckboxRow', 'getRadioReserveRecord', 'clearRadioReserve', 'getCheckboxReserveRecords', 'clearCheckboxReserve', 'toggleAllCheckboxRow', 'clearCheckboxRow', 'setCurrentRow', 'isCheckedByRadioRow', 'setRadioRow', 'clearCurrentRow', 'clearRadioRow', 'getCurrentRecord', 'getRadioRecord', 'getCurrentColumn', 'setCurrentColumn', 'clearCurrentColumn', 'sort', 'clearSort', 'isSort', 'getSortColumns', 'closeFilter', 'isFilter', 'isRowExpandLoaded', 'clearRowExpandLoaded', 'reloadExpandContent', 'toggleRowExpand', 'setAllRowExpand', 'setRowExpand', 'isExpandByRow', 'clearRowExpand', 'clearRowExpandReserve', 'getRowExpandRecords', 'getTreeExpandRecords', 'isTreeExpandLoaded', 'clearTreeExpandLoaded', 'reloadTreeChilds', 'toggleTreeExpand', 'setAllTreeExpand', 'setTreeExpand', 'isTreeExpandByRow', 'clearTreeExpand', 'clearTreeExpandReserve', 'getScroll', 'scrollTo', 'scrollToRow', 'scrollToColumn', 'clearScroll', 'updateFooter', 'updateStatus', 'setMergeCells', 'removeMergeCells', 'getMergeCells', 'clearMergeCells', 'setMergeFooterItems', 'removeMergeFooterItems', 'getMergeFooterItems', 'clearMergeFooterItems', 'focus', 'blur', 'connect'];

var gridComponentEmits = __spreadArray(__spreadArray([], _emits.default), ['page-change', 'form-submit', 'form-submit-invalid', 'form-reset', 'form-collapse', 'form-toggle-collapse', 'toolbar-button-click', 'toolbar-tool-click', 'zoom']);

var _default2 = (0, _vue.defineComponent)({
  name: 'VxeGrid',
  props: __assign(__assign({}, _props.default), {
    columns: Array,
    pagerConfig: Object,
    proxyConfig: Object,
    toolbarConfig: Object,
    formConfig: Object,
    zoomConfig: Object,
    size: {
      type: String,
      default: function _default() {
        return _conf.default.grid.size || _conf.default.size;
      }
    }
  }),
  emits: gridComponentEmits,
  setup: function setup(props, context) {
    var slots = context.slots,
        emit = context.emit;

    var xID = _xeUtils.default.uniqueId();

    var instance = (0, _vue.getCurrentInstance)();
    var computeSize = (0, _size.useSize)(props);
    var reactData = (0, _vue.reactive)({
      tableLoading: false,
      proxyInited: false,
      isZMax: false,
      tableData: [],
      pendingRecords: [],
      filterData: [],
      formData: {},
      sortData: [],
      tZindex: 0,
      tablePage: {
        total: 0,
        pageSize: 10,
        currentPage: 1
      }
    });
    var refElem = (0, _vue.ref)();
    var refTable = (0, _vue.ref)();
    var refForm = (0, _vue.ref)();
    var refToolbar = (0, _vue.ref)();
    var refPager = (0, _vue.ref)();
    var refFormWrapper = (0, _vue.ref)();
    var refToolbarWrapper = (0, _vue.ref)();
    var refTopWrapper = (0, _vue.ref)();
    var refBottomWrapper = (0, _vue.ref)();
    var refPagerWrapper = (0, _vue.ref)();

    var extendTableMethods = function extendTableMethods(methodKeys) {
      var funcs = {};
      methodKeys.forEach(function (name) {
        funcs[name] = function () {
          var args = [];

          for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
          }

          var $xetable = refTable.value;
          return $xetable && $xetable[name].apply($xetable, args);
        };
      });
      return funcs;
    };

    var gridExtendTableMethods = extendTableMethods(tableComponentMethodKeys);
    tableComponentMethodKeys.forEach(function (name) {
      gridExtendTableMethods[name] = function () {
        var args = [];

        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }

        var $xetable = refTable.value;
        return $xetable && $xetable[name].apply($xetable, args);
      };
    });
    var computeProxyOpts = (0, _vue.computed)(function () {
      return Object.assign({}, _conf.default.grid.proxyConfig, props.proxyConfig);
    });
    var computeIsMsg = (0, _vue.computed)(function () {
      var proxyOpts = computeProxyOpts.value;
      return proxyOpts.message !== false;
    });
    var computePagerOpts = (0, _vue.computed)(function () {
      return Object.assign({}, _conf.default.grid.pagerConfig, props.pagerConfig);
    });
    var computeFormOpts = (0, _vue.computed)(function () {
      return Object.assign({}, _conf.default.grid.formConfig, props.formConfig);
    });
    var computeToolbarOpts = (0, _vue.computed)(function () {
      return Object.assign({}, _conf.default.grid.toolbarConfig, props.toolbarConfig);
    });
    var computeZoomOpts = (0, _vue.computed)(function () {
      return Object.assign({}, _conf.default.grid.zoomConfig, props.zoomConfig);
    });
    var computeStyles = (0, _vue.computed)(function () {
      return reactData.isZMax ? {
        zIndex: reactData.tZindex
      } : null;
    });
    var computeTableExtendProps = (0, _vue.computed)(function () {
      var rest = {};
      var gridProps = props;
      tableComponentPropKeys.forEach(function (key) {
        rest[key] = gridProps[key];
      });
      return rest;
    });
    var refMaps = {
      refElem: refElem,
      refTable: refTable,
      refForm: refForm,
      refToolbar: refToolbar,
      refPager: refPager
    };
    var computeMaps = {
      computeProxyOpts: computeProxyOpts,
      computePagerOpts: computePagerOpts,
      computeFormOpts: computeFormOpts,
      computeToolbarOpts: computeToolbarOpts,
      computeZoomOpts: computeZoomOpts
    };
    var $xegrid = {
      xID: xID,
      props: props,
      context: context,
      instance: instance,
      reactData: reactData,
      getRefMaps: function getRefMaps() {
        return refMaps;
      },
      getComputeMaps: function getComputeMaps() {
        return computeMaps;
      }
    };
    var gridMethods = {};

    var handleRowClassName = function handleRowClassName(params) {
      var pendingRecords = reactData.pendingRecords;
      var rowClassName = props.rowClassName;
      var clss = [];

      if (pendingRecords.some(function (item) {
        return item === params.row;
      })) {
        clss.push('row--pending');
      }

      clss.push(rowClassName ? _xeUtils.default.isFunction(rowClassName) ? rowClassName(params) : rowClassName : '');
      return clss;
    };

    var handleActiveMethod = function handleActiveMethod(params) {
      var editConfig = props.editConfig;
      var pendingRecords = reactData.pendingRecords;
      var $xetable = refTable.value;
      var activeMethod = editConfig ? editConfig.activeMethod : null;
      return $xetable.findRowIndexOf(pendingRecords, params.row) === -1 && (!activeMethod || activeMethod(params));
    };

    var computeTableProps = (0, _vue.computed)(function () {
      var seqConfig = props.seqConfig,
          pagerConfig = props.pagerConfig,
          loading = props.loading,
          editConfig = props.editConfig,
          proxyConfig = props.proxyConfig;
      var isZMax = reactData.isZMax,
          tableLoading = reactData.tableLoading,
          tablePage = reactData.tablePage,
          tableData = reactData.tableData;
      var tableExtendProps = computeTableExtendProps.value;
      var proxyOpts = computeProxyOpts.value;
      var tableProps = Object.assign({}, tableExtendProps);

      if (isZMax) {
        if (tableExtendProps.maxHeight) {
          tableProps.maxHeight = 'auto';
        } else {
          tableProps.height = 'auto';
        }
      }

      if (proxyConfig) {
        tableProps.loading = loading || tableLoading;
        tableProps.data = tableData;
        tableProps.rowClassName = handleRowClassName;

        if (proxyOpts.seq && (0, _utils.isEnableConf)(pagerConfig)) {
          tableProps.seqConfig = Object.assign({}, seqConfig, {
            startIndex: (tablePage.currentPage - 1) * tablePage.pageSize
          });
        }
      }

      if (editConfig) {
        tableProps.editConfig = Object.assign({}, editConfig, {
          activeMethod: handleActiveMethod
        });
      }

      return tableProps;
    });

    var initToolbar = function initToolbar() {
      (0, _vue.nextTick)(function () {
        var $xetable = refTable.value;
        var $xetoolbar = refToolbar.value;

        if ($xetable && $xetoolbar) {
          $xetable.connect($xetoolbar);
        }
      });
    };

    var initPages = function initPages() {
      var pagerConfig = props.pagerConfig;
      var tablePage = reactData.tablePage;
      var pagerOpts = computePagerOpts.value;
      var currentPage = pagerOpts.currentPage,
          pageSize = pagerOpts.pageSize;

      if (pagerConfig) {
        if (currentPage) {
          tablePage.currentPage = currentPage;
        }

        if (pageSize) {
          tablePage.pageSize = pageSize;
        }
      }
    };

    var triggerPendingEvent = function triggerPendingEvent(code) {
      var pendingRecords = reactData.pendingRecords;
      var isMsg = computeIsMsg.value;
      var $xetable = refTable.value;
      var selectRecords = $xetable.getCheckboxRecords();

      if (selectRecords.length) {
        var plus_1 = [];
        var minus_1 = [];
        selectRecords.forEach(function (data) {
          if (pendingRecords.some(function (item) {
            return data === item;
          })) {
            minus_1.push(data);
          } else {
            plus_1.push(data);
          }
        });

        if (minus_1.length) {
          reactData.pendingRecords = pendingRecords.filter(function (item) {
            return $xetable.findRowIndexOf(minus_1, item) === -1;
          }).concat(plus_1);
        } else if (plus_1.length) {
          reactData.pendingRecords = pendingRecords.concat(plus_1);
        }

        gridExtendTableMethods.clearCheckboxRow();
      } else {
        if (isMsg) {
          _vXETable.VXETable.modal.message({
            id: code,
            content: _conf.default.i18n('vxe.grid.selectOneRecord'),
            status: 'warning'
          });
        }
      }
    };

    var getRespMsg = function getRespMsg(rest, defaultMsg) {
      var proxyOpts = computeProxyOpts.value;
      var _a = proxyOpts.props,
          proxyProps = _a === void 0 ? {} : _a;
      var msg;

      if (rest && proxyProps.message) {
        msg = _xeUtils.default.get(rest, proxyProps.message);
      }

      return msg || _conf.default.i18n(defaultMsg);
    };

    var handleDeleteRow = function handleDeleteRow(code, alertKey, callback) {
      var isMsg = computeIsMsg.value;
      var selectRecords = gridExtendTableMethods.getCheckboxRecords();

      if (isMsg) {
        if (selectRecords.length) {
          return _vXETable.VXETable.modal.confirm({
            id: "cfm_" + code,
            content: _conf.default.i18n(alertKey),
            escClosable: true
          }).then(function (type) {
            if (type === 'confirm') {
              callback();
            }
          });
        } else {
          _vXETable.VXETable.modal.message({
            id: "msg_" + code,
            content: _conf.default.i18n('vxe.grid.selectOneRecord'),
            status: 'warning'
          });
        }
      } else {
        if (selectRecords.length) {
          callback();
        }
      }

      return Promise.resolve();
    };

    var pageChangeEvent = function pageChangeEvent(params) {
      var proxyConfig = props.proxyConfig;
      var tablePage = reactData.tablePage;
      var currentPage = params.currentPage,
          pageSize = params.pageSize;
      tablePage.currentPage = currentPage;
      tablePage.pageSize = pageSize;
      gridMethods.dispatchEvent('page-change', params);

      if (proxyConfig) {
        gridMethods.commitProxy('query');
      }
    };

    var sortChangeEvent = function sortChangeEvent(params) {
      var $xetable = refTable.value;
      var proxyConfig = props.proxyConfig;
      var computeSortOpts = $xetable.getComputeMaps().computeSortOpts;
      var sortOpts = computeSortOpts.value; // ????????????????????????

      if (sortOpts.remote) {
        reactData.sortData = params.sortList;

        if (proxyConfig) {
          reactData.tablePage.currentPage = 1;
          gridMethods.commitProxy('query');
        }
      }

      gridMethods.dispatchEvent('sort-change', params);
    };

    var filterChangeEvent = function filterChangeEvent(params) {
      var $xetable = refTable.value;
      var proxyConfig = props.proxyConfig;
      var computeFilterOpts = $xetable.getComputeMaps().computeFilterOpts;
      var filterOpts = computeFilterOpts.value; // ????????????????????????

      if (filterOpts.remote) {
        reactData.filterData = params.filterList;

        if (proxyConfig) {
          reactData.tablePage.currentPage = 1;
          gridMethods.commitProxy('query');
        }
      }

      gridMethods.dispatchEvent('filter-change', params);
    };

    var submitFormEvent = function submitFormEvent(params) {
      var proxyConfig = props.proxyConfig;

      if (proxyConfig) {
        gridMethods.commitProxy('reload');
      }

      gridMethods.dispatchEvent('form-submit', params);
    };

    var resetFormEvent = function resetFormEvent(params) {
      var proxyConfig = props.proxyConfig;

      if (proxyConfig) {
        gridMethods.commitProxy('reload');
      }

      gridMethods.dispatchEvent('form-reset', params);
    };

    var submitInvalidEvent = function submitInvalidEvent(params) {
      gridMethods.dispatchEvent('form-submit-invalid', params);
    };

    var collapseEvent = function collapseEvent(params) {
      (0, _vue.nextTick)(function () {
        return gridExtendTableMethods.recalculate(true);
      });
      gridMethods.dispatchEvent('form-toggle-collapse', params);
      gridMethods.dispatchEvent('form-collapse', params);
    };

    var handleZoom = function handleZoom(isMax) {
      var isZMax = reactData.isZMax;

      if (isMax ? !isZMax : isZMax) {
        reactData.isZMax = !isZMax;

        if (reactData.tZindex < (0, _utils.getLastZIndex)()) {
          reactData.tZindex = (0, _utils.nextZIndex)();
        }
      }

      return (0, _vue.nextTick)().then(function () {
        return gridExtendTableMethods.recalculate(true);
      }).then(function () {
        return reactData.isZMax;
      });
    };

    var getFuncSlot = function getFuncSlot(optSlots, slotKey) {
      var funcSlot = optSlots[slotKey];

      if (funcSlot) {
        if (_xeUtils.default.isString(funcSlot)) {
          if (slots[funcSlot]) {
            return slots[funcSlot];
          } else {
            if (process.env.NODE_ENV === 'development') {
              (0, _utils.errLog)('vxe.error.notSlot', [funcSlot]);
            }
          }
        } else {
          return funcSlot;
        }
      }

      return null;
    };
    /**
     * ????????????
     */


    var renderForms = function renderForms() {
      var formConfig = props.formConfig,
          proxyConfig = props.proxyConfig;
      var formData = reactData.formData;
      var proxyOpts = computeProxyOpts.value;
      var formOpts = computeFormOpts.value;
      var restVNs = [];

      if ((0, _utils.isEnableConf)(formConfig) || slots.form) {
        var slotVNs = [];

        if (slots.form) {
          slotVNs = slots.form({
            $grid: $xegrid
          });
        } else {
          if (formOpts.items) {
            var formSlots_1 = {};

            if (!formOpts.inited) {
              formOpts.inited = true;
              var beforeItem_1 = proxyOpts.beforeItem;

              if (proxyOpts && beforeItem_1) {
                formOpts.items.forEach(function (item) {
                  beforeItem_1({
                    $grid: $xegrid,
                    item: item
                  });
                });
              }
            } // ????????????


            formOpts.items.forEach(function (item) {
              _xeUtils.default.each(item.slots, function (func) {
                if (!_xeUtils.default.isFunction(func)) {
                  if (slots[func]) {
                    formSlots_1[func] = slots[func];
                  }
                }
              });
            });
            slotVNs.push((0, _vue.h)((0, _vue.resolveComponent)('vxe-form'), __assign(__assign({
              ref: refForm
            }, Object.assign({}, formOpts, {
              data: proxyConfig && proxyOpts.form ? formData : formOpts.data
            })), {
              onSubmit: submitFormEvent,
              onReset: resetFormEvent,
              onSubmitInvalid: submitInvalidEvent,
              onCollapse: collapseEvent
            }), formSlots_1));
          }
        }

        restVNs.push((0, _vue.h)('div', {
          ref: refFormWrapper,
          class: 'vxe-grid--form-wrapper'
        }, slotVNs));
      }

      return restVNs;
    };
    /**
     * ???????????????
     */


    var renderToolbars = function renderToolbars() {
      var toolbarConfig = props.toolbarConfig;
      var toolbarOpts = computeToolbarOpts.value;
      var restVNs = [];

      if ((0, _utils.isEnableConf)(toolbarConfig) || slots.toolbar) {
        var slotVNs = [];

        if (slots.toolbar) {
          slotVNs = slots.toolbar({
            $grid: $xegrid
          });
        } else {
          var toolbarOptSlots = toolbarOpts.slots;
          var buttonsSlot = void 0;
          var toolsSlot = void 0;
          var toolbarSlots = {};

          if (toolbarOptSlots) {
            buttonsSlot = getFuncSlot(toolbarOptSlots, 'buttons');
            toolsSlot = getFuncSlot(toolbarOptSlots, 'tools');

            if (buttonsSlot) {
              toolbarSlots.buttons = buttonsSlot;
            }

            if (toolsSlot) {
              toolbarSlots.tools = toolsSlot;
            }
          }

          slotVNs.push((0, _vue.h)((0, _vue.resolveComponent)('vxe-toolbar'), __assign({
            ref: refToolbar
          }, toolbarOpts), toolbarSlots));
        }

        restVNs.push((0, _vue.h)('div', {
          ref: refToolbarWrapper,
          class: 'vxe-grid--toolbar-wrapper'
        }, slotVNs));
      }

      return restVNs;
    };
    /**
     * ????????????????????????
     */


    var renderTops = function renderTops() {
      if (slots.top) {
        return [(0, _vue.h)('div', {
          ref: refTopWrapper,
          class: 'vxe-grid--top-wrapper'
        }, slots.top({
          $grid: $xegrid
        }))];
      }

      return [];
    };

    var tableCompEvents = {};

    _emits.default.forEach(function (name) {
      var type = _xeUtils.default.camelCase("on-" + name);

      tableCompEvents[type] = function () {
        var args = [];

        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }

        return emit.apply(void 0, __spreadArray([name], args));
      };
    });
    /**
     * ????????????
     */


    var renderTables = function renderTables() {
      var proxyConfig = props.proxyConfig;
      var tableProps = computeTableProps.value;
      var proxyOpts = computeProxyOpts.value;
      var tableOns = Object.assign({}, tableCompEvents);
      var emptySlot = slots.empty;

      if (proxyConfig) {
        if (proxyOpts.sort) {
          tableOns.onSortChange = sortChangeEvent;
        }

        if (proxyOpts.filter) {
          tableOns.onFilterChange = filterChangeEvent;
        }
      }

      return [(0, _vue.h)((0, _vue.resolveComponent)('vxe-table'), __assign(__assign({
        ref: refTable
      }, tableProps), tableOns), emptySlot ? {
        empty: function empty() {
          return emptySlot({});
        }
      } : {})];
    };
    /**
     * ????????????????????????
     */


    var renderBottoms = function renderBottoms() {
      if (slots.bottom) {
        return [(0, _vue.h)('div', {
          ref: refBottomWrapper,
          class: 'vxe-grid--bottom-wrapper'
        }, slots.bottom({
          $grid: $xegrid
        }))];
      }

      return [];
    };
    /**
     * ????????????
     */


    var renderPagers = function renderPagers() {
      var pagerConfig = props.pagerConfig;
      var pagerOpts = computePagerOpts.value;
      var restVNs = [];

      if ((0, _utils.isEnableConf)(pagerConfig) || slots.pager) {
        var slotVNs = [];

        if (slots.pager) {
          slotVNs = slots.pager({
            $grid: $xegrid
          });
        } else {
          var pagerOptSlots = pagerOpts.slots;
          var pagerSlots = {};
          var leftSlot = void 0;
          var rightSlot = void 0;

          if (pagerOptSlots) {
            leftSlot = getFuncSlot(pagerOptSlots, 'left');
            rightSlot = getFuncSlot(pagerOptSlots, 'right');

            if (leftSlot) {
              pagerSlots.buttons = leftSlot;
            }

            if (rightSlot) {
              pagerSlots.tools = rightSlot;
            }
          }

          slotVNs.push((0, _vue.h)((0, _vue.resolveComponent)('vxe-pager'), __assign(__assign(__assign({
            ref: refPager
          }, pagerOpts), props.proxyConfig ? reactData.tablePage : {}), {
            onPageChange: pageChangeEvent
          }), pagerSlots));
        }

        restVNs.push((0, _vue.h)('div', {
          ref: refPagerWrapper,
          class: 'vxe-grid--pager-wrapper'
        }, slotVNs));
      }

      return restVNs;
    };

    var initProxy = function initProxy() {
      var proxyConfig = props.proxyConfig,
          formConfig = props.formConfig;
      var proxyInited = reactData.proxyInited;
      var proxyOpts = computeProxyOpts.value;
      var formOpts = computeFormOpts.value;

      if (proxyConfig) {
        if ((0, _utils.isEnableConf)(formConfig) && proxyOpts.form && formOpts.items) {
          var formData_1 = {};
          formOpts.items.forEach(function (item) {
            var field = item.field,
                itemRender = item.itemRender;

            if (field) {
              var itemValue = null;

              if (itemRender) {
                var defaultValue = itemRender.defaultValue;

                if (_xeUtils.default.isFunction(defaultValue)) {
                  itemValue = defaultValue({
                    item: item
                  });
                } else if (!_xeUtils.default.isUndefined(defaultValue)) {
                  itemValue = defaultValue;
                }
              }

              formData_1[field] = itemValue;
            }
          });
          reactData.formData = formData_1;
        }

        if (!proxyInited && proxyOpts.autoLoad !== false) {
          reactData.proxyInited = true;
          (0, _vue.nextTick)(function () {
            return gridMethods.commitProxy('_init');
          });
        }
      }
    };

    gridMethods = {
      dispatchEvent: function dispatchEvent(type, params, evnt) {
        emit(type, Object.assign({
          $grid: $xegrid,
          $event: evnt
        }, params));
      },

      /**
       * ????????????????????? code ??? button
       * @param {String/Object} code ??????????????????
       */
      commitProxy: function commitProxy(proxyTarget) {
        var args = [];

        for (var _i = 1; _i < arguments.length; _i++) {
          args[_i - 1] = arguments[_i];
        }

        var toolbarConfig = props.toolbarConfig,
            pagerConfig = props.pagerConfig;
        var tablePage = reactData.tablePage,
            formData = reactData.formData;
        var isMsg = computeIsMsg.value;
        var proxyOpts = computeProxyOpts.value;
        var toolbarOpts = computeToolbarOpts.value;
        var beforeQuery = proxyOpts.beforeQuery,
            afterQuery = proxyOpts.afterQuery,
            beforeDelete = proxyOpts.beforeDelete,
            afterDelete = proxyOpts.afterDelete,
            beforeSave = proxyOpts.beforeSave,
            afterSave = proxyOpts.afterSave,
            _a = proxyOpts.ajax,
            ajax = _a === void 0 ? {} : _a,
            _b = proxyOpts.props,
            proxyProps = _b === void 0 ? {} : _b;
        var $xetable = refTable.value;
        var button = null;
        var code = null;

        if (_xeUtils.default.isString(proxyTarget)) {
          var buttons = toolbarOpts.buttons;
          var matchObj = toolbarConfig && buttons ? _xeUtils.default.findTree(buttons, function (item) {
            return item.code === proxyTarget;
          }, {
            children: 'dropdowns'
          }) : null;
          button = matchObj ? matchObj.item : null;
          code = proxyTarget;
        } else {
          button = proxyTarget;
          code = button.code;
        }

        var btnParams = button ? button.params : null;

        switch (code) {
          case 'insert':
            $xetable.insert({});
            break;

          case 'insert_actived':
            $xetable.insert({}).then(function (_a) {
              var row = _a.row;
              return $xetable.setActiveRow(row);
            });
            break;

          case 'mark_cancel':
            triggerPendingEvent(code);
            break;

          case 'remove':
            return handleDeleteRow(code, 'vxe.grid.removeSelectRecord', function () {
              return $xetable.removeCheckboxRow();
            });

          case 'import':
            $xetable.importData(btnParams);
            break;

          case 'open_import':
            $xetable.openImport(btnParams);
            break;

          case 'export':
            $xetable.exportData(btnParams);
            break;

          case 'open_export':
            $xetable.openExport(btnParams);
            break;

          case 'reset_custom':
            $xetable.resetColumn(true);
            break;

          case '_init':
          case 'reload':
          case 'query':
            {
              var ajaxMethods = ajax.query;

              if (ajaxMethods) {
                var isInited = code === '_init';
                var isReload = code === 'reload';
                var sortList = [];
                var filterList = [];
                var pageParams = {};

                if (pagerConfig) {
                  if (isInited || isReload) {
                    tablePage.currentPage = 1;
                  }

                  if ((0, _utils.isEnableConf)(pagerConfig)) {
                    pageParams = __assign({}, tablePage);
                  }
                }

                if (isInited) {
                  var computeSortOpts = $xetable.getComputeMaps().computeSortOpts;
                  var sortOpts = computeSortOpts.value;
                  var defaultSort = sortOpts.defaultSort; // ????????????????????????

                  if (defaultSort) {
                    if (!_xeUtils.default.isArray(defaultSort)) {
                      defaultSort = [defaultSort];
                    }

                    sortList = defaultSort.map(function (item) {
                      return {
                        property: item.field,
                        order: item.order
                      };
                    });
                  }

                  filterList = $xetable.getCheckedFilters();
                } else {
                  if (isReload) {
                    reactData.pendingRecords = [];
                    $xetable.clearAll();
                  } else {
                    sortList = $xetable.getSortColumns();
                    filterList = $xetable.getCheckedFilters();
                  }
                }

                var params = {
                  code: code,
                  button: button,
                  $grid: $xegrid,
                  page: pageParams,
                  sort: sortList.length ? sortList[0] : {},
                  sorts: sortList,
                  filters: filterList,
                  form: formData,
                  options: ajaxMethods
                };
                reactData.sortData = sortList;
                reactData.filterData = filterList;
                reactData.tableLoading = true;
                var applyArgs_1 = [params].concat(args);
                return Promise.resolve((beforeQuery || ajaxMethods).apply(void 0, applyArgs_1)).catch(function (e) {
                  return e;
                }).then(function (rest) {
                  reactData.tableLoading = false;

                  if (rest) {
                    if ((0, _utils.isEnableConf)(pagerConfig)) {
                      var total = _xeUtils.default.get(rest, proxyProps.total || 'page.total') || 0;
                      tablePage.total = total;
                      reactData.tableData = _xeUtils.default.get(rest, proxyProps.result || 'result') || []; // ???????????????????????????????????????????????????

                      var pageCount = Math.max(Math.ceil(total / tablePage.pageSize), 1);

                      if (tablePage.currentPage > pageCount) {
                        tablePage.currentPage = pageCount;
                      }
                    } else {
                      reactData.tableData = (proxyProps.list ? _xeUtils.default.get(rest, proxyProps.list) : rest) || [];
                    }
                  } else {
                    reactData.tableData = [];
                  }

                  if (afterQuery) {
                    afterQuery.apply(void 0, applyArgs_1);
                  }
                });
              } else {
                if (process.env.NODE_ENV === 'development') {
                  (0, _utils.errLog)('vxe.error.notFunc', ['proxy-config.ajax.query']);
                }
              }

              break;
            }

          case 'delete':
            {
              var ajaxMethods_1 = ajax.delete;

              if (ajaxMethods_1) {
                var selectRecords_1 = gridExtendTableMethods.getCheckboxRecords();
                var removeRecords_1 = selectRecords_1.filter(function (row) {
                  return !$xetable.isInsertByRow(row);
                });
                var body = {
                  removeRecords: removeRecords_1
                };
                var applyArgs_2 = [{
                  $grid: $xegrid,
                  code: code,
                  button: button,
                  body: body,
                  options: ajaxMethods_1
                }].concat(args);

                if (selectRecords_1.length) {
                  return handleDeleteRow(code, 'vxe.grid.deleteSelectRecord', function () {
                    if (!removeRecords_1.length) {
                      return $xetable.remove(selectRecords_1);
                    }

                    reactData.tableLoading = true;
                    return Promise.resolve((beforeDelete || ajaxMethods_1).apply(void 0, applyArgs_2)).then(function (rest) {
                      reactData.tableLoading = false;
                      reactData.pendingRecords = reactData.pendingRecords.filter(function (row) {
                        return $xetable.findRowIndexOf(removeRecords_1, row) === -1;
                      });

                      if (isMsg) {
                        _vXETable.VXETable.modal.message({
                          content: getRespMsg(rest, 'vxe.grid.delSuccess'),
                          status: 'success'
                        });
                      }

                      if (afterDelete) {
                        afterDelete.apply(void 0, applyArgs_2);
                      } else {
                        gridMethods.commitProxy('query');
                      }
                    }).catch(function (rest) {
                      reactData.tableLoading = false;

                      if (isMsg) {
                        _vXETable.VXETable.modal.message({
                          id: code,
                          content: getRespMsg(rest, 'vxe.grid.operError'),
                          status: 'error'
                        });
                      }
                    });
                  });
                } else {
                  if (isMsg) {
                    _vXETable.VXETable.modal.message({
                      id: code,
                      content: _conf.default.i18n('vxe.grid.selectOneRecord'),
                      status: 'warning'
                    });
                  }
                }
              } else {
                if (process.env.NODE_ENV === 'development') {
                  (0, _utils.errLog)('vxe.error.notFunc', ['proxy-config.ajax.delete']);
                }
              }

              break;
            }

          case 'save':
            {
              var ajaxMethods_2 = ajax.save;

              if (ajaxMethods_2) {
                var body_1 = Object.assign({
                  pendingRecords: reactData.pendingRecords
                }, $xetable.getRecordset());
                var insertRecords_1 = body_1.insertRecords,
                    removeRecords_2 = body_1.removeRecords,
                    updateRecords_1 = body_1.updateRecords,
                    pendingRecords_1 = body_1.pendingRecords;
                var applyArgs_3 = [{
                  $grid: $xegrid,
                  code: code,
                  button: button,
                  body: body_1,
                  options: ajaxMethods_2
                }].concat(args); // ??????????????????????????????????????????

                if (insertRecords_1.length) {
                  body_1.pendingRecords = pendingRecords_1.filter(function (row) {
                    return $xetable.findRowIndexOf(insertRecords_1, row) === -1;
                  });
                } // ?????????????????????????????????


                if (pendingRecords_1.length) {
                  body_1.insertRecords = insertRecords_1.filter(function (row) {
                    return $xetable.findRowIndexOf(pendingRecords_1, row) === -1;
                  });
                } // ?????????????????????????????????


                return $xetable.validate(body_1.insertRecords.concat(updateRecords_1)).then(function () {
                  if (body_1.insertRecords.length || removeRecords_2.length || updateRecords_1.length || body_1.pendingRecords.length) {
                    reactData.tableLoading = true;
                    return Promise.resolve((beforeSave || ajaxMethods_2).apply(void 0, applyArgs_3)).then(function (rest) {
                      reactData.tableLoading = false;
                      reactData.pendingRecords = [];

                      if (isMsg) {
                        _vXETable.VXETable.modal.message({
                          content: getRespMsg(rest, 'vxe.grid.saveSuccess'),
                          status: 'success'
                        });
                      }

                      if (afterSave) {
                        afterSave.apply(void 0, applyArgs_3);
                      } else {
                        gridMethods.commitProxy('query');
                      }
                    }).catch(function (rest) {
                      reactData.tableLoading = false;

                      if (isMsg) {
                        _vXETable.VXETable.modal.message({
                          id: code,
                          content: getRespMsg(rest, 'vxe.grid.operError'),
                          status: 'error'
                        });
                      }
                    });
                  } else {
                    if (isMsg) {
                      _vXETable.VXETable.modal.message({
                        id: code,
                        content: _conf.default.i18n('vxe.grid.dataUnchanged'),
                        status: 'info'
                      });
                    }
                  }
                }).catch(function (errMap) {
                  return errMap;
                });
              } else {
                if (process.env.NODE_ENV === 'development') {
                  (0, _utils.errLog)('vxe.error.notFunc', ['proxy-config.ajax.save']);
                }
              }

              break;
            }

          default:
            {
              var btnMethod = _vXETable.VXETable.commands.get(code);

              if (btnMethod) {
                btnMethod.apply(void 0, __spreadArray([{
                  code: code,
                  button: button,
                  $grid: $xegrid,
                  $table: $xetable
                }], args));
              }
            }
        }

        return (0, _vue.nextTick)();
      },
      zoom: function zoom() {
        if (reactData.isZMax) {
          return gridMethods.revert();
        }

        return gridMethods.maximize();
      },
      isMaximized: function isMaximized() {
        return reactData.isZMax;
      },
      maximize: function maximize() {
        return handleZoom(true);
      },
      revert: function revert() {
        return handleZoom();
      },
      getFormItems: function getFormItems(itemIndex) {
        var formOpts = computeFormOpts.value;
        var formConfig = props.formConfig;
        var items = formOpts.items;
        var itemList = [];

        _xeUtils.default.eachTree((0, _utils.isEnableConf)(formConfig) && items ? items : [], function (item) {
          itemList.push(item);
        }, {
          children: 'children'
        });

        return _xeUtils.default.isUndefined(itemIndex) ? itemList : itemList[itemIndex];
      },
      getPendingRecords: function getPendingRecords() {
        return reactData.pendingRecords;
      },
      getProxyInfo: function getProxyInfo() {
        if (props.proxyConfig) {
          var sortData = reactData.sortData;
          return {
            data: reactData.tableData,
            filter: reactData.filterData,
            form: reactData.formData,
            sort: sortData.length ? sortData[0] : {},
            sorts: sortData,
            pager: reactData.tablePage,
            pendingRecords: reactData.pendingRecords
          };
        }

        return null;
      }
    }; // ????????????

    if (process.env.NODE_ENV === 'development') {
      gridMethods.loadColumn = function (columns) {
        var $xetable = refTable.value;

        _xeUtils.default.eachTree(columns, function (column) {
          if (column.slots) {
            _xeUtils.default.each(column.slots, function (func) {
              if (!_xeUtils.default.isFunction(func)) {
                if (!slots[func]) {
                  (0, _utils.errLog)('vxe.error.notSlot', [func]);
                }
              }
            });
          }
        });

        return $xetable.loadColumn(columns);
      };

      gridMethods.reloadColumn = function (columns) {
        gridExtendTableMethods.clearAll();
        return gridMethods.loadColumn(columns);
      };
    }

    var gridPrivateMethods = {
      extendTableMethods: extendTableMethods,
      callSlot: function callSlot(slotFunc, params) {
        if (slotFunc) {
          if (_xeUtils.default.isString(slotFunc)) {
            slotFunc = slots[slotFunc] || null;
          }

          if (_xeUtils.default.isFunction(slotFunc)) {
            return slotFunc(params);
          }
        }

        return [];
      },

      /**
       * ???????????????????????????
       */
      getExcludeHeight: function getExcludeHeight() {
        var height = props.height;
        var isZMax = reactData.isZMax;
        var el = refElem.value;
        var formWrapper = refFormWrapper.value;
        var toolbarWrapper = refToolbarWrapper.value;
        var topWrapper = refTopWrapper.value;
        var bottomWrapper = refBottomWrapper.value;
        var pagerWrapper = refPagerWrapper.value;
        var parentPaddingSize = isZMax || height !== 'auto' ? 0 : (0, _dom.getPaddingTopBottomSize)(el.parentNode);
        return parentPaddingSize + (0, _dom.getPaddingTopBottomSize)(el) + (0, _dom.getOffsetHeight)(formWrapper) + (0, _dom.getOffsetHeight)(toolbarWrapper) + (0, _dom.getOffsetHeight)(topWrapper) + (0, _dom.getOffsetHeight)(bottomWrapper) + (0, _dom.getOffsetHeight)(pagerWrapper);
      },
      getParentHeight: function getParentHeight() {
        var el = refElem.value;

        if (el) {
          return (reactData.isZMax ? (0, _dom.getDomNode)().visibleHeight : _xeUtils.default.toNumber(getComputedStyle(el.parentNode).height)) - gridPrivateMethods.getExcludeHeight();
        }

        return 0;
      },
      triggerToolbarBtnEvent: function triggerToolbarBtnEvent(button, evnt) {
        gridMethods.commitProxy(button, evnt);
        gridMethods.dispatchEvent('toolbar-button-click', {
          code: button.code,
          button: button
        }, evnt);
      },
      triggerToolbarTolEvent: function triggerToolbarTolEvent(tool, evnt) {
        gridMethods.commitProxy(tool, evnt);
        gridMethods.dispatchEvent('toolbar-tool-click', {
          code: tool.code,
          tool: tool,
          $event: evnt
        });
      },
      triggerZoomEvent: function triggerZoomEvent(evnt) {
        gridMethods.zoom();
        gridMethods.dispatchEvent('zoom', {
          type: reactData.isZMax ? 'max' : 'revert'
        }, evnt);
      }
    };
    Object.assign($xegrid, gridExtendTableMethods, gridMethods, gridPrivateMethods);
    (0, _vue.watch)(function () {
      return props.columns;
    }, function (value) {
      (0, _vue.nextTick)(function () {
        return $xegrid.loadColumn(value || []);
      });
    });
    (0, _vue.watch)(function () {
      return props.toolbarConfig;
    }, function (value) {
      if (value) {
        initToolbar();
      }
    });
    (0, _vue.watch)(function () {
      return props.proxyConfig;
    }, function () {
      initProxy();
    });
    (0, _vue.watch)(function () {
      return props.pagerConfig;
    }, function () {
      initPages();
    });

    var handleGlobalKeydownEvent = function handleGlobalKeydownEvent(evnt) {
      var zoomOpts = computeZoomOpts.value;
      var isEsc = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.ESCAPE);

      if (isEsc && reactData.isZMax && zoomOpts.escRestore !== false) {
        gridPrivateMethods.triggerZoomEvent(evnt);
      }
    };

    _vXETable.VXETable.hooks.forEach(function (options) {
      var setupGrid = options.setupGrid;

      if (setupGrid) {
        var hookRest = setupGrid($xegrid);

        if (hookRest && _xeUtils.default.isObject(hookRest)) {
          Object.assign($xegrid, hookRest);
        }
      }
    });

    (0, _vue.onMounted)(function () {
      (0, _vue.nextTick)(function () {
        var data = props.data,
            columns = props.columns,
            proxyConfig = props.proxyConfig;
        var proxyOpts = computeProxyOpts.value;
        var formOpts = computeFormOpts.value;

        if (proxyConfig && (data || proxyOpts.form && formOpts.data)) {
          (0, _utils.errLog)('errConflicts', ['grid.data', 'grid.proxy-config']);
        }

        if (columns && columns.length) {
          $xegrid.loadColumn(columns);
        }

        initToolbar();
        initPages();
        initProxy();
      });

      _event.GlobalEvent.on($xegrid, 'keydown', handleGlobalKeydownEvent);
    });
    (0, _vue.onUnmounted)(function () {
      _event.GlobalEvent.off($xegrid, 'keydown');
    });

    var renderVN = function renderVN() {
      var _a;

      var vSize = computeSize.value;
      var styles = computeStyles.value;
      return (0, _vue.h)('div', {
        ref: refElem,
        class: ['vxe-grid', (_a = {}, _a["size--" + vSize] = vSize, _a['is--animat'] = !!props.animat, _a['is--round'] = props.round, _a['is--maximize'] = reactData.isZMax, _a['is--loading'] = props.loading || reactData.tableLoading, _a)],
        style: styles
      }, renderForms().concat(renderToolbars(), renderTops(), renderTables(), renderBottoms(), renderPagers()));
    };

    $xegrid.renderVN = renderVN;
    (0, _vue.provide)('$xegrid', $xegrid);
    return $xegrid;
  },
  render: function render() {
    return this.renderVN();
  }
});

exports.default = _default2;