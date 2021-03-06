"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Tooltip = void 0;

var _vXETable = require("../v-x-e-table");

var _tooltip = _interopRequireDefault(require("./src/tooltip"));

var _dynamics = require("../dynamics");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Tooltip = Object.assign(_tooltip.default, {
  install: function install(app) {
    _vXETable.VXETable.tooltip = true;

    _dynamics.dynamicApp.component(_tooltip.default.name, _tooltip.default);

    app.component(_tooltip.default.name, _tooltip.default);
  }
});
exports.Tooltip = Tooltip;
var _default = Tooltip;
exports.default = _default;