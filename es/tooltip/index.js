import { VXETable } from '../v-x-e-table';
import VxeTooltipComponent from './src/tooltip';
import { dynamicApp } from '../dynamics';
export var Tooltip = Object.assign(VxeTooltipComponent, {
    install: function (app) {
        VXETable.tooltip = true;
        dynamicApp.component(VxeTooltipComponent.name, VxeTooltipComponent);
        app.component(VxeTooltipComponent.name, VxeTooltipComponent);
    }
});
export default Tooltip;
