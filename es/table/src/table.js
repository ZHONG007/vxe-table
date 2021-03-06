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
import { defineComponent, getCurrentInstance, h, createCommentVNode, resolveComponent, reactive, ref, provide, inject, nextTick, onActivated, onDeactivated, onBeforeUnmount, onUnmounted, watch, computed, onMounted } from 'vue';
import XEUtils from 'xe-utils';
import { browse, isPx, isScale, hasClass, addClass, removeClass, getEventTargetNode, getPaddingTopBottomSize, setScrollTop, setScrollLeft } from '../../tools/dom';
import { warnLog, errLog, getLog, getLastZIndex, nextZIndex, hasChildrenList, getFuncText, isEnableConf, formatText, eqEmptyValue } from '../../tools/utils';
import { createResizeEvent } from '../../tools/resize';
import { GlobalEvent, hasEventKey, EVENT_KEYS } from '../../tools/event';
import { useSize } from '../../hooks/size';
import { VXETable } from '../../v-x-e-table';
import GlobalConfig from '../../v-x-e-table/src/conf';
import Cell from './cell';
import TableBodyComponent from './body';
import tableProps from './props';
import tableEmits from './emits';
import { getRowUniqueId, clearTableAllStatus, getRowkey, getRowid, rowToVisible, colToVisible, getCellValue, setCellValue, handleFieldOrColumn, restoreScrollLocation, restoreScrollListener } from './util';
var isWebkit = browse['-webkit'] && !browse.edge;
var resizableStorageKey = 'VXE_TABLE_CUSTOM_COLUMN_WIDTH';
var visibleStorageKey = 'VXE_TABLE_CUSTOM_COLUMN_VISIBLE';
export default defineComponent({
    name: 'VxeTable',
    props: tableProps,
    emits: tableEmits,
    setup: function (props, context) {
        var slots = context.slots, emit = context.emit;
        var hasUseTooltip = VXETable.tooltip;
        var xID = XEUtils.uniqueId();
        var computeSize = useSize(props);
        var instance = getCurrentInstance();
        var reactData = reactive({
            // ?????????????????????
            staticColumns: [],
            // ??????????????????
            tableGroupColumn: [],
            // ?????????????????????
            tableColumn: [],
            // ??????????????????
            tableData: [],
            // ????????????????????? X ????????????????????????
            scrollXLoad: false,
            // ????????????????????? Y ????????????????????????
            scrollYLoad: false,
            // ???????????????????????????
            overflowY: true,
            // ???????????????????????????
            overflowX: false,
            // ????????????????????????
            scrollbarWidth: 0,
            // ????????????????????????
            scrollbarHeight: 0,
            // ??????
            rowHeight: 0,
            // ????????????????????????
            parentHeight: 0,
            // ????????????????????????
            isGroup: false,
            isAllOverflow: false,
            // ??????????????????????????????
            isAllSelected: false,
            // ?????????????????????????????????????????????
            isIndeterminate: false,
            // ?????????????????????????????????
            selection: [],
            // ?????????
            currentRow: null,
            // ???????????????????????????
            currentColumn: null,
            // ???????????????????????????
            selectRow: null,
            // ??????????????????
            footerTableData: [],
            // ???????????????
            expandColumn: null,
            // ??????????????????
            treeNodeColumn: null,
            hasFixedColumn: false,
            // ???????????????
            rowExpandeds: [],
            // ?????????????????????????????????
            expandLazyLoadeds: [],
            // ??????????????????
            treeExpandeds: [],
            // ?????????????????????????????????
            treeLazyLoadeds: [],
            // ?????????????????????????????????
            treeIndeterminates: [],
            // ???????????????????????????
            mergeList: [],
            // ??????????????????????????????
            mergeFooterList: [],
            // ???????????????
            initStore: {
                filter: false,
                import: false,
                export: false
            },
            // ????????????????????????
            filterStore: {
                isAllSelected: false,
                isIndeterminate: false,
                style: null,
                options: [],
                column: null,
                multiple: false,
                visible: false,
                maxHeight: null
            },
            // ????????????????????????
            columnStore: {
                leftList: [],
                centerList: [],
                rightList: [],
                resizeList: [],
                pxList: [],
                pxMinList: [],
                scaleList: [],
                scaleMinList: [],
                autoList: []
            },
            // ???????????????????????????
            ctxMenuStore: {
                selected: null,
                visible: false,
                showChild: false,
                selectChild: null,
                list: [],
                style: null
            },
            // ???????????????????????????
            editStore: {
                indexs: {
                    columns: []
                },
                titles: {
                    columns: []
                },
                // ?????????
                selected: {
                    row: null,
                    column: null
                },
                // ????????????
                copyed: {
                    cut: false,
                    rows: [],
                    columns: []
                },
                // ??????
                actived: {
                    row: null,
                    column: null
                },
                insertList: [],
                removeList: []
            },
            // ??????????????????????????????
            validStore: {
                visible: false,
                row: null,
                column: null,
                content: '',
                rule: null,
                isArrow: false
            },
            // ??????????????????
            importStore: {
                inited: false,
                file: null,
                type: '',
                modeList: [],
                typeList: [],
                filename: '',
                visible: false
            },
            importParams: {
                mode: '',
                types: null,
                message: true
            },
            // ??????????????????
            exportStore: {
                inited: false,
                name: '',
                modeList: [],
                typeList: [],
                columns: [],
                isPrint: false,
                hasFooter: false,
                hasMerge: false,
                hasTree: false,
                hasColgroup: false,
                visible: false
            },
            exportParams: {
                filename: '',
                sheetName: '',
                mode: '',
                type: '',
                isColgroup: false,
                isMerge: false,
                isAllExpand: false,
                useStyle: false,
                original: false,
                message: true,
                isHeader: false,
                isFooter: false
            }
        });
        var internalData = {
            tZindex: 0,
            elemStore: {},
            // ???????????? X ???????????????????????????
            scrollXStore: {
                offsetSize: 0,
                visibleSize: 0,
                startIndex: 0,
                endIndex: 0
            },
            // ???????????? Y ????????????????????????
            scrollYStore: {
                rowHeight: 0,
                offsetSize: 0,
                visibleSize: 0,
                startIndex: 0,
                endIndex: 0
            },
            // ?????? tooltip ????????????
            tooltipStore: {},
            // ????????????
            tableWidth: 0,
            // ????????????
            tableHeight: 0,
            // ????????????
            headerHeight: 0,
            // ????????????
            footerHeight: 0,
            customHeight: 0,
            customMaxHeight: 0,
            // ?????? hover ???
            hoverRow: null,
            // ??????????????????
            lastScrollLeft: 0,
            lastScrollTop: 0,
            lastScrollTime: 0,
            // ???????????????????????????????????????
            radioReserveRow: null,
            // ???????????????????????????????????????
            checkboxReserveRowMap: {},
            // ?????????????????????????????????
            rowExpandedReserveRowMap: {},
            // ???????????????????????????????????????
            treeExpandedReserveRowMap: {},
            // ??????????????????????????????
            tableFullData: [],
            afterFullData: [],
            tableSynchData: [],
            tableSourceData: [],
            // ?????????????????????????????????
            collectColumn: [],
            // ?????????????????????????????????
            tableFullColumn: [],
            // ???????????????
            visibleColumn: [],
            // ???????????????
            fullAllDataRowIdData: {},
            fullDataRowIdData: {},
            fullColumnIdData: {},
            fullColumnFieldData: {},
            inited: false,
            tooltipActive: false,
            tooltipTimeout: null,
            initStatus: false,
            isActivated: false
        };
        var tableMethods = {};
        var tablePrivateMethods = {};
        var refElem = ref();
        var refTooltip = ref();
        var refCommTooltip = ref();
        var refValidTooltip = ref();
        var refTableFilter = ref();
        var refTableMenu = ref();
        var refTableHeader = ref();
        var refTableBody = ref();
        var refTableFooter = ref();
        var refTableLeftHeader = ref();
        var refTableLeftBody = ref();
        var refTableLeftFooter = ref();
        var refTableRightHeader = ref();
        var refTableRightBody = ref();
        var refTableRightFooter = ref();
        var refLeftContainer = ref();
        var refRightContainer = ref();
        var refCellResizeBar = ref();
        var refEmptyPlaceholder = ref();
        var $xegrid = inject('$xegrid', null);
        var $xetoolbar;
        var computeValidOpts = computed(function () {
            return Object.assign({}, GlobalConfig.table.validConfig, props.validConfig);
        });
        var computeSXOpts = computed(function () {
            return Object.assign({}, GlobalConfig.table.scrollX, props.scrollX);
        });
        var computeSYOpts = computed(function () {
            return Object.assign({}, GlobalConfig.table.scrollY, props.scrollY);
        });
        var computeRowHeightMaps = computed(function () {
            return {
                default: 48,
                medium: 44,
                small: 40,
                mini: 36
            };
        });
        var computeColumnOpts = computed(function () {
            return Object.assign({}, props.columnConfig);
        });
        var computeResizableOpts = computed(function () {
            return Object.assign({}, GlobalConfig.table.resizableConfig, props.resizableConfig);
        });
        var computeSeqOpts = computed(function () {
            return Object.assign({ startIndex: 0 }, GlobalConfig.table.seqConfig, props.seqConfig);
        });
        var computeRadioOpts = computed(function () {
            return Object.assign({}, GlobalConfig.table.radioConfig, props.radioConfig);
        });
        var computeCheckboxOpts = computed(function () {
            return Object.assign({}, GlobalConfig.table.checkboxConfig, props.checkboxConfig);
        });
        var computeTooltipOpts = ref();
        var handleTooltipLeaveMethod = function () {
            var tooltipOpts = computeTooltipOpts.value;
            setTimeout(function () {
                if (!internalData.tooltipActive) {
                    tableMethods.closeTooltip();
                }
            }, tooltipOpts.leaveDelay);
            return false;
        };
        computeTooltipOpts = computed(function () {
            var opts = Object.assign({ leaveDelay: 300 }, GlobalConfig.table.tooltipConfig, props.tooltipConfig);
            if (opts.enterable) {
                opts.leaveMethod = handleTooltipLeaveMethod;
            }
            return opts;
        });
        var computeValidTipOpts = computed(function () {
            var tooltipOpts = computeTooltipOpts.value;
            return Object.assign({ isArrow: false }, tooltipOpts);
        });
        var computeEditOpts = computed(function () {
            return Object.assign({}, GlobalConfig.table.editConfig, props.editConfig);
        });
        var computeSortOpts = computed(function () {
            return Object.assign({ orders: ['asc', 'desc', null] }, GlobalConfig.table.sortConfig, props.sortConfig);
        });
        var computeFilterOpts = computed(function () {
            return Object.assign({}, GlobalConfig.table.filterConfig, props.filterConfig);
        });
        var computeMouseOpts = computed(function () {
            return Object.assign({}, GlobalConfig.table.mouseConfig, props.mouseConfig);
        });
        var computeAreaOpts = computed(function () {
            return Object.assign({}, GlobalConfig.table.areaConfig, props.areaConfig);
        });
        var computeKeyboardOpts = computed(function () {
            return Object.assign({}, GlobalConfig.table.keyboardConfig, props.keyboardConfig);
        });
        var computeClipOpts = computed(function () {
            return Object.assign({}, GlobalConfig.table.clipConfig, props.clipConfig);
        });
        var computeFNROpts = computed(function () {
            return Object.assign({}, GlobalConfig.table.fnrConfig, props.fnrConfig);
        });
        var computeMenuOpts = computed(function () {
            return Object.assign({}, GlobalConfig.table.menuConfig, props.menuConfig);
        });
        var computeHeaderMenu = computed(function () {
            var menuOpts = computeMenuOpts.value;
            var headerOpts = menuOpts.header;
            return headerOpts && headerOpts.options ? headerOpts.options : [];
        });
        var computeBodyMenu = computed(function () {
            var menuOpts = computeMenuOpts.value;
            var bodyOpts = menuOpts.body;
            return bodyOpts && bodyOpts.options ? bodyOpts.options : [];
        });
        var computeFooterMenu = computed(function () {
            var menuOpts = computeMenuOpts.value;
            var footerOpts = menuOpts.footer;
            return footerOpts && footerOpts.options ? footerOpts.options : [];
        });
        var computeIsMenu = computed(function () {
            var menuOpts = computeMenuOpts.value;
            var headerMenu = computeHeaderMenu.value;
            var bodyMenu = computeBodyMenu.value;
            var footerMenu = computeFooterMenu.value;
            return !!(props.menuConfig && isEnableConf(menuOpts) && (headerMenu.length || bodyMenu.length || footerMenu.length));
        });
        var computeMenuList = computed(function () {
            var ctxMenuStore = reactData.ctxMenuStore;
            var rest = [];
            ctxMenuStore.list.forEach(function (list) {
                list.forEach(function (item) {
                    rest.push(item);
                });
            });
            return rest;
        });
        var computeExportOpts = computed(function () {
            return Object.assign({}, GlobalConfig.table.exportConfig, props.exportConfig);
        });
        var computeImportOpts = computed(function () {
            return Object.assign({}, GlobalConfig.table.importConfig, props.importConfig);
        });
        var computePrintOpts = computed(function () {
            return Object.assign({}, GlobalConfig.table.printConfig, props.printConfig);
        });
        var computeExpandOpts = computed(function () {
            return Object.assign({}, GlobalConfig.table.expandConfig, props.expandConfig);
        });
        var computeTreeOpts = computed(function () {
            return Object.assign({}, GlobalConfig.table.treeConfig, props.treeConfig);
        });
        var computeEmptyOpts = computed(function () {
            return Object.assign({}, GlobalConfig.table.emptyRender, props.emptyRender);
        });
        var computeCellOffsetWidth = computed(function () {
            return props.border ? Math.max(2, Math.ceil(reactData.scrollbarWidth / reactData.tableColumn.length)) : 1;
        });
        var computeCustomOpts = computed(function () {
            return Object.assign({}, GlobalConfig.table.customConfig, props.customConfig);
        });
        var computeTableBorder = computed(function () {
            var border = props.border;
            if (border === true) {
                return 'full';
            }
            if (border) {
                return border;
            }
            return 'default';
        });
        var computeIsAllCheckboxDisabled = computed(function () {
            var treeConfig = props.treeConfig;
            var tableData = reactData.tableData;
            var tableFullData = internalData.tableFullData;
            var checkboxOpts = computeCheckboxOpts.value;
            var strict = checkboxOpts.strict, checkMethod = checkboxOpts.checkMethod;
            if (strict) {
                if (tableData.length || tableFullData.length) {
                    if (checkMethod) {
                        if (treeConfig) {
                            // ???????????????????????????
                        }
                        // ???????????????????????????
                        return tableFullData.every(function (row) { return !checkMethod({ row: row }); });
                    }
                    return false;
                }
                return true;
            }
            return false;
        });
        var refMaps = {
            refElem: refElem,
            refTooltip: refTooltip,
            refValidTooltip: refValidTooltip,
            refTableFilter: refTableFilter,
            refTableMenu: refTableMenu,
            refTableHeader: refTableHeader,
            refTableBody: refTableBody,
            refTableFooter: refTableFooter,
            refTableLeftHeader: refTableLeftHeader,
            refTableLeftBody: refTableLeftBody,
            refTableLeftFooter: refTableLeftFooter,
            refTableRightHeader: refTableRightHeader,
            refTableRightBody: refTableRightBody,
            refTableRightFooter: refTableRightFooter,
            refLeftContainer: refLeftContainer,
            refRightContainer: refRightContainer,
            refCellResizeBar: refCellResizeBar
        };
        var computeMaps = {
            computeSize: computeSize,
            computeValidOpts: computeValidOpts,
            computeSXOpts: computeSXOpts,
            computeSYOpts: computeSYOpts,
            computeResizableOpts: computeResizableOpts,
            computeSeqOpts: computeSeqOpts,
            computeRadioOpts: computeRadioOpts,
            computeCheckboxOpts: computeCheckboxOpts,
            computeTooltipOpts: computeTooltipOpts,
            computeEditOpts: computeEditOpts,
            computeSortOpts: computeSortOpts,
            computeFilterOpts: computeFilterOpts,
            computeMouseOpts: computeMouseOpts,
            computeAreaOpts: computeAreaOpts,
            computeKeyboardOpts: computeKeyboardOpts,
            computeClipOpts: computeClipOpts,
            computeFNROpts: computeFNROpts,
            computeHeaderMenu: computeHeaderMenu,
            computeBodyMenu: computeBodyMenu,
            computeFooterMenu: computeFooterMenu,
            computeIsMenu: computeIsMenu,
            computeMenuOpts: computeMenuOpts,
            computeExportOpts: computeExportOpts,
            computeImportOpts: computeImportOpts,
            computePrintOpts: computePrintOpts,
            computeExpandOpts: computeExpandOpts,
            computeTreeOpts: computeTreeOpts,
            computeEmptyOpts: computeEmptyOpts,
            computeCustomOpts: computeCustomOpts,
            computeIsAllCheckboxDisabled: computeIsAllCheckboxDisabled
        };
        var $xetable = {
            xID: xID,
            props: props,
            context: context,
            instance: instance,
            reactData: reactData,
            internalData: internalData,
            getRefMaps: function () { return refMaps; },
            getComputeMaps: function () { return computeMaps; },
            xegrid: $xegrid
        };
        var eqCellValue = function (row1, row2, field) {
            var val1 = XEUtils.get(row1, field);
            var val2 = XEUtils.get(row2, field);
            if (eqEmptyValue(val1) && eqEmptyValue(val2)) {
                return true;
            }
            if (XEUtils.isString(val1) || XEUtils.isNumber(val1)) {
                /* eslint-disable eqeqeq */
                return val1 == val2;
            }
            return XEUtils.isEqual(val1, val2);
        };
        var getNextSortOrder = function (column) {
            var sortOpts = computeSortOpts.value;
            var orders = sortOpts.orders;
            var currOrder = column.order || null;
            var oIndex = orders.indexOf(currOrder) + 1;
            return orders[oIndex < orders.length ? oIndex : 0];
        };
        var getCustomStorageMap = function (key) {
            var version = GlobalConfig.version;
            var rest = XEUtils.toStringJSON(localStorage.getItem(key) || '');
            return rest && rest._v === version ? rest : { _v: version };
        };
        var getRecoverRow = function (list) {
            var fullAllDataRowIdData = internalData.fullAllDataRowIdData;
            return list.filter(function (row) {
                var rowid = getRowid($xetable, row);
                return !!fullAllDataRowIdData[rowid];
            });
        };
        var handleReserveRow = function (reserveRowMap) {
            var fullDataRowIdData = internalData.fullDataRowIdData;
            var reserveList = [];
            XEUtils.each(reserveRowMap, function (item, rowid) {
                if (fullDataRowIdData[rowid] && $xetable.findRowIndexOf(reserveList, fullDataRowIdData[rowid].row) === -1) {
                    reserveList.push(fullDataRowIdData[rowid].row);
                }
            });
            return reserveList;
        };
        var computeVirtualX = function () {
            var visibleColumn = internalData.visibleColumn;
            var tableBody = refTableBody.value;
            var tableBodyElem = tableBody ? tableBody.$el : null;
            if (tableBodyElem) {
                var scrollLeft = tableBodyElem.scrollLeft, clientWidth = tableBodyElem.clientWidth;
                var endWidth = scrollLeft + clientWidth;
                var toVisibleIndex = -1;
                var cWidth = 0;
                var visibleSize = 0;
                for (var colIndex = 0, colLen = visibleColumn.length; colIndex < colLen; colIndex++) {
                    cWidth += visibleColumn[colIndex].renderWidth;
                    if (toVisibleIndex === -1 && scrollLeft < cWidth) {
                        toVisibleIndex = colIndex;
                    }
                    if (toVisibleIndex >= 0) {
                        visibleSize++;
                        if (cWidth > endWidth) {
                            break;
                        }
                    }
                }
                return { toVisibleIndex: Math.max(0, toVisibleIndex), visibleSize: Math.max(8, visibleSize) };
            }
            return { toVisibleIndex: 0, visibleSize: 8 };
        };
        var computeVirtualY = function () {
            var tableHeader = refTableHeader.value;
            var tableBody = refTableBody.value;
            var tableBodyElem = tableBody ? tableBody.$el : null;
            var vSize = computeSize.value;
            var rowHeightMaps = computeRowHeightMaps.value;
            if (tableBodyElem) {
                var tableHeaderElem = tableHeader ? tableHeader.$el : null;
                var rowHeight = 0;
                var firstTrElem = void 0;
                firstTrElem = tableBodyElem.querySelector('tr');
                if (!firstTrElem && tableHeaderElem) {
                    firstTrElem = tableHeaderElem.querySelector('tr');
                }
                if (firstTrElem) {
                    rowHeight = firstTrElem.clientHeight;
                }
                if (!rowHeight) {
                    rowHeight = rowHeightMaps[vSize || 'default'];
                }
                var visibleSize = Math.max(8, Math.ceil(tableBodyElem.clientHeight / rowHeight) + 2);
                return { rowHeight: rowHeight, visibleSize: visibleSize };
            }
            return { rowHeight: 0, visibleSize: 8 };
        };
        var calculateMergerOffserIndex = function (list, offsetItem, type) {
            for (var mcIndex = 0, len = list.length; mcIndex < len; mcIndex++) {
                var mergeItem = list[mcIndex];
                var startIndex = offsetItem.startIndex, endIndex = offsetItem.endIndex;
                var mergeStartIndex = mergeItem[type];
                var mergeSpanNumber = mergeItem[type + 'span'];
                var mergeEndIndex = mergeStartIndex + mergeSpanNumber;
                if (mergeStartIndex < startIndex && startIndex < mergeEndIndex) {
                    offsetItem.startIndex = mergeStartIndex;
                }
                if (mergeStartIndex < endIndex && endIndex < mergeEndIndex) {
                    offsetItem.endIndex = mergeEndIndex;
                }
                if (offsetItem.startIndex !== startIndex || offsetItem.endIndex !== endIndex) {
                    mcIndex = -1;
                }
            }
        };
        var setMerges = function (merges, mList, rowList) {
            if (merges) {
                var treeConfig = props.treeConfig;
                var visibleColumn_1 = internalData.visibleColumn;
                if (treeConfig) {
                    errLog('vxe.error.noTree', ['merge-footer-items']);
                    return;
                }
                if (!XEUtils.isArray(merges)) {
                    merges = [merges];
                }
                merges.forEach(function (item) {
                    var row = item.row, col = item.col, rowspan = item.rowspan, colspan = item.colspan;
                    if (rowList && XEUtils.isNumber(row)) {
                        row = rowList[row];
                    }
                    if (XEUtils.isNumber(col)) {
                        col = visibleColumn_1[col];
                    }
                    if ((rowList ? row : XEUtils.isNumber(row)) && col && (rowspan || colspan)) {
                        rowspan = XEUtils.toNumber(rowspan) || 1;
                        colspan = XEUtils.toNumber(colspan) || 1;
                        if (rowspan > 1 || colspan > 1) {
                            var mcIndex = XEUtils.findIndexOf(mList, function (item) { return (item._row === row || getRowid($xetable, item._row) === getRowid($xetable, row)) && (item._col.id === col || item._col.id === col.id); });
                            var mergeItem = mList[mcIndex];
                            if (mergeItem) {
                                mergeItem.rowspan = rowspan;
                                mergeItem.colspan = colspan;
                                mergeItem._rowspan = rowspan;
                                mergeItem._colspan = colspan;
                            }
                            else {
                                var mergeRowIndex = rowList ? $xetable.findRowIndexOf(rowList, row) : row;
                                var mergeColIndex = tableMethods.getVTColumnIndex(col);
                                mList.push({
                                    row: mergeRowIndex,
                                    col: mergeColIndex,
                                    rowspan: rowspan,
                                    colspan: colspan,
                                    _row: row,
                                    _col: col,
                                    _rowspan: rowspan,
                                    _colspan: colspan
                                });
                            }
                        }
                    }
                });
            }
        };
        var removeMerges = function (merges, mList, rowList) {
            var rest = [];
            if (merges) {
                var treeConfig = props.treeConfig;
                var visibleColumn_2 = internalData.visibleColumn;
                if (treeConfig) {
                    throw new Error(getLog('vxe.error.noTree', ['merge-cells']));
                }
                if (!XEUtils.isArray(merges)) {
                    merges = [merges];
                }
                merges.forEach(function (item) {
                    var row = item.row, col = item.col;
                    if (rowList && XEUtils.isNumber(row)) {
                        row = rowList[row];
                    }
                    if (XEUtils.isNumber(col)) {
                        col = visibleColumn_2[col];
                    }
                    var mcIndex = XEUtils.findIndexOf(mList, function (item) { return (item._row === row || getRowid($xetable, item._row) === getRowid($xetable, row)) && (item._col.id === col || item._col.id === col.id); });
                    if (mcIndex > -1) {
                        var rItems = mList.splice(mcIndex, 1);
                        rest.push(rItems[0]);
                    }
                });
            }
            return rest;
        };
        var clearAllSort = function () {
            var tableFullColumn = internalData.tableFullColumn;
            tableFullColumn.forEach(function (column) {
                column.order = null;
            });
        };
        var calcHeight = function (key) {
            var parentHeight = reactData.parentHeight;
            var val = props[key];
            var num = 0;
            if (val) {
                if (val === 'auto') {
                    num = parentHeight;
                }
                else {
                    var excludeHeight = $xetable.getExcludeHeight();
                    if (isScale(val)) {
                        num = Math.floor((XEUtils.toInteger(val) || 1) / 100 * parentHeight);
                    }
                    else {
                        num = XEUtils.toNumber(val);
                    }
                    num = Math.max(40, num - excludeHeight);
                }
            }
            return num;
        };
        /**
         * ??????????????????????????????
         */
        var restoreCustomStorage = function () {
            var id = props.id, customConfig = props.customConfig;
            var collectColumn = internalData.collectColumn;
            var customOpts = computeCustomOpts.value;
            var storage = customOpts.storage;
            var isResizable = storage === true || (storage && storage.resizable);
            var isVisible = storage === true || (storage && storage.visible);
            if (customConfig && (isResizable || isVisible)) {
                var customMap_1 = {};
                if (!id) {
                    errLog('vxe.error.reqProp', ['id']);
                    return;
                }
                if (isResizable) {
                    var columnWidthStorage = getCustomStorageMap(resizableStorageKey)[id];
                    if (columnWidthStorage) {
                        XEUtils.each(columnWidthStorage, function (resizeWidth, field) {
                            customMap_1[field] = { field: field, resizeWidth: resizeWidth };
                        });
                    }
                }
                if (isVisible) {
                    var columnVisibleStorage = getCustomStorageMap(visibleStorageKey)[id];
                    if (columnVisibleStorage) {
                        var colVisibles = columnVisibleStorage.split('|');
                        var colHides = colVisibles[0] ? colVisibles[0].split(',') : [];
                        var colShows = colVisibles[1] ? colVisibles[1].split(',') : [];
                        colHides.forEach(function (field) {
                            if (customMap_1[field]) {
                                customMap_1[field].visible = false;
                            }
                            else {
                                customMap_1[field] = { field: field, visible: false };
                            }
                        });
                        colShows.forEach(function (field) {
                            if (customMap_1[field]) {
                                customMap_1[field].visible = true;
                            }
                            else {
                                customMap_1[field] = { field: field, visible: true };
                            }
                        });
                    }
                }
                var keyMap_1 = {};
                XEUtils.eachTree(collectColumn, function (column) {
                    var colKey = column.getKey();
                    if (colKey) {
                        keyMap_1[colKey] = column;
                    }
                });
                XEUtils.each(customMap_1, function (_a, field) {
                    var visible = _a.visible, resizeWidth = _a.resizeWidth;
                    var column = keyMap_1[field];
                    if (column) {
                        if (XEUtils.isNumber(resizeWidth)) {
                            column.resizeWidth = resizeWidth;
                        }
                        if (XEUtils.isBoolean(visible)) {
                            column.visible = visible;
                        }
                    }
                });
            }
        };
        /**
         * ?????????????????? Map
         * ??????????????????????????????????????????????????????????????????
         */
        var cacheColumnMap = function () {
            var tableFullColumn = internalData.tableFullColumn, collectColumn = internalData.collectColumn;
            var fullColumnIdData = internalData.fullColumnIdData = {};
            var fullColumnFieldData = internalData.fullColumnFieldData = {};
            var mouseOpts = computeMouseOpts.value;
            var isGroup = collectColumn.some(hasChildrenList);
            var isAllOverflow = !!props.showOverflow;
            var expandColumn;
            var treeNodeColumn;
            var checkboxColumn;
            var radioColumn;
            var hasFixed;
            var handleFunc = function (column, index, items, path, parent) {
                var colid = column.id, property = column.property, fixed = column.fixed, type = column.type, treeNode = column.treeNode;
                var rest = { column: column, colid: colid, index: index, items: items, parent: parent };
                if (property) {
                    if (process.env.NODE_ENV === 'development') {
                        if (fullColumnFieldData[property]) {
                            warnLog('vxe.error.colRepet', ['field', property]);
                        }
                    }
                    fullColumnFieldData[property] = rest;
                }
                if (!hasFixed && fixed) {
                    hasFixed = fixed;
                }
                if (treeNode) {
                    if (process.env.NODE_ENV === 'development') {
                        if (treeNodeColumn) {
                            warnLog('vxe.error.colRepet', ['tree-node', treeNode]);
                        }
                    }
                    if (!treeNodeColumn) {
                        treeNodeColumn = column;
                    }
                }
                else if (type === 'expand') {
                    if (process.env.NODE_ENV === 'development') {
                        if (expandColumn) {
                            warnLog('vxe.error.colRepet', ['type', type]);
                        }
                    }
                    if (!expandColumn) {
                        expandColumn = column;
                    }
                }
                if (process.env.NODE_ENV === 'development') {
                    if (type === 'checkbox') {
                        if (checkboxColumn) {
                            warnLog('vxe.error.colRepet', ['type', type]);
                        }
                        if (!checkboxColumn) {
                            checkboxColumn = column;
                        }
                    }
                    else if (type === 'radio') {
                        if (radioColumn) {
                            warnLog('vxe.error.colRepet', ['type', type]);
                        }
                        if (!radioColumn) {
                            radioColumn = column;
                        }
                    }
                }
                if (isAllOverflow && column.showOverflow === false) {
                    isAllOverflow = false;
                }
                if (fullColumnIdData[colid]) {
                    errLog('vxe.error.colRepet', ['colId', colid]);
                }
                fullColumnIdData[colid] = rest;
            };
            if (isGroup) {
                XEUtils.eachTree(collectColumn, function (column, index, items, path, parent, nodes) {
                    column.level = nodes.length;
                    handleFunc(column, index, items, path, parent);
                });
            }
            else {
                tableFullColumn.forEach(handleFunc);
            }
            if (process.env.NODE_ENV === 'development') {
                if (expandColumn && mouseOpts.area) {
                    errLog('vxe.error.errConflicts', ['mouse-config.area', 'column.type=expand']);
                }
            }
            reactData.isGroup = isGroup;
            reactData.treeNodeColumn = treeNodeColumn;
            reactData.expandColumn = expandColumn;
            reactData.isAllOverflow = isAllOverflow;
        };
        var updateHeight = function () {
            internalData.customHeight = calcHeight('height');
            internalData.customMaxHeight = calcHeight('maxHeight');
        };
        /**
         * ????????????
         * ?????? px???%????????? ????????????
         * ??????????????????????????????
         * ???????????????????????????
         * @param {Element} headerElem
         * @param {Element} bodyElem
         * @param {Element} footerElem
         * @param {Number} bodyWidth
         */
        var autoCellWidth = function (headerElem, bodyElem, footerElem) {
            var tableWidth = 0;
            var minCellWidth = 40; // ?????????????????? 40px
            var bodyWidth = bodyElem.clientWidth - 1;
            var remainWidth = bodyWidth;
            var meanWidth = remainWidth / 100;
            var fit = props.fit;
            var columnStore = reactData.columnStore;
            var resizeList = columnStore.resizeList, pxMinList = columnStore.pxMinList, pxList = columnStore.pxList, scaleList = columnStore.scaleList, scaleMinList = columnStore.scaleMinList, autoList = columnStore.autoList;
            // ?????????
            pxMinList.forEach(function (column) {
                var minWidth = parseInt(column.minWidth);
                tableWidth += minWidth;
                column.renderWidth = minWidth;
            });
            // ???????????????
            scaleMinList.forEach(function (column) {
                var scaleWidth = Math.floor(parseInt(column.minWidth) * meanWidth);
                tableWidth += scaleWidth;
                column.renderWidth = scaleWidth;
            });
            // ???????????????
            scaleList.forEach(function (column) {
                var scaleWidth = Math.floor(parseInt(column.width) * meanWidth);
                tableWidth += scaleWidth;
                column.renderWidth = scaleWidth;
            });
            // ?????????
            pxList.forEach(function (column) {
                var width = parseInt(column.width);
                tableWidth += width;
                column.renderWidth = width;
            });
            // ???????????????
            resizeList.forEach(function (column) {
                var width = parseInt(column.resizeWidth);
                tableWidth += width;
                column.renderWidth = width;
            });
            remainWidth -= tableWidth;
            meanWidth = remainWidth > 0 ? Math.floor(remainWidth / (scaleMinList.length + pxMinList.length + autoList.length)) : 0;
            if (fit) {
                if (remainWidth > 0) {
                    scaleMinList.concat(pxMinList).forEach(function (column) {
                        tableWidth += meanWidth;
                        column.renderWidth += meanWidth;
                    });
                }
            }
            else {
                meanWidth = minCellWidth;
            }
            // ?????????
            autoList.forEach(function (column) {
                var width = Math.max(meanWidth, minCellWidth);
                column.renderWidth = width;
                tableWidth += width;
            });
            if (fit) {
                /**
                 * ???????????????
                 * ?????????????????????????????????????????????????????????????????????
                 */
                var dynamicList = scaleList.concat(scaleMinList).concat(pxMinList).concat(autoList);
                var dynamicSize = dynamicList.length - 1;
                if (dynamicSize > 0) {
                    var odiffer = bodyWidth - tableWidth;
                    if (odiffer > 0) {
                        while (odiffer > 0 && dynamicSize >= 0) {
                            odiffer--;
                            dynamicList[dynamicSize--].renderWidth++;
                        }
                        tableWidth = bodyWidth;
                    }
                }
            }
            var tableHeight = bodyElem.offsetHeight;
            var overflowY = bodyElem.scrollHeight > bodyElem.clientHeight;
            var scrollbarWidth = 0;
            if (overflowY) {
                scrollbarWidth = Math.max(bodyElem.offsetWidth - bodyElem.clientWidth, 0);
            }
            reactData.scrollbarWidth = scrollbarWidth;
            reactData.overflowY = overflowY;
            internalData.tableWidth = tableWidth;
            internalData.tableHeight = tableHeight;
            var headerHeight = 0;
            if (headerElem) {
                headerHeight = headerElem.clientHeight;
                nextTick(function () {
                    // ????????????????????????
                    if (headerElem && bodyElem && headerElem.scrollLeft !== bodyElem.scrollLeft) {
                        headerElem.scrollLeft = bodyElem.scrollLeft;
                    }
                });
            }
            internalData.headerHeight = headerHeight;
            var overflowX = false;
            var footerHeight = 0;
            var scrollbarHeight = 0;
            if (footerElem) {
                footerHeight = footerElem.offsetHeight;
                overflowX = tableWidth > footerElem.clientWidth;
                if (overflowX) {
                    scrollbarHeight = Math.max(footerHeight - footerElem.clientHeight, 0);
                }
            }
            else {
                overflowX = tableWidth > bodyWidth;
                if (overflowX) {
                    scrollbarHeight = Math.max(tableHeight - bodyElem.clientHeight, 0);
                }
            }
            internalData.footerHeight = footerHeight;
            reactData.overflowX = overflowX;
            reactData.scrollbarHeight = scrollbarHeight;
            updateHeight();
            reactData.parentHeight = Math.max(internalData.headerHeight + footerHeight + 20, tablePrivateMethods.getParentHeight());
            if (overflowX) {
                tablePrivateMethods.checkScrolling();
            }
        };
        var getOrderField = function (column) {
            var sortBy = column.sortBy, sortType = column.sortType;
            return function (row) {
                var cellValue;
                if (sortBy) {
                    cellValue = XEUtils.isFunction(sortBy) ? sortBy({ row: row, column: column }) : XEUtils.get(row, sortBy);
                }
                else {
                    cellValue = tablePrivateMethods.getCellLabel(row, column);
                }
                if (!sortType || sortType === 'auto') {
                    return isNaN(cellValue) ? cellValue : XEUtils.toNumber(cellValue);
                }
                else if (sortType === 'number') {
                    return XEUtils.toNumber(cellValue);
                }
                else if (sortType === 'string') {
                    return XEUtils.toValueString(cellValue);
                }
                return cellValue;
            };
        };
        var updateAfterDataIndex = function () {
            var afterFullData = internalData.afterFullData, fullDataRowIdData = internalData.fullDataRowIdData;
            afterFullData.forEach(function (row, _index) {
                var rowid = getRowid($xetable, row);
                var rest = fullDataRowIdData[rowid];
                if (rest) {
                    rest._index = _index;
                }
                else {
                    fullDataRowIdData[rowid] = { row: row, rowid: rowid, index: -1, $index: -1, _index: _index, items: [], parent: null };
                }
            });
        };
        /**
         * ????????????????????????????????????
         * ???????????????????????????????????????
         */
        var updateAfterFullData = function () {
            var tableFullColumn = internalData.tableFullColumn, tableFullData = internalData.tableFullData;
            var filterOpts = computeFilterOpts.value;
            var sortOpts = computeSortOpts.value;
            var allRemoteFilter = filterOpts.remote, allFilterMethod = filterOpts.filterMethod;
            var allRemoteSort = sortOpts.remote, allSortMethod = sortOpts.sortMethod;
            var tableData = tableFullData.slice(0);
            if (!allRemoteFilter || !allRemoteSort) {
                var filterColumns_1 = [];
                var orderColumns_1 = [];
                tableFullColumn.forEach(function (column) {
                    var sortable = column.sortable, order = column.order, filters = column.filters;
                    if (!allRemoteFilter && filters && filters.length) {
                        var valueList_1 = [];
                        var itemList_1 = [];
                        filters.forEach(function (item) {
                            if (item.checked) {
                                itemList_1.push(item);
                                valueList_1.push(item.value);
                            }
                        });
                        if (itemList_1.length) {
                            filterColumns_1.push({ column: column, valueList: valueList_1, itemList: itemList_1 });
                        }
                    }
                    if (!allRemoteSort && sortable && order) {
                        orderColumns_1.push({ column: column, property: column.property, order: order });
                    }
                });
                // ????????????
                // ????????????????????????????????????
                if (!allRemoteFilter && filterColumns_1.length) {
                    tableData = tableData.filter(function (row) {
                        return filterColumns_1.every(function (_a) {
                            var column = _a.column, valueList = _a.valueList, itemList = _a.itemList;
                            var filterMethod = column.filterMethod, filterRender = column.filterRender;
                            var compConf = filterRender ? VXETable.renderer.get(filterRender.name) : null;
                            var compFilterMethod = compConf ? compConf.filterMethod : null;
                            var defaultFilterMethod = compConf ? compConf.defaultFilterMethod : null;
                            var cellValue = getCellValue(row, column);
                            if (filterMethod) {
                                return itemList.some(function (item) { return filterMethod({ value: item.value, option: item, cellValue: cellValue, row: row, column: column, $table: $xetable }); });
                            }
                            else if (compFilterMethod) {
                                return itemList.some(function (item) { return compFilterMethod({ value: item.value, option: item, cellValue: cellValue, row: row, column: column, $table: $xetable }); });
                            }
                            else if (allFilterMethod) {
                                return allFilterMethod({ options: itemList, values: valueList, cellValue: cellValue, row: row, column: column });
                            }
                            else if (defaultFilterMethod) {
                                return itemList.some(function (item) { return defaultFilterMethod({ value: item.value, option: item, cellValue: cellValue, row: row, column: column, $table: $xetable }); });
                            }
                            return valueList.indexOf(XEUtils.get(row, column.property)) > -1;
                        });
                    });
                }
                // ????????????
                // ????????????????????????????????????
                if (!allRemoteSort && orderColumns_1.length) {
                    if (allSortMethod) {
                        var sortRests = allSortMethod({ data: tableData, sortList: orderColumns_1, $table: $xetable });
                        tableData = XEUtils.isArray(sortRests) ? sortRests : tableData;
                    }
                    else {
                        tableData = XEUtils.orderBy(tableData, orderColumns_1.map(function (_a) {
                            var column = _a.column, order = _a.order;
                            return [getOrderField(column), order];
                        }));
                    }
                }
            }
            internalData.afterFullData = tableData;
            updateAfterDataIndex();
            return tableData;
        };
        var updateStyle = function () {
            var border = props.border, showFooter = props.showFooter, allColumnOverflow = props.showOverflow, allColumnHeaderOverflow = props.showHeaderOverflow, allColumnFooterOverflow = props.showFooterOverflow, mouseConfig = props.mouseConfig, spanMethod = props.spanMethod, footerSpanMethod = props.footerSpanMethod, keyboardConfig = props.keyboardConfig;
            var isGroup = reactData.isGroup, currentRow = reactData.currentRow, tableColumn = reactData.tableColumn, scrollXLoad = reactData.scrollXLoad, scrollYLoad = reactData.scrollYLoad, scrollbarWidth = reactData.scrollbarWidth, scrollbarHeight = reactData.scrollbarHeight, columnStore = reactData.columnStore, editStore = reactData.editStore, mergeList = reactData.mergeList, mergeFooterList = reactData.mergeFooterList, isAllOverflow = reactData.isAllOverflow;
            var visibleColumn = internalData.visibleColumn, fullColumnIdData = internalData.fullColumnIdData, tableHeight = internalData.tableHeight, tableWidth = internalData.tableWidth, headerHeight = internalData.headerHeight, footerHeight = internalData.footerHeight, elemStore = internalData.elemStore, customHeight = internalData.customHeight, customMaxHeight = internalData.customMaxHeight;
            var containerList = ['main', 'left', 'right'];
            var emptyPlaceholderElem = refEmptyPlaceholder.value;
            var cellOffsetWidth = computeCellOffsetWidth.value;
            var mouseOpts = computeMouseOpts.value;
            var keyboardOpts = computeKeyboardOpts.value;
            var bodyWrapperElem = elemStore['main-body-wrapper'];
            if (emptyPlaceholderElem) {
                emptyPlaceholderElem.style.top = headerHeight + "px";
                emptyPlaceholderElem.style.height = bodyWrapperElem ? bodyWrapperElem.offsetHeight - scrollbarHeight + "px" : '';
            }
            if (customHeight > 0) {
                if (showFooter) {
                    customHeight += scrollbarHeight;
                }
            }
            containerList.forEach(function (name, index) {
                var fixedType = index > 0 ? name : '';
                var layoutList = ['header', 'body', 'footer'];
                var isFixedLeft = fixedType === 'left';
                var fixedColumn = [];
                var fixedWrapperElem;
                if (fixedType) {
                    fixedColumn = isFixedLeft ? columnStore.leftList : columnStore.rightList;
                    fixedWrapperElem = isFixedLeft ? refLeftContainer.value : refRightContainer.value;
                }
                layoutList.forEach(function (layout) {
                    var wrapperElem = elemStore[name + "-" + layout + "-wrapper"];
                    var tableElem = elemStore[name + "-" + layout + "-table"];
                    if (layout === 'header') {
                        // ?????????????????????
                        // ??????????????????
                        var tWidth = tableWidth;
                        // ???????????????????????????
                        var isOptimize = false;
                        if (!isGroup) {
                            if (fixedType) {
                                if (scrollXLoad || allColumnHeaderOverflow) {
                                    isOptimize = true;
                                }
                            }
                        }
                        if (isOptimize) {
                            tableColumn = fixedColumn;
                        }
                        if (isOptimize || scrollXLoad) {
                            tWidth = tableColumn.reduce(function (previous, column) { return previous + column.renderWidth; }, 0);
                        }
                        if (tableElem) {
                            tableElem.style.width = tWidth ? tWidth + scrollbarWidth + "px" : '';
                            // ?????? IE ??????????????????????????????
                            if (browse.msie) {
                                XEUtils.arrayEach(tableElem.querySelectorAll('.vxe-resizable'), function (resizeElem) {
                                    resizeElem.style.height = resizeElem.parentNode.offsetHeight + "px";
                                });
                            }
                        }
                        var repairElem = elemStore[name + "-" + layout + "-repair"];
                        if (repairElem) {
                            repairElem.style.width = tableWidth + "px";
                        }
                        var listElem = elemStore[name + "-" + layout + "-list"];
                        if (isGroup && listElem) {
                            XEUtils.arrayEach(listElem.querySelectorAll('.col--group'), function (thElem) {
                                var colNode = tableMethods.getColumnNode(thElem);
                                if (colNode) {
                                    var column_1 = colNode.item;
                                    var showHeaderOverflow = column_1.showHeaderOverflow;
                                    var cellOverflow = XEUtils.isBoolean(showHeaderOverflow) ? showHeaderOverflow : allColumnHeaderOverflow;
                                    var showEllipsis = cellOverflow === 'ellipsis';
                                    var showTitle = cellOverflow === 'title';
                                    var showTooltip = cellOverflow === true || cellOverflow === 'tooltip';
                                    var hasEllipsis = showTitle || showTooltip || showEllipsis;
                                    var childWidth_1 = 0;
                                    var countChild_1 = 0;
                                    if (hasEllipsis) {
                                        XEUtils.eachTree(column_1.children, function (item) {
                                            if (!item.children || !column_1.children.length) {
                                                countChild_1++;
                                            }
                                            childWidth_1 += item.renderWidth;
                                        });
                                    }
                                    thElem.style.width = hasEllipsis ? childWidth_1 - countChild_1 - (border ? 2 : 0) + "px" : '';
                                }
                            });
                        }
                    }
                    else if (layout === 'body') {
                        var emptyBlockElem = elemStore[name + "-" + layout + "-emptyBlock"];
                        if (wrapperElem) {
                            if (customMaxHeight) {
                                wrapperElem.style.maxHeight = (fixedType ? customMaxHeight - headerHeight - (showFooter ? 0 : scrollbarHeight) : customMaxHeight - headerHeight) + "px";
                            }
                            else {
                                if (customHeight > 0) {
                                    wrapperElem.style.height = (fixedType ? (customHeight > 0 ? customHeight - headerHeight - footerHeight : tableHeight) - (showFooter ? 0 : scrollbarHeight) : customHeight - headerHeight - footerHeight) + "px";
                                }
                                else {
                                    wrapperElem.style.height = '';
                                }
                            }
                        }
                        // ??????????????????
                        if (fixedWrapperElem) {
                            if (wrapperElem) {
                                wrapperElem.style.top = headerHeight + "px";
                            }
                            fixedWrapperElem.style.height = (customHeight > 0 ? customHeight - headerHeight - footerHeight : tableHeight) + headerHeight + footerHeight - scrollbarHeight * (showFooter ? 2 : 1) + "px";
                            fixedWrapperElem.style.width = fixedColumn.reduce(function (previous, column) { return previous + column.renderWidth; }, isFixedLeft ? 0 : scrollbarWidth) + "px";
                        }
                        var tWidth = tableWidth;
                        // ???????????????????????????
                        if (fixedType) {
                            if (scrollXLoad || scrollYLoad || (allColumnOverflow ? isAllOverflow : allColumnOverflow)) {
                                if (!mergeList.length && !spanMethod && !(keyboardConfig && keyboardOpts.isMerge)) {
                                    tableColumn = fixedColumn;
                                }
                                else {
                                    tableColumn = visibleColumn;
                                    // ??????????????????????????????????????????????????????????????????
                                    // if (mergeList.length && !isMergeLeftFixedExceeded && fixedType === 'left') {
                                    //   tableColumn = fixedColumn
                                    // } else if (mergeList.length && !isMergeRightFixedExceeded && fixedType === 'right') {
                                    //   tableColumn = fixedColumn
                                    // } else {
                                    //   tableColumn = visibleColumn
                                    // }
                                }
                            }
                            else {
                                tableColumn = visibleColumn;
                            }
                        }
                        tWidth = tableColumn.reduce(function (previous, column) { return previous + column.renderWidth; }, 0);
                        if (tableElem) {
                            tableElem.style.width = tWidth ? tWidth + "px" : '';
                            // ???????????????
                            tableElem.style.paddingRight = scrollbarWidth && fixedType && (browse['-moz'] || browse.safari) ? scrollbarWidth + "px" : '';
                        }
                        if (emptyBlockElem) {
                            emptyBlockElem.style.width = tWidth ? tWidth + "px" : '';
                        }
                    }
                    else if (layout === 'footer') {
                        var tWidth = tableWidth;
                        // ???????????????????????????
                        if (fixedType) {
                            if (scrollXLoad || allColumnFooterOverflow) {
                                if (!mergeFooterList.length || !footerSpanMethod) {
                                    tableColumn = fixedColumn;
                                }
                                else {
                                    tableColumn = visibleColumn;
                                    // ??????????????????????????????????????????????????????????????????
                                    // if (mergeFooterList.length && !isMergeFooterLeftFixedExceeded && fixedType === 'left') {
                                    //   tableColumn = fixedColumn
                                    // } else if (mergeFooterList.length && !isMergeFooterRightFixedExceeded && fixedType === 'right') {
                                    //   tableColumn = fixedColumn
                                    // } else {
                                    //   tableColumn = visibleColumn
                                    // }
                                }
                            }
                            else {
                                tableColumn = visibleColumn;
                            }
                        }
                        tWidth = tableColumn.reduce(function (previous, column) { return previous + column.renderWidth; }, 0);
                        if (wrapperElem) {
                            // ??????????????????
                            if (fixedWrapperElem) {
                                wrapperElem.style.top = (customHeight > 0 ? customHeight - footerHeight : tableHeight + headerHeight) + "px";
                            }
                            wrapperElem.style.marginTop = -Math.max(1, scrollbarHeight) + "px";
                        }
                        if (tableElem) {
                            tableElem.style.width = tWidth ? tWidth + scrollbarWidth + "px" : '';
                        }
                    }
                    var colgroupElem = elemStore[name + "-" + layout + "-colgroup"];
                    if (colgroupElem) {
                        XEUtils.arrayEach(colgroupElem.children, function (colElem) {
                            var colid = colElem.getAttribute('name');
                            if (colid === 'col_gutter') {
                                colElem.style.width = scrollbarWidth + "px";
                            }
                            if (fullColumnIdData[colid]) {
                                var column_2 = fullColumnIdData[colid].column;
                                var showHeaderOverflow = column_2.showHeaderOverflow, showFooterOverflow = column_2.showFooterOverflow, showOverflow = column_2.showOverflow;
                                var cellOverflow = void 0;
                                colElem.style.width = column_2.renderWidth + "px";
                                if (layout === 'header') {
                                    cellOverflow = XEUtils.isUndefined(showHeaderOverflow) || XEUtils.isNull(showHeaderOverflow) ? allColumnHeaderOverflow : showHeaderOverflow;
                                }
                                else if (layout === 'footer') {
                                    cellOverflow = XEUtils.isUndefined(showFooterOverflow) || XEUtils.isNull(showFooterOverflow) ? allColumnFooterOverflow : showFooterOverflow;
                                }
                                else {
                                    cellOverflow = XEUtils.isUndefined(showOverflow) || XEUtils.isNull(showOverflow) ? allColumnOverflow : showOverflow;
                                }
                                var showEllipsis = cellOverflow === 'ellipsis';
                                var showTitle = cellOverflow === 'title';
                                var showTooltip = cellOverflow === true || cellOverflow === 'tooltip';
                                var hasEllipsis_1 = showTitle || showTooltip || showEllipsis;
                                var listElem = elemStore[name + "-" + layout + "-list"];
                                // ????????????????????????????????????
                                if (layout === 'header' || layout === 'footer') {
                                    if (scrollXLoad && !hasEllipsis_1) {
                                        hasEllipsis_1 = true;
                                    }
                                }
                                else {
                                    if ((scrollXLoad || scrollYLoad) && !hasEllipsis_1) {
                                        hasEllipsis_1 = true;
                                    }
                                }
                                if (listElem) {
                                    XEUtils.arrayEach(listElem.querySelectorAll("." + column_2.id), function (elem) {
                                        var colspan = parseInt(elem.getAttribute('colspan') || 1);
                                        var cellElem = elem.querySelector('.vxe-cell');
                                        var colWidth = column_2.renderWidth;
                                        if (cellElem) {
                                            if (colspan > 1) {
                                                var columnIndex = tableMethods.getColumnIndex(column_2);
                                                for (var index_1 = 1; index_1 < colspan; index_1++) {
                                                    var nextColumn = tableMethods.getColumns(columnIndex + index_1);
                                                    if (nextColumn) {
                                                        colWidth += nextColumn.renderWidth;
                                                    }
                                                }
                                            }
                                            cellElem.style.width = hasEllipsis_1 ? colWidth - (cellOffsetWidth * colspan) + "px" : '';
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            });
            if (currentRow) {
                tableMethods.setCurrentRow(currentRow);
            }
            if (mouseConfig && mouseOpts.selected && editStore.selected.row && editStore.selected.column) {
                $xetable.addCellSelectedClass();
            }
            return nextTick();
        };
        var checkValidate = function (type) {
            if ($xetable.triggerValidate) {
                return $xetable.triggerValidate(type);
            }
            return nextTick();
        };
        /**
         * ???????????????????????????
         * ??????????????????????????????
         */
        var handleChangeCell = function (evnt, params) {
            checkValidate('blur')
                .catch(function (e) { return e; })
                .then(function () {
                $xetable.handleActived(params, evnt)
                    .then(function () { return checkValidate('change'); })
                    .catch(function (e) { return e; });
            });
        };
        var handleDefaultSort = function () {
            var sortConfig = props.sortConfig;
            if (sortConfig) {
                var sortOpts = computeSortOpts.value;
                var defaultSort = sortOpts.defaultSort;
                if (defaultSort) {
                    if (!XEUtils.isArray(defaultSort)) {
                        defaultSort = [defaultSort];
                    }
                    if (defaultSort.length) {
                        (sortConfig.multiple ? defaultSort : defaultSort.slice(0, 1)).forEach(function (item) {
                            var field = item.field, order = item.order;
                            if (field && order) {
                                var column = tableMethods.getColumnByField(field);
                                if (column && column.sortable) {
                                    column.order = order;
                                }
                            }
                        });
                        if (!sortOpts.remote) {
                            tablePrivateMethods.handleTableData(true).then(updateStyle);
                        }
                    }
                }
            }
        };
        /**
         * ??????????????????
         */
        var handleDefaultSelectionChecked = function () {
            var checkboxConfig = props.checkboxConfig;
            if (checkboxConfig) {
                var fullDataRowIdData_1 = internalData.fullDataRowIdData;
                var checkboxOpts = computeCheckboxOpts.value;
                var checkAll = checkboxOpts.checkAll, checkRowKeys = checkboxOpts.checkRowKeys;
                if (checkAll) {
                    tableMethods.setAllCheckboxRow(true);
                }
                else if (checkRowKeys) {
                    var defSelection_1 = [];
                    checkRowKeys.forEach(function (rowid) {
                        if (fullDataRowIdData_1[rowid]) {
                            defSelection_1.push(fullDataRowIdData_1[rowid].row);
                        }
                    });
                    tableMethods.setCheckboxRow(defSelection_1, true);
                }
            }
        };
        /**
         * ???????????????????????????
         */
        var handleDefaultRadioChecked = function () {
            var _a;
            var radioConfig = props.radioConfig;
            if (radioConfig) {
                var fullDataRowIdData = internalData.fullDataRowIdData;
                var radioOpts = computeRadioOpts.value;
                var rowid = radioOpts.checkRowKey, reserve = radioOpts.reserve;
                if (rowid) {
                    if (fullDataRowIdData[rowid]) {
                        tableMethods.setRadioRow(fullDataRowIdData[rowid].row);
                    }
                    if (reserve) {
                        var rowkey = getRowkey($xetable);
                        internalData.radioReserveRow = (_a = {}, _a[rowkey] = rowid, _a);
                    }
                }
            }
        };
        /**
         * ?????????????????????
         */
        var handleDefaultRowExpand = function () {
            var expandConfig = props.expandConfig;
            if (expandConfig) {
                var fullDataRowIdData_2 = internalData.fullDataRowIdData;
                var expandOpts = computeExpandOpts.value;
                var expandAll = expandOpts.expandAll, expandRowKeys = expandOpts.expandRowKeys;
                if (expandAll) {
                    tableMethods.setAllRowExpand(true);
                }
                else if (expandRowKeys) {
                    var defExpandeds_1 = [];
                    expandRowKeys.forEach(function (rowid) {
                        if (fullDataRowIdData_2[rowid]) {
                            defExpandeds_1.push(fullDataRowIdData_2[rowid].row);
                        }
                    });
                    tableMethods.setRowExpand(defExpandeds_1, true);
                }
            }
        };
        var handleRadioReserveRow = function (row) {
            var radioOpts = computeRadioOpts.value;
            if (radioOpts.reserve) {
                internalData.radioReserveRow = row;
            }
        };
        var handleCheckboxReserveRow = function (row, checked) {
            var checkboxReserveRowMap = internalData.checkboxReserveRowMap;
            var checkboxOpts = computeCheckboxOpts.value;
            if (checkboxOpts.reserve) {
                var rowid = getRowid($xetable, row);
                if (checked) {
                    checkboxReserveRowMap[rowid] = row;
                }
                else if (checkboxReserveRowMap[rowid]) {
                    delete checkboxReserveRowMap[rowid];
                }
            }
        };
        // ????????????????????????????????????
        var handleReserveStatus = function () {
            var treeConfig = props.treeConfig;
            var expandColumn = reactData.expandColumn, currentRow = reactData.currentRow, selectRow = reactData.selectRow, selection = reactData.selection, rowExpandeds = reactData.rowExpandeds, treeExpandeds = reactData.treeExpandeds;
            var fullDataRowIdData = internalData.fullDataRowIdData, fullAllDataRowIdData = internalData.fullAllDataRowIdData, radioReserveRow = internalData.radioReserveRow;
            var expandOpts = computeExpandOpts.value;
            var treeOpts = computeTreeOpts.value;
            var radioOpts = computeRadioOpts.value;
            var checkboxOpts = computeCheckboxOpts.value;
            // ?????????
            if (selectRow && !fullAllDataRowIdData[getRowid($xetable, selectRow)]) {
                reactData.selectRow = null; // ?????????????????????
            }
            // ????????????????????????
            if (radioOpts.reserve && radioReserveRow) {
                var rowid = getRowid($xetable, radioReserveRow);
                if (fullDataRowIdData[rowid]) {
                    tableMethods.setRadioRow(fullDataRowIdData[rowid].row);
                }
            }
            // ?????????
            reactData.selection = getRecoverRow(selection); // ?????????????????????
            // ????????????????????????
            if (checkboxOpts.reserve) {
                tableMethods.setCheckboxRow(handleReserveRow(internalData.checkboxReserveRowMap), true);
            }
            if (currentRow && !fullAllDataRowIdData[getRowid($xetable, currentRow)]) {
                reactData.currentRow = null; // ?????????????????????
            }
            // ?????????
            reactData.rowExpandeds = expandColumn ? getRecoverRow(rowExpandeds) : []; // ?????????????????????
            // ??????????????????
            if (expandColumn && expandOpts.reserve) {
                tableMethods.setRowExpand(handleReserveRow(internalData.rowExpandedReserveRowMap), true);
            }
            // ?????????
            reactData.treeExpandeds = treeConfig ? getRecoverRow(treeExpandeds) : []; // ?????????????????????
            if (treeConfig && treeOpts.reserve) {
                tableMethods.setTreeExpand(handleReserveRow(internalData.treeExpandedReserveRowMap), true);
            }
        };
        /**
         * ???????????????????????????
         */
        var handleDefaultTreeExpand = function () {
            var treeConfig = props.treeConfig;
            if (treeConfig) {
                var tableFullData_1 = internalData.tableFullData;
                var treeOpts_1 = computeTreeOpts.value;
                var expandAll = treeOpts_1.expandAll, expandRowKeys = treeOpts_1.expandRowKeys;
                if (expandAll) {
                    tableMethods.setAllTreeExpand(true);
                }
                else if (expandRowKeys) {
                    var defExpandeds_2 = [];
                    var rowkey_1 = getRowkey($xetable);
                    expandRowKeys.forEach(function (rowid) {
                        var matchObj = XEUtils.findTree(tableFullData_1, function (item) { return rowid === XEUtils.get(item, rowkey_1); }, treeOpts_1);
                        if (matchObj) {
                            defExpandeds_2.push(matchObj.item);
                        }
                    });
                    tableMethods.setTreeExpand(defExpandeds_2, true);
                }
            }
        };
        var handleAsyncTreeExpandChilds = function (row) {
            var treeExpandeds = reactData.treeExpandeds, treeLazyLoadeds = reactData.treeLazyLoadeds;
            var fullAllDataRowIdData = internalData.fullAllDataRowIdData;
            var treeOpts = computeTreeOpts.value;
            var checkboxOpts = computeCheckboxOpts.value;
            var loadMethod = treeOpts.loadMethod;
            var checkStrictly = checkboxOpts.checkStrictly;
            var rest = fullAllDataRowIdData[getRowid($xetable, row)];
            return new Promise(function (resolve) {
                if (loadMethod) {
                    treeLazyLoadeds.push(row);
                    loadMethod({ $table: $xetable, row: row }).catch(function () { return []; }).then(function (childRecords) {
                        rest.treeLoaded = true;
                        XEUtils.remove(treeLazyLoadeds, function (item) { return $xetable.eqRow(item, row); });
                        if (!XEUtils.isArray(childRecords)) {
                            childRecords = [];
                        }
                        if (childRecords) {
                            tableMethods.loadChildren(row, childRecords).then(function (childRows) {
                                if (childRows.length && $xetable.findRowIndexOf(treeExpandeds, row) === -1) {
                                    treeExpandeds.push(row);
                                }
                                // ???????????????????????????????????????????????????????????????
                                if (!checkStrictly && tableMethods.isCheckedByCheckboxRow(row)) {
                                    tableMethods.setCheckboxRow(childRows, true);
                                }
                            });
                        }
                        resolve(nextTick().then(function () { return tableMethods.recalculate(); }));
                    });
                }
                else {
                    resolve();
                }
            });
        };
        var handleTreeExpandReserve = function (row, expanded) {
            var treeExpandedReserveRowMap = internalData.treeExpandedReserveRowMap;
            var treeOpts = computeTreeOpts.value;
            if (treeOpts.reserve) {
                var rowid = getRowid($xetable, row);
                if (expanded) {
                    treeExpandedReserveRowMap[rowid] = row;
                }
                else if (treeExpandedReserveRowMap[rowid]) {
                    delete treeExpandedReserveRowMap[rowid];
                }
            }
        };
        var handleAsyncRowExpand = function (row) {
            var rowExpandeds = reactData.rowExpandeds, expandLazyLoadeds = reactData.expandLazyLoadeds;
            var fullAllDataRowIdData = internalData.fullAllDataRowIdData;
            var rest = fullAllDataRowIdData[getRowid($xetable, row)];
            return new Promise(function (resolve) {
                var expandOpts = computeExpandOpts.value;
                var loadMethod = expandOpts.loadMethod;
                if (loadMethod) {
                    expandLazyLoadeds.push(row);
                    loadMethod({ $table: $xetable, row: row, rowIndex: tableMethods.getRowIndex(row), $rowIndex: tableMethods.getVMRowIndex(row) }).catch(function (e) { return e; }).then(function () {
                        rest.expandLoaded = true;
                        XEUtils.remove(expandLazyLoadeds, function (item) { return $xetable.eqRow(item, row); });
                        rowExpandeds.push(row);
                        resolve(nextTick().then(function () { return tableMethods.recalculate(); }));
                    });
                }
                else {
                    resolve();
                }
            });
        };
        var handleRowExpandReserve = function (row, expanded) {
            var rowExpandedReserveRowMap = internalData.rowExpandedReserveRowMap;
            var expandOpts = computeExpandOpts.value;
            if (expandOpts.reserve) {
                var rowid = getRowid($xetable, row);
                if (expanded) {
                    rowExpandedReserveRowMap[rowid] = row;
                }
                else if (rowExpandedReserveRowMap[rowid]) {
                    delete rowExpandedReserveRowMap[rowid];
                }
            }
        };
        var handleDefaultMergeCells = function () {
            var mergeCells = props.mergeCells;
            if (mergeCells) {
                tableMethods.setMergeCells(mergeCells);
            }
        };
        var handleDefaultMergeFooterItems = function () {
            var mergeFooterItems = props.mergeFooterItems;
            if (mergeFooterItems) {
                tableMethods.setMergeFooterItems(mergeFooterItems);
            }
        };
        // ??????????????????????????????
        var computeScrollLoad = function () {
            return nextTick().then(function () {
                var scrollXLoad = reactData.scrollXLoad, scrollYLoad = reactData.scrollYLoad;
                var scrollXStore = internalData.scrollXStore, scrollYStore = internalData.scrollYStore;
                var sYOpts = computeSYOpts.value;
                var sXOpts = computeSXOpts.value;
                // ?????? X ??????
                if (scrollXLoad) {
                    var visibleXSize = computeVirtualX().visibleSize;
                    var offsetXSize = sXOpts.oSize ? XEUtils.toNumber(sXOpts.oSize) : browse.msie ? 10 : (browse.edge ? 5 : 0);
                    scrollXStore.offsetSize = offsetXSize;
                    scrollXStore.visibleSize = visibleXSize;
                    scrollXStore.endIndex = Math.max(scrollXStore.startIndex + scrollXStore.visibleSize + offsetXSize, scrollXStore.endIndex);
                    tablePrivateMethods.updateScrollXData();
                }
                else {
                    tablePrivateMethods.updateScrollXSpace();
                }
                // ?????? Y ??????
                var _a = computeVirtualY(), rowHeight = _a.rowHeight, visibleYSize = _a.visibleSize;
                scrollYStore.rowHeight = rowHeight;
                if (scrollYLoad) {
                    var offsetYSize = sYOpts.oSize ? XEUtils.toNumber(sYOpts.oSize) : browse.msie ? 20 : (browse.edge ? 10 : 0);
                    scrollYStore.offsetSize = offsetYSize;
                    scrollYStore.visibleSize = visibleYSize;
                    scrollYStore.endIndex = Math.max(scrollYStore.startIndex + visibleYSize + offsetYSize, scrollYStore.endIndex);
                    tablePrivateMethods.updateScrollYData();
                }
                else {
                    tablePrivateMethods.updateScrollYSpace();
                }
                reactData.rowHeight = rowHeight;
                nextTick(updateStyle);
            });
        };
        /**
         * ??????????????????
         * @param {Array} datas ??????
         */
        var loadTableData = function (datas) {
            var keepSource = props.keepSource, treeConfig = props.treeConfig;
            var editStore = reactData.editStore, oldScrollYLoad = reactData.scrollYLoad;
            var scrollYStore = internalData.scrollYStore, scrollXStore = internalData.scrollXStore, lastScrollLeft = internalData.lastScrollLeft, lastScrollTop = internalData.lastScrollTop;
            var sYOpts = computeSYOpts.value;
            var tableFullData = datas ? datas.slice(0) : [];
            var scrollYLoad = !treeConfig && !!sYOpts.enabled && sYOpts.gt > -1 && sYOpts.gt < tableFullData.length;
            scrollYStore.startIndex = 0;
            scrollYStore.endIndex = 1;
            scrollXStore.startIndex = 0;
            scrollXStore.endIndex = 1;
            editStore.insertList = [];
            editStore.removeList = [];
            // ????????????
            internalData.tableFullData = tableFullData;
            // ????????????
            tablePrivateMethods.updateCache(true);
            // ????????????
            internalData.tableSynchData = datas;
            if (keepSource) {
                internalData.tableSourceData = XEUtils.clone(tableFullData, true);
            }
            reactData.scrollYLoad = scrollYLoad;
            if (process.env.NODE_ENV === 'development') {
                if (scrollYLoad) {
                    if (!(props.height || props.maxHeight)) {
                        errLog('vxe.error.reqProp', ['table.height | table.max-height | table.scroll-y={enabled: false}']);
                    }
                    if (!props.showOverflow) {
                        warnLog('vxe.error.reqProp', ['table.show-overflow']);
                    }
                    if (props.spanMethod) {
                        warnLog('vxe.error.scrollErrProp', ['table.span-method']);
                    }
                }
            }
            if ($xetable.clearCellAreas && props.mouseConfig) {
                $xetable.clearCellAreas();
                $xetable.clearCopyCellArea();
            }
            tableMethods.clearMergeCells();
            tableMethods.clearMergeFooterItems();
            tablePrivateMethods.handleTableData(true);
            tableMethods.updateFooter();
            return nextTick().then(function () {
                updateHeight();
                updateStyle();
            }).then(function () {
                computeScrollLoad();
            }).then(function () {
                // ?????????????????????
                if (scrollYLoad) {
                    scrollYStore.endIndex = scrollYStore.visibleSize;
                }
                handleReserveStatus();
                tablePrivateMethods.checkSelectionStatus();
                return new Promise(function (resolve) {
                    nextTick()
                        .then(function () { return tableMethods.recalculate(); })
                        .then(function () {
                        // ????????????????????????
                        if (oldScrollYLoad === scrollYLoad) {
                            restoreScrollLocation($xetable, lastScrollLeft, lastScrollTop).then(resolve);
                        }
                        else {
                            setTimeout(function () { return restoreScrollLocation($xetable, lastScrollLeft, lastScrollTop).then(resolve); });
                        }
                    });
                });
            });
        };
        /**
         * ??????????????????????????????
         * ????????????????????????????????????
         */
        var handleLoadDefaults = function () {
            handleDefaultSelectionChecked();
            handleDefaultRadioChecked();
            handleDefaultRowExpand();
            handleDefaultTreeExpand();
            handleDefaultMergeCells();
            handleDefaultMergeFooterItems();
            nextTick(function () { return setTimeout(function () { return tableMethods.recalculate(); }); });
        };
        /**
         * ??????????????????????????????
         * ??????????????????
         */
        var handleInitDefaults = function () {
            handleDefaultSort();
        };
        var handleTableColumn = function () {
            var scrollXLoad = reactData.scrollXLoad;
            var visibleColumn = internalData.visibleColumn, scrollXStore = internalData.scrollXStore, fullColumnIdData = internalData.fullColumnIdData;
            var tableColumn = scrollXLoad ? visibleColumn.slice(scrollXStore.startIndex, scrollXStore.endIndex) : visibleColumn.slice(0);
            tableColumn.forEach(function (column, $index) {
                var colid = column.id;
                var rest = fullColumnIdData[colid];
                if (rest) {
                    rest.$index = $index;
                }
            });
            reactData.tableColumn = tableColumn;
        };
        var loadScrollXData = function () {
            var mergeList = reactData.mergeList, mergeFooterList = reactData.mergeFooterList;
            var scrollXStore = internalData.scrollXStore;
            var startIndex = scrollXStore.startIndex, endIndex = scrollXStore.endIndex, offsetSize = scrollXStore.offsetSize;
            var _a = computeVirtualX(), toVisibleIndex = _a.toVisibleIndex, visibleSize = _a.visibleSize;
            var offsetItem = {
                startIndex: Math.max(0, toVisibleIndex - 1 - offsetSize),
                endIndex: toVisibleIndex + visibleSize + offsetSize
            };
            calculateMergerOffserIndex(mergeList.concat(mergeFooterList), offsetItem, 'col');
            var offsetStartIndex = offsetItem.startIndex, offsetEndIndex = offsetItem.endIndex;
            if (toVisibleIndex <= startIndex || toVisibleIndex >= endIndex - visibleSize - 1) {
                if (startIndex !== offsetStartIndex || endIndex !== offsetEndIndex) {
                    scrollXStore.startIndex = offsetStartIndex;
                    scrollXStore.endIndex = offsetEndIndex;
                    tablePrivateMethods.updateScrollXData();
                }
            }
            tableMethods.closeTooltip();
        };
        // ?????????????????????????????????
        var getColumnList = function (columns) {
            var result = [];
            columns.forEach(function (column) {
                result.push.apply(result, (column.children && column.children.length ? getColumnList(column.children) : [column]));
            });
            return result;
        };
        var parseColumns = function () {
            var leftList = [];
            var centerList = [];
            var rightList = [];
            var isGroup = reactData.isGroup, columnStore = reactData.columnStore;
            var sXOpts = computeSXOpts.value;
            var collectColumn = internalData.collectColumn, tableFullColumn = internalData.tableFullColumn, scrollXStore = internalData.scrollXStore, fullColumnIdData = internalData.fullColumnIdData;
            // ????????????????????????????????????????????????????????????????????????
            if (isGroup) {
                var leftGroupList_1 = [];
                var centerGroupList_1 = [];
                var rightGroupList_1 = [];
                XEUtils.eachTree(collectColumn, function (column, index, items, path, parent) {
                    var isColGroup = hasChildrenList(column);
                    // ??????????????????????????????????????????????????????????????????????????????
                    if (parent && parent.fixed) {
                        column.fixed = parent.fixed;
                    }
                    if (parent && column.fixed !== parent.fixed) {
                        errLog('vxe.error.groupFixed');
                    }
                    if (isColGroup) {
                        column.visible = !!XEUtils.findTree(column.children, function (subColumn) { return hasChildrenList(subColumn) ? false : subColumn.visible; });
                    }
                    else if (column.visible) {
                        if (column.fixed === 'left') {
                            leftList.push(column);
                        }
                        else if (column.fixed === 'right') {
                            rightList.push(column);
                        }
                        else {
                            centerList.push(column);
                        }
                    }
                });
                collectColumn.forEach(function (column) {
                    if (column.visible) {
                        if (column.fixed === 'left') {
                            leftGroupList_1.push(column);
                        }
                        else if (column.fixed === 'right') {
                            rightGroupList_1.push(column);
                        }
                        else {
                            centerGroupList_1.push(column);
                        }
                    }
                });
                reactData.tableGroupColumn = leftGroupList_1.concat(centerGroupList_1).concat(rightGroupList_1);
            }
            else {
                // ???????????????
                tableFullColumn.forEach(function (column) {
                    if (column.visible) {
                        if (column.fixed === 'left') {
                            leftList.push(column);
                        }
                        else if (column.fixed === 'right') {
                            rightList.push(column);
                        }
                        else {
                            centerList.push(column);
                        }
                    }
                });
            }
            var visibleColumn = leftList.concat(centerList).concat(rightList);
            var scrollXLoad = !!sXOpts.enabled && sXOpts.gt > -1 && sXOpts.gt < tableFullColumn.length;
            reactData.hasFixedColumn = leftList.length > 0 || rightList.length > 0;
            Object.assign(columnStore, { leftList: leftList, centerList: centerList, rightList: rightList });
            if (scrollXLoad && isGroup) {
                scrollXLoad = false;
                if (process.env.NODE_ENV === 'development') {
                    warnLog('vxe.error.scrollXNotGroup');
                }
            }
            if (scrollXLoad) {
                if (process.env.NODE_ENV === 'development') {
                    if (props.showHeader && !props.showHeaderOverflow) {
                        warnLog('vxe.error.reqProp', ['show-header-overflow']);
                    }
                    if (props.showFooter && !props.showFooterOverflow) {
                        warnLog('vxe.error.reqProp', ['show-footer-overflow']);
                    }
                    if (props.spanMethod) {
                        warnLog('vxe.error.scrollErrProp', ['span-method']);
                    }
                    if (props.footerSpanMethod) {
                        warnLog('vxe.error.scrollErrProp', ['footer-span-method']);
                    }
                }
                var visibleSize = computeVirtualX().visibleSize;
                scrollXStore.startIndex = 0;
                scrollXStore.endIndex = visibleSize;
                scrollXStore.visibleSize = visibleSize;
            }
            // ??????????????????/??????????????????????????????
            // ???????????????????????????????????????????????????
            if (visibleColumn.length !== internalData.visibleColumn.length || !internalData.visibleColumn.every(function (column, index) { return column === visibleColumn[index]; })) {
                tableMethods.clearMergeCells();
                tableMethods.clearMergeFooterItems();
            }
            reactData.scrollXLoad = scrollXLoad;
            visibleColumn.forEach(function (column, _index) {
                var colid = column.id;
                var rest = fullColumnIdData[colid];
                if (rest) {
                    rest._index = _index;
                }
            });
            internalData.visibleColumn = visibleColumn;
            handleTableColumn();
            return tableMethods.updateFooter().then(function () {
                return tableMethods.recalculate();
            }).then(function () {
                tablePrivateMethods.updateCellAreas();
                return tableMethods.recalculate();
            });
        };
        var handleColumn = function (collectColumn) {
            internalData.collectColumn = collectColumn;
            var tableFullColumn = getColumnList(collectColumn);
            internalData.tableFullColumn = tableFullColumn;
            cacheColumnMap();
            restoreCustomStorage();
            parseColumns().then(function () {
                if (reactData.scrollXLoad) {
                    loadScrollXData();
                }
            });
            tableMethods.clearMergeCells();
            tableMethods.clearMergeFooterItems();
            tablePrivateMethods.handleTableData(true);
            if (process.env.NODE_ENV === 'development') {
                if ((reactData.scrollXLoad || reactData.scrollYLoad) && reactData.expandColumn) {
                    warnLog('vxe.error.scrollErrProp', ['column.type=expand']);
                }
            }
            return nextTick().then(function () {
                if ($xetoolbar) {
                    $xetoolbar.syncUpdate({ collectColumn: collectColumn, $table: $xetable });
                }
                return tableMethods.recalculate();
            });
        };
        /**
         * ?????? Y ??????????????????
         */
        var loadScrollYData = function (evnt) {
            var mergeList = reactData.mergeList;
            var scrollYStore = internalData.scrollYStore;
            var startIndex = scrollYStore.startIndex, endIndex = scrollYStore.endIndex, visibleSize = scrollYStore.visibleSize, offsetSize = scrollYStore.offsetSize, rowHeight = scrollYStore.rowHeight;
            var scrollBodyElem = (evnt.currentTarget || evnt.target);
            var scrollTop = scrollBodyElem.scrollTop;
            var toVisibleIndex = Math.floor(scrollTop / rowHeight);
            var offsetItem = {
                startIndex: Math.max(0, toVisibleIndex - 1 - offsetSize),
                endIndex: toVisibleIndex + visibleSize + offsetSize
            };
            calculateMergerOffserIndex(mergeList, offsetItem, 'row');
            var offsetStartIndex = offsetItem.startIndex, offsetEndIndex = offsetItem.endIndex;
            if (toVisibleIndex <= startIndex || toVisibleIndex >= endIndex - visibleSize - 1) {
                if (startIndex !== offsetStartIndex || endIndex !== offsetEndIndex) {
                    scrollYStore.startIndex = offsetStartIndex;
                    scrollYStore.endIndex = offsetEndIndex;
                    tablePrivateMethods.updateScrollYData();
                }
            }
        };
        var debounceScrollY = XEUtils.debounce(function (evnt) {
            loadScrollYData(evnt);
        }, 20, { leading: false, trailing: true });
        var keyCtxTimeout;
        tableMethods = {
            dispatchEvent: function (type, params, evnt) {
                emit(type, Object.assign({ $table: $xetable, $event: evnt }, params));
            },
            /**
             * ?????????????????????????????????
             */
            clearAll: function () {
                return clearTableAllStatus($xetable);
            },
            /**
             * ?????? data ??????
             * ??????????????????????????????????????????????????????????????????????????????????????????????????????
             * ???????????????????????????????????????????????????????????????????????????????????????
             */
            syncData: function () {
                return nextTick().then(function () {
                    reactData.tableData = [];
                    emit('update:data', internalData.tableFullData);
                    return nextTick();
                });
            },
            /**
             * ??????????????????
             * ????????????????????????????????????...??????????????????????????????????????????????????????
             */
            updateData: function () {
                return tablePrivateMethods.handleTableData(true).then(tableMethods.updateFooter).then(function () { return tableMethods.recalculate(); });
            },
            /**
             * ?????????????????????????????????????????????
             * @param {Array} datas ??????
             */
            loadData: function (datas) {
                var inited = internalData.inited, initStatus = internalData.initStatus;
                return loadTableData(datas).then(function () {
                    internalData.inited = true;
                    internalData.initStatus = true;
                    if (!initStatus) {
                        handleLoadDefaults();
                    }
                    if (!inited) {
                        handleInitDefaults();
                    }
                    return tableMethods.recalculate();
                });
            },
            /**
             * ??????????????????????????????????????????
             * @param {Array} datas ??????
             */
            reloadData: function (datas) {
                var inited = internalData.inited;
                return tableMethods.clearAll()
                    .then(function () {
                    internalData.inited = true;
                    internalData.initStatus = true;
                    return loadTableData(datas);
                })
                    .then(function () {
                    handleLoadDefaults();
                    if (!inited) {
                        handleInitDefaults();
                    }
                    return tableMethods.recalculate();
                });
            },
            /**
             * ?????????????????????????????????????????????
             * ????????????????????????????????????????????????????????????
             * @param {Row} row ?????????
             * @param {Object} record ?????????
             * @param {String} field ?????????
             */
            reloadRow: function (row, record, field) {
                var keepSource = props.keepSource;
                var tableData = reactData.tableData;
                var tableSourceData = internalData.tableSourceData;
                if (keepSource) {
                    var rowIndex = tableMethods.getRowIndex(row);
                    var oRow = tableSourceData[rowIndex];
                    if (oRow && row) {
                        if (field) {
                            XEUtils.set(oRow, field, XEUtils.get(record || row, field));
                        }
                        else {
                            if (record) {
                                tableSourceData[rowIndex] = record;
                                XEUtils.clear(row, undefined);
                                Object.assign(row, tablePrivateMethods.defineField(Object.assign({}, record)));
                                tablePrivateMethods.updateCache(true);
                            }
                            else {
                                XEUtils.destructuring(oRow, XEUtils.clone(row, true));
                            }
                        }
                    }
                    reactData.tableData = tableData.slice(0);
                }
                else {
                    if (process.env.NODE_ENV === 'development') {
                        warnLog('vxe.error.reqProp', ['keep-source']);
                    }
                }
                return nextTick();
            },
            /**
             * ?????????????????????????????????????????????
             */
            loadChildren: function (row, childRecords) {
                return tableMethods.createData(childRecords).then(function (rows) {
                    var keepSource = props.keepSource;
                    var fullDataRowIdData = internalData.fullDataRowIdData, fullAllDataRowIdData = internalData.fullAllDataRowIdData;
                    var tableSourceData = internalData.tableSourceData;
                    var treeOpts = computeTreeOpts.value;
                    var children = treeOpts.children;
                    if (keepSource) {
                        var rowid_1 = getRowid($xetable, row);
                        var matchObj = XEUtils.findTree(tableSourceData, function (item) { return rowid_1 === getRowid($xetable, item); }, treeOpts);
                        if (matchObj) {
                            matchObj.item[children] = XEUtils.clone(rows, true);
                        }
                    }
                    XEUtils.eachTree(rows, function (childRow, index, items, path, parent) {
                        var rowid = getRowid($xetable, childRow);
                        var rest = { row: childRow, rowid: rowid, index: -1, _index: -1, $index: -1, items: items, parent: parent };
                        fullDataRowIdData[rowid] = rest;
                        fullAllDataRowIdData[rowid] = rest;
                    }, treeOpts);
                    row[children] = rows;
                    return rows;
                });
            },
            /**
             * ???????????????
             * ??????????????????????????????????????????????????????????????????
             * @param {ColumnInfo} columns ?????????
             */
            loadColumn: function (columns) {
                var collectColumn = XEUtils.mapTree(columns, function (column) { return reactive(Cell.createColumn($xetable, column)); });
                return handleColumn(collectColumn);
            },
            /**
             * ???????????????????????????????????????
             * ??????????????????????????????????????????????????????????????????
             * @param {ColumnInfo} columns ?????????
             */
            reloadColumn: function (columns) {
                return tableMethods.clearAll().then(function () {
                    return tableMethods.loadColumn(columns);
                });
            },
            /**
             * ?????? tr ????????????????????? row ??????
             * @param {Element} tr ??????
             */
            getRowNode: function (tr) {
                if (tr) {
                    var fullAllDataRowIdData = internalData.fullAllDataRowIdData;
                    var rowid = tr.getAttribute('rowid');
                    if (rowid) {
                        var rest = fullAllDataRowIdData[rowid];
                        if (rest) {
                            return { rowid: rest.rowid, item: rest.row, index: rest.index, items: rest.items, parent: rest.parent };
                        }
                    }
                }
                return null;
            },
            /**
             * ?????? th/td ????????????????????? column ??????
             * @param {Element} cell ??????
             */
            getColumnNode: function (cell) {
                if (cell) {
                    var fullColumnIdData = internalData.fullColumnIdData;
                    var colid = cell.getAttribute('colid');
                    if (colid) {
                        var rest = fullColumnIdData[colid];
                        if (rest) {
                            return { colid: rest.colid, item: rest.column, index: rest.index, items: rest.items, parent: rest.parent };
                        }
                    }
                }
                return null;
            },
            /**
             * ?????? row ??????????????? data ????????????
             * @param {Row} row ?????????
             */
            getRowIndex: function (row) {
                var fullDataRowIdData = internalData.fullDataRowIdData;
                if (row) {
                    var rowid = getRowid($xetable, row);
                    var rest = fullDataRowIdData[rowid];
                    if (rest) {
                        return rest.index;
                    }
                }
                return -1;
            },
            /**
             * ?????? row ???????????????????????????????????????
             * @param {Row} row ?????????
             */
            getVTRowIndex: function (row) {
                var fullDataRowIdData = internalData.fullDataRowIdData;
                if (row) {
                    var rowid = getRowid($xetable, row);
                    var rest = fullDataRowIdData[rowid];
                    if (rest) {
                        return rest._index;
                    }
                }
                return -1;
            },
            /**
             * ?????? row ??????????????????????????????
             * @param {Row} row ?????????
             */
            getVMRowIndex: function (row) {
                var fullDataRowIdData = internalData.fullDataRowIdData;
                if (row) {
                    var rowid = getRowid($xetable, row);
                    var rest = fullDataRowIdData[rowid];
                    if (rest) {
                        return rest.$index;
                    }
                }
                return -1;
            },
            /**
             * ?????? column ??????????????? columns ????????????
             * @param {ColumnInfo} column ?????????
             */
            getColumnIndex: function (column) {
                var fullColumnIdData = internalData.fullColumnIdData;
                if (column) {
                    var rest = fullColumnIdData[column.id];
                    if (rest) {
                        return rest.index;
                    }
                }
                return -1;
            },
            /**
             * ?????? column ??????????????????????????????????????????
             * @param {ColumnInfo} column ?????????
             */
            getVTColumnIndex: function (column) {
                var fullColumnIdData = internalData.fullColumnIdData;
                if (column) {
                    var rest = fullColumnIdData[column.id];
                    if (rest) {
                        return rest._index;
                    }
                }
                return -1;
            },
            /**
             * ?????? column ??????????????????????????????
             * @param {ColumnInfo} column ?????????
             */
            getVMColumnIndex: function (column) {
                var fullColumnIdData = internalData.fullColumnIdData;
                if (column) {
                    var rest = fullColumnIdData[column.id];
                    if (rest) {
                        return rest.$index;
                    }
                }
                return -1;
            },
            /**
             * ?????? data ??????
             * ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
             * @param {Array} records ?????????
             */
            createData: function (records) {
                var treeConfig = props.treeConfig;
                var treeOpts = computeTreeOpts.value;
                var handleRrecord = function (record) { return reactive(tablePrivateMethods.defineField(Object.assign({}, record))); };
                var rows = treeConfig ? XEUtils.mapTree(records, handleRrecord, treeOpts) : records.map(handleRrecord);
                return nextTick().then(function () { return rows; });
            },
            /**
             * ?????? Row|Rows ??????
             * ???????????????????????????????????????????????????????????????????????????
             * @param {Array/Object} records ?????????
             */
            createRow: function (records) {
                var isArr = XEUtils.isArray(records);
                if (!isArr) {
                    records = [records];
                }
                return nextTick().then(function () { return tableMethods.createData(records).then(function (rows) { return isArr ? rows : rows[0]; }); });
            },
            /**
             * ????????????
             * ????????????????????????????????????????????????
             * ????????? row ???????????????
             * ????????? rows ???????????????
             * ????????????????????? field ?????????????????????????????????
             */
            revertData: function (rows, field) {
                var keepSource = props.keepSource;
                var tableSourceData = internalData.tableSourceData, tableFullData = internalData.tableFullData;
                if (!keepSource) {
                    if (process.env.NODE_ENV === 'development') {
                        warnLog('vxe.error.reqProp', ['keep-source']);
                    }
                    return nextTick();
                }
                var targetRows = rows;
                if (rows) {
                    if (!XEUtils.isArray(rows)) {
                        targetRows = [rows];
                    }
                }
                else {
                    targetRows = XEUtils.toArray($xetable.getUpdateRecords());
                }
                if (targetRows.length) {
                    targetRows.forEach(function (row) {
                        if (!tableMethods.isInsertByRow(row)) {
                            var rowIndex = $xetable.findRowIndexOf(tableFullData, row);
                            var oRow = tableSourceData[rowIndex];
                            if (oRow && row) {
                                if (field) {
                                    XEUtils.set(row, field, XEUtils.clone(XEUtils.get(oRow, field), true));
                                }
                                else {
                                    XEUtils.destructuring(row, XEUtils.clone(oRow, true));
                                }
                            }
                        }
                    });
                }
                if (rows) {
                    return nextTick();
                }
                return tableMethods.reloadData(tableSourceData);
            },
            /**
             * ?????????????????????
             * ????????????????????????????????????????????????
             * ????????? row ?????????????????????
             * ????????? rows ?????????????????????
             * ????????????????????? field ??????????????????????????????
             * @param {Array/Row} rows ?????????
             * @param {String} field ?????????
             */
            clearData: function (rows, field) {
                var tableFullData = internalData.tableFullData, visibleColumn = internalData.visibleColumn;
                if (!arguments.length) {
                    rows = tableFullData;
                }
                else if (rows && !XEUtils.isArray(rows)) {
                    rows = [rows];
                }
                if (field) {
                    rows.forEach(function (row) { return XEUtils.set(row, field, null); });
                }
                else {
                    rows.forEach(function (row) {
                        visibleColumn.forEach(function (column) {
                            if (column.property) {
                                setCellValue(row, column, null);
                            }
                        });
                    });
                }
                return nextTick();
            },
            /**
             * ??????????????????????????????
             * @param {Row} row ?????????
             */
            isInsertByRow: function (row) {
                var editStore = reactData.editStore;
                return $xetable.findRowIndexOf(editStore.insertList, row) > -1;
            },
            /**
             * ?????????????????????????????????
             * @returns
             */
            removeInsertRow: function () {
                var editStore = reactData.editStore;
                return $xetable.remove(editStore.insertList);
            },
            /**
             * ???????????????????????????????????????
             * @param {Row} row ?????????
             * @param {String} field ?????????
             */
            isUpdateByRow: function (row, field) {
                var _a, _b;
                var keepSource = props.keepSource, treeConfig = props.treeConfig;
                var visibleColumn = internalData.visibleColumn, tableSourceData = internalData.tableSourceData, fullDataRowIdData = internalData.fullDataRowIdData;
                var treeOpts = computeTreeOpts.value;
                if (keepSource) {
                    var oRow = void 0, property = void 0;
                    var rowid_2 = getRowid($xetable, row);
                    // ??????????????????????????????
                    if (!fullDataRowIdData[rowid_2]) {
                        return false;
                    }
                    if (treeConfig) {
                        var children = treeOpts.children;
                        var matchObj = XEUtils.findTree(tableSourceData, function (item) { return rowid_2 === getRowid($xetable, item); }, treeOpts);
                        row = Object.assign({}, row, (_a = {}, _a[children] = null, _a));
                        if (matchObj) {
                            oRow = Object.assign({}, matchObj.item, (_b = {}, _b[children] = null, _b));
                        }
                    }
                    else {
                        var oRowIndex = fullDataRowIdData[rowid_2].index;
                        oRow = tableSourceData[oRowIndex];
                    }
                    if (oRow) {
                        if (arguments.length > 1) {
                            return !eqCellValue(oRow, row, field);
                        }
                        for (var index = 0, len = visibleColumn.length; index < len; index++) {
                            property = visibleColumn[index].property;
                            if (property && !eqCellValue(oRow, row, property)) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            },
            /**
             * ?????????????????????????????????????????????????????????
             * @param {Number} columnIndex ??????
             */
            getColumns: function (columnIndex) {
                var columns = internalData.visibleColumn;
                return XEUtils.isUndefined(columnIndex) ? columns.slice(0) : columns[columnIndex];
            },
            /**
             * ?????????????????????????????????
             * @param {String} colid ?????????
             */
            getColumnById: function (colid) {
                var fullColumnIdData = internalData.fullColumnIdData;
                return fullColumnIdData[colid] ? fullColumnIdData[colid].column : null;
            },
            /**
             * ??????????????????????????????
             * @param {String} field ?????????
             */
            getColumnByField: function (field) {
                var fullColumnFieldData = internalData.fullColumnFieldData;
                return fullColumnFieldData[field] ? fullColumnFieldData[field].column : null;
            },
            /**
             * ????????????????????????
             * ????????????????????????????????????????????????????????????????????????????????????????????????????????????
             */
            getTableColumn: function () {
                return {
                    collectColumn: internalData.collectColumn.slice(0),
                    fullColumn: internalData.tableFullColumn.slice(0),
                    visibleColumn: internalData.visibleColumn.slice(0),
                    tableColumn: reactData.tableColumn.slice(0)
                };
            },
            /**
             * ?????????????????? data ???????????????????????????????????????????????????
             */
            getData: function (rowIndex) {
                var tableSynchData = props.data || internalData.tableSynchData;
                return XEUtils.isUndefined(rowIndex) ? tableSynchData.slice(0) : tableSynchData[rowIndex];
            },
            /**
             * ??????????????????????????????????????????
             */
            getCheckboxRecords: function (isFull) {
                var treeConfig = props.treeConfig;
                var tableFullData = internalData.tableFullData, afterFullData = internalData.afterFullData;
                var treeOpts = computeTreeOpts.value;
                var checkboxOpts = computeCheckboxOpts.value;
                var property = checkboxOpts.checkField;
                var rowList = [];
                var currTableData = isFull ? tableFullData : afterFullData;
                if (property) {
                    if (treeConfig) {
                        rowList = XEUtils.filterTree(currTableData, function (row) { return XEUtils.get(row, property); }, treeOpts);
                    }
                    else {
                        rowList = currTableData.filter(function (row) { return XEUtils.get(row, property); });
                    }
                }
                else {
                    var selection_1 = reactData.selection;
                    if (treeConfig) {
                        rowList = XEUtils.filterTree(currTableData, function (row) { return $xetable.findRowIndexOf(selection_1, row) > -1; }, treeOpts);
                    }
                    else {
                        rowList = currTableData.filter(function (row) { return $xetable.findRowIndexOf(selection_1, row) > -1; });
                    }
                }
                return rowList;
            },
            /**
             * ?????????????????????????????????
             * @param {String/Number} rowid ?????????
             */
            getRowById: function (rowid) {
                var fullDataRowIdData = internalData.fullDataRowIdData;
                return fullDataRowIdData[rowid] ? fullDataRowIdData[rowid].row : null;
            },
            /**
             * ?????????????????????????????????
             * @param {Row} row ?????????
             */
            getRowid: function (row) {
                return getRowid($xetable, row);
            },
            /**
             * ??????????????????????????????
             * ???????????????????????????????????????
             * ?????????????????????????????????
             */
            getTableData: function () {
                var tableData = reactData.tableData, footerTableData = reactData.footerTableData;
                var tableFullData = internalData.tableFullData, afterFullData = internalData.afterFullData;
                return {
                    fullData: tableFullData.slice(0),
                    visibleData: afterFullData.slice(0),
                    tableData: tableData.slice(0),
                    footerData: footerTableData.slice(0)
                };
            },
            /**
             * ???????????????
             */
            hideColumn: function (fieldOrColumn) {
                var column = handleFieldOrColumn($xetable, fieldOrColumn);
                if (column) {
                    column.visible = false;
                }
                return tablePrivateMethods.handleCustom();
            },
            /**
             * ???????????????
             */
            showColumn: function (fieldOrColumn) {
                var column = handleFieldOrColumn($xetable, fieldOrColumn);
                if (column) {
                    column.visible = true;
                }
                return tablePrivateMethods.handleCustom();
            },
            /**
             * ?????????????????????????????????????????????????????????
             * ????????? true ?????????????????????
             * ?????????????????????????????????????????????
             */
            resetColumn: function (options) {
                var tableFullColumn = internalData.tableFullColumn;
                var customOpts = computeCustomOpts.value;
                var checkMethod = customOpts.checkMethod;
                var opts = Object.assign({ visible: true, resizable: options === true }, options);
                tableFullColumn.forEach(function (column) {
                    if (opts.resizable) {
                        column.resizeWidth = 0;
                    }
                    if (!checkMethod || checkMethod({ column: column })) {
                        column.visible = column.defaultVisible;
                    }
                });
                if (opts.resizable) {
                    tablePrivateMethods.saveCustomResizable(true);
                }
                return tablePrivateMethods.handleCustom();
            },
            /**
             * ???????????????
             * ??????????????????????????????????????????
             */
            refreshColumn: function () {
                return parseColumns().then(function () {
                    return tableMethods.refreshScroll();
                }).then(function () {
                    return tableMethods.recalculate();
                });
            },
            /**
             * ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
             */
            refreshScroll: function () {
                var lastScrollLeft = internalData.lastScrollLeft, lastScrollTop = internalData.lastScrollTop;
                var tableBody = refTableBody.value;
                var tableFooter = refTableFooter.value;
                var leftBody = refTableLeftBody.value;
                var rightBody = refTableRightBody.value;
                var tableBodyElem = tableBody ? tableBody.$el : null;
                var leftBodyElem = leftBody ? leftBody.$el : null;
                var rightBodyElem = rightBody ? rightBody.$el : null;
                var tableFooterElem = tableFooter ? tableFooter.$el : null;
                // ?????????????????????
                if (lastScrollLeft || lastScrollTop) {
                    return restoreScrollLocation($xetable, lastScrollLeft, lastScrollTop);
                }
                // ??????
                setScrollTop(tableBodyElem, lastScrollTop);
                setScrollTop(leftBodyElem, lastScrollTop);
                setScrollTop(rightBodyElem, lastScrollTop);
                setScrollLeft(tableFooterElem, lastScrollLeft);
                return nextTick();
            },
            /**
             * ??????????????????????????????????????????????????????
             * ?????? width=? width=?px width=?% min-width=? min-width=?px min-width=?%
             */
            recalculate: function (refull) {
                var tableHeader = refTableHeader.value;
                var tableBody = refTableBody.value;
                var tableFooter = refTableFooter.value;
                var bodyElem = tableBody ? tableBody.$el : null;
                var headerElem = tableHeader ? tableHeader.$el : null;
                var footerElem = tableFooter ? tableFooter.$el : null;
                if (bodyElem) {
                    autoCellWidth(headerElem, bodyElem, footerElem);
                    if (refull === true) {
                        // ????????????????????????????????????????????????????????????????????????????????????
                        return computeScrollLoad().then(function () {
                            autoCellWidth(headerElem, bodyElem, footerElem);
                            return computeScrollLoad();
                        });
                    }
                }
                return computeScrollLoad();
            },
            openTooltip: function (target, content) {
                var $commTip = refCommTooltip.value;
                if ($commTip) {
                    return $commTip.open(target, content);
                }
                return nextTick();
            },
            /**
             * ?????? tooltip
             */
            closeTooltip: function () {
                var tooltipStore = internalData.tooltipStore;
                var $tooltip = refTooltip.value;
                var $commTip = refCommTooltip.value;
                if (tooltipStore.visible) {
                    Object.assign(tooltipStore, {
                        row: null,
                        column: null,
                        content: null,
                        visible: false
                    });
                    if ($tooltip) {
                        $tooltip.close();
                    }
                }
                if ($commTip) {
                    $commTip.close();
                }
                return nextTick();
            },
            /**
             * ????????????????????????????????????
             */
            isAllCheckboxChecked: function () {
                return reactData.isAllSelected;
            },
            /**
             * ????????????????????????????????????
             */
            isAllCheckboxIndeterminate: function () {
                return !reactData.isAllSelected && reactData.isIndeterminate;
            },
            /**
             * ???????????????????????????????????????
             */
            getCheckboxIndeterminateRecords: function (isFull) {
                var treeConfig = props.treeConfig;
                var afterFullData = internalData.afterFullData;
                var treeIndeterminates = reactData.treeIndeterminates;
                if (treeConfig) {
                    return isFull ? treeIndeterminates.slice(0) : treeIndeterminates.filter(function (row) { return $xetable.findRowIndexOf(afterFullData, row) > -1; });
                }
                return [];
            },
            /**
             * ???????????????????????????????????????????????????????????????????????????
             * @param {Array/Row} rows ?????????
             * @param {Boolean} value ????????????
             */
            setCheckboxRow: function (rows, value) {
                if (rows && !XEUtils.isArray(rows)) {
                    rows = [rows];
                }
                rows.forEach(function (row) { return tablePrivateMethods.handleSelectRow({ row: row }, !!value); });
                return nextTick();
            },
            isCheckedByCheckboxRow: function (row) {
                var selection = reactData.selection;
                var checkboxOpts = computeCheckboxOpts.value;
                var property = checkboxOpts.checkField;
                if (property) {
                    return XEUtils.get(row, property);
                }
                return $xetable.findRowIndexOf(selection, row) > -1;
            },
            isIndeterminateByCheckboxRow: function (row) {
                var treeIndeterminates = reactData.treeIndeterminates;
                return $xetable.findRowIndexOf(treeIndeterminates, row) > -1 && !tableMethods.isCheckedByCheckboxRow(row);
            },
            /**
             * ???????????????????????????????????????
             */
            toggleCheckboxRow: function (row) {
                tablePrivateMethods.handleToggleCheckRowEvent(null, { row: row });
                return nextTick();
            },
            /**
             * ????????????????????????????????????????????????
             * @param {Boolean} value ????????????
             */
            setAllCheckboxRow: function (value) {
                var treeConfig = props.treeConfig;
                var selection = reactData.selection;
                var afterFullData = internalData.afterFullData, checkboxReserveRowMap = internalData.checkboxReserveRowMap;
                var treeOpts = computeTreeOpts.value;
                var checkboxOpts = computeCheckboxOpts.value;
                var property = checkboxOpts.checkField, reserve = checkboxOpts.reserve, checkStrictly = checkboxOpts.checkStrictly, checkMethod = checkboxOpts.checkMethod;
                var selectRows = [];
                var beforeSelection = treeConfig ? [] : selection.filter(function (row) { return $xetable.findRowIndexOf(afterFullData, row) === -1; });
                if (checkStrictly) {
                    reactData.isAllSelected = value;
                }
                else {
                    /**
                     * ?????????????????????????????????????????????
                     * ????????????????????????????????????????????????????????????
                     */
                    if (property) {
                        var checkValFn = function (row) {
                            if (!checkMethod || checkMethod({ row: row })) {
                                if (value) {
                                    selectRows.push(row);
                                }
                                XEUtils.set(row, property, value);
                            }
                        };
                        // ????????????????????????
                        // ?????????????????????????????????????????????????????????
                        if (treeConfig) {
                            XEUtils.eachTree(afterFullData, checkValFn, treeOpts);
                        }
                        else {
                            afterFullData.forEach(checkValFn);
                        }
                    }
                    else {
                        /**
                         * ???????????????????????????????????????
                         * ?????????????????????????????????
                         */
                        if (treeConfig) {
                            if (value) {
                                /**
                                 * ??????????????????
                                 * ????????????????????????????????????????????????
                                 */
                                XEUtils.eachTree(afterFullData, function (row) {
                                    if (!checkMethod || checkMethod({ row: row })) {
                                        selectRows.push(row);
                                    }
                                }, treeOpts);
                            }
                            else {
                                /**
                                 * ??????????????????
                                 * ???????????????????????????????????????????????????
                                 */
                                if (checkMethod) {
                                    XEUtils.eachTree(afterFullData, function (row) {
                                        if (checkMethod({ row: row }) ? 0 : $xetable.findRowIndexOf(selection, row) > -1) {
                                            selectRows.push(row);
                                        }
                                    }, treeOpts);
                                }
                            }
                        }
                        else {
                            if (value) {
                                /**
                                 * ??????????????????
                                 * ????????????????????????????????????????????????????????????????????????????????????
                                 * ?????????????????????????????????????????????????????????????????????
                                 */
                                if (checkMethod) {
                                    selectRows = afterFullData.filter(function (row) { return $xetable.findRowIndexOf(selection, row) > -1 || checkMethod({ row: row }); });
                                }
                                else {
                                    selectRows = afterFullData.slice(0);
                                }
                            }
                            else {
                                /**
                                 * ??????????????????
                                 * ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
                                 * ?????????????????????????????????????????????????????????????????????
                                 */
                                if (checkMethod) {
                                    selectRows = afterFullData.filter(function (row) { return checkMethod({ row: row }) ? 0 : $xetable.findRowIndexOf(selection, row) > -1; });
                                }
                            }
                        }
                    }
                    if (reserve) {
                        if (value) {
                            selectRows.forEach(function (row) {
                                checkboxReserveRowMap[getRowid($xetable, row)] = row;
                            });
                        }
                        else {
                            afterFullData.forEach(function (row) { return handleCheckboxReserveRow(row, false); });
                        }
                    }
                    reactData.selection = property ? [] : beforeSelection.concat(selectRows);
                }
                reactData.treeIndeterminates = [];
                tablePrivateMethods.checkSelectionStatus();
                return nextTick();
            },
            /**
             * ?????????????????????????????????
             */
            getRadioReserveRecord: function (isFull) {
                var treeConfig = props.treeConfig;
                var fullDataRowIdData = internalData.fullDataRowIdData, radioReserveRow = internalData.radioReserveRow, afterFullData = internalData.afterFullData;
                var radioOpts = computeRadioOpts.value;
                var treeOpts = computeTreeOpts.value;
                if (radioOpts.reserve && radioReserveRow) {
                    var rowid_3 = getRowid($xetable, radioReserveRow);
                    if (isFull) {
                        if (!fullDataRowIdData[rowid_3]) {
                            return radioReserveRow;
                        }
                    }
                    else {
                        var rowkey_2 = getRowkey($xetable);
                        if (treeConfig) {
                            var matchObj = XEUtils.findTree(afterFullData, function (row) { return rowid_3 === XEUtils.get(row, rowkey_2); }, treeOpts);
                            if (matchObj) {
                                return radioReserveRow;
                            }
                        }
                        else {
                            if (!afterFullData.some(function (row) { return rowid_3 === XEUtils.get(row, rowkey_2); })) {
                                return radioReserveRow;
                            }
                        }
                    }
                }
                return null;
            },
            clearRadioReserve: function () {
                internalData.radioReserveRow = null;
                return nextTick();
            },
            /**
             * ?????????????????????????????????
             */
            getCheckboxReserveRecords: function (isFull) {
                var treeConfig = props.treeConfig;
                var afterFullData = internalData.afterFullData, fullDataRowIdData = internalData.fullDataRowIdData, checkboxReserveRowMap = internalData.checkboxReserveRowMap;
                var checkboxOpts = computeCheckboxOpts.value;
                var treeOpts = computeTreeOpts.value;
                var reserveSelection = [];
                if (checkboxOpts.reserve) {
                    XEUtils.each(checkboxReserveRowMap, function (oldRow, oldRowid) {
                        if (oldRow) {
                            if (isFull) {
                                if (!fullDataRowIdData[oldRowid]) {
                                    reserveSelection.push(oldRow);
                                }
                            }
                            else {
                                if (treeConfig) {
                                    if (!XEUtils.findTree(afterFullData, function (row) { return getRowid($xetable, row) === oldRowid; }, treeOpts)) {
                                        reserveSelection.push(oldRow);
                                    }
                                }
                                else {
                                    if (!afterFullData.some(function (row) { return getRowid($xetable, row) === oldRowid; })) {
                                        reserveSelection.push(oldRow);
                                    }
                                }
                            }
                        }
                    });
                }
                return reserveSelection;
            },
            clearCheckboxReserve: function () {
                internalData.checkboxReserveRowMap = {};
                return nextTick();
            },
            /**
             * ???????????????????????????????????????
             */
            toggleAllCheckboxRow: function () {
                tablePrivateMethods.triggerCheckAllEvent(null, !reactData.isAllSelected);
                return nextTick();
            },
            /**
             * ?????????????????????????????????????????????
             * ????????????????????????????????????????????????????????????????????????????????????
             */
            clearCheckboxRow: function () {
                var treeConfig = props.treeConfig;
                var tableFullData = internalData.tableFullData;
                var treeOpts = computeTreeOpts.value;
                var checkboxOpts = computeCheckboxOpts.value;
                var property = checkboxOpts.checkField, reserve = checkboxOpts.reserve;
                if (property) {
                    if (treeConfig) {
                        XEUtils.eachTree(tableFullData, function (item) { return XEUtils.set(item, property, false); }, treeOpts);
                    }
                    else {
                        tableFullData.forEach(function (item) { return XEUtils.set(item, property, false); });
                    }
                }
                if (reserve) {
                    tableFullData.forEach(function (row) { return handleCheckboxReserveRow(row, false); });
                }
                reactData.isAllSelected = false;
                reactData.isIndeterminate = false;
                reactData.selection = [];
                reactData.treeIndeterminates = [];
                return nextTick();
            },
            /**
             * ????????????????????????????????????????????????
             * @param {Row} row ?????????
             */
            setCurrentRow: function (row) {
                var el = refElem.value;
                tableMethods.clearCurrentRow();
                tableMethods.clearCurrentColumn();
                reactData.currentRow = row;
                if (props.highlightCurrentRow) {
                    if (el) {
                        XEUtils.arrayEach(el.querySelectorAll("[rowid=\"" + getRowid($xetable, row) + "\"]"), function (elem) { return addClass(elem, 'row--current'); });
                    }
                }
                return nextTick();
            },
            isCheckedByRadioRow: function (row) {
                return reactData.selectRow === row;
            },
            /**
             * ????????????????????????????????????????????????
             * @param {Row} row ?????????
             */
            setRadioRow: function (row) {
                var radioOpts = computeRadioOpts.value;
                var checkMethod = radioOpts.checkMethod;
                if (row && (!checkMethod || checkMethod({ row: row }))) {
                    reactData.selectRow = row;
                    handleRadioReserveRow(row);
                }
                return nextTick();
            },
            /**
             * ???????????????????????????????????????????????????
             */
            clearCurrentRow: function () {
                var el = refElem.value;
                reactData.currentRow = null;
                internalData.hoverRow = null;
                if (el) {
                    XEUtils.arrayEach(el.querySelectorAll('.row--current'), function (elem) { return removeClass(elem, 'row--current'); });
                }
                return nextTick();
            },
            /**
             * ?????????????????????????????????????????????
             */
            clearRadioRow: function () {
                reactData.selectRow = null;
                return nextTick();
            },
            /**
             * ??????????????????????????????????????????
             */
            getCurrentRecord: function () {
                return props.highlightCurrentRow ? reactData.currentRow : null;
            },
            /**
             * ?????????????????????????????????????????????
             */
            getRadioRecord: function (isFull) {
                var treeConfig = props.treeConfig;
                var fullDataRowIdData = internalData.fullDataRowIdData, afterFullData = internalData.afterFullData;
                var selectRow = reactData.selectRow;
                var treeOpts = computeTreeOpts.value;
                if (selectRow) {
                    var rowid_4 = getRowid($xetable, selectRow);
                    if (isFull) {
                        if (!fullDataRowIdData[rowid_4]) {
                            return selectRow;
                        }
                    }
                    else {
                        if (treeConfig) {
                            var rowkey_3 = getRowkey($xetable);
                            var matchObj = XEUtils.findTree(afterFullData, function (row) { return rowid_4 === XEUtils.get(row, rowkey_3); }, treeOpts);
                            if (matchObj) {
                                return selectRow;
                            }
                        }
                        else {
                            if (afterFullData.indexOf(selectRow) > -1) {
                                return selectRow;
                            }
                        }
                    }
                }
                return null;
            },
            getCurrentColumn: function () {
                return props.highlightCurrentColumn ? reactData.currentColumn : null;
            },
            /**
             * ????????????????????????????????????????????????
             */
            setCurrentColumn: function (fieldOrColumn) {
                var column = handleFieldOrColumn($xetable, fieldOrColumn);
                if (column) {
                    tableMethods.clearCurrentRow();
                    tableMethods.clearCurrentColumn();
                    reactData.currentColumn = column;
                }
                return nextTick();
            },
            /**
             * ???????????????????????????????????????????????????
             */
            clearCurrentColumn: function () {
                reactData.currentColumn = null;
                return nextTick();
            },
            sort: function (sortConfs, sortOrder) {
                var sortOpts = computeSortOpts.value;
                var multiple = sortOpts.multiple, remote = sortOpts.remote, orders = sortOpts.orders;
                if (sortConfs) {
                    if (XEUtils.isString(sortConfs)) {
                        sortConfs = [
                            { field: sortConfs, order: sortOrder }
                        ];
                    }
                }
                if (!XEUtils.isArray(sortConfs)) {
                    sortConfs = [sortConfs];
                }
                if (sortConfs.length) {
                    if (!multiple) {
                        clearAllSort();
                    }
                    (multiple ? sortConfs : [sortConfs[0]]).forEach(function (confs) {
                        var field = confs.field, order = confs.order;
                        var column = field;
                        if (XEUtils.isString(field)) {
                            column = tableMethods.getColumnByField(field);
                        }
                        if (column && column.sortable) {
                            if (orders.indexOf(order) === -1) {
                                order = getNextSortOrder(column);
                            }
                            if (column.order !== order) {
                                column.order = order;
                            }
                            column.sortTime = Date.now();
                        }
                    });
                    // ??????????????????????????????????????????????????????
                    if (!remote) {
                        tablePrivateMethods.handleTableData(true);
                    }
                    return nextTick().then(updateStyle);
                }
                return nextTick();
            },
            /**
             * ??????????????????????????????
             * ?????????????????????????????????????????????
             * @param {String} fieldOrColumn ???????????????
             */
            clearSort: function (fieldOrColumn) {
                var sortOpts = computeSortOpts.value;
                if (fieldOrColumn) {
                    var column = handleFieldOrColumn($xetable, fieldOrColumn);
                    if (column) {
                        column.order = null;
                    }
                }
                else {
                    clearAllSort();
                }
                if (!sortOpts.remote) {
                    tablePrivateMethods.handleTableData(true);
                }
                return nextTick().then(updateStyle);
            },
            isSort: function (fieldOrColumn) {
                if (fieldOrColumn) {
                    var column = handleFieldOrColumn($xetable, fieldOrColumn);
                    return column ? column.sortable && !!column.order : false;
                }
                return tableMethods.getSortColumns().length > 0;
            },
            getSortColumns: function () {
                var sortList = [];
                var tableFullColumn = internalData.tableFullColumn;
                tableFullColumn.forEach(function (column) {
                    var order = column.order;
                    if (column.sortable && order) {
                        sortList.push({ column: column, property: column.property, order: order });
                    }
                });
                return sortList;
            },
            /**
             * ????????????
             * @param {Event} evnt ??????
             */
            closeFilter: function () {
                var filterStore = reactData.filterStore;
                Object.assign(filterStore, {
                    isAllSelected: false,
                    isIndeterminate: false,
                    options: [],
                    visible: false
                });
                return nextTick();
            },
            /**
             * ?????????????????????????????????????????????????????????????????????
             * @param {String} fieldOrColumn ?????????
             */
            isFilter: function (fieldOrColumn) {
                var column = handleFieldOrColumn($xetable, fieldOrColumn);
                if (column) {
                    return column.filters && column.filters.some(function (option) { return option.checked; });
                }
                return $xetable.getCheckedFilters().length > 0;
            },
            /**
             * ????????????????????????????????????
             * @param {Row} row ?????????
             */
            isRowExpandLoaded: function (row) {
                var fullAllDataRowIdData = internalData.fullAllDataRowIdData;
                var rest = fullAllDataRowIdData[getRowid($xetable, row)];
                return rest && !!rest.expandLoaded;
            },
            clearRowExpandLoaded: function (row) {
                var expandLazyLoadeds = reactData.expandLazyLoadeds;
                var fullAllDataRowIdData = internalData.fullAllDataRowIdData;
                var expandOpts = computeExpandOpts.value;
                var lazy = expandOpts.lazy;
                var rest = fullAllDataRowIdData[getRowid($xetable, row)];
                if (lazy && rest) {
                    rest.expandLoaded = false;
                    XEUtils.remove(expandLazyLoadeds, function (item) { return $xetable.eqRow(item, row); });
                }
                return nextTick();
            },
            /**
             * ??????????????????????????????
             * @param {Row} row ?????????
             */
            reloadExpandContent: function (row) {
                var expandLazyLoadeds = reactData.expandLazyLoadeds;
                var expandOpts = computeExpandOpts.value;
                var lazy = expandOpts.lazy;
                if (lazy && $xetable.findRowIndexOf(expandLazyLoadeds, row) === -1) {
                    tableMethods.clearRowExpandLoaded(row)
                        .then(function () { return handleAsyncRowExpand(row); });
                }
                return nextTick();
            },
            /**
             * ???????????????
             */
            toggleRowExpand: function (row) {
                return tableMethods.setRowExpand(row, !tableMethods.isExpandByRow(row));
            },
            /**
             * ??????????????????????????????
             * @param {Boolean} expanded ????????????
             */
            setAllRowExpand: function (expanded) {
                var expandOpts = computeExpandOpts.value;
                return tableMethods.setRowExpand(expandOpts.lazy ? reactData.tableData : internalData.tableFullData, expanded);
            },
            /**
             * ?????????????????????????????????????????????????????????
             * ????????????
             * ????????????
             * @param {Array/Row} rows ?????????
             * @param {Boolean} expanded ????????????
             */
            setRowExpand: function (rows, expanded) {
                var rowExpandeds = reactData.rowExpandeds, expandLazyLoadeds = reactData.expandLazyLoadeds, column = reactData.expandColumn;
                var fullAllDataRowIdData = internalData.fullAllDataRowIdData;
                var expandOpts = computeExpandOpts.value;
                var reserve = expandOpts.reserve, lazy = expandOpts.lazy, accordion = expandOpts.accordion, toggleMethod = expandOpts.toggleMethod;
                var lazyRests = [];
                var columnIndex = tableMethods.getColumnIndex(column);
                var $columnIndex = tableMethods.getVMColumnIndex(column);
                if (rows) {
                    if (!XEUtils.isArray(rows)) {
                        rows = [rows];
                    }
                    if (accordion) {
                        // ????????????????????????
                        rowExpandeds = [];
                        rows = rows.slice(rows.length - 1, rows.length);
                    }
                    var validRows_1 = toggleMethod ? rows.filter(function (row) { return toggleMethod({ $table: $xetable, expanded: expanded, column: column, columnIndex: columnIndex, $columnIndex: $columnIndex, row: row, rowIndex: tableMethods.getRowIndex(row), $rowIndex: tableMethods.getVMRowIndex(row) }); }) : rows;
                    if (expanded) {
                        validRows_1.forEach(function (row) {
                            if ($xetable.findRowIndexOf(rowExpandeds, row) === -1) {
                                var rest = fullAllDataRowIdData[getRowid($xetable, row)];
                                var isLoad = lazy && !rest.expandLoaded && $xetable.findRowIndexOf(expandLazyLoadeds, row) === -1;
                                if (isLoad) {
                                    lazyRests.push(handleAsyncRowExpand(row));
                                }
                                else {
                                    rowExpandeds.push(row);
                                }
                            }
                        });
                    }
                    else {
                        XEUtils.remove(rowExpandeds, function (row) { return $xetable.findRowIndexOf(validRows_1, row) > -1; });
                    }
                    if (reserve) {
                        validRows_1.forEach(function (row) { return handleRowExpandReserve(row, expanded); });
                    }
                }
                reactData.rowExpandeds = rowExpandeds;
                return Promise.all(lazyRests).then(function () { return tableMethods.recalculate(); });
            },
            /**
             * ??????????????????????????????
             * @param {Row} row ?????????
             */
            isExpandByRow: function (row) {
                var rowExpandeds = reactData.rowExpandeds;
                return $xetable.findRowIndexOf(rowExpandeds, row) > -1;
            },
            /**
             * ??????????????????????????????????????????????????????????????????
             */
            clearRowExpand: function () {
                var rowExpandeds = reactData.rowExpandeds;
                var tableFullData = internalData.tableFullData;
                var expandOpts = computeExpandOpts.value;
                var reserve = expandOpts.reserve;
                var isExists = rowExpandeds.length;
                reactData.rowExpandeds = [];
                if (reserve) {
                    tableFullData.forEach(function (row) { return handleRowExpandReserve(row, false); });
                }
                return nextTick().then(function () {
                    if (isExists) {
                        tableMethods.recalculate();
                    }
                });
            },
            clearRowExpandReserve: function () {
                internalData.rowExpandedReserveRowMap = {};
                return nextTick();
            },
            getRowExpandRecords: function () {
                return reactData.rowExpandeds.slice(0);
            },
            getTreeExpandRecords: function () {
                return reactData.treeExpandeds.slice(0);
            },
            /**
             * ????????????????????????????????????
             * @param {Row} row ?????????
             */
            isTreeExpandLoaded: function (row) {
                var fullAllDataRowIdData = internalData.fullAllDataRowIdData;
                var rest = fullAllDataRowIdData[getRowid($xetable, row)];
                return rest && !!rest.treeLoaded;
            },
            clearTreeExpandLoaded: function (row) {
                var treeExpandeds = reactData.treeExpandeds;
                var fullAllDataRowIdData = internalData.fullAllDataRowIdData;
                var treeOpts = computeTreeOpts.value;
                var lazy = treeOpts.lazy;
                var rest = fullAllDataRowIdData[getRowid($xetable, row)];
                if (lazy && rest) {
                    rest.treeLoaded = false;
                    XEUtils.remove(treeExpandeds, function (item) { return $xetable.eqRow(item, row); });
                }
                return nextTick();
            },
            /**
             * ???????????????????????????
             * @param {Row} row ?????????
             */
            reloadTreeChilds: function (row) {
                var treeLazyLoadeds = reactData.treeLazyLoadeds;
                var treeOpts = computeTreeOpts.value;
                var lazy = treeOpts.lazy, hasChild = treeOpts.hasChild;
                if (lazy && row[hasChild] && $xetable.findRowIndexOf(treeLazyLoadeds, row) === -1) {
                    tableMethods.clearTreeExpandLoaded(row)
                        .then(function () { return handleAsyncTreeExpandChilds(row); });
                }
                return nextTick();
            },
            /**
             * ??????/???????????????
             */
            toggleTreeExpand: function (row) {
                return tableMethods.setTreeExpand(row, !tableMethods.isTreeExpandByRow(row));
            },
            /**
             * ????????????????????????????????????
             * @param {Boolean} expanded ????????????
             */
            setAllTreeExpand: function (expanded) {
                var tableFullData = internalData.tableFullData;
                var treeOpts = computeTreeOpts.value;
                var lazy = treeOpts.lazy, children = treeOpts.children;
                var expandeds = [];
                XEUtils.eachTree(tableFullData, function (row) {
                    var rowChildren = row[children];
                    if (lazy || (rowChildren && rowChildren.length)) {
                        expandeds.push(row);
                    }
                }, treeOpts);
                return tableMethods.setTreeExpand(expandeds, expanded);
            },
            /**
             * ??????????????????????????????????????????????????????????????????
             * ????????????
             * ????????????
             * @param {Array/Row} rows ?????????
             * @param {Boolean} expanded ????????????
             */
            setTreeExpand: function (rows, expanded) {
                var treeExpandeds = reactData.treeExpandeds, treeLazyLoadeds = reactData.treeLazyLoadeds, treeNodeColumn = reactData.treeNodeColumn;
                var fullAllDataRowIdData = internalData.fullAllDataRowIdData, tableFullData = internalData.tableFullData;
                var treeOpts = computeTreeOpts.value;
                var reserve = treeOpts.reserve, lazy = treeOpts.lazy, hasChild = treeOpts.hasChild, children = treeOpts.children, accordion = treeOpts.accordion, toggleMethod = treeOpts.toggleMethod;
                var result = [];
                var columnIndex = tableMethods.getColumnIndex(treeNodeColumn);
                var $columnIndex = tableMethods.getVMColumnIndex(treeNodeColumn);
                if (rows) {
                    if (!XEUtils.isArray(rows)) {
                        rows = [rows];
                    }
                    if (rows.length) {
                        var validRows_2 = toggleMethod ? rows.filter(function (row) { return toggleMethod({ $table: $xetable, expanded: expanded, column: treeNodeColumn, columnIndex: columnIndex, $columnIndex: $columnIndex, row: row }); }) : rows;
                        if (accordion) {
                            validRows_2 = validRows_2.length ? [validRows_2[validRows_2.length - 1]] : [];
                            // ???????????????????????????
                            var matchObj_1 = XEUtils.findTree(tableFullData, function (item) { return item === validRows_2[0]; }, treeOpts);
                            if (matchObj_1) {
                                XEUtils.remove(treeExpandeds, function (item) { return matchObj_1.items.indexOf(item) > -1; });
                            }
                        }
                        if (expanded) {
                            validRows_2.forEach(function (row) {
                                if ($xetable.findRowIndexOf(treeExpandeds, row) === -1) {
                                    var rest = fullAllDataRowIdData[getRowid($xetable, row)];
                                    var isLoad = lazy && row[hasChild] && !rest.treeLoaded && $xetable.findRowIndexOf(treeLazyLoadeds, row) === -1;
                                    // ?????????????????????
                                    if (isLoad) {
                                        result.push(handleAsyncTreeExpandChilds(row));
                                    }
                                    else {
                                        if (row[children] && row[children].length) {
                                            treeExpandeds.push(row);
                                        }
                                    }
                                }
                            });
                        }
                        else {
                            XEUtils.remove(treeExpandeds, function (row) { return $xetable.findRowIndexOf(validRows_2, row) > -1; });
                        }
                        if (reserve) {
                            validRows_2.forEach(function (row) { return handleTreeExpandReserve(row, expanded); });
                        }
                        return Promise.all(result).then(function () {
                            return tableMethods.recalculate();
                        });
                    }
                }
                return nextTick();
            },
            /**
             * ??????????????????????????????????????????
             * @param {Row} row ?????????
             */
            isTreeExpandByRow: function (row) {
                var treeExpandeds = reactData.treeExpandeds;
                return $xetable.findRowIndexOf(treeExpandeds, row) > -1;
            },
            /**
             * ??????????????????????????????????????????????????????????????????????????????
             */
            clearTreeExpand: function () {
                var treeExpandeds = reactData.treeExpandeds;
                var tableFullData = internalData.tableFullData;
                var treeOpts = computeTreeOpts.value;
                var reserve = treeOpts.reserve;
                var isExists = treeExpandeds.length;
                reactData.treeExpandeds = [];
                if (reserve) {
                    XEUtils.eachTree(tableFullData, function (row) { return handleTreeExpandReserve(row, false); }, treeOpts);
                }
                return nextTick().then(function () {
                    if (isExists) {
                        tableMethods.recalculate();
                    }
                });
            },
            clearTreeExpandReserve: function () {
                internalData.treeExpandedReserveRowMap = {};
                return nextTick();
            },
            /**
             * ???????????????????????????
             */
            getScroll: function () {
                var scrollXLoad = reactData.scrollXLoad, scrollYLoad = reactData.scrollYLoad;
                var tableBody = refTableBody.value;
                var bodyElem = tableBody.$el;
                return {
                    virtualX: scrollXLoad,
                    virtualY: scrollYLoad,
                    scrollTop: bodyElem.scrollTop,
                    scrollLeft: bodyElem.scrollLeft
                };
            },
            /**
             * ????????????????????????????????????????????????
             * @param {Number} scrollLeft ?????????
             * @param {Number} scrollTop ?????????
             */
            scrollTo: function (scrollLeft, scrollTop) {
                var tableBody = refTableBody.value;
                var tableFooter = refTableFooter.value;
                var rightBody = refTableRightBody.value;
                var tableBodyElem = tableBody ? tableBody.$el : null;
                var rightBodyElem = rightBody ? rightBody.$el : null;
                var tableFooterElem = tableFooter ? tableFooter.$el : null;
                if (XEUtils.isNumber(scrollLeft)) {
                    setScrollLeft(tableFooterElem || tableBodyElem, scrollLeft);
                }
                if (XEUtils.isNumber(scrollTop)) {
                    setScrollTop(rightBodyElem || tableBodyElem, scrollTop);
                }
                if (reactData.scrollXLoad || reactData.scrollYLoad) {
                    return new Promise(function (resolve) { return setTimeout(function () { return resolve(nextTick()); }, 50); });
                }
                return nextTick();
            },
            /**
             * ?????????????????????????????????????????????
             * @param {Row} row ?????????
             * @param {ColumnInfo} fieldOrColumn ?????????
             */
            scrollToRow: function (row, fieldOrColumn) {
                var rest = [];
                if (row) {
                    if (props.treeConfig) {
                        rest.push(tablePrivateMethods.scrollToTreeRow(row));
                    }
                    else {
                        rest.push(rowToVisible($xetable, row));
                    }
                }
                if (fieldOrColumn) {
                    rest.push(tableMethods.scrollToColumn(fieldOrColumn));
                }
                return Promise.all(rest);
            },
            /**
             * ?????????????????????????????????????????????
             */
            scrollToColumn: function (fieldOrColumn) {
                var fullColumnIdData = internalData.fullColumnIdData;
                var column = handleFieldOrColumn($xetable, fieldOrColumn);
                if (column && fullColumnIdData[column.id]) {
                    return colToVisible($xetable, column);
                }
                return nextTick();
            },
            /**
             * ??????????????????????????????????????????????????????
             */
            clearScroll: function () {
                var scrollXStore = internalData.scrollXStore, scrollYStore = internalData.scrollYStore;
                var tableBody = refTableBody.value;
                var tableFooter = refTableFooter.value;
                var rightBody = refTableRightBody.value;
                var tableBodyElem = tableBody ? tableBody.$el : null;
                var rightBodyElem = rightBody ? rightBody.$el : null;
                var tableFooterElem = tableFooter ? tableFooter.$el : null;
                if (rightBodyElem) {
                    restoreScrollListener(rightBodyElem);
                    rightBodyElem.scrollTop = 0;
                }
                if (tableFooterElem) {
                    tableFooterElem.scrollLeft = 0;
                }
                if (tableBodyElem) {
                    restoreScrollListener(tableBodyElem);
                    tableBodyElem.scrollTop = 0;
                    tableBodyElem.scrollLeft = 0;
                }
                scrollXStore.startIndex = 0;
                scrollYStore.startIndex = 0;
                return nextTick();
            },
            /**
             * ??????????????????
             */
            updateFooter: function () {
                var showFooter = props.showFooter, footerMethod = props.footerMethod;
                var visibleColumn = internalData.visibleColumn, afterFullData = internalData.afterFullData;
                if (showFooter && footerMethod) {
                    reactData.footerTableData = visibleColumn.length ? footerMethod({ columns: visibleColumn, data: afterFullData, $table: $xetable, $grid: $xegrid }) : [];
                }
                return nextTick();
            },
            /**
             * ???????????????
             * ??????????????? v-model ?????? change ??????????????????????????????????????????????????????
             * ?????????????????????????????????????????????????????????
             */
            updateStatus: function (scope, cellValue) {
                var customVal = !XEUtils.isUndefined(cellValue);
                return nextTick().then(function () {
                    var editRules = props.editRules;
                    var validStore = reactData.validStore;
                    var tableBody = refTableBody.value;
                    if (scope && tableBody && editRules) {
                        var row_1 = scope.row, column_3 = scope.column;
                        var type = 'change';
                        if ($xetable.hasCellRules) {
                            if ($xetable.hasCellRules(type, row_1, column_3)) {
                                var cell_1 = tablePrivateMethods.getCell(row_1, column_3);
                                if (cell_1) {
                                    return $xetable.validCellRules(type, row_1, column_3, cellValue)
                                        .then(function () {
                                        if (customVal && validStore.visible) {
                                            setCellValue(row_1, column_3, cellValue);
                                        }
                                        $xetable.clearValidate();
                                    })
                                        .catch(function (_a) {
                                        var rule = _a.rule;
                                        if (customVal) {
                                            setCellValue(row_1, column_3, cellValue);
                                        }
                                        $xetable.showValidTooltip({ rule: rule, row: row_1, column: column_3, cell: cell_1 });
                                    });
                                }
                            }
                        }
                    }
                });
            },
            /**
             * ?????????????????????
             * @param {TableMergeConfig[]} merges { row: Row|number, column: ColumnInfo|number, rowspan: number, colspan: number }
             */
            setMergeCells: function (merges) {
                if (props.spanMethod) {
                    errLog('vxe.error.errConflicts', ['merge-cells', 'span-method']);
                }
                setMerges(merges, reactData.mergeList, internalData.afterFullData);
                return nextTick().then(function () { return tablePrivateMethods.updateCellAreas(); });
            },
            /**
             * ?????????????????????
             * @param {TableMergeConfig[]} merges ??????????????? [{row:Row|number, col:ColumnInfo|number}]
             */
            removeMergeCells: function (merges) {
                if (props.spanMethod) {
                    errLog('vxe.error.errConflicts', ['merge-cells', 'span-method']);
                }
                var rest = removeMerges(merges, reactData.mergeList, internalData.afterFullData);
                return nextTick().then(function () {
                    tablePrivateMethods.updateCellAreas();
                    return rest;
                });
            },
            /**
             * ?????????????????????????????????
             */
            getMergeCells: function () {
                return reactData.mergeList.slice(0);
            },
            /**
             * ???????????????????????????
             */
            clearMergeCells: function () {
                reactData.mergeList = [];
                return nextTick();
            },
            setMergeFooterItems: function (merges) {
                if (props.footerSpanMethod) {
                    errLog('vxe.error.errConflicts', ['merge-footer-items', 'footer-span-method']);
                }
                setMerges(merges, reactData.mergeFooterList);
                return nextTick().then(function () { return tablePrivateMethods.updateCellAreas(); });
            },
            removeMergeFooterItems: function (merges) {
                if (props.footerSpanMethod) {
                    errLog('vxe.error.errConflicts', ['merge-footer-items', 'footer-span-method']);
                }
                var rest = removeMerges(merges, reactData.mergeFooterList);
                return nextTick().then(function () {
                    tablePrivateMethods.updateCellAreas();
                    return rest;
                });
            },
            /**
             * ??????????????????????????????
             */
            getMergeFooterItems: function () {
                return reactData.mergeFooterList.slice(0);
            },
            /**
             * ????????????????????????
             */
            clearMergeFooterItems: function () {
                reactData.mergeFooterList = [];
                return nextTick();
            },
            focus: function () {
                internalData.isActivated = true;
                return nextTick();
            },
            blur: function () {
                internalData.isActivated = false;
                return nextTick();
            },
            /**
             * ???????????????
             * @param $toolbar
             */
            connect: function ($toolbar) {
                if ($toolbar) {
                    $xetoolbar = $toolbar;
                    $xetoolbar.syncUpdate({ collectColumn: internalData.collectColumn, $table: $xetable });
                }
                else {
                    errLog('vxe.error.barUnableLink');
                }
                return nextTick();
            }
        };
        /**
         * ????????????????????????
         */
        var handleGlobalMousedownEvent = function (evnt) {
            var editStore = reactData.editStore, ctxMenuStore = reactData.ctxMenuStore, filterStore = reactData.filterStore;
            var mouseConfig = props.mouseConfig;
            var el = refElem.value;
            var editOpts = computeEditOpts.value;
            var actived = editStore.actived;
            var $validTooltip = refValidTooltip.value;
            var tableFilter = refTableFilter.value;
            var tableMenu = refTableMenu.value;
            if (tableFilter) {
                if (getEventTargetNode(evnt, el, 'vxe-cell--filter').flag) {
                    // ???????????????????????????
                }
                else if (getEventTargetNode(evnt, tableFilter.$el).flag) {
                    // ????????????????????????
                }
                else {
                    if (!getEventTargetNode(evnt, document.body, 'vxe-table--ignore-clear').flag) {
                        tablePrivateMethods.preventEvent(evnt, 'event.clearFilter', filterStore.args, tableMethods.closeFilter);
                    }
                }
            }
            // ??????????????????????????????
            if (actived.row) {
                if (!(editOpts.autoClear === false)) {
                    // ????????????????????????????????????????????????
                    var cell = actived.args.cell;
                    if ((!cell || !getEventTargetNode(evnt, cell).flag)) {
                        if ($validTooltip && getEventTargetNode(evnt, $validTooltip.$el).flag) {
                            // ???????????????????????????????????????????????????
                        }
                        else if (!internalData._lastCallTime || internalData._lastCallTime + 50 < Date.now()) {
                            // ????????????????????????????????????????????????
                            if (!getEventTargetNode(evnt, document.body, 'vxe-table--ignore-clear').flag) {
                                // ????????????????????????????????????????????????????????????????????????????????????
                                tablePrivateMethods.preventEvent(evnt, 'event.clearActived', actived.args, function () {
                                    var isClear;
                                    if (editOpts.mode === 'row') {
                                        var rowTargetNode = getEventTargetNode(evnt, el, 'vxe-body--row');
                                        var rowNodeRest = rowTargetNode.flag ? tableMethods.getRowNode(rowTargetNode.targetElem) : null;
                                        // row ?????????????????????????????????
                                        isClear = rowNodeRest ? !$xetable.eqRow(rowNodeRest.item, actived.args.row) : false;
                                    }
                                    else {
                                        // cell ??????????????????????????????
                                        isClear = !getEventTargetNode(evnt, el, 'col--edit').flag;
                                    }
                                    // ?????????????????????????????????????????????
                                    if (!isClear) {
                                        isClear = getEventTargetNode(evnt, el, 'vxe-header--row').flag;
                                    }
                                    // ?????????????????????????????????????????????
                                    if (!isClear) {
                                        isClear = getEventTargetNode(evnt, el, 'vxe-footer--row').flag;
                                    }
                                    // ??????????????????????????????????????????????????????????????????????????????
                                    if (!isClear && props.height && !reactData.overflowY) {
                                        var bodyWrapperElem = evnt.target;
                                        if (hasClass(bodyWrapperElem, 'vxe-table--body-wrapper')) {
                                            isClear = evnt.offsetY < bodyWrapperElem.clientHeight;
                                        }
                                    }
                                    if (isClear ||
                                        // ?????????????????????????????????
                                        !getEventTargetNode(evnt, el).flag) {
                                        setTimeout(function () { return $xetable.clearActived(evnt); });
                                    }
                                });
                            }
                        }
                    }
                }
            }
            else if (mouseConfig) {
                if (!getEventTargetNode(evnt, el).flag && !($xegrid && getEventTargetNode(evnt, $xegrid.getRefMaps().refElem.value).flag) && !(tableMenu && getEventTargetNode(evnt, tableMenu.getRefMaps().refElem.value).flag) && !($xetoolbar && getEventTargetNode(evnt, $xetoolbar.getRefMaps().refElem.value).flag)) {
                    $xetable.clearSelected();
                    if ($xetable.clearCellAreas) {
                        if (!getEventTargetNode(evnt, document.body, 'vxe-table--ignore-areas-clear').flag) {
                            tablePrivateMethods.preventEvent(evnt, 'event.clearAreas', {}, function () {
                                $xetable.clearCellAreas();
                                $xetable.clearCopyCellArea();
                            });
                        }
                    }
                }
            }
            // ???????????????????????????????????????????????????????????????
            if ($xetable.closeMenu) {
                if (ctxMenuStore.visible && tableMenu && !getEventTargetNode(evnt, tableMenu.getRefMaps().refElem.value).flag) {
                    $xetable.closeMenu();
                }
            }
            // ?????????????????????
            internalData.isActivated = getEventTargetNode(evnt, $xegrid ? $xegrid.getRefMaps().refElem.value : el).flag;
        };
        /**
         * ????????????????????????
         */
        var handleGlobalBlurEvent = function () {
            tableMethods.closeFilter();
            if ($xetable.closeMenu) {
                $xetable.closeMenu();
            }
        };
        /**
         * ??????????????????
         */
        var handleGlobalMousewheelEvent = function () {
            tableMethods.closeTooltip();
            if ($xetable.closeMenu) {
                $xetable.closeMenu();
            }
        };
        /**
         * ??????????????????
         */
        var keydownEvent = function (evnt) {
            var mouseConfig = props.mouseConfig, keyboardConfig = props.keyboardConfig;
            var filterStore = reactData.filterStore, ctxMenuStore = reactData.ctxMenuStore, editStore = reactData.editStore;
            var mouseOpts = computeMouseOpts.value;
            var actived = editStore.actived;
            var isEsc = hasEventKey(evnt, EVENT_KEYS.ESCAPE);
            if (isEsc) {
                tablePrivateMethods.preventEvent(evnt, 'event.keydown', null, function () {
                    if (keyboardConfig && mouseConfig && mouseOpts.area && $xetable.handleKeyboardEvent) {
                        $xetable.handleKeyboardEvent(evnt);
                    }
                    else if (actived.row || filterStore.visible || ctxMenuStore.visible) {
                        evnt.stopPropagation();
                        // ??????????????? Esc ?????????????????????????????????
                        if ($xetable.closeMenu) {
                            $xetable.closeMenu();
                        }
                        tableMethods.closeFilter();
                        // ?????????????????????????????????????????????
                        if (actived.row) {
                            var params_1 = actived.args;
                            $xetable.clearActived(evnt);
                            // ????????????????????????????????????????????????
                            if (mouseOpts.selected) {
                                nextTick(function () { return $xetable.handleSelected(params_1, evnt); });
                            }
                        }
                    }
                    tableMethods.dispatchEvent('keydown', {}, evnt);
                });
            }
        };
        /**
         * ??????????????????
         */
        var handleGlobalKeydownEvent = function (evnt) {
            // ??????????????????????????????????????????
            if (internalData.isActivated) {
                tablePrivateMethods.preventEvent(evnt, 'event.keydown', null, function () {
                    var mouseConfig = props.mouseConfig, keyboardConfig = props.keyboardConfig, treeConfig = props.treeConfig, editConfig = props.editConfig, highlightCurrentRow = props.highlightCurrentRow;
                    var ctxMenuStore = reactData.ctxMenuStore, editStore = reactData.editStore, currentRow = reactData.currentRow;
                    var isMenu = computeIsMenu.value;
                    var bodyMenu = computeBodyMenu.value;
                    var keyboardOpts = computeKeyboardOpts.value;
                    var mouseOpts = computeMouseOpts.value;
                    var editOpts = computeEditOpts.value;
                    var treeOpts = computeTreeOpts.value;
                    var menuList = computeMenuList.value;
                    var selected = editStore.selected, actived = editStore.actived;
                    var keyCode = evnt.keyCode;
                    var isEsc = hasEventKey(evnt, EVENT_KEYS.ESCAPE);
                    var isBack = hasEventKey(evnt, EVENT_KEYS.BACKSPACE);
                    var isTab = hasEventKey(evnt, EVENT_KEYS.TAB);
                    var isEnter = hasEventKey(evnt, EVENT_KEYS.ENTER);
                    var isSpacebar = hasEventKey(evnt, EVENT_KEYS.SPACEBAR);
                    var isLeftArrow = hasEventKey(evnt, EVENT_KEYS.ARROW_LEFT);
                    var isUpArrow = hasEventKey(evnt, EVENT_KEYS.ARROW_UP);
                    var isRightArrow = hasEventKey(evnt, EVENT_KEYS.ARROW_RIGHT);
                    var isDwArrow = hasEventKey(evnt, EVENT_KEYS.ARROW_DOWN);
                    var isDel = hasEventKey(evnt, EVENT_KEYS.DELETE);
                    var isF2 = hasEventKey(evnt, EVENT_KEYS.F2);
                    var isContextMenu = hasEventKey(evnt, EVENT_KEYS.CONTEXT_MENU);
                    var hasMetaKey = evnt.metaKey;
                    var hasCtrlKey = evnt.ctrlKey;
                    var hasShiftKey = evnt.shiftKey;
                    var isAltKey = evnt.altKey;
                    var operArrow = isLeftArrow || isUpArrow || isRightArrow || isDwArrow;
                    var operCtxMenu = isMenu && ctxMenuStore.visible && (isEnter || isSpacebar || operArrow);
                    var isEditStatus = isEnableConf(editConfig) && actived.column && actived.row;
                    var params;
                    if (operCtxMenu) {
                        // ???????????????????????????; ??????????????????????????????
                        evnt.preventDefault();
                        if (ctxMenuStore.showChild && hasChildrenList(ctxMenuStore.selected)) {
                            $xetable.moveCtxMenu(evnt, ctxMenuStore, 'selectChild', isLeftArrow, false, ctxMenuStore.selected.children);
                        }
                        else {
                            $xetable.moveCtxMenu(evnt, ctxMenuStore, 'selected', isRightArrow, true, menuList);
                        }
                    }
                    else if (keyboardConfig && mouseConfig && mouseOpts.area && $xetable.handleKeyboardEvent) {
                        $xetable.handleKeyboardEvent(evnt);
                    }
                    else if (isEsc) {
                        // ??????????????? Esc ?????????????????????????????????
                        if ($xetable.closeMenu) {
                            $xetable.closeMenu();
                        }
                        tableMethods.closeFilter();
                        if (actived.row) {
                            // ?????????????????????????????????????????????
                            if (actived.row) {
                                var params_2 = actived.args;
                                $xetable.clearActived(evnt);
                                // ????????????????????????????????????????????????
                                if (mouseOpts.selected) {
                                    nextTick(function () { return $xetable.handleSelected(params_2, evnt); });
                                }
                            }
                        }
                    }
                    else if (isSpacebar && keyboardConfig && keyboardOpts.isChecked && selected.row && selected.column && (selected.column.type === 'checkbox' || selected.column.type === 'radio')) {
                        // ??????????????????????????????
                        evnt.preventDefault();
                        if (selected.column.type === 'checkbox') {
                            tablePrivateMethods.handleToggleCheckRowEvent(evnt, selected.args);
                        }
                        else {
                            tablePrivateMethods.triggerRadioRowEvent(evnt, selected.args);
                        }
                    }
                    else if (isF2 && isEnableConf(editConfig)) {
                        if (!isEditStatus) {
                            // ??????????????? F2 ???
                            if (selected.row && selected.column) {
                                evnt.preventDefault();
                                $xetable.handleActived(selected.args, evnt);
                            }
                        }
                    }
                    else if (isContextMenu) {
                        // ????????????????????????
                        internalData._keyCtx = selected.row && selected.column && bodyMenu.length;
                        clearTimeout(keyCtxTimeout);
                        keyCtxTimeout = setTimeout(function () {
                            internalData._keyCtx = false;
                        }, 1000);
                    }
                    else if (isEnter && !isAltKey && keyboardConfig && keyboardOpts.isEnter && (selected.row || actived.row || (treeConfig && highlightCurrentRow && currentRow))) {
                        // ????????????
                        if (hasCtrlKey) {
                            // ?????????????????????????????????????????????
                            if (actived.row) {
                                params = actived.args;
                                $xetable.clearActived(evnt);
                                // ????????????????????????????????????????????????
                                if (mouseOpts.selected) {
                                    nextTick(function () { return $xetable.handleSelected(params, evnt); });
                                }
                            }
                        }
                        else {
                            // ?????????????????????????????????????????????/?????????
                            if (selected.row || actived.row) {
                                var targetArgs = selected.row ? selected.args : actived.args;
                                if (hasShiftKey) {
                                    if (keyboardOpts.enterToTab) {
                                        $xetable.moveTabSelected(targetArgs, hasShiftKey, evnt);
                                    }
                                    else {
                                        $xetable.moveSelected(targetArgs, isLeftArrow, true, isRightArrow, false, evnt);
                                    }
                                }
                                else {
                                    if (keyboardOpts.enterToTab) {
                                        $xetable.moveTabSelected(targetArgs, hasShiftKey, evnt);
                                    }
                                    else {
                                        $xetable.moveSelected(targetArgs, isLeftArrow, false, isRightArrow, true, evnt);
                                    }
                                }
                            }
                            else if (treeConfig && highlightCurrentRow && currentRow) {
                                // ??????????????????????????????????????????????????????
                                var childrens = currentRow[treeOpts.children];
                                if (childrens && childrens.length) {
                                    evnt.preventDefault();
                                    var targetRow_1 = childrens[0];
                                    params = {
                                        $table: $xetable,
                                        row: targetRow_1,
                                        rowIndex: tableMethods.getRowIndex(targetRow_1),
                                        $rowIndex: tableMethods.getVMRowIndex(targetRow_1)
                                    };
                                    tableMethods.setTreeExpand(currentRow, true)
                                        .then(function () { return tableMethods.scrollToRow(targetRow_1); })
                                        .then(function () { return tablePrivateMethods.triggerCurrentRowEvent(evnt, params); });
                                }
                            }
                        }
                    }
                    else if (operArrow && keyboardConfig && keyboardOpts.isArrow) {
                        if (!isEditStatus) {
                            // ????????????????????????
                            if (selected.row && selected.column) {
                                $xetable.moveSelected(selected.args, isLeftArrow, isUpArrow, isRightArrow, isDwArrow, evnt);
                            }
                            else if ((isUpArrow || isDwArrow) && highlightCurrentRow) {
                                // ???????????????????????????
                                $xetable.moveCurrentRow(isUpArrow, isDwArrow, evnt);
                            }
                        }
                    }
                    else if (isTab && keyboardConfig && keyboardOpts.isTab) {
                        // ??????????????? Tab ?????????
                        if (selected.row || selected.column) {
                            $xetable.moveTabSelected(selected.args, hasShiftKey, evnt);
                        }
                        else if (actived.row || actived.column) {
                            $xetable.moveTabSelected(actived.args, hasShiftKey, evnt);
                        }
                    }
                    else if (keyboardConfig && isEnableConf(editConfig) && (isDel || (treeConfig && highlightCurrentRow && currentRow ? isBack && keyboardOpts.isArrow : isBack))) {
                        if (!isEditStatus) {
                            var delMethod = keyboardOpts.delMethod, backMethod = keyboardOpts.backMethod;
                            // ??????????????????
                            if (keyboardOpts.isDel && (selected.row || selected.column)) {
                                if (delMethod) {
                                    delMethod({
                                        row: selected.row,
                                        rowIndex: tableMethods.getRowIndex(selected.row),
                                        column: selected.column,
                                        columnIndex: tableMethods.getColumnIndex(selected.column),
                                        $table: $xetable
                                    });
                                }
                                else {
                                    setCellValue(selected.row, selected.column, null);
                                }
                                if (isBack) {
                                    if (backMethod) {
                                        backMethod({
                                            row: selected.row,
                                            rowIndex: tableMethods.getRowIndex(selected.row),
                                            column: selected.column,
                                            columnIndex: tableMethods.getColumnIndex(selected.column),
                                            $table: $xetable
                                        });
                                    }
                                    else {
                                        $xetable.handleActived(selected.args, evnt);
                                    }
                                }
                                else if (isDel) {
                                    // ???????????? del ????????????????????????
                                    tableMethods.updateFooter();
                                }
                            }
                            else if (isBack && keyboardOpts.isArrow && treeConfig && highlightCurrentRow && currentRow) {
                                // ?????????????????????????????????????????????????????????
                                var parentRow_1 = XEUtils.findTree(internalData.afterFullData, function (item) { return item === currentRow; }, treeOpts).parent;
                                if (parentRow_1) {
                                    evnt.preventDefault();
                                    params = {
                                        $table: $xetable,
                                        row: parentRow_1,
                                        rowIndex: tableMethods.getRowIndex(parentRow_1),
                                        $rowIndex: tableMethods.getVMRowIndex(parentRow_1)
                                    };
                                    tableMethods.setTreeExpand(parentRow_1, false)
                                        .then(function () { return tableMethods.scrollToRow(parentRow_1); })
                                        .then(function () { return tablePrivateMethods.triggerCurrentRowEvent(evnt, params); });
                                }
                            }
                        }
                    }
                    else if (keyboardConfig && isEnableConf(editConfig) && keyboardOpts.isEdit && !hasCtrlKey && !hasMetaKey && (isSpacebar || (keyCode >= 48 && keyCode <= 57) || (keyCode >= 65 && keyCode <= 90) || (keyCode >= 96 && keyCode <= 111) || (keyCode >= 186 && keyCode <= 192) || (keyCode >= 219 && keyCode <= 222))) {
                        var editMethod = keyboardOpts.editMethod;
                        // ??????????????????????????????????????????
                        // if (isSpacebar) {
                        //   evnt.preventDefault()
                        // }
                        // ???????????????????????????????????????????????????
                        if (selected.column && selected.row && isEnableConf(selected.column.editRender)) {
                            if (!editOpts.activeMethod || editOpts.activeMethod(selected.args)) {
                                if (editMethod) {
                                    editMethod({
                                        row: selected.row,
                                        rowIndex: tableMethods.getRowIndex(selected.row),
                                        column: selected.column,
                                        columnIndex: tableMethods.getColumnIndex(selected.column),
                                        $table: $xetable
                                    });
                                }
                                else {
                                    setCellValue(selected.row, selected.column, null);
                                    $xetable.handleActived(selected.args, evnt);
                                }
                            }
                        }
                    }
                    tableMethods.dispatchEvent('keydown', {}, evnt);
                });
            }
        };
        var handleGlobalPasteEvent = function (evnt) {
            var keyboardConfig = props.keyboardConfig, mouseConfig = props.mouseConfig;
            var editStore = reactData.editStore, filterStore = reactData.filterStore;
            var isActivated = internalData.isActivated;
            var mouseOpts = computeMouseOpts.value;
            var keyboardOpts = computeKeyboardOpts.value;
            var actived = editStore.actived;
            if (isActivated && !filterStore.visible) {
                if (!(actived.row || actived.column)) {
                    if (keyboardConfig && keyboardOpts.isClip && mouseConfig && mouseOpts.area && $xetable.handlePasteCellAreaEvent) {
                        $xetable.handlePasteCellAreaEvent(evnt);
                    }
                }
                tableMethods.dispatchEvent('paste', {}, evnt);
            }
        };
        var handleGlobalCopyEvent = function (evnt) {
            var keyboardConfig = props.keyboardConfig, mouseConfig = props.mouseConfig;
            var editStore = reactData.editStore, filterStore = reactData.filterStore;
            var isActivated = internalData.isActivated;
            var mouseOpts = computeMouseOpts.value;
            var keyboardOpts = computeKeyboardOpts.value;
            var actived = editStore.actived;
            if (isActivated && !filterStore.visible) {
                if (!(actived.row || actived.column)) {
                    if (keyboardConfig && keyboardOpts.isClip && mouseConfig && mouseOpts.area && $xetable.handleCopyCellAreaEvent) {
                        $xetable.handleCopyCellAreaEvent(evnt);
                    }
                }
                tableMethods.dispatchEvent('copy', {}, evnt);
            }
        };
        var handleGlobalCutEvent = function (evnt) {
            var keyboardConfig = props.keyboardConfig, mouseConfig = props.mouseConfig;
            var editStore = reactData.editStore, filterStore = reactData.filterStore;
            var isActivated = internalData.isActivated;
            var mouseOpts = computeMouseOpts.value;
            var keyboardOpts = computeKeyboardOpts.value;
            var actived = editStore.actived;
            if (isActivated && !filterStore.visible) {
                if (!(actived.row || actived.column)) {
                    if (keyboardConfig && keyboardOpts.isClip && mouseConfig && mouseOpts.area && $xetable.handleCutCellAreaEvent) {
                        $xetable.handleCutCellAreaEvent(evnt);
                    }
                }
                tableMethods.dispatchEvent('cut', {}, evnt);
            }
        };
        var handleGlobalResizeEvent = function () {
            if ($xetable.closeMenu) {
                $xetable.closeMenu();
            }
            tablePrivateMethods.updateCellAreas();
            tableMethods.recalculate(true);
        };
        var handleTargetEnterEvent = function () {
            clearTimeout(internalData.tooltipTimeout);
            internalData.tooltipActive = true;
            tableMethods.closeTooltip();
        };
        /**
         * ???????????? tooltip
         * @param {Event} evnt ??????
         * @param {ColumnInfo} column ?????????
         * @param {Row} row ?????????
         */
        var handleTooltip = function (evnt, cell, overflowElem, tipElem, params) {
            params.cell = cell;
            var tooltipStore = internalData.tooltipStore;
            var tooltipOpts = computeTooltipOpts.value;
            var column = params.column, row = params.row;
            var showAll = tooltipOpts.showAll, contentMethod = tooltipOpts.contentMethod;
            var $tooltip = refTooltip.value;
            var customContent = contentMethod ? contentMethod(params) : null;
            var useCustom = contentMethod && !XEUtils.eqNull(customContent);
            var content = useCustom ? customContent : (column.type === 'html' ? overflowElem.innerText : overflowElem.textContent).trim();
            var isCellOverflow = overflowElem.scrollWidth > overflowElem.clientWidth;
            if (content && (showAll || useCustom || isCellOverflow)) {
                Object.assign(tooltipStore, {
                    row: row,
                    column: column,
                    visible: true
                });
                if ($tooltip) {
                    $tooltip.open(isCellOverflow ? overflowElem : (tipElem || overflowElem), formatText(content));
                }
            }
            return nextTick();
        };
        /**
         * ????????????
         */
        tablePrivateMethods = {
            updateAfterDataIndex: updateAfterDataIndex,
            callSlot: function (slotFunc, params) {
                if (slotFunc) {
                    if ($xegrid) {
                        return $xegrid.callSlot(slotFunc, params);
                    }
                    if (XEUtils.isFunction(slotFunc)) {
                        return slotFunc(params);
                    }
                }
                return [];
            },
            /**
             * ?????????????????????
             */
            getParentElem: function () {
                var el = refElem.value;
                if ($xegrid) {
                    var gridEl = $xegrid.getRefMaps().refElem.value;
                    return gridEl ? gridEl.parentNode : null;
                }
                return el ? el.parentNode : null;
            },
            /**
             * ????????????????????????
             */
            getParentHeight: function () {
                var height = props.height;
                var el = refElem.value;
                if (el) {
                    var parentElem = el.parentNode;
                    var parentPaddingSize = height === 'auto' ? getPaddingTopBottomSize(parentElem) : 0;
                    return Math.floor($xegrid ? $xegrid.getParentHeight() : XEUtils.toNumber(getComputedStyle(parentElem).height) - parentPaddingSize);
                }
                return 0;
            },
            /**
             * ???????????????????????????
             * ?????????????????????????????????????????????????????????????????????????????????
             * ??????????????????????????????????????????????????????????????????
             */
            getExcludeHeight: function () {
                return $xegrid ? $xegrid.getExcludeHeight() : 0;
            },
            /**
             * ?????????????????????????????????????????????????????????
             * @param {Row} record ?????????
             */
            defineField: function (record) {
                var treeConfig = props.treeConfig;
                var expandOpts = computeExpandOpts.value;
                var treeOpts = computeTreeOpts.value;
                var radioOpts = computeRadioOpts.value;
                var checkboxOpts = computeCheckboxOpts.value;
                var rowkey = getRowkey($xetable);
                internalData.tableFullColumn.forEach(function (column) {
                    var property = column.property, editRender = column.editRender;
                    if (property && !XEUtils.has(record, property)) {
                        var cellValue = null;
                        if (editRender) {
                            var defaultValue = editRender.defaultValue;
                            if (XEUtils.isFunction(defaultValue)) {
                                cellValue = defaultValue({ column: column });
                            }
                            else if (!XEUtils.isUndefined(defaultValue)) {
                                cellValue = defaultValue;
                            }
                        }
                        XEUtils.set(record, property, cellValue);
                    }
                });
                var otherFields = [radioOpts.labelField, checkboxOpts.checkField, checkboxOpts.labelField, expandOpts.labelField];
                otherFields.forEach(function (key) {
                    if (key && eqEmptyValue(XEUtils.get(record, key))) {
                        XEUtils.set(record, key, null);
                    }
                });
                if (treeConfig && treeOpts.lazy && XEUtils.isUndefined(record[treeOpts.children])) {
                    record[treeOpts.children] = null;
                }
                // ?????????????????????????????????????????????????????????????????????????????????????????????
                if (eqEmptyValue(XEUtils.get(record, rowkey))) {
                    XEUtils.set(record, rowkey, getRowUniqueId());
                }
                return record;
            },
            handleTableData: function (force) {
                var scrollYLoad = reactData.scrollYLoad;
                var scrollYStore = internalData.scrollYStore, fullDataRowIdData = internalData.fullDataRowIdData;
                var fullData = force ? updateAfterFullData() : internalData.afterFullData;
                var tableData = scrollYLoad ? fullData.slice(scrollYStore.startIndex, scrollYStore.endIndex) : fullData.slice(0);
                tableData.forEach(function (row, $index) {
                    var rowid = getRowid($xetable, row);
                    var rest = fullDataRowIdData[rowid];
                    if (rest) {
                        rest.$index = $index;
                    }
                });
                reactData.tableData = tableData;
                return nextTick();
            },
            /**
             * ?????????????????? Map
             * ??????????????????????????????????????????????????????????????????
             */
            updateCache: function (isSource) {
                var treeConfig = props.treeConfig;
                var treeOpts = computeTreeOpts.value;
                var fullDataRowIdData = internalData.fullDataRowIdData, fullAllDataRowIdData = internalData.fullAllDataRowIdData, tableFullData = internalData.tableFullData;
                var rowkey = getRowkey($xetable);
                var isLazy = treeConfig && treeOpts.lazy;
                var handleCache = function (row, index, items, path, parent) {
                    var rowid = getRowid($xetable, row);
                    if (eqEmptyValue(rowid)) {
                        rowid = getRowUniqueId();
                        XEUtils.set(row, rowkey, rowid);
                    }
                    if (isLazy && row[treeOpts.hasChild] && XEUtils.isUndefined(row[treeOpts.children])) {
                        row[treeOpts.children] = null;
                    }
                    var rest = { row: row, rowid: rowid, index: treeConfig && parent ? -1 : index, _index: -1, $index: -1, items: items, parent: parent };
                    if (isSource) {
                        fullDataRowIdData[rowid] = rest;
                    }
                    fullAllDataRowIdData[rowid] = rest;
                };
                if (isSource) {
                    fullDataRowIdData = internalData.fullDataRowIdData = {};
                }
                fullAllDataRowIdData = internalData.fullAllDataRowIdData = {};
                if (treeConfig) {
                    XEUtils.eachTree(tableFullData, handleCache, treeOpts);
                }
                else {
                    tableFullData.forEach(handleCache);
                }
            },
            /**
             * ??????????????????????????????
             */
            analyColumnWidth: function () {
                var tableFullColumn = internalData.tableFullColumn;
                var columnOpts = computeColumnOpts.value;
                var defaultWidth = columnOpts.width, defaultMinWidth = columnOpts.minWidth;
                var resizeList = [];
                var pxList = [];
                var pxMinList = [];
                var scaleList = [];
                var scaleMinList = [];
                var autoList = [];
                tableFullColumn.forEach(function (column) {
                    if (defaultWidth && !column.width) {
                        column.width = defaultWidth;
                    }
                    if (defaultMinWidth && !column.minWidth) {
                        column.minWidth = defaultMinWidth;
                    }
                    if (column.visible) {
                        if (column.resizeWidth) {
                            resizeList.push(column);
                        }
                        else if (isPx(column.width)) {
                            pxList.push(column);
                        }
                        else if (isScale(column.width)) {
                            scaleList.push(column);
                        }
                        else if (isPx(column.minWidth)) {
                            pxMinList.push(column);
                        }
                        else if (isScale(column.minWidth)) {
                            scaleMinList.push(column);
                        }
                        else {
                            autoList.push(column);
                        }
                    }
                });
                Object.assign(reactData.columnStore, { resizeList: resizeList, pxList: pxList, pxMinList: pxMinList, scaleList: scaleList, scaleMinList: scaleMinList, autoList: autoList });
            },
            saveCustomResizable: function (isReset) {
                var id = props.id, customConfig = props.customConfig;
                var customOpts = computeCustomOpts.value;
                var collectColumn = internalData.collectColumn;
                var storage = customOpts.storage;
                var isResizable = storage === true || (storage && storage.resizable);
                if (customConfig && isResizable) {
                    var columnWidthStorageMap = getCustomStorageMap(resizableStorageKey);
                    var columnWidthStorage_1;
                    if (!id) {
                        errLog('vxe.error.reqProp', ['id']);
                        return;
                    }
                    if (!isReset) {
                        columnWidthStorage_1 = XEUtils.isPlainObject(columnWidthStorageMap[id]) ? columnWidthStorageMap[id] : {};
                        XEUtils.eachTree(collectColumn, function (column) {
                            if (column.resizeWidth) {
                                var colKey = column.getKey();
                                if (colKey) {
                                    columnWidthStorage_1[colKey] = column.renderWidth;
                                }
                            }
                        });
                    }
                    columnWidthStorageMap[id] = XEUtils.isEmpty(columnWidthStorage_1) ? undefined : columnWidthStorage_1;
                    localStorage.setItem(resizableStorageKey, XEUtils.toJSONString(columnWidthStorageMap));
                }
            },
            saveCustomVisible: function () {
                var id = props.id, customConfig = props.customConfig;
                var collectColumn = internalData.collectColumn;
                var customOpts = computeCustomOpts.value;
                var checkMethod = customOpts.checkMethod, storage = customOpts.storage;
                var isVisible = storage === true || (storage && storage.visible);
                if (customConfig && isVisible) {
                    var columnVisibleStorageMap = getCustomStorageMap(visibleStorageKey);
                    var colHides_1 = [];
                    var colShows_1 = [];
                    if (!id) {
                        errLog('vxe.error.reqProp', ['id']);
                        return;
                    }
                    XEUtils.eachTree(collectColumn, function (column) {
                        if (!checkMethod || checkMethod({ column: column })) {
                            if (!column.visible && column.defaultVisible) {
                                var colKey = column.getKey();
                                if (colKey) {
                                    colHides_1.push(colKey);
                                }
                            }
                            else if (column.visible && !column.defaultVisible) {
                                var colKey = column.getKey();
                                if (colKey) {
                                    colShows_1.push(colKey);
                                }
                            }
                        }
                    });
                    columnVisibleStorageMap[id] = [colHides_1.join(',')].concat(colShows_1.length ? [colShows_1.join(',')] : []).join('|') || undefined;
                    localStorage.setItem(visibleStorageKey, XEUtils.toJSONString(columnVisibleStorageMap));
                }
            },
            handleCustom: function () {
                tablePrivateMethods.saveCustomVisible();
                tablePrivateMethods.analyColumnWidth();
                return tableMethods.refreshColumn();
            },
            preventEvent: function (evnt, type, args, next, end) {
                var evntList = VXETable.interceptor.get(type);
                var rest;
                if (!evntList.some(function (func) { return func(Object.assign({ $grid: $xegrid, $table: $xetable, $event: evnt }, args)) === false; })) {
                    if (next) {
                        rest = next();
                    }
                }
                if (end) {
                    end();
                }
                return rest;
            },
            checkSelectionStatus: function () {
                var treeConfig = props.treeConfig;
                var selection = reactData.selection, treeIndeterminates = reactData.treeIndeterminates;
                var afterFullData = internalData.afterFullData;
                var checkboxOpts = computeCheckboxOpts.value;
                var checkField = checkboxOpts.checkField, halfField = checkboxOpts.halfField, checkStrictly = checkboxOpts.checkStrictly, checkMethod = checkboxOpts.checkMethod;
                if (!checkStrictly) {
                    var isAllSelected = false;
                    var isIndeterminate = false;
                    if (checkField) {
                        isAllSelected = afterFullData.length > 0 && afterFullData.every(checkMethod
                            ? function (row) { return !checkMethod({ row: row }) || XEUtils.get(row, checkField); }
                            : function (row) { return XEUtils.get(row, checkField); });
                        if (treeConfig) {
                            if (halfField) {
                                isIndeterminate = !isAllSelected && afterFullData.some(function (row) { return XEUtils.get(row, checkField) || XEUtils.get(row, halfField) || $xetable.findRowIndexOf(treeIndeterminates, row) > -1; });
                            }
                            else {
                                isIndeterminate = !isAllSelected && afterFullData.some(function (row) { return XEUtils.get(row, checkField) || $xetable.findRowIndexOf(treeIndeterminates, row) > -1; });
                            }
                        }
                        else {
                            if (halfField) {
                                isIndeterminate = !isAllSelected && afterFullData.some(function (row) { return XEUtils.get(row, checkField) || XEUtils.get(row, halfField); });
                            }
                            else {
                                isIndeterminate = !isAllSelected && afterFullData.some(function (row) { return XEUtils.get(row, checkField); });
                            }
                        }
                    }
                    else {
                        isAllSelected = afterFullData.length > 0 && afterFullData.every(checkMethod
                            ? function (row) { return !checkMethod({ row: row }) || $xetable.findRowIndexOf(selection, row) > -1; }
                            : function (row) { return $xetable.findRowIndexOf(selection, row) > -1; });
                        if (treeConfig) {
                            isIndeterminate = !isAllSelected && afterFullData.some(function (row) { return $xetable.findRowIndexOf(treeIndeterminates, row) > -1 || $xetable.findRowIndexOf(selection, row) > -1; });
                        }
                        else {
                            isIndeterminate = !isAllSelected && afterFullData.some(function (row) { return $xetable.findRowIndexOf(selection, row) > -1; });
                        }
                    }
                    reactData.isAllSelected = isAllSelected;
                    reactData.isIndeterminate = isIndeterminate;
                }
            },
            /**
             * ????????????????????????
             * value ??????true ??????false ??????-1
             */
            handleSelectRow: function (_a, value) {
                var row = _a.row;
                var treeConfig = props.treeConfig;
                var selection = reactData.selection, treeIndeterminates = reactData.treeIndeterminates;
                var afterFullData = internalData.afterFullData;
                var treeOpts = computeTreeOpts.value;
                var checkboxOpts = computeCheckboxOpts.value;
                var property = checkboxOpts.checkField, checkStrictly = checkboxOpts.checkStrictly, checkMethod = checkboxOpts.checkMethod;
                if (property) {
                    if (treeConfig && !checkStrictly) {
                        if (value === -1) {
                            if ($xetable.findRowIndexOf(treeIndeterminates, row) === -1) {
                                treeIndeterminates.push(row);
                            }
                            XEUtils.set(row, property, false);
                        }
                        else {
                            // ?????????????????????
                            XEUtils.eachTree([row], function (item) {
                                if ($xetable.eqRow(item, row) || (!checkMethod || checkMethod({ row: item }))) {
                                    XEUtils.set(item, property, value);
                                    XEUtils.remove(treeIndeterminates, function (half) { return half === item; });
                                    handleCheckboxReserveRow(row, value);
                                }
                            }, treeOpts);
                        }
                        // ?????????????????????????????????????????????
                        var matchObj = XEUtils.findTree(afterFullData, function (item) { return item === row; }, treeOpts);
                        if (matchObj && matchObj.parent) {
                            var parentStatus = void 0;
                            var vItems_1 = checkMethod ? matchObj.items.filter(function (item) { return checkMethod({ row: item }); }) : matchObj.items;
                            var indeterminatesItem = XEUtils.find(matchObj.items, function (item) { return $xetable.findRowIndexOf(treeIndeterminates, item) > -1; });
                            if (indeterminatesItem) {
                                parentStatus = -1;
                            }
                            else {
                                var selectItems = matchObj.items.filter(function (item) { return XEUtils.get(item, property); });
                                parentStatus = selectItems.filter(function (item) { return $xetable.findRowIndexOf(vItems_1, item) > -1; }).length === vItems_1.length ? true : (selectItems.length || value === -1 ? -1 : false);
                            }
                            return tablePrivateMethods.handleSelectRow({ row: matchObj.parent }, parentStatus);
                        }
                    }
                    else {
                        if (!checkMethod || checkMethod({ row: row })) {
                            XEUtils.set(row, property, value);
                            handleCheckboxReserveRow(row, value);
                        }
                    }
                }
                else {
                    if (treeConfig && !checkStrictly) {
                        if (value === -1) {
                            if ($xetable.findRowIndexOf(treeIndeterminates, row) === -1) {
                                treeIndeterminates.push(row);
                            }
                            XEUtils.remove(selection, function (item) { return item === row; });
                        }
                        else {
                            // ?????????????????????
                            XEUtils.eachTree([row], function (item) {
                                if ($xetable.eqRow(item, row) || (!checkMethod || checkMethod({ row: item }))) {
                                    if (value) {
                                        selection.push(item);
                                    }
                                    else {
                                        XEUtils.remove(selection, function (select) { return select === item; });
                                    }
                                    XEUtils.remove(treeIndeterminates, function (half) { return half === item; });
                                    handleCheckboxReserveRow(row, value);
                                }
                            }, treeOpts);
                        }
                        // ?????????????????????????????????????????????
                        var matchObj = XEUtils.findTree(afterFullData, function (item) { return item === row; }, treeOpts);
                        if (matchObj && matchObj.parent) {
                            var parentStatus = void 0;
                            var vItems_2 = checkMethod ? matchObj.items.filter(function (item) { return checkMethod({ row: item }); }) : matchObj.items;
                            var indeterminatesItem = XEUtils.find(matchObj.items, function (item) { return $xetable.findRowIndexOf(treeIndeterminates, item) > -1; });
                            if (indeterminatesItem) {
                                parentStatus = -1;
                            }
                            else {
                                var selectItems = matchObj.items.filter(function (item) { return $xetable.findRowIndexOf(selection, item) > -1; });
                                parentStatus = selectItems.filter(function (item) { return $xetable.findRowIndexOf(vItems_2, item) > -1; }).length === vItems_2.length ? true : (selectItems.length || value === -1 ? -1 : false);
                            }
                            return tablePrivateMethods.handleSelectRow({ row: matchObj.parent }, parentStatus);
                        }
                    }
                    else {
                        if (!checkMethod || checkMethod({ row: row })) {
                            if (value) {
                                if ($xetable.findRowIndexOf(selection, row) === -1) {
                                    selection.push(row);
                                }
                            }
                            else {
                                XEUtils.remove(selection, function (item) { return item === row; });
                            }
                            handleCheckboxReserveRow(row, value);
                        }
                    }
                }
                tablePrivateMethods.checkSelectionStatus();
            },
            triggerHeaderHelpEvent: function (evnt, params) {
                var column = params.column;
                var titleHelp = column.titleHelp;
                if (titleHelp.message) {
                    var tooltipStore = internalData.tooltipStore;
                    var $tooltip = refTooltip.value;
                    var content = getFuncText(titleHelp.message);
                    handleTargetEnterEvent();
                    tooltipStore.visible = true;
                    if ($tooltip) {
                        $tooltip.open(evnt.currentTarget, content);
                    }
                }
            },
            /**
             * ???????????? tooltip ??????
             */
            triggerHeaderTooltipEvent: function (evnt, params) {
                var tooltipStore = internalData.tooltipStore;
                var column = params.column;
                var titleElem = evnt.currentTarget;
                handleTargetEnterEvent();
                if (tooltipStore.column !== column || !tooltipStore.visible) {
                    handleTooltip(evnt, titleElem, titleElem, null, params);
                }
            },
            /**
             * ??????????????? tooltip ??????
             */
            triggerBodyTooltipEvent: function (evnt, params) {
                var editConfig = props.editConfig;
                var editStore = reactData.editStore;
                var tooltipStore = internalData.tooltipStore;
                var editOpts = computeEditOpts.value;
                var actived = editStore.actived;
                var row = params.row, column = params.column;
                var cell = evnt.currentTarget;
                handleTargetEnterEvent();
                if (isEnableConf(editConfig)) {
                    if ((editOpts.mode === 'row' && actived.row === row) || (actived.row === row && actived.column === column)) {
                        return;
                    }
                }
                if (tooltipStore.column !== column || tooltipStore.row !== row || !tooltipStore.visible) {
                    var overflowElem = void 0;
                    var tipElem = void 0;
                    if (column.treeNode) {
                        overflowElem = cell.querySelector('.vxe-tree-cell');
                        if (column.type === 'html') {
                            tipElem = cell.querySelector('.vxe-cell--html');
                        }
                    }
                    else {
                        tipElem = cell.querySelector(column.type === 'html' ? '.vxe-cell--html' : '.vxe-cell--label');
                    }
                    handleTooltip(evnt, cell, overflowElem || cell.children[0], tipElem, params);
                }
            },
            /**
             * ???????????? tooltip ??????
             */
            triggerFooterTooltipEvent: function (evnt, params) {
                var column = params.column;
                var tooltipStore = internalData.tooltipStore;
                var cell = evnt.currentTarget;
                handleTargetEnterEvent();
                if (tooltipStore.column !== column || !tooltipStore.visible) {
                    handleTooltip(evnt, cell, cell.querySelector('.vxe-cell--item') || cell.children[0], null, params);
                }
            },
            handleTargetLeaveEvent: function () {
                var tooltipOpts = computeTooltipOpts.value;
                internalData.tooltipActive = false;
                if (tooltipOpts.enterable) {
                    internalData.tooltipTimeout = setTimeout(function () {
                        var $tooltip = refTooltip.value;
                        if ($tooltip && !$tooltip.reactData.isHover) {
                            tableMethods.closeTooltip();
                        }
                    }, tooltipOpts.leaveDelay);
                }
                else {
                    tableMethods.closeTooltip();
                }
            },
            triggerHeaderCellClickEvent: function (evnt, params) {
                var _lastResizeTime = internalData._lastResizeTime;
                var sortOpts = computeSortOpts.value;
                var column = params.column;
                var cell = evnt.currentTarget;
                var triggerResizable = _lastResizeTime && _lastResizeTime > Date.now() - 300;
                var triggerSort = getEventTargetNode(evnt, cell, 'vxe-cell--sort').flag;
                var triggerFilter = getEventTargetNode(evnt, cell, 'vxe-cell--filter').flag;
                if (sortOpts.trigger === 'cell' && !(triggerResizable || triggerSort || triggerFilter)) {
                    tablePrivateMethods.triggerSortEvent(evnt, column, getNextSortOrder(column));
                }
                tableMethods.dispatchEvent('header-cell-click', Object.assign({ triggerResizable: triggerResizable, triggerSort: triggerSort, triggerFilter: triggerFilter, cell: cell }, params), evnt);
                if (props.highlightCurrentColumn) {
                    tableMethods.setCurrentColumn(column);
                }
            },
            triggerHeaderCellDblclickEvent: function (evnt, params) {
                tableMethods.dispatchEvent('header-cell-dblclick', Object.assign({ cell: evnt.currentTarget }, params), evnt);
            },
            /**
             * ???????????????
             * ????????????????????????????????????????????????
             * ????????????????????????????????????????????????
             */
            triggerCellClickEvent: function (evnt, params) {
                var highlightCurrentRow = props.highlightCurrentRow, editConfig = props.editConfig;
                var editStore = reactData.editStore;
                var expandOpts = computeExpandOpts.value;
                var editOpts = computeEditOpts.value;
                var treeOpts = computeTreeOpts.value;
                var radioOpts = computeRadioOpts.value;
                var checkboxOpts = computeCheckboxOpts.value;
                var actived = editStore.actived;
                var row = params.row, column = params.column;
                var type = column.type, treeNode = column.treeNode;
                var isRadioType = type === 'radio';
                var isCheckboxType = type === 'checkbox';
                var isExpandType = type === 'expand';
                var cell = evnt.currentTarget;
                var triggerRadio = isRadioType && getEventTargetNode(evnt, cell, 'vxe-cell--radio').flag;
                var triggerCheckbox = isCheckboxType && getEventTargetNode(evnt, cell, 'vxe-cell--checkbox').flag;
                var triggerTreeNode = treeNode && getEventTargetNode(evnt, cell, 'vxe-tree--btn-wrapper').flag;
                var triggerExpandNode = isExpandType && getEventTargetNode(evnt, cell, 'vxe-table--expanded').flag;
                params = Object.assign({ cell: cell, triggerRadio: triggerRadio, triggerCheckbox: triggerCheckbox, triggerTreeNode: triggerTreeNode, triggerExpandNode: triggerExpandNode }, params);
                if (!triggerCheckbox && !triggerRadio) {
                    // ??????????????????
                    if (!triggerExpandNode && (expandOpts.trigger === 'row' || (isExpandType && expandOpts.trigger === 'cell'))) {
                        tablePrivateMethods.triggerRowExpandEvent(evnt, params);
                    }
                    // ?????????????????????
                    if ((treeOpts.trigger === 'row' || (treeNode && treeOpts.trigger === 'cell'))) {
                        tablePrivateMethods.triggerTreeExpandEvent(evnt, params);
                    }
                }
                // ????????????????????????
                if (!triggerTreeNode) {
                    if (!triggerExpandNode) {
                        // ??????????????????
                        if (highlightCurrentRow) {
                            if (!triggerCheckbox && !triggerRadio) {
                                tablePrivateMethods.triggerCurrentRowEvent(evnt, params);
                            }
                        }
                        // ??????????????????
                        if (!triggerRadio && (radioOpts.trigger === 'row' || (isRadioType && radioOpts.trigger === 'cell'))) {
                            tablePrivateMethods.triggerRadioRowEvent(evnt, params);
                        }
                        // ??????????????????
                        if (!triggerCheckbox && (checkboxOpts.trigger === 'row' || (isCheckboxType && checkboxOpts.trigger === 'cell'))) {
                            tablePrivateMethods.handleToggleCheckRowEvent(evnt, params);
                        }
                    }
                    // ?????????????????????????????????????????????????????????????????????????????????????????????????????????
                    if (isEnableConf(editConfig)) {
                        if (editOpts.trigger === 'manual') {
                            if (actived.args && actived.row === row && column !== actived.column) {
                                handleChangeCell(evnt, params);
                            }
                        }
                        else if (!actived.args || row !== actived.row || column !== actived.column) {
                            if (editOpts.trigger === 'click') {
                                handleChangeCell(evnt, params);
                            }
                            else if (editOpts.trigger === 'dblclick') {
                                if (editOpts.mode === 'row' && actived.row === row) {
                                    handleChangeCell(evnt, params);
                                }
                            }
                        }
                    }
                }
                tableMethods.dispatchEvent('cell-click', params, evnt);
            },
            /**
             * ?????????????????????
             * ????????????????????????????????????????????????
             */
            triggerCellDblclickEvent: function (evnt, params) {
                var editConfig = props.editConfig;
                var editStore = reactData.editStore;
                var editOpts = computeEditOpts.value;
                var actived = editStore.actived;
                var cell = evnt.currentTarget;
                params = Object.assign({ cell: cell }, params);
                if (isEnableConf(editConfig) && editOpts.trigger === 'dblclick') {
                    if (!actived.args || evnt.currentTarget !== actived.args.cell) {
                        if (editOpts.mode === 'row') {
                            checkValidate('blur')
                                .catch(function (e) { return e; })
                                .then(function () {
                                $xetable.handleActived(params, evnt)
                                    .then(function () { return checkValidate('change'); })
                                    .catch(function (e) { return e; });
                            });
                        }
                        else if (editOpts.mode === 'cell') {
                            $xetable.handleActived(params, evnt)
                                .then(function () { return checkValidate('change'); })
                                .catch(function (e) { return e; });
                        }
                    }
                }
                tableMethods.dispatchEvent('cell-dblclick', params, evnt);
            },
            handleToggleCheckRowEvent: function (evnt, params) {
                var selection = reactData.selection;
                var checkboxOpts = computeCheckboxOpts.value;
                var property = checkboxOpts.checkField;
                var row = params.row;
                var value = property ? !XEUtils.get(row, property) : $xetable.findRowIndexOf(selection, row) === -1;
                if (evnt) {
                    tablePrivateMethods.triggerCheckRowEvent(evnt, params, value);
                }
                else {
                    tablePrivateMethods.handleSelectRow(params, value);
                }
            },
            triggerCheckRowEvent: function (evnt, params, value) {
                var checkboxOpts = computeCheckboxOpts.value;
                var checkMethod = checkboxOpts.checkMethod;
                if (!checkMethod || checkMethod({ row: params.row })) {
                    tablePrivateMethods.handleSelectRow(params, value);
                    tableMethods.dispatchEvent('checkbox-change', Object.assign({
                        records: tableMethods.getCheckboxRecords(),
                        reserves: tableMethods.getCheckboxReserveRecords(),
                        indeterminates: tableMethods.getCheckboxIndeterminateRecords(),
                        checked: value
                    }, params), evnt);
                }
            },
            /**
             * ???????????????????????????
             */
            triggerCheckAllEvent: function (evnt, value) {
                tableMethods.setAllCheckboxRow(value);
                if (evnt) {
                    tableMethods.dispatchEvent('checkbox-all', {
                        records: tableMethods.getCheckboxRecords(),
                        reserves: tableMethods.getCheckboxReserveRecords(),
                        indeterminates: tableMethods.getCheckboxIndeterminateRecords(),
                        checked: value
                    }, evnt);
                }
            },
            /**
             * ????????????????????????
             */
            triggerRadioRowEvent: function (evnt, params) {
                var oldValue = reactData.selectRow;
                var row = params.row;
                var radioOpts = computeRadioOpts.value;
                var newValue = row;
                var isChange = oldValue !== newValue;
                if (isChange) {
                    tableMethods.setRadioRow(newValue);
                }
                else if (!radioOpts.strict) {
                    isChange = oldValue === newValue;
                    if (isChange) {
                        newValue = null;
                        tableMethods.clearRadioRow();
                    }
                }
                if (isChange) {
                    tableMethods.dispatchEvent('radio-change', __assign({ oldValue: oldValue, newValue: newValue }, params), evnt);
                }
            },
            triggerCurrentRowEvent: function (evnt, params) {
                var oldValue = reactData.currentRow;
                var newValue = params.row;
                var isChange = oldValue !== newValue;
                tableMethods.setCurrentRow(newValue);
                if (isChange) {
                    tableMethods.dispatchEvent('current-change', __assign({ oldValue: oldValue, newValue: newValue }, params), evnt);
                }
            },
            /**
             * ???????????????
             */
            triggerRowExpandEvent: function (evnt, params) {
                var expandLazyLoadeds = reactData.expandLazyLoadeds, column = reactData.expandColumn;
                var expandOpts = computeExpandOpts.value;
                var row = params.row;
                var lazy = expandOpts.lazy;
                if (!lazy || $xetable.findRowIndexOf(expandLazyLoadeds, row) === -1) {
                    var expanded = !tableMethods.isExpandByRow(row);
                    var columnIndex = tableMethods.getColumnIndex(column);
                    var $columnIndex = tableMethods.getVMColumnIndex(column);
                    tableMethods.setRowExpand(row, expanded);
                    tableMethods.dispatchEvent('toggle-row-expand', {
                        expanded: expanded,
                        column: column,
                        columnIndex: columnIndex,
                        $columnIndex: $columnIndex,
                        row: row,
                        rowIndex: tableMethods.getRowIndex(row),
                        $rowIndex: tableMethods.getVMRowIndex(row)
                    }, evnt);
                }
            },
            /**
             * ?????????????????????
             */
            triggerTreeExpandEvent: function (evnt, params) {
                var treeLazyLoadeds = reactData.treeLazyLoadeds;
                var treeOpts = computeTreeOpts.value;
                var row = params.row, column = params.column;
                var lazy = treeOpts.lazy;
                if (!lazy || $xetable.findRowIndexOf(treeLazyLoadeds, row) === -1) {
                    var expanded = !tableMethods.isTreeExpandByRow(row);
                    var columnIndex = tableMethods.getColumnIndex(column);
                    var $columnIndex = tableMethods.getVMColumnIndex(column);
                    tableMethods.setTreeExpand(row, expanded);
                    tableMethods.dispatchEvent('toggle-tree-expand', { expanded: expanded, column: column, columnIndex: columnIndex, $columnIndex: $columnIndex, row: row }, evnt);
                }
            },
            /**
             * ??????????????????
             */
            triggerSortEvent: function (evnt, column, order) {
                var sortOpts = computeSortOpts.value;
                var property = column.property;
                if (column.sortable) {
                    if (!order || column.order === order) {
                        tableMethods.clearSort(sortOpts.multiple ? column : null);
                    }
                    else {
                        tableMethods.sort({ field: property, order: order });
                    }
                    var params = { column: column, property: property, order: column.order, sortList: tableMethods.getSortColumns() };
                    tableMethods.dispatchEvent('sort-change', params, evnt);
                }
            },
            /**
             * ?????? X ????????????????????????
             */
            triggerScrollXEvent: function () {
                loadScrollXData();
            },
            /**
             * ?????? Y ????????????????????????
             */
            triggerScrollYEvent: function (evnt) {
                var scrollYStore = internalData.scrollYStore;
                var adaptive = scrollYStore.adaptive, offsetSize = scrollYStore.offsetSize, visibleSize = scrollYStore.visibleSize;
                // webkit ????????????????????????????????????????????????????????????????????? 40 ???
                if (isWebkit && adaptive && (offsetSize * 2 + visibleSize) <= 40) {
                    loadScrollYData(evnt);
                }
                else {
                    debounceScrollY(evnt);
                }
            },
            /**
             * ??????????????????????????????????????????????????????????????????
             * ????????????????????????????????????????????????????????????????????????
             * @param {Row} row ?????????
             */
            scrollToTreeRow: function (row) {
                var treeConfig = props.treeConfig;
                var tableFullData = internalData.tableFullData;
                var rests = [];
                if (treeConfig) {
                    var treeOpts = computeTreeOpts.value;
                    var matchObj = XEUtils.findTree(tableFullData, function (item) { return item === row; }, treeOpts);
                    if (matchObj) {
                        var nodes_1 = matchObj.nodes;
                        nodes_1.forEach(function (row, index) {
                            if (index < nodes_1.length - 1 && !tableMethods.isTreeExpandByRow(row)) {
                                rests.push(tableMethods.setTreeExpand(row, true));
                            }
                        });
                    }
                }
                return Promise.all(rests).then(function () { return rowToVisible($xetable, row); });
            },
            // ???????????? X ????????????????????????????????????
            updateScrollXSpace: function () {
                var scrollXLoad = reactData.scrollXLoad, scrollbarWidth = reactData.scrollbarWidth;
                var visibleColumn = internalData.visibleColumn, scrollXStore = internalData.scrollXStore, elemStore = internalData.elemStore, tableWidth = internalData.tableWidth;
                var tableHeader = refTableHeader.value;
                var tableBody = refTableBody.value;
                var tableFooter = refTableFooter.value;
                var tableBodyElem = tableBody ? tableBody.$el : null;
                if (tableBodyElem) {
                    var tableHeaderElem = tableHeader ? tableHeader.$el : null;
                    var tableFooterElem = tableFooter ? tableFooter.$el : null;
                    var headerElem = tableHeaderElem ? tableHeaderElem.querySelector('.vxe-table--header') : null;
                    var bodyElem = tableBodyElem.querySelector('.vxe-table--body');
                    var footerElem = tableFooterElem ? tableFooterElem.querySelector('.vxe-table--footer') : null;
                    var leftSpaceWidth = visibleColumn.slice(0, scrollXStore.startIndex).reduce(function (previous, column) { return previous + column.renderWidth; }, 0);
                    var marginLeft = '';
                    if (scrollXLoad) {
                        marginLeft = leftSpaceWidth + "px";
                    }
                    if (headerElem) {
                        headerElem.style.marginLeft = marginLeft;
                    }
                    bodyElem.style.marginLeft = marginLeft;
                    if (footerElem) {
                        footerElem.style.marginLeft = marginLeft;
                    }
                    var containerList = ['main'];
                    containerList.forEach(function (name) {
                        var layoutList = ['header', 'body', 'footer'];
                        layoutList.forEach(function (layout) {
                            var xSpaceElem = elemStore[name + "-" + layout + "-xSpace"];
                            if (xSpaceElem) {
                                xSpaceElem.style.width = scrollXLoad ? tableWidth + (layout === 'header' ? scrollbarWidth : 0) + "px" : '';
                            }
                        });
                    });
                    nextTick(updateStyle);
                }
            },
            // ???????????? Y ????????????????????????????????????
            updateScrollYSpace: function () {
                var scrollYLoad = reactData.scrollYLoad;
                var scrollYStore = internalData.scrollYStore, elemStore = internalData.elemStore, afterFullData = internalData.afterFullData;
                var startIndex = scrollYStore.startIndex, rowHeight = scrollYStore.rowHeight;
                var bodyHeight = afterFullData.length * rowHeight;
                var topSpaceHeight = Math.max(0, startIndex * rowHeight);
                var containerList = ['main', 'left', 'right'];
                var marginTop = '';
                var ySpaceHeight = '';
                if (scrollYLoad) {
                    marginTop = topSpaceHeight + "px";
                    ySpaceHeight = bodyHeight + "px";
                }
                containerList.forEach(function (name) {
                    var layoutList = ['header', 'body', 'footer'];
                    var tableElem = elemStore[name + "-body-table"];
                    if (tableElem) {
                        tableElem.style.marginTop = marginTop;
                    }
                    layoutList.forEach(function (layout) {
                        var ySpaceElem = elemStore[name + "-" + layout + "-ySpace"];
                        if (ySpaceElem) {
                            ySpaceElem.style.height = ySpaceHeight;
                        }
                    });
                });
                nextTick(updateStyle);
            },
            updateScrollXData: function () {
                handleTableColumn();
                tablePrivateMethods.updateScrollXSpace();
            },
            updateScrollYData: function () {
                tablePrivateMethods.handleTableData();
                tablePrivateMethods.updateScrollYSpace();
            },
            /**
             * ??????????????????????????????
             */
            checkScrolling: function () {
                var leftContainerElem = refLeftContainer.value;
                var rightContainerElem = refRightContainer.value;
                var tableBody = refTableBody.value;
                var bodyElem = tableBody ? tableBody.$el : null;
                if (bodyElem) {
                    if (leftContainerElem) {
                        if (bodyElem.scrollLeft > 0) {
                            addClass(leftContainerElem, 'scrolling--middle');
                        }
                        else {
                            removeClass(leftContainerElem, 'scrolling--middle');
                        }
                    }
                    if (rightContainerElem) {
                        if (bodyElem.clientWidth < bodyElem.scrollWidth - Math.ceil(bodyElem.scrollLeft)) {
                            addClass(rightContainerElem, 'scrolling--middle');
                        }
                        else {
                            removeClass(rightContainerElem, 'scrolling--middle');
                        }
                    }
                }
            },
            updateZindex: function () {
                if (props.zIndex) {
                    internalData.tZindex = props.zIndex;
                }
                else if (internalData.tZindex < getLastZIndex()) {
                    internalData.tZindex = nextZIndex();
                }
            },
            updateCellAreas: function () {
                var mouseConfig = props.mouseConfig;
                var mouseOpts = computeMouseOpts.value;
                if (mouseConfig && mouseOpts.area && $xetable.handleUpdateCellAreas) {
                    $xetable.handleUpdateCellAreas();
                }
            },
            /**
             * ??? hover ??????
             */
            triggerHoverEvent: function (evnt, _a) {
                var row = _a.row;
                tablePrivateMethods.setHoverRow(row);
            },
            setHoverRow: function (row) {
                var rowid = getRowid($xetable, row);
                var el = refElem.value;
                tablePrivateMethods.clearHoverRow();
                if (el) {
                    XEUtils.arrayEach(el.querySelectorAll("[rowid=\"" + rowid + "\"]"), function (elem) { return addClass(elem, 'row--hover'); });
                }
                internalData.hoverRow = row;
            },
            clearHoverRow: function () {
                var el = refElem.value;
                if (el) {
                    XEUtils.arrayEach(el.querySelectorAll('.vxe-body--row.row--hover'), function (elem) { return removeClass(elem, 'row--hover'); });
                }
                internalData.hoverRow = null;
            },
            getCell: function (row, column) {
                var rowid = getRowid($xetable, row);
                var tableBody = refTableBody.value;
                var leftBody = refTableLeftBody.value;
                var rightBody = refTableRightBody.value;
                var bodyElem;
                if (column.fixed) {
                    if (column.fixed === 'left') {
                        if (leftBody) {
                            bodyElem = leftBody.$el;
                        }
                    }
                    else {
                        if (rightBody) {
                            bodyElem = rightBody.$el;
                        }
                    }
                }
                if (!bodyElem) {
                    bodyElem = tableBody.$el;
                }
                if (bodyElem) {
                    return bodyElem.querySelector(".vxe-body--row[rowid=\"" + rowid + "\"] ." + column.id);
                }
                return null;
            },
            getCellLabel: function (row, column) {
                var formatter = column.formatter;
                var cellValue = getCellValue(row, column);
                var cellLabel = cellValue;
                if (formatter) {
                    var formatData = void 0;
                    var fullAllDataRowIdData = internalData.fullAllDataRowIdData;
                    var rowid = getRowid($xetable, row);
                    var colid = column.id;
                    var rest = fullAllDataRowIdData[rowid];
                    if (rest) {
                        formatData = rest.formatData;
                        if (!formatData) {
                            formatData = fullAllDataRowIdData[rowid].formatData = {};
                        }
                        if (rest && formatData[colid]) {
                            if (formatData[colid].value === cellValue) {
                                return formatData[colid].label;
                            }
                        }
                    }
                    var formatParams = { cellValue: cellValue, row: row, rowIndex: tableMethods.getRowIndex(row), column: column, columnIndex: tableMethods.getColumnIndex(column) };
                    if (XEUtils.isString(formatter)) {
                        var globalFunc = VXETable.formats.get(formatter);
                        cellLabel = globalFunc ? globalFunc(formatParams) : '';
                    }
                    else if (XEUtils.isArray(formatter)) {
                        var globalFunc = VXETable.formats.get(formatter[0]);
                        cellLabel = globalFunc ? globalFunc.apply(void 0, __spreadArray([formatParams], formatter.slice(1))) : '';
                    }
                    else {
                        cellLabel = formatter(formatParams);
                    }
                    if (formatData) {
                        formatData[colid] = { value: cellValue, label: cellLabel };
                    }
                }
                return cellLabel;
            },
            findRowIndexOf: function (list, row) {
                return row ? XEUtils.findIndexOf(list, function (item) { return $xetable.eqRow(item, row); }) : -1;
            },
            eqRow: function (row1, row2) {
                if (row1 && row2) {
                    if (row1 === row2) {
                        return true;
                    }
                    return getRowid($xetable, row1) === getRowid($xetable, row2);
                }
                return false;
            }
        };
        Object.assign($xetable, tableMethods, tablePrivateMethods);
        /**
         * ??????????????????
         * ?????????????????????????????????????????????
         * ?????????????????????????????????????????????????????????
         * @param {String} fixedType ???????????????
         */
        var renderFixed = function (fixedType) {
            var showHeader = props.showHeader, showFooter = props.showFooter;
            var tableData = reactData.tableData, tableColumn = reactData.tableColumn, tableGroupColumn = reactData.tableGroupColumn, columnStore = reactData.columnStore, footerTableData = reactData.footerTableData;
            var isFixedLeft = fixedType === 'left';
            var fixedColumn = isFixedLeft ? columnStore.leftList : columnStore.rightList;
            return h('div', {
                ref: isFixedLeft ? refLeftContainer : refRightContainer,
                class: "vxe-table--fixed-" + fixedType + "-wrapper"
            }, [
                showHeader ? h(resolveComponent('vxe-table-header'), {
                    ref: isFixedLeft ? refTableLeftHeader : refTableRightHeader,
                    fixedType: fixedType,
                    tableData: tableData,
                    tableColumn: tableColumn,
                    tableGroupColumn: tableGroupColumn,
                    fixedColumn: fixedColumn
                }) : createCommentVNode(),
                h(TableBodyComponent, {
                    ref: isFixedLeft ? refTableLeftBody : refTableRightBody,
                    fixedType: fixedType,
                    tableData: tableData,
                    tableColumn: tableColumn,
                    fixedColumn: fixedColumn
                }),
                showFooter ? h(resolveComponent('vxe-table-footer'), {
                    ref: isFixedLeft ? refTableLeftFooter : refTableRightFooter,
                    footerTableData: footerTableData,
                    tableColumn: tableColumn,
                    fixedColumn: fixedColumn,
                    fixedType: fixedType
                }) : createCommentVNode()
            ]);
        };
        var renderEmptyContenet = function () {
            var emptyOpts = computeEmptyOpts.value;
            var params = { $table: $xetable };
            if (slots.empty) {
                return slots.empty(params);
            }
            else {
                var compConf = emptyOpts.name ? VXETable.renderer.get(emptyOpts.name) : null;
                var renderEmpty = compConf ? compConf.renderEmpty : null;
                if (renderEmpty) {
                    return renderEmpty(emptyOpts, params);
                }
            }
            return getFuncText(props.emptyText) || GlobalConfig.i18n('vxe.table.emptyText');
        };
        function handleUupdateResize() {
            var el = refElem.value;
            if (el && el.clientWidth && el.clientHeight) {
                tableMethods.recalculate();
            }
        }
        watch(function () { return props.data; }, function (value) {
            var inited = internalData.inited, initStatus = internalData.initStatus;
            loadTableData(value || []).then(function () {
                var scrollXLoad = reactData.scrollXLoad, scrollYLoad = reactData.scrollYLoad, expandColumn = reactData.expandColumn;
                internalData.inited = true;
                internalData.initStatus = true;
                if (!initStatus) {
                    handleLoadDefaults();
                }
                if (!inited) {
                    handleInitDefaults();
                }
                if (process.env.NODE_ENV === 'development') {
                    if ((scrollXLoad || scrollYLoad) && expandColumn) {
                        warnLog('vxe.error.scrollErrProp', ['column.type=expand']);
                    }
                }
                tableMethods.recalculate();
            });
        });
        watch(function () { return reactData.staticColumns; }, function (value) {
            handleColumn(value);
        });
        watch(function () { return reactData.tableColumn; }, function () {
            tablePrivateMethods.analyColumnWidth();
        });
        watch(function () { return props.showHeader; }, function () {
            nextTick(function () {
                tableMethods.recalculate(true).then(function () { return tableMethods.refreshScroll(); });
            });
        });
        watch(function () { return props.showFooter; }, function () {
            nextTick(function () {
                tableMethods.recalculate(true).then(function () { return tableMethods.refreshScroll(); });
            });
        });
        watch(function () { return props.height; }, function () {
            nextTick(function () { return tableMethods.recalculate(true); });
        });
        watch(function () { return props.maxHeight; }, function () {
            nextTick(function () { return tableMethods.recalculate(true); });
        });
        watch(function () { return props.syncResize; }, function (value) {
            if (value) {
                handleUupdateResize();
                nextTick(function () {
                    handleUupdateResize();
                    setTimeout(function () { return handleUupdateResize(); });
                });
            }
        });
        watch(function () { return props.mergeCells; }, function (value) {
            tableMethods.clearMergeCells();
            nextTick(function () {
                if (value) {
                    tableMethods.setMergeCells(value);
                }
            });
        });
        watch(function () { return props.mergeFooterItems; }, function (value) {
            tableMethods.clearMergeFooterItems();
            nextTick(function () {
                if (value) {
                    tableMethods.setMergeFooterItems(value);
                }
            });
        });
        VXETable.hooks.forEach(function (options) {
            var setupTable = options.setupTable;
            if (setupTable) {
                var hookRest = setupTable($xetable);
                if (hookRest && XEUtils.isObject(hookRest)) {
                    Object.assign($xetable, hookRest);
                }
            }
        });
        tablePrivateMethods.preventEvent(null, 'created', { $table: $xetable });
        var resizeObserver;
        onActivated(function () {
            tableMethods.recalculate().then(function () { return tableMethods.refreshScroll(); });
            tablePrivateMethods.preventEvent(null, 'activated', { $table: $xetable });
        });
        onDeactivated(function () {
            internalData.isActivated = false;
            tablePrivateMethods.preventEvent(null, 'deactivated', { $table: $xetable });
        });
        onMounted(function () {
            nextTick(function () {
                var data = props.data, treeConfig = props.treeConfig, showOverflow = props.showOverflow;
                var scrollXStore = internalData.scrollXStore, scrollYStore = internalData.scrollYStore;
                var sYOpts = computeSYOpts.value;
                var editOpts = computeEditOpts.value;
                var treeOpts = computeTreeOpts.value;
                var radioOpts = computeRadioOpts.value;
                var checkboxOpts = computeCheckboxOpts.value;
                var expandOpts = computeExpandOpts.value;
                if (process.env.NODE_ENV === 'development') {
                    if (!props.rowId && (checkboxOpts.reserve || checkboxOpts.checkRowKeys || radioOpts.reserve || radioOpts.checkRowKey || expandOpts.expandRowKeys || treeOpts.expandRowKeys)) {
                        warnLog('vxe.error.reqProp', ['row-id']);
                    }
                    if (props.editConfig && (editOpts.showStatus || editOpts.showUpdateStatus || editOpts.showInsertStatus) && !props.keepSource) {
                        warnLog('vxe.error.reqProp', ['keep-source']);
                    }
                    if (treeConfig && treeOpts.line && (!props.rowKey || !showOverflow)) {
                        warnLog('vxe.error.reqProp', ['row-key | show-overflow']);
                    }
                    if (treeConfig && props.stripe) {
                        warnLog('vxe.error.noTree', ['stripe']);
                    }
                    if (props.showFooter && !props.footerMethod) {
                        warnLog('vxe.error.reqProp', ['footer-method']);
                    }
                    // ?????????????????????????????????????????????????????????????????????????????????
                    var exportConfig = props.exportConfig, importConfig = props.importConfig;
                    var exportOpts = computeExportOpts.value;
                    var importOpts = computeImportOpts.value;
                    if (importConfig && importOpts.types && !importOpts.importMethod && !XEUtils.includeArrays(VXETable.config.importTypes, importOpts.types)) {
                        warnLog('vxe.error.errProp', ["export-config.types=" + importOpts.types.join(','), importOpts.types.filter(function (type) { return XEUtils.includes(VXETable.config.importTypes, type); }).join(',') || VXETable.config.importTypes.join(',')]);
                    }
                    if (exportConfig && exportOpts.types && !exportOpts.exportMethod && !XEUtils.includeArrays(VXETable.config.exportTypes, exportOpts.types)) {
                        warnLog('vxe.error.errProp', ["export-config.types=" + exportOpts.types.join(','), exportOpts.types.filter(function (type) { return XEUtils.includes(VXETable.config.exportTypes, type); }).join(',') || VXETable.config.exportTypes.join(',')]);
                    }
                }
                if (process.env.NODE_ENV === 'development') {
                    var customOpts = computeCustomOpts.value;
                    var mouseOpts = computeMouseOpts.value;
                    if (!props.id && props.customConfig && (customOpts.storage === true || (customOpts.storage && customOpts.storage.resizable) || (customOpts.storage && customOpts.storage.visible))) {
                        errLog('vxe.error.reqProp', ['id']);
                    }
                    if (props.treeConfig && checkboxOpts.range) {
                        errLog('vxe.error.noTree', ['checkbox-config.range']);
                    }
                    if (!$xetable.handleUpdateCellAreas) {
                        if (props.clipConfig) {
                            warnLog('vxe.error.notProp', ['clip-config']);
                        }
                        if (props.fnrConfig) {
                            warnLog('vxe.error.notProp', ['fnr-config']);
                        }
                        if (mouseOpts.area) {
                            errLog('vxe.error.notProp', ['mouse-config.area']);
                            return;
                        }
                    }
                    if (mouseOpts.area && mouseOpts.selected) {
                        warnLog('vxe.error.errConflicts', ['mouse-config.area', 'mouse-config.selected']);
                    }
                    if (mouseOpts.area && checkboxOpts.range) {
                        warnLog('vxe.error.errConflicts', ['mouse-config.area', 'checkbox-config.range']);
                    }
                    if (props.treeConfig && mouseOpts.area) {
                        errLog('vxe.error.noTree', ['mouse-config.area']);
                    }
                }
                // ????????????????????????????????????
                if (process.env.NODE_ENV === 'development') {
                    if (props.editConfig && !$xetable.insert) {
                        errLog('vxe.error.reqModule', ['Edit']);
                    }
                    if (props.editRules && !$xetable.validate) {
                        errLog('vxe.error.reqModule', ['Validator']);
                    }
                    if ((checkboxOpts.range || props.keyboardConfig || props.mouseConfig) && !$xetable.triggerCellMousedownEvent) {
                        errLog('vxe.error.reqModule', ['Keyboard']);
                    }
                    if ((props.printConfig || props.importConfig || props.exportConfig) && !$xetable.exportData) {
                        errLog('vxe.error.reqModule', ['Export']);
                    }
                }
                Object.assign(scrollYStore, {
                    startIndex: 0,
                    endIndex: 0,
                    visibleSize: 0,
                    adaptive: sYOpts.adaptive !== false
                });
                Object.assign(scrollXStore, {
                    startIndex: 0,
                    endIndex: 0,
                    visibleSize: 0
                });
                loadTableData(data || []).then(function () {
                    if (data && data.length) {
                        internalData.inited = true;
                        internalData.initStatus = true;
                        handleLoadDefaults();
                        handleInitDefaults();
                    }
                    updateStyle();
                });
                if (props.autoResize) {
                    var el = refElem.value;
                    var parentEl = tablePrivateMethods.getParentElem();
                    resizeObserver = createResizeEvent(function () {
                        if (props.autoResize) {
                            tableMethods.recalculate(true);
                        }
                    });
                    if (el) {
                        resizeObserver.observe(el);
                    }
                    if (parentEl) {
                        resizeObserver.observe(parentEl);
                    }
                }
            });
            GlobalEvent.on($xetable, 'paste', handleGlobalPasteEvent);
            GlobalEvent.on($xetable, 'copy', handleGlobalCopyEvent);
            GlobalEvent.on($xetable, 'cut', handleGlobalCutEvent);
            GlobalEvent.on($xetable, 'mousedown', handleGlobalMousedownEvent);
            GlobalEvent.on($xetable, 'blur', handleGlobalBlurEvent);
            GlobalEvent.on($xetable, 'mousewheel', handleGlobalMousewheelEvent);
            GlobalEvent.on($xetable, 'keydown', handleGlobalKeydownEvent);
            GlobalEvent.on($xetable, 'resize', handleGlobalResizeEvent);
            if ($xetable.handleGlobalContextmenuEvent) {
                GlobalEvent.on($xetable, 'contextmenu', $xetable.handleGlobalContextmenuEvent);
            }
            tablePrivateMethods.preventEvent(null, 'mounted', { $table: $xetable });
        });
        onBeforeUnmount(function () {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
            tableMethods.closeFilter();
            if ($xetable.closeMenu) {
                $xetable.closeMenu();
            }
            tablePrivateMethods.preventEvent(null, 'beforeUnmount', { $table: $xetable });
        });
        onUnmounted(function () {
            GlobalEvent.off($xetable, 'paste');
            GlobalEvent.off($xetable, 'copy');
            GlobalEvent.off($xetable, 'cut');
            GlobalEvent.off($xetable, 'mousedown');
            GlobalEvent.off($xetable, 'blur');
            GlobalEvent.off($xetable, 'mousewheel');
            GlobalEvent.off($xetable, 'keydown');
            GlobalEvent.off($xetable, 'resize');
            GlobalEvent.off($xetable, 'contextmenu');
            tablePrivateMethods.preventEvent(null, 'unmounted', { $table: $xetable });
        });
        var renderVN = function () {
            var _a;
            var loading = props.loading, stripe = props.stripe, showHeader = props.showHeader, height = props.height, treeConfig = props.treeConfig, mouseConfig = props.mouseConfig, showFooter = props.showFooter, highlightCell = props.highlightCell, highlightHoverRow = props.highlightHoverRow, highlightHoverColumn = props.highlightHoverColumn, editConfig = props.editConfig;
            var isGroup = reactData.isGroup, overflowX = reactData.overflowX, overflowY = reactData.overflowY, scrollXLoad = reactData.scrollXLoad, scrollYLoad = reactData.scrollYLoad, scrollbarHeight = reactData.scrollbarHeight, tableData = reactData.tableData, tableColumn = reactData.tableColumn, tableGroupColumn = reactData.tableGroupColumn, footerTableData = reactData.footerTableData, initStore = reactData.initStore, columnStore = reactData.columnStore, filterStore = reactData.filterStore;
            var leftList = columnStore.leftList, rightList = columnStore.rightList;
            var tooltipOpts = computeTooltipOpts.value;
            var treeOpts = computeTreeOpts.value;
            var vSize = computeSize.value;
            var tableBorder = computeTableBorder.value;
            var mouseOpts = computeMouseOpts.value;
            var validOpts = computeValidOpts.value;
            var validTipOpts = computeValidTipOpts.value;
            var isMenu = computeIsMenu.value;
            return h('div', {
                ref: refElem,
                class: ['vxe-table', 'vxe-table--render-default', "tid_" + xID, "border--" + tableBorder, (_a = {},
                        _a["size--" + vSize] = vSize,
                        _a['vxe-editable'] = !!editConfig,
                        _a['cell--highlight'] = highlightCell,
                        _a['cell--selected'] = mouseConfig && mouseOpts.selected,
                        _a['cell--area'] = mouseConfig && mouseOpts.area,
                        _a['row--highlight'] = highlightHoverRow,
                        _a['column--highlight'] = highlightHoverColumn,
                        _a['is--header'] = showHeader,
                        _a['is--footer'] = showFooter,
                        _a['is--group'] = isGroup,
                        _a['is--tree-line'] = treeConfig && treeOpts.line,
                        _a['is--fixed-left'] = leftList.length,
                        _a['is--fixed-right'] = rightList.length,
                        _a['is--animat'] = !!props.animat,
                        _a['is--round'] = props.round,
                        _a['is--stripe'] = !treeConfig && stripe,
                        _a['is--loading'] = loading,
                        _a['is--empty'] = !loading && !tableData.length,
                        _a['is--scroll-y'] = overflowY,
                        _a['is--scroll-x'] = overflowX,
                        _a['is--virtual-x'] = scrollXLoad,
                        _a['is--virtual-y'] = scrollYLoad,
                        _a)],
                onKeydown: keydownEvent
            }, [
                /**
                 * ?????????
                 */
                h('div', {
                    class: 'vxe-table-slots'
                }, slots.default ? slots.default({}) : []),
                h('div', {
                    class: 'vxe-table--render-wrapper'
                }, [
                    h('div', {
                        class: 'vxe-table--main-wrapper'
                    }, [
                        /**
                         * ??????
                         */
                        showHeader ? h(resolveComponent('vxe-table-header'), {
                            ref: refTableHeader,
                            tableData: tableData,
                            tableColumn: tableColumn,
                            tableGroupColumn: tableGroupColumn
                        }) : createCommentVNode(),
                        /**
                         * ??????
                         */
                        h(TableBodyComponent, {
                            ref: refTableBody,
                            tableData: tableData,
                            tableColumn: tableColumn
                        }),
                        /**
                         * ??????
                         */
                        showFooter ? h(resolveComponent('vxe-table-footer'), {
                            ref: refTableFooter,
                            footerTableData: footerTableData,
                            tableColumn: tableColumn
                        }) : createCommentVNode()
                    ]),
                    h('div', {
                        class: 'vxe-table--fixed-wrapper'
                    }, [
                        /**
                         * ??????????????????
                         */
                        leftList && leftList.length && overflowX ? renderFixed('left') : createCommentVNode(),
                        /**
                         * ??????????????????
                         */
                        rightList && rightList.length && overflowX ? renderFixed('right') : createCommentVNode()
                    ])
                ]),
                /**
                 * ?????????
                 */
                h('div', {
                    ref: refEmptyPlaceholder,
                    class: 'vxe-table--empty-placeholder'
                }, [
                    h('div', {
                        class: 'vxe-table--empty-content'
                    }, renderEmptyContenet())
                ]),
                /**
                 * ?????????
                 */
                h('div', {
                    class: 'vxe-table--border-line'
                }),
                /**
                 * ?????????
                 */
                h('div', {
                    ref: refCellResizeBar,
                    class: 'vxe-table--resizable-bar',
                    style: overflowX ? {
                        'padding-bottom': scrollbarHeight + "px"
                    } : null
                }),
                /**
                 * ?????????
                 */
                h('div', {
                    class: ['vxe-table--loading vxe-loading', {
                            'is--visible': loading
                        }]
                }, [
                    h('div', {
                        class: 'vxe-loading--spinner'
                    })
                ]),
                /**
                 * ??????
                 */
                initStore.filter ? h(resolveComponent('vxe-table-filter'), {
                    ref: refTableFilter,
                    filterStore: filterStore
                }) : createCommentVNode(),
                /**
                 * ??????
                 */
                initStore.import && props.importConfig ? h(resolveComponent('vxe-import-panel'), {
                    defaultOptions: reactData.importParams,
                    storeData: reactData.importStore
                }) : createCommentVNode(),
                /**
                 * ??????/??????
                 */
                initStore.export && (props.exportConfig || props.printConfig) ? h(resolveComponent('vxe-export-panel'), {
                    defaultOptions: reactData.exportParams,
                    storeData: reactData.exportStore
                }) : createCommentVNode(),
                /**
                 * ????????????
                 */
                isMenu ? h(resolveComponent('vxe-table-context-menu'), {
                    ref: refTableMenu
                }) : createCommentVNode(),
                /**
                 * ????????????
                 */
                hasUseTooltip ? h(resolveComponent('vxe-tooltip'), {
                    ref: refCommTooltip,
                    isArrow: false,
                    enterable: false
                }) : createCommentVNode(),
                /**
                 * ????????????
                 */
                hasUseTooltip && props.editRules && validOpts.showMessage && (validOpts.message === 'default' ? !height : validOpts.message === 'tooltip') ? h(resolveComponent('vxe-tooltip'), __assign({ ref: refValidTooltip, class: 'vxe-table--valid-error' }, (validOpts.message === 'tooltip' || tableData.length === 1 ? validTipOpts : {}))) : createCommentVNode(),
                /**
                 * ????????????
                 */
                hasUseTooltip ? h(resolveComponent('vxe-tooltip'), __assign({ ref: refTooltip }, tooltipOpts)) : createCommentVNode()
            ]);
        };
        $xetable.renderVN = renderVN;
        provide('xecolgroup', null);
        provide('$xetable', $xetable);
        return $xetable;
    },
    render: function () {
        return this.renderVN();
    }
});
