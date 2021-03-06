"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = require("vue");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _vXETable = require("../../v-x-e-table");

var _dom = require("../../tools/dom");

var _utils = require("../../tools/utils");

var _event = require("../../tools/event");

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

var tableMenuMethodKeys = ['closeMenu'];
var tableMenuHook = {
  setupTable: function setupTable($xetable) {
    var xID = $xetable.xID,
        props = $xetable.props,
        reactData = $xetable.reactData,
        internalData = $xetable.internalData;

    var _a = $xetable.getRefMaps(),
        refElem = _a.refElem,
        refTableFilter = _a.refTableFilter,
        refTableMenu = _a.refTableMenu;

    var _b = $xetable.getComputeMaps(),
        computeMouseOpts = _b.computeMouseOpts,
        computeIsMenu = _b.computeIsMenu,
        computeMenuOpts = _b.computeMenuOpts;

    var menuMethods = {};
    var menuPrivateMethods = {};
    /**
     * 显示快捷菜单
     */

    var openContextMenu = function openContextMenu(evnt, type, params) {
      var ctxMenuStore = reactData.ctxMenuStore;
      var isMenu = computeIsMenu.value;
      var menuOpts = computeMenuOpts.value;
      var config = menuOpts[type];
      var visibleMethod = menuOpts.visibleMethod;

      if (config) {
        var options_1 = config.options,
            disabled = config.disabled;

        if (disabled) {
          evnt.preventDefault();
        } else if (isMenu && options_1 && options_1.length) {
          params.options = options_1;
          $xetable.preventEvent(evnt, 'event.showMenu', params, function () {
            if (!visibleMethod || visibleMethod(params)) {
              evnt.preventDefault();
              $xetable.updateZindex();

              var _a = (0, _dom.getDomNode)(),
                  scrollTop_1 = _a.scrollTop,
                  scrollLeft_1 = _a.scrollLeft,
                  visibleHeight_1 = _a.visibleHeight,
                  visibleWidth_1 = _a.visibleWidth;

              var top_1 = evnt.clientY + scrollTop_1;
              var left_1 = evnt.clientX + scrollLeft_1;

              var handleVisible_1 = function handleVisible_1() {
                internalData._currMenuParams = params;
                Object.assign(ctxMenuStore, {
                  visible: true,
                  list: options_1,
                  selected: null,
                  selectChild: null,
                  showChild: false,
                  style: {
                    zIndex: internalData.tZindex,
                    top: top_1 + "px",
                    left: left_1 + "px"
                  }
                });
                (0, _vue.nextTick)(function () {
                  var tableMenu = refTableMenu.value;
                  var ctxElem = tableMenu.getRefMaps().refElem.value;
                  var clientHeight = ctxElem.clientHeight;
                  var clientWidth = ctxElem.clientWidth;

                  var _a = (0, _dom.getAbsolutePos)(ctxElem),
                      boundingTop = _a.boundingTop,
                      boundingLeft = _a.boundingLeft;

                  var offsetTop = boundingTop + clientHeight - visibleHeight_1;
                  var offsetLeft = boundingLeft + clientWidth - visibleWidth_1;

                  if (offsetTop > -10) {
                    ctxMenuStore.style.top = Math.max(scrollTop_1 + 2, top_1 - clientHeight - 2) + "px";
                  }

                  if (offsetLeft > -10) {
                    ctxMenuStore.style.left = Math.max(scrollLeft_1 + 2, left_1 - clientWidth - 2) + "px";
                  }
                });
              };

              var keyboard = params.keyboard,
                  row_1 = params.row,
                  column_1 = params.column;

              if (keyboard && row_1 && column_1) {
                $xetable.scrollToRow(row_1, column_1).then(function () {
                  var cell = $xetable.getCell(row_1, column_1);

                  if (cell) {
                    var _a = (0, _dom.getAbsolutePos)(cell),
                        boundingTop = _a.boundingTop,
                        boundingLeft = _a.boundingLeft;

                    top_1 = boundingTop + scrollTop_1 + Math.floor(cell.offsetHeight / 2);
                    left_1 = boundingLeft + scrollLeft_1 + Math.floor(cell.offsetWidth / 2);
                  }

                  handleVisible_1();
                });
              } else {
                handleVisible_1();
              }
            } else {
              menuMethods.closeMenu();
            }
          });
        }
      }

      $xetable.closeFilter();
    };

    menuMethods = {
      /**
       * 关闭快捷菜单
       */
      closeMenu: function closeMenu() {
        Object.assign(reactData.ctxMenuStore, {
          visible: false,
          selected: null,
          selectChild: null,
          showChild: false
        });
        return (0, _vue.nextTick)();
      }
    };
    menuPrivateMethods = {
      /**
       * 处理菜单的移动
       * @param evnt
       * @param ctxMenuStore
       * @param property
       * @param hasOper
       * @param operRest
       * @param menuList
       */
      moveCtxMenu: function moveCtxMenu(evnt, ctxMenuStore, property, hasOper, operRest, menuList) {
        var selectItem;

        var selectIndex = _xeUtils.default.findIndexOf(menuList, function (item) {
          return ctxMenuStore[property] === item;
        });

        if (hasOper) {
          if (operRest && (0, _utils.hasChildrenList)(ctxMenuStore.selected)) {
            ctxMenuStore.showChild = true;
          } else {
            ctxMenuStore.showChild = false;
            ctxMenuStore.selectChild = null;
          }
        } else if ((0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.ARROW_UP)) {
          for (var len = selectIndex - 1; len >= 0; len--) {
            if (menuList[len].visible !== false) {
              selectItem = menuList[len];
              break;
            }
          }

          ctxMenuStore[property] = selectItem || menuList[menuList.length - 1];
        } else if ((0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.ARROW_DOWN)) {
          for (var index = selectIndex + 1; index < menuList.length; index++) {
            if (menuList[index].visible !== false) {
              selectItem = menuList[index];
              break;
            }
          }

          ctxMenuStore[property] = selectItem || menuList[0];
        } else if (ctxMenuStore[property] && ((0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.ENTER) || (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.SPACEBAR))) {
          menuPrivateMethods.ctxMenuLinkEvent(evnt, ctxMenuStore[property]);
        }
      },

      /**
       * 快捷菜单事件处理
       */
      handleGlobalContextmenuEvent: function handleGlobalContextmenuEvent(evnt) {
        var mouseConfig = props.mouseConfig,
            menuConfig = props.menuConfig;
        var editStore = reactData.editStore,
            ctxMenuStore = reactData.ctxMenuStore;
        var visibleColumn = internalData.visibleColumn;
        var tableFilter = refTableFilter.value;
        var tableMenu = refTableMenu.value;
        var mouseOpts = computeMouseOpts.value;
        var menuOpts = computeMenuOpts.value;
        var el = refElem.value;
        var selected = editStore.selected;
        var layoutList = ['header', 'body', 'footer'];

        if ((0, _utils.isEnableConf)(menuConfig)) {
          if (ctxMenuStore.visible && tableMenu && (0, _dom.getEventTargetNode)(evnt, tableMenu.getRefMaps().refElem.value).flag) {
            evnt.preventDefault();
            return;
          }

          if (internalData._keyCtx) {
            var type = 'body';
            var params = {
              type: type,
              $table: $xetable,
              keyboard: true,
              columns: visibleColumn.slice(0),
              $event: evnt
            }; // 如果开启单元格区域

            if (mouseConfig && mouseOpts.area) {
              var activeArea = $xetable.getActiveCellArea();

              if (activeArea && activeArea.row && activeArea.column) {
                params.row = activeArea.row;
                params.column = activeArea.column;
                openContextMenu(evnt, type, params);
                return;
              }
            } else if (mouseConfig && mouseOpts.selected) {
              // 如果启用键盘导航且已选中单元格
              if (selected.row && selected.column) {
                params.row = selected.row;
                params.column = selected.column;
                openContextMenu(evnt, type, params);
                return;
              }
            }
          } // 分别匹配表尾、内容、表尾的快捷菜单


          for (var index = 0; index < layoutList.length; index++) {
            var layout = layoutList[index];
            var columnTargetNode = (0, _dom.getEventTargetNode)(evnt, el, "vxe-" + layout + "--column", function (target) {
              // target=td|th，直接向上找 table 去匹配即可
              return target.parentNode.parentNode.parentNode.getAttribute('xid') === xID;
            });
            var params = {
              type: layout,
              $table: $xetable,
              columns: visibleColumn.slice(0),
              $event: evnt
            };

            if (columnTargetNode.flag) {
              var cell = columnTargetNode.targetElem;
              var columnNodeRest = $xetable.getColumnNode(cell);
              var column = columnNodeRest ? columnNodeRest.item : null;
              var typePrefix = layout + "-";

              if (column) {
                Object.assign(params, {
                  column: column,
                  columnIndex: $xetable.getColumnIndex(column),
                  cell: cell
                });
              }

              if (layout === 'body') {
                var rowNodeRest = $xetable.getRowNode(cell.parentNode);
                var row = rowNodeRest ? rowNodeRest.item : null;
                typePrefix = '';

                if (row) {
                  params.row = row;
                  params.rowIndex = $xetable.getRowIndex(row);
                }
              }

              var eventType = typePrefix + "cell-menu";
              openContextMenu(evnt, layout, params);
              $xetable.dispatchEvent(eventType, params, evnt);
              return;
            } else if ((0, _dom.getEventTargetNode)(evnt, el, "vxe-table--" + layout + "-wrapper", function (target) {
              return target.getAttribute('xid') === xID;
            }).flag) {
              if (menuOpts.trigger === 'cell') {
                evnt.preventDefault();
              } else {
                openContextMenu(evnt, layout, params);
              }

              return;
            }
          }
        }

        if (tableFilter && !(0, _dom.getEventTargetNode)(evnt, tableFilter.$el).flag) {
          $xetable.closeFilter();
        }

        menuMethods.closeMenu();
      },
      ctxMenuMouseoverEvent: function ctxMenuMouseoverEvent(evnt, item, child) {
        var menuElem = evnt.currentTarget;
        var ctxMenuStore = reactData.ctxMenuStore;
        evnt.preventDefault();
        evnt.stopPropagation();
        ctxMenuStore.selected = item;
        ctxMenuStore.selectChild = child;

        if (!child) {
          ctxMenuStore.showChild = (0, _utils.hasChildrenList)(item);

          if (ctxMenuStore.showChild) {
            (0, _vue.nextTick)(function () {
              var childWrapperElem = menuElem.nextElementSibling;

              if (childWrapperElem) {
                var _a = (0, _dom.getAbsolutePos)(menuElem),
                    boundingTop = _a.boundingTop,
                    boundingLeft = _a.boundingLeft,
                    visibleHeight = _a.visibleHeight,
                    visibleWidth = _a.visibleWidth;

                var posTop = boundingTop + menuElem.offsetHeight;
                var posLeft = boundingLeft + menuElem.offsetWidth;
                var left = '';
                var right = ''; // 是否超出右侧

                if (posLeft + childWrapperElem.offsetWidth > visibleWidth - 10) {
                  left = 'auto';
                  right = menuElem.offsetWidth + "px";
                } // 是否超出底部


                var top_2 = '';
                var bottom = '';

                if (posTop + childWrapperElem.offsetHeight > visibleHeight - 10) {
                  top_2 = 'auto';
                  bottom = '0';
                }

                childWrapperElem.style.left = left;
                childWrapperElem.style.right = right;
                childWrapperElem.style.top = top_2;
                childWrapperElem.style.bottom = bottom;
              }
            });
          }
        }
      },
      ctxMenuMouseoutEvent: function ctxMenuMouseoutEvent(evnt, item) {
        var ctxMenuStore = reactData.ctxMenuStore;

        if (!item.children) {
          ctxMenuStore.selected = null;
        }

        ctxMenuStore.selectChild = null;
      },

      /**
       * 快捷菜单点击事件
       */
      ctxMenuLinkEvent: function ctxMenuLinkEvent(evnt, menu) {
        // 如果一级菜单有配置 code 则允许点击，否则不能点击
        if (!menu.disabled && (menu.code || !menu.children || !menu.children.length)) {
          var ctxMenuMethod = _vXETable.VXETable.menus.get(menu.code);

          var params = Object.assign({}, internalData._currMenuParams, {
            menu: menu,
            $table: $xetable,
            $grid: $xetable.xegrid,
            $event: evnt
          });

          if (ctxMenuMethod) {
            ctxMenuMethod(params, evnt);
          }

          $xetable.dispatchEvent('menu-click', params, evnt);
          menuMethods.closeMenu();
        }
      }
    };
    return __assign(__assign({}, menuMethods), menuPrivateMethods);
  },
  setupGrid: function setupGrid($xegrid) {
    return $xegrid.extendTableMethods(tableMenuMethodKeys);
  }
};
var _default = tableMenuHook;
exports.default = _default;