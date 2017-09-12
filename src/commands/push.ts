import { join } from 'path';

import { putSourceLanguage } from '../transifex';
import { Catalog } from '../extract';
import { readFileAsync } from '../file';


export default async function push(
    id: string,
    password: string,
    project: string,
    resource: string,
    potDir: string,
) {
    // transifex는 새로 생긴 번역어만 추가하고, 나머지는 신경쓰지 않기 때문에
    // 기존 문구들과 병합하는 처리가 따로 필요하지 않습니다.
    const catalog = Catalog.from(await readFileAsync(join(potDir, 'messages.pot'), 'utf8') as string);
    await putSourceLanguage(id, password, project, resource, catalog.toString());
}
