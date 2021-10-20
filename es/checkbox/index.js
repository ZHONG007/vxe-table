import VxeCheckboxComponent from './src/checkbox';
import { dynamicApp } from '../dynamics';
export var Checkbox = Object.assign(VxeCheckboxComponent, {
    install: function (app) {
        dynamicApp.component(VxeCheckboxComponent.name, VxeCheckboxComponent);
        app.component(VxeCheckboxComponent.name, VxeCheckboxComponent);
    }
});
export default Checkbox;
