import XEUtils from 'xe-utils';
import { warnLog } from '../../tools/utils';
var storeMap = {};
export var interceptor = {
    mixin: function (options) {
        XEUtils.each(options, function (callback, type) { return interceptor.add(type, callback); });
        return interceptor;
    },
    get: function (type) {
        return storeMap[type] || [];
    },
    add: function (type, callback) {
        // 检测类型
        if (process.env.NODE_ENV === 'development') {
            var eventTypes = ['created', 'mounted', 'activated', 'beforeUnmount', 'unmounted', 'event.clearActived', 'event.clearFilter', 'event.clearAreas', 'event.showMenu', 'event.keydown', 'event.export', 'event.import'];
            if (eventTypes.indexOf(type) === -1) {
                warnLog('vxe.error.errProp', ["Interceptor." + type, eventTypes.join('|')]);
            }
        }
        if (callback) {
            var eList = storeMap[type];
            if (!eList) {
                eList = storeMap[type] = [];
            }
            // 检测重复
            if (process.env.NODE_ENV === 'development') {
                if (eList.indexOf(callback) > -1) {
                    warnLog('vxe.error.coverProp', ['Interceptor', type]);
                }
            }
            eList.push(callback);
        }
        return interceptor;
    },
    delete: function (type, callback) {
        var eList = storeMap[type];
        if (eList) {
            if (callback) {
                XEUtils.remove(eList, function (fn) { return fn === callback; });
            }
            else {
                delete storeMap[type];
            }
        }
    }
};
