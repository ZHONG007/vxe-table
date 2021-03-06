"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkDynamic = checkDynamic;
exports.dynamicStore = exports.dynamicApp = void 0;

var _vue = require("vue");

var dynamicContainerElem;
var dynamicStore = (0, _vue.reactive)({
  modals: []
});
/**
 * 动态组件
 */

exports.dynamicStore = dynamicStore;
var VxeDynamics = (0, _vue.defineComponent)({
  setup: function setup() {
    return function () {
      var modals = dynamicStore.modals;
      return (0, _vue.h)('div', {
        class: 'vxe-dynamics--modal'
      }, modals.map(function (item) {
        return (0, _vue.h)((0, _vue.resolveComponent)('vxe-modal'), item);
      }));
    };
  }
});
var dynamicApp = (0, _vue.createApp)(VxeDynamics);
exports.dynamicApp = dynamicApp;

function checkDynamic() {
  if (!dynamicContainerElem) {
    dynamicContainerElem = document.createElement('div');
    dynamicContainerElem.className = 'vxe-dynamics';
    document.body.appendChild(dynamicContainerElem);
    dynamicApp.mount(dynamicContainerElem);
  }
}