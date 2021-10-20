import VxeSwitchComponent from './src/switch';
import { dynamicApp } from '../dynamics';
export var Switch = Object.assign(VxeSwitchComponent, {
    install: function (app) {
        dynamicApp.component(VxeSwitchComponent.name, VxeSwitchComponent);
        app.component(VxeSwitchComponent.name, VxeSwitchComponent);
    }
});
export default Switch;
