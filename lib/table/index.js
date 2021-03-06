"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Table = void 0;

var _table = _interopRequireDefault(require("./src/table"));

var _dynamics = require("../dynamics");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Table = Object.assign(_table.default, {
  install: function install(app) {
    _dynamics.dynamicApp.component(_table.default.name, _table.default);

    app.component(_table.default.name, _table.default);
  }
});
exports.Table = Table;
var _default = Table;
exports.default = _default;