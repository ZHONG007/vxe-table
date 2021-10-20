import VxeRadioButtonComponent from '../radio/src/button';
import { dynamicApp } from '../dynamics';
export var RadioButton = Object.assign(VxeRadioButtonComponent, {
    install: function (app) {
        dynamicApp.component(VxeRadioButtonComponent.name, VxeRadioButtonComponent);
        app.component(VxeRadioButtonComponent.name, VxeRadioButtonComponent);
    }
});
export default RadioButton;
