"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = require("vue");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _conf = _interopRequireDefault(require("../../v-x-e-table/src/conf"));

var _modal = _interopRequireDefault(require("../../modal/src/modal"));

var _group = _interopRequireDefault(require("../../radio/src/group"));

var _radio = _interopRequireDefault(require("../../radio/src/radio"));

var _button = _interopRequireDefault(require("../../button/src/button"));

var _utils = require("../../tools/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default2 = (0, _vue.defineComponent)({
  name: 'VxeImportPanel',
  props: {
    defaultOptions: Object,
    storeData: Object
  },
  setup: function setup(props) {
    var $xetable = (0, _vue.inject)('$xetable', {});
    var computeImportOpts = $xetable.getComputeMaps().computeImportOpts;
    var reactData = (0, _vue.reactive)({
      loading: false
    });
    var refFileBtn = (0, _vue.ref)();
    var computeSelectName = (0, _vue.computed)(function () {
      var storeData = props.storeData;
      return storeData.filename + "." + storeData.type;
    });
    var computeHasFile = (0, _vue.computed)(function () {
      var storeData = props.storeData;
      return storeData.file && storeData.type;
    });
    var computeParseTypeLabel = (0, _vue.computed)(function () {
      var storeData = props.storeData;
      var type = storeData.type,
          typeList = storeData.typeList;

      if (type) {
        var selectItem = _xeUtils.default.find(typeList, function (item) {
          return type === item.value;
        });

        return selectItem ? _conf.default.i18n(selectItem.label) : '*.*';
      }

      return "*." + typeList.map(function (item) {
        return item.value;
      }).join(', *.');
    });

    var clearFileEvent = function clearFileEvent() {
      var storeData = props.storeData;
      Object.assign(storeData, {
        filename: '',
        sheetName: '',
        type: ''
      });
    };

    var selectFileEvent = function selectFileEvent() {
      var storeData = props.storeData,
          defaultOptions = props.defaultOptions;
      $xetable.readFile(defaultOptions).then(function (params) {
        var file = params.file;
        Object.assign(storeData, (0, _utils.parseFile)(file), {
          file: file
        });
      }).catch(function (e) {
        return e;
      });
    };

    var showEvent = function showEvent() {
      (0, _vue.nextTick)(function () {
        var targetElem = refFileBtn.value;

        if (targetElem) {
          targetElem.focus();
        }
      });
    };

    var cancelEvent = function cancelEvent() {
      var storeData = props.storeData;
      storeData.visible = false;
    };

    var importEvent = function importEvent() {
      var storeData = props.storeData,
          defaultOptions = props.defaultOptions;
      var importOpts = computeImportOpts.value;
      reactData.loading = true;
      $xetable.importByFile(storeData.file, Object.assign({}, importOpts, defaultOptions)).then(function () {
        reactData.loading = false;
        storeData.visible = false;
      }).catch(function () {
        reactData.loading = false;
      });
    };

    var renderVN = function renderVN() {
      var defaultOptions = props.defaultOptions,
          storeData = props.storeData;
      var selectName = computeSelectName.value;
      var hasFile = computeHasFile.value;
      var parseTypeLabel = computeParseTypeLabel.value;
      return (0, _vue.h)(_modal.default, {
        modelValue: storeData.visible,
        title: _conf.default.i18n('vxe.import.impTitle'),
        width: 440,
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
          }, [(0, _vue.h)('tbody', [(0, _vue.h)('tr', [(0, _vue.h)('td', _conf.default.i18n('vxe.import.impFile')), (0, _vue.h)('td', [hasFile ? (0, _vue.h)('div', {
            class: 'vxe-import-selected--file',
            title: selectName
          }, [(0, _vue.h)('span', selectName), (0, _vue.h)('i', {
            class: _conf.default.icon.INPUT_CLEAR,
            onClick: clearFileEvent
          })]) : (0, _vue.h)('button', {
            ref: refFileBtn,
            class: 'vxe-import-select--file',
            onClick: selectFileEvent
          }, _conf.default.i18n('vxe.import.impSelect'))])]), (0, _vue.h)('tr', [(0, _vue.h)('td', _conf.default.i18n('vxe.import.impType')), (0, _vue.h)('td', parseTypeLabel)]), (0, _vue.h)('tr', [(0, _vue.h)('td', _conf.default.i18n('vxe.import.impOpts')), (0, _vue.h)('td', [(0, _vue.h)(_group.default, {
            modelValue: defaultOptions.mode,
            'onUpdate:modelValue': function onUpdateModelValue(value) {
              defaultOptions.mode = value;
            }
          }, {
            default: function _default() {
              return storeData.modeList.map(function (item) {
                return (0, _vue.h)(_radio.default, {
                  label: item.value,
                  content: _conf.default.i18n(item.label)
                });
              });
            }
          })])])])]), (0, _vue.h)('div', {
            class: 'vxe-export--panel-btns'
          }, [(0, _vue.h)(_button.default, {
            content: _conf.default.i18n('vxe.import.impCancel'),
            onClick: cancelEvent
          }), (0, _vue.h)(_button.default, {
            status: 'primary',
            disabled: !hasFile,
            content: _conf.default.i18n('vxe.import.impConfirm'),
            onClick: importEvent
          })])]);
        }
      });
    };

    return renderVN;
  }
});

exports.default = _default2;