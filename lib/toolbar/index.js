"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Toolbar = void 0;

var _toolbar = _interopRequireDefault(require("./src/toolbar"));

var _dynamics = require("../dynamics");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Toolbar = Object.assign(_toolbar.default, {
  install: function install(app) {
    _dynamics.dynamicApp.component(_toolbar.default.name, _toolbar.default);

    app.component(_toolbar.default.name, _toolbar.default);
  }
});
exports.Toolbar = Toolbar;
var _default = Toolbar;
exports.default = _default;