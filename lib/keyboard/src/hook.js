"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _dom = require("../../tools/dom");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getTargetOffset(target, container) {
  var offsetTop = 0;
  var offsetLeft = 0;
  var triggerCheckboxLabel = !_dom.browse.firefox && (0, _dom.hasClass)(target, 'vxe-checkbox--label');

  if (triggerCheckboxLabel) {
    var checkboxLabelStyle = getComputedStyle(target);
    offsetTop -= _xeUtils.default.toNumber(checkboxLabelStyle.paddingTop);
    offsetLeft -= _xeUtils.default.toNumber(checkboxLabelStyle.paddingLeft);
  }

  while (target && target !== container) {
    offsetTop += target.offsetTop;
    offsetLeft += target.offsetLeft;
    target = target.offsetParent;

    if (triggerCheckboxLabel) {
      var checkboxStyle = getComputedStyle(target);
      offsetTop -= _xeUtils.default.toNumber(checkboxStyle.paddingTop);
      offsetLeft -= _xeUtils.default.toNumber(checkboxStyle.paddingLeft);
    }
  }

  return {
    offsetTop: offsetTop,
    offsetLeft: offsetLeft
  };
}

var tableKeyboardHook = {
  setupTable: function setupTable($xetable) {
    var props = $xetable.props,
        reactData = $xetable.reactData,
        internalData = $xetable.internalData;
    var refElem = $xetable.getRefMaps().refElem;

    var _a = $xetable.getComputeMaps(),
        computeEditOpts = _a.computeEditOpts,
        computeCheckboxOpts = _a.computeCheckboxOpts,
        computeMouseOpts = _a.computeMouseOpts,
        computeTreeOpts = _a.computeTreeOpts;

    function getCheckboxRangeRows(params, targetTrElem, moveRange) {
      var countHeight = 0;
      var rangeRows = [];
      var isDown = moveRange > 0;
      var moveSize = moveRange > 0 ? moveRange : Math.abs(moveRange) + targetTrElem.offsetHeight;
      var scrollYLoad = reactData.scrollYLoad;
      var afterFullData = internalData.afterFullData,
          scrollYStore = internalData.scrollYStore;

      if (scrollYLoad) {
        var _rowIndex = $xetable.getVTRowIndex(params.row);

        if (isDown) {
          rangeRows = afterFullData.slice(_rowIndex, _rowIndex + Math.ceil(moveSize / scrollYStore.rowHeight));
        } else {
          rangeRows = afterFullData.slice(_rowIndex - Math.floor(moveSize / scrollYStore.rowHeight) + 1, _rowIndex + 1);
        }
      } else {
        var siblingProp = isDown ? 'next' : 'previous';

        while (targetTrElem && countHeight < moveSize) {
          var rowNodeRest = $xetable.getRowNode(targetTrElem);

          if (rowNodeRest) {
            rangeRows.push(rowNodeRest.item);
            countHeight += targetTrElem.offsetHeight;
            targetTrElem = targetTrElem[siblingProp + "ElementSibling"];
          }
        }
      }

      return rangeRows;
    }

    var handleCheckboxRangeEvent = function handleCheckboxRangeEvent(evnt, params) {
      var column = params.column,
          cell = params.cell;

      if (column.type === 'checkbox') {
        var el_1 = refElem.value;
        var elemStore = internalData.elemStore;
        var disX_1 = evnt.clientX;
        var disY_1 = evnt.clientY;
        var bodyWrapperElem_1 = elemStore[(column.fixed || 'main') + "-body-wrapper"] || elemStore['main-body-wrapper'];
        var checkboxRangeElem_1 = bodyWrapperElem_1.querySelector('.vxe-table--checkbox-range');
        var domMousemove_1 = document.onmousemove;
        var domMouseup_1 = document.onmouseup;
        var trElem_1 = cell.parentNode;
        var selectRecords_1 = $xetable.getCheckboxRecords();
        var lastRangeRows_1 = [];
        var marginSize_1 = 1;
        var offsetRest = getTargetOffset(evnt.target, bodyWrapperElem_1);
        var startTop_1 = offsetRest.offsetTop + evnt.offsetY;
        var startLeft_1 = offsetRest.offsetLeft + evnt.offsetX;
        var startScrollTop_1 = bodyWrapperElem_1.scrollTop;
        var rowHeight_1 = trElem_1.offsetHeight;
        var mouseScrollTimeout_1 = null;
        var isMouseScrollDown_1 = false;
        var mouseScrollSpaceSize_1 = 1;

        var triggerEvent_1 = function triggerEvent_1(type, evnt) {
          $xetable.dispatchEvent("checkbox-range-" + type, {
            records: $xetable.getCheckboxRecords(),
            reserves: $xetable.getCheckboxReserveRecords()
          }, evnt);
        };

        var handleChecked_1 = function handleChecked_1(evnt) {
          var clientX = evnt.clientX,
              clientY = evnt.clientY;
          var offsetLeft = clientX - disX_1;
          var offsetTop = clientY - disY_1 + (bodyWrapperElem_1.scrollTop - startScrollTop_1);
          var rangeHeight = Math.abs(offsetTop);
          var rangeWidth = Math.abs(offsetLeft);
          var rangeTop = startTop_1;
          var rangeLeft = startLeft_1;

          if (offsetTop < marginSize_1) {
            // 向上
            rangeTop += offsetTop;

            if (rangeTop < marginSize_1) {
              rangeTop = marginSize_1;
              rangeHeight = startTop_1;
            }
          } else {
            // 向下
            rangeHeight = Math.min(rangeHeight, bodyWrapperElem_1.scrollHeight - startTop_1 - marginSize_1);
          }

          if (offsetLeft < marginSize_1) {
            // 向左
            rangeLeft += offsetLeft;

            if (rangeWidth > startLeft_1) {
              rangeLeft = marginSize_1;
              rangeWidth = startLeft_1;
            }
          } else {
            // 向右
            rangeWidth = Math.min(rangeWidth, bodyWrapperElem_1.clientWidth - startLeft_1 - marginSize_1);
          }

          checkboxRangeElem_1.style.height = rangeHeight + "px";
          checkboxRangeElem_1.style.width = rangeWidth + "px";
          checkboxRangeElem_1.style.left = rangeLeft + "px";
          checkboxRangeElem_1.style.top = rangeTop + "px";
          checkboxRangeElem_1.style.display = 'block';
          var rangeRows = getCheckboxRangeRows(params, trElem_1, offsetTop < marginSize_1 ? -rangeHeight : rangeHeight); // 至少滑动 10px 才能有效匹配

          if (rangeHeight > 10 && rangeRows.length !== lastRangeRows_1.length) {
            lastRangeRows_1 = rangeRows;

            if (evnt.ctrlKey) {
              rangeRows.forEach(function (row) {
                $xetable.handleSelectRow({
                  row: row
                }, selectRecords_1.indexOf(row) === -1);
              });
            } else {
              $xetable.setAllCheckboxRow(false);
              $xetable.setCheckboxRow(rangeRows, true);
            }

            triggerEvent_1('change', evnt);
          }
        }; // 停止鼠标滚动


        var stopMouseScroll_1 = function stopMouseScroll_1() {
          clearTimeout(mouseScrollTimeout_1);
          mouseScrollTimeout_1 = null;
        }; // 开始鼠标滚动


        var startMouseScroll_1 = function startMouseScroll_1(evnt) {
          stopMouseScroll_1();
          mouseScrollTimeout_1 = setTimeout(function () {
            if (mouseScrollTimeout_1) {
              var scrollLeft = bodyWrapperElem_1.scrollLeft,
                  scrollTop = bodyWrapperElem_1.scrollTop,
                  clientHeight = bodyWrapperElem_1.clientHeight,
                  scrollHeight = bodyWrapperElem_1.scrollHeight;
              var topSize = Math.ceil(mouseScrollSpaceSize_1 * 50 / rowHeight_1);

              if (isMouseScrollDown_1) {
                if (scrollTop + clientHeight < scrollHeight) {
                  $xetable.scrollTo(scrollLeft, scrollTop + topSize);
                  startMouseScroll_1(evnt);
                  handleChecked_1(evnt);
                } else {
                  stopMouseScroll_1();
                }
              } else {
                if (scrollTop) {
                  $xetable.scrollTo(scrollLeft, scrollTop - topSize);
                  startMouseScroll_1(evnt);
                  handleChecked_1(evnt);
                } else {
                  stopMouseScroll_1();
                }
              }
            }
          }, 50);
        };

        (0, _dom.addClass)(el_1, 'drag--range');

        document.onmousemove = function (evnt) {
          evnt.preventDefault();
          evnt.stopPropagation();
          var clientY = evnt.clientY;
          var boundingTop = (0, _dom.getAbsolutePos)(bodyWrapperElem_1).boundingTop; // 如果超过可视区，触发滚动

          if (clientY < boundingTop) {
            isMouseScrollDown_1 = false;
            mouseScrollSpaceSize_1 = boundingTop - clientY;

            if (!mouseScrollTimeout_1) {
              startMouseScroll_1(evnt);
            }
          } else if (clientY > boundingTop + bodyWrapperElem_1.clientHeight) {
            isMouseScrollDown_1 = true;
            mouseScrollSpaceSize_1 = clientY - boundingTop - bodyWrapperElem_1.clientHeight;

            if (!mouseScrollTimeout_1) {
              startMouseScroll_1(evnt);
            }
          } else if (mouseScrollTimeout_1) {
            stopMouseScroll_1();
          }

          handleChecked_1(evnt);
        };

        document.onmouseup = function (evnt) {
          stopMouseScroll_1();
          (0, _dom.removeClass)(el_1, 'drag--range');
          checkboxRangeElem_1.removeAttribute('style');
          document.onmousemove = domMousemove_1;
          document.onmouseup = domMouseup_1;
          triggerEvent_1('end', evnt);
        };

        triggerEvent_1('start', evnt);
      }
    };

    var handleCellMousedownEvent = function handleCellMousedownEvent(evnt, params) {
      var editConfig = props.editConfig,
          checkboxConfig = props.checkboxConfig,
          mouseConfig = props.mouseConfig;
      var checkboxOpts = computeCheckboxOpts.value;
      var mouseOpts = computeMouseOpts.value;
      var editOpts = computeEditOpts.value;

      if (mouseConfig && mouseOpts.area && $xetable.handleCellAreaEvent) {
        return $xetable.handleCellAreaEvent(evnt, params);
      } else {
        if (checkboxConfig && checkboxOpts.range) {
          handleCheckboxRangeEvent(evnt, params);
        }

        if (mouseConfig && mouseOpts.selected) {
          if (!editConfig || editOpts.mode === 'cell') {
            $xetable.handleSelected(params, evnt);
          }
        }
      }
    };

    var keyboardMethods = {
      // 处理 Tab 键移动
      moveTabSelected: function moveTabSelected(args, isLeft, evnt) {
        var editConfig = props.editConfig;
        var afterFullData = internalData.afterFullData,
            visibleColumn = internalData.visibleColumn;
        var editOpts = computeEditOpts.value;
        var targetRow;
        var targetRowIndex;
        var targetColumnIndex;
        var params = Object.assign({}, args);

        var _rowIndex = $xetable.getVTRowIndex(params.row);

        var _columnIndex = $xetable.getVTColumnIndex(params.column);

        evnt.preventDefault();

        if (isLeft) {
          // 向左
          if (_columnIndex <= 0) {
            // 如果已经是第一列，则移动到上一行
            if (_rowIndex > 0) {
              targetRowIndex = _rowIndex - 1;
              targetRow = afterFullData[targetRowIndex];
              targetColumnIndex = visibleColumn.length - 1;
            }
          } else {
            targetColumnIndex = _columnIndex - 1;
          }
        } else {
          if (_columnIndex >= visibleColumn.length - 1) {
            // 如果已经是第一列，则移动到上一行
            if (_rowIndex < afterFullData.length - 1) {
              targetRowIndex = _rowIndex + 1;
              targetRow = afterFullData[targetRowIndex];
              targetColumnIndex = 0;
            }
          } else {
            targetColumnIndex = _columnIndex + 1;
          }
        }

        var targetColumn = visibleColumn[targetColumnIndex];

        if (targetColumn) {
          if (targetRow) {
            params.rowIndex = targetRowIndex;
            params.row = targetRow;
          } else {
            params.rowIndex = _rowIndex;
          }

          params.columnIndex = targetColumnIndex;
          params.column = targetColumn;
          params.cell = $xetable.getCell(params.row, params.column);

          if (editConfig) {
            if (editOpts.trigger === 'click' || editOpts.trigger === 'dblclick') {
              if (editOpts.mode === 'row') {
                $xetable.handleActived(params, evnt);
              } else {
                $xetable.scrollToRow(params.row, params.column).then(function () {
                  return $xetable.handleSelected(params, evnt);
                });
              }
            }
          } else {
            $xetable.scrollToRow(params.row, params.column).then(function () {
              return $xetable.handleSelected(params, evnt);
            });
          }
        }
      },
      // 处理当前行方向键移动
      moveCurrentRow: function moveCurrentRow(isUpArrow, isDwArrow, evnt) {
        var treeConfig = props.treeConfig;
        var currentRow = reactData.currentRow;
        var afterFullData = internalData.afterFullData;
        var treeOpts = computeTreeOpts.value;
        var targetRow;
        evnt.preventDefault();

        if (currentRow) {
          if (treeConfig) {
            var _a = _xeUtils.default.findTree(afterFullData, function (item) {
              return item === currentRow;
            }, treeOpts),
                index = _a.index,
                items = _a.items;

            if (isUpArrow && index > 0) {
              targetRow = items[index - 1];
            } else if (isDwArrow && index < items.length - 1) {
              targetRow = items[index + 1];
            }
          } else {
            var _rowIndex = $xetable.getVTRowIndex(currentRow);

            if (isUpArrow && _rowIndex > 0) {
              targetRow = afterFullData[_rowIndex - 1];
            } else if (isDwArrow && _rowIndex < afterFullData.length - 1) {
              targetRow = afterFullData[_rowIndex + 1];
            }
          }
        } else {
          targetRow = afterFullData[0];
        }

        if (targetRow) {
          var params_1 = {
            $table: $xetable,
            row: targetRow,
            rowIndex: $xetable.getRowIndex(targetRow),
            $rowIndex: $xetable.getVMRowIndex(targetRow)
          };
          $xetable.scrollToRow(targetRow).then(function () {
            return $xetable.triggerCurrentRowEvent(evnt, params_1);
          });
        }
      },
      // 处理可编辑方向键移动
      moveSelected: function moveSelected(args, isLeftArrow, isUpArrow, isRightArrow, isDwArrow, evnt) {
        var afterFullData = internalData.afterFullData,
            visibleColumn = internalData.visibleColumn;
        var params = Object.assign({}, args);

        var _rowIndex = $xetable.getVTRowIndex(params.row);

        var _columnIndex = $xetable.getVTColumnIndex(params.column);

        evnt.preventDefault();

        if (isUpArrow && _rowIndex > 0) {
          // 移动到上一行
          params.rowIndex = _rowIndex - 1;
          params.row = afterFullData[params.rowIndex];
        } else if (isDwArrow && _rowIndex < afterFullData.length - 1) {
          // 移动到下一行
          params.rowIndex = _rowIndex + 1;
          params.row = afterFullData[params.rowIndex];
        } else if (isLeftArrow && _columnIndex) {
          // 移动到左侧单元格
          params.columnIndex = _columnIndex - 1;
          params.column = visibleColumn[params.columnIndex];
        } else if (isRightArrow && _columnIndex < visibleColumn.length - 1) {
          // 移动到右侧单元格
          params.columnIndex = _columnIndex + 1;
          params.column = visibleColumn[params.columnIndex];
        }

        $xetable.scrollToRow(params.row, params.column).then(function () {
          params.cell = $xetable.getCell(params.row, params.column);
          $xetable.handleSelected(params, evnt);
        });
      },

      /**
       * 表头单元格按下事件
       */
      triggerHeaderCellMousedownEvent: function triggerHeaderCellMousedownEvent(evnt, params) {
        var mouseConfig = props.mouseConfig;
        var mouseOpts = computeMouseOpts.value;

        if (mouseConfig && mouseOpts.area && $xetable.handleHeaderCellAreaEvent) {
          var cell = evnt.currentTarget;
          var triggerSort = (0, _dom.getEventTargetNode)(evnt, cell, 'vxe-cell--sort').flag;
          var triggerFilter = (0, _dom.getEventTargetNode)(evnt, cell, 'vxe-cell--filter').flag;
          $xetable.handleHeaderCellAreaEvent(evnt, Object.assign({
            cell: cell,
            triggerSort: triggerSort,
            triggerFilter: triggerFilter
          }, params));
        }

        $xetable.focus();

        if ($xetable.closeMenu) {
          $xetable.closeMenu();
        }
      },

      /**
       * 单元格按下事件
       */
      triggerCellMousedownEvent: function triggerCellMousedownEvent(evnt, params) {
        var cell = evnt.currentTarget;
        params.cell = cell;
        handleCellMousedownEvent(evnt, params);
        $xetable.focus();
        $xetable.closeFilter();

        if ($xetable.closeMenu) {
          $xetable.closeMenu();
        }
      }
    };
    return keyboardMethods;
  }
};
var _default = tableKeyboardHook;
exports.default = _default;