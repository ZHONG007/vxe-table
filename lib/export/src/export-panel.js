"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = require("vue");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _conf = _interopRequireDefault(require("../../v-x-e-table/src/conf"));

var _utils = require("../../tools/utils");

var _modal = _interopRequireDefault(require("../../modal/src/modal"));

var _input = _interopRequireDefault(require("../../input/src/input"));

var _checkbox = _interopRequireDefault(require("../../checkbox/src/checkbox"));

var _select = _interopRequireDefault(require("../../select/src/select"));

var _button = _interopRequireDefault(require("../../button/src/button"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default2 = (0, _vue.defineComponent)({
  name: 'VxeExportPanel',
  props: {
    defaultOptions: Object,
    storeData: Object
  },
  setup: function setup(props) {
    var $xetable = (0, _vue.inject)('$xetable', {});

    var _a = $xetable.getComputeMaps(),
        computeExportOpts = _a.computeExportOpts,
        computePrintOpts = _a.computePrintOpts;

    var reactData = (0, _vue.reactive)({
      isAll: false,
      isIndeterminate: false,
      loading: false
    });
    var xButtonConfirm = (0, _vue.ref)();
    var xInputFilename = (0, _vue.ref)();
    var xInputSheetname = (0, _vue.ref)();
    var computeCheckedAll = (0, _vue.computed)(function () {
      var storeData = props.storeData;
      return storeData.columns.every(function (column) {
        return column.checked;
      });
    });
    var computeShowSheet = (0, _vue.computed)(function () {
      var defaultOptions = props.defaultOptions;
      return ['html', 'xml', 'xlsx', 'pdf'].indexOf(defaultOptions.type) > -1;
    });
    var computeSupportMerge = (0, _vue.computed)(function () {
      var storeData = props.storeData,
          defaultOptions = props.defaultOptions;
      return !defaultOptions.original && defaultOptions.mode === 'current' && (storeData.isPrint || ['html', 'xlsx'].indexOf(defaultOptions.type) > -1);
    });
    var computeSupportStyle = (0, _vue.computed)(function () {
      var defaultOptions = props.defaultOptions;
      return !defaultOptions.original && ['xlsx'].indexOf(defaultOptions.type) > -1;
    });

    var handleOptionCheck = function handleOptionCheck(column) {
      var storeData = props.storeData;

      var matchObj = _xeUtils.default.findTree(storeData.columns, function (item) {
        return item === column;
      });

      if (matchObj && matchObj.parent) {
        var parent_1 = matchObj.parent;

        if (parent_1.children && parent_1.children.length) {
          parent_1.checked = parent_1.children.every(function (column) {
            return column.checked;
          });
          parent_1.halfChecked = !parent_1.checked && parent_1.children.some(function (column) {
            return column.checked || column.halfChecked;
          });
          handleOptionCheck(parent_1);
        }
      }
    };

    var checkStatus = function checkStatus() {
      var storeData = props.storeData;
      var columns = storeData.columns;
      reactData.isAll = columns.every(function (column) {
        return column.disabled || column.checked;
      });
      reactData.isIndeterminate = !reactData.isAll && columns.some(function (column) {
        return !column.disabled && (column.checked || column.halfChecked);
      });
    };

    var changeOption = function changeOption(column) {
      var isChecked = !column.checked;

      _xeUtils.default.eachTree([column], function (item) {
        item.checked = isChecked;
        item.halfChecked = false;
      });

      handleOptionCheck(column);
      checkStatus();
    };

    var allColumnEvent = function allColumnEvent() {
      var storeData = props.storeData;
      var isAll = !reactData.isAll;

      _xeUtils.default.eachTree(storeData.columns, function (column) {
        if (!column.disabled) {
          column.checked = isAll;
          column.halfChecked = false;
        }
      });

      reactData.isAll = isAll;
      checkStatus();
    };

    var showEvent = function showEvent() {
      (0, _vue.nextTick)(function () {
        var filenameInp = xInputFilename.value;
        var sheetnameInp = xInputSheetname.value;
        var confirmBtn = xButtonConfirm.value;
        var targetElem = filenameInp || sheetnameInp || confirmBtn;

        if (targetElem) {
          targetElem.focus();
        }
      });
      checkStatus();
    };

    var getExportOption = function getExportOption() {
      var storeData = props.storeData,
          defaultOptions = props.defaultOptions;
      var hasMerge = storeData.hasMerge,
          columns = storeData.columns;
      var checkedAll = computeCheckedAll.value;
      var supportMerge = computeSupportMerge.value;

      var expColumns = _xeUtils.default.searchTree(columns, function (column) {
        return column.checked;
      }, {
        children: 'children',
        mapChildren: 'childNodes',
        original: true
      });

      return Object.assign({}, defaultOptions, {
        columns: expColumns,
        isMerge: hasMerge && supportMerge && checkedAll ? defaultOptions.isMerge : false
      });
    };

    var printEvent = function printEvent() {
      var storeData = props.storeData;
      var printOpts = computePrintOpts.value;
      storeData.visible = false;
      $xetable.print(Object.assign({}, printOpts, getExportOption()));
    };

    var exportEvent = function exportEvent() {
      var storeData = props.storeData;
      var exportOpts = computeExportOpts.value;
      reactData.loading = true;
      $xetable.exportData(Object.assign({}, exportOpts, getExportOption())).then(function () {
        reactData.loading = false;
        storeData.visible = false;
      }).catch(function () {
        reactData.loading = false;
      });
    };

    var cancelEvent = function cancelEvent() {
      var storeData = props.storeData;
      storeData.visible = false;
    };

    var confirmEvent = function confirmEvent() {
      var storeData = props.storeData;

      if (storeData.isPrint) {
        printEvent();
      } else {
        exportEvent();
      }
    };

    var renderVN = function renderVN() {
      var defaultOptions = props.defaultOptions,
          storeData = props.storeData;
      var isAll = reactData.isAll,
          isIndeterminate = reactData.isIndeterminate;
      var hasTree = storeData.hasTree,
          hasMerge = storeData.hasMerge,
          isPrint = storeData.isPrint,
          hasColgroup = storeData.hasColgroup;
      var isHeader = defaultOptions.isHeader;
      var cols = [];
      var checkedAll = computeCheckedAll.value;
      var showSheet = computeShowSheet.value;
      var supportMerge = computeSupportMerge.value;
      var supportStyle = computeSupportStyle.value;

      _xeUtils.default.eachTree(storeData.columns, function (column) {
        var colTitle = (0, _utils.formatText)(column.getTitle(), 1);
        var isColGroup = column.children && column.children.length;
        cols.push((0, _vue.h)('li', {
          class: ['vxe-export--panel-column-option', "level--" + column.level, {
            'is--group': isColGroup,
            'is--checked': column.checked,
            'is--indeterminate': column.halfChecked,
            'is--disabled': column.disabled
          }],
          title: colTitle,
          onClick: function onClick() {
            if (!column.disabled) {
              changeOption(column);
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
      });

      return (0, _vue.h)(_modal.default, {
        modelValue: storeData.visible,
        title: _conf.default.i18n(isPrint ? 'vxe.export.printTitle' : 'vxe.export.expTitle'),
        width: 660,
        mask: true,
        lockView: true,
        showFooter: false,
        escClosable: true,
        maskClosable: true,
        loading: reactData.loading,
        'onUpdate:modelValue': function onUpdateModelValue(value) {
          storeData.visible = value;
        },
        onShow: showEvent
      }, {
        default: function _default() {
          return (0, _vue.h)('div', {
            class: 'vxe-export--panel'
          }, [(0, _vue.h)('table', {
            cellspacing: 0,
            cellpadding: 0,
            border: 0
          }, [(0, _vue.h)('tbody', [[isPrint ? (0, _vue.createCommentVNode)() : (0, _vue.h)('tr', [(0, _vue.h)('td', _conf.default.i18n('vxe.export.expName')), (0, _vue.h)('td', [(0, _vue.h)(_input.default, {
            ref: xInputFilename,
            modelValue: defaultOptions.filename,
            type: 'text',
            clearable: true,
            placeholder: _conf.default.i18n('vxe.export.expNamePlaceholder'),
            'onUpdate:modelValue': function onUpdateModelValue(value) {
              defaultOptions.filename = value;
            }
          })])]), isPrint ? (0, _vue.createCommentVNode)() : (0, _vue.h)('tr', [(0, _vue.h)('td', _conf.default.i18n('vxe.export.expType')), (0, _vue.h)('td', [(0, _vue.h)(_select.default, {
            modelValue: defaultOptions.type,
            options: storeData.typeList.map(function (item) {
              return {
                value: item.value,
                label: _conf.default.i18n(item.label)
              };
            }),
            'onUpdate:modelValue': function onUpdateModelValue(value) {
              defaultOptions.type = value;
            }
          })])]), isPrint || showSheet ? (0, _vue.h)('tr', [(0, _vue.h)('td', _conf.default.i18n('vxe.export.expSheetName')), (0, _vue.h)('td', [(0, _vue.h)(_input.default, {
            ref: xInputSheetname,
            modelValue: defaultOptions.sheetName,
            type: 'text',
            clearable: true,
            placeholder: _conf.default.i18n('vxe.export.expSheetNamePlaceholder'),
            'onUpdate:modelValue': function onUpdateModelValue(value) {
              defaultOptions.sheetName = value;
            }
          })])]) : (0, _vue.createCommentVNode)(), (0, _vue.h)('tr', [(0, _vue.h)('td', _conf.default.i18n('vxe.export.expMode')), (0, _vue.h)('td', [(0, _vue.h)(_select.default, {
            modelValue: defaultOptions.mode,
            options: storeData.modeList.map(function (item) {
              return {
                value: item.value,
                label: _conf.default.i18n(item.label)
              };
            }),
            'onUpdate:modelValue': function onUpdateModelValue(value) {
              defaultOptions.mode = value;
            }
          })])]), (0, _vue.h)('tr', [(0, _vue.h)('td', [_conf.default.i18n('vxe.export.expColumn')]), (0, _vue.h)('td', [(0, _vue.h)('div', {
            class: 'vxe-export--panel-column'
          }, [(0, _vue.h)('ul', {
            class: 'vxe-export--panel-column-header'
          }, [(0, _vue.h)('li', {
            class: ['vxe-export--panel-column-option', {
              'is--checked': isAll,
              'is--indeterminate': isIndeterminate
            }],
            title: _conf.default.i18n('vxe.table.allTitle'),
            onClick: allColumnEvent
          }, [(0, _vue.h)('span', {
            class: 'vxe-checkbox--icon vxe-checkbox--checked-icon'
          }), (0, _vue.h)('span', {
            class: 'vxe-checkbox--icon vxe-checkbox--unchecked-icon'
          }), (0, _vue.h)('span', {
            class: 'vxe-checkbox--icon vxe-checkbox--indeterminate-icon'
          }), (0, _vue.h)('span', {
            class: 'vxe-checkbox--label'
          }, _conf.default.i18n('vxe.export.expCurrentColumn'))])]), (0, _vue.h)('ul', {
            class: 'vxe-export--panel-column-body'
          }, cols)])])]), (0, _vue.h)('tr', [(0, _vue.h)('td', _conf.default.i18n('vxe.export.expOpts')), (0, _vue.h)('td', [(0, _vue.h)('div', {
            class: 'vxe-export--panel-option-row'
          }, [(0, _vue.h)(_checkbox.default, {
            modelValue: defaultOptions.isHeader,
            title: _conf.default.i18n('vxe.export.expHeaderTitle'),
            content: _conf.default.i18n('vxe.export.expOptHeader'),
            'onUpdate:modelValue': function onUpdateModelValue(value) {
              defaultOptions.isHeader = value;
            }
          }), (0, _vue.h)(_checkbox.default, {
            modelValue: defaultOptions.isFooter,
            disabled: !storeData.hasFooter,
            title: _conf.default.i18n('vxe.export.expFooterTitle'),
            content: _conf.default.i18n('vxe.export.expOptFooter'),
            'onUpdate:modelValue': function onUpdateModelValue(value) {
              defaultOptions.isFooter = value;
            }
          }), (0, _vue.h)(_checkbox.default, {
            modelValue: defaultOptions.original,
            title: _conf.default.i18n('vxe.export.expOriginalTitle'),
            content: _conf.default.i18n('vxe.export.expOptOriginal'),
            'onUpdate:modelValue': function onUpdateModelValue(value) {
              defaultOptions.original = value;
            }
          })]), (0, _vue.h)('div', {
            class: 'vxe-export--panel-option-row'
          }, [(0, _vue.h)(_checkbox.default, {
            modelValue: isHeader && hasColgroup && supportMerge ? defaultOptions.isColgroup : false,
            title: _conf.default.i18n('vxe.export.expColgroupTitle'),
            disabled: !isHeader || !hasColgroup || !supportMerge,
            content: _conf.default.i18n('vxe.export.expOptColgroup'),
            'onUpdate:modelValue': function onUpdateModelValue(value) {
              defaultOptions.isColgroup = value;
            }
          }), (0, _vue.h)(_checkbox.default, {
            modelValue: hasMerge && supportMerge && checkedAll ? defaultOptions.isMerge : false,
            title: _conf.default.i18n('vxe.export.expMergeTitle'),
            disabled: !hasMerge || !supportMerge || !checkedAll,
            content: _conf.default.i18n('vxe.export.expOptMerge'),
            'onUpdate:modelValue': function onUpdateModelValue(value) {
              defaultOptions.isMerge = value;
            }
          }), isPrint ? (0, _vue.createCommentVNode)() : (0, _vue.h)(_checkbox.default, {
            modelValue: supportStyle ? defaultOptions.useStyle : false,
            disabled: !supportStyle,
            title: _conf.default.i18n('vxe.export.expUseStyleTitle'),
            content: _conf.default.i18n('vxe.export.expOptUseStyle'),
            'onUpdate:modelValue': function onUpdateModelValue(value) {
              defaultOptions.useStyle = value;
            }
          }), (0, _vue.h)(_checkbox.default, {
            modelValue: hasTree ? defaultOptions.isAllExpand : false,
            disabled: !hasTree,
            title: _conf.default.i18n('vxe.export.expAllExpandTitle'),
            content: _conf.default.i18n('vxe.export.expOptAllExpand'),
            'onUpdate:modelValue': function onUpdateModelValue(value) {
              defaultOptions.isAllExpand = value;
            }
          })])])])]])]), (0, _vue.h)('div', {
            class: 'vxe-export--panel-btns'
          }, [(0, _vue.h)(_button.default, {
            content: _conf.default.i18n('vxe.export.expCancel'),
            onClick: cancelEvent
          }), (0, _vue.h)(_button.default, {
            ref: xButtonConfirm,
            status: 'primary',
            content: _conf.default.i18n(isPrint ? 'vxe.export.expPrint' : 'vxe.export.expConfirm'),
            onClick: confirmEvent
          })])]);
        }
      });
    };

    return renderVN;
  }
});

exports.default = _default2;