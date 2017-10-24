import { join } from 'path';

import {
    getSourceLanguage,
    putSourceLanguage,
} from '../transifex';
import { Catalog } from '../extract';
import { readFileAsync } from '../file';


export default async function push(
    id: string,
    password: string,
    project: string,
    resource: string,
    potDir: string,
) {
    const remoteCatalog = Catalog.from((await getSourceLanguage(id, password, project, resource)).content);
    const localCatalog = Catalog.from(await readFileAsync(join(potDir, 'messages.pot'), 'utf8') as string);
    localCatalog.mergeTranslations(remoteCatalog.translations);
    localCatalog.clearMsgstr();
    await putSourceLanguage(id, password, project, resource, localCatalog.toString());
}
