import path from 'path';
import { IBuildTaskOption, BuildHook, IBuildResult, IRawAssetPathInfo } from '../@types';
import { Stats, existsSync, readdirSync, statSync } from 'fs-extra';
import { exec } from 'child_process';

interface IOptions {
    minQuality: number;
    maxQuality: number;
    speed: number;
    cullingUUID: string;
    buildBundle: string;
    isRemote: boolean;
}

const PACKAGE_NAME = 'build-compress';

interface ITaskOptions extends IBuildTaskOption {
    packages: {
        'build-compress': IOptions;
    };
}

function log(...arg: any[]) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}

let allAssets = [];

export const throwError: BuildHook.throwError = true;

export const load: BuildHook.load = async function () {
    console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
    allAssets = await Editor.Message.request('asset-db', 'query-assets');
};


let cullPngs: string[] = [];

export const onAfterBuild: BuildHook.onAfterBuild = async function (options: ITaskOptions, result: IBuildResult) {
    const parms = options.packages['build-compress'];
    console.log('onAfterBuild-options');
    console.log(`minQuality:${parms.minQuality},maxQuality:${parms.maxQuality},speed:${parms.speed},path:${parms.cullingUUID}`);
    cullPngs = parms.cullingUUID.split(',');
    const bundles = parms.buildBundle.split(',').map(str => path.join(result.dest, 'assets', str));
    if (parms.isRemote) {
        bundles.push(path.join(result.dest, 'remote'));
    }
    for (const path of bundles) {
        await startCompress(path, parms);
    }
};
const map = (dirPath: string, handler: (path, stats) => void) => {
    if (!existsSync(dirPath)) return
    const stats = statSync(dirPath);
    if (stats.isDirectory()) {
        const names = readdirSync(dirPath);
        for (const name of names) {
            map(path.join(dirPath, name), handler);
        }
    } else if (stats.isFile()) {
        handler(dirPath, stats);
    }
}
const startCompress = async (srcPath: string, options: IOptions) => {
    const tasks: Promise<void>[] = [];
    const handler = (src: string, stats: Stats) => {
        if (!src.endsWith('png')) return;
        if (isCull(src)) {
            console.log(`一个图片已经被剔除了！ path:${srcPath}`);
            return;
        }
        tasks.push(new Promise<void>(res => {
            const file = statSync(src);
            const sizeBefore = file.size / 1024;
            const pngquantPath = path.join(__dirname, 'pngquant/pngquant')
            const command = `${pngquantPath} --quality ${options.minQuality}-${options.maxQuality} --speed ${options.speed} --ext=.png --force ${src}`;
            console.log(`pngquant command : ${command}`);
            exec(command, (error, stdout, stderr) => {
                if (!error) {
                    console.log('压缩成功一个');
                    const sizeAfter = statSync(src).size / 1024;
                    console.log(`压缩前:${sizeBefore},压缩后:${sizeAfter}`);
                } else {
                    console.log(`压缩失败一个,message:${error.message},code:${error.code},stderr:${stderr}`);
                }
                res();
            });
        }))
    }
    map(srcPath, handler);
    await Promise.all(tasks);
}

const isCull = (filePath: string) => {
    const basename = path.basename(filePath),
        uuid = basename.split('.png')[0];
    console.log(`看看uuid：${uuid},baseName:${basename}`, cullPngs);
    return cullPngs.findIndex(str => uuid.startsWith(str)) > -1;
}
