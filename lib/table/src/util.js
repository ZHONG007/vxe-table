"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assemColumn = assemColumn;
exports.clearTableAllStatus = clearTableAllStatus;
exports.clearTableDefaultStatus = clearTableDefaultStatus;
exports.colToVisible = colToVisible;
exports.createColumn = createColumn;
exports.destroyColumn = destroyColumn;
exports.getCellValue = getCellValue;
exports.getColMinWidth = getColMinWidth;
exports.getPropClass = getPropClass;
exports.getRowUniqueId = getRowUniqueId;
exports.getRowid = getRowid;
exports.getRowkey = getRowkey;
exports.handleFieldOrColumn = void 0;
exports.isColumnInfo = isColumnInfo;
exports.mergeBodyMethod = mergeBodyMethod;
exports.removeScrollListener = removeScrollListener;
exports.restoreScrollListener = restoreScrollListener;
exports.restoreScrollLocation = restoreScrollLocation;
exports.rowToVisible = rowToVisible;
exports.setCellValue = setCellValue;
exports.toFilters = toFilters;
exports.watchColumn = watchColumn;

var _vue = require("vue");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _columnInfo = require("./columnInfo");

var _dom = require("../../tools/dom");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function restoreScrollLocation($xetable, scrollLeft, scrollTop) {
  var internalData = $xetable.internalData;
  return $xetable.clearScroll().then(function () {
    if (scrollLeft || scrollTop) {
      // 重置最后滚动状态
      internalData.lastScrollLeft = 0;
      internalData.lastScrollTop = 0; // 还原滚动状态

      return $xetable.scrollTo(scrollLeft, scrollTop);
    }
  });
}

function removeScrollListener(scrollElem) {
  if (scrollElem && scrollElem._onscroll) {
    scrollElem.onscroll = null;
  }
}

function restoreScrollListener(scrollElem) {
  if (scrollElem && scrollElem._onscroll) {
    scrollElem.onscroll = scrollElem._onscroll;
  }
}
/**
 * 生成行的唯一主键
 */


function getRowUniqueId() {
  return _xeUtils.default.uniqueId('row_');
} // 行主键 key


function getRowkey($xetable) {
  var props = $xetable.props;
  var rowId = props.rowId;
  return rowId || '_XID';
} // 行主键 value


function getRowid($xetable, row) {
  var rowId = _xeUtils.default.get(row, getRowkey($xetable));

  return _xeUtils.default.eqNull(rowId) ? '' : encodeURIComponent(rowId);
}

var handleFieldOrColumn = function handleFieldOrColumn($xetable, fieldOrColumn) {
  if (fieldOrColumn) {
    return _xeUtils.default.isString(fieldOrColumn) ? $xetable.getColumnByField(fieldOrColumn) : fieldOrColumn;
  }

  return null;
};

exports.handleFieldOrColumn = handleFieldOrColumn;

function getPaddingLeftRightSize(elem) {
  if (elem) {
    var computedStyle = getComputedStyle(elem);

    var paddingLeft = _xeUtils.default.toNumber(computedStyle.paddingLeft);

    var paddingRight = _xeUtils.default.toNumber(computedStyle.paddingRight);

    return paddingLeft + paddingRight;
  }

  return 0;
}

function getElemenMarginWidth(elem) {
  if (elem) {
    var computedStyle = getComputedStyle(elem);

    var marginLeft = _xeUtils.default.toNumber(computedStyle.marginLeft);

    var marginRight = _xeUtils.default.toNumber(computedStyle.marginRight);

    return elem.offsetWidth + marginLeft + marginRight;
  }

  return 0;
}

function queryCellElement(cell, selector) {
  return cell.querySelector('.vxe-cell' + selector);
}

function toFilters(filters) {
  if (filters && _xeUtils.default.isArray(filters)) {
    return filters.map(function (_a) {
      var label = _a.label,
          value = _a.value,
          data = _a.data,
          resetValue = _a.resetValue,
          checked = _a.checked;
      return {
        label: label,
        value: value,
        data: data,
        resetValue: resetValue,
        checked: !!checked,
        _checked: !!checked
      };
    });
  }

  return filters;
}

function getCellValue(row, column) {
  return _xeUtils.default.get(row, column.property);
}

function setCellValue(row, column, value) {
  return _xeUtils.default.set(row, column.property, value);
}

function getPropClass(property, params) {
  return property ? _xeUtils.default.isFunction(property) ? property(params) : property : '';
}

function getColMinWidth(params) {
  var $table = params.$table,
      column = params.column,
      cell = params.cell;
  var tableProps = $table.props;
  var computeResizableOpts = $table.getComputeMaps().computeResizableOpts;
  var resizableOpts = computeResizableOpts.value;
  var reMinWidth = resizableOpts.minWidth; // 如果自定义调整宽度逻辑

  if (reMinWidth) {
    var customMinWidth = _xeUtils.default.isFunction(reMinWidth) ? reMinWidth(params) : reMinWidth;

    if (customMinWidth !== 'auto') {
      return Math.max(1, _xeUtils.default.toNumber(customMinWidth));
    }
  }

  var allColumnHeaderOverflow = tableProps.showHeaderOverflow;
  var showHeaderOverflow = column.showHeaderOverflow,
      colMinWidth = column.minWidth;
  var headOverflow = _xeUtils.default.isUndefined(showHeaderOverflow) || _xeUtils.default.isNull(showHeaderOverflow) ? allColumnHeaderOverflow : showHeaderOverflow;
  var showEllipsis = headOverflow === 'ellipsis';
  var showTitle = headOverflow === 'title';
  var showTooltip = headOverflow === true || headOverflow === 'tooltip';
  var hasEllipsis = showTitle || showTooltip || showEllipsis;

  var minTitleWidth = _xeUtils.default.floor((_xeUtils.default.toNumber(getComputedStyle(cell).fontSize) || 14) * 1.6);

  var paddingLeftRight = getPaddingLeftRightSize(cell) + getPaddingLeftRightSize(queryCellElement(cell, ''));
  var mWidth = minTitleWidth + paddingLeftRight; // 默认最小宽处理

  if (hasEllipsis) {
    var checkboxIconWidth = getPaddingLeftRightSize(queryCellElement(cell, '--title>.vxe-cell--checkbox'));
    var requiredIconWidth = getElemenMarginWidth(queryCellElement(cell, '>.vxe-cell--required-icon'));
    var editIconWidth = getElemenMarginWidth(queryCellElement(cell, '>.vxe-cell--edit-icon'));
    var helpIconWidth = getElemenMarginWidth(queryCellElement(cell, '>.vxe-cell-help-icon'));
    var sortIconWidth = getElemenMarginWidth(queryCellElement(cell, '>.vxe-cell--sort'));
    var filterIconWidth = getElemenMarginWidth(queryCellElement(cell, '>.vxe-cell--filter'));
    mWidth += checkboxIconWidth + requiredIconWidth + editIconWidth + helpIconWidth + filterIconWidth + sortIconWidth;
  } // 如果设置最小宽


  if (colMinWidth) {
    var refTableBody = $table.getRefMaps().refTableBody;
    var tableBody = refTableBody.value;
    var bodyElem = tableBody ? tableBody.$el : null;

    if (bodyElem) {
      if ((0, _dom.isScale)(colMinWidth)) {
        var bodyWidth = bodyElem.clientWidth - 1;
        var meanWidth = bodyWidth / 100;
        return Math.max(mWidth, Math.floor(_xeUtils.default.toInteger(colMinWidth) * meanWidth));
      } else if ((0, _dom.isPx)(colMinWidth)) {
        return Math.max(mWidth, _xeUtils.default.toInteger(colMinWidth));
      }
    }
  }

  return mWidth;
}

function isColumnInfo(column) {
  return column && (column.constructor === _columnInfo.ColumnInfo || column instanceof _columnInfo.ColumnInfo);
}

function createColumn($xetable, options, renderOptions) {
  return isColumnInfo(options) ? options : new _columnInfo.ColumnInfo($xetable, options, renderOptions);
}

function watchColumn(props, column) {
  Object.keys(props).forEach(function (name) {
    (0, _vue.watch)(function () {
      return props[name];
    }, function (value) {
      column.update(name, value);
    });
  });
}

function assemColumn($xetable, elem, column, colgroup) {
  var reactData = $xetable.reactData;
  var staticColumns = reactData.staticColumns;
  var parentElem = elem.parentNode;
  var parentColumn = colgroup ? colgroup.column : null;
  var parentCols = parentColumn ? parentColumn.children : staticColumns;

  if (parentElem && parentCols) {
    parentCols.splice(_xeUtils.default.arrayIndexOf(parentElem.children, elem), 0, column);
    reactData.staticColumns = staticColumns.slice(0);
  }
}

function destroyColumn($xetable, column) {
  var reactData = $xetable.reactData;
  var staticColumns = reactData.staticColumns;

  var matchObj = _xeUtils.default.findTree(staticColumns, function (item) {
    return item.id === column.id;
  }, {
    children: 'children'
  });

  if (matchObj) {
    matchObj.items.splice(matchObj.index, 1);
  }

  reactData.staticColumns = staticColumns.slice(0);
}

function mergeBodyMethod(mergeList, _rowIndex, _columnIndex) {
  for (var mIndex = 0; mIndex < mergeList.length; mIndex++) {
    var _a = mergeList[mIndex],
        mergeRowIndex = _a.row,
        mergeColIndex = _a.col,
        mergeRowspan = _a.rowspan,
        mergeColspan = _a.colspan;

    if (mergeColIndex > -1 && mergeRowIndex > -1 && mergeRowspan && mergeColspan) {
      if (mergeRowIndex === _rowIndex && mergeColIndex === _columnIndex) {
        return {
          rowspan: mergeRowspan,
          colspan: mergeColspan
        };
      }

      if (_rowIndex >= mergeRowIndex && _rowIndex < mergeRowIndex + mergeRowspan && _columnIndex >= mergeColIndex && _columnIndex < mergeColIndex + mergeColspan) {
        return {
          rowspan: 0,
          colspan: 0
        };
      }
    }
  }
}

function clearTableDefaultStatus($xetable) {
  var props = $xetable.props,
      internalData = $xetable.internalData;
  internalData.initStatus = false;
  $xetable.clearSort();
  $xetable.clearCurrentRow();
  $xetable.clearCurrentColumn();
  $xetable.clearRadioRow();
  $xetable.clearRadioReserve();
  $xetable.clearCheckboxRow();
  $xetable.clearCheckboxReserve();
  $xetable.clearRowExpand();
  $xetable.clearTreeExpand();
  $xetable.clearTreeExpandReserve();

  if ($xetable.clearFilter) {
    $xetable.clearFilter();
  }

  if ($xetable.clearSelected && (props.keyboardConfig || props.mouseConfig)) {
    $xetable.clearSelected();
  }

  if ($xetable.clearCellAreas && props.mouseConfig) {
    $xetable.clearCellAreas();
    $xetable.clearCopyCellArea();
  }

  return $xetable.clearScroll();
}

function clearTableAllStatus($xetable) {
  if ($xetable.clearFilter) {
    $xetable.clearFilter();
  }

  return clearTableDefaultStatus($xetable);
}

function rowToVisible($xetable, row) {
  var reactData = $xetable.reactData,
      internalData = $xetable.internalData;
  var refTableBody = $xetable.getRefMaps().refTableBody;
  var scrollYLoad = reactData.scrollYLoad;
  var afterFullData = internalData.afterFullData,
      scrollYStore = internalData.scrollYStore;
  var tableBody = refTableBody.value;
  var bodyElem = tableBody ? tableBody.$el : null;

  if (bodyElem) {
    var trElem = bodyElem.querySelector("[rowid=\"" + getRowid($xetable, row) + "\"]");

    if (trElem) {
      var bodyHeight = bodyElem.clientHeight;
      var bodySrcollTop = bodyElem.scrollTop;
      var trOffsetParent = trElem.offsetParent;
      var trOffsetTop = trElem.offsetTop + (trOffsetParent ? trOffsetParent.offsetTop : 0);
      var trHeight = trElem.clientHeight; // 检测行是否在可视区中

      if (trOffsetTop < bodySrcollTop || trOffsetTop > bodySrcollTop + bodyHeight) {
        // 向上定位
        return $xetable.scrollTo(null, trOffsetTop);
      } else if (trOffsetTop + trHeight >= bodyHeight + bodySrcollTop) {
        // 向下定位
        return $xetable.scrollTo(null, bodySrcollTop + trHeight);
      }
    } else {
      // 如果是虚拟渲染跨行滚动
      if (scrollYLoad) {
        return $xetable.scrollTo(null, (afterFullData.indexOf(row) - 1) * scrollYStore.rowHeight);
      }
    }
  }

  return Promise.resolve();
}

function colToVisible($xetable, column) {
  var reactData = $xetable.reactData,
      internalData = $xetable.internalData;
  var refTableBody = $xetable.getRefMaps().refTableBody;
  var scrollXLoad = reactData.scrollXLoad;
  var visibleColumn = internalData.visibleColumn;
  var tableBody = refTableBody.value;
  var bodyElem = tableBody ? tableBody.$el : null;

  if (bodyElem) {
    var tdElem = bodyElem.querySelector("." + column.id);

    if (tdElem) {
      var bodyWidth = bodyElem.clientWidth;
      var bodySrcollLeft = bodyElem.scrollLeft;
      var tdOffsetParent = tdElem.offsetParent;
      var tdOffsetLeft = tdElem.offsetLeft + (tdOffsetParent ? tdOffsetParent.offsetLeft : 0);
      var tdWidth = tdElem.clientWidth; // 检测行是否在可视区中

      if (tdOffsetLeft < bodySrcollLeft || tdOffsetLeft > bodySrcollLeft + bodyWidth) {
        // 向左定位
        return $xetable.scrollTo(tdOffsetLeft);
      } else if (tdOffsetLeft + tdWidth >= bodyWidth + bodySrcollLeft) {
        // 向右定位
        return $xetable.scrollTo(bodySrcollLeft + tdWidth);
      }
    } else {
      // 如果是虚拟渲染跨行滚动
      if (scrollXLoad) {
        var scrollLeft = 0;

        for (var index = 0; index < visibleColumn.length; index++) {
          if (visibleColumn[index] === column) {
            break;
          }

          scrollLeft += visibleColumn[index].renderWidth;
        }

        return $xetable.scrollTo(scrollLeft);
      }
    }
  }

  return Promise.resolve();
}