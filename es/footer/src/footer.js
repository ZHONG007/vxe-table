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
import { createCommentVNode, defineComponent, h, ref, inject, nextTick } from 'vue';
import XEUtils from 'xe-utils';
import { getPropClass } from '../../table/src/util';
import { updateCellTitle } from '../../tools/dom';
var renderType = 'footer';
function mergeFooterMethod(mergeFooterList, _rowIndex, _columnIndex) {
    for (var mIndex = 0; mIndex < mergeFooterList.length; mIndex++) {
        var _a = mergeFooterList[mIndex], mergeRowIndex = _a.row, mergeColIndex = _a.col, mergeRowspan = _a.rowspan, mergeColspan = _a.colspan;
        if (mergeColIndex > -1 && mergeRowIndex > -1 && mergeRowspan && mergeColspan) {
            if (mergeRowIndex === _rowIndex && mergeColIndex === _columnIndex) {
                return { rowspan: mergeRowspan, colspan: mergeColspan };
            }
            if (_rowIndex >= mergeRowIndex && _rowIndex < mergeRowIndex + mergeRowspan && _columnIndex >= mergeColIndex && _columnIndex < mergeColIndex + mergeColspan) {
                return { rowspan: 0, colspan: 0 };
            }
        }
    }
}
export default defineComponent({
    name: 'VxeTableFooter',
    props: {
        footerTableData: { type: Array, default: function () { return []; } },
        tableColumn: { type: Array, default: function () { return []; } },
        fixedColumn: { type: Array, default: function () { return []; } },
        fixedType: { type: String, default: null }
    },
    setup: function (props) {
        var $xetable = inject('$xetable', {});
        var xID = $xetable.xID, tableProps = $xetable.props, tableReactData = $xetable.reactData, tableInternalData = $xetable.internalData;
        var _a = $xetable.getRefMaps(), refTableHeader = _a.refTableHeader, refTableBody = _a.refTableBody, refValidTooltip = _a.refValidTooltip;
        var computeTooltipOpts = $xetable.getComputeMaps().computeTooltipOpts;
        var refElem = ref();
        var refFooterTable = ref();
        var refFooterColgroup = ref();
        var refFooterTFoot = ref();
        var refFooterXSpace = ref();
        /**
         * ????????????
         * ??????????????????????????????????????????????????????
         * ??????????????????????????????????????????????????????
         */
        var scrollEvent = function (evnt) {
            var fixedType = props.fixedType;
            var scrollXLoad = tableReactData.scrollXLoad;
            var lastScrollLeft = tableInternalData.lastScrollLeft;
            var validTip = refValidTooltip.value;
            var tableHeader = refTableHeader.value;
            var tableBody = refTableBody.value;
            var headerElem = tableHeader ? tableHeader.$el : null;
            var footerElem = refElem.value;
            var bodyElem = tableBody.$el;
            var scrollLeft = footerElem.scrollLeft;
            var isX = scrollLeft !== lastScrollLeft;
            tableInternalData.lastScrollLeft = scrollLeft;
            tableInternalData.lastScrollTime = Date.now();
            if (headerElem) {
                headerElem.scrollLeft = scrollLeft;
            }
            if (bodyElem) {
                bodyElem.scrollLeft = scrollLeft;
            }
            if (scrollXLoad && isX) {
                $xetable.triggerScrollXEvent(evnt);
            }
            if (isX && validTip && validTip.reactData.visible) {
                validTip.updatePlacement();
            }
            $xetable.dispatchEvent('scroll', { type: renderType, fixed: fixedType, scrollTop: bodyElem.scrollTop, scrollLeft: scrollLeft, isX: isX, isY: false }, evnt);
        };
        nextTick(function () {
            var fixedType = props.fixedType;
            var elemStore = tableInternalData.elemStore;
            var prefix = (fixedType || 'main') + "-footer-";
            elemStore[prefix + "wrapper"] = refElem.value;
            elemStore[prefix + "table"] = refFooterTable.value;
            elemStore[prefix + "colgroup"] = refFooterColgroup.value;
            elemStore[prefix + "list"] = refFooterTFoot.value;
            elemStore[prefix + "xSpace"] = refFooterXSpace.value;
        });
        var renderVN = function () {
            var fixedType = props.fixedType, fixedColumn = props.fixedColumn, tableColumn = props.tableColumn, footerTableData = props.footerTableData;
            var footerRowClassName = tableProps.footerRowClassName, footerCellClassName = tableProps.footerCellClassName, footerRowStyle = tableProps.footerRowStyle, footerCellStyle = tableProps.footerCellStyle, allFooterAlign = tableProps.footerAlign, footerSpanMethod = tableProps.footerSpanMethod, allAlign = tableProps.align, columnKey = tableProps.columnKey, allColumnFooterOverflow = tableProps.showFooterOverflow;
            var visibleColumn = tableInternalData.visibleColumn;
            var scrollXLoad = tableReactData.scrollXLoad, overflowX = tableReactData.overflowX, scrollbarWidth = tableReactData.scrollbarWidth, currentColumn = tableReactData.currentColumn, mergeFooterList = tableReactData.mergeFooterList;
            var tooltipOpts = computeTooltipOpts.value;
            // ???????????????????????????
            if (fixedType) {
                if (scrollXLoad || allColumnFooterOverflow) {
                    if (!mergeFooterList.length || !footerSpanMethod) {
                        tableColumn = fixedColumn;
                    }
                    else {
                        tableColumn = visibleColumn;
                    }
                }
                else {
                    tableColumn = visibleColumn;
                }
            }
            return h('div', {
                ref: refElem,
                class: ['vxe-table--footer-wrapper', fixedType ? "fixed-" + fixedType + "--wrapper" : 'body--wrapper'],
                xid: xID,
                onScroll: scrollEvent
            }, [
                fixedType ? createCommentVNode() : h('div', {
                    ref: refFooterXSpace,
                    class: 'vxe-body--x-space'
                }),
                h('table', {
                    ref: refFooterTable,
                    class: 'vxe-table--footer',
                    xid: xID,
                    cellspacing: 0,
                    cellpadding: 0,
                    border: 0
                }, [
                    /**
                     * ??????
                     */
                    h('colgroup', {
                        ref: refFooterColgroup
                    }, tableColumn.map(function (column, $columnIndex) {
                        return h('col', {
                            name: column.id,
                            key: $columnIndex
                        });
                    }).concat(scrollbarWidth ? [
                        h('col', {
                            name: 'col_gutter'
                        })
                    ] : [])),
                    /**
                     * ??????
                     */
                    h('tfoot', {
                        ref: refFooterTFoot
                    }, footerTableData.map(function (list, _rowIndex) {
                        var $rowIndex = _rowIndex;
                        return h('tr', {
                            class: ['vxe-footer--row', footerRowClassName ? XEUtils.isFunction(footerRowClassName) ? footerRowClassName({ $table: $xetable, _rowIndex: _rowIndex, $rowIndex: $rowIndex, fixed: fixedType, type: renderType }) : footerRowClassName : ''],
                            style: footerRowStyle ? (XEUtils.isFunction(footerRowStyle) ? footerRowStyle({ $table: $xetable, _rowIndex: _rowIndex, $rowIndex: $rowIndex, fixed: fixedType, type: renderType }) : footerRowStyle) : null
                        }, tableColumn.map(function (column, $columnIndex) {
                            var _a;
                            var type = column.type, showFooterOverflow = column.showFooterOverflow, footerAlign = column.footerAlign, align = column.align, footerClassName = column.footerClassName;
                            var showAllTip = tooltipOpts.showAll;
                            var isColGroup = column.children && column.children.length;
                            var fixedHiddenColumn = fixedType ? column.fixed !== fixedType && !isColGroup : column.fixed && overflowX;
                            var footOverflow = XEUtils.isUndefined(showFooterOverflow) || XEUtils.isNull(showFooterOverflow) ? allColumnFooterOverflow : showFooterOverflow;
                            var footAlign = footerAlign || align || allFooterAlign || allAlign;
                            var showEllipsis = footOverflow === 'ellipsis';
                            var showTitle = footOverflow === 'title';
                            var showTooltip = footOverflow === true || footOverflow === 'tooltip';
                            var hasEllipsis = showTitle || showTooltip || showEllipsis;
                            var attrs = { colid: column.id };
                            var tfOns = {};
                            var columnIndex = $xetable.getColumnIndex(column);
                            var _columnIndex = $xetable.getVTColumnIndex(column);
                            var itemIndex = _columnIndex;
                            var params = { $table: $xetable, _rowIndex: _rowIndex, $rowIndex: $rowIndex, column: column, columnIndex: columnIndex, $columnIndex: $columnIndex, _columnIndex: _columnIndex, itemIndex: itemIndex, items: list, fixed: fixedType, type: renderType, data: footerTableData };
                            // ?????????????????????????????????
                            if (scrollXLoad && !hasEllipsis) {
                                showEllipsis = hasEllipsis = true;
                            }
                            if (showTitle || showTooltip || showAllTip) {
                                tfOns.onMouseenter = function (evnt) {
                                    if (showTitle) {
                                        updateCellTitle(evnt.currentTarget, column);
                                    }
                                    else if (showTooltip || showAllTip) {
                                        $xetable.triggerFooterTooltipEvent(evnt, params);
                                    }
                                };
                            }
                            if (showTooltip || showAllTip) {
                                tfOns.onMouseleave = function (evnt) {
                                    if (showTooltip || showAllTip) {
                                        $xetable.handleTargetLeaveEvent(evnt);
                                    }
                                };
                            }
                            tfOns.onClick = function (evnt) {
                                $xetable.dispatchEvent('footer-cell-click', Object.assign({ cell: evnt.currentTarget }, params), evnt);
                            };
                            tfOns.onDblclick = function (evnt) {
                                $xetable.dispatchEvent('footer-cell-dblclick', Object.assign({ cell: evnt.currentTarget }, params), evnt);
                            };
                            // ???????????????
                            if (mergeFooterList.length) {
                                var spanRest = mergeFooterMethod(mergeFooterList, _rowIndex, _columnIndex);
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
                            else if (footerSpanMethod) {
                                // ?????????????????????
                                var _b = footerSpanMethod(params) || {}, _c = _b.rowspan, rowspan = _c === void 0 ? 1 : _c, _d = _b.colspan, colspan = _d === void 0 ? 1 : _d;
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
                            return h('td', __assign(__assign(__assign(__assign({ class: ['vxe-footer--column', column.id, (_a = {},
                                        _a["col--" + footAlign] = footAlign,
                                        _a["col--" + type] = type,
                                        _a['col--last'] = $columnIndex === tableColumn.length - 1,
                                        _a['fixed--hidden'] = fixedHiddenColumn,
                                        _a['col--ellipsis'] = hasEllipsis,
                                        _a['col--current'] = currentColumn === column,
                                        _a), getPropClass(footerClassName, params), getPropClass(footerCellClassName, params)] }, attrs), { style: footerCellStyle ? (XEUtils.isFunction(footerCellStyle) ? footerCellStyle(params) : footerCellStyle) : null }), tfOns), { key: columnKey ? column.id : $columnIndex }), [
                                h('div', {
                                    class: ['vxe-cell', {
                                            'c--title': showTitle,
                                            'c--tooltip': showTooltip,
                                            'c--ellipsis': showEllipsis
                                        }]
                                }, column.renderFooter(params))
                            ]);
                        }).concat(scrollbarWidth ? [
                            h('td', {
                                class: 'vxe-footer--gutter col--gutter'
                            })
                        ] : []));
                    }))
                ])
            ]);
        };
        return renderVN;
    }
});
