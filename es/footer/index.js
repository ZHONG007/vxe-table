import VxeTableFooterComponent from './src/footer';
import { dynamicApp } from '../dynamics';
export var Footer = Object.assign(VxeTableFooterComponent, {
    install: function (app) {
        dynamicApp.component(VxeTableFooterComponent.name, VxeTableFooterComponent);
        app.component(VxeTableFooterComponent.name, VxeTableFooterComponent);
    }
});
export default Footer;
