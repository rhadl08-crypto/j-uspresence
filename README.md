# QR Card Generator (J-US PRESENCE)

배경 이미지 위에 QR코드를 합성해서 Vercel Blob에 업로드하고,
messageme MMS 규격(3:4, JPG, 500KB 미만)에 맞는 짧은 URL을 돌려주는 API.

## 0. 배경 이미지 교체 (가장 먼저 할 일)

`public/qr-bg.jpg` 를 지은님이 만든 실제 디자인 파일로 **덮어쓰기** 하세요.
지금 들어있는 건 좌표 확인용 노란색 플레이스홀더입니다.

- 캔버스 기준: 900 x 1200px (3:4)
- QR 자리: 기본값 `top:620, left:240, size:420` (`lib/config.ts`에서 조정)

## 1. 로컬 설치

```bash
npm install
```

## 2. Vercel에 새 프로젝트로 배포

1. 이 폴더를 새 GitHub repo에 push
2. https://vercel.com/new 에서 해당 repo import → 새 프로젝트 생성 (Hobby, 무료)
3. 배포 완료되면 프로젝트 대시보드 진입

## 3. Vercel Blob 연결

1. 프로젝트 대시보드 → **Storage** 탭 → **Create Database** → **Blob** 선택
2. 이름 아무거나 (예: `qr-cards`) → Create
3. 연결하면 `BLOB_READ_WRITE_TOKEN` 환경변수가 프로젝트에 **자동으로** 추가됨
   (직접 키 발급/입력 불필요)

## 4. 환경변수 설정

Vercel 프로젝트 → **Settings → Environment Variables** 에서:

| 이름 | 값 |
|---|---|
| `QR_API_SECRET` | 아무 랜덤 문자열 (예: `presence2026-xyz789`) — Apps Script에서 호출할 때 같이 씀 |

`BLOB_READ_WRITE_TOKEN`은 3번 단계에서 이미 자동으로 들어가 있으니 건드릴 필요 없음.

설정 후 **Redeploy** 한 번 눌러줘야 반영됨 (Deployments 탭 → 최신 배포 → ⋯ → Redeploy).

## 5. 좌표 확인 (QR 위치 미리보기)

브라우저에서 아래 주소로 바로 결과 확인 가능:

```
https://<배포도메인>/api/qr-card/preview?uniqueId=TEST1234&secret=<QR_API_SECRET값>
```

QR 위치가 배경 디자인과 안 맞으면 `lib/config.ts`의 `QR_BOX.TOP` / `QR_BOX.LEFT` /
`QR_BOX.SIZE` 값만 수정하고 다시 배포(git push)하면 됩니다.

## 6. Apps Script에서 호출하기

기존 `syncToNoticeList` 함수의 QR URL 생성 부분에 아래 헬퍼를 추가/교체:

```javascript
const QR_CARD_API = 'https://<배포도메인>/api/qr-card/generate';
const QR_API_SECRET = '<QR_API_SECRET값>'; // Vercel에 설정한 것과 동일하게

function _generateComposedQR(uniqueId) {
  const res = UrlFetchApp.fetch(QR_CARD_API, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-api-secret': QR_API_SECRET },
    payload: JSON.stringify({ uniqueId }),
    muteHttpExceptions: true,
  });
  const data = JSON.parse(res.getContentText());
  if (data.error) throw new Error('QR 합성 실패: ' + data.error);
  return data.url; // 예: https://xxxx.public.blob.vercel-storage.com/qr-cards/ABC123.jpg
}
```

`syncToNoticeList` 안의 이 줄:

```javascript
const qrUrl = `https://quickchart.io/qr?text=${uniqueId}&size=200&margin=2`;
```

을 아래로 교체:

```javascript
const qrUrl = _generateComposedQR(uniqueId);
```

(QR DB 저장용 `=IMAGE("${qrUrl}")` 수식도 그대로 잘 작동합니다.)

그리고 `processBulkSMS`에서 `_sendSMS(target.phone, finalMsg, qrUrl)` 호출할 때
이 `qrUrl`이 바로 messageme `image` 파라미터로 들어가면 됩니다 — 이미
JPG/3:4/500KB 미만 규격이라 별도 변환 필요 없음.

## 폴더 구조

```
qr-card-generator/
├── app/
│   ├── api/qr-card/
│   │   ├── generate/route.ts   ← 실제 발송용 (합성+업로드)
│   │   └── preview/route.ts    ← 좌표 테스트용 (업로드 안 함)
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── config.ts        ← QR 위치/캔버스 크기 설정 (여기만 자주 건드림)
│   └── composeCard.ts   ← 합성 핵심 로직
├── public/
│   └── qr-bg.jpg         ← 배경 디자인 (교체 필요!)
└── package.json
```
