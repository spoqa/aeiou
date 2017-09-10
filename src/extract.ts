import * as path from 'path';

import {
    ScriptTarget,
    SyntaxKind,
    createSourceFile,
    forEachChild,
    isBinaryExpression,
    isCallExpression,
    isStringLiteral,
    Node,
} from 'typescript';
import * as gettextParser from 'gettext-parser';
import * as format from 'date-fns/format';
import merge = require('lodash.merge');
import includes = require('lodash.includes');
import zipObject = require('lodash.zipobject');
import omitBy = require('lodash.omitby');
import isNil = require('lodash.isnil');

import { readFileAsync } from './file';

interface Specs {
    [key: string]: (string | null)[];
}
const specs: Specs = {
    lazyGettext: ['msgid'],
    gettext: ['msgid'],
    dgettext: [null, 'msgid'],
    ngettext: ['msgid', 'msgid_plural'],
    dngettext: [null, 'msgid', 'msgid_plural'],
    pgettext: ['msgctxt', 'msgid'],
    dpgettext: [null, 'msgctxt', 'msgid'],
    npgettext: ['msgctxt', 'msgid', 'msgid_plural'],
    dnpgettext: [null, 'msgid', 'msgid_plural']
};
const keywords = Object.keys(specs);

// https://github.com/smhg/gettext-parser#translations
export interface CatalogHeaders {
    [key: string]: string | undefined;
    'Project-Id-Version'?: string;
    'POT-Creation-Date'?: string;
    'MIME-Version'?: string;
    'Content-Type'?: string;
    'Content-Transfer-Encoding'?: string;
    'Generated-By'?: string;
}
export interface Translation {
    msgid: string;
    msgstr: string[];
    msgid_plural?: string;
    msgctxt?: string;
    comments: {
        reference: string;
    };
}
export interface Context {
    [translation: string]: Translation;
}
export interface Translations {
    [context: string]: Context;
}
export interface CatalogData {
    charset: string;
    headers: CatalogHeaders;
    translations: Translations;
}
export class Catalog implements CatalogData {
    charset: string;
    headers: CatalogHeaders;
    translations: Translations;
    constructor() {
        this.charset = 'utf-8';
        this.headers = {
            'POT-Creation-Date': format(new Date(), 'YYYY-MM-DD HH:mmZZ'),
            'MIME-Version': '1.0',
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Transfer-Encoding': '8bit',
            'Generated-By': 'AEIOU',
        };
        this.translations = {};
    }
    add(
        filename: string,
        lineno: number,
        character: number,
        msgid: string,
        msgid_plural: string | null,
        msgctxt: string | null,
    ) {
        msgctxt = msgctxt || '';
        const { translations } = this;
        if (!translations[msgctxt]) {
            translations[msgctxt] = {};
        }
        const context = translations[msgctxt];
        const message = context[msgid];
        if (message) {
            message.comments.reference += `\n${ filename }:${ lineno },${ character }`;
            return;
        }
        context[msgid] = omitBy({
            msgid,
            msgid_plural,
            msgctxt,
            // TODO: 헤더의 Plural-Forms을 보고 nplurals 갯수만큼의 빈 문자열을 가지는 배열을 넣어주자.
            // 예) nplurals=3; 인 경우 ['', '', '']
            // https://www.gnu.org/software/gettext/manual/html_node/Translating-plural-forms.html#Translating-plural-forms
            msgstr: [''],
            comments: { reference: `${ filename }:${ lineno },${ character }` },
        }, isNil);
    }
    mergeTranslations(translations: Translations) {
        merge(this.translations, translations);
    }
    toBuffer(): Buffer {
        return gettextParser.mo.compile(this);
    }
    toString(): string {
        return gettextParser.po.compile(this).toString();
    }
    static from(data: string | CatalogData): Catalog {
        if (typeof data === 'string') {
            return Catalog.from(gettextParser.po.parse(data, 'utf8'));
        }
        if (typeof data.charset !== 'string') {
            throw new CatalogValidationError('charset이 필요합니다.');
        }
        if (!data.headers || typeof data.headers !== 'object') {
            throw new CatalogValidationError('headers가 필요합니다.');
        }
        if (!data.translations || typeof data.translations !== 'object') {
            throw new CatalogValidationError('translations가 필요합니다.');
        }
        return Object.assign(new Catalog(), data);
    }
}

export class CatalogValidationError extends Error {}

export async function generateCatalog(filenames: string[], workingDirectory: string) {
    const catalog = new Catalog();
    for (let filename of filenames) {
        const sourceCode = await readFileAsync(path.join(workingDirectory, filename), 'utf8') as string;
        console.info(`extarcting messages from ${ filename }`);
        for (let [lineno, character, msgid, msgid_plural, msgctxt] of extractTs(sourceCode, filename)) {
            catalog.add(filename, lineno, character, msgid, msgid_plural, msgctxt);
        }
    }
    return catalog;
}

export function *extractTs(
    sourceCode: string,
    filename='(no filename)',
): Iterable<[ number, number, string, (string | null), (string | null) ]> {
    const nodes = getCallExpressions(sourceCode, filename);
    for (let node of nodes) {
        const {
            line,
            character,
            name,
            args,
        } = node;
        // 지정된 이름의 호출 표현식인지 체크
        if (!includes(keywords, name)) {
            continue;
        }
        const spec = specs[name];
        const msg: {
            msgid?: string | null;
            msgid_plural?: string | null;
            msgctxt?: string | null;
        } = zipObject(spec as any, args);
        if (!msg.msgid) {
            continue;
        }
        yield [
            line,
            character,
            msg.msgid,
            msg.msgid_plural || null,
            msg.msgctxt || null,
        ];
    }
}

interface CallExpression {
    filename: string;
    line: number;
    character: number;
    name: string;
    args: (string | null)[];
}

function getCallExpressions(sourceCode: string, filename: string) {
    const nodes: CallExpression[] = [];
    function delintNode(node: Node) {
        function transformArg(arg: Node): string | null {
            if (isStringLiteral(arg)) {
                return arg.text;
            } else if (isBinaryExpression(arg) && arg.operatorToken.kind === SyntaxKind.PlusToken) {
                const left = transformArg(arg.left);
                const right = transformArg(arg.right);
                return left && right && left + right;
            } else {
                return null;
            }
        }
        if (isCallExpression(node)) {
            const { expression, arguments: args } = node;
            const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
            const text = (expression as any).text;
            nodes.push({
                filename,
                line: line + 1,
                character: character + 1,
                name: text ? `${ text }` : '',
                args: args.map(transformArg),
            });
        }
        forEachChild(node, delintNode);
    }

    const sourceFile = createSourceFile(filename, sourceCode, ScriptTarget.ES2016, true);
    delintNode(sourceFile);

    return nodes;
}
