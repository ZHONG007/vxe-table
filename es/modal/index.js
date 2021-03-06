var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import XEUtils from 'xe-utils';
import VxeModalComponent, { allActivedModals } from './src/modal';
import { VXETable } from '../v-x-e-table';
import { dynamicApp, dynamicStore, checkDynamic } from '../dynamics';
function openModal(options) {
    // 使用动态组件渲染动态弹框
    checkDynamic();
    return new Promise(function (resolve) {
        if (options && options.id && allActivedModals.some(function (comp) { return comp.props.id === options.id; })) {
            resolve('exist');
        }
        else {
            var _onHide_1 = options.onHide;
            var modalOpts_1 = Object.assign(options, {
                key: XEUtils.uniqueId(),
                modelValue: true,
                onHide: function (params) {
                    var modalList = dynamicStore.modals;
                    if (_onHide_1) {
                        _onHide_1(params);
                    }
                    dynamicStore.modals = modalList.filter(function (item) { return item.key !== modalOpts_1.key; });
                    resolve(params.type);
                }
            });
            dynamicStore.modals.push(modalOpts_1);
        }
    });
}
function getModal(id) {
    return XEUtils.find(allActivedModals, function ($modal) { return $modal.props.id === id; });
}
/**
 * 全局关闭动态的活动窗口（只能用于关闭动态的创建的活动窗口）
 * 如果传 id 则关闭指定的窗口
 * 如果不传则关闭所有窗口
 */
function closeModal(id) {
    var modals = id ? [getModal(id)] : allActivedModals;
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
    if (XEUtils.isObject(content)) {
        opts = content;
    }
    else {
        opts = { content: XEUtils.toValueString(content), title: title };
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
export var modal = ModalController;
export var Modal = Object.assign(VxeModalComponent, {
    install: function (app) {
        dynamicApp.component(VxeModalComponent.name, VxeModalComponent);
        app.component(VxeModalComponent.name, VxeModalComponent);
        VXETable.modal = ModalController;
    }
});
export default Modal;
