import VxeListComponent from './src/list';
import { dynamicApp } from '../dynamics';
export var List = Object.assign(VxeListComponent, {
    install: function (app) {
        dynamicApp.component(VxeListComponent.name, VxeListComponent);
        app.component(VxeListComponent.name, VxeListComponent);
    }
});
export default List;
