import * as path from 'path';

import { generateCatalog } from '../extract';
import {
    globAsync,
    mkdirp,
    writeFileAsync,
} from '../file';


export default async function extract(
    srcDir: string,
    outDir: string,
) {
    const files = await globAsync('**/*.@(js|jsx|mjs|ts|tsx)', { cwd: srcDir });
    const pot = (await generateCatalog(files, srcDir)).toString();
    const savingPath = path.join(outDir, 'messages.pot');
    console.info(`writing PO template file to ${ savingPath }`);
    await mkdirp(outDir);
    await writeFileAsync(savingPath, pot);
}
