import VxePulldownComponent from './src/pulldown';
import { dynamicApp } from '../dynamics';
export var Pulldown = Object.assign(VxePulldownComponent, {
    install: function (app) {
        dynamicApp.component(VxePulldownComponent.name, VxePulldownComponent);
        app.component(VxePulldownComponent.name, VxePulldownComponent);
    }
});
export default Pulldown;
