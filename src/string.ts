export const atob = (b64: string) => Buffer.from(b64, 'base64').toString();
export const btoa = (str: string) => Buffer.from(str).toString('base64');
