"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.List = void 0;

var _list = _interopRequireDefault(require("./src/list"));

var _dynamics = require("../dynamics");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var List = Object.assign(_list.default, {
  install: function install(app) {
    _dynamics.dynamicApp.component(_list.default.name, _list.default);

    app.component(_list.default.name, _list.default);
  }
});
exports.List = List;
var _default = List;
exports.default = _default;