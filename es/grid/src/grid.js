var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
import { defineComponent, h, ref, computed, provide, getCurrentInstance, resolveComponent, reactive, onUnmounted, watch, nextTick, onMounted } from 'vue';
import XEUtils from 'xe-utils';
import { errLog, getLastZIndex, nextZIndex, isEnableConf } from '../../tools/utils';
import { getOffsetHeight, getPaddingTopBottomSize, getDomNode } from '../../tools/dom';
import GlobalConfig from '../../v-x-e-table/src/conf';
import { VXETable } from '../../v-x-e-table';
import tableComponentProps from '../../table/src/props';
import tableComponentEmits from '../../table/src/emits';
import { useSize } from '../../hooks/size';
import { GlobalEvent, hasEventKey, EVENT_KEYS } from '../../tools/event';
var tableComponentPropKeys = Object.keys(tableComponentProps);
var tableComponentMethodKeys = ['clearAll', 'syncData', 'updateData', 'loadData', 'reloadData', 'reloadRow', 'loadColumn', 'reloadColumn', 'getRowNode', 'getColumnNode', 'getRowIndex', 'getVTRowIndex', 'getVMRowIndex', 'getColumnIndex', 'getVTColumnIndex', 'getVMColumnIndex', 'createData', 'createRow', 'revertData', 'clearData', 'isInsertByRow', 'isUpdateByRow', 'getColumns', 'getColumnById', 'getColumnByField', 'getTableColumn', 'getData', 'getCheckboxRecords', 'getRowById', 'getRowid', 'getTableData', 'hideColumn', 'showColumn', 'resetColumn', 'refreshColumn', 'refreshScroll', 'recalculate', 'closeTooltip', 'isAllCheckboxChecked', 'isAllCheckboxIndeterminate', 'getCheckboxIndeterminateRecords', 'setCheckboxRow', 'isCheckedByCheckboxRow', 'isIndeterminateByCheckboxRow', 'toggleCheckboxRow', 'setAllCheckboxRow', 'getRadioReserveRecord', 'clearRadioReserve', 'getCheckboxReserveRecords', 'clearCheckboxReserve', 'toggleAllCheckboxRow', 'clearCheckboxRow', 'setCurrentRow', 'isCheckedByRadioRow', 'setRadioRow', 'clearCurrentRow', 'clearRadioRow', 'getCurrentRecord', 'getRadioRecord', 'getCurrentColumn', 'setCurrentColumn', 'clearCurrentColumn', 'sort', 'clearSort', 'isSort', 'getSortColumns', 'closeFilter', 'isFilter', 'isRowExpandLoaded', 'clearRowExpandLoaded', 'reloadExpandContent', 'toggleRowExpand', 'setAllRowExpand', 'setRowExpand', 'isExpandByRow', 'clearRowExpand', 'clearRowExpandReserve', 'getRowExpandRecords', 'getTreeExpandRecords', 'isTreeExpandLoaded', 'clearTreeExpandLoaded', 'reloadTreeChilds', 'toggleTreeExpand', 'setAllTreeExpand', 'setTreeExpand', 'isTreeExpandByRow', 'clearTreeExpand', 'clearTreeExpandReserve', 'getScroll', 'scrollTo', 'scrollToRow', 'scrollToColumn', 'clearScroll', 'updateFooter', 'updateStatus', 'setMergeCells', 'removeMergeCells', 'getMergeCells', 'clearMergeCells', 'setMergeFooterItems', 'removeMergeFooterItems', 'getMergeFooterItems', 'clearMergeFooterItems', 'focus', 'blur', 'connect'];
var gridComponentEmits = __spreadArray(__spreadArray([], tableComponentEmits), [
    'page-change',
    'form-submit',
    'form-submit-invalid',
    'form-reset',
    'form-collapse',
    'form-toggle-collapse',
    'toolbar-button-click',
    'toolbar-tool-click',
    'zoom'
]);
export default defineComponent({
    name: 'VxeGrid',
    props: __assign(__assign({}, tableComponentProps), { columns: Array, pagerConfig: Object, proxyConfig: Object, toolbarConfig: Object, formConfig: Object, zoomConfig: Object, size: { type: String, default: function () { return GlobalConfig.grid.size || GlobalConfig.size; } } }),
    emits: gridComponentEmits,
    setup: function (props, context) {
        var slots = context.slots, emit = context.emit;
        var xID = XEUtils.uniqueId();
        var instance = getCurrentInstance();
        var computeSize = useSize(props);
        var reactData = reactive({
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
        var refElem = ref();
        var refTable = ref();
        var refForm = ref();
        var refToolbar = ref();
        var refPager = ref();
        var refFormWrapper = ref();
        var refToolbarWrapper = ref();
        var refTopWrapper = ref();
        var refBottomWrapper = ref();
        var refPagerWrapper = ref();
        var extendTableMethods = function (methodKeys) {
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
        var computeProxyOpts = computed(function () {
            return Object.assign({}, GlobalConfig.grid.proxyConfig, props.proxyConfig);
        });
        var computeIsMsg = computed(function () {
            var proxyOpts = computeProxyOpts.value;
            return proxyOpts.message !== false;
        });
        var computePagerOpts = computed(function () {
            return Object.assign({}, GlobalConfig.grid.pagerConfig, props.pagerConfig);
        });
        var computeFormOpts = computed(function () {
            return Object.assign({}, GlobalConfig.grid.formConfig, props.formConfig);
        });
        var computeToolbarOpts = computed(function () {
            return Object.assign({}, GlobalConfig.grid.toolbarConfig, props.toolbarConfig);
        });
        var computeZoomOpts = computed(function () {
            return Object.assign({}, GlobalConfig.grid.zoomConfig, props.zoomConfig);
        });
        var computeStyles = computed(function () {
            return reactData.isZMax ? { zIndex: reactData.tZindex } : null;
        });
        var computeTableExtendProps = computed(function () {
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
            getRefMaps: function () { return refMaps; },
            getComputeMaps: function () { return computeMaps; }
        };
        var gridMethods = {};
        var handleRowClassName = function (params) {
            var pendingRecords = reactData.pendingRecords;
            var rowClassName = props.rowClassName;
            var clss = [];
            if (pendingRecords.some(function (item) { return item === params.row; })) {
                clss.push('row--pending');
            }
            clss.push(rowClassName ? (XEUtils.isFunction(rowClassName) ? rowClassName(params) : rowClassName) : '');
            return clss;
        };
        var handleActiveMethod = function (params) {
            var editConfig = props.editConfig;
            var pendingRecords = reactData.pendingRecords;
            var $xetable = refTable.value;
            var activeMethod = editConfig ? editConfig.activeMethod : null;
            return $xetable.findRowIndexOf(pendingRecords, params.row) === -1 && (!activeMethod || activeMethod(params));
        };
        var computeTableProps = computed(function () {
            var seqConfig = props.seqConfig, pagerConfig = props.pagerConfig, loading = props.loading, editConfig = props.editConfig, proxyConfig = props.proxyConfig;
            var isZMax = reactData.isZMax, tableLoading = reactData.tableLoading, tablePage = reactData.tablePage, tableData = reactData.tableData;
            var tableExtendProps = computeTableExtendProps.value;
            var proxyOpts = computeProxyOpts.value;
            var tableProps = Object.assign({}, tableExtendProps);
            if (isZMax) {
                if (tableExtendProps.maxHeight) {
                    tableProps.maxHeight = 'auto';
                }
                else {
                    tableProps.height = 'auto';
                }
            }
            if (proxyConfig) {
                tableProps.loading = loading || tableLoading;
                tableProps.data = tableData;
                tableProps.rowClassName = handleRowClassName;
                if (proxyOpts.seq && isEnableConf(pagerConfig)) {
                    tableProps.seqConfig = Object.assign({}, seqConfig, { startIndex: (tablePage.currentPage - 1) * tablePage.pageSize });
                }
            }
            if (editConfig) {
                tableProps.editConfig = Object.assign({}, editConfig, { activeMethod: handleActiveMethod });
            }
            return tableProps;
        });
        var initToolbar = function () {
            nextTick(function () {
                var $xetable = refTable.value;
                var $xetoolbar = refToolbar.value;
                if ($xetable && $xetoolbar) {
                    $xetable.connect($xetoolbar);
                }
            });
        };
        var initPages = function () {
            var pagerConfig = props.pagerConfig;
            var tablePage = reactData.tablePage;
            var pagerOpts = computePagerOpts.value;
            var currentPage = pagerOpts.currentPage, pageSize = pagerOpts.pageSize;
            if (pagerConfig) {
                if (currentPage) {
                    tablePage.currentPage = currentPage;
                }
                if (pageSize) {
                    tablePage.pageSize = pageSize;
                }
            }
        };
        var triggerPendingEvent = function (code) {
            var pendingRecords = reactData.pendingRecords;
            var isMsg = computeIsMsg.value;
            var $xetable = refTable.value;
            var selectRecords = $xetable.getCheckboxRecords();
            if (selectRecords.length) {
                var plus_1 = [];
                var minus_1 = [];
                selectRecords.forEach(function (data) {
                    if (pendingRecords.some(function (item) { return data === item; })) {
                        minus_1.push(data);
                    }
                    else {
                        plus_1.push(data);
                    }
                });
                if (minus_1.length) {
                    reactData.pendingRecords = pendingRecords.filter(function (item) { return $xetable.findRowIndexOf(minus_1, item) === -1; }).concat(plus_1);
                }
                else if (plus_1.length) {
                    reactData.pendingRecords = pendingRecords.concat(plus_1);
                }
                gridExtendTableMethods.clearCheckboxRow();
            }
            else {
                if (isMsg) {
                    VXETable.modal.message({ id: code, content: GlobalConfig.i18n('vxe.grid.selectOneRecord'), status: 'warning' });
                }
            }
        };
        var getRespMsg = function (rest, defaultMsg) {
            var proxyOpts = computeProxyOpts.value;
            var _a = proxyOpts.props, proxyProps = _a === void 0 ? {} : _a;
            var msg;
            if (rest && proxyProps.message) {
                msg = XEUtils.get(rest, proxyProps.message);
            }
            return msg || GlobalConfig.i18n(defaultMsg);
        };
        var handleDeleteRow = function (code, alertKey, callback) {
            var isMsg = computeIsMsg.value;
            var selectRecords = gridExtendTableMethods.getCheckboxRecords();
            if (isMsg) {
                if (selectRecords.length) {
                    return VXETable.modal.confirm({ id: "cfm_" + code, content: GlobalConfig.i18n(alertKey), escClosable: true }).then(function (type) {
                        if (type === 'confirm') {
                            callback();
                        }
                    });
                }
                else {
                    VXETable.modal.message({ id: "msg_" + code, content: GlobalConfig.i18n('vxe.grid.selectOneRecord'), status: 'warning' });
                }
            }
            else {
                if (selectRecords.length) {
                    callback();
                }
            }
            return Promise.resolve();
        };
        var pageChangeEvent = function (params) {
            var proxyConfig = props.proxyConfig;
            var tablePage = reactData.tablePage;
            var currentPage = params.currentPage, pageSize = params.pageSize;
            tablePage.currentPage = currentPage;
            tablePage.pageSize = pageSize;
            gridMethods.dispatchEvent('page-change', params);
            if (proxyConfig) {
                gridMethods.commitProxy('query');
            }
        };
        var sortChangeEvent = function (params) {
            var $xetable = refTable.value;
            var proxyConfig = props.proxyConfig;
            var computeSortOpts = $xetable.getComputeMaps().computeSortOpts;
            var sortOpts = computeSortOpts.value;
            // ????????????????????????
            if (sortOpts.remote) {
                reactData.sortData = params.sortList;
                if (proxyConfig) {
                    reactData.tablePage.currentPage = 1;
                    gridMethods.commitProxy('query');
                }
            }
            gridMethods.dispatchEvent('sort-change', params);
        };
        var filterChangeEvent = function (params) {
            var $xetable = refTable.value;
            var proxyConfig = props.proxyConfig;
            var computeFilterOpts = $xetable.getComputeMaps().computeFilterOpts;
            var filterOpts = computeFilterOpts.value;
            // ????????????????????????
            if (filterOpts.remote) {
                reactData.filterData = params.filterList;
                if (proxyConfig) {
                    reactData.tablePage.currentPage = 1;
                    gridMethods.commitProxy('query');
                }
            }
            gridMethods.dispatchEvent('filter-change', params);
        };
        var submitFormEvent = function (params) {
            var proxyConfig = props.proxyConfig;
            if (proxyConfig) {
                gridMethods.commitProxy('reload');
            }
            gridMethods.dispatchEvent('form-submit', params);
        };
        var resetFormEvent = function (params) {
            var proxyConfig = props.proxyConfig;
            if (proxyConfig) {
                gridMethods.commitProxy('reload');
            }
            gridMethods.dispatchEvent('form-reset', params);
        };
        var submitInvalidEvent = function (params) {
            gridMethods.dispatchEvent('form-submit-invalid', params);
        };
        var collapseEvent = function (params) {
            nextTick(function () { return gridExtendTableMethods.recalculate(true); });
            gridMethods.dispatchEvent('form-toggle-collapse', params);
            gridMethods.dispatchEvent('form-collapse', params);
        };
        var handleZoom = function (isMax) {
            var isZMax = reactData.isZMax;
            if (isMax ? !isZMax : isZMax) {
                reactData.isZMax = !isZMax;
                if (reactData.tZindex < getLastZIndex()) {
                    reactData.tZindex = nextZIndex();
                }
            }
            return nextTick().then(function () { return gridExtendTableMethods.recalculate(true); }).then(function () { return reactData.isZMax; });
        };
        var getFuncSlot = function (optSlots, slotKey) {
            var funcSlot = optSlots[slotKey];
            if (funcSlot) {
                if (XEUtils.isString(funcSlot)) {
                    if (slots[funcSlot]) {
                        return slots[funcSlot];
                    }
                    else {
                        if (process.env.NODE_ENV === 'development') {
                            errLog('vxe.error.notSlot', [funcSlot]);
                        }
                    }
                }
                else {
                    return funcSlot;
                }
            }
            return null;
        };
        /**
         * ????????????
         */
        var renderForms = function () {
            var formConfig = props.formConfig, proxyConfig = props.proxyConfig;
            var formData = reactData.formData;
            var proxyOpts = computeProxyOpts.value;
            var formOpts = computeFormOpts.value;
            var restVNs = [];
            if (isEnableConf(formConfig) || slots.form) {
                var slotVNs = [];
                if (slots.form) {
                    slotVNs = slots.form({ $grid: $xegrid });
                }
                else {
                    if (formOpts.items) {
                        var formSlots_1 = {};
                        if (!formOpts.inited) {
                            formOpts.inited = true;
                            var beforeItem_1 = proxyOpts.beforeItem;
                            if (proxyOpts && beforeItem_1) {
                                formOpts.items.forEach(function (item) {
                                    beforeItem_1({ $grid: $xegrid, item: item });
                                });
                            }
                        }
                        // ????????????
                        formOpts.items.forEach(function (item) {
                            XEUtils.each(item.slots, function (func) {
                                if (!XEUtils.isFunction(func)) {
                                    if (slots[func]) {
                                        formSlots_1[func] = slots[func];
                                    }
                                }
                            });
                        });
                        slotVNs.push(h(resolveComponent('vxe-form'), __assign(__assign({ ref: refForm }, Object.assign({}, formOpts, {
                            data: proxyConfig && proxyOpts.form ? formData : formOpts.data
                        })), { onSubmit: submitFormEvent, onReset: resetFormEvent, onSubmitInvalid: submitInvalidEvent, onCollapse: collapseEvent }), formSlots_1));
                    }
                }
                restVNs.push(h('div', {
                    ref: refFormWrapper,
                    class: 'vxe-grid--form-wrapper'
                }, slotVNs));
            }
            return restVNs;
        };
        /**
         * ???????????????
         */
        var renderToolbars = function () {
            var toolbarConfig = props.toolbarConfig;
            var toolbarOpts = computeToolbarOpts.value;
            var restVNs = [];
            if (isEnableConf(toolbarConfig) || slots.toolbar) {
                var slotVNs = [];
                if (slots.toolbar) {
                    slotVNs = slots.toolbar({ $grid: $xegrid });
                }
                else {
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
                    slotVNs.push(h(resolveComponent('vxe-toolbar'), __assign({ ref: refToolbar }, toolbarOpts), toolbarSlots));
                }
                restVNs.push(h('div', {
                    ref: refToolbarWrapper,
                    class: 'vxe-grid--toolbar-wrapper'
                }, slotVNs));
            }
            return restVNs;
        };
        /**
         * ????????????????????????
         */
        var renderTops = function () {
            if (slots.top) {
                return [
                    h('div', {
                        ref: refTopWrapper,
                        class: 'vxe-grid--top-wrapper'
                    }, slots.top({ $grid: $xegrid }))
                ];
            }
            return [];
        };
        var tableCompEvents = {};
        tableComponentEmits.forEach(function (name) {
            var type = XEUtils.camelCase("on-" + name);
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
        var renderTables = function () {
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
            return [
                h(resolveComponent('vxe-table'), __assign(__assign({ ref: refTable }, tableProps), tableOns), emptySlot ? {
                    empty: function () { return emptySlot({}); }
                } : {})
            ];
        };
        /**
         * ????????????????????????
         */
        var renderBottoms = function () {
            if (slots.bottom) {
                return [
                    h('div', {
                        ref: refBottomWrapper,
                        class: 'vxe-grid--bottom-wrapper'
                    }, slots.bottom({ $grid: $xegrid }))
                ];
            }
            return [];
        };
        /**
         * ????????????
         */
        var renderPagers = function () {
            var pagerConfig = props.pagerConfig;
            var pagerOpts = computePagerOpts.value;
            var restVNs = [];
            if (isEnableConf(pagerConfig) || slots.pager) {
                var slotVNs = [];
                if (slots.pager) {
                    slotVNs = slots.pager({ $grid: $xegrid });
                }
                else {
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
                    slotVNs.push(h(resolveComponent('vxe-pager'), __assign(__assign(__assign({ ref: refPager }, pagerOpts), (props.proxyConfig ? reactData.tablePage : {})), { onPageChange: pageChangeEvent }), pagerSlots));
                }
                restVNs.push(h('div', {
                    ref: refPagerWrapper,
                    class: 'vxe-grid--pager-wrapper'
                }, slotVNs));
            }
            return restVNs;
        };
        var initProxy = function () {
            var proxyConfig = props.proxyConfig, formConfig = props.formConfig;
            var proxyInited = reactData.proxyInited;
            var proxyOpts = computeProxyOpts.value;
            var formOpts = computeFormOpts.value;
            if (proxyConfig) {
                if (isEnableConf(formConfig) && proxyOpts.form && formOpts.items) {
                    var formData_1 = {};
                    formOpts.items.forEach(function (item) {
                        var field = item.field, itemRender = item.itemRender;
                        if (field) {
                            var itemValue = null;
                            if (itemRender) {
                                var defaultValue = itemRender.defaultValue;
                                if (XEUtils.isFunction(defaultValue)) {
                                    itemValue = defaultValue({ item: item });
                                }
                                else if (!XEUtils.isUndefined(defaultValue)) {
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
                    nextTick(function () { return gridMethods.commitProxy('_init'); });
                }
            }
        };
        gridMethods = {
            dispatchEvent: function (type, params, evnt) {
                emit(type, Object.assign({ $grid: $xegrid, $event: evnt }, params));
            },
            /**
             * ????????????????????? code ??? button
             * @param {String/Object} code ??????????????????
             */
            commitProxy: function (proxyTarget) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                var toolbarConfig = props.toolbarConfig, pagerConfig = props.pagerConfig;
                var tablePage = reactData.tablePage, formData = reactData.formData;
                var isMsg = computeIsMsg.value;
                var proxyOpts = computeProxyOpts.value;
                var toolbarOpts = computeToolbarOpts.value;
                var beforeQuery = proxyOpts.beforeQuery, afterQuery = proxyOpts.afterQuery, beforeDelete = proxyOpts.beforeDelete, afterDelete = proxyOpts.afterDelete, beforeSave = proxyOpts.beforeSave, afterSave = proxyOpts.afterSave, _a = proxyOpts.ajax, ajax = _a === void 0 ? {} : _a, _b = proxyOpts.props, proxyProps = _b === void 0 ? {} : _b;
                var $xetable = refTable.value;
                var button = null;
                var code = null;
                if (XEUtils.isString(proxyTarget)) {
                    var buttons = toolbarOpts.buttons;
                    var matchObj = toolbarConfig && buttons ? XEUtils.findTree(buttons, function (item) { return item.code === proxyTarget; }, { children: 'dropdowns' }) : null;
                    button = matchObj ? matchObj.item : null;
                    code = proxyTarget;
                }
                else {
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
                        return handleDeleteRow(code, 'vxe.grid.removeSelectRecord', function () { return $xetable.removeCheckboxRow(); });
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
                    case 'query': {
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
                                if (isEnableConf(pagerConfig)) {
                                    pageParams = __assign({}, tablePage);
                                }
                            }
                            if (isInited) {
                                var computeSortOpts = $xetable.getComputeMaps().computeSortOpts;
                                var sortOpts = computeSortOpts.value;
                                var defaultSort = sortOpts.defaultSort;
                                // ????????????????????????
                                if (defaultSort) {
                                    if (!XEUtils.isArray(defaultSort)) {
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
                            }
                            else {
                                if (isReload) {
                                    reactData.pendingRecords = [];
                                    $xetable.clearAll();
                                }
                                else {
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
                            return Promise.resolve((beforeQuery || ajaxMethods).apply(void 0, applyArgs_1))
                                .catch(function (e) { return e; })
                                .then(function (rest) {
                                reactData.tableLoading = false;
                                if (rest) {
                                    if (isEnableConf(pagerConfig)) {
                                        var total = XEUtils.get(rest, proxyProps.total || 'page.total') || 0;
                                        tablePage.total = total;
                                        reactData.tableData = XEUtils.get(rest, proxyProps.result || 'result') || [];
                                        // ???????????????????????????????????????????????????
                                        var pageCount = Math.max(Math.ceil(total / tablePage.pageSize), 1);
                                        if (tablePage.currentPage > pageCount) {
                                            tablePage.currentPage = pageCount;
                                        }
                                    }
                                    else {
                                        reactData.tableData = (proxyProps.list ? XEUtils.get(rest, proxyProps.list) : rest) || [];
                                    }
                                }
                                else {
                                    reactData.tableData = [];
                                }
                                if (afterQuery) {
                                    afterQuery.apply(void 0, applyArgs_1);
                                }
                            });
                        }
                        else {
                            if (process.env.NODE_ENV === 'development') {
                                errLog('vxe.error.notFunc', ['proxy-config.ajax.query']);
                            }
                        }
                        break;
                    }
                    case 'delete': {
                        var ajaxMethods_1 = ajax.delete;
                        if (ajaxMethods_1) {
                            var selectRecords_1 = gridExtendTableMethods.getCheckboxRecords();
                            var removeRecords_1 = selectRecords_1.filter(function (row) { return !$xetable.isInsertByRow(row); });
                            var body = { removeRecords: removeRecords_1 };
                            var applyArgs_2 = [{ $grid: $xegrid, code: code, button: button, body: body, options: ajaxMethods_1 }].concat(args);
                            if (selectRecords_1.length) {
                                return handleDeleteRow(code, 'vxe.grid.deleteSelectRecord', function () {
                                    if (!removeRecords_1.length) {
                                        return $xetable.remove(selectRecords_1);
                                    }
                                    reactData.tableLoading = true;
                                    return Promise.resolve((beforeDelete || ajaxMethods_1).apply(void 0, applyArgs_2))
                                        .then(function (rest) {
                                        reactData.tableLoading = false;
                                        reactData.pendingRecords = reactData.pendingRecords.filter(function (row) { return $xetable.findRowIndexOf(removeRecords_1, row) === -1; });
                                        if (isMsg) {
                                            VXETable.modal.message({ content: getRespMsg(rest, 'vxe.grid.delSuccess'), status: 'success' });
                                        }
                                        if (afterDelete) {
                                            afterDelete.apply(void 0, applyArgs_2);
                                        }
                                        else {
                                            gridMethods.commitProxy('query');
                                        }
                                    })
                                        .catch(function (rest) {
                                        reactData.tableLoading = false;
                                        if (isMsg) {
                                            VXETable.modal.message({ id: code, content: getRespMsg(rest, 'vxe.grid.operError'), status: 'error' });
                                        }
                                    });
                                });
                            }
                            else {
                                if (isMsg) {
                                    VXETable.modal.message({ id: code, content: GlobalConfig.i18n('vxe.grid.selectOneRecord'), status: 'warning' });
                                }
                            }
                        }
                        else {
                            if (process.env.NODE_ENV === 'development') {
                                errLog('vxe.error.notFunc', ['proxy-config.ajax.delete']);
                            }
                        }
                        break;
                    }
                    case 'save': {
                        var ajaxMethods_2 = ajax.save;
                        if (ajaxMethods_2) {
                            var body_1 = Object.assign({ pendingRecords: reactData.pendingRecords }, $xetable.getRecordset());
                            var insertRecords_1 = body_1.insertRecords, removeRecords_2 = body_1.removeRecords, updateRecords_1 = body_1.updateRecords, pendingRecords_1 = body_1.pendingRecords;
                            var applyArgs_3 = [{ $grid: $xegrid, code: code, button: button, body: body_1, options: ajaxMethods_2 }].concat(args);
                            // ??????????????????????????????????????????
                            if (insertRecords_1.length) {
                                body_1.pendingRecords = pendingRecords_1.filter(function (row) { return $xetable.findRowIndexOf(insertRecords_1, row) === -1; });
                            }
                            // ?????????????????????????????????
                            if (pendingRecords_1.length) {
                                body_1.insertRecords = insertRecords_1.filter(function (row) { return $xetable.findRowIndexOf(pendingRecords_1, row) === -1; });
                            }
                            // ?????????????????????????????????
                            return $xetable.validate(body_1.insertRecords.concat(updateRecords_1)).then(function () {
                                if (body_1.insertRecords.length || removeRecords_2.length || updateRecords_1.length || body_1.pendingRecords.length) {
                                    reactData.tableLoading = true;
                                    return Promise.resolve((beforeSave || ajaxMethods_2).apply(void 0, applyArgs_3))
                                        .then(function (rest) {
                                        reactData.tableLoading = false;
                                        reactData.pendingRecords = [];
                                        if (isMsg) {
                                            VXETable.modal.message({ content: getRespMsg(rest, 'vxe.grid.saveSuccess'), status: 'success' });
                                        }
                                        if (afterSave) {
                                            afterSave.apply(void 0, applyArgs_3);
                                        }
                                        else {
                                            gridMethods.commitProxy('query');
                                        }
                                    })
                                        .catch(function (rest) {
                                        reactData.tableLoading = false;
                                        if (isMsg) {
                                            VXETable.modal.message({ id: code, content: getRespMsg(rest, 'vxe.grid.operError'), status: 'error' });
                                        }
                                    });
                                }
                                else {
                                    if (isMsg) {
                                        VXETable.modal.message({ id: code, content: GlobalConfig.i18n('vxe.grid.dataUnchanged'), status: 'info' });
                                    }
                                }
                            }).catch(function (errMap) { return errMap; });
                        }
                        else {
                            if (process.env.NODE_ENV === 'development') {
                                errLog('vxe.error.notFunc', ['proxy-config.ajax.save']);
                            }
                        }
                        break;
                    }
                    default: {
                        var btnMethod = VXETable.commands.get(code);
                        if (btnMethod) {
                            btnMethod.apply(void 0, __spreadArray([{ code: code, button: button, $grid: $xegrid, $table: $xetable }], args));
                        }
                    }
                }
                return nextTick();
            },
            zoom: function () {
                if (reactData.isZMax) {
                    return gridMethods.revert();
                }
                return gridMethods.maximize();
            },
            isMaximized: function () {
                return reactData.isZMax;
            },
            maximize: function () {
                return handleZoom(true);
            },
            revert: function () {
                return handleZoom();
            },
            getFormItems: function (itemIndex) {
                var formOpts = computeFormOpts.value;
                var formConfig = props.formConfig;
                var items = formOpts.items;
                var itemList = [];
                XEUtils.eachTree(isEnableConf(formConfig) && items ? items : [], function (item) {
                    itemList.push(item);
                }, { children: 'children' });
                return XEUtils.isUndefined(itemIndex) ? itemList : itemList[itemIndex];
            },
            getPendingRecords: function () {
                return reactData.pendingRecords;
            },
            getProxyInfo: function () {
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
        };
        // ????????????
        if (process.env.NODE_ENV === 'development') {
            gridMethods.loadColumn = function (columns) {
                var $xetable = refTable.value;
                XEUtils.eachTree(columns, function (column) {
                    if (column.slots) {
                        XEUtils.each(column.slots, function (func) {
                            if (!XEUtils.isFunction(func)) {
                                if (!slots[func]) {
                                    errLog('vxe.error.notSlot', [func]);
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
            callSlot: function (slotFunc, params) {
                if (slotFunc) {
                    if (XEUtils.isString(slotFunc)) {
                        slotFunc = slots[slotFunc] || null;
                    }
                    if (XEUtils.isFunction(slotFunc)) {
                        return slotFunc(params);
                    }
                }
                return [];
            },
            /**
             * ???????????????????????????
             */
            getExcludeHeight: function () {
                var height = props.height;
                var isZMax = reactData.isZMax;
                var el = refElem.value;
                var formWrapper = refFormWrapper.value;
                var toolbarWrapper = refToolbarWrapper.value;
                var topWrapper = refTopWrapper.value;
                var bottomWrapper = refBottomWrapper.value;
                var pagerWrapper = refPagerWrapper.value;
                var parentPaddingSize = isZMax || height !== 'auto' ? 0 : getPaddingTopBottomSize(el.parentNode);
                return parentPaddingSize + getPaddingTopBottomSize(el) + getOffsetHeight(formWrapper) + getOffsetHeight(toolbarWrapper) + getOffsetHeight(topWrapper) + getOffsetHeight(bottomWrapper) + getOffsetHeight(pagerWrapper);
            },
            getParentHeight: function () {
                var el = refElem.value;
                if (el) {
                    return (reactData.isZMax ? getDomNode().visibleHeight : XEUtils.toNumber(getComputedStyle(el.parentNode).height)) - gridPrivateMethods.getExcludeHeight();
                }
                return 0;
            },
            triggerToolbarBtnEvent: function (button, evnt) {
                gridMethods.commitProxy(button, evnt);
                gridMethods.dispatchEvent('toolbar-button-click', { code: button.code, button: button }, evnt);
            },
            triggerToolbarTolEvent: function (tool, evnt) {
                gridMethods.commitProxy(tool, evnt);
                gridMethods.dispatchEvent('toolbar-tool-click', { code: tool.code, tool: tool, $event: evnt });
            },
            triggerZoomEvent: function (evnt) {
                gridMethods.zoom();
                gridMethods.dispatchEvent('zoom', { type: reactData.isZMax ? 'max' : 'revert' }, evnt);
            }
        };
        Object.assign($xegrid, gridExtendTableMethods, gridMethods, gridPrivateMethods);
        watch(function () { return props.columns; }, function (value) {
            nextTick(function () { return $xegrid.loadColumn(value || []); });
        });
        watch(function () { return props.toolbarConfig; }, function (value) {
            if (value) {
                initToolbar();
            }
        });
        watch(function () { return props.proxyConfig; }, function () {
            initProxy();
        });
        watch(function () { return props.pagerConfig; }, function () {
            initPages();
        });
        var handleGlobalKeydownEvent = function (evnt) {
            var zoomOpts = computeZoomOpts.value;
            var isEsc = hasEventKey(evnt, EVENT_KEYS.ESCAPE);
            if (isEsc && reactData.isZMax && zoomOpts.escRestore !== false) {
                gridPrivateMethods.triggerZoomEvent(evnt);
            }
        };
        VXETable.hooks.forEach(function (options) {
            var setupGrid = options.setupGrid;
            if (setupGrid) {
                var hookRest = setupGrid($xegrid);
                if (hookRest && XEUtils.isObject(hookRest)) {
                    Object.assign($xegrid, hookRest);
                }
            }
        });
        onMounted(function () {
            nextTick(function () {
                var data = props.data, columns = props.columns, proxyConfig = props.proxyConfig;
                var proxyOpts = computeProxyOpts.value;
                var formOpts = computeFormOpts.value;
                if (proxyConfig && (data || (proxyOpts.form && formOpts.data))) {
                    errLog('errConflicts', ['grid.data', 'grid.proxy-config']);
                }
                if (columns && columns.length) {
                    $xegrid.loadColumn(columns);
                }
                initToolbar();
                initPages();
                initProxy();
            });
            GlobalEvent.on($xegrid, 'keydown', handleGlobalKeydownEvent);
        });
        onUnmounted(function () {
            GlobalEvent.off($xegrid, 'keydown');
        });
        var renderVN = function () {
            var _a;
            var vSize = computeSize.value;
            var styles = computeStyles.value;
            return h('div', {
                ref: refElem,
                class: ['vxe-grid', (_a = {},
                        _a["size--" + vSize] = vSize,
                        _a['is--animat'] = !!props.animat,
                        _a['is--round'] = props.round,
                        _a['is--maximize'] = reactData.isZMax,
                        _a['is--loading'] = props.loading || reactData.tableLoading,
                        _a)],
                style: styles
            }, renderForms().concat(renderToolbars(), renderTops(), renderTables(), renderBottoms(), renderPagers()));
        };
        $xegrid.renderVN = renderVN;
        provide('$xegrid', $xegrid);
        return $xegrid;
    },
    render: function () {
        return this.renderVN();
    }
});
