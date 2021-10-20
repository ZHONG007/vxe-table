import VxeToolbarComponent from './src/toolbar';
import { dynamicApp } from '../dynamics';
export var Toolbar = Object.assign(VxeToolbarComponent, {
    install: function (app) {
        dynamicApp.component(VxeToolbarComponent.name, VxeToolbarComponent);
        app.component(VxeToolbarComponent.name, VxeToolbarComponent);
    }
});
export default Toolbar;
