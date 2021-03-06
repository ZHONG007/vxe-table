"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assemOption = assemOption;
exports.createOption = createOption;
exports.destroyOption = destroyOption;
exports.isOption = isOption;
exports.watchOption = watchOption;

var _vue = require("vue");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _optionInfo = require("./optionInfo");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isOption(option) {
  return option instanceof _optionInfo.OptionInfo;
}

function createOption($xeselect, _vm) {
  return isOption(_vm) ? _vm : new _optionInfo.OptionInfo($xeselect, _vm);
}

function watchOption(props, option) {
  Object.keys(props).forEach(function (name) {
    (0, _vue.watch)(function () {
      return props[name];
    }, function (value) {
      option.update(name, value);
    });
  });
}

function assemOption($xeselect, el, option, optgroup) {
  var reactData = $xeselect.reactData;
  var staticOptions = reactData.staticOptions;
  var parentElem = el.parentNode;
  var parentOption = optgroup ? optgroup.option : null;
  var parentCols = parentOption ? parentOption.options : staticOptions;

  if (parentElem && parentCols) {
    parentCols.splice(_xeUtils.default.arrayIndexOf(parentElem.children, el), 0, option);
    reactData.staticOptions = staticOptions.slice(0);
  }
}

function destroyOption($xeselect, option) {
  var reactData = $xeselect.reactData;
  var staticOptions = reactData.staticOptions;

  var matchObj = _xeUtils.default.findTree(staticOptions, function (item) {
    return item.id === option.id;
  }, {
    children: 'options'
  });

  if (matchObj) {
    matchObj.items.splice(matchObj.index, 1);
  }

  reactData.staticOptions = staticOptions.slice(0);
}