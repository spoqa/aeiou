declare module 'gettext-parser' {
    export const po: {
        parse: Function,
        createParseStream: Function,
        compile: Function,
    };
    export const mo: {
        parse: Function,
        compile: Function,
    };
}
