import VxeOptionComponent from '../select/src/option';
import { dynamicApp } from '../dynamics';
export var Option = Object.assign(VxeOptionComponent, {
    install: function (app) {
        dynamicApp.component(VxeOptionComponent.name, VxeOptionComponent);
        app.component(VxeOptionComponent.name, VxeOptionComponent);
    }
});
export default Option;
