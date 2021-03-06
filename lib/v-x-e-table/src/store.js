"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Store = void 0;

var _utils = require("../../tools/utils");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 创建数据仓库
 */
var Store =
/** @class */
function () {
  function Store() {
    this.store = {};
  }

  Store.prototype.mixin = function (options) {
    Object.assign(this.store, options);
    return this;
  };

  Store.prototype.has = function (name) {
    return !!this.get(name);
  };

  Store.prototype.get = function (name) {
    return this.store[name];
  };

  Store.prototype.add = function (name, render) {
    // 检测是否覆盖
    if (process.env.NODE_ENV === 'development') {
      if (!_xeUtils.default.eqNull(this.store[name]) && this.store[name] !== render) {
        (0, _utils.warnLog)('vxe.error.coverProp', [this._name, name]);
      }
    }

    this.store[name] = render;
    return this;
  };

  Store.prototype.delete = function (name) {
    delete this.store[name];
  };

  Store.prototype.forEach = function (callback) {
    _xeUtils.default.objectEach(this.store, callback);
  };

  return Store;
}();

exports.Store = Store;
var _default = Store;
exports.default = _default;