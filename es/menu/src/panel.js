import { defineComponent, h, Teleport, inject, ref, createCommentVNode } from 'vue';
import { getFuncText } from '../../tools/utils';
import XEUtils from 'xe-utils';
export default defineComponent({
    name: 'VxeTableContextMenu',
    setup: function (props, context) {
        var xID = XEUtils.uniqueId();
        var $xetable = inject('$xetable', {});
        var tableReactData = $xetable.reactData;
        var refElem = ref();
        var refMaps = {
            refElem: refElem
        };
        var $xemenupanel = {
            xID: xID,
            props: props,
            context: context,
            getRefMaps: function () { return refMaps; }
        };
        var renderVN = function () {
            var ctxMenuStore = tableReactData.ctxMenuStore;
            var computeMenuOpts = $xetable.getComputeMaps().computeMenuOpts;
            var menuOpts = computeMenuOpts.value;
            return h(Teleport, {
                to: 'body',
                disabled: false
            }, [
                h('div', {
                    ref: refElem,
                    class: ['vxe-table--context-menu-wrapper', menuOpts.className, {
                            'is--visible': ctxMenuStore.visible
                        }],
                    style: ctxMenuStore.style
                }, ctxMenuStore.list.map(function (options, gIndex) {
                    return options.every(function (item) { return item.visible === false; }) ? createCommentVNode() : h('ul', {
                        class: 'vxe-context-menu--option-wrapper',
                        key: gIndex
                    }, options.map(function (item, index) {
                        var hasChildMenus = item.children && item.children.some(function (child) { return child.visible !== false; });
                        return item.visible === false ? null : h('li', {
                            class: [item.className, {
                                    'link--disabled': item.disabled,
                                    'link--active': item === ctxMenuStore.selected
                                }],
                            key: gIndex + "_" + index
                        }, [
                            h('a', {
                                class: 'vxe-context-menu--link',
                                onClick: function (evnt) {
                                    $xetable.ctxMenuLinkEvent(evnt, item);
                                },
                                onMouseover: function (evnt) {
                                    $xetable.ctxMenuMouseoverEvent(evnt, item);
                                },
                                onMouseout: function (evnt) {
                                    $xetable.ctxMenuMouseoutEvent(evnt, item);
                                }
                            }, [
                                h('i', {
                                    class: ['vxe-context-menu--link-prefix', item.prefixIcon]
                                }),
                                h('span', {
                                    class: 'vxe-context-menu--link-content'
                                }, getFuncText(item.name)),
                                h('i', {
                                    class: ['vxe-context-menu--link-suffix', hasChildMenus ? item.suffixIcon || 'suffix--haschild' : item.suffixIcon]
                                })
                            ]),
                            hasChildMenus ? h('ul', {
                                class: ['vxe-table--context-menu-clild-wrapper', {
                                        'is--show': item === ctxMenuStore.selected && ctxMenuStore.showChild
                                    }]
                            }, item.children.map(function (child, cIndex) {
                                return child.visible === false ? null : h('li', {
                                    class: [child.className, {
                                            'link--disabled': child.disabled,
                                            'link--active': child === ctxMenuStore.selectChild
                                        }],
                                    key: gIndex + "_" + index + "_" + cIndex
                                }, [
                                    h('a', {
                                        class: 'vxe-context-menu--link',
                                        onClick: function (evnt) {
                                            $xetable.ctxMenuLinkEvent(evnt, child);
                                        },
                                        onMouseover: function (evnt) {
                                            $xetable.ctxMenuMouseoverEvent(evnt, item, child);
                                        },
                                        onMouseout: function (evnt) {
                                            $xetable.ctxMenuMouseoutEvent(evnt, item);
                                        }
                                    }, [
                                        h('i', {
                                            class: ['vxe-context-menu--link-prefix', child.prefixIcon]
                                        }),
                                        h('span', {
                                            class: 'vxe-context-menu--link-content'
                                        }, getFuncText(child.name))
                                    ])
                                ]);
                            })) : null
                        ]);
                    }));
                }))
            ]);
        };
        $xemenupanel.renderVN = renderVN;
        return $xemenupanel;
    },
    render: function () {
        return this.renderVN();
    }
});
