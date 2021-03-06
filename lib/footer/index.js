"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Footer = void 0;

var _footer = _interopRequireDefault(require("./src/footer"));

var _dynamics = require("../dynamics");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Footer = Object.assign(_footer.default, {
  install: function install(app) {
    _dynamics.dynamicApp.component(_footer.default.name, _footer.default);

    app.component(_footer.default.name, _footer.default);
  }
});
exports.Footer = Footer;
var _default = Footer;
exports.default = _default;