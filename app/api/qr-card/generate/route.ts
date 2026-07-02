import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { composeQrCard } from '@/lib/composeCard';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    // 간단한 인증 — Apps Script에서 헤더로 같이 보내는 비밀키 확인
    const secret = req.headers.get('x-api-secret');
    if (!process.env.QR_API_SECRET || secret !== process.env.QR_API_SECRET) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { uniqueId } = await req.json();
    if (!uniqueId) {
      return NextResponse.json({ error: 'uniqueId required' }, { status: 400 });
    }

    const jpegBuffer = await composeQrCard(uniqueId);

    const blob = await put(`qr-cards/${uniqueId}.jpg`, jpegBuffer, {
      access: 'public',
      contentType: 'image/jpeg',
      addRandomSuffix: false,
    });

    return NextResponse.json({ url: blob.url, sizeBytes: jpegBuffer.length });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || 'unknown error' }, { status: 500 });
  }
}
