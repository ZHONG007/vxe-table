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
import { createCommentVNode, defineComponent, h, ref, inject, nextTick, onBeforeUnmount, onMounted } from 'vue';
import XEUtils from 'xe-utils';
import GlobalConfig from '../../v-x-e-table/src/conf';
import { VXETable } from '../../v-x-e-table';
import { mergeBodyMethod, getRowid, getPropClass, removeScrollListener, restoreScrollListener } from './util';
import { browse, updateCellTitle } from '../../tools/dom';
import { isEnableConf } from '../../tools/utils';
var renderType = 'body';
var lineOffsetSizes = {
    mini: 3,
    small: 2,
    medium: 1
};
export default defineComponent({
    name: 'VxeTableBody',
    props: {
        tableData: Array,
        tableColumn: Array,
        fixedColumn: Array,
        fixedType: { type: String, default: null }
    },
    setup: function (props) {
        var $xetable = inject('$xetable', {});
        var xesize = inject('xesize', null);
        var xID = $xetable.xID, tableProps = $xetable.props, tableContext = $xetable.context, tableReactData = $xetable.reactData, tableInternalData = $xetable.internalData;
        var _a = $xetable.getRefMaps(), refTableHeader = _a.refTableHeader, refTableBody = _a.refTableBody, refTableFooter = _a.refTableFooter, refTableLeftBody = _a.refTableLeftBody, refTableRightBody = _a.refTableRightBody, refValidTooltip = _a.refValidTooltip;
        var _b = $xetable.getComputeMaps(), computeEditOpts = _b.computeEditOpts, computeMouseOpts = _b.computeMouseOpts, computeSYOpts = _b.computeSYOpts, computeEmptyOpts = _b.computeEmptyOpts, computeKeyboardOpts = _b.computeKeyboardOpts, computeTooltipOpts = _b.computeTooltipOpts, computeRadioOpts = _b.computeRadioOpts, computeTreeOpts = _b.computeTreeOpts, computeCheckboxOpts = _b.computeCheckboxOpts, computeValidOpts = _b.computeValidOpts;
        var refElem = ref();
        var refBodyTable = ref();
        var refBodyColgroup = ref();
        var refBodyTBody = ref();
        var refBodyXSpace = ref();
        var refBodyYSpace = ref();
        var refBodyEmptyBlock = ref();
        var getOffsetSize = function () {
            if (xesize) {
                var vSize = xesize.value;
                if (vSize) {
                    return lineOffsetSizes[vSize] || 0;
                }
            }
            return 0;
        };
        var countTreeExpand = function (prevRow, params) {
            var treeOpts = computeTreeOpts.value;
            var rowChildren = prevRow[treeOpts.children];
            var count = 1;
            if ($xetable.isTreeExpandByRow(prevRow)) {
                for (var index = 0; index < rowChildren.length; index++) {
                    count += countTreeExpand(rowChildren[index], params);
                }
            }
            return count;
        };
        var calcTreeLine = function (params, items) {
            var $rowIndex = params.$rowIndex;
            var expandSize = 1;
            if ($rowIndex) {
                expandSize = countTreeExpand(items[$rowIndex - 1], params);
            }
            return tableReactData.rowHeight * expandSize - ($rowIndex ? 1 : (12 - getOffsetSize()));
        };
        // ???????????????????????????????????????
        var isOperateMouse = function () {
            var delayHover = tableProps.delayHover;
            var lastScrollTime = tableInternalData.lastScrollTime, _isResize = tableInternalData._isResize;
            return _isResize || (lastScrollTime && Date.now() < lastScrollTime + delayHover);
        };
        var renderLine = function (rowLevel, items, params) {
            var column = params.column;
            var treeConfig = tableProps.treeConfig;
            var treeOpts = computeTreeOpts.value;
            var slots = column.slots, treeNode = column.treeNode;
            if (slots && slots.line) {
                return $xetable.callSlot(slots.line, params);
            }
            if (treeConfig && treeNode && treeOpts.line) {
                return [
                    h('div', {
                        class: 'vxe-tree--line-wrapper'
                    }, [
                        h('div', {
                            class: 'vxe-tree--line',
                            style: {
                                height: calcTreeLine(params, items) + "px",
                                left: (rowLevel * treeOpts.indent) + (rowLevel ? 2 - getOffsetSize() : 0) + 16 + "px"
                            }
                        })
                    ])
                ];
            }
            return [];
        };
        /**
         * ?????????
         */
        var renderColumn = function ($seq, seq, rowid, fixedType, rowLevel, row, rowIndex, $rowIndex, _rowIndex, column, $columnIndex, columns, items) {
            var _a;
            var columnKey = tableProps.columnKey, height = tableProps.height, allColumnOverflow = tableProps.showOverflow, cellClassName = tableProps.cellClassName, cellStyle = tableProps.cellStyle, allAlign = tableProps.align, spanMethod = tableProps.spanMethod, mouseConfig = tableProps.mouseConfig, editConfig = tableProps.editConfig, editRules = tableProps.editRules, tooltipConfig = tableProps.tooltipConfig;
            var tableData = tableReactData.tableData, overflowX = tableReactData.overflowX, scrollXLoad = tableReactData.scrollXLoad, scrollYLoad = tableReactData.scrollYLoad, currentColumn = tableReactData.currentColumn, mergeList = tableReactData.mergeList, editStore = tableReactData.editStore, validStore = tableReactData.validStore, isAllOverflow = tableReactData.isAllOverflow;
            var afterFullData = tableInternalData.afterFullData;
            var validOpts = computeValidOpts.value;
            var checkboxOpts = computeCheckboxOpts.value;
            var editOpts = computeEditOpts.value;
            var tooltipOpts = computeTooltipOpts.value;
            var sYOpts = computeSYOpts.value;
            var type = column.type, cellRender = column.cellRender, editRender = column.editRender, align = column.align, showOverflow = column.showOverflow, className = column.className, treeNode = column.treeNode;
            var actived = editStore.actived;
            var rHeight = sYOpts.rHeight;
            var showAllTip = tooltipOpts.showAll;
            var columnIndex = $xetable.getColumnIndex(column);
            var _columnIndex = $xetable.getVTColumnIndex(column);
            var isEdit = isEnableConf(editRender);
            var fixedHiddenColumn = fixedType ? column.fixed !== fixedType : column.fixed && overflowX;
            var cellOverflow = (XEUtils.isUndefined(showOverflow) || XEUtils.isNull(showOverflow)) ? allColumnOverflow : showOverflow;
            var showEllipsis = cellOverflow === 'ellipsis';
            var showTitle = cellOverflow === 'title';
            var showTooltip = cellOverflow === true || cellOverflow === 'tooltip';
            var hasEllipsis = showTitle || showTooltip || showEllipsis;
            var isDirty;
            var tdOns = {};
            var cellAlign = align || allAlign;
            var hasValidError = validStore.row === row && validStore.column === column;
            var showValidTip = editRules && validOpts.showMessage && (validOpts.message === 'default' ? (height || tableData.length > 1) : validOpts.message === 'inline');
            var attrs = { colid: column.id };
            var params = { $table: $xetable, $seq: $seq, seq: seq, rowid: rowid, row: row, rowIndex: rowIndex, $rowIndex: $rowIndex, _rowIndex: _rowIndex, column: column, columnIndex: columnIndex, $columnIndex: $columnIndex, _columnIndex: _columnIndex, fixed: fixedType, type: renderType, isHidden: fixedHiddenColumn, level: rowLevel, visibleData: afterFullData, data: tableData, items: items };
            // ?????????????????????????????????
            if ((scrollXLoad || scrollYLoad) && !hasEllipsis) {
                showEllipsis = hasEllipsis = true;
            }
            // hover ????????????
            if (showTitle || showTooltip || showAllTip || tooltipConfig) {
                tdOns.onMouseenter = function (evnt) {
                    if (isOperateMouse()) {
                        return;
                    }
                    if (showTitle) {
                        updateCellTitle(evnt.currentTarget, column);
                    }
                    else if (showTooltip || showAllTip) {
                        // ????????????????????? tooltip
                        $xetable.triggerBodyTooltipEvent(evnt, params);
                    }
                    $xetable.dispatchEvent('cell-mouseenter', Object.assign({ cell: evnt.currentTarget }, params), evnt);
                };
            }
            // hover ????????????
            if (showTooltip || showAllTip || tooltipConfig) {
                tdOns.onMouseleave = function (evnt) {
                    if (isOperateMouse()) {
                        return;
                    }
                    if (showTooltip || showAllTip) {
                        $xetable.handleTargetLeaveEvent(evnt);
                    }
                    $xetable.dispatchEvent('cell-mouseleave', Object.assign({ cell: evnt.currentTarget }, params), evnt);
                };
            }
            // ??????????????????
            if (checkboxOpts.range || mouseConfig) {
                tdOns.onMousedown = function (evnt) {
                    $xetable.triggerCellMousedownEvent(evnt, params);
                };
            }
            // ??????????????????
            tdOns.onClick = function (evnt) {
                $xetable.triggerCellClickEvent(evnt, params);
            };
            // ??????????????????
            tdOns.onDblclick = function (evnt) {
                $xetable.triggerCellDblclickEvent(evnt, params);
            };
            // ???????????????
            if (mergeList.length) {
                var spanRest = mergeBodyMethod(mergeList, _rowIndex, _columnIndex);
                if (spanRest) {
                    var rowspan = spanRest.rowspan, colspan = spanRest.colspan;
                    if (!rowspan || !colspan) {
                        return null;
                    }
                    if (rowspan > 1) {
                        attrs.rowspan = rowspan;
                    }
                    if (colspan > 1) {
                        attrs.colspan = colspan;
                    }
                }
            }
            else if (spanMethod) {
                // ?????????????????????????????????
                var _b = spanMethod(params) || {}, _c = _b.rowspan, rowspan = _c === void 0 ? 1 : _c, _d = _b.colspan, colspan = _d === void 0 ? 1 : _d;
                if (!rowspan || !colspan) {
                    return null;
                }
                if (rowspan > 1) {
                    attrs.rowspan = rowspan;
                }
                if (colspan > 1) {
                    attrs.colspan = colspan;
                }
            }
            // ???????????????????????????
            if (fixedHiddenColumn && mergeList) {
                if (attrs.colspan > 1 || attrs.rowspan > 1) {
                    fixedHiddenColumn = false;
                }
            }
            // ?????????????????????????????????
            if (!fixedHiddenColumn && editConfig && (editRender || cellRender) && (editOpts.showStatus || editOpts.showUpdateStatus)) {
                isDirty = $xetable.isUpdateByRow(row, column.property);
            }
            var tdVNs = [];
            if (fixedHiddenColumn && (allColumnOverflow ? isAllOverflow : allColumnOverflow)) {
                tdVNs.push(h('div', {
                    class: ['vxe-cell', {
                            'c--title': showTitle,
                            'c--tooltip': showTooltip,
                            'c--ellipsis': showEllipsis
                        }],
                    style: {
                        maxHeight: hasEllipsis && rHeight ? rHeight + "px" : ''
                    }
                }));
            }
            else {
                // ???????????????
                tdVNs.push.apply(tdVNs, __spreadArray(__spreadArray([], renderLine(rowLevel, items, params)), [h('div', {
                        class: ['vxe-cell', {
                                'c--title': showTitle,
                                'c--tooltip': showTooltip,
                                'c--ellipsis': showEllipsis
                            }],
                        style: {
                            maxHeight: hasEllipsis && rHeight ? rHeight + "px" : ''
                        },
                        title: showTitle ? $xetable.getCellLabel(row, column) : null
                    }, column.renderCell(params))]));
                if (showValidTip && hasValidError) {
                    tdVNs.push(h('div', {
                        class: 'vxe-cell--valid',
                        style: validStore.rule && validStore.rule.maxWidth ? {
                            width: validStore.rule.maxWidth + "px"
                        } : null
                    }, [
                        h('span', {
                            class: 'vxe-cell--valid-msg'
                        }, validStore.content)
                    ]));
                }
            }
            return h('td', __assign(__assign(__assign({ class: ['vxe-body--column', column.id, (_a = {},
                        _a["col--" + cellAlign] = cellAlign,
                        _a["col--" + type] = type,
                        _a['col--last'] = $columnIndex === columns.length - 1,
                        _a['col--tree-node'] = treeNode,
                        _a['col--edit'] = isEdit,
                        _a['col--ellipsis'] = hasEllipsis,
                        _a['fixed--hidden'] = fixedHiddenColumn,
                        _a['col--dirty'] = isDirty,
                        _a['col--actived'] = editConfig && isEdit && (actived.row === row && (actived.column === column || editOpts.mode === 'row')),
                        _a['col--valid-error'] = hasValidError,
                        _a['col--current'] = currentColumn === column,
                        _a), getPropClass(className, params), getPropClass(cellClassName, params)], key: columnKey ? column.id : $columnIndex }, attrs), { style: Object.assign({
                    height: hasEllipsis && rHeight ? rHeight + "px" : ''
                }, cellStyle ? (XEUtils.isFunction(cellStyle) ? cellStyle(params) : cellStyle) : null) }), tdOns), tdVNs);
        };
        var renderRows = function ($seq, rowLevel, fixedType, tableData, tableColumn) {
            var stripe = tableProps.stripe, rowKey = tableProps.rowKey, highlightHoverRow = tableProps.highlightHoverRow, rowClassName = tableProps.rowClassName, rowStyle = tableProps.rowStyle, allColumnOverflow = tableProps.showOverflow, editConfig = tableProps.editConfig, treeConfig = tableProps.treeConfig;
            var hasFixedColumn = tableReactData.hasFixedColumn, treeExpandeds = tableReactData.treeExpandeds, scrollYLoad = tableReactData.scrollYLoad, editStore = tableReactData.editStore, rowExpandeds = tableReactData.rowExpandeds, expandColumn = tableReactData.expandColumn, selectRow = tableReactData.selectRow;
            var scrollYStore = tableInternalData.scrollYStore;
            var checkboxOpts = computeCheckboxOpts.value;
            var radioOpts = computeRadioOpts.value;
            var treeOpts = computeTreeOpts.value;
            var editOpts = computeEditOpts.value;
            var rows = [];
            tableData.forEach(function (row, $rowIndex) {
                var trOn = {};
                var rowIndex = $rowIndex;
                var seq = rowIndex + 1;
                if (scrollYLoad) {
                    seq += scrollYStore.startIndex;
                }
                var _rowIndex = $xetable.getVTRowIndex(row);
                // ????????????????????? rowIndex ????????????????????? data ??????
                rowIndex = $xetable.getRowIndex(row);
                // ????????????
                if (highlightHoverRow) {
                    trOn.onMouseenter = function (evnt) {
                        if (isOperateMouse()) {
                            return;
                        }
                        $xetable.triggerHoverEvent(evnt, { row: row, rowIndex: rowIndex });
                    };
                    trOn.onMouseleave = function () {
                        if (isOperateMouse()) {
                            return;
                        }
                        $xetable.clearHoverRow();
                    };
                }
                var rowid = getRowid($xetable, row);
                var params = { $table: $xetable, $seq: $seq, seq: seq, rowid: rowid, fixed: fixedType, type: renderType, level: rowLevel, row: row, rowIndex: rowIndex, $rowIndex: $rowIndex, _rowIndex: _rowIndex };
                var isNewRow = false;
                if (editConfig) {
                    isNewRow = $xetable.findRowIndexOf(editStore.insertList, row) > -1;
                }
                rows.push(h('tr', __assign({ class: ['vxe-body--row', {
                            'row--stripe': stripe && ($xetable.getVTRowIndex(row) + 1) % 2 === 0,
                            'is--new': isNewRow,
                            'row--new': isNewRow && (editOpts.showStatus || editOpts.showInsertStatus),
                            'row--radio': radioOpts.highlight && selectRow === row,
                            'row--checked': checkboxOpts.highlight && $xetable.isCheckedByCheckboxRow(row)
                        }, rowClassName ? (XEUtils.isFunction(rowClassName) ? rowClassName(params) : rowClassName) : ''], rowid: rowid, style: rowStyle ? (XEUtils.isFunction(rowStyle) ? rowStyle(params) : rowStyle) : null, key: rowKey || treeConfig ? rowid : $rowIndex }, trOn), tableColumn.map(function (column, $columnIndex) {
                    return renderColumn($seq, seq, rowid, fixedType, rowLevel, row, rowIndex, $rowIndex, _rowIndex, column, $columnIndex, tableColumn, tableData);
                })));
                // ?????????????????????
                if (expandColumn && rowExpandeds.length && $xetable.findRowIndexOf(rowExpandeds, row) > -1) {
                    var cellStyle = void 0;
                    if (treeConfig) {
                        cellStyle = {
                            paddingLeft: (rowLevel * treeOpts.indent) + 30 + "px"
                        };
                    }
                    var showOverflow = expandColumn.showOverflow;
                    var hasEllipsis = (XEUtils.isUndefined(showOverflow) || XEUtils.isNull(showOverflow)) ? allColumnOverflow : showOverflow;
                    var expandParams = { $table: $xetable, $seq: $seq, seq: seq, column: expandColumn, fixed: fixedType, type: renderType, level: rowLevel, row: row, rowIndex: rowIndex, $rowIndex: $rowIndex, _rowIndex: _rowIndex };
                    rows.push(h('tr', __assign({ class: 'vxe-body--expanded-row', key: "expand_" + rowid, style: rowStyle ? (XEUtils.isFunction(rowStyle) ? rowStyle(expandParams) : rowStyle) : null }, trOn), [
                        h('td', {
                            class: ['vxe-body--expanded-column', {
                                    'fixed--hidden': fixedType && !hasFixedColumn,
                                    'col--ellipsis': hasEllipsis
                                }],
                            colspan: tableColumn.length
                        }, [
                            h('div', {
                                class: 'vxe-body--expanded-cell',
                                style: cellStyle
                            }, [
                                expandColumn.renderData(expandParams)
                            ])
                        ])
                    ]));
                }
                // ?????????????????????
                if (treeConfig && treeExpandeds.length) {
                    var rowChildren = row[treeOpts.children];
                    if (rowChildren && rowChildren.length && $xetable.findRowIndexOf(treeExpandeds, row) > -1) {
                        rows.push.apply(rows, renderRows($seq ? $seq + "." + seq : "" + seq, rowLevel + 1, fixedType, rowChildren, tableColumn));
                    }
                }
            });
            return rows;
        };
        /**
         * ???????????????
         */
        var scrollProcessTimeout;
        var syncBodyScroll = function (scrollTop, elem1, elem2) {
            if (elem1 || elem2) {
                if (elem1) {
                    removeScrollListener(elem1);
                    elem1.scrollTop = scrollTop;
                }
                if (elem2) {
                    removeScrollListener(elem2);
                    elem2.scrollTop = scrollTop;
                }
                clearTimeout(scrollProcessTimeout);
                scrollProcessTimeout = setTimeout(function () {
                    restoreScrollListener(elem1);
                    restoreScrollListener(elem2);
                }, 300);
            }
        };
        /**
         * ????????????
         * ??????????????????????????????????????????????????????
         * ??????????????????????????????????????????????????????
         */
        var scrollEvent = function (evnt) {
            var fixedType = props.fixedType;
            var highlightHoverRow = tableProps.highlightHoverRow;
            var scrollXLoad = tableReactData.scrollXLoad, scrollYLoad = tableReactData.scrollYLoad;
            var elemStore = tableInternalData.elemStore, lastScrollTop = tableInternalData.lastScrollTop, lastScrollLeft = tableInternalData.lastScrollLeft;
            var tableHeader = refTableHeader.value;
            var tableBody = refTableBody.value;
            var tableFooter = refTableFooter.value;
            var leftBody = refTableLeftBody.value;
            var rightBody = refTableRightBody.value;
            var validTip = refValidTooltip.value;
            var scrollBodyElem = refElem.value;
            var headerElem = tableHeader ? tableHeader.$el : null;
            var footerElem = tableFooter ? tableFooter.$el : null;
            var bodyElem = tableBody.$el;
            var leftElem = leftBody ? leftBody.$el : null;
            var rightElem = rightBody ? rightBody.$el : null;
            var bodyYElem = elemStore['main-body-ySpace'];
            var bodyXElem = elemStore['main-body-xSpace'];
            var bodyHeight = bodyYElem ? bodyYElem.clientHeight : 0;
            var bodyWidth = bodyXElem ? bodyXElem.clientWidth : 0;
            var scrollTop = scrollBodyElem.scrollTop;
            var scrollLeft = bodyElem.scrollLeft;
            var isRollX = scrollLeft !== lastScrollLeft;
            var isRollY = scrollTop !== lastScrollTop;
            tableInternalData.lastScrollTop = scrollTop;
            tableInternalData.lastScrollLeft = scrollLeft;
            tableInternalData.lastScrollTime = Date.now();
            if (highlightHoverRow) {
                $xetable.clearHoverRow();
            }
            if (leftElem && fixedType === 'left') {
                scrollTop = leftElem.scrollTop;
                syncBodyScroll(scrollTop, bodyElem, rightElem);
            }
            else if (rightElem && fixedType === 'right') {
                scrollTop = rightElem.scrollTop;
                syncBodyScroll(scrollTop, bodyElem, leftElem);
            }
            else {
                if (isRollX) {
                    if (headerElem) {
                        headerElem.scrollLeft = bodyElem.scrollLeft;
                    }
                    if (footerElem) {
                        footerElem.scrollLeft = bodyElem.scrollLeft;
                    }
                }
                if (leftElem || rightElem) {
                    $xetable.checkScrolling();
                    if (isRollY) {
                        syncBodyScroll(scrollTop, leftElem, rightElem);
                    }
                }
            }
            if (scrollXLoad && isRollX) {
                $xetable.triggerScrollXEvent(evnt);
            }
            if (scrollYLoad && isRollY) {
                $xetable.triggerScrollYEvent(evnt);
            }
            if (isRollX && validTip && validTip.reactData.visible) {
                validTip.updatePlacement();
            }
            $xetable.dispatchEvent('scroll', { type: renderType, fixed: fixedType, scrollTop: scrollTop, scrollLeft: scrollLeft, bodyHeight: bodyHeight, bodyWidth: bodyWidth, isX: isRollX, isY: isRollY }, evnt);
        };
        var wheelTime;
        var wheelYSize = 0;
        var wheelYInterval = 0;
        var wheelYTotal = 0;
        var isPrevWheelTop = false;
        var handleWheel = function (evnt, isTopWheel, deltaTop, isRollX, isRollY) {
            var elemStore = tableInternalData.elemStore;
            var tableBody = refTableBody.value;
            var leftBody = refTableLeftBody.value;
            var rightBody = refTableRightBody.value;
            var leftElem = leftBody ? leftBody.$el : null;
            var rightElem = rightBody ? rightBody.$el : null;
            var bodyElem = tableBody.$el;
            var bodyYElem = elemStore['main-body-ySpace'];
            var bodyXElem = elemStore['main-body-xSpace'];
            var bodyHeight = bodyYElem ? bodyYElem.clientHeight : 0;
            var bodyWidth = bodyXElem ? bodyXElem.clientWidth : 0;
            var remainSize = isPrevWheelTop === isTopWheel ? Math.max(0, wheelYSize - wheelYTotal) : 0;
            isPrevWheelTop = isTopWheel;
            wheelYSize = Math.abs(isTopWheel ? deltaTop - remainSize : deltaTop + remainSize);
            wheelYInterval = 0;
            wheelYTotal = 0;
            clearTimeout(wheelTime);
            var handleSmooth = function () {
                if (wheelYTotal < wheelYSize) {
                    var fixedType = props.fixedType;
                    wheelYInterval = Math.max(5, Math.floor(wheelYInterval * 1.5));
                    wheelYTotal = wheelYTotal + wheelYInterval;
                    if (wheelYTotal > wheelYSize) {
                        wheelYInterval = wheelYInterval - (wheelYTotal - wheelYSize);
                    }
                    var scrollTop = bodyElem.scrollTop, clientHeight = bodyElem.clientHeight, scrollHeight = bodyElem.scrollHeight;
                    var targerTop = scrollTop + (wheelYInterval * (isTopWheel ? -1 : 1));
                    bodyElem.scrollTop = targerTop;
                    if (leftElem) {
                        leftElem.scrollTop = targerTop;
                    }
                    if (rightElem) {
                        rightElem.scrollTop = targerTop;
                    }
                    if (isTopWheel ? targerTop < scrollHeight - clientHeight : targerTop >= 0) {
                        wheelTime = setTimeout(handleSmooth, 10);
                    }
                    $xetable.dispatchEvent('scroll', { type: renderType, fixed: fixedType, scrollTop: bodyElem.scrollTop, scrollLeft: bodyElem.scrollLeft, bodyHeight: bodyHeight, bodyWidth: bodyWidth, isX: isRollX, isY: isRollY }, evnt);
                }
            };
            handleSmooth();
        };
        /**
         * ????????????
         */
        var wheelEvent = function (evnt) {
            var deltaY = evnt.deltaY, deltaX = evnt.deltaX;
            var highlightHoverRow = tableProps.highlightHoverRow;
            var scrollYLoad = tableReactData.scrollYLoad;
            var lastScrollTop = tableInternalData.lastScrollTop, lastScrollLeft = tableInternalData.lastScrollLeft;
            var tableBody = refTableBody.value;
            var scrollBodyElem = refElem.value;
            var bodyElem = tableBody.$el;
            var deltaTop = browse.firefox ? deltaY * 40 : deltaY;
            var deltaLeft = browse.firefox ? deltaX * 40 : deltaX;
            var isTopWheel = deltaTop < 0;
            // ???????????????????????????????????????????????????????????????
            if (isTopWheel ? scrollBodyElem.scrollTop <= 0 : scrollBodyElem.scrollTop >= scrollBodyElem.scrollHeight - scrollBodyElem.clientHeight) {
                return;
            }
            var scrollTop = scrollBodyElem.scrollTop + deltaTop;
            var scrollLeft = bodyElem.scrollLeft + deltaLeft;
            var isRollX = scrollLeft !== lastScrollLeft;
            var isRollY = scrollTop !== lastScrollTop;
            // ??????????????????????????????
            if (isRollY) {
                evnt.preventDefault();
                tableInternalData.lastScrollTop = scrollTop;
                tableInternalData.lastScrollLeft = scrollLeft;
                tableInternalData.lastScrollTime = Date.now();
                if (highlightHoverRow) {
                    $xetable.clearHoverRow();
                }
                handleWheel(evnt, isTopWheel, deltaTop, isRollX, isRollY);
                if (scrollYLoad) {
                    $xetable.triggerScrollYEvent(evnt);
                }
            }
        };
        onMounted(function () {
            nextTick(function () {
                var fixedType = props.fixedType;
                var elemStore = tableInternalData.elemStore;
                var prefix = (fixedType || 'main') + "-body-";
                var el = refElem.value;
                elemStore[prefix + "wrapper"] = refElem.value;
                elemStore[prefix + "table"] = refBodyTable.value;
                elemStore[prefix + "colgroup"] = refBodyColgroup.value;
                elemStore[prefix + "list"] = refBodyTBody.value;
                elemStore[prefix + "xSpace"] = refBodyXSpace.value;
                elemStore[prefix + "ySpace"] = refBodyYSpace.value;
                elemStore[prefix + "emptyBlock"] = refBodyEmptyBlock.value;
                el.onscroll = scrollEvent;
                el._onscroll = scrollEvent;
            });
        });
        onBeforeUnmount(function () {
            var el = refElem.value;
            clearTimeout(wheelTime);
            el._onscroll = null;
            el.onscroll = null;
        });
        var renderVN = function () {
            var fixedColumn = props.fixedColumn, fixedType = props.fixedType, tableColumn = props.tableColumn;
            var keyboardConfig = tableProps.keyboardConfig, allColumnOverflow = tableProps.showOverflow, spanMethod = tableProps.spanMethod, mouseConfig = tableProps.mouseConfig;
            var tableData = tableReactData.tableData, mergeList = tableReactData.mergeList, scrollXLoad = tableReactData.scrollXLoad, scrollYLoad = tableReactData.scrollYLoad, isAllOverflow = tableReactData.isAllOverflow;
            var visibleColumn = tableInternalData.visibleColumn;
            var slots = tableContext.slots;
            var sYOpts = computeSYOpts.value;
            var emptyOpts = computeEmptyOpts.value;
            var keyboardOpts = computeKeyboardOpts.value;
            var mouseOpts = computeMouseOpts.value;
            // const isMergeLeftFixedExceeded = computeIsMergeLeftFixedExceeded.value
            // const isMergeRightFixedExceeded = computeIsMergeRightFixedExceeded.value
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
            var emptyContent;
            if (slots.empty) {
                emptyContent = $xetable.callSlot(slots.empty, { $table: $xetable });
            }
            else {
                var compConf = emptyOpts.name ? VXETable.renderer.get(emptyOpts.name) : null;
                var renderEmpty = compConf ? compConf.renderEmpty : null;
                if (renderEmpty) {
                    emptyContent = renderEmpty(emptyOpts, { $table: $xetable });
                }
                else {
                    emptyContent = tableProps.emptyText || GlobalConfig.i18n('vxe.table.emptyText');
                }
            }
            return h('div', __assign({ ref: refElem, class: ['vxe-table--body-wrapper', fixedType ? "fixed-" + fixedType + "--wrapper" : 'body--wrapper'], xid: xID }, (scrollYLoad && sYOpts.mode === 'wheel' ? { onWheel: wheelEvent } : {})), [
                fixedType ? createCommentVNode() : h('div', {
                    ref: refBodyXSpace,
                    class: 'vxe-body--x-space'
                }),
                h('div', {
                    ref: refBodyYSpace,
                    class: 'vxe-body--y-space'
                }),
                h('table', {
                    ref: refBodyTable,
                    class: 'vxe-table--body',
                    xid: xID,
                    cellspacing: 0,
                    cellpadding: 0,
                    border: 0
                }, [
                    /**
                     * ??????
                     */
                    h('colgroup', {
                        ref: refBodyColgroup
                    }, tableColumn.map(function (column, $columnIndex) {
                        return h('col', {
                            name: column.id,
                            key: $columnIndex
                        });
                    })),
                    /**
                     * ??????
                     */
                    h('tbody', {
                        ref: refBodyTBody
                    }, renderRows('', 0, fixedType, tableData, tableColumn))
                ]),
                h('div', {
                    class: 'vxe-table--checkbox-range'
                }),
                mouseConfig && mouseOpts.area ? h('div', {
                    class: 'vxe-table--cell-area'
                }, [
                    h('span', {
                        class: 'vxe-table--cell-main-area'
                    }, mouseOpts.extension ? [
                        h('span', {
                            class: 'vxe-table--cell-main-area-btn',
                            onMousedown: function (evnt) {
                                $xetable.triggerCellExtendMousedownEvent(evnt, { $table: $xetable, fixed: fixedType, type: renderType });
                            }
                        })
                    ] : []),
                    h('span', {
                        class: 'vxe-table--cell-copy-area'
                    }),
                    h('span', {
                        class: 'vxe-table--cell-extend-area'
                    }),
                    h('span', {
                        class: 'vxe-table--cell-multi-area'
                    }),
                    h('span', {
                        class: 'vxe-table--cell-active-area'
                    })
                ]) : null,
                !fixedType ? h('div', {
                    class: 'vxe-table--empty-block',
                    ref: refBodyEmptyBlock
                }, [
                    h('div', {
                        class: 'vxe-table--empty-content'
                    }, emptyContent)
                ]) : null
            ]);
        };
        return renderVN;
    }
});
