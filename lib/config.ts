// ================================================
// QR 카드 합성 설정
// 배경 이미지 위에 QR을 어디에, 얼마나 크게 올릴지는
// 전부 여기 숫자만 바꾸면 됩니다. (좌표 단위: px)
// ================================================

export const CANVAS = {
  // 최종 출력 캔버스 크기 (messageme MMS 권장: 3:4 비율)
  WIDTH: 900,
  HEIGHT: 1200,
};

export const QR_BOX = {
  // QR 코드가 그려질 정사각형 영역
  SIZE: 420,       // QR 한 변 길이 (px). 너무 작으면 스캔이 안 될 수 있어 400 이상 권장
  TOP: 620,         // 배경 이미지 상단에서부터의 y 좌표
  LEFT: 240,         // 배경 이미지 왼쪽에서부터의 x 좌표
};

export const OUTPUT = {
  MAX_BYTES: 500 * 1024, // messageme 권장 상한 500KB
  START_QUALITY: 82,
  MIN_QUALITY: 40,       // 500KB를 못 맞추면 이 아래로는 안 내려감 (화질 최저선)
  QUALITY_STEP: 8,
};

// 배경 이미지 경로 (public 폴더 기준) — 지은님이 만든 디자인 파일로 교체
export const BG_IMAGE_PATH = 'public/qr-bg.jpg';
