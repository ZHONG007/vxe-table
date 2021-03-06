import { warnLog } from '../../tools/utils';
import XEUtils from 'xe-utils';
/**
 * 创建数据仓库
 */
var Store = /** @class */ (function () {
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
            if (!XEUtils.eqNull(this.store[name]) && this.store[name] !== render) {
                warnLog('vxe.error.coverProp', [this._name, name]);
            }
        }
        this.store[name] = render;
        return this;
    };
    Store.prototype.delete = function (name) {
        delete this.store[name];
    };
    Store.prototype.forEach = function (callback) {
        XEUtils.objectEach(this.store, callback);
    };
    return Store;
}());
export { Store };
export default Store;
