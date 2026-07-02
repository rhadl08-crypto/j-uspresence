export const metadata = {
  title: 'QR Card Generator',
  description: 'J-US PRESENCE QR 카드 합성 API',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
