"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Select = void 0;

var _select = _interopRequireDefault(require("./src/select"));

var _dynamics = require("../dynamics");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Select = Object.assign(_select.default, {
  install: function install(app) {
    _dynamics.dynamicApp.component(_select.default.name, _select.default);

    app.component(_select.default.name, _select.default);
  }
});
exports.Select = Select;
var _default = Select;
exports.default = _default;