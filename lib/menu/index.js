"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Menu = void 0;

var _vXETable = require("../v-x-e-table");

var _panel = _interopRequireDefault(require("./src/panel"));

var _hooks = _interopRequireDefault(require("./src/hooks"));

var _dynamics = require("../dynamics");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Menu = {
  Panel: _panel.default,
  install: function install(app) {
    _vXETable.VXETable.hooks.add('$tableMenu', _hooks.default);

    _dynamics.dynamicApp.component(_panel.default.name, _panel.default);

    app.component(_panel.default.name, _panel.default);
  }
};
exports.Menu = Menu;
var _default = Menu;
exports.default = _default;