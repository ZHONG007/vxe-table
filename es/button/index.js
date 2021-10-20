import VxeButtonComponent from './src/button';
import { dynamicApp } from '../dynamics';
export var Button = Object.assign(VxeButtonComponent, {
    install: function (app) {
        dynamicApp.component(VxeButtonComponent.name, VxeButtonComponent);
        app.component(VxeButtonComponent.name, VxeButtonComponent);
    }
});
export default Button;
