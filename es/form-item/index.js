import VxeFormItemComponent from '../form/src/form-item';
import { dynamicApp } from '../dynamics';
export var FormItem = Object.assign(VxeFormItemComponent, {
    install: function (app) {
        dynamicApp.component(VxeFormItemComponent.name, VxeFormItemComponent);
        app.component(VxeFormItemComponent.name, VxeFormItemComponent);
    }
});
export default FormItem;
