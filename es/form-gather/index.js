import VxeFormGatherComponent from '../form/src/form-gather';
import { dynamicApp } from '../dynamics';
export var FormGather = Object.assign(VxeFormGatherComponent, {
    install: function (app) {
        dynamicApp.component(VxeFormGatherComponent.name, VxeFormGatherComponent);
        app.component(VxeFormGatherComponent.name, VxeFormGatherComponent);
    }
});
export default FormGather;
