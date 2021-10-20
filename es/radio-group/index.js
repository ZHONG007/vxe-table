import VxeRadioGroupComponent from '../radio/src/group';
import { dynamicApp } from '../dynamics';
export var RadioGroup = Object.assign(VxeRadioGroupComponent, {
    install: function (app) {
        dynamicApp.component(VxeRadioGroupComponent.name, VxeRadioGroupComponent);
        app.component(VxeRadioGroupComponent.name, VxeRadioGroupComponent);
    }
});
export default RadioGroup;
