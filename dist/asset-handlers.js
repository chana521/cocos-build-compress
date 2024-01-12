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
exports.compressTextures = void 0;
const child_process_1 = require("child_process");
const fs_extra_1 = require("fs-extra");
const path_1 = __importDefault(require("path"));
const compressTextures = (tasks) => __awaiter(void 0, void 0, void 0, function* () {
    console.debug(`Execute compress task ${tasks}`);
    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        if (task.format !== 'png') {
            continue;
        }
        yield compress(task);
        tasks.splice(i, 1);
        i--;
    }
});
exports.compressTextures = compressTextures;
const compress = (task) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise(res => {
        const { src, dest } = task;
        const file = (0, fs_extra_1.statSync)(src);
        const sizeBefore = file.size / 1024;
        const pngquantPath = path_1.default.join(__dirname, 'pngquant/pngquant');
        const command = `${pngquantPath} --quality 70-80 --o ${dest} --force ${src}`;
        console.log(`pngquant command : ${command}`);
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            if (!error) {
                console.log('压缩成功一个');
                const sizeAfter = (0, fs_extra_1.statSync)(dest).size / 1024;
                console.log(`压缩前:${sizeBefore},压缩后:${sizeAfter}`);
            }
            else {
                console.log(`压缩失败一个,message:${error.message},code:${error.code},stderr:${stderr}`);
            }
            res();
        });
    });
});
