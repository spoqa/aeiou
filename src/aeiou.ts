import * as yargs from 'yargs';

import extract from './commands/extract';
import push from './commands/push';
import download from './commands/download';
import ensure from './commands/ensure';


yargs
    .usage('$0 <명령> --help')
    .command('extract', '소스코드에서 번역이 필요한 문구들을 추출합니다.', yargs => {
        yargs.option('srcDir', { describe: 'gettext 호출을 하는 소스코드(*.ts)가 들어있는 경로', type: 'string', demandOption: true });
        yargs.option('outDir', { describe: '추출된 문구들(messages.pot)이 저장될 경로', type: 'string', demandOption: true });
        return yargs;
    }, async argv => {
        const { srcDir, outDir } = argv;
        await extract(srcDir, outDir);
    })
    .command('push', '추출한 문구들(messages.pot)을 transifex로 전송합니다.', yargs => {
        yargs.option('id', { describe: 'transifex 아이디', type: 'string', demandOption: true });
        yargs.option('password', { describe: 'transifex 비밀번호', type: 'string', demandOption: true });
        yargs.option('project', { describe: 'transifex 프로젝트', type: 'string', demandOption: true });
        yargs.option('resource', { describe: 'transifex 리소스', type: 'string', demandOption: true });
        yargs.option('potDir', { describe: 'messages.pot 파일이 들어있는 디렉토리', type: 'string', demandOption: true });
        return yargs;
    }, async argv => {
        const { id, password, project, resource, potDir } = argv;
        await push(id, password, project, resource, potDir);
    })
    .command('download', 'transifex에서 번역 파일들을 내려받습니다.', yargs => {
        yargs.option('id', { describe: 'transifex 아이디', type: 'string', demandOption: true });
        yargs.option('password', { describe: 'transifex 비밀번호', type: 'string', demandOption: true });
        yargs.option('project', { describe: 'transifex 프로젝트', type: 'string', demandOption: true });
        yargs.option('resource', { describe: 'transifex 리소스', type: 'string', demandOption: true });
        yargs.option('outDir', { describe: '번역 파일들이 저장될 경로', type: 'string', demandOption: true });
        return yargs;
    }, async argv => {
        const { id, password, project, resource, outDir } = argv;
        await download(id, password, project, resource, outDir);
    })
    .command('ensure', '현재 프로젝트에서 특정 로케일로의 번역이 모두 이루어졌는지 확인합니다. (extract, download 이후 사용)', yargs => {
        yargs.option('locale', { describe: '확인하고 싶은 로케일', type: 'string' });
        yargs.option('potDir', { describe: 'messages.pot 이 저장되어 있는 디렉토리', type: 'string', demandOption: true });
        yargs.option('poDir', { describe: '번역 파일들이 저장되어 있는 디렉토리 (생략시 potDir과 동일)', type: 'string' });
        return yargs;
    }, async argv => {
        const { locale, potDir, poDir } = argv;
        await ensure(locale, potDir, poDir || potDir);
    })
    .strict()
    .demandCommand(1, '명령을 입력해주세요.')
    .help()
    .argv;
