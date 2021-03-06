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
import { createCommentVNode, defineComponent, h, ref, inject, nextTick, watch } from 'vue';
import XEUtils from 'xe-utils';
import { convertToRows } from './util';
import { getColMinWidth } from '../../table/src/util';
import { hasClass, getOffsetPos, addClass, removeClass } from '../../tools/dom';
var renderType = 'header';
export default defineComponent({
    name: 'VxeTableHeader',
    props: {
        tableData: Array,
        tableColumn: Array,
        tableGroupColumn: Array,
        fixedColumn: Array,
        fixedType: { type: String, default: null }
    },
    setup: function (props) {
        var $xetable = inject('$xetable', {});
        var xID = $xetable.xID, tableProps = $xetable.props, tableReactData = $xetable.reactData, tableInternalData = $xetable.internalData;
        var _a = $xetable.getRefMaps(), tableRefElem = _a.refElem, refTableBody = _a.refTableBody, refLeftContainer = _a.refLeftContainer, refRightContainer = _a.refRightContainer, refCellResizeBar = _a.refCellResizeBar;
        var headerColumn = ref([]);
        var refElem = ref();
        var refHeaderTable = ref();
        var refHeaderColgroup = ref();
        var refHeaderTHead = ref();
        var refHeaderXSpace = ref();
        var refHeaderBorderRepair = ref();
        var uploadColumn = function () {
            var isGroup = tableReactData.isGroup;
            headerColumn.value = isGroup ? convertToRows(props.tableGroupColumn) : [];
        };
        var resizeMousedown = function (evnt, params) {
            var column = params.column;
            var fixedType = props.fixedType;
            var tableBody = refTableBody.value;
            var leftContainerElem = refLeftContainer.value;
            var rightContainerElem = refRightContainer.value;
            var resizeBarElem = refCellResizeBar.value;
            var dragClientX = evnt.clientX;
            var wrapperElem = refElem.value;
            var dragBtnElem = evnt.target;
            var cell = params.cell = dragBtnElem.parentNode;
            var dragLeft = 0;
            var tableBodyElem = tableBody.$el;
            var pos = getOffsetPos(dragBtnElem, wrapperElem);
            var dragBtnWidth = dragBtnElem.clientWidth;
            var dragBtnOffsetWidth = Math.floor(dragBtnWidth / 2);
            var minInterval = getColMinWidth(params) - dragBtnOffsetWidth; // ????????????????????????
            var dragMinLeft = pos.left - cell.clientWidth + dragBtnWidth + minInterval;
            var dragPosLeft = pos.left + dragBtnOffsetWidth;
            var domMousemove = document.onmousemove;
            var domMouseup = document.onmouseup;
            var isLeftFixed = fixedType === 'left';
            var isRightFixed = fixedType === 'right';
            var tableEl = tableRefElem.value;
            // ?????????????????????????????????
            var fixedOffsetWidth = 0;
            if (isLeftFixed || isRightFixed) {
                var siblingProp = isLeftFixed ? 'nextElementSibling' : 'previousElementSibling';
                var tempCellElem = cell[siblingProp];
                while (tempCellElem) {
                    if (hasClass(tempCellElem, 'fixed--hidden')) {
                        break;
                    }
                    else if (!hasClass(tempCellElem, 'col--group')) {
                        fixedOffsetWidth += tempCellElem.offsetWidth;
                    }
                    tempCellElem = tempCellElem[siblingProp];
                }
                if (isRightFixed && rightContainerElem) {
                    dragPosLeft = rightContainerElem.offsetLeft + fixedOffsetWidth;
                }
            }
            // ??????????????????
            var updateEvent = function (evnt) {
                evnt.stopPropagation();
                evnt.preventDefault();
                var offsetX = evnt.clientX - dragClientX;
                var left = dragPosLeft + offsetX;
                var scrollLeft = fixedType ? 0 : tableBodyElem.scrollLeft;
                if (isLeftFixed) {
                    // ???????????????????????????????????????????????????????????????????????????
                    left = Math.min(left, (rightContainerElem ? rightContainerElem.offsetLeft : tableBodyElem.clientWidth) - fixedOffsetWidth - minInterval);
                }
                else if (isRightFixed) {
                    // ??????????????????????????????????????????????????????????????????????????????
                    dragMinLeft = (leftContainerElem ? leftContainerElem.clientWidth : 0) + fixedOffsetWidth + minInterval;
                    left = Math.min(left, dragPosLeft + cell.clientWidth - minInterval);
                }
                else {
                    dragMinLeft = Math.max(tableBodyElem.scrollLeft, dragMinLeft);
                    // left = Math.min(left, tableBodyElem.clientWidth + tableBodyElem.scrollLeft - 40)
                }
                dragLeft = Math.max(left, dragMinLeft);
                resizeBarElem.style.left = dragLeft - scrollLeft + "px";
            };
            tableInternalData._isResize = true;
            addClass(tableEl, 'drag--resize');
            resizeBarElem.style.display = 'block';
            document.onmousemove = updateEvent;
            document.onmouseup = function (evnt) {
                document.onmousemove = domMousemove;
                document.onmouseup = domMouseup;
                column.resizeWidth = column.renderWidth + (isRightFixed ? dragPosLeft - dragLeft : dragLeft - dragPosLeft);
                resizeBarElem.style.display = 'none';
                tableInternalData._isResize = false;
                tableInternalData._lastResizeTime = Date.now();
                $xetable.analyColumnWidth();
                $xetable.recalculate(true).then(function () {
                    $xetable.saveCustomResizable();
                    $xetable.updateCellAreas();
                    $xetable.dispatchEvent('resizable-change', params, evnt);
                });
                removeClass(tableEl, 'drag--resize');
            };
            updateEvent(evnt);
            if ($xetable.closeMenu) {
                $xetable.closeMenu();
            }
        };
        watch(function () { return props.tableColumn; }, uploadColumn);
        nextTick(function () {
            var fixedType = props.fixedType;
            var internalData = $xetable.internalData;
            var elemStore = internalData.elemStore;
            var prefix = (fixedType || 'main') + "-header-";
            elemStore[prefix + "wrapper"] = refElem.value;
            elemStore[prefix + "table"] = refHeaderTable.value;
            elemStore[prefix + "colgroup"] = refHeaderColgroup.value;
            elemStore[prefix + "list"] = refHeaderTHead.value;
            elemStore[prefix + "xSpace"] = refHeaderXSpace.value;
            elemStore[prefix + "repair"] = refHeaderBorderRepair.value;
            uploadColumn();
        });
        var renderVN = function () {
            var fixedType = props.fixedType, fixedColumn = props.fixedColumn, tableColumn = props.tableColumn;
            var resizable = tableProps.resizable, border = tableProps.border, columnKey = tableProps.columnKey, headerRowClassName = tableProps.headerRowClassName, headerCellClassName = tableProps.headerCellClassName, headerRowStyle = tableProps.headerRowStyle, headerCellStyle = tableProps.headerCellStyle, allColumnHeaderOverflow = tableProps.showHeaderOverflow, allHeaderAlign = tableProps.headerAlign, allAlign = tableProps.align, mouseConfig = tableProps.mouseConfig;
            var isGroup = tableReactData.isGroup, currentColumn = tableReactData.currentColumn, scrollXLoad = tableReactData.scrollXLoad, overflowX = tableReactData.overflowX, scrollbarWidth = tableReactData.scrollbarWidth;
            var headerGroups = headerColumn.value;
            // ???????????????????????????
            if (!isGroup) {
                if (fixedType) {
                    if (scrollXLoad || allColumnHeaderOverflow) {
                        tableColumn = fixedColumn;
                    }
                }
                headerGroups = [tableColumn];
            }
            return h('div', {
                ref: refElem,
                class: ['vxe-table--header-wrapper', fixedType ? "fixed-" + fixedType + "--wrapper" : 'body--wrapper'],
                xid: xID
            }, [
                fixedType ? createCommentVNode() : h('div', {
                    ref: refHeaderXSpace,
                    class: 'vxe-body--x-space'
                }),
                h('table', {
                    ref: refHeaderTable,
                    class: 'vxe-table--header',
                    xid: xID,
                    cellspacing: 0,
                    cellpadding: 0,
                    border: 0
                }, [
                    /**
                     * ??????
                     */
                    h('colgroup', {
                        ref: refHeaderColgroup
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
                    h('thead', {
                        ref: refHeaderTHead
                    }, headerGroups.map(function (cols, $rowIndex) {
                        return h('tr', {
                            class: ['vxe-header--row', headerRowClassName ? (XEUtils.isFunction(headerRowClassName) ? headerRowClassName({ $table: $xetable, $rowIndex: $rowIndex, fixed: fixedType, type: renderType }) : headerRowClassName) : ''],
                            style: headerRowStyle ? (XEUtils.isFunction(headerRowStyle) ? headerRowStyle({ $table: $xetable, $rowIndex: $rowIndex, fixed: fixedType, type: renderType }) : headerRowStyle) : null
                        }, cols.map(function (column, $columnIndex) {
                            var _a;
                            var type = column.type, showHeaderOverflow = column.showHeaderOverflow, headerAlign = column.headerAlign, align = column.align, headerClassName = column.headerClassName;
                            var isColGroup = column.children && column.children.length;
                            var fixedHiddenColumn = fixedType ? (column.fixed !== fixedType && !isColGroup) : !!column.fixed && overflowX;
                            var headOverflow = XEUtils.isUndefined(showHeaderOverflow) || XEUtils.isNull(showHeaderOverflow) ? allColumnHeaderOverflow : showHeaderOverflow;
                            var headAlign = headerAlign || align || allHeaderAlign || allAlign;
                            var showEllipsis = headOverflow === 'ellipsis';
                            var showTitle = headOverflow === 'title';
                            var showTooltip = headOverflow === true || headOverflow === 'tooltip';
                            var hasEllipsis = showTitle || showTooltip || showEllipsis;
                            var hasFilter = column.filters && column.filters.some(function (item) { return item.checked; });
                            var columnIndex = $xetable.getColumnIndex(column);
                            var _columnIndex = $xetable.getVTColumnIndex(column);
                            var params = { $table: $xetable, $rowIndex: $rowIndex, column: column, columnIndex: columnIndex, $columnIndex: $columnIndex, _columnIndex: _columnIndex, fixed: fixedType, type: renderType, isHidden: fixedHiddenColumn, hasFilter: hasFilter };
                            var thOns = {
                                onClick: function (evnt) { return $xetable.triggerHeaderCellClickEvent(evnt, params); },
                                onDblclick: function (evnt) { return $xetable.triggerHeaderCellDblclickEvent(evnt, params); }
                            };
                            // ?????????????????????????????????
                            if (scrollXLoad && !hasEllipsis) {
                                showEllipsis = hasEllipsis = true;
                            }
                            // ??????????????????
                            if (mouseConfig) {
                                thOns.onMousedown = function (evnt) { return $xetable.triggerHeaderCellMousedownEvent(evnt, params); };
                            }
                            return h('th', __assign(__assign({ class: ['vxe-header--column', column.id, (_a = {},
                                        _a["col--" + headAlign] = headAlign,
                                        _a["col--" + type] = type,
                                        _a['col--last'] = $columnIndex === cols.length - 1,
                                        _a['col--fixed'] = column.fixed,
                                        _a['col--group'] = isColGroup,
                                        _a['col--ellipsis'] = hasEllipsis,
                                        _a['fixed--hidden'] = fixedHiddenColumn,
                                        _a['is--sortable'] = column.sortable,
                                        _a['col--filter'] = !!column.filters,
                                        _a['is--filter-active'] = hasFilter,
                                        _a['col--current'] = currentColumn === column,
                                        _a), headerClassName ? (XEUtils.isFunction(headerClassName) ? headerClassName(params) : headerClassName) : '',
                                    headerCellClassName ? (XEUtils.isFunction(headerCellClassName) ? headerCellClassName(params) : headerCellClassName) : ''], colid: column.id, colspan: column.colSpan > 1 ? column.colSpan : null, rowspan: column.rowSpan > 1 ? column.rowSpan : null, style: headerCellStyle ? (XEUtils.isFunction(headerCellStyle) ? headerCellStyle(params) : headerCellStyle) : null }, thOns), { key: columnKey || isColGroup ? column.id : $columnIndex }), [
                                h('div', {
                                    class: ['vxe-cell', {
                                            'c--title': showTitle,
                                            'c--tooltip': showTooltip,
                                            'c--ellipsis': showEllipsis
                                        }]
                                }, column.renderHeader(params)),
                                /**
                                 * ????????????
                                 */
                                !fixedHiddenColumn && !isColGroup && (XEUtils.isBoolean(column.resizable) ? column.resizable : resizable) ? h('div', {
                                    class: ['vxe-resizable', {
                                            'is--line': !border || border === 'none'
                                        }],
                                    onMousedown: function (evnt) { return resizeMousedown(evnt, params); }
                                }) : null
                            ]);
                        }).concat(scrollbarWidth ? [
                            h('th', {
                                class: 'vxe-header--gutter col--gutter'
                            })
                        ] : []));
                    }))
                ]),
                /**
                 * ??????
                 */
                h('div', {
                    ref: refHeaderBorderRepair,
                    class: 'vxe-table--header-border-line'
                })
            ]);
        };
        return renderVN;
    }
});
