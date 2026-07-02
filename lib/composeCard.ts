import sharp from 'sharp';
import QRCode from 'qrcode';
import path from 'path';
import { CANVAS, QR_BOX, OUTPUT, BG_IMAGE_PATH } from './config';

/**
 * uniqueId를 QR로 인코딩해서 배경 이미지 위에 합성하고,
 * messageme MMS 규격(3:4, JPG, 500KB 미만)에 맞는 JPG 버퍼를 반환합니다.
 */
export async function composeQrCard(uniqueId: string): Promise<Buffer> {
  if (!uniqueId || typeof uniqueId !== 'string') {
    throw new Error('uniqueId가 필요합니다.');
  }

  // 1. QR 코드 생성 (배경 없이 투명 X, 흰 배경 PNG — sharp 합성용)
  const qrPngBuffer = await QRCode.toBuffer(uniqueId, {
    type: 'png',
    width: QR_BOX.SIZE,
    margin: 1,
    errorCorrectionLevel: 'M',
  });

  // 2. 배경 이미지 로드 경로
  const bgPath = path.join(process.cwd(), 'public', 'qr-bg.png');

  // 3. 배경 위에 QR 합성 + 캔버스 크기 고정
  const composedPng = await sharp(bgPath)
    .resize(CANVAS.WIDTH, CANVAS.HEIGHT, { fit: 'cover' })
    .composite([
      {
        input: qrPngBuffer,
        top: QR_BOX.TOP,
        left: QR_BOX.LEFT,
      },
    ])
    .png()
    .toBuffer();

  // 4. JPG로 변환하면서 500KB 미만이 될 때까지 quality를 단계적으로 낮춤
  let quality = OUTPUT.START_QUALITY;
  let jpegBuffer = await sharp(composedPng).jpeg({ quality }).toBuffer();

  while (jpegBuffer.length > OUTPUT.MAX_BYTES && quality > OUTPUT.MIN_QUALITY) {
    quality -= OUTPUT.QUALITY_STEP;
    jpegBuffer = await sharp(composedPng).jpeg({ quality }).toBuffer();
  }

  if (jpegBuffer.length > OUTPUT.MAX_BYTES) {
    // quality를 최저까지 낮춰도 안 되면 해상도 자체를 살짝 줄여서 재시도
    const scaled = await sharp(composedPng)
      .resize(Math.round(CANVAS.WIDTH * 0.85), Math.round(CANVAS.HEIGHT * 0.85))
      .jpeg({ quality: OUTPUT.MIN_QUALITY })
      .toBuffer();
    if (scaled.length <= OUTPUT.MAX_BYTES) return scaled;
    // 그래도 안 되면 원본 중 가장 작은 걸 반환 (거의 발생하지 않음)
    return jpegBuffer;
  }

  return jpegBuffer;
}
