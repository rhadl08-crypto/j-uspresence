import { NextRequest, NextResponse } from 'next/server';
import { composeQrCard } from '@/lib/composeCard';

export const runtime = 'nodejs';
export const maxDuration = 30;

// 브라우저에서 바로 열어서 확인:
// https://<배포주소>/api/qr-card/preview?uniqueId=TEST1234&secret=여기에QR_API_SECRET값
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  if (!process.env.QR_API_SECRET || secret !== process.env.QR_API_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const uniqueId = searchParams.get('uniqueId') || 'PREVIEW-TEST-0000';

  try {
    const jpegBuffer = await composeQrCard(uniqueId);
    return new NextResponse(jpegBuffer as any, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': String(jpegBuffer.length),
        'Cache-Control': 'no-store',
      },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || 'unknown error' }, { status: 500 });
  }
}
