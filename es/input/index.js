import VxeInputConstructor from './src/input';
import { dynamicApp } from '../dynamics';
export var Input = Object.assign(VxeInputConstructor, {
    install: function (app) {
        dynamicApp.component(VxeInputConstructor.name, VxeInputConstructor);
        app.component(VxeInputConstructor.name, VxeInputConstructor);
    }
});
export default Input;
