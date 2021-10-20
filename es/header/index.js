import VxeTableHeader from './src/header';
import { dynamicApp } from '../dynamics';
export var Header = Object.assign(VxeTableHeader, {
    install: function (app) {
        dynamicApp.component(VxeTableHeader.name, VxeTableHeader);
        app.component(VxeTableHeader.name, VxeTableHeader);
    }
});
export default Header;
