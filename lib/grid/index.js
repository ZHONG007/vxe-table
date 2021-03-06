"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Grid = void 0;

var _grid = _interopRequireDefault(require("./src/grid"));

var _dynamics = require("../dynamics");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Grid = Object.assign(_grid.default, {
  install: function install(app) {
    _dynamics.dynamicApp.component(_grid.default.name, _grid.default);

    app.component(_grid.default.name, _grid.default);
  }
});
exports.Grid = Grid;
var _default = Grid;
exports.default = _default;