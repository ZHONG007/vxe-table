import VxePagerComponent from './src/pager';
import { dynamicApp } from '../dynamics';
export var Pager = Object.assign(VxePagerComponent, {
    install: function (app) {
        dynamicApp.component(VxePagerComponent.name, VxePagerComponent);
        app.component(VxePagerComponent.name, VxePagerComponent);
    }
});
export default Pager;
