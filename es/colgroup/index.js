import VxeTableColgroupComponent from '../table/src/group';
import { dynamicApp } from '../dynamics';
export var Colgroup = Object.assign(VxeTableColgroupComponent, {
    install: function (app) {
        dynamicApp.component(VxeTableColgroupComponent.name, VxeTableColgroupComponent);
        app.component(VxeTableColgroupComponent.name, VxeTableColgroupComponent);
        // 兼容旧用法
        dynamicApp.component('VxeTableColgroup', VxeTableColgroupComponent);
        app.component('VxeTableColgroup', VxeTableColgroupComponent);
    }
});
export default Colgroup;
