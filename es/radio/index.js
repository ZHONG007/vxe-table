import VxeRadioComponent from './src/radio';
import { dynamicApp } from '../dynamics';
export var Radio = Object.assign(VxeRadioComponent, {
    install: function (app) {
        dynamicApp.component(VxeRadioComponent.name, VxeRadioComponent);
        app.component(VxeRadioComponent.name, VxeRadioComponent);
    }
});
export default Radio;
