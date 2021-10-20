import VxeSelectComponent from './src/select';
import { dynamicApp } from '../dynamics';
export var Select = Object.assign(VxeSelectComponent, {
    install: function (app) {
        dynamicApp.component(VxeSelectComponent.name, VxeSelectComponent);
        app.component(VxeSelectComponent.name, VxeSelectComponent);
    }
});
export default Select;
