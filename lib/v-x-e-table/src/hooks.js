"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hooks = void 0;

var _store = _interopRequireDefault(require("./store"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hooks = new _store.default();
exports.hooks = hooks;