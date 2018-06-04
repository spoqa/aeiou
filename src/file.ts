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

export const mkdirp = fs.mkdirp;

export const writeFileAsync = fs.writeFile;

export const readFileAsync = fs.readFile;
