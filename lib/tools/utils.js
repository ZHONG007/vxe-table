"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.eqEmptyValue = eqEmptyValue;
exports.errLog = void 0;
exports.formatText = formatText;
exports.getFuncText = getFuncText;
exports.getLastZIndex = getLastZIndex;
exports.getLog = getLog;
exports.hasChildrenList = hasChildrenList;
exports.isEmptyValue = isEmptyValue;
exports.isEnableConf = isEnableConf;
exports.nextZIndex = nextZIndex;
exports.parseFile = parseFile;
exports.warnLog = void 0;

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _conf = _interopRequireDefault(require("../v-x-e-table/src/conf"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var zindexIndex = 0;
var lastZindex = 1;

function getLog(message, params) {
  return "[vxe-table] " + _conf.default.i18n(message, params);
}

function outLog(type) {
  return function (message, params) {
    var msg = getLog(message, params);
    console[type](msg);
    return msg;
  };
}

function isEnableConf(conf) {
  return conf && conf.enabled !== false;
}

function isEmptyValue(cellValue) {
  return cellValue === null || cellValue === undefined || cellValue === '';
}

function parseFile(file) {
  var name = file.name;

  var tIndex = _xeUtils.default.lastIndexOf(name, '.');

  var type = name.substring(tIndex + 1, name.length);
  var filename = name.substring(0, tIndex);
  return {
    filename: filename,
    type: type
  };
}

function nextZIndex() {
  lastZindex = _conf.default.zIndex + zindexIndex++;
  return lastZindex;
}

function getLastZIndex() {
  return lastZindex;
}

var warnLog = outLog('warn');
exports.warnLog = warnLog;
var errLog = outLog('error');
exports.errLog = errLog;

function hasChildrenList(item) {
  return item && item.children && item.children.length > 0;
}

function getFuncText(content) {
  return content ? _xeUtils.default.toValueString(_conf.default.translate ? _conf.default.translate('' + content) : content) : '';
}

function formatText(value, placeholder) {
  return '' + (isEmptyValue(value) ? placeholder ? _conf.default.emptyCell : '' : value);
}
/**
 * 判断值为：'' | null | undefined 时都属于空值
 */


function eqEmptyValue(cellValue) {
  return cellValue === '' || _xeUtils.default.eqNull(cellValue);
}