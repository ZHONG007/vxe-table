"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = require("vue");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _vXETable = require("../../v-x-e-table");

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

var tableFilterMethodKeys = ['setFilter', 'clearFilter', 'getCheckedFilters'];
var tableFilterHook = {
  setupTable: function setupTable($xetable) {
    var reactData = $xetable.reactData,
        internalData = $xetable.internalData;

    var _a = $xetable.getRefMaps(),
        refTableBody = _a.refTableBody,
        refTableFilter = _a.refTableFilter;

    var computeFilterOpts = $xetable.getComputeMaps().computeFilterOpts;
    var filterPrivateMethods = {
      checkFilterOptions: function checkFilterOptions() {
        var filterStore = reactData.filterStore;
        filterStore.isAllSelected = filterStore.options.every(function (item) {
          return item._checked;
        });
        filterStore.isIndeterminate = !filterStore.isAllSelected && filterStore.options.some(function (item) {
          return item._checked;
        });
      },

      /**
       * 点击筛选事件
       * 当筛选图标被点击时触发
       * 更新选项是否全部状态
       * 打开筛选面板
       * @param {Event} evnt 事件
       * @param {ColumnInfo} column 列配置
       * @param {Object} params 参数
       */
      triggerFilterEvent: function triggerFilterEvent(evnt, column, params) {
        var initStore = reactData.initStore,
            filterStore = reactData.filterStore;

        if (filterStore.column === column && filterStore.visible) {
          filterStore.visible = false;
        } else {
          var targetElem_1 = evnt.target,
              pageX_1 = evnt.pageX;
          var visibleWidth_1 = (0, _dom.getDomNode)().visibleWidth;
          var filters = column.filters,
              filterMultiple = column.filterMultiple,
              filterRender = column.filterRender;
          var compConf = filterRender ? _vXETable.VXETable.renderer.get(filterRender.name) : null;
          var filterRecoverMethod_1 = column.filterRecoverMethod || (compConf ? compConf.filterRecoverMethod : null);
          internalData._currFilterParams = params;
          Object.assign(filterStore, {
            multiple: filterMultiple,
            options: filters,
            column: column,
            style: null
          }); // 复原状态

          filterStore.options.forEach(function (option) {
            var _checked = option._checked,
                checked = option.checked;
            option._checked = checked;

            if (!checked && _checked !== checked) {
              if (filterRecoverMethod_1) {
                filterRecoverMethod_1({
                  option: option,
                  column: column,
                  $table: $xetable
                });
              }
            }
          });
          this.checkFilterOptions();
          filterStore.visible = true;
          initStore.filter = true;
          (0, _vue.nextTick)(function () {
            var tableBody = refTableBody.value;
            var bodyElem = tableBody.$el;
            var tableFilter = refTableFilter.value;
            var filterWrapperElem = tableFilter ? tableFilter.$el : null;
            var filterWidth = 0;
            var filterHeight = 0;
            var filterHeadElem = null;
            var filterFootElem = null;

            if (filterWrapperElem) {
              filterWidth = filterWrapperElem.offsetWidth;
              filterHeight = filterWrapperElem.offsetHeight;
              filterHeadElem = filterWrapperElem.querySelector('.vxe-table--filter-header');
              filterFootElem = filterWrapperElem.querySelector('.vxe-table--filter-footer');
            }

            var centerWidth = filterWidth / 2;
            var minMargin = 10;
            var maxLeft = bodyElem.clientWidth - filterWidth - minMargin;
            var left, right;
            var style = {
              top: targetElem_1.offsetTop + targetElem_1.offsetParent.offsetTop + targetElem_1.offsetHeight + 8 + "px"
            }; // 判断面板不能大于表格高度

            var maxHeight = null;

            if (filterHeight >= bodyElem.clientHeight) {
              maxHeight = bodyElem.clientHeight - (filterFootElem ? filterFootElem.offsetHeight : 0) - (filterHeadElem ? filterHeadElem.offsetHeight : 0);
            }

            if (column.fixed === 'left') {
              left = targetElem_1.offsetLeft + targetElem_1.offsetParent.offsetLeft - centerWidth;
            } else if (column.fixed === 'right') {
              right = targetElem_1.offsetParent.offsetWidth - targetElem_1.offsetLeft + (targetElem_1.offsetParent.offsetParent.offsetWidth - targetElem_1.offsetParent.offsetLeft) - column.renderWidth - centerWidth;
            } else {
              left = targetElem_1.offsetLeft + targetElem_1.offsetParent.offsetLeft - centerWidth - bodyElem.scrollLeft;
            }

            if (left) {
              var overflowWidth = pageX_1 + filterWidth - centerWidth + minMargin - visibleWidth_1;

              if (overflowWidth > 0) {
                left -= overflowWidth;
              }

              style.left = Math.min(maxLeft, Math.max(minMargin, left)) + "px";
            } else if (right) {
              var overflowWidth = pageX_1 + filterWidth - centerWidth + minMargin - visibleWidth_1;

              if (overflowWidth > 0) {
                right += overflowWidth;
              }

              style.right = Math.max(minMargin, right) + "px";
            }

            filterStore.style = style;
            filterStore.maxHeight = maxHeight;
          });
        }
      },
      handleClearFilter: function handleClearFilter(column) {
        if (column) {
          var filters = column.filters,
              filterRender = column.filterRender;

          if (filters) {
            var compConf = filterRender ? _vXETable.VXETable.renderer.get(filterRender.name) : null;
            var filterResetMethod_1 = column.filterResetMethod || (compConf ? compConf.filterResetMethod : null);
            filters.forEach(function (item) {
              item._checked = false;
              item.checked = false;

              if (!filterResetMethod_1) {
                item.data = _xeUtils.default.clone(item.resetValue, true);
              }
            });

            if (filterResetMethod_1) {
              filterResetMethod_1({
                options: filters,
                column: column,
                $table: $xetable
              });
            }
          }
        }
      },

      /**
       * 确认筛选
       * 当筛选面板中的确定按钮被按下时触发
       * @param {Event} evnt 事件
       */
      confirmFilterEvent: function confirmFilterEvent(evnt) {
        var filterStore = reactData.filterStore,
            scrollXLoad = reactData.scrollXLoad,
            scrollYLoad = reactData.scrollYLoad;
        var filterOpts = computeFilterOpts.value;
        var column = filterStore.column;
        var property = column.property;
        var values = [];
        var datas = [];
        column.filters.forEach(function (item) {
          if (item.checked) {
            values.push(item.value);
            datas.push(item.data);
          }
        });
        filterStore.visible = false;
        var filterList = $xetable.getCheckedFilters(); // 如果是服务端筛选，则跳过本地筛选处理

        if (!filterOpts.remote) {
          $xetable.handleTableData(true);
          $xetable.checkSelectionStatus();
          $xetable.updateFooter();

          if (scrollXLoad || scrollYLoad) {
            $xetable.clearScroll();

            if (scrollYLoad) {
              $xetable.updateScrollYSpace();
            }
          }
        }

        $xetable.dispatchEvent('filter-change', {
          column: column,
          property: property,
          values: values,
          datas: datas,
          filters: filterList,
          filterList: filterList
        }, evnt);
        $xetable.closeFilter();
        (0, _vue.nextTick)(function () {
          $xetable.recalculate();
          $xetable.updateCellAreas();
        });
      }
    };
    var filterMethods = {
      /**
       * 修改筛选条件列表
       * @param {ColumnInfo} fieldOrColumn 列或字段名
       * @param {Array} options 选项
       */
      setFilter: function setFilter(fieldOrColumn, options) {
        var column = (0, _util.handleFieldOrColumn)($xetable, fieldOrColumn);

        if (column && column.filters && options) {
          column.filters = (0, _util.toFilters)(options);
        }

        return (0, _vue.nextTick)();
      },

      /**
       * 清空指定列的筛选条件
       * 如果为空则清空所有列的筛选条件
       * @param {String} fieldOrColumn 列或字段名
       */
      clearFilter: function clearFilter(fieldOrColumn) {
        var filterStore = reactData.filterStore;
        var tableFullColumn = internalData.tableFullColumn;
        var filterOpts = computeFilterOpts.value;
        var column;

        if (fieldOrColumn) {
          column = (0, _util.handleFieldOrColumn)($xetable, fieldOrColumn);

          if (column) {
            filterPrivateMethods.handleClearFilter(column);
          }
        } else {
          tableFullColumn.forEach(filterPrivateMethods.handleClearFilter);
        }

        if (!fieldOrColumn || column !== filterStore.column) {
          Object.assign(filterStore, {
            isAllSelected: false,
            isIndeterminate: false,
            style: null,
            options: [],
            column: null,
            multiple: false,
            visible: false
          });
        }

        if (!filterOpts.remote) {
          return $xetable.updateData();
        }

        return (0, _vue.nextTick)();
      },
      getCheckedFilters: function getCheckedFilters() {
        var tableFullColumn = internalData.tableFullColumn;
        var filterList = [];
        tableFullColumn.filter(function (column) {
          var property = column.property,
              filters = column.filters;
          var valueList = [];
          var dataList = [];

          if (filters && filters.length) {
            filters.forEach(function (item) {
              if (item.checked) {
                valueList.push(item.value);
                dataList.push(item.data);
              }
            });

            if (valueList.length) {
              filterList.push({
                column: column,
                property: property,
                values: valueList,
                datas: dataList
              });
            }
          }
        });
        return filterList;
      }
    };
    return __assign(__assign({}, filterMethods), filterPrivateMethods);
  },
  setupGrid: function setupGrid($xegrid) {
    return $xegrid.extendTableMethods(tableFilterMethodKeys);
  }
};
var _default = tableFilterHook;
exports.default = _default;