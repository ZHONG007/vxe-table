"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setup = void 0;

var _conf = _interopRequireDefault(require("./conf"));

var _xeUtils = _interopRequireDefault(require("xe-utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 全局参数设置
 */
var setup = function setup(options) {
  return _xeUtils.default.merge(_conf.default, options);
};

exports.setup = setup;