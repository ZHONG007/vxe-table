"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = require("vue");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _vXETable = require("../../v-x-e-table");

var _utils = require("../../tools/utils");

var _util = require("../../table/src/util");

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

var __spreadArray = void 0 && (void 0).__spreadArray || function (to, from) {
  for (var i = 0, il = from.length, j = to.length; i < il; i++, j++) {
    to[j] = from[i];
  }

  return to;
};

var tableEditMethodKeys = ['insert', 'insertAt', 'remove', 'removeCheckboxRow', 'removeRadioRow', 'removeCurrentRow', 'getRecordset', 'getInsertRecords', 'getRemoveRecords', 'getUpdateRecords', 'getActiveRecord', 'getSelectedCell', 'clearActived', 'clearSelected', 'isActiveByRow', 'setActiveRow', 'setActiveCell', 'setSelectCell'];
var editHook = {
  setupTable: function setupTable($xetable) {
    var props = $xetable.props,
        reactData = $xetable.reactData,
        internalData = $xetable.internalData;
    var refElem = $xetable.getRefMaps().refElem;

    var _a = $xetable.getComputeMaps(),
        computeMouseOpts = _a.computeMouseOpts,
        computeEditOpts = _a.computeEditOpts,
        computeCheckboxOpts = _a.computeCheckboxOpts,
        computeSYOpts = _a.computeSYOpts,
        computeTreeOpts = _a.computeTreeOpts;

    var editMethods = {};
    var editPrivateMethods = {};

    var getEditColumnModel = function getEditColumnModel(row, column) {
      var model = column.model,
          editRender = column.editRender;

      if (editRender) {
        model.value = (0, _util.getCellValue)(row, column);
        model.update = false;
      }
    };

    var setEditColumnModel = function setEditColumnModel(row, column) {
      var model = column.model,
          editRender = column.editRender;

      if (editRender && model.update) {
        (0, _util.setCellValue)(row, column, model.value);
        model.update = false;
        model.value = null;
      }
    };

    var removeCellSelectedClass = function removeCellSelectedClass() {
      var el = refElem.value;

      if (el) {
        var cell = el.querySelector('.col--selected');

        if (cell) {
          (0, _dom.removeClass)(cell, 'col--selected');
        }
      }
    };

    function syncActivedCell() {
      var editStore = reactData.editStore,
          tableColumn = reactData.tableColumn;
      var editOpts = computeEditOpts.value;
      var actived = editStore.actived;
      var row = actived.row,
          column = actived.column;

      if (row || column) {
        if (editOpts.mode === 'row') {
          tableColumn.forEach(function (column) {
            return setEditColumnModel(row, column);
          });
        } else {
          setEditColumnModel(row, column);
        }
      }
    }

    editMethods = {
      /**
       * 往表格中插入临时数据
       *
       * @param {*} records
       */
      insert: function insert(records) {
        return editMethods.insertAt(records, null);
      },

      /**
       * 往表格指定行中插入临时数据
       * 如果 row 为空则从插入到顶部
       * 如果 row 为 -1 则从插入到底部
       * 如果 row 为有效行则插入到该行的位置
       * @param {Object/Array} records 新的数据
       * @param {Row} row 指定行
       */
      insertAt: function insertAt(records, row) {
        var _a;

        var treeConfig = props.treeConfig;
        var mergeList = reactData.mergeList,
            editStore = reactData.editStore,
            scrollYLoad = reactData.scrollYLoad;
        var afterFullData = internalData.afterFullData,
            tableFullData = internalData.tableFullData;
        var sYOpts = computeSYOpts.value;

        if (!_xeUtils.default.isArray(records)) {
          records = [records];
        }

        var newRecords = records.map(function (record) {
          return $xetable.defineField(Object.assign({}, record));
        });

        if (!row) {
          afterFullData.unshift.apply(afterFullData, newRecords);
          tableFullData.unshift.apply(tableFullData, newRecords); // 刷新单元格合并

          mergeList.forEach(function (mergeItem) {
            var mergeRowIndex = mergeItem.row;

            if (mergeRowIndex > 0) {
              mergeItem.row = mergeRowIndex + newRecords.length;
            }
          });
        } else {
          if (row === -1) {
            afterFullData.push.apply(afterFullData, newRecords);
            tableFullData.push.apply(tableFullData, newRecords); // 刷新单元格合并

            mergeList.forEach(function (mergeItem) {
              var mergeRowIndex = mergeItem.row,
                  mergeRowspan = mergeItem.rowspan;

              if (mergeRowIndex + mergeRowspan > afterFullData.length) {
                mergeItem.rowspan = mergeRowspan + newRecords.length;
              }
            });
          } else {
            if (treeConfig) {
              throw new Error((0, _utils.getLog)('vxe.error.noTree', ['insert']));
            }

            var afIndex_1 = $xetable.findRowIndexOf(afterFullData, row);

            if (afIndex_1 === -1) {
              throw new Error((0, _utils.errLog)('vxe.error.unableInsert'));
            }

            afterFullData.splice.apply(afterFullData, __spreadArray([afIndex_1, 0], newRecords));
            tableFullData.splice.apply(tableFullData, __spreadArray([$xetable.findRowIndexOf(tableFullData, row), 0], newRecords)); // 刷新单元格合并

            mergeList.forEach(function (mergeItem) {
              var mergeRowIndex = mergeItem.row,
                  mergeRowspan = mergeItem.rowspan;

              if (mergeRowIndex > afIndex_1) {
                mergeItem.row = mergeRowIndex + newRecords.length;
              } else if (mergeRowIndex + mergeRowspan > afIndex_1) {
                mergeItem.rowspan = mergeRowspan + newRecords.length;
              }
            });
          }
        }

        (_a = editStore.insertList).unshift.apply(_a, newRecords);

        reactData.scrollYLoad = !treeConfig && sYOpts.gt > -1 && sYOpts.gt < tableFullData.length;
        $xetable.updateFooter();
        $xetable.updateCache();
        $xetable.handleTableData();
        $xetable.updateAfterDataIndex();
        $xetable.checkSelectionStatus();

        if (scrollYLoad) {
          $xetable.updateScrollYSpace();
        }

        return (0, _vue.nextTick)().then(function () {
          $xetable.updateCellAreas();
          return $xetable.recalculate();
        }).then(function () {
          return {
            row: newRecords.length ? newRecords[newRecords.length - 1] : null,
            rows: newRecords
          };
        });
      },

      /**
       * 删除指定行数据
       * 如果传 row 则删除一行
       * 如果传 rows 则删除多行
       * 如果为空则删除所有
       */
      remove: function remove(rows) {
        var treeConfig = props.treeConfig;
        var mergeList = reactData.mergeList,
            editStore = reactData.editStore,
            selection = reactData.selection,
            scrollYLoad = reactData.scrollYLoad;
        var afterFullData = internalData.afterFullData,
            tableFullData = internalData.tableFullData;
        var checkboxOpts = computeCheckboxOpts.value;
        var sYOpts = computeSYOpts.value;
        var actived = editStore.actived,
            removeList = editStore.removeList,
            insertList = editStore.insertList;
        var property = checkboxOpts.checkField;
        var rest = [];

        if (!rows) {
          rows = tableFullData;
        } else if (!_xeUtils.default.isArray(rows)) {
          rows = [rows];
        } // 如果是新增，则保存记录


        rows.forEach(function (row) {
          if (!$xetable.isInsertByRow(row)) {
            removeList.push(row);
          }
        }); // 如果绑定了多选属性，则更新状态

        if (!property) {
          rows.forEach(function (row) {
            var sIndex = $xetable.findRowIndexOf(selection, row);

            if (sIndex > -1) {
              selection.splice(sIndex, 1);
            }
          });
        } // 从数据源中移除


        if (tableFullData === rows) {
          rows = rest = tableFullData.slice(0);
          internalData.tableFullData = [];
          internalData.afterFullData = [];
          $xetable.clearMergeCells();
        } else {
          rows.forEach(function (row) {
            var tfIndex = $xetable.findRowIndexOf(tableFullData, row);

            if (tfIndex > -1) {
              var rItems = tableFullData.splice(tfIndex, 1);
              rest.push(rItems[0]);
            }

            var afIndex = $xetable.findRowIndexOf(afterFullData, row);

            if (afIndex > -1) {
              // 刷新单元格合并
              mergeList.forEach(function (mergeItem) {
                var mergeRowIndex = mergeItem.row,
                    mergeRowspan = mergeItem.rowspan;

                if (mergeRowIndex > afIndex) {
                  mergeItem.row = mergeRowIndex - 1;
                } else if (mergeRowIndex + mergeRowspan > afIndex) {
                  mergeItem.rowspan = mergeRowspan - 1;
                }
              });
              afterFullData.splice(afIndex, 1);
            }
          });
        } // 如果当前行被激活编辑，则清除激活状态


        if (actived.row && $xetable.findRowIndexOf(rows, actived.row) > -1) {
          editMethods.clearActived();
        } // 从新增中移除已删除的数据


        rows.forEach(function (row) {
          var iIndex = $xetable.findRowIndexOf(insertList, row);

          if (iIndex > -1) {
            insertList.splice(iIndex, 1);
          }
        });
        reactData.scrollYLoad = !treeConfig && sYOpts.gt > -1 && sYOpts.gt < tableFullData.length;
        $xetable.updateFooter();
        $xetable.updateCache();
        $xetable.handleTableData();
        $xetable.updateAfterDataIndex();
        $xetable.checkSelectionStatus();

        if (scrollYLoad) {
          $xetable.updateScrollYSpace();
        }

        return (0, _vue.nextTick)().then(function () {
          $xetable.updateCellAreas();
          return $xetable.recalculate();
        }).then(function () {
          return {
            row: rest.length ? rest[rest.length - 1] : null,
            rows: rest
          };
        });
      },

      /**
       * 删除复选框选中的数据
       */
      removeCheckboxRow: function removeCheckboxRow() {
        return editMethods.remove($xetable.getCheckboxRecords()).then(function (params) {
          $xetable.clearCheckboxRow();
          return params;
        });
      },

      /**
       * 删除单选框选中的数据
       */
      removeRadioRow: function removeRadioRow() {
        var radioRecord = $xetable.getRadioRecord();
        return editMethods.remove(radioRecord || []).then(function (params) {
          $xetable.clearRadioRow();
          return params;
        });
      },

      /**
       * 删除当前行选中的数据
       */
      removeCurrentRow: function removeCurrentRow() {
        var currentRecord = $xetable.getCurrentRecord();
        return editMethods.remove(currentRecord || []).then(function (params) {
          $xetable.clearCurrentRow();
          return params;
        });
      },

      /**
       * 获取表格数据集，包含新增、删除、修改
       */
      getRecordset: function getRecordset() {
        return {
          insertRecords: editMethods.getInsertRecords(),
          removeRecords: editMethods.getRemoveRecords(),
          updateRecords: editMethods.getUpdateRecords()
        };
      },

      /**
       * 获取新增的临时数据
       */
      getInsertRecords: function getInsertRecords() {
        var editStore = reactData.editStore;
        var tableFullData = internalData.tableFullData;
        var insertList = editStore.insertList;
        var insertRecords = [];

        if (insertList.length) {
          tableFullData.forEach(function (row) {
            if ($xetable.findRowIndexOf(insertList, row) > -1) {
              insertRecords.push(row);
            }
          });
        }

        return insertRecords;
      },

      /**
       * 获取已删除的数据
       */
      getRemoveRecords: function getRemoveRecords() {
        var editStore = reactData.editStore;
        return editStore.removeList;
      },

      /**
       * 获取更新数据
       * 只精准匹配 row 的更改
       * 如果是树表格，子节点更改状态不会影响父节点的更新状态
       */
      getUpdateRecords: function getUpdateRecords() {
        var keepSource = props.keepSource,
            treeConfig = props.treeConfig;
        var tableFullData = internalData.tableFullData;
        var treeOpts = computeTreeOpts.value;

        if (keepSource) {
          syncActivedCell();

          if (treeConfig) {
            return _xeUtils.default.filterTree(tableFullData, function (row) {
              return $xetable.isUpdateByRow(row);
            }, treeOpts);
          }

          return tableFullData.filter(function (row) {
            return $xetable.isUpdateByRow(row);
          });
        }

        return [];
      },
      getActiveRecord: function getActiveRecord() {
        var editStore = reactData.editStore;
        var afterFullData = internalData.afterFullData;
        var el = refElem.value;
        var _a = editStore.actived,
            args = _a.args,
            row = _a.row;

        if (args && $xetable.findRowIndexOf(afterFullData, row) > -1 && el.querySelectorAll('.vxe-body--column.col--actived').length) {
          return Object.assign({}, args);
        }

        return null;
      },

      /**
       * 获取选中的单元格
       */
      getSelectedCell: function getSelectedCell() {
        var editStore = reactData.editStore;
        var _a = editStore.selected,
            args = _a.args,
            column = _a.column;

        if (args && column) {
          return Object.assign({}, args);
        }

        return null;
      },

      /**
       * 清除激活的编辑
       */
      clearActived: function clearActived(evnt) {
        var editStore = reactData.editStore;
        var actived = editStore.actived;
        var row = actived.row,
            column = actived.column;

        if (row || column) {
          syncActivedCell();
          actived.args = null;
          actived.row = null;
          actived.column = null;
          $xetable.updateFooter();
          $xetable.dispatchEvent('edit-closed', {
            row: row,
            rowIndex: $xetable.getRowIndex(row),
            $rowIndex: $xetable.getVMRowIndex(row),
            column: column,
            columnIndex: $xetable.getColumnIndex(column),
            $columnIndex: $xetable.getVMColumnIndex(column)
          }, evnt || null);
        }

        return ($xetable.clearValidate ? $xetable.clearValidate() : (0, _vue.nextTick)()).then(function () {
          return $xetable.recalculate();
        });
      },

      /**
       * 清除所选中源状态
       */
      clearSelected: function clearSelected() {
        var editStore = reactData.editStore;
        var selected = editStore.selected;
        selected.row = null;
        selected.column = null;
        removeCellSelectedClass();
        return (0, _vue.nextTick)();
      },

      /**
       * 判断行是否为激活编辑状态
       * @param {Row} row 行对象
       */
      isActiveByRow: function isActiveByRow(row) {
        var editStore = reactData.editStore;
        return editStore.actived.row === row;
      },

      /**
       * 激活行编辑
       */
      setActiveRow: function setActiveRow(row) {
        var visibleColumn = internalData.visibleColumn;
        return $xetable.setActiveCell(row, _xeUtils.default.find(visibleColumn, function (column) {
          return (0, _utils.isEnableConf)(column.editRender);
        }));
      },

      /**
       * 激活单元格编辑
       */
      setActiveCell: function setActiveCell(row, fieldOrColumn) {
        var editConfig = props.editConfig;
        var column = _xeUtils.default.isString(fieldOrColumn) ? $xetable.getColumnByField(fieldOrColumn) : fieldOrColumn;

        if (row && column && (0, _utils.isEnableConf)(editConfig) && (0, _utils.isEnableConf)(column.editRender)) {
          return $xetable.scrollToRow(row, column).then(function () {
            var cell = $xetable.getCell(row, column);

            if (cell) {
              editPrivateMethods.handleActived({
                row: row,
                rowIndex: $xetable.getRowIndex(row),
                column: column,
                columnIndex: $xetable.getColumnIndex(column),
                cell: cell,
                $table: $xetable
              });
              internalData._lastCallTime = Date.now();
            }

            return (0, _vue.nextTick)();
          });
        }

        return (0, _vue.nextTick)();
      },

      /**
       * 只对 trigger=dblclick 有效，选中单元格
       */
      setSelectCell: function setSelectCell(row, fieldOrColumn) {
        var tableData = reactData.tableData;
        var visibleColumn = internalData.visibleColumn;
        var editOpts = computeEditOpts.value;
        var column = _xeUtils.default.isString(fieldOrColumn) ? $xetable.getColumnByField(fieldOrColumn) : fieldOrColumn;

        if (row && column && editOpts.trigger !== 'manual') {
          var rowIndex = $xetable.findRowIndexOf(tableData, row);

          if (rowIndex > -1 && column) {
            var cell = $xetable.getCell(row, column);
            var params = {
              row: row,
              rowIndex: rowIndex,
              column: column,
              columnIndex: visibleColumn.indexOf(column),
              cell: cell
            };
            $xetable.handleSelected(params, {});
          }
        }

        return (0, _vue.nextTick)();
      }
    };
    editPrivateMethods = {
      /**
       * 处理激活编辑
       */
      handleActived: function handleActived(params, evnt) {
        var editConfig = props.editConfig,
            mouseConfig = props.mouseConfig;
        var editStore = reactData.editStore,
            tableColumn = reactData.tableColumn;
        var editOpts = computeEditOpts.value;
        var mode = editOpts.mode,
            activeMethod = editOpts.activeMethod;
        var actived = editStore.actived;
        var row = params.row,
            column = params.column;
        var editRender = column.editRender;
        var cell = params.cell = params.cell || $xetable.getCell(row, column);

        if ((0, _utils.isEnableConf)(editConfig) && (0, _utils.isEnableConf)(editRender) && cell) {
          if (actived.row !== row || (mode === 'cell' ? actived.column !== column : false)) {
            // 判断是否禁用编辑
            var type = 'edit-disabled';

            if (!activeMethod || activeMethod(params)) {
              if (mouseConfig) {
                editMethods.clearSelected();

                if ($xetable.clearCellAreas) {
                  $xetable.clearCellAreas();
                  $xetable.clearCopyCellArea();
                }
              }

              $xetable.closeTooltip();
              editMethods.clearActived(evnt);
              type = 'edit-actived';
              column.renderHeight = cell.offsetHeight;
              actived.args = params;
              actived.row = row;
              actived.column = column;

              if (mode === 'row') {
                tableColumn.forEach(function (column) {
                  return getEditColumnModel(row, column);
                });
              } else {
                getEditColumnModel(row, column);
              }

              (0, _vue.nextTick)(function () {
                editPrivateMethods.handleFocus(params, evnt);
              });
            }

            $xetable.dispatchEvent(type, {
              row: row,
              rowIndex: $xetable.getRowIndex(row),
              $rowIndex: $xetable.getVMRowIndex(row),
              column: column,
              columnIndex: $xetable.getColumnIndex(column),
              $columnIndex: $xetable.getVMColumnIndex(column)
            }, evnt);
          } else {
            var oldColumn = actived.column;

            if (mouseConfig) {
              editMethods.clearSelected();

              if ($xetable.clearCellAreas) {
                $xetable.clearCellAreas();
                $xetable.clearCopyCellArea();
              }
            }

            if (oldColumn !== column) {
              var oldModel = oldColumn.model;

              if (oldModel.update) {
                (0, _util.setCellValue)(row, oldColumn, oldModel.value);
              }

              if ($xetable.clearValidate) {
                $xetable.clearValidate();
              }
            }

            column.renderHeight = cell.offsetHeight;
            actived.args = params;
            actived.column = column;
            setTimeout(function () {
              editPrivateMethods.handleFocus(params, evnt);
            });
          }

          $xetable.focus();
        }

        return (0, _vue.nextTick)();
      },

      /**
       * 处理聚焦
       */
      handleFocus: function handleFocus(params) {
        var row = params.row,
            column = params.column,
            cell = params.cell;
        var editRender = column.editRender;

        if ((0, _utils.isEnableConf)(editRender)) {
          var compRender = _vXETable.renderer.get(editRender.name);

          var autofocus = editRender.autofocus,
              autoselect = editRender.autoselect;
          var inputElem // 如果指定了聚焦 class
          = void 0; // 如果指定了聚焦 class

          if (autofocus) {
            inputElem = cell.querySelector(autofocus);
          } // 渲染器的聚焦处理


          if (!inputElem && compRender && compRender.autofocus) {
            inputElem = cell.querySelector(compRender.autofocus);
          }

          if (inputElem) {
            inputElem.focus();

            if (autoselect) {
              inputElem.select();
            } else {
              // 保持一致行为，光标移到末端
              if (_dom.browse.msie) {
                var textRange = inputElem.createTextRange();
                textRange.collapse(false);
                textRange.select();
              }
            }
          } else {
            // 显示到可视区中
            $xetable.scrollToRow(row, column);
          }
        }
      },

      /**
       * 处理选中源
       */
      handleSelected: function handleSelected(params, evnt) {
        var mouseConfig = props.mouseConfig;
        var editStore = reactData.editStore;
        var mouseOpts = computeMouseOpts.value;
        var editOpts = computeEditOpts.value;
        var actived = editStore.actived,
            selected = editStore.selected;
        var row = params.row,
            column = params.column;
        var isMouseSelected = mouseConfig && mouseOpts.selected;

        var selectMethod = function selectMethod() {
          if (isMouseSelected && (selected.row !== row || selected.column !== column)) {
            if (actived.row !== row || (editOpts.mode === 'cell' ? actived.column !== column : false)) {
              editMethods.clearActived(evnt);
              editMethods.clearSelected();

              if ($xetable.clearCellAreas) {
                $xetable.clearCellAreas();
                $xetable.clearCopyCellArea();
              }

              selected.args = params;
              selected.row = row;
              selected.column = column;

              if (isMouseSelected) {
                editPrivateMethods.addCellSelectedClass();
              }

              $xetable.focus();
            }
          }

          return (0, _vue.nextTick)();
        };

        return selectMethod();
      },
      addCellSelectedClass: function addCellSelectedClass() {
        var editStore = reactData.editStore;
        var selected = editStore.selected;
        var row = selected.row,
            column = selected.column;
        removeCellSelectedClass();

        if (row && column) {
          var cell = $xetable.getCell(row, column);

          if (cell) {
            (0, _dom.addClass)(cell, 'col--selected');
          }
        }
      }
    };
    return __assign(__assign({}, editMethods), editPrivateMethods);
  },
  setupGrid: function setupGrid($xegrid) {
    return $xegrid.extendTableMethods(tableEditMethodKeys);
  }
};
var _default = editHook;
exports.default = _default;