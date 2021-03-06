"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.modal = exports.default = exports.Modal = void 0;

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _modal = _interopRequireWildcard(require("./src/modal"));

var _vXETable = require("../v-x-e-table");

var _dynamics = require("../dynamics");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __assign = void 0 && (void 0).__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

function openModal(options) {
  // ????????????????????????????????????
  (0, _dynamics.checkDynamic)();
  return new Promise(function (resolve) {
    if (options && options.id && _modal.allActivedModals.some(function (comp) {
      return comp.props.id === options.id;
    })) {
      resolve('exist');
    } else {
      var _onHide_1 = options.onHide;
      var modalOpts_1 = Object.assign(options, {
        key: _xeUtils.default.uniqueId(),
        modelValue: true,
        onHide: function onHide(params) {
          var modalList = _dynamics.dynamicStore.modals;

          if (_onHide_1) {
            _onHide_1(params);
          }

          _dynamics.dynamicStore.modals = modalList.filter(function (item) {
            return item.key !== modalOpts_1.key;
          });
          resolve(params.type);
        }
      });

      _dynamics.dynamicStore.modals.push(modalOpts_1);
    }
  });
}

function getModal(id) {
  return _xeUtils.default.find(_modal.allActivedModals, function ($modal) {
    return $modal.props.id === id;
  });
}
/**
 * ???????????????????????????????????????????????????????????????????????????????????????
 * ????????? id ????????????????????????
 * ?????????????????????????????????
 */


function closeModal(id) {
  var modals = id ? [getModal(id)] : _modal.allActivedModals;
  var restPromises = [];
  modals.forEach(function ($modal) {
    if ($modal) {
      restPromises.push($modal.close());
    }
  });
  return Promise.all(restPromises);
}

function handleOpen(defOpts, content, title, options) {
  var opts;

  if (_xeUtils.default.isObject(content)) {
    opts = content;
  } else {
    opts = {
      content: _xeUtils.default.toValueString(content),
      title: title
    };
  }

  return openModal(__assign(__assign(__assign({}, defOpts), options), opts));
}

function openAlert(content, title, options) {
  return handleOpen({
    type: 'alert',
    showFooter: true
  }, content, title, options);
}

function openConfirm(content, title, options) {
  return handleOpen({
    type: 'confirm',
    status: 'question',
    showFooter: true
  }, content, title, options);
}

function openMessage(content, options) {
  return handleOpen({
    type: 'message',
    mask: false,
    lockView: false,
    showHeader: false
  }, content, '', options);
}

var ModalController = {
  get: getModal,
  close: closeModal,
  open: openModal,
  alert: openAlert,
  confirm: openConfirm,
  message: openMessage
};
var modal = ModalController;
exports.modal = modal;
var Modal = Object.assign(_modal.default, {
  install: function install(app) {
    _dynamics.dynamicApp.component(_modal.default.name, _modal.default);

    app.component(_modal.default.name, _modal.default);
    _vXETable.VXETable.modal = ModalController;
  }
});
exports.Modal = Modal;
var _default = Modal;
exports.default = _default;