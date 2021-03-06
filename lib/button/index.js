"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Button = void 0;

var _button = _interopRequireDefault(require("./src/button"));

var _dynamics = require("../dynamics");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Button = Object.assign(_button.default, {
  install: function install(app) {
    _dynamics.dynamicApp.component(_button.default.name, _button.default);

    app.component(_button.default.name, _button.default);
  }
});
exports.Button = Button;
var _default = Button;
exports.default = _default;