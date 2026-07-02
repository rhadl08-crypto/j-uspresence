export default function Home() {
  return (
    <main style={{ fontFamily: 'sans-serif', padding: 40, lineHeight: 1.8 }}>
      <h1>QR Card Generator</h1>
      <p>이 프로젝트는 API 전용입니다. 아래 엔드포인트를 사용하세요.</p>
      <ul>
        <li>
          <code>POST /api/qr-card/generate</code> — QR 합성 + Blob 업로드 (Apps
          Script에서 호출)
        </li>
        <li>
          <code>GET /api/qr-card/preview?uniqueId=TEST&secret=...</code> — 좌표
          확인용 미리보기 (업로드 안 함)
        </li>
      </ul>
    </main>
  );
}
