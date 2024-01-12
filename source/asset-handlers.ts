import { exec } from 'child_process';
import { AssetHandlers } from '../@types';
import { fstatSync, outputFile, statSync } from 'fs-extra';
import path from 'path';


type ITextureCompressType =
    | 'jpg'
    | 'png'
    | 'webp'
    | 'pvrtc_4bits_rgb'
    | 'astc_12x12'; // 详细格式请参见接口定义
interface ICompressTasks {
    src: string; // 源文件地址
    dest: string; // 生成的目标文件地址（后缀默认为 PNG，其他类型需要自行更改）
    quality: number // 压缩质量 0 - 100 或者其他的压缩等级
    format: ITextureCompressType; // 压缩类型
}


export const compressTextures: AssetHandlers.compressTextures = async (tasks: ICompressTasks[]) => {
    console.debug(`Execute compress task ${tasks}`);
    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        if (task.format !== 'png') {
            continue;
        }
        await compress(task);
        tasks.splice(i, 1);
        i--;
    }
};

const compress = async (task: ICompressTasks) => {
    return new Promise<void>(res => {
        const { src, dest } = task;
        const file = statSync(src);
        const sizeBefore = file.size / 1024;
        const pngquantPath = path.join(__dirname, 'pngquant/pngquant')
        const command = `${pngquantPath} --quality 70-80 --o ${dest} --force ${src}`;
        console.log(`pngquant command : ${command}`);
        exec(command, (error, stdout, stderr) => {
            if (!error) {
                console.log('压缩成功一个');
                const sizeAfter = statSync(dest).size / 1024;
                console.log(`压缩前:${sizeBefore},压缩后:${sizeAfter}`);
            } else {
                console.log(`压缩失败一个,message:${error.message},code:${error.code},stderr:${stderr}`);
            }
            res();
        });
    });
}