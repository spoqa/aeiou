import { btoa } from './string';
import * as FormData from 'form-data';
import merge = require('lodash.merge');


const getPrefix = (project: string) => `https://www.transifex.com/api/2/project/${ project }`;
const getLanguagesUrl = (prefix: string) => `${ prefix }/languages`;
const getResourceUrl = (prefix: string, resource: string) => `${ prefix }/resource/${ resource }`;
const getTranslationsUrl = (prefix: string, resource: string) => (locale: string) => `${ prefix }/resource/${ resource }/translation/${ locale }`;
const getSourceLanguageUrl = (prefix: string, resource: string) => `${ prefix }/resource/${ resource }/content`;
const getApi = (id: string, pw: string, fetchOptions: any = {}, parseJson = true) => async (url: string) => {
    const method = fetchOptions.method || 'GET';
    console.info(`-> ${ method } ${ url }`);
    const res = await require('node-fetch')(url, merge({
        headers: {
            'Host': 'www.transifex.com',
            'Authorization': `Basic ${ btoa(`${ id }:${ pw }`) }`
        }
    }, fetchOptions));
    console.info(`<- ${ method } ${ url }`);
    if (!res.ok) {
        throw new Error(await res.text());
    }
    if (parseJson) {
        return await res.json();
    } else {
        return await res.text();
    }
};

export async function getEveryLanguages(id: string, pw: string, project: string, resource: string) {
    const sourceLanguageCode = await getSourceLanguageCode(id, pw, project, resource);
    const sourceLanguage = await getSourceLanguage(id, pw, project, resource);
    const translations = await getTranslations(id, pw, project, resource);
    return Object.assign({
        [sourceLanguageCode]: sourceLanguage
    }, translations);
}

export async function getSourceLanguageCode(id: string, pw: string, project: string, resource: string) {
    const get = getApi(id, pw);
    const prefix = getPrefix(project);
    const resourceUrl = getResourceUrl(prefix, resource);
    return (await get(resourceUrl)).source_language_code;
}

export async function getSourceLanguage(id: string, pw: string, project: string, resource: string) {
    const get = getApi(id, pw);
    const prefix = getPrefix(project);
    const sourceLanguageUrl = getSourceLanguageUrl(prefix, resource);
    return await get(sourceLanguageUrl);
}

export async function putSourceLanguage(id: string, pw: string, project: string, resource: string, content: string) {
    const formData = new FormData();
    const buffer = Buffer.from(content);
    formData.append('file', buffer, {
        filename: 'messages.pot',
        contentType: 'application/pot',
        knownLength: buffer.length,
    });
    const put = getApi(id, pw, {
        method: 'PUT',
        body: formData,
        headers: formData.getHeaders(),
    }, false);
    const prefix = getPrefix(project);
    const sourceLanguageUrl = getSourceLanguageUrl(prefix, resource);
    return await put(sourceLanguageUrl);
}

export async function getTranslations(id: string, pw: string, project: string, resource: string) {
    const result: { [locale: string]: any } = {};
    const get = getApi(id, pw);
    const prefix = getPrefix(project);
    const [
        languagesUrl,
        translationsUrl
    ] = [
        getLanguagesUrl(prefix),
        getTranslationsUrl(prefix, resource)
    ];
    const locales: string[] = (await get(languagesUrl)).map((lang: any) => lang.language_code);
    const pairs = await Promise.all(locales.map((locale: string) => {
        return get(translationsUrl(locale)).then(
            translation => ({ locale, translation })
        );
    }));
    for (let pair of pairs) {
        result[pair.locale] = pair.translation;
    }
    return result;
}
