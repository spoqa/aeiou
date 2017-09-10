import * as path from 'path';

import { Catalog } from '../extract';
import { getEveryLanguages } from '../transifex';
import {
    globAsync,
    mkdirp,
    readFileAsync,
    writeFileAsync,
} from '../file';


export default async function download(
    id: string,
    password: string,
    project: string,
    resource: string,
    outDir: string,
) {
    { // download po files
        const translations = await getEveryLanguages(id, password, project, resource);
        await mkdirp(outDir);
        await Promise.all(
            Object.keys(translations).map(locale => {
                const po = translations[locale].content;
                const savingPath = path.join(outDir, `${ locale }.po`);
                console.log(`writing PO(${ locale }) file to ${ savingPath }`);
                return writeFileAsync(savingPath, po, 'utf8');
            })
        );
    }
    { // compile as mo files from po files
        const files = await globAsync('*.po', {
            cwd: outDir
        });
        await mkdirp(outDir);
        const pos = await Promise.all(
            files.map(file => readFileAsync(path.join(outDir, file), 'utf8').then(
                (po: string) => ({ po, locale: path.basename(file, '.po') })
            ))
        );
        const mos = pos.map(({ po, locale }) => {
            return { locale, mo: Catalog.from(po).toBuffer() };
        });
        await Promise.all(mos.map(({ mo, locale }) => {
            return Promise.all([
                writeFileAsync(path.join(outDir, `${ locale }.mo`), mo),
            ]);
        }));
    }
}
