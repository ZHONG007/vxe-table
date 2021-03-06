import VxeTableColumnComponent from '../table/src/column';
import { dynamicApp } from '../dynamics';
export var Column = Object.assign(VxeTableColumnComponent, {
    install: function (app) {
        dynamicApp.component(VxeTableColumnComponent.name, VxeTableColumnComponent);
        app.component(VxeTableColumnComponent.name, VxeTableColumnComponent);
        // 兼容旧用法
        dynamicApp.component('VxeTableColumn', VxeTableColumnComponent);
        app.component('VxeTableColumn', VxeTableColumnComponent);
    }
});
export default Column;
