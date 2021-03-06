"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OptionInfo = void 0;

var _xeUtils = _interopRequireDefault(require("xe-utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var OptionInfo =
/** @class */
function () {
  function OptionInfo($xeselect, _vm) {
    Object.assign(this, {
      id: _xeUtils.default.uniqueId('option_'),
      value: _vm.value,
      label: _vm.label,
      visible: _vm.visible,
      className: _vm.className,
      disabled: _vm.disabled
    });
  }

  OptionInfo.prototype.update = function (name, value) {
    this[name] = value;
  };

  return OptionInfo;
}();

exports.OptionInfo = OptionInfo;