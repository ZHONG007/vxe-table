"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = require("vue");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _conf = _interopRequireDefault(require("../../v-x-e-table/src/conf"));

var _vXETable = require("../../v-x-e-table");

var _utils = require("../../tools/utils");

var _dom = require("../../tools/dom");

var _util = require("./util");

var _render = require("./render");

var _size = require("../../hooks/size");

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

var Rule =
/** @class */
function () {
  function Rule(rule) {
    Object.assign(this, {
      $options: rule,
      required: rule.required,
      min: rule.min,
      max: rule.min,
      type: rule.type,
      pattern: rule.pattern,
      validator: rule.validator,
      trigger: rule.trigger,
      maxWidth: rule.maxWidth
    });
  }

  Object.defineProperty(Rule.prototype, "message", {
    get: function get() {
      return (0, _utils.getFuncText)(this.$options.message);
    },
    enumerable: false,
    configurable: true
  });
  return Rule;
}();

var validErrorRuleValue = function validErrorRuleValue(rule, val) {
  var type = rule.type,
      min = rule.min,
      max = rule.max,
      pattern = rule.pattern;
  var isNumType = type === 'number';
  var numVal = isNumType ? _xeUtils.default.toNumber(val) : _xeUtils.default.getSize(val); // 判断数值

  if (isNumType && isNaN(val)) {
    return true;
  } // 如果存在 min，判断最小值


  if (!_xeUtils.default.eqNull(min) && numVal < _xeUtils.default.toNumber(min)) {
    return true;
  } // 如果存在 max，判断最大值


  if (!_xeUtils.default.eqNull(max) && numVal > _xeUtils.default.toNumber(max)) {
    return true;
  } // 如果存在 pattern，正则校验


  if (pattern && !(_xeUtils.default.isRegExp(pattern) ? pattern : new RegExp(pattern)).test(val)) {
    return true;
  }

  return false;
};

function getResetValue(value, resetValue) {
  if (_xeUtils.default.isArray(value)) {
    resetValue = [];
  }

  return resetValue;
}

var _default2 = (0, _vue.defineComponent)({
  name: 'VxeForm',
  props: {
    collapseStatus: {
      type: Boolean,
      default: true
    },
    loading: Boolean,
    data: Object,
    size: {
      type: String,
      default: function _default() {
        return _conf.default.form.size || _conf.default.size;
      }
    },
    span: [String, Number],
    align: {
      type: String,
      default: function _default() {
        return _conf.default.form.align;
      }
    },
    titleAlign: {
      type: String,
      default: function _default() {
        return _conf.default.form.titleAlign;
      }
    },
    titleWidth: [String, Number],
    titleColon: {
      type: Boolean,
      default: function _default() {
        return _conf.default.form.titleColon;
      }
    },
    titleAsterisk: {
      type: Boolean,
      default: function _default() {
        return _conf.default.form.titleAsterisk;
      }
    },
    titleOverflow: {
      type: [Boolean, String],
      default: null
    },
    className: [String, Function],
    items: Array,
    rules: Object,
    preventSubmit: {
      type: Boolean,
      default: function _default() {
        return _conf.default.form.preventSubmit;
      }
    },
    validConfig: Object,
    tooltipConfig: Object,
    customLayout: {
      type: Boolean,
      default: function _default() {
        return _conf.default.form.customLayout;
      }
    }
  },
  emits: ['update:collapseStatus', 'collapse', 'toggle-collapse', 'submit', 'submit-invalid', 'reset'],
  setup: function setup(props, context) {
    var hasUseTooltip = _vXETable.VXETable.tooltip;
    var slots = context.slots,
        emit = context.emit;

    var xID = _xeUtils.default.uniqueId();

    var computeSize = (0, _size.useSize)(props);
    var reactData = (0, _vue.reactive)({
      collapseAll: props.collapseStatus,
      staticItems: [],
      formItems: []
    });
    var internalData = (0, _vue.reactive)({
      tooltipTimeout: null,
      tooltipActive: false,
      tooltipStore: {
        item: null,
        visible: false
      }
    });
    var refElem = (0, _vue.ref)();
    var refTooltip = (0, _vue.ref)();
    var formMethods = {};
    var computeValidOpts = (0, _vue.computed)(function () {
      return Object.assign({}, _conf.default.form.validConfig, props.validConfig);
    });
    var computeTooltipOpts = (0, _vue.ref)();

    var handleTooltipLeaveMethod = function handleTooltipLeaveMethod() {
      var tooltipOpts = computeTooltipOpts.value;
      setTimeout(function () {
        if (!internalData.tooltipActive) {
          formMethods.closeTooltip();
        }
      }, tooltipOpts.leaveDelay);
      return false;
    };

    computeTooltipOpts = (0, _vue.computed)(function () {
      var opts = Object.assign({
        leaveDelay: 300
      }, _conf.default.form.tooltipConfig, props.tooltipConfig);

      if (opts.enterable) {
        opts.leaveMethod = handleTooltipLeaveMethod;
      }

      return opts;
    });
    var refMaps = {
      refElem: refElem
    };
    var computeMaps = {
      computeSize: computeSize,
      computeValidOpts: computeValidOpts,
      computeTooltipOpts: computeTooltipOpts
    };
    var $xeform = {
      xID: xID,
      props: props,
      context: context,
      reactData: reactData,
      getRefMaps: function getRefMaps() {
        return refMaps;
      },
      getComputeMaps: function getComputeMaps() {
        return computeMaps;
      }
    };

    var callSlot = function callSlot(slotFunc, params) {
      if (slotFunc) {
        if (_xeUtils.default.isString(slotFunc)) {
          slotFunc = slots[slotFunc] || null;
        }

        if (_xeUtils.default.isFunction(slotFunc)) {
          return slotFunc(params);
        }
      }

      return [];
    };

    var loadItem = function loadItem(list) {
      if (list.length) {
        if (process.env.NODE_ENV === 'development') {
          list.forEach(function (item) {
            if (item.slots) {
              _xeUtils.default.each(item.slots, function (func) {
                if (!_xeUtils.default.isFunction(func)) {
                  if (!slots[func]) {
                    (0, _utils.errLog)('vxe.error.notSlot', [func]);
                  }
                }
              });
            }
          });
        }

        reactData.staticItems = _xeUtils.default.mapTree(list, function (item) {
          return (0, _util.createItem)($xeform, item);
        }, {
          children: 'children'
        });
      }

      return (0, _vue.nextTick)();
    };

    var getItems = function getItems() {
      var itemList = [];

      _xeUtils.default.eachTree(reactData.formItems, function (item) {
        itemList.push(item);
      }, {
        children: 'children'
      });

      return itemList;
    };

    var getCollapseStatus = function getCollapseStatus() {
      return reactData.collapseAll;
    };

    var toggleCollapse = function toggleCollapse() {
      var status = !getCollapseStatus();
      reactData.collapseAll = status;
      emit('update:collapseStatus', status);
      return (0, _vue.nextTick)();
    };

    var toggleCollapseEvent = function toggleCollapseEvent(evnt) {
      toggleCollapse();
      var status = getCollapseStatus();
      formMethods.dispatchEvent('toggle-collapse', {
        status: status,
        collapse: status,
        data: props.data
      }, evnt);
      formMethods.dispatchEvent('collapse', {
        status: status,
        collapse: status,
        data: props.data
      }, evnt);
    };

    var clearValidate = function clearValidate(field) {
      var itemList = getItems();

      if (field) {
        var item = itemList.find(function (item) {
          return item.field === field;
        });

        if (item) {
          item.showError = false;
        }
      } else {
        itemList.forEach(function (item) {
          item.showError = false;
        });
      }

      return (0, _vue.nextTick)();
    };

    var reset = function reset() {
      var data = props.data;
      var itemList = getItems();

      if (data) {
        itemList.forEach(function (item) {
          var field = item.field,
              resetValue = item.resetValue,
              itemRender = item.itemRender;

          if ((0, _utils.isEnableConf)(itemRender)) {
            var compConf = _vXETable.VXETable.renderer.get(itemRender.name);

            if (compConf && compConf.itemResetMethod) {
              compConf.itemResetMethod({
                data: data,
                property: field,
                item: item,
                $form: $xeform
              });
            } else if (field) {
              _xeUtils.default.set(data, field, resetValue === null ? getResetValue(_xeUtils.default.get(data, field), undefined) : resetValue);
            }
          }
        });
      }

      return clearValidate();
    };

    var resetEvent = function resetEvent(evnt) {
      evnt.preventDefault();
      reset();
      formMethods.dispatchEvent('reset', {
        data: props.data
      }, evnt);
    };

    var handleFocus = function handleFocus(fields) {
      var itemList = getItems();
      var el = refElem.value;
      fields.some(function (property, index) {
        var item = itemList.find(function (item) {
          return item.field === property;
        });

        if (item && (0, _utils.isEnableConf)(item.itemRender)) {
          var itemRender = item.itemRender;

          var compConf = _vXETable.VXETable.renderer.get(itemRender.name);

          var inputElem = null; // 定位到第一个

          if (!index) {
            (0, _dom.scrollToView)(el.querySelector("." + item.id));
          } // 如果指定了聚焦 class


          if (itemRender.autofocus) {
            inputElem = el.querySelector("." + item.id + " " + itemRender.autofocus);
          } // 渲染器的聚焦处理


          if (!inputElem && compConf && compConf.autofocus) {
            inputElem = el.querySelector("." + item.id + " " + compConf.autofocus);
          }

          if (inputElem) {
            inputElem.focus();
            return true;
          }
        }
      });
    };
    /**
     * 校验数据
     * 按表格行、列顺序依次校验（同步或异步）
     * 校验规则根据索引顺序依次校验，如果是异步则会等待校验完成才会继续校验下一列
     * 如果校验失败则，触发回调或者 Promise<(ErrMap 校验不通过列的信息)>
     * 如果是传回调方式这返回一个 (ErrMap 校验不通过列的信息)
     *
     * rule 配置：
     *  required=Boolean 是否必填
     *  min=Number 最小长度
     *  max=Number 最大长度
     *  validator=Function({ itemValue, rule, rules, data, property }) 自定义校验，接收一个 Promise
     *  trigger=change 触发方式
     */


    var validItemRules = function validItemRules(validType, property, val) {
      var data = props.data,
          formRules = props.rules;
      var errorRules = [];
      var syncVailds = [];

      if (property && formRules) {
        var rules_1 = _xeUtils.default.get(formRules, property);

        if (rules_1) {
          var itemValue_1 = _xeUtils.default.isUndefined(val) ? _xeUtils.default.get(data, property) : val;
          rules_1.forEach(function (rule) {
            var type = rule.type,
                trigger = rule.trigger,
                required = rule.required;

            if (validType === 'all' || !trigger || validType === trigger) {
              if (_xeUtils.default.isFunction(rule.validator)) {
                var customValid = rule.validator({
                  itemValue: itemValue_1,
                  rule: rule,
                  rules: rules_1,
                  data: data,
                  property: property,
                  $form: $xeform
                });

                if (customValid) {
                  if (_xeUtils.default.isError(customValid)) {
                    errorRules.push(new Rule({
                      type: 'custom',
                      trigger: trigger,
                      message: customValid.message,
                      rule: new Rule(rule)
                    }));
                  } else if (customValid.catch) {
                    // 如果为异步校验（注：异步校验是并发无序的）
                    syncVailds.push(customValid.catch(function (e) {
                      errorRules.push(new Rule({
                        type: 'custom',
                        trigger: trigger,
                        message: e ? e.message : rule.message,
                        rule: new Rule(rule)
                      }));
                    }));
                  }
                }
              } else {
                var isArrType = type === 'array';
                var hasEmpty = isArrType ? !_xeUtils.default.isArray(itemValue_1) || !itemValue_1.length : (0, _utils.eqEmptyValue)(itemValue_1);

                if (required ? hasEmpty || validErrorRuleValue(rule, itemValue_1) : !hasEmpty && validErrorRuleValue(rule, itemValue_1)) {
                  errorRules.push(new Rule(rule));
                }
              }
            }
          });
        }
      }

      return Promise.all(syncVailds).then(function () {
        if (errorRules.length) {
          var rest = {
            rules: errorRules,
            rule: errorRules[0]
          };
          return Promise.reject(rest);
        }
      });
    };

    var showErrTime;

    var beginValidate = function beginValidate(itemList, type, callback) {
      var data = props.data,
          formRules = props.rules;
      var validOpts = computeValidOpts.value;
      var validRest = {};
      var validFields = [];
      var itemValids = [];
      clearValidate();
      clearTimeout(showErrTime);

      if (data && formRules) {
        itemList.forEach(function (item) {
          var field = item.field;

          if (field) {
            itemValids.push(validItemRules(type || 'all', field).then(function () {
              item.errRule = null;
            }).catch(function (_a) {
              var rule = _a.rule,
                  rules = _a.rules;
              var rest = {
                rule: rule,
                rules: rules,
                data: data,
                property: field,
                $form: $xeform
              };

              if (!validRest[field]) {
                validRest[field] = [];
              }

              validRest[field].push(rest);
              validFields.push(field);
              item.errRule = rule;
              return Promise.reject(rest);
            }));
          }
        });
        return Promise.all(itemValids).then(function () {
          if (callback) {
            callback();
          }
        }).catch(function () {
          return new Promise(function (resolve, reject) {
            showErrTime = window.setTimeout(function () {
              itemList.forEach(function (item) {
                if (item.errRule) {
                  item.showError = true;
                }
              });
            }, 20);

            if (validOpts.autoPos !== false) {
              (0, _vue.nextTick)(function () {
                handleFocus(validFields);
              });
            }

            if (callback) {
              callback(validRest);
              resolve();
            } else {
              reject(validRest);
            }
          });
        });
      }

      if (callback) {
        callback();
      }

      return Promise.resolve();
    };

    var validate = function validate(callback) {
      return beginValidate(getItems(), '', callback);
    };

    var validateField = function validateField(field, callback) {
      return beginValidate(getItems().filter(function (item) {
        return item.field === field;
      }), '', callback);
    };

    var submitEvent = function submitEvent(evnt) {
      evnt.preventDefault();

      if (!props.preventSubmit) {
        beginValidate(getItems()).then(function () {
          formMethods.dispatchEvent('submit', {
            data: props.data
          }, evnt);
        }).catch(function (errMap) {
          formMethods.dispatchEvent('submit-invalid', {
            data: props.data,
            errMap: errMap
          }, evnt);
        });
      }
    };

    var closeTooltip = function closeTooltip() {
      var tooltipStore = internalData.tooltipStore;
      var $tooltip = refTooltip.value;

      if (tooltipStore.visible) {
        Object.assign(tooltipStore, {
          item: null,
          visible: false
        });

        if ($tooltip) {
          $tooltip.close();
        }
      }

      return (0, _vue.nextTick)();
    };

    var triggerHeaderHelpEvent = function triggerHeaderHelpEvent(evnt, params) {
      var item = params.item;
      var tooltipStore = internalData.tooltipStore;
      var $tooltip = refTooltip.value;
      var overflowElem = evnt.currentTarget.children[0];
      var content = (overflowElem.textContent || '').trim();
      var isCellOverflow = overflowElem.scrollWidth > overflowElem.clientWidth;
      clearTimeout(internalData.tooltipTimeout);
      internalData.tooltipActive = true;
      closeTooltip();

      if (content && isCellOverflow) {
        Object.assign(tooltipStore, {
          item: item,
          visible: true
        });

        if ($tooltip) {
          $tooltip.open(overflowElem, content);
        }
      }
    };

    var handleTargetLeaveEvent = function handleTargetLeaveEvent() {
      var tooltipOpts = computeTooltipOpts.value;
      internalData.tooltipActive = false;

      if (tooltipOpts.enterable) {
        internalData.tooltipTimeout = setTimeout(function () {
          var $tooltip = refTooltip.value;

          if ($tooltip && !$tooltip.reactData.isHover) {
            closeTooltip();
          }
        }, tooltipOpts.leaveDelay);
      } else {
        closeTooltip();
      }
    };
    /**
     * 更新项状态
     * 如果组件值 v-model 发生 change 时，调用改函数用于更新某一项编辑状态
     * 如果单元格配置了校验规则，则会进行校验
     */


    var updateStatus = function updateStatus(scope, itemValue) {
      var property = scope.property;

      if (property) {
        validItemRules('change', property, itemValue).then(function () {
          clearValidate(property);
        }).catch(function (_a) {
          var rule = _a.rule;
          var itemList = getItems();
          var item = itemList.find(function (item) {
            return item.field === property;
          });

          if (item) {
            item.showError = true;
            item.errRule = rule;
          }
        });
      }
    };

    var renderItems = function renderItems(itemList) {
      var data = props.data,
          rules = props.rules,
          allTitleOverflow = props.titleOverflow;
      var collapseAll = reactData.collapseAll;
      var validOpts = computeValidOpts.value;
      return itemList.map(function (item, index) {
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
            titleOverflow = item.titleOverflow,
            children = item.children;
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

        if (visible === false) {
          return (0, _vue.createCommentVNode)();
        }

        var isRequired = false;

        if (rules) {
          var itemRules = rules[field];

          if (itemRules) {
            isRequired = itemRules.some(function (rule) {
              return rule.required;
            });
          }
        } // 如果为项集合


        var isGather = children && children.length > 0;

        if (isGather) {
          var childVNs = renderItems(item.children);
          return childVNs.length ? (0, _vue.h)('div', {
            class: ['vxe-form--gather vxe-row', item.id, span ? "vxe-col--" + span + " is--span" : '', className ? _xeUtils.default.isFunction(className) ? className(params) : className : '']
          }, childVNs) : (0, _vue.createCommentVNode)();
        }

        if (!itemVisibleMethod && compConf && compConf.itemVisibleMethod) {
          itemVisibleMethod = compConf.itemVisibleMethod;
        }

        var contentVNs = [];

        if (defaultSlot) {
          contentVNs = callSlot(defaultSlot, params);
        } else if (compConf && compConf.renderItemContent) {
          contentVNs = compConf.renderItemContent(itemRender, params);
        } else if (field) {
          contentVNs = ["" + _xeUtils.default.get(data, field)];
        }

        if (collapseNode) {
          contentVNs.push((0, _vue.h)('div', {
            class: 'vxe-form--item-trigger-node',
            onClick: toggleCollapseEvent
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
            triggerHeaderHelpEvent(evnt, params);
          },
          onMouseleave: handleTargetLeaveEvent
        } : {};
        return (0, _vue.h)('div', {
          class: ['vxe-form--item', item.id, span ? "vxe-col--" + span + " is--span" : '', className ? _xeUtils.default.isFunction(className) ? className(params) : className : '', {
            'is--title': title,
            'is--required': isRequired,
            'is--hidden': folding && collapseAll,
            'is--active': !itemVisibleMethod || itemVisibleMethod(params),
            'is--error': showError
          }],
          key: index
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
      });
    };

    formMethods = {
      dispatchEvent: function dispatchEvent(type, params, evnt) {
        emit(type, Object.assign({
          $form: $xeform,
          $event: evnt
        }, params));
      },
      reset: reset,
      validate: validate,
      validateField: validateField,
      clearValidate: clearValidate,
      updateStatus: updateStatus,
      toggleCollapse: toggleCollapse,
      getItems: getItems,
      closeTooltip: closeTooltip
    };
    var formPrivateMethods = {
      callSlot: callSlot,
      toggleCollapseEvent: toggleCollapseEvent,
      triggerHeaderHelpEvent: triggerHeaderHelpEvent,
      handleTargetLeaveEvent: handleTargetLeaveEvent
    };
    Object.assign($xeform, formMethods, formPrivateMethods);
    (0, _vue.watch)(function () {
      return reactData.staticItems;
    }, function (value) {
      reactData.formItems = value;
    });
    (0, _vue.watch)(function () {
      return props.items;
    }, function (value) {
      loadItem(value || []);
    });
    (0, _vue.watch)(function () {
      return props.collapseStatus;
    }, function (value) {
      reactData.collapseAll = !!value;
    });
    (0, _vue.onMounted)(function () {
      (0, _vue.nextTick)(function () {
        if (process.env.NODE_ENV === 'development') {
          if (props.customLayout && props.items) {
            (0, _utils.errLog)('vxe.error.errConflicts', ['custom-layout', 'items']);
          }
        }

        loadItem(props.items || []);
      });
    });

    var renderVN = function renderVN() {
      var _a;

      var loading = props.loading,
          className = props.className,
          data = props.data,
          titleColon = props.titleColon,
          titleAsterisk = props.titleAsterisk,
          customLayout = props.customLayout;
      var formItems = reactData.formItems;
      var vSize = computeSize.value;
      var tooltipOpts = computeTooltipOpts.value;
      var defaultSlot = slots.default;
      return (0, _vue.h)('form', {
        ref: refElem,
        class: ['vxe-form', className ? _xeUtils.default.isFunction(className) ? className({
          items: formItems,
          data: data,
          $form: $xeform
        }) : className : '', (_a = {}, _a["size--" + vSize] = vSize, _a['is--colon'] = titleColon, _a['is--asterisk'] = titleAsterisk, _a['is--loading'] = loading, _a)],
        onSubmit: submitEvent,
        onReset: resetEvent
      }, [(0, _vue.h)('div', {
        class: 'vxe-form--wrapper vxe-row'
      }, customLayout ? defaultSlot ? defaultSlot({}) : [] : renderItems(formItems)), (0, _vue.h)('div', {
        class: 'vxe-form-slots',
        ref: 'hideItem'
      }, customLayout ? [] : defaultSlot ? defaultSlot({}) : []), (0, _vue.h)('div', {
        class: ['vxe-loading', {
          'is--visible': loading
        }]
      }, [(0, _vue.h)('div', {
        class: 'vxe-loading--spinner'
      })]),
      /**
       * 工具提示
       */
      hasUseTooltip ? (0, _vue.h)((0, _vue.resolveComponent)('vxe-tooltip'), __assign({
        ref: refTooltip
      }, tooltipOpts)) : (0, _vue.createCommentVNode)()]);
    };

    $xeform.renderVN = renderVN;
    (0, _vue.provide)('$xeform', $xeform);
    return $xeform;
  },
  render: function render() {
    return this.renderVN();
  }
});

exports.default = _default2;