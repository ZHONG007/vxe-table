"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.RadioButton = void 0;

var _button = _interopRequireDefault(require("../radio/src/button"));

var _dynamics = require("../dynamics");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RadioButton = Object.assign(_button.default, {
  install: function install(app) {
    _dynamics.dynamicApp.component(_button.default.name, _button.default);

    app.component(_button.default.name, _button.default);
  }
});
exports.RadioButton = RadioButton;
var _default = RadioButton;
exports.default = _default;