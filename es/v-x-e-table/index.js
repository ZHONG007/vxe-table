import XEUtils from 'xe-utils';
import GlobalConfig from './src/conf';
import { interceptor } from './src/interceptor';
import { renderer } from './src/renderer';
import { commands } from './src/commands';
import { menus } from './src/menus';
import { formats } from './src/formats';
import { hooks } from './src/hooks';
import { setup } from './src/setup';
import { getLastZIndex, nextZIndex } from '../tools/utils';
function getExportOrImpotType(types, flag) {
    var rest = [];
    XEUtils.objectEach(types, function (val, type) {
        if (val === 0 || val === flag) {
            rest.push(type);
        }
    });
    return rest;
}
var installedPlugins = [];
export function use(Plugin, options) {
    /* eslint-disable @typescript-eslint/no-use-before-define */
    if (Plugin && Plugin.install) {
        if (installedPlugins.indexOf(Plugin) === -1) {
            Plugin.install(VXETable, options);
            installedPlugins.push(Plugin);
        }
    }
    return VXETable;
}
export function t(key, args) {
    return GlobalConfig.i18n(key, args);
}
export function _t(key, args) {
    return key ? XEUtils.toValueString(GlobalConfig.translate ? GlobalConfig.translate(key, args) : key) : '';
}
var VXETableConfig = /** @class */ (function () {
    function VXETableConfig() {
    }
    Object.defineProperty(VXETableConfig.prototype, "zIndex", {
        /**
         * 获取当前的 zIndex
         */
        get: function () {
            return getLastZIndex();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VXETableConfig.prototype, "nextZIndex", {
        /**
         * 获取下一个 zIndex
         */
        get: function () {
            return nextZIndex();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VXETableConfig.prototype, "exportTypes", {
        /**
         * 获取所有导出类型
         */
        get: function () {
            return getExportOrImpotType(GlobalConfig.export.types, 1);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VXETableConfig.prototype, "importTypes", {
        /**
         * 获取所有导入类型
         */
        get: function () {
            return getExportOrImpotType(GlobalConfig.export.types, 2);
        },
        enumerable: false,
        configurable: true
    });
    return VXETableConfig;
}());
export var config = new VXETableConfig();
export var v = 'v4';
export var VXETable = {
    v: v,
    setup: setup,
    interceptor: interceptor,
    renderer: renderer,
    commands: commands,
    formats: formats,
    menus: menus,
    hooks: hooks,
    config: config,
    use: use,
    t: t,
    _t: _t
};
export * from './src/interceptor';
export * from './src/renderer';
export * from './src/commands';
export * from './src/menus';
export * from './src/formats';
export * from './src/hooks';
export * from './src/setup';
export default VXETable;
