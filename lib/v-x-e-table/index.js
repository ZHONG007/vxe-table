"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  use: true,
  t: true,
  _t: true,
  config: true,
  v: true,
  VXETable: true
};
exports.VXETable = void 0;
exports._t = _t;
exports.default = exports.config = void 0;
exports.t = t;
exports.use = use;
exports.v = void 0;

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _conf = _interopRequireDefault(require("./src/conf"));

var _interceptor = require("./src/interceptor");

Object.keys(_interceptor).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _interceptor[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _interceptor[key];
    }
  });
});

var _renderer = require("./src/renderer");

Object.keys(_renderer).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _renderer[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _renderer[key];
    }
  });
});

var _commands = require("./src/commands");

Object.keys(_commands).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _commands[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _commands[key];
    }
  });
});

var _menus = require("./src/menus");

Object.keys(_menus).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _menus[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _menus[key];
    }
  });
});

var _formats = require("./src/formats");

Object.keys(_formats).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _formats[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _formats[key];
    }
  });
});

var _hooks = require("./src/hooks");

Object.keys(_hooks).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _hooks[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _hooks[key];
    }
  });
});

var _setup = require("./src/setup");

Object.keys(_setup).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _setup[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _setup[key];
    }
  });
});

var _utils = require("../tools/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getExportOrImpotType(types, flag) {
  var rest = [];

  _xeUtils.default.objectEach(types, function (val, type) {
    if (val === 0 || val === flag) {
      rest.push(type);
    }
  });

  return rest;
}

var installedPlugins = [];

function use(Plugin, options) {
  /* eslint-disable @typescript-eslint/no-use-before-define */
  if (Plugin && Plugin.install) {
    if (installedPlugins.indexOf(Plugin) === -1) {
      Plugin.install(VXETable, options);
      installedPlugins.push(Plugin);
    }
  }

  return VXETable;
}

function t(key, args) {
  return _conf.default.i18n(key, args);
}

function _t(key, args) {
  return key ? _xeUtils.default.toValueString(_conf.default.translate ? _conf.default.translate(key, args) : key) : '';
}

var VXETableConfig =
/** @class */
function () {
  function VXETableConfig() {}

  Object.defineProperty(VXETableConfig.prototype, "zIndex", {
    /**
     * ??????????????? zIndex
     */
    get: function get() {
      return (0, _utils.getLastZIndex)();
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(VXETableConfig.prototype, "nextZIndex", {
    /**
     * ??????????????? zIndex
     */
    get: function get() {
      return (0, _utils.nextZIndex)();
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(VXETableConfig.prototype, "exportTypes", {
    /**
     * ????????????????????????
     */
    get: function get() {
      return getExportOrImpotType(_conf.default.export.types, 1);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(VXETableConfig.prototype, "importTypes", {
    /**
     * ????????????????????????
     */
    get: function get() {
      return getExportOrImpotType(_conf.default.export.types, 2);
    },
    enumerable: false,
    configurable: true
  });
  return VXETableConfig;
}();

var config = new VXETableConfig();
exports.config = config;
var v = 'v4';
exports.v = v;
var VXETable = {
  v: v,
  setup: _setup.setup,
  interceptor: _interceptor.interceptor,
  renderer: _renderer.renderer,
  commands: _commands.commands,
  formats: _formats.formats,
  menus: _menus.menus,
  hooks: _hooks.hooks,
  config: config,
  use: use,
  t: t,
  _t: _t
};
exports.VXETable = VXETable;
var _default = VXETable;
exports.default = _default;