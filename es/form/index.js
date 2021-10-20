import VxeFormComponent from './src/form';
import { dynamicApp } from '../dynamics';
export var Form = Object.assign(VxeFormComponent, {
    install: function (app) {
        dynamicApp.component(VxeFormComponent.name, VxeFormComponent);
        app.component(VxeFormComponent.name, VxeFormComponent);
    }
});
export default Form;
