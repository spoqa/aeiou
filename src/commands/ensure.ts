import { join } from 'path';

import { Catalog } from '../extract';
import { readFileAsync } from '../file';


export default async function ensure(
    locale: string,
    potDir: string,
    poDir: string,
) {
    const untranslatedMsgs: Array<[string, string]> = [];

    const template = Catalog.from(await readFileAsync(join(potDir, 'messages.pot'), 'utf8') as string);
    const localeCatalog = Catalog.from(await readFileAsync(join(poDir, `${locale}.po`), 'utf8') as string);

    for (let [context, translations] of Object.entries(template.translations)) {
        const localeTranslations = localeCatalog.translations[context];

        for (let msgid of Object.keys(translations)) {
            const { msgstr } = localeTranslations[msgid];

            if (msgstr.every(str => str === '')) {
                untranslatedMsgs.push([context, msgid]);
            }
        }
    }

    if (untranslatedMsgs.length > 0) {
        console.error([
            `There are ${untranslatedMsgs.length} untranslated messages:`,
            '',
            ...untranslatedMsgs.map(([context, msgid]) => `msgid: ${msgid}, msgctxt: ${context}`)
        ].join('\n'));
        process.exit(untranslatedMsgs.length);
    }

    console.log('All message translated.');
}
