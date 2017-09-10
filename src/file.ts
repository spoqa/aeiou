import * as fs from 'fs-extra';
import * as glob from 'glob';


export function globAsync(pattern: string, options={}): Promise<string[]> {
    return new Promise((resolve, reject) => {
        glob(pattern, options, (err: any, files: string[]) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
}

export function mkdirp(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.mkdirs(path, (err: any) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export function writeFileAsync(path: string, data: string | Buffer, option={}): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, option, (err: any) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export function readFileAsync(path: string, option={}): Promise<string | Buffer> {
    return new Promise((resolve, reject) => {
        fs.readFile(path, option, (err: any, data: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}
