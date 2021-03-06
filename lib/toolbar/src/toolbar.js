"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = require("vue");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _conf = _interopRequireDefault(require("../../v-x-e-table/src/conf"));

var _vXETable = require("../../v-x-e-table");

var _size = require("../../hooks/size");

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

var _default2 = (0, _vue.defineComponent)({
  name: 'VxeToolbar',
  props: {
    loading: Boolean,
    refresh: [Boolean, Object],
    import: [Boolean, Object],
    export: [Boolean, Object],
    print: [Boolean, Object],
    zoom: [Boolean, Object],
    custom: [Boolean, Object],
    buttons: {
      type: Array,
      default: function _default() {
        return _conf.default.toolbar.buttons;
      }
    },
    tools: {
      type: Array,
      default: function _default() {
        return _conf.default.toolbar.tools;
      }
    },
    perfect: {
      type: Boolean,
      default: function _default() {
        return _conf.default.toolbar.perfect;
      }
    },
    size: {
      type: String,
      default: function _default() {
        return _conf.default.toolbar.size || _conf.default.size;
      }
    },
    className: [String, Function]
  },
  emits: ['button-click', 'tool-click'],
  setup: function setup(props, context) {
    var slots = context.slots,
        emit = context.emit;

    var xID = _xeUtils.default.uniqueId();

    var computeSize = (0, _size.useSize)(props);
    var reactData = (0, _vue.reactive)({
      isRefresh: false,
      columns: []
    });
    var refElem = (0, _vue.ref)();
    var refCustomWrapper = (0, _vue.ref)();
    var customStore = (0, _vue.reactive)({
      isAll: false,
      isIndeterminate: false,
      activeBtn: false,
      activeWrapper: false,
      visible: false
    });
    var refMaps = {
      refElem: refElem
    };
    var $xetoolbar = {
      xID: xID,
      props: props,
      context: context,
      reactData: reactData,
      getRefMaps: function getRefMaps() {
        return refMaps;
      }
    };
    var toolbarMethods = {};
    var $xegrid = (0, _vue.inject)('$xegrid', null);
    var $xetable;
    var computeRefreshOpts = (0, _vue.computed)(function () {
      return Object.assign({}, _conf.default.toolbar.refresh, props.refresh);
    });
    var computeImportOpts = (0, _vue.computed)(function () {
      return Object.assign({}, _conf.default.toolbar.import, props.import);
    });
    var computeExportOpts = (0, _vue.computed)(function () {
      return Object.assign({}, _conf.default.toolbar.export, props.export);
    });
    var computePrintOpts = (0, _vue.computed)(function () {
      return Object.assign({}, _conf.default.toolbar.print, props.print);
    });
    var computeZoomOpts = (0, _vue.computed)(function () {
      return Object.assign({}, _conf.default.toolbar.zoom, props.zoom);
    });
    var computeCustomOpts = (0, _vue.computed)(function () {
      return Object.assign({}, _conf.default.toolbar.custom, props.custom);
    });

    var checkTable = function checkTable() {
      if ($xetable) {
        return true;
      }

      (0, _utils.errLog)('vxe.error.barUnableLink');
    };

    var checkCustomStatus = function checkCustomStatus() {
      var columns = reactData.columns;
      var computeTableCustomOpts = $xetable.getComputeMaps().computeCustomOpts;
      var tableCustomOpts = computeTableCustomOpts.value;
      var checkMethod = tableCustomOpts.checkMethod;
      customStore.isAll = columns.every(function (column) {
        return (checkMethod ? !checkMethod({
          column: column
        }) : false) || column.visible;
      });
      customStore.isIndeterminate = !customStore.isAll && columns.some(function (column) {
        return (!checkMethod || checkMethod({
          column: column
        })) && (column.visible || column.halfVisible);
      });
    };

    var showCustom = function showCustom() {
      customStore.visible = true;
      checkCustomStatus();
    };

    var handleTableCustom = function handleTableCustom() {
      $xetable.handleCustom();
    };

    var closeCustom = function closeCustom() {
      var custom = props.custom;
      var customOpts = computeCustomOpts.value;

      if (customStore.visible) {
        customStore.visible = false;

        if (custom && !customOpts.immediate) {
          handleTableCustom();
        }
      }
    };

    var emitCustomEvent = function emitCustomEvent(type, evnt) {
      var comp = $xegrid || $xetable;
      comp.dispatchEvent('custom', {
        type: type
      }, evnt);
    };

    var confirmCustomEvent = function confirmCustomEvent(evnt) {
      closeCustom();
      emitCustomEvent('confirm', evnt);
    };

    var customOpenEvent = function customOpenEvent(evnt) {
      if (checkTable()) {
        if (!customStore.visible) {
          showCustom();
          emitCustomEvent('open', evnt);
        }
      }
    };

    var customColseEvent = function customColseEvent(evnt) {
      if (customStore.visible) {
        closeCustom();
        emitCustomEvent('close', evnt);
      }
    };

    var resetCustomEvent = function resetCustomEvent(evnt) {
      var columns = reactData.columns;
      var computeTableCustomOpts = $xetable.getComputeMaps().computeCustomOpts;
      var tableCustomOpts = computeTableCustomOpts.value;
      var checkMethod = tableCustomOpts.checkMethod;

      _xeUtils.default.eachTree(columns, function (column) {
        if (!checkMethod || checkMethod({
          column: column
        })) {
          column.visible = column.defaultVisible;
          column.halfVisible = false;
        }

        column.resizeWidth = 0;
      });

      $xetable.saveCustomResizable(true);
      closeCustom();
      emitCustomEvent('reset', evnt);
    };

    var handleOptionCheck = function handleOptionCheck(column) {
      var columns = reactData.columns;

      var matchObj = _xeUtils.default.findTree(columns, function (item) {
        return item === column;
      });

      if (matchObj && matchObj.parent) {
        var parent_1 = matchObj.parent;

        if (parent_1.children && parent_1.children.length) {
          parent_1.visible = parent_1.children.every(function (column) {
            return column.visible;
          });
          parent_1.halfVisible = !parent_1.visible && parent_1.children.some(function (column) {
            return column.visible || column.halfVisible;
          });
          handleOptionCheck(parent_1);
        }
      }
    };

    var changeCustomOption = function changeCustomOption(column) {
      var isChecked = !column.visible;
      var customOpts = computeCustomOpts.value;

      _xeUtils.default.eachTree([column], function (item) {
        item.visible = isChecked;
        item.halfVisible = false;
      });

      handleOptionCheck(column);

      if (props.custom && customOpts.immediate) {
        handleTableCustom();
      }

      checkCustomStatus();
    };

    var allCustomEvent = function allCustomEvent() {
      var columns = reactData.columns;
      var computeTableCustomOpts = $xetable.getComputeMaps().computeCustomOpts;
      var tableCustomOpts = computeTableCustomOpts.value;
      var checkMethod = tableCustomOpts.checkMethod;
      var isAll = !customStore.isAll;

      _xeUtils.default.eachTree(columns, function (column) {
        if (!checkMethod || checkMethod({
          column: column
        })) {
          column.visible = isAll;
          column.halfVisible = false;
        }
      });

      customStore.isAll = isAll;
      checkCustomStatus();
    };

    var handleGlobalMousedownEvent = function handleGlobalMousedownEvent(evnt) {
      var customWrapperElem = refCustomWrapper.value;

      if (!(0, _dom.getEventTargetNode)(evnt, customWrapperElem).flag) {
        customColseEvent(evnt);
      }
    };

    var handleGlobalBlurEvent = function handleGlobalBlurEvent(evnt) {
      customColseEvent(evnt);
    };

    var handleClickSettingEvent = function handleClickSettingEvent(evnt) {
      if (customStore.visible) {
        customColseEvent(evnt);
      } else {
        customOpenEvent(evnt);
      }
    };

    var handleMouseenterSettingEvent = function handleMouseenterSettingEvent(evnt) {
      customStore.activeBtn = true;
      customOpenEvent(evnt);
    };

    var handleMouseleaveSettingEvent = function handleMouseleaveSettingEvent(evnt) {
      customStore.activeBtn = false;
      setTimeout(function () {
        if (!customStore.activeBtn && !customStore.activeWrapper) {
          customColseEvent(evnt);
        }
      }, 300);
    };

    var handleWrapperMouseenterEvent = function handleWrapperMouseenterEvent(evnt) {
      customStore.activeWrapper = true;
      customOpenEvent(evnt);
    };

    var handleWrapperMouseleaveEvent = function handleWrapperMouseleaveEvent(evnt) {
      customStore.activeWrapper = false;
      setTimeout(function () {
        if (!customStore.activeBtn && !customStore.activeWrapper) {
          customColseEvent(evnt);
        }
      }, 300);
    };

    var refreshEvent = function refreshEvent() {
      var isRefresh = reactData.isRefresh;
      var refreshOpts = computeRefreshOpts.value;

      if (!isRefresh) {
        var query = refreshOpts.query;

        if (query) {
          reactData.isRefresh = true;

          try {
            Promise.resolve(query({})).catch(function (e) {
              return e;
            }).then(function () {
              reactData.isRefresh = false;
            });
          } catch (e) {
            reactData.isRefresh = false;
          }
        } else if ($xegrid) {
          reactData.isRefresh = true;
          $xegrid.commitProxy('reload').catch(function (e) {
            return e;
          }).then(function () {
            reactData.isRefresh = false;
          });
        }
      }
    };

    var zoomEvent = function zoomEvent(evnt) {
      if ($xegrid) {
        $xegrid.triggerZoomEvent(evnt);
      }
    };

    var btnEvent = function btnEvent(evnt, item) {
      var code = item.code;

      if (code) {
        if ($xegrid) {
          $xegrid.triggerToolbarBtnEvent(item, evnt);
        } else {
          var commandMethod = _vXETable.VXETable.commands.get(code);

          var params = {
            code: code,
            button: item,
            $table: $xetable,
            $event: evnt
          };

          if (commandMethod) {
            commandMethod(params, evnt);
          }

          $xetoolbar.dispatchEvent('button-click', params, evnt);
        }
      }
    };

    var tolEvent = function tolEvent(evnt, item) {
      var code = item.code;

      if (code) {
        if ($xegrid) {
          $xegrid.triggerToolbarTolEvent(item, evnt);
        } else {
          var commandMethod = _vXETable.VXETable.commands.get(code);

          var params = {
            code: code,
            tool: item,
            $table: $xetable,
            $event: evnt
          };

          if (commandMethod) {
            commandMethod(params, evnt);
          }

          $xetoolbar.dispatchEvent('tool-click', params, evnt);
        }
      }
    };

    var importEvent = function importEvent() {
      if (checkTable()) {
        $xetable.openImport();
      }
    };

    var exportEvent = function exportEvent() {
      if (checkTable()) {
        $xetable.openExport();
      }
    };

    var printEvent = function printEvent() {
      if (checkTable()) {
        $xetable.openPrint();
      }
    };

    var renderDropdowns = function renderDropdowns(item, isBtn) {
      var dropdowns = item.dropdowns;
      var downVNs = [];

      if (dropdowns) {
        return dropdowns.map(function (child, index) {
          if (child.visible === false) {
            return (0, _vue.createCommentVNode)();
          }

          return (0, _vue.h)((0, _vue.resolveComponent)('vxe-button'), {
            key: index,
            disabled: child.disabled,
            loading: child.loading,
            type: child.type,
            icon: child.icon,
            circle: child.circle,
            round: child.round,
            status: child.status,
            content: child.name,
            onClick: function onClick(evnt) {
              return isBtn ? btnEvent(evnt, child) : tolEvent(evnt, child);
            }
          });
        });
      }

      return downVNs;
    };
    /**
     * ????????????
     */


    var renderBtns = function renderBtns() {
      var buttons = props.buttons;
      var buttonsSlot = slots.buttons;

      if (buttonsSlot) {
        return buttonsSlot({
          $grid: $xegrid,
          $table: $xetable
        });
      }

      var btnVNs = [];

      if (buttons) {
        buttons.forEach(function (item) {
          var dropdowns = item.dropdowns,
              buttonRender = item.buttonRender;

          if (item.visible !== false) {
            var compConf = buttonRender ? _vXETable.VXETable.renderer.get(buttonRender.name) : null;

            if (buttonRender && compConf && compConf.renderToolbarButton) {
              btnVNs.push((0, _vue.h)('span', {
                class: 'vxe-button--item'
              }, compConf.renderToolbarButton(buttonRender, {
                $grid: $xegrid,
                $table: $xetable,
                button: item
              })));
            } else {
              btnVNs.push((0, _vue.h)((0, _vue.resolveComponent)('vxe-button'), {
                disabled: item.disabled,
                loading: item.loading,
                type: item.type,
                icon: item.icon,
                circle: item.circle,
                round: item.round,
                status: item.status,
                content: item.name,
                destroyOnClose: item.destroyOnClose,
                placement: item.placement,
                transfer: item.transfer,
                onClick: function onClick(evnt) {
                  return btnEvent(evnt, item);
                }
              }, dropdowns && dropdowns.length ? {
                dropdowns: function dropdowns() {
                  return renderDropdowns(item, true);
                }
              } : {}));
            }
          }
        });
      }

      return btnVNs;
    };
    /**
     * ??????????????????
     */


    var renderRightTools = function renderRightTools() {
      var tools = props.tools;
      var toolsSlot = slots.tools;

      if (toolsSlot) {
        return toolsSlot({
          $grid: $xegrid,
          $table: $xetable
        });
      }

      var btnVNs = [];

      if (tools) {
        tools.forEach(function (item) {
          var dropdowns = item.dropdowns,
              toolRender = item.toolRender;

          if (item.visible !== false) {
            var compConf = toolRender ? _vXETable.VXETable.renderer.get(toolRender.name) : null;

            if (toolRender && compConf && compConf.renderToolbarTool) {
              btnVNs.push((0, _vue.h)('span', {
                class: 'vxe-tool--item'
              }, compConf.renderToolbarTool(toolRender, {
                $grid: $xegrid,
                $table: $xetable,
                tool: item
              })));
            } else {
              btnVNs.push((0, _vue.h)((0, _vue.resolveComponent)('vxe-button'), {
                disabled: item.disabled,
                loading: item.loading,
                type: item.type,
                icon: item.icon,
                circle: item.circle,
                round: item.round,
                status: item.status,
                content: item.name,
                destroyOnClose: item.destroyOnClose,
                placement: item.placement,
                transfer: item.transfer,
                onClick: function onClick(evnt) {
                  return tolEvent(evnt, item);
                }
              }, dropdowns && dropdowns.length ? {
                dropdowns: function dropdowns() {
                  return renderDropdowns(item, false);
                }
              } : {}));
            }
          }
        });
      }

      return btnVNs;
    };

    var renderCustoms = function renderCustoms() {
      var columns = reactData.columns;
      var customOpts = computeCustomOpts.value;
      var colVNs = [];
      var customBtnOns = {};
      var customWrapperOns = {};
      var checkMethod;

      if ($xetable) {
        var computeTableCustomOpts = $xetable.getComputeMaps().computeCustomOpts;
        var tableCustomOpts = computeTableCustomOpts.value;
        checkMethod = tableCustomOpts.checkMethod;
      }

      if (customOpts.trigger === 'manual') {// ????????????
      } else if (customOpts.trigger === 'hover') {
        // hover ??????
        customBtnOns.onMouseenter = handleMouseenterSettingEvent;
        customBtnOns.onMouseleave = handleMouseleaveSettingEvent;
        customWrapperOns.onMouseenter = handleWrapperMouseenterEvent;
        customWrapperOns.onMouseleave = handleWrapperMouseleaveEvent;
      } else {
        // ????????????
        customBtnOns.onClick = handleClickSettingEvent;
      }

      _xeUtils.default.eachTree(columns, function (column) {
        var colTitle = (0, _utils.formatText)(column.getTitle(), 1);
        var colKey = column.getKey();
        var isColGroup = column.children && column.children.length;
        var isDisabled = checkMethod ? !checkMethod({
          column: column
        }) : false;

        if (isColGroup || colKey) {
          colVNs.push((0, _vue.h)('li', {
            class: ['vxe-custom--option', "level--" + column.level, {
              'is--group': isColGroup,
              'is--checked': column.visible,
              'is--indeterminate': column.halfVisible,
              'is--disabled': isDisabled
            }],
            title: colTitle,
            onClick: function onClick() {
              if (!isDisabled) {
                changeCustomOption(column);
              }
            }
          }, [(0, _vue.h)('span', {
            class: 'vxe-checkbox--icon vxe-checkbox--checked-icon'
          }), (0, _vue.h)('span', {
            class: 'vxe-checkbox--icon vxe-checkbox--unchecked-icon'
          }), (0, _vue.h)('span', {
            class: 'vxe-checkbox--icon vxe-checkbox--indeterminate-icon'
          }), (0, _vue.h)('span', {
            class: 'vxe-checkbox--label'
          }, colTitle)]));
        }
      });

      return (0, _vue.h)('div', {
        class: ['vxe-custom--wrapper', {
          'is--active': customStore.visible
        }],
        ref: refCustomWrapper
      }, [(0, _vue.h)((0, _vue.resolveComponent)('vxe-button'), __assign({
        circle: true,
        icon: customOpts.icon || _conf.default.icon.TOOLBAR_TOOLS_CUSTOM,
        title: _conf.default.i18n('vxe.toolbar.custom')
      }, customBtnOns)), (0, _vue.h)('div', {
        class: 'vxe-custom--option-wrapper'
      }, [(0, _vue.h)('ul', {
        class: 'vxe-custom--header'
      }, [(0, _vue.h)('li', {
        class: ['vxe-custom--option', {
          'is--checked': customStore.isAll,
          'is--indeterminate': customStore.isIndeterminate
        }],
        title: _conf.default.i18n('vxe.table.allTitle'),
        onClick: allCustomEvent
      }, [(0, _vue.h)('span', {
        class: 'vxe-checkbox--icon vxe-checkbox--checked-icon'
      }), (0, _vue.h)('span', {
        class: 'vxe-checkbox--icon vxe-checkbox--unchecked-icon'
      }), (0, _vue.h)('span', {
        class: 'vxe-checkbox--icon vxe-checkbox--indeterminate-icon'
      }), (0, _vue.h)('span', {
        class: 'vxe-checkbox--label'
      }, _conf.default.i18n('vxe.toolbar.customAll'))])]), (0, _vue.h)('ul', __assign({
        class: 'vxe-custom--body'
      }, customWrapperOns), colVNs), customOpts.isFooter === false ? null : (0, _vue.h)('div', {
        class: 'vxe-custom--footer'
      }, [(0, _vue.h)('button', {
        class: 'btn--confirm',
        onClick: confirmCustomEvent
      }, _conf.default.i18n('vxe.toolbar.customConfirm')), (0, _vue.h)('button', {
        class: 'btn--reset',
        onClick: resetCustomEvent
      }, _conf.default.i18n('vxe.toolbar.customRestore'))])])]);
    };

    toolbarMethods = {
      dispatchEvent: function dispatchEvent(type, params, evnt) {
        emit(type, Object.assign({
          $toolbar: $xetoolbar,
          $event: evnt
        }, params));
      },
      syncUpdate: function syncUpdate(params) {
        var collectColumn = params.collectColumn;
        $xetable = params.$table;
        reactData.columns = collectColumn;
      }
    };
    Object.assign($xetoolbar, toolbarMethods);
    (0, _vue.onMounted)(function () {
      _event.GlobalEvent.on($xetoolbar, 'mousedown', handleGlobalMousedownEvent);

      _event.GlobalEvent.on($xetoolbar, 'blur', handleGlobalBlurEvent);
    });
    (0, _vue.onUnmounted)(function () {
      _event.GlobalEvent.off($xetoolbar, 'mousedown');

      _event.GlobalEvent.off($xetoolbar, 'blur');
    });
    (0, _vue.nextTick)(function () {
      var refresh = props.refresh;
      var refreshOpts = computeRefreshOpts.value;

      if (refresh && !$xegrid && !refreshOpts.query) {
        (0, _utils.warnLog)('vxe.error.notFunc', ['query']);
      }
    });

    var renderVN = function renderVN() {
      var _a;

      var perfect = props.perfect,
          loading = props.loading,
          refresh = props.refresh,
          zoom = props.zoom,
          custom = props.custom,
          className = props.className;
      var vSize = computeSize.value;
      var refreshOpts = computeRefreshOpts.value;
      var importOpts = computeImportOpts.value;
      var exportOpts = computeExportOpts.value;
      var printOpts = computePrintOpts.value;
      var zoomOpts = computeZoomOpts.value;
      return (0, _vue.h)('div', {
        ref: refElem,
        class: ['vxe-toolbar', className ? _xeUtils.default.isFunction(className) ? className({
          $toolbar: $xetoolbar
        }) : className : '', (_a = {}, _a["size--" + vSize] = vSize, _a['is--perfect'] = perfect, _a['is--loading'] = loading, _a)]
      }, [(0, _vue.h)('div', {
        class: 'vxe-buttons--wrapper'
      }, renderBtns()), (0, _vue.h)('div', {
        class: 'vxe-tools--wrapper'
      }, renderRightTools()), (0, _vue.h)('div', {
        class: 'vxe-tools--operate'
      }, [props.import ? (0, _vue.h)((0, _vue.resolveComponent)('vxe-button'), {
        circle: true,
        icon: importOpts.icon || _conf.default.icon.TOOLBAR_TOOLS_IMPORT,
        title: _conf.default.i18n('vxe.toolbar.import'),
        onClick: importEvent
      }) : (0, _vue.createCommentVNode)(), props.export ? (0, _vue.h)((0, _vue.resolveComponent)('vxe-button'), {
        circle: true,
        icon: exportOpts.icon || _conf.default.icon.TOOLBAR_TOOLS_EXPORT,
        title: _conf.default.i18n('vxe.toolbar.export'),
        onClick: exportEvent
      }) : (0, _vue.createCommentVNode)(), props.print ? (0, _vue.h)((0, _vue.resolveComponent)('vxe-button'), {
        circle: true,
        icon: printOpts.icon || _conf.default.icon.TOOLBAR_TOOLS_PRINT,
        title: _conf.default.i18n('vxe.toolbar.print'),
        onClick: printEvent
      }) : (0, _vue.createCommentVNode)(), refresh ? (0, _vue.h)((0, _vue.resolveComponent)('vxe-button'), {
        circle: true,
        icon: reactData.isRefresh ? refreshOpts.iconLoading || _conf.default.icon.TOOLBAR_TOOLS_REFRESH_LOADING : refreshOpts.icon || _conf.default.icon.TOOLBAR_TOOLS_REFRESH,
        title: _conf.default.i18n('vxe.toolbar.refresh'),
        onClick: refreshEvent
      }) : (0, _vue.createCommentVNode)(), zoom && $xegrid ? (0, _vue.h)((0, _vue.resolveComponent)('vxe-button'), {
        circle: true,
        icon: $xegrid.isMaximized() ? zoomOpts.iconOut || _conf.default.icon.TOOLBAR_TOOLS_ZOOM_OUT : zoomOpts.iconIn || _conf.default.icon.TOOLBAR_TOOLS_ZOOM_IN,
        title: _conf.default.i18n("vxe.toolbar.zoom" + ($xegrid.isMaximized() ? 'Out' : 'In')),
        onClick: zoomEvent
      }) : (0, _vue.createCommentVNode)(), custom ? renderCustoms() : (0, _vue.createCommentVNode)()])]);
    };

    $xetoolbar.renderVN = renderVN;
    return $xetoolbar;
  },
  render: function render() {
    return this.renderVN();
  }
});

exports.default = _default2;