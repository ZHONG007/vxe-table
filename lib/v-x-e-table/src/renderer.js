"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderer = void 0;

var _vue = require("vue");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _conf = _interopRequireDefault(require("./conf"));

var _util = require("../../table/src/util");

var _utils = require("../../tools/utils");

var _vn = require("../../tools/vn");

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

var componentDefaultModelProp = 'modelValue';
var defaultCompProps = {
  transfer: true
};

function getModelEvent(renderOpts) {
  switch (renderOpts.name) {
    case 'input':
    case 'textarea':
      return 'input';
  }

  return 'update:modelValue';
}

function getChangeEvent(renderOpts) {
  switch (renderOpts.name) {
    case 'input':
    case 'textarea':
    case '$input':
    case '$textarea':
      return 'input';
  }

  return 'change';
}

function parseDate(value, props) {
  return value && props.valueFormat ? _xeUtils.default.toStringDate(value, props.valueFormat) : value;
}

function getFormatDate(value, props, defaultFormat) {
  var _a = props.dateConfig,
      dateConfig = _a === void 0 ? {} : _a;
  return _xeUtils.default.toDateString(parseDate(value, props), dateConfig.labelFormat || defaultFormat);
}

function getLabelFormatDate(value, props) {
  return getFormatDate(value, props, _conf.default.i18n("vxe.input.date.labelFormat." + props.type));
}

function getComponentName(name) {
  return "vxe-" + name.replace('$', '');
}

function getDefaultComponent(_a) {
  var name = _a.name;
  return (0, _vue.resolveComponent)(getComponentName(name));
}

function handleConfirmFilter(params, checked, option) {
  var $panel = params.$panel;
  $panel.changeOption({}, checked, option);
}

function getNativeAttrs(renderOpts) {
  var name = renderOpts.name,
      attrs = renderOpts.attrs;

  if (name === 'input') {
    attrs = Object.assign({
      type: 'text'
    }, attrs);
  }

  return attrs;
}

function getInputImmediateModel(renderOpts) {
  var name = renderOpts.name,
      immediate = renderOpts.immediate,
      props = renderOpts.props;

  if (!immediate) {
    if (name === '$input') {
      var type = (props || {}).type;
      return !(!type || type === 'text' || type === 'number' || type === 'integer' || type === 'float');
    }

    if (name === 'input' || name === 'textarea' || name === '$textarea') {
      return false;
    }

    return true;
  }

  return immediate;
}

function getCellEditProps(renderOpts, params, value, defaultProps) {
  var _a;

  return _xeUtils.default.assign({
    immediate: getInputImmediateModel(renderOpts)
  }, defaultCompProps, defaultProps, renderOpts.props, (_a = {}, _a[componentDefaultModelProp] = value, _a));
}

function getCellEditFilterProps(renderOpts, params, value, defaultProps) {
  var _a;

  return _xeUtils.default.assign({}, defaultCompProps, defaultProps, renderOpts.props, (_a = {}, _a[componentDefaultModelProp] = value, _a));
}

function getComponentFormItemProps(renderOpts, params, value, defaultProps) {
  var _a;

  return _xeUtils.default.assign({}, defaultCompProps, defaultProps, renderOpts.props, (_a = {}, _a[componentDefaultModelProp] = value, _a));
}

function isImmediateCell(renderOpts, params) {
  return params.$type === 'cell' || getInputImmediateModel(renderOpts);
}

function getCellLabelVNs(renderOpts, params, cellLabel) {
  var placeholder = renderOpts.placeholder;
  return [(0, _vue.h)('span', {
    class: 'vxe-cell--label'
  }, placeholder && (0, _utils.isEmptyValue)(cellLabel) ? [(0, _vue.h)('span', {
    class: 'vxe-cell--placeholder'
  }, (0, _utils.formatText)((0, _utils.getFuncText)(placeholder), 1))] : (0, _utils.formatText)(cellLabel, 1))];
}
/**
 * ??????????????????
 * @param renderOpts
 * @param params
 * @param modelFunc
 * @param changeFunc
 */


function getElementOns(renderOpts, params, modelFunc, changeFunc) {
  var events = renderOpts.events;
  var modelEvent = getModelEvent(renderOpts);
  var changeEvent = getChangeEvent(renderOpts);
  var isSameEvent = changeEvent === modelEvent;
  var ons = {};

  if (events) {
    _xeUtils.default.objectEach(events, function (func, key) {
      ons[(0, _vn.getOnName)(key)] = function () {
        var args = [];

        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }

        func.apply(void 0, __spreadArray([params], args));
      };
    });
  }

  if (modelFunc) {
    ons[(0, _vn.getOnName)(modelEvent)] = function (targetEvnt) {
      modelFunc(targetEvnt);

      if (isSameEvent && changeFunc) {
        changeFunc(targetEvnt);
      }

      if (events && events[modelEvent]) {
        events[modelEvent](params, targetEvnt);
      }
    };
  }

  if (!isSameEvent && changeFunc) {
    ons[(0, _vn.getOnName)(changeEvent)] = function () {
      var args = [];

      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }

      changeFunc.apply(void 0, args);

      if (events && events[changeEvent]) {
        events[changeEvent].apply(events, __spreadArray([params], args));
      }
    };
  }

  return ons;
}
/**
 * ??????????????????
 * @param renderOpts
 * @param params
 * @param modelFunc
 * @param changeFunc
 */


function getComponentOns(renderOpts, params, modelFunc, changeFunc) {
  var events = renderOpts.events;
  var modelEvent = getModelEvent(renderOpts);
  var changeEvent = getChangeEvent(renderOpts);
  var ons = {};

  _xeUtils.default.objectEach(events, function (func, key) {
    ons[(0, _vn.getOnName)(key)] = function () {
      var args = [];

      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }

      func.apply(void 0, __spreadArray([params], args));
    };
  });

  if (modelFunc) {
    ons[(0, _vn.getOnName)(modelEvent)] = function (targetEvnt) {
      modelFunc(targetEvnt);

      if (events && events[modelEvent]) {
        events[modelEvent](params, targetEvnt);
      }
    };
  }

  if (changeFunc) {
    ons[(0, _vn.getOnName)(changeEvent)] = function () {
      var args = [];

      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }

      changeFunc.apply(void 0, args);

      if (events && events[changeEvent]) {
        events[changeEvent].apply(events, __spreadArray([params], args));
      }
    };
  }

  return ons;
}

function getEditOns(renderOpts, params) {
  var $table = params.$table,
      row = params.row,
      column = params.column;
  var name = renderOpts.name;
  var model = column.model;
  var isImmediate = isImmediateCell(renderOpts, params);
  return getComponentOns(renderOpts, params, function (cellValue) {
    // ?????? model ???????????????
    if (isImmediate) {
      (0, _util.setCellValue)(row, column, cellValue);
    } else {
      model.update = true;
      model.value = cellValue;
    }
  }, function (eventParams) {
    // ?????? change ??????????????????
    if (!isImmediate && (name === '$input' || name === '$textarea')) {
      var cellValue = eventParams.value;
      model.update = true;
      model.value = cellValue;
      $table.updateStatus(params, cellValue);
    } else {
      $table.updateStatus(params);
    }
  });
}

function getFilterOns(renderOpts, params, option) {
  return getComponentOns(renderOpts, params, function (value) {
    // ?????? model ???????????????
    option.data = value;
  }, function () {
    handleConfirmFilter(params, !_xeUtils.default.eqNull(option.data), option);
  });
}

function getItemOns(renderOpts, params) {
  var $form = params.$form,
      data = params.data,
      property = params.property;
  return getComponentOns(renderOpts, params, function (value) {
    // ?????? model ???????????????
    _xeUtils.default.set(data, property, value);
  }, function () {
    // ?????? change ??????????????????
    $form.updateStatus(params);
  });
}

function getNativeEditOns(renderOpts, params) {
  var $table = params.$table,
      row = params.row,
      column = params.column;
  var model = column.model;
  return getElementOns(renderOpts, params, function (evnt) {
    // ?????? model ???????????????
    var cellValue = evnt.target.value;

    if (isImmediateCell(renderOpts, params)) {
      (0, _util.setCellValue)(row, column, cellValue);
    } else {
      model.update = true;
      model.value = cellValue;
    }
  }, function (evnt) {
    // ?????? change ??????????????????
    var cellValue = evnt.target.value;
    $table.updateStatus(params, cellValue);
  });
}

function getNativeFilterOns(renderOpts, params, option) {
  return getElementOns(renderOpts, params, function (evnt) {
    // ?????? model ???????????????
    option.data = evnt.target.value;
  }, function () {
    handleConfirmFilter(params, !_xeUtils.default.eqNull(option.data), option);
  });
}

function getNativeItemOns(renderOpts, params) {
  var $form = params.$form,
      data = params.data,
      property = params.property;
  return getElementOns(renderOpts, params, function (evnt) {
    // ?????? model ???????????????
    var itemValue = evnt.target.value;

    _xeUtils.default.set(data, property, itemValue);
  }, function () {
    // ?????? change ??????????????????
    $form.updateStatus(params);
  });
}
/**
 * ????????????????????????-???????????????
 * input???textarea???select
 */


function nativeEditRender(renderOpts, params) {
  var row = params.row,
      column = params.column;
  var name = renderOpts.name;
  var cellValue = isImmediateCell(renderOpts, params) ? (0, _util.getCellValue)(row, column) : column.model.value;
  return [(0, _vue.h)(name, __assign(__assign(__assign({
    class: "vxe-default-" + name
  }, getNativeAttrs(renderOpts)), {
    value: cellValue
  }), getNativeEditOns(renderOpts, params)))];
}

function defaultEditRender(renderOpts, params) {
  var row = params.row,
      column = params.column;
  var cellValue = (0, _util.getCellValue)(row, column);
  return [(0, _vue.h)(getDefaultComponent(renderOpts), __assign(__assign({}, getCellEditProps(renderOpts, params, cellValue)), getEditOns(renderOpts, params)))];
}

function defaultButtonEditRender(renderOpts, params) {
  return [(0, _vue.h)((0, _vue.resolveComponent)('vxe-button'), __assign(__assign({}, getCellEditProps(renderOpts, params, null)), getComponentOns(renderOpts, params)))];
}

function defaultButtonsEditRender(renderOpts, params) {
  return renderOpts.children.map(function (childRenderOpts) {
    return defaultButtonEditRender(childRenderOpts, params)[0];
  });
}

function renderNativeOptgroups(renderOpts, params, renderOptionsMethods) {
  var optionGroups = renderOpts.optionGroups,
      _a = renderOpts.optionGroupProps,
      optionGroupProps = _a === void 0 ? {} : _a;
  var groupOptions = optionGroupProps.options || 'options';
  var groupLabel = optionGroupProps.label || 'label';
  return optionGroups.map(function (group, gIndex) {
    return (0, _vue.h)('optgroup', {
      key: gIndex,
      label: group[groupLabel]
    }, renderOptionsMethods(group[groupOptions], renderOpts, params));
  });
}
/**
 * ??????????????? option ??????
 */


function renderNativeOptions(options, renderOpts, params) {
  var _a = renderOpts.optionProps,
      optionProps = _a === void 0 ? {} : _a;
  var row = params.row,
      column = params.column;
  var labelProp = optionProps.label || 'label';
  var valueProp = optionProps.value || 'value';
  var disabledProp = optionProps.disabled || 'disabled';
  var cellValue = isImmediateCell(renderOpts, params) ? (0, _util.getCellValue)(row, column) : column.model.value;
  return options.map(function (option, oIndex) {
    return (0, _vue.h)('option', {
      key: oIndex,
      value: option[valueProp],
      disabled: option[disabledProp],

      /* eslint-disable eqeqeq */
      selected: option[valueProp] == cellValue
    }, option[labelProp]);
  });
}

function nativeFilterRender(renderOpts, params) {
  var column = params.column;
  var name = renderOpts.name;
  var attrs = getNativeAttrs(renderOpts);
  return column.filters.map(function (option, oIndex) {
    return (0, _vue.h)(name, __assign(__assign(__assign({
      key: oIndex,
      class: "vxe-default-" + name
    }, attrs), {
      value: option.data
    }), getNativeFilterOns(renderOpts, params, option)));
  });
}

function defaultFilterRender(renderOpts, params) {
  var column = params.column;
  return column.filters.map(function (option, oIndex) {
    var optionValue = option.data;
    return (0, _vue.h)(getDefaultComponent(renderOpts), __assign(__assign({
      key: oIndex
    }, getCellEditFilterProps(renderOpts, renderOpts, optionValue)), getFilterOns(renderOpts, params, option)));
  });
}

function handleFilterMethod(_a) {
  var option = _a.option,
      row = _a.row,
      column = _a.column;
  var data = option.data;

  var cellValue = _xeUtils.default.get(row, column.property);
  /* eslint-disable eqeqeq */


  return cellValue == data;
}

function nativeSelectEditRender(renderOpts, params) {
  return [(0, _vue.h)('select', __assign(__assign({
    class: 'vxe-default-select'
  }, getNativeAttrs(renderOpts)), getNativeEditOns(renderOpts, params)), renderOpts.optionGroups ? renderNativeOptgroups(renderOpts, params, renderNativeOptions) : renderNativeOptions(renderOpts.options, renderOpts, params))];
}

function defaultSelectEditRender(renderOpts, params) {
  var row = params.row,
      column = params.column;
  var options = renderOpts.options,
      optionProps = renderOpts.optionProps,
      optionGroups = renderOpts.optionGroups,
      optionGroupProps = renderOpts.optionGroupProps;
  var cellValue = (0, _util.getCellValue)(row, column);
  return [(0, _vue.h)(getDefaultComponent(renderOpts), __assign(__assign({}, getCellEditProps(renderOpts, params, cellValue, {
    options: options,
    optionProps: optionProps,
    optionGroups: optionGroups,
    optionGroupProps: optionGroupProps
  })), getEditOns(renderOpts, params)))];
}

function getSelectCellValue(renderOpts, _a) {
  var row = _a.row,
      column = _a.column;
  var _b = renderOpts.props,
      props = _b === void 0 ? {} : _b,
      options = renderOpts.options,
      optionGroups = renderOpts.optionGroups,
      _c = renderOpts.optionProps,
      optionProps = _c === void 0 ? {} : _c,
      _d = renderOpts.optionGroupProps,
      optionGroupProps = _d === void 0 ? {} : _d;

  var cellValue = _xeUtils.default.get(row, column.property);

  var selectItem;
  var labelProp = optionProps.label || 'label';
  var valueProp = optionProps.value || 'value';

  if (!(0, _utils.isEmptyValue)(cellValue)) {
    return _xeUtils.default.map(props.multiple ? cellValue : [cellValue], optionGroups ? function (value) {
      var groupOptions = optionGroupProps.options || 'options';

      for (var index = 0; index < optionGroups.length; index++) {
        /* eslint-disable eqeqeq */
        selectItem = _xeUtils.default.find(optionGroups[index][groupOptions], function (item) {
          return item[valueProp] == value;
        });

        if (selectItem) {
          break;
        }
      }

      return selectItem ? selectItem[labelProp] : value;
    } : function (value) {
      /* eslint-disable eqeqeq */
      selectItem = _xeUtils.default.find(options, function (item) {
        return item[valueProp] == value;
      });
      return selectItem ? selectItem[labelProp] : value;
    }).join(', ');
  }

  return '';
}
/**
 * ????????????-???
 * ???????????????????????????
 */


function nativeItemRender(renderOpts, params) {
  var data = params.data,
      property = params.property;
  var name = renderOpts.name;
  var attrs = getNativeAttrs(renderOpts);

  var itemValue = _xeUtils.default.get(data, property);

  return [(0, _vue.h)(name, __assign(__assign(__assign({
    class: "vxe-default-" + name
  }, attrs), {
    value: attrs && name === 'input' && (attrs.type === 'submit' || attrs.type === 'reset') ? null : itemValue
  }), getNativeItemOns(renderOpts, params)))];
}

function defaultItemRender(renderOpts, params) {
  var data = params.data,
      property = params.property;

  var itemValue = _xeUtils.default.get(data, property);

  return [(0, _vue.h)(getDefaultComponent(renderOpts), __assign(__assign({}, getComponentFormItemProps(renderOpts, params, itemValue)), getItemOns(renderOpts, params)))];
}

function defaultButtonItemRender(renderOpts, params) {
  return [(0, _vue.h)((0, _vue.resolveComponent)('vxe-button'), __assign(__assign({}, getComponentFormItemProps(renderOpts, params, null)), getComponentOns(renderOpts, params)))];
}

function defaultButtonsItemRender(renderOpts, params) {
  return renderOpts.children.map(function (childRenderOpts) {
    return defaultButtonItemRender(childRenderOpts, params)[0];
  });
}
/**
 * ??????????????? select ??????
 */


function renderNativeFormOptions(options, renderOpts, params) {
  var data = params.data,
      property = params.property;
  var _a = renderOpts.optionProps,
      optionProps = _a === void 0 ? {} : _a;
  var labelProp = optionProps.label || 'label';
  var valueProp = optionProps.value || 'value';
  var disabledProp = optionProps.disabled || 'disabled';

  var cellValue = _xeUtils.default.get(data, property);

  return options.map(function (item, oIndex) {
    return (0, _vue.h)('option', {
      key: oIndex,
      value: item[valueProp],
      disabled: item[disabledProp],

      /* eslint-disable eqeqeq */
      selected: item[valueProp] == cellValue
    }, item[labelProp]);
  });
}

function handleExportSelectMethod(params) {
  var row = params.row,
      column = params.column,
      options = params.options;
  return options.original ? (0, _util.getCellValue)(row, column) : getSelectCellValue(column.editRender || column.cellRender, params);
}
/**
 * ????????????-??????
 * ?????????????????????
 */


function defaultFormItemRadioAndCheckboxRender(renderOpts, params) {
  var name = renderOpts.name,
      options = renderOpts.options,
      _a = renderOpts.optionProps,
      optionProps = _a === void 0 ? {} : _a;
  var data = params.data,
      property = params.property;
  var labelProp = optionProps.label || 'label';
  var valueProp = optionProps.value || 'value';
  var disabledProp = optionProps.disabled || 'disabled';

  var itemValue = _xeUtils.default.get(data, property);

  var compName = getComponentName(name); // ???????????????

  if (options) {
    return [(0, _vue.h)((0, _vue.resolveComponent)(compName + "-group"), __assign(__assign({}, getComponentFormItemProps(renderOpts, params, itemValue)), getItemOns(renderOpts, params)), {
      default: function _default() {
        return options.map(function (item, index) {
          return (0, _vue.h)((0, _vue.resolveComponent)(compName), {
            key: index,
            label: item[valueProp],
            content: item[labelProp],
            disabled: item[disabledProp]
          });
        });
      }
    })];
  }

  return [(0, _vue.h)((0, _vue.resolveComponent)(compName), __assign(__assign({}, getComponentFormItemProps(renderOpts, params, itemValue)), getItemOns(renderOpts, params)))];
}
/**
 * ?????????????????????
 */


var renderMap = {
  input: {
    autofocus: 'input',
    renderEdit: nativeEditRender,
    renderDefault: nativeEditRender,
    renderFilter: nativeFilterRender,
    filterMethod: handleFilterMethod,
    renderItemContent: nativeItemRender
  },
  textarea: {
    autofocus: 'textarea',
    renderEdit: nativeEditRender,
    renderItemContent: nativeItemRender
  },
  select: {
    renderEdit: nativeSelectEditRender,
    renderDefault: nativeSelectEditRender,
    renderCell: function renderCell(renderOpts, params) {
      return getCellLabelVNs(renderOpts, params, getSelectCellValue(renderOpts, params));
    },
    renderFilter: function renderFilter(renderOpts, params) {
      var column = params.column;
      return column.filters.map(function (option, oIndex) {
        return (0, _vue.h)('select', __assign(__assign({
          key: oIndex,
          class: 'vxe-default-select'
        }, getNativeAttrs(renderOpts)), getNativeFilterOns(renderOpts, params, option)), renderOpts.optionGroups ? renderNativeOptgroups(renderOpts, params, renderNativeOptions) : renderNativeOptions(renderOpts.options, renderOpts, params));
      });
    },
    filterMethod: handleFilterMethod,
    renderItemContent: function renderItemContent(renderOpts, params) {
      return [(0, _vue.h)('select', __assign(__assign({
        class: 'vxe-default-select'
      }, getNativeAttrs(renderOpts)), getNativeItemOns(renderOpts, params)), renderOpts.optionGroups ? renderNativeOptgroups(renderOpts, params, renderNativeFormOptions) : renderNativeFormOptions(renderOpts.options, renderOpts, params))];
    },
    cellExportMethod: handleExportSelectMethod
  },
  $input: {
    autofocus: '.vxe-input--inner',
    renderEdit: defaultEditRender,
    renderCell: function renderCell(renderOpts, params) {
      var _a = renderOpts.props,
          props = _a === void 0 ? {} : _a;
      var row = params.row,
          column = params.column;
      var digits = props.digits || _conf.default.input.digits;

      var cellValue = _xeUtils.default.get(row, column.property);

      if (cellValue) {
        switch (props.type) {
          case 'date':
          case 'week':
          case 'month':
          case 'year':
            cellValue = getLabelFormatDate(cellValue, props);
            break;

          case 'float':
            cellValue = _xeUtils.default.toFixed(_xeUtils.default.floor(cellValue, digits), digits);
            break;
        }
      }

      return getCellLabelVNs(renderOpts, params, cellValue);
    },
    renderDefault: defaultEditRender,
    renderFilter: defaultFilterRender,
    filterMethod: handleFilterMethod,
    renderItemContent: defaultItemRender
  },
  $textarea: {
    autofocus: '.vxe-textarea--inner',
    renderItemContent: defaultItemRender
  },
  $button: {
    renderDefault: defaultButtonEditRender,
    renderItemContent: defaultButtonItemRender
  },
  $buttons: {
    renderDefault: defaultButtonsEditRender,
    renderItemContent: defaultButtonsItemRender
  },
  $select: {
    autofocus: '.vxe-input--inner',
    renderEdit: defaultSelectEditRender,
    renderDefault: defaultSelectEditRender,
    renderCell: function renderCell(renderOpts, params) {
      return getCellLabelVNs(renderOpts, params, getSelectCellValue(renderOpts, params));
    },
    renderFilter: function renderFilter(renderOpts, params) {
      var column = params.column;
      var options = renderOpts.options,
          optionProps = renderOpts.optionProps,
          optionGroups = renderOpts.optionGroups,
          optionGroupProps = renderOpts.optionGroupProps;
      return column.filters.map(function (option, oIndex) {
        var optionValue = option.data;
        return (0, _vue.h)(getDefaultComponent(renderOpts), __assign(__assign({
          key: oIndex
        }, getCellEditFilterProps(renderOpts, params, optionValue, {
          options: options,
          optionProps: optionProps,
          optionGroups: optionGroups,
          optionGroupProps: optionGroupProps
        })), getFilterOns(renderOpts, params, option)));
      });
    },
    filterMethod: handleFilterMethod,
    renderItemContent: function renderItemContent(renderOpts, params) {
      var data = params.data,
          property = params.property;
      var options = renderOpts.options,
          optionProps = renderOpts.optionProps,
          optionGroups = renderOpts.optionGroups,
          optionGroupProps = renderOpts.optionGroupProps;

      var itemValue = _xeUtils.default.get(data, property);

      return [(0, _vue.h)(getDefaultComponent(renderOpts), __assign(__assign({}, getComponentFormItemProps(renderOpts, params, itemValue, {
        options: options,
        optionProps: optionProps,
        optionGroups: optionGroups,
        optionGroupProps: optionGroupProps
      })), getItemOns(renderOpts, params)))];
    },
    cellExportMethod: handleExportSelectMethod
  },
  $radio: {
    autofocus: '.vxe-radio--input',
    renderItemContent: defaultFormItemRadioAndCheckboxRender
  },
  $checkbox: {
    autofocus: '.vxe-checkbox--input',
    renderItemContent: defaultFormItemRadioAndCheckboxRender
  },
  $switch: {
    autofocus: '.vxe-switch--button',
    renderEdit: defaultEditRender,
    renderDefault: defaultEditRender,
    renderItemContent: defaultItemRender
  }
};
/**
 * ???????????????
 */

var renderer = {
  mixin: function mixin(opts) {
    _xeUtils.default.each(opts, function (options, name) {
      return renderer.add(name, options);
    });

    return renderer;
  },
  get: function get(name) {
    return renderMap[name] || null;
  },
  add: function add(name, options) {
    if (name && options) {
      var renders_1 = renderMap[name];

      if (renders_1) {
        // ??????????????????
        if (process.env.NODE_ENV === 'development') {
          _xeUtils.default.each(options, function (val, key) {
            if (!_xeUtils.default.eqNull(renders_1[key]) && renders_1[key] !== val) {
              (0, _utils.warnLog)('vxe.error.coverProp', ["Renderer." + name, key]);
            }
          });
        }

        Object.assign(renders_1, options);
      } else {
        renderMap[name] = options;
      }
    }

    return renderer;
  },
  delete: function _delete(name) {
    delete renderMap[name];
    return renderer;
  }
};
exports.renderer = renderer;