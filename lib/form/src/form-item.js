"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formItemProps = exports.default = void 0;

var _vue = require("vue");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _conf = _interopRequireDefault(require("../../v-x-e-table/src/conf"));

var _vXETable = require("../../v-x-e-table");

var _utils = require("../../tools/utils");

var _util = require("./util");

var _render = require("./render");

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

var formItemProps = {
  title: String,
  field: String,
  span: [String, Number],
  align: String,
  titleAlign: String,
  titleWidth: [String, Number],
  className: [String, Function],
  titleOverflow: {
    type: [Boolean, String],
    default: null
  },
  titlePrefix: Object,
  titleSuffix: Object,
  resetValue: {
    default: null
  },
  visibleMethod: Function,
  visible: {
    type: Boolean,
    default: null
  },
  folding: Boolean,
  collapseNode: Boolean,
  itemRender: Object
};
exports.formItemProps = formItemProps;

var _default = (0, _vue.defineComponent)({
  name: 'VxeFormItem',
  props: formItemProps,
  setup: function setup(props, _a) {
    var slots = _a.slots;
    var refElem = (0, _vue.ref)();
    var $xeform = (0, _vue.inject)('$xeform', {});
    var formGather = (0, _vue.inject)('xeformgather', null);
    var formItem = (0, _util.createItem)($xeform, props);
    formItem.slots = slots;
    (0, _util.watchItem)(props, formItem);
    (0, _vue.onMounted)(function () {
      (0, _util.assemItem)($xeform, refElem.value, formItem, formGather);
    });
    (0, _vue.onUnmounted)(function () {
      (0, _util.destroyItem)($xeform, formItem);
    });

    var renderItem = function renderItem($xeform, item) {
      var props = $xeform.props,
          reactData = $xeform.reactData;
      var data = props.data,
          rules = props.rules,
          allTitleOverflow = props.titleOverflow;
      var collapseAll = reactData.collapseAll;
      var computeValidOpts = $xeform.getComputeMaps().computeValidOpts;
      var validOpts = computeValidOpts.value;
      var slots = item.slots,
          title = item.title,
          visible = item.visible,
          folding = item.folding,
          visibleMethod = item.visibleMethod,
          field = item.field,
          collapseNode = item.collapseNode,
          itemRender = item.itemRender,
          showError = item.showError,
          errRule = item.errRule,
          className = item.className,
          titleOverflow = item.titleOverflow;
      var compConf = (0, _utils.isEnableConf)(itemRender) ? _vXETable.VXETable.renderer.get(itemRender.name) : null;
      var defaultSlot = slots ? slots.default : null;
      var titleSlot = slots ? slots.title : null;
      var span = item.span || props.span;
      var align = item.align || props.align;
      var titleAlign = item.titleAlign || props.titleAlign;
      var titleWidth = item.titleWidth || props.titleWidth;
      var itemOverflow = _xeUtils.default.isUndefined(titleOverflow) || _xeUtils.default.isNull(titleOverflow) ? allTitleOverflow : titleOverflow;
      var showEllipsis = itemOverflow === 'ellipsis';
      var showTitle = itemOverflow === 'title';
      var showTooltip = itemOverflow === true || itemOverflow === 'tooltip';
      var hasEllipsis = showTitle || showTooltip || showEllipsis;
      var itemVisibleMethod = visibleMethod;
      var params = {
        data: data,
        property: field,
        item: item,
        $form: $xeform
      };
      var isRequired = false;

      if (rules) {
        var itemRules = rules[field];

        if (itemRules) {
          isRequired = itemRules.some(function (rule) {
            return rule.required;
          });
        }
      }

      if (!itemVisibleMethod && compConf && compConf.itemVisibleMethod) {
        itemVisibleMethod = compConf.itemVisibleMethod;
      }

      var contentVNs = [];

      if (defaultSlot) {
        contentVNs = $xeform.callSlot(defaultSlot, params);
      } else if (compConf && compConf.renderItemContent) {
        contentVNs = compConf.renderItemContent(itemRender, params);
      } else if (field) {
        contentVNs = ["" + _xeUtils.default.get(data, field)];
      }

      if (collapseNode) {
        contentVNs.push((0, _vue.h)('div', {
          class: 'vxe-form--item-trigger-node',
          onClick: $xeform.toggleCollapseEvent
        }, [(0, _vue.h)('span', {
          class: 'vxe-form--item-trigger-text'
        }, collapseAll ? _conf.default.i18n('vxe.form.unfolding') : _conf.default.i18n('vxe.form.folding')), (0, _vue.h)('i', {
          class: ['vxe-form--item-trigger-icon', collapseAll ? _conf.default.icon.FORM_FOLDING : _conf.default.icon.FORM_UNFOLDING]
        })]));
      }

      if (errRule && validOpts.showMessage) {
        contentVNs.push((0, _vue.h)('div', {
          class: 'vxe-form--item-valid',
          style: errRule.maxWidth ? {
            width: errRule.maxWidth + "px"
          } : null
        }, errRule.message));
      }

      var ons = showTooltip ? {
        onMouseenter: function onMouseenter(evnt) {
          $xeform.triggerHeaderHelpEvent(evnt, params);
        },
        onMouseleave: $xeform.handleTargetLeaveEvent
      } : {};
      return (0, _vue.h)('div', {
        ref: refElem,
        class: ['vxe-form--item', item.id, span ? "vxe-col--" + span + " is--span" : '', className ? _xeUtils.default.isFunction(className) ? className(params) : className : '', {
          'is--title': title,
          'is--required': isRequired,
          'is--hidden': visible === false || folding && collapseAll,
          'is--active': !itemVisibleMethod || itemVisibleMethod(params),
          'is--error': showError
        }]
      }, [(0, _vue.h)('div', {
        class: 'vxe-form--item-inner'
      }, [title || titleSlot ? (0, _vue.h)('div', __assign({
        class: ['vxe-form--item-title', titleAlign ? "align--" + titleAlign : null, {
          'is--ellipsis': hasEllipsis
        }],
        style: titleWidth ? {
          width: isNaN(titleWidth) ? titleWidth : titleWidth + "px"
        } : null,
        title: showTitle ? (0, _utils.getFuncText)(title) : null
      }, ons), (0, _render.renderTitle)($xeform, item)) : null, (0, _vue.h)('div', {
        class: ['vxe-form--item-content', align ? "align--" + align : null]
      }, contentVNs)])]);
    };

    var renderVN = function renderVN() {
      var formProps = $xeform ? $xeform.props : null;
      return formProps && formProps.customLayout ? renderItem($xeform, formItem) : (0, _vue.h)('div', {
        ref: refElem
      });
    };

    return renderVN;
  }
});

exports.default = _default;