import { defineComponent, h, ref, computed, inject, reactive, nextTick } from 'vue';
import XEUtils from 'xe-utils';
import GlobalConfig from '../../v-x-e-table/src/conf';
import VxeModalConstructor from '../../modal/src/modal';
import VxeRadioGroupConstructor from '../../radio/src/group';
import VxeRadioConstructor from '../../radio/src/radio';
import VxeButtonConstructor from '../../button/src/button';
import { parseFile } from '../../tools/utils';
export default defineComponent({
    name: 'VxeImportPanel',
    props: {
        defaultOptions: Object,
        storeData: Object
    },
    setup: function (props) {
        var $xetable = inject('$xetable', {});
        var computeImportOpts = $xetable.getComputeMaps().computeImportOpts;
        var reactData = reactive({
            loading: false
        });
        var refFileBtn = ref();
        var computeSelectName = computed(function () {
            var storeData = props.storeData;
            return storeData.filename + "." + storeData.type;
        });
        var computeHasFile = computed(function () {
            var storeData = props.storeData;
            return storeData.file && storeData.type;
        });
        var computeParseTypeLabel = computed(function () {
            var storeData = props.storeData;
            var type = storeData.type, typeList = storeData.typeList;
            if (type) {
                var selectItem = XEUtils.find(typeList, function (item) { return type === item.value; });
                return selectItem ? GlobalConfig.i18n(selectItem.label) : '*.*';
            }
            return "*." + typeList.map(function (item) { return item.value; }).join(', *.');
        });
        var clearFileEvent = function () {
            var storeData = props.storeData;
            Object.assign(storeData, {
                filename: '',
                sheetName: '',
                type: ''
            });
        };
        var selectFileEvent = function () {
            var storeData = props.storeData, defaultOptions = props.defaultOptions;
            $xetable.readFile(defaultOptions).then(function (params) {
                var file = params.file;
                Object.assign(storeData, parseFile(file), { file: file });
            }).catch(function (e) { return e; });
        };
        var showEvent = function () {
            nextTick(function () {
                var targetElem = refFileBtn.value;
                if (targetElem) {
                    targetElem.focus();
                }
            });
        };
        var cancelEvent = function () {
            var storeData = props.storeData;
            storeData.visible = false;
        };
        var importEvent = function () {
            var storeData = props.storeData, defaultOptions = props.defaultOptions;
            var importOpts = computeImportOpts.value;
            reactData.loading = true;
            $xetable.importByFile(storeData.file, Object.assign({}, importOpts, defaultOptions)).then(function () {
                reactData.loading = false;
                storeData.visible = false;
            }).catch(function () {
                reactData.loading = false;
            });
        };
        var renderVN = function () {
            var defaultOptions = props.defaultOptions, storeData = props.storeData;
            var selectName = computeSelectName.value;
            var hasFile = computeHasFile.value;
            var parseTypeLabel = computeParseTypeLabel.value;
            return h(VxeModalConstructor, {
                modelValue: storeData.visible,
                title: GlobalConfig.i18n('vxe.import.impTitle'),
                width: 440,
                mask: true,
                lockView: true,
                showFooter: false,
                escClosable: true,
                maskClosable: true,
                loading: reactData.loading,
                'onUpdate:modelValue': function (value) {
                    storeData.visible = value;
                },
                onShow: showEvent
            }, {
                default: function () {
                    return h('div', {
                        class: 'vxe-export--panel'
                    }, [
                        h('table', {
                            cellspacing: 0,
                            cellpadding: 0,
                            border: 0
                        }, [
                            h('tbody', [
                                h('tr', [
                                    h('td', GlobalConfig.i18n('vxe.import.impFile')),
                                    h('td', [
                                        hasFile ? h('div', {
                                            class: 'vxe-import-selected--file',
                                            title: selectName
                                        }, [
                                            h('span', selectName),
                                            h('i', {
                                                class: GlobalConfig.icon.INPUT_CLEAR,
                                                onClick: clearFileEvent
                                            })
                                        ]) : h('button', {
                                            ref: refFileBtn,
                                            class: 'vxe-import-select--file',
                                            onClick: selectFileEvent
                                        }, GlobalConfig.i18n('vxe.import.impSelect'))
                                    ])
                                ]),
                                h('tr', [
                                    h('td', GlobalConfig.i18n('vxe.import.impType')),
                                    h('td', parseTypeLabel)
                                ]),
                                h('tr', [
                                    h('td', GlobalConfig.i18n('vxe.import.impOpts')),
                                    h('td', [
                                        h(VxeRadioGroupConstructor, {
                                            modelValue: defaultOptions.mode,
                                            'onUpdate:modelValue': function (value) {
                                                defaultOptions.mode = value;
                                            }
                                        }, {
                                            default: function () { return storeData.modeList.map(function (item) { return h(VxeRadioConstructor, { label: item.value, content: GlobalConfig.i18n(item.label) }); }); }
                                        })
                                    ])
                                ])
                            ])
                        ]),
                        h('div', {
                            class: 'vxe-export--panel-btns'
                        }, [
                            h(VxeButtonConstructor, {
                                content: GlobalConfig.i18n('vxe.import.impCancel'),
                                onClick: cancelEvent
                            }),
                            h(VxeButtonConstructor, {
                                status: 'primary',
                                disabled: !hasFile,
                                content: GlobalConfig.i18n('vxe.import.impConfirm'),
                                onClick: importEvent
                            })
                        ])
                    ]);
                }
            });
        };
        return renderVN;
    }
});
