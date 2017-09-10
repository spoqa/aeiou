# 아에이오우
스포카 프론트엔드 프로젝트에서 사용하는 국제화 스크립트입니다.

## 사용법
```sh
npm install -g aeiou

# 소스코드에서 번역이 필요한 문구들을 추출합니다.
aeiou extract --srcDir="./src" --outDir="./tmp/translations"

# transifex로 업로드합니다.
aeiou push \
    --id="dkdlel" --password="qlalfqjsgh" \
    --project="vmfhwprxm" --resource="flthtm" \
    --potDir="./tmp/translations/messages.pot"

# transifex에서 번역 작업 후 번역 파일들을 내려받습니다.
aeiou download \
    --id="dkdlel" --password="qlalfqjsgh" \
    --project="vmfhwprxm" --resource="flthtm" \
    --outDir="./tmp/translations"
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
