import XEUtils from 'xe-utils';
import GlobalConfig from '../v-x-e-table/src/conf';
var zindexIndex = 0;
var lastZindex = 1;
export function getLog(message, params) {
    return "[vxe-table] " + GlobalConfig.i18n(message, params);
}
function outLog(type) {
    return function (message, params) {
        var msg = getLog(message, params);
        console[type](msg);
        return msg;
    };
}
export function isEnableConf(conf) {
    return conf && conf.enabled !== false;
}
export function isEmptyValue(cellValue) {
    return cellValue === null || cellValue === undefined || cellValue === '';
}
export function parseFile(file) {
    var name = file.name;
    var tIndex = XEUtils.lastIndexOf(name, '.');
    var type = name.substring(tIndex + 1, name.length);
    var filename = name.substring(0, tIndex);
    return { filename: filename, type: type };
}
export function nextZIndex() {
    lastZindex = GlobalConfig.zIndex + zindexIndex++;
    return lastZindex;
}
export function getLastZIndex() {
    return lastZindex;
}
export var warnLog = outLog('warn');
export var errLog = outLog('error');
export function hasChildrenList(item) {
    return item && item.children && item.children.length > 0;
}
export function getFuncText(content) {
    return content ? XEUtils.toValueString(GlobalConfig.translate ? GlobalConfig.translate('' + content) : content) : '';
}
export function formatText(value, placeholder) {
    return '' + (isEmptyValue(value) ? (placeholder ? GlobalConfig.emptyCell : '') : value);
}
/**
 * 判断值为：'' | null | undefined 时都属于空值
 */
export function eqEmptyValue(cellValue) {
    return cellValue === '' || XEUtils.eqNull(cellValue);
}
