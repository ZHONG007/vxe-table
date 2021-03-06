"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Column = void 0;

var _column = _interopRequireDefault(require("../table/src/column"));

var _dynamics = require("../dynamics");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Column = Object.assign(_column.default, {
  install: function install(app) {
    _dynamics.dynamicApp.component(_column.default.name, _column.default);

    app.component(_column.default.name, _column.default); // 兼容旧用法

    _dynamics.dynamicApp.component('VxeTableColumn', _column.default);

    app.component('VxeTableColumn', _column.default);
  }
});
exports.Column = Column;
var _default = Column;
exports.default = _default;