"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.print = exports.default = exports.Export = void 0;
Object.defineProperty(exports, "readFile", {
  enumerable: true,
  get: function get() {
    return _util.readLocalFile;
  }
});
Object.defineProperty(exports, "saveFile", {
  enumerable: true,
  get: function get() {
    return _util.saveLocalFile;
  }
});

var _vXETable = require("../v-x-e-table");

var _exportPanel = _interopRequireDefault(require("./src/export-panel"));

var _importPanel = _interopRequireDefault(require("./src/import-panel"));

var _hook = _interopRequireDefault(require("./src/hook"));

var _util = require("./src/util");

var _dynamics = require("../dynamics");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var print = function print(options) {
  var opts = Object.assign({}, options, {
    type: 'html'
  });
  (0, _util.handlePrint)(null, opts, opts.content);
};

exports.print = print;
var Export = {
  ExportPanel: _exportPanel.default,
  ImportPanel: _importPanel.default,
  install: function install(app) {
    _vXETable.VXETable.saveFile = _util.saveLocalFile;
    _vXETable.VXETable.readFile = _util.readLocalFile;
    _vXETable.VXETable.print = print;

    _vXETable.VXETable.setup({
      export: {
        types: {
          csv: 0,
          html: 0,
          xml: 0,
          txt: 0
        }
      }
    });

    _vXETable.VXETable.hooks.add('$tableExport', _hook.default);

    _dynamics.dynamicApp.component(_exportPanel.default.name, _exportPanel.default);

    _dynamics.dynamicApp.component(_importPanel.default.name, _importPanel.default);

    app.component(_exportPanel.default.name, _exportPanel.default);
    app.component(_importPanel.default.name, _importPanel.default);
  }
};
exports.Export = Export;
var _default = Export;
exports.default = _default;