import { VXETable } from '../v-x-e-table';
import PanelComponent from './src/panel';
import menuHook from './src/hooks';
import { dynamicApp } from '../dynamics';
export var Menu = {
    Panel: PanelComponent,
    install: function (app) {
        VXETable.hooks.add('$tableMenu', menuHook);
        dynamicApp.component(PanelComponent.name, PanelComponent);
        app.component(PanelComponent.name, PanelComponent);
    }
};
export default Menu;
