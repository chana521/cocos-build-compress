"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAfterBuild = exports.load = exports.throwError = void 0;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = require("fs-extra");
const child_process_1 = require("child_process");
const PACKAGE_NAME = 'build-compress';
function log(...arg) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}
let allAssets = [];
exports.throwError = true;
const load = function () {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
        allAssets = yield Editor.Message.request('asset-db', 'query-assets');
    });
};
exports.load = load;
let cullPngs = [];
const onAfterBuild = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        const parms = options.packages['build-compress'];
        console.log('onAfterBuild-options');
        console.log(`minQuality:${parms.minQuality},maxQuality:${parms.maxQuality},speed:${parms.speed},path:${parms.cullingUUID}`);
        cullPngs = parms.cullingUUID.split(',');
        const bundles = parms.buildBundle.split(',').map(str => path_1.default.join(result.dest, 'assets', str));
        if (parms.isRemote) {
            bundles.push(path_1.default.join(result.dest, 'remote'));
        }
        for (const path of bundles) {
            yield startCompress(path, parms);
        }
    });
};
exports.onAfterBuild = onAfterBuild;
const map = (dirPath, handler) => {
    if (!(0, fs_extra_1.existsSync)(dirPath))
        return;
    const stats = (0, fs_extra_1.statSync)(dirPath);
    if (stats.isDirectory()) {
        const names = (0, fs_extra_1.readdirSync)(dirPath);
        for (const name of names) {
            map(path_1.default.join(dirPath, name), handler);
        }
    }
    else if (stats.isFile()) {
        handler(dirPath, stats);
    }
};
const startCompress = (srcPath, options) => __awaiter(void 0, void 0, void 0, function* () {
    const tasks = [];
    const handler = (src, stats) => {
        if (!src.endsWith('png'))
            return;
        if (isCull(src)) {
            console.log(`一个图片已经被剔除了！ path:${srcPath}`);
            return;
        }
        tasks.push(new Promise(res => {
            const file = (0, fs_extra_1.statSync)(src);
            const sizeBefore = file.size / 1024;
            const pngquantPath = path_1.default.join(__dirname, 'pngquant/pngquant');
            const command = `${pngquantPath} --quality ${options.minQuality}-${options.maxQuality} --speed ${options.speed} --ext=.png --force ${src}`;
            console.log(`pngquant command : ${command}`);
            (0, child_process_1.exec)(command, (error, stdout, stderr) => {
                if (!error) {
                    console.log('压缩成功一个');
                    const sizeAfter = (0, fs_extra_1.statSync)(src).size / 1024;
                    console.log(`压缩前:${sizeBefore},压缩后:${sizeAfter}`);
                }
                else {
                    console.log(`压缩失败一个,message:${error.message},code:${error.code},stderr:${stderr}`);
                }
                res();
            });
        }));
    };
    map(srcPath, handler);
    yield Promise.all(tasks);
});
const isCull = (filePath) => {
    const basename = path_1.default.basename(filePath), uuid = basename.split('.png')[0];
    console.log(`看看uuid：${uuid},baseName:${basename}`, cullPngs);
    return cullPngs.findIndex(str => uuid.startsWith(str)) > -1;
};
