"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = require("vue");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _util = require("./util");

var _util2 = require("../../table/src/util");

var _dom = require("../../tools/dom");

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

var renderType = 'header';

var _default = (0, _vue.defineComponent)({
  name: 'VxeTableHeader',
  props: {
    tableData: Array,
    tableColumn: Array,
    tableGroupColumn: Array,
    fixedColumn: Array,
    fixedType: {
      type: String,
      default: null
    }
  },
  setup: function setup(props) {
    var $xetable = (0, _vue.inject)('$xetable', {});
    var xID = $xetable.xID,
        tableProps = $xetable.props,
        tableReactData = $xetable.reactData,
        tableInternalData = $xetable.internalData;

    var _a = $xetable.getRefMaps(),
        tableRefElem = _a.refElem,
        refTableBody = _a.refTableBody,
        refLeftContainer = _a.refLeftContainer,
        refRightContainer = _a.refRightContainer,
        refCellResizeBar = _a.refCellResizeBar;

    var headerColumn = (0, _vue.ref)([]);
    var refElem = (0, _vue.ref)();
    var refHeaderTable = (0, _vue.ref)();
    var refHeaderColgroup = (0, _vue.ref)();
    var refHeaderTHead = (0, _vue.ref)();
    var refHeaderXSpace = (0, _vue.ref)();
    var refHeaderBorderRepair = (0, _vue.ref)();

    var uploadColumn = function uploadColumn() {
      var isGroup = tableReactData.isGroup;
      headerColumn.value = isGroup ? (0, _util.convertToRows)(props.tableGroupColumn) : [];
    };

    var resizeMousedown = function resizeMousedown(evnt, params) {
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
      var pos = (0, _dom.getOffsetPos)(dragBtnElem, wrapperElem);
      var dragBtnWidth = dragBtnElem.clientWidth;
      var dragBtnOffsetWidth = Math.floor(dragBtnWidth / 2);
      var minInterval = (0, _util2.getColMinWidth)(params) - dragBtnOffsetWidth; // ????????????????????????

      var dragMinLeft = pos.left - cell.clientWidth + dragBtnWidth + minInterval;
      var dragPosLeft = pos.left + dragBtnOffsetWidth;
      var domMousemove = document.onmousemove;
      var domMouseup = document.onmouseup;
      var isLeftFixed = fixedType === 'left';
      var isRightFixed = fixedType === 'right';
      var tableEl = tableRefElem.value; // ?????????????????????????????????

      var fixedOffsetWidth = 0;

      if (isLeftFixed || isRightFixed) {
        var siblingProp = isLeftFixed ? 'nextElementSibling' : 'previousElementSibling';
        var tempCellElem = cell[siblingProp];

        while (tempCellElem) {
          if ((0, _dom.hasClass)(tempCellElem, 'fixed--hidden')) {
            break;
          } else if (!(0, _dom.hasClass)(tempCellElem, 'col--group')) {
            fixedOffsetWidth += tempCellElem.offsetWidth;
          }

          tempCellElem = tempCellElem[siblingProp];
        }

        if (isRightFixed && rightContainerElem) {
          dragPosLeft = rightContainerElem.offsetLeft + fixedOffsetWidth;
        }
      } // ??????????????????


      var updateEvent = function updateEvent(evnt) {
        evnt.stopPropagation();
        evnt.preventDefault();
        var offsetX = evnt.clientX - dragClientX;
        var left = dragPosLeft + offsetX;
        var scrollLeft = fixedType ? 0 : tableBodyElem.scrollLeft;

        if (isLeftFixed) {
          // ???????????????????????????????????????????????????????????????????????????
          left = Math.min(left, (rightContainerElem ? rightContainerElem.offsetLeft : tableBodyElem.clientWidth) - fixedOffsetWidth - minInterval);
        } else if (isRightFixed) {
          // ??????????????????????????????????????????????????????????????????????????????
          dragMinLeft = (leftContainerElem ? leftContainerElem.clientWidth : 0) + fixedOffsetWidth + minInterval;
          left = Math.min(left, dragPosLeft + cell.clientWidth - minInterval);
        } else {
          dragMinLeft = Math.max(tableBodyElem.scrollLeft, dragMinLeft); // left = Math.min(left, tableBodyElem.clientWidth + tableBodyElem.scrollLeft - 40)
        }

        dragLeft = Math.max(left, dragMinLeft);
        resizeBarElem.style.left = dragLeft - scrollLeft + "px";
      };

      tableInternalData._isResize = true;
      (0, _dom.addClass)(tableEl, 'drag--resize');
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
        (0, _dom.removeClass)(tableEl, 'drag--resize');
      };

      updateEvent(evnt);

      if ($xetable.closeMenu) {
        $xetable.closeMenu();
      }
    };

    (0, _vue.watch)(function () {
      return props.tableColumn;
    }, uploadColumn);
    (0, _vue.nextTick)(function () {
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

    var renderVN = function renderVN() {
      var fixedType = props.fixedType,
          fixedColumn = props.fixedColumn,
          tableColumn = props.tableColumn;
      var resizable = tableProps.resizable,
          border = tableProps.border,
          columnKey = tableProps.columnKey,
          headerRowClassName = tableProps.headerRowClassName,
          headerCellClassName = tableProps.headerCellClassName,
          headerRowStyle = tableProps.headerRowStyle,
          headerCellStyle = tableProps.headerCellStyle,
          allColumnHeaderOverflow = tableProps.showHeaderOverflow,
          allHeaderAlign = tableProps.headerAlign,
          allAlign = tableProps.align,
          mouseConfig = tableProps.mouseConfig;
      var isGroup = tableReactData.isGroup,
          currentColumn = tableReactData.currentColumn,
          scrollXLoad = tableReactData.scrollXLoad,
          overflowX = tableReactData.overflowX,
          scrollbarWidth = tableReactData.scrollbarWidth;
      var headerGroups = headerColumn.value; // ???????????????????????????

      if (!isGroup) {
        if (fixedType) {
          if (scrollXLoad || allColumnHeaderOverflow) {
            tableColumn = fixedColumn;
          }
        }

        headerGroups = [tableColumn];
      }

      return (0, _vue.h)('div', {
        ref: refElem,
        class: ['vxe-table--header-wrapper', fixedType ? "fixed-" + fixedType + "--wrapper" : 'body--wrapper'],
        xid: xID
      }, [fixedType ? (0, _vue.createCommentVNode)() : (0, _vue.h)('div', {
        ref: refHeaderXSpace,
        class: 'vxe-body--x-space'
      }), (0, _vue.h)('table', {
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
      (0, _vue.h)('colgroup', {
        ref: refHeaderColgroup
      }, tableColumn.map(function (column, $columnIndex) {
        return (0, _vue.h)('col', {
          name: column.id,
          key: $columnIndex
        });
      }).concat(scrollbarWidth ? [(0, _vue.h)('col', {
        name: 'col_gutter'
      })] : [])),
      /**
       * ??????
       */
      (0, _vue.h)('thead', {
        ref: refHeaderTHead
      }, headerGroups.map(function (cols, $rowIndex) {
        return (0, _vue.h)('tr', {
          class: ['vxe-header--row', headerRowClassName ? _xeUtils.default.isFunction(headerRowClassName) ? headerRowClassName({
            $table: $xetable,
            $rowIndex: $rowIndex,
            fixed: fixedType,
            type: renderType
          }) : headerRowClassName : ''],
          style: headerRowStyle ? _xeUtils.default.isFunction(headerRowStyle) ? headerRowStyle({
            $table: $xetable,
            $rowIndex: $rowIndex,
            fixed: fixedType,
            type: renderType
          }) : headerRowStyle : null
        }, cols.map(function (column, $columnIndex) {
          var _a;

          var type = column.type,
              showHeaderOverflow = column.showHeaderOverflow,
              headerAlign = column.headerAlign,
              align = column.align,
              headerClassName = column.headerClassName;
          var isColGroup = column.children && column.children.length;
          var fixedHiddenColumn = fixedType ? column.fixed !== fixedType && !isColGroup : !!column.fixed && overflowX;
          var headOverflow = _xeUtils.default.isUndefined(showHeaderOverflow) || _xeUtils.default.isNull(showHeaderOverflow) ? allColumnHeaderOverflow : showHeaderOverflow;
          var headAlign = headerAlign || align || allHeaderAlign || allAlign;
          var showEllipsis = headOverflow === 'ellipsis';
          var showTitle = headOverflow === 'title';
          var showTooltip = headOverflow === true || headOverflow === 'tooltip';
          var hasEllipsis = showTitle || showTooltip || showEllipsis;
          var hasFilter = column.filters && column.filters.some(function (item) {
            return item.checked;
          });
          var columnIndex = $xetable.getColumnIndex(column);

          var _columnIndex = $xetable.getVTColumnIndex(column);

          var params = {
            $table: $xetable,
            $rowIndex: $rowIndex,
            column: column,
            columnIndex: columnIndex,
            $columnIndex: $columnIndex,
            _columnIndex: _columnIndex,
            fixed: fixedType,
            type: renderType,
            isHidden: fixedHiddenColumn,
            hasFilter: hasFilter
          };
          var thOns = {
            onClick: function onClick(evnt) {
              return $xetable.triggerHeaderCellClickEvent(evnt, params);
            },
            onDblclick: function onDblclick(evnt) {
              return $xetable.triggerHeaderCellDblclickEvent(evnt, params);
            }
          }; // ?????????????????????????????????

          if (scrollXLoad && !hasEllipsis) {
            showEllipsis = hasEllipsis = true;
          } // ??????????????????


          if (mouseConfig) {
            thOns.onMousedown = function (evnt) {
              return $xetable.triggerHeaderCellMousedownEvent(evnt, params);
            };
          }

          return (0, _vue.h)('th', __assign(__assign({
            class: ['vxe-header--column', column.id, (_a = {}, _a["col--" + headAlign] = headAlign, _a["col--" + type] = type, _a['col--last'] = $columnIndex === cols.length - 1, _a['col--fixed'] = column.fixed, _a['col--group'] = isColGroup, _a['col--ellipsis'] = hasEllipsis, _a['fixed--hidden'] = fixedHiddenColumn, _a['is--sortable'] = column.sortable, _a['col--filter'] = !!column.filters, _a['is--filter-active'] = hasFilter, _a['col--current'] = currentColumn === column, _a), headerClassName ? _xeUtils.default.isFunction(headerClassName) ? headerClassName(params) : headerClassName : '', headerCellClassName ? _xeUtils.default.isFunction(headerCellClassName) ? headerCellClassName(params) : headerCellClassName : ''],
            colid: column.id,
            colspan: column.colSpan > 1 ? column.colSpan : null,
            rowspan: column.rowSpan > 1 ? column.rowSpan : null,
            style: headerCellStyle ? _xeUtils.default.isFunction(headerCellStyle) ? headerCellStyle(params) : headerCellStyle : null
          }, thOns), {
            key: columnKey || isColGroup ? column.id : $columnIndex
          }), [(0, _vue.h)('div', {
            class: ['vxe-cell', {
              'c--title': showTitle,
              'c--tooltip': showTooltip,
              'c--ellipsis': showEllipsis
            }]
          }, column.renderHeader(params)),
          /**
           * ????????????
           */
          !fixedHiddenColumn && !isColGroup && (_xeUtils.default.isBoolean(column.resizable) ? column.resizable : resizable) ? (0, _vue.h)('div', {
            class: ['vxe-resizable', {
              'is--line': !border || border === 'none'
            }],
            onMousedown: function onMousedown(evnt) {
              return resizeMousedown(evnt, params);
            }
          }) : null]);
        }).concat(scrollbarWidth ? [(0, _vue.h)('th', {
          class: 'vxe-header--gutter col--gutter'
        })] : []));
      }))]),
      /**
       * ??????
       */
      (0, _vue.h)('div', {
        ref: refHeaderBorderRepair,
        class: 'vxe-table--header-border-line'
      })]);
    };

    return renderVN;
  }
});

exports.default = _default;