# 아에이오우
스포카 프론트엔드 프로젝트에서 사용하는 국제화 스크립트입니다.

# 기능
- js, ts 파일들을 읽고, 그 안에 있는 `gettext` 함수 호출식을 긁어서 `messages.pot` 파일을 생성합니다.
- transifex로 `messages.pot`파일을 업로드합니다.
- transifex에서 `*.po` 파일들을 다운받고, `*.mo` 파일로 컴파일합니다.
- 추출한 `messages.pot`에는 들어있지만 다운받은 `*.po` 파일에는 들어있지 않은 번역어를 찾아줍니다.

## 사용법
```sh
npm install -g aeiou

# 도움말을 확인합니다.
aeiou --help

# 특정 명령어에 대한 도움말도 확인할 수 있습니다.
aeiou extract --help

# 소스코드에서 번역이 필요한 문구들을 추출합니다.
aeiou extract --srcDir="./src" --outDir="./tmp/translations"
# `./tmp/translations` 경로로 들어가보면 `messages.pot` 파일을 확인할 수 있습니다.

# transifex로 업로드합니다.
# ./tmp/translations 경로에 `messages.pot` 파일이 있어야합니다.
aeiou push \
    --id="dkdlel" --password="qlalfqjsgh" \
    --project="vmfhwprxm" --resource="flthtm" \
    --potDir="./tmp/translations"

# transifex에서 번역 작업 후 번역 파일들을 내려받습니다.
aeiou download \
    --id="dkdlel" --password="qlalfqjsgh" \
    --project="vmfhwprxm" --resource="flthtm" \
    --outDir="./tmp/translations"

# 추출한 `messages.pot` 파일과 내려받은 번역파일을 비교해서 비어있는 번역어가 없는지 검사합니다.
aeiou ensure --locale="ja" --potDir="./src/static/translations"
```

## aeiou 개발하기
- `npm install`
- `npm run build` or `npm run dev`
- `.js` 파일은 컴파일된 결과입니다. 손으로 고치지 맙시다.
    - vscode의 경우 좌측 파일트리의 `.js` 파일들이 신경쓰이면
        - 상단 메뉴에서 `Code` > `기본 설정` > `설정`으로 들어갑니다.
        - 우측 상단 드랍다운에서 `작업 영역 설정`을 클릭합니다.
        - 다음의 내용을 설정에 추가합니다:
            ```
            "files.exclude": {
                "**/*.js": true
            }
            ```
