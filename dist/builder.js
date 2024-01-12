"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = exports.unload = exports.load = void 0;
const load = function () {
    console.debug(`${PACKAGE_NAME} load`);
};
exports.load = load;
const unload = function () {
    console.debug(`${PACKAGE_NAME} unload`);
};
exports.unload = unload;
const PACKAGE_NAME = 'build-compress';
exports.configs = {
    '*': {
        hooks: './hooks',
        doc: 'wwww.taobao.com',
        options: {
            minQuality: {
                label: '最低品质',
                description: '压缩图片的最低品质参数',
                default: 65,
                render: {
                    ui: 'ui-slider',
                    attributes: {
                        min: 0,
                        max: 100,
                        step: 1
                    }
                }
            },
            maxQuality: {
                label: '最高品质',
                description: '压缩图片的最高品质参数',
                default: 80,
                render: {
                    ui: 'ui-slider',
                    attributes: {
                        min: 0,
                        max: 100,
                        step: 1
                    }
                }
            },
            speed: {
                label: '压缩速度',
                description: '压缩图片的速度参数',
                default: 3,
                render: {
                    ui: 'ui-slider',
                    attributes: {
                        min: 1,
                        max: 10,
                        step: 1
                    }
                }
            },
            cullingUUID: {
                label: '剔除图片uuid',
                description: '剔除图片uuid，多个请用,隔开',
                render: {
                    ui: 'ui-textarea',
                }
            },
            buildBundle: {
                label: '参与压缩的bundle',
                description: '参与构建的bundle，多个请用,隔开',
                render: {
                    ui: 'ui-textarea',
                }
            },
            isRemote: {
                label: '是否压缩远程包',
                render: {
                    ui: 'ui-checkbox',
                }
            }
        },
        verifyRuleMap: {},
    },
};
// export const assetHandlers: BuildPlugin.AssetHandlers = './asset-handlers';
