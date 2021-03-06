"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Filter = void 0;

var _vXETable = require("../v-x-e-table");

var _panel = _interopRequireDefault(require("./src/panel"));

var _hook = _interopRequireDefault(require("./src/hook"));

var _dynamics = require("../dynamics");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Filter = {
  Panel: _panel.default,
  install: function install(app) {
    _vXETable.VXETable.hooks.add('$tableFilter', _hook.default);

    _dynamics.dynamicApp.component(_panel.default.name, _panel.default);

    app.component(_panel.default.name, _panel.default);
  }
};
exports.Filter = Filter;
var _default = Filter;
exports.default = _default;