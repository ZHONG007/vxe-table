import VxeOptgroupComponent from '../select/src/optgroup';
import { dynamicApp } from '../dynamics';
export var Optgroup = Object.assign(VxeOptgroupComponent, {
    install: function (app) {
        dynamicApp.component(VxeOptgroupComponent.name, VxeOptgroupComponent);
        app.component(VxeOptgroupComponent.name, VxeOptgroupComponent);
    }
});
export default Optgroup;
