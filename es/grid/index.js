import VxeGridComponent from './src/grid';
import { dynamicApp } from '../dynamics';
export var Grid = Object.assign(VxeGridComponent, {
    install: function (app) {
        dynamicApp.component(VxeGridComponent.name, VxeGridComponent);
        app.component(VxeGridComponent.name, VxeGridComponent);
    }
});
export default Grid;
