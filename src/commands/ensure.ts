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
        if (localeTranslations == null) {
            untranslatedMsgs.push(...Object.keys(translations).map(
                msgid => [context, msgid] as [string, string]
            ));
            continue;
        }

        for (let msgid of Object.keys(translations)) {
            const translation = localeTranslations[msgid];
            if (translation == null || translation.msgstr.every(str => str === '')) {
                untranslatedMsgs.push([context, msgid]);
            }
        }
    }

    if (untranslatedMsgs.length > 0) {
        console.error([
            `There are ${untranslatedMsgs.length} untranslated messages:`,
            '',
            ...untranslatedMsgs.map(([context, msgid]) => `msgid: ${msgid}${context && `, msgctxt: ${context}`}`),
        ].join('\n'));
        process.exit(untranslatedMsgs.length);
    }

    console.log('All message translated.');
}
