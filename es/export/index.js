import { VXETable } from '../v-x-e-table';
import ExportPanelComponent from './src/export-panel';
import ImportPanelComponent from './src/import-panel';
import exportHook from './src/hook';
import { saveLocalFile as saveFile, readLocalFile as readFile, handlePrint } from './src/util';
import { dynamicApp } from '../dynamics';
export { saveFile, readFile };
export var print = function (options) {
    var opts = Object.assign({}, options, {
        type: 'html'
    });
    handlePrint(null, opts, opts.content);
};
export var Export = {
    ExportPanel: ExportPanelComponent,
    ImportPanel: ImportPanelComponent,
    install: function (app) {
        VXETable.saveFile = saveFile;
        VXETable.readFile = readFile;
        VXETable.print = print;
        VXETable.setup({
            export: {
                types: {
                    csv: 0,
                    html: 0,
                    xml: 0,
                    txt: 0
                }
            }
        });
        VXETable.hooks.add('$tableExport', exportHook);
        dynamicApp.component(ExportPanelComponent.name, ExportPanelComponent);
        dynamicApp.component(ImportPanelComponent.name, ImportPanelComponent);
        app.component(ExportPanelComponent.name, ExportPanelComponent);
        app.component(ImportPanelComponent.name, ImportPanelComponent);
    }
};
export default Export;
