"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderTitle = renderTitle;

var _vue = require("vue");

var _conf = _interopRequireDefault(require("../../v-x-e-table/src/conf"));

var _vXETable = require("../../v-x-e-table");

var _utils = require("../../tools/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function renderPrefixIcon(titlePrefix) {
  return (0, _vue.h)('span', {
    class: 'vxe-form--item-title-prefix'
  }, [(0, _vue.h)('i', {
    class: titlePrefix.icon || _conf.default.icon.FORM_PREFIX
  })]);
}

function renderSuffixIcon(titleSuffix) {
  return (0, _vue.h)('span', {
    class: 'vxe-form--item-title-suffix'
  }, [(0, _vue.h)('i', {
    class: titleSuffix.icon || _conf.default.icon.FORM_SUFFIX
  })]);
}

function renderTitle($xeform, item) {
  var data = $xeform.props.data;
  var slots = item.slots,
      field = item.field,
      itemRender = item.itemRender,
      titlePrefix = item.titlePrefix,
      titleSuffix = item.titleSuffix;
  var compConf = (0, _utils.isEnableConf)(itemRender) ? _vXETable.VXETable.renderer.get(itemRender.name) : null;
  var params = {
    data: data,
    property: field,
    item: item,
    $form: $xeform
  };
  var titleSlot = slots ? slots.title : null;
  var contVNs = [];
  var titVNs = [];

  if (titlePrefix) {
    titVNs.push(titlePrefix.message ? (0, _vue.h)((0, _vue.resolveComponent)('vxe-tooltip'), {
      content: (0, _utils.getFuncText)(titlePrefix.message),
      enterable: titlePrefix.enterable,
      theme: titlePrefix.theme
    }, {
      default: function _default() {
        return renderPrefixIcon(titlePrefix);
      }
    }) : renderPrefixIcon(titlePrefix));
  }

  titVNs.push((0, _vue.h)('span', {
    class: 'vxe-form--item-title-label'
  }, compConf && compConf.renderItemTitle ? compConf.renderItemTitle(itemRender, params) : titleSlot ? $xeform.callSlot(titleSlot, params) : (0, _utils.getFuncText)(item.title)));
  contVNs.push((0, _vue.h)('div', {
    class: 'vxe-form--item-title-content'
  }, titVNs));
  var fixVNs = [];

  if (titleSuffix) {
    fixVNs.push(titleSuffix.message ? (0, _vue.h)((0, _vue.resolveComponent)('vxe-tooltip'), {
      content: (0, _utils.getFuncText)(titleSuffix.message),
      enterable: titleSuffix.enterable,
      theme: titleSuffix.theme
    }, {
      default: function _default() {
        return renderSuffixIcon(titleSuffix);
      }
    }) : renderSuffixIcon(titleSuffix));
  }

  contVNs.push((0, _vue.h)('div', {
    class: 'vxe-form--item-title-postfix'
  }, fixVNs));
  return contVNs;
}