import { VXETable } from '../v-x-e-table';
import PanelComponent from './src/panel';
import filterHook from './src/hook';
import { dynamicApp } from '../dynamics';
export var Filter = {
    Panel: PanelComponent,
    install: function (app) {
        VXETable.hooks.add('$tableFilter', filterHook);
        dynamicApp.component(PanelComponent.name, PanelComponent);
        app.component(PanelComponent.name, PanelComponent);
    }
};
export default Filter;
