import VxeTableComponent from './src/table';
import { dynamicApp } from '../dynamics';
export var Table = Object.assign(VxeTableComponent, {
    install: function (app) {
        dynamicApp.component(VxeTableComponent.name, VxeTableComponent);
        app.component(VxeTableComponent.name, VxeTableComponent);
    }
});
export default Table;
