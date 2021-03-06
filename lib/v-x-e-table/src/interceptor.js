"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.interceptor = void 0;

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _utils = require("../../tools/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var storeMap = {};
var interceptor = {
  mixin: function mixin(options) {
    _xeUtils.default.each(options, function (callback, type) {
      return interceptor.add(type, callback);
    });

    return interceptor;
  },
  get: function get(type) {
    return storeMap[type] || [];
  },
  add: function add(type, callback) {
    // 检测类型
    if (process.env.NODE_ENV === 'development') {
      var eventTypes = ['created', 'mounted', 'activated', 'beforeUnmount', 'unmounted', 'event.clearActived', 'event.clearFilter', 'event.clearAreas', 'event.showMenu', 'event.keydown', 'event.export', 'event.import'];

      if (eventTypes.indexOf(type) === -1) {
        (0, _utils.warnLog)('vxe.error.errProp', ["Interceptor." + type, eventTypes.join('|')]);
      }
    }

    if (callback) {
      var eList = storeMap[type];

      if (!eList) {
        eList = storeMap[type] = [];
      } // 检测重复


      if (process.env.NODE_ENV === 'development') {
        if (eList.indexOf(callback) > -1) {
          (0, _utils.warnLog)('vxe.error.coverProp', ['Interceptor', type]);
        }
      }

      eList.push(callback);
    }

    return interceptor;
  },
  delete: function _delete(type, callback) {
    var eList = storeMap[type];

    if (eList) {
      if (callback) {
        _xeUtils.default.remove(eList, function (fn) {
          return fn === callback;
        });
      } else {
        delete storeMap[type];
      }
    }
  }
};
exports.interceptor = interceptor;