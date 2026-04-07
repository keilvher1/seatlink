import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "좌석이음 SeatLink — 전국 도서관 실시간 좌석 · AI 추천",
  description: "지금, 내 주변에서 가장 여유로운 도서관을 AI가 찾아드립니다. 전국 공공도서관 열람실 실시간 좌석 현황 및 혼잡도 예측 서비스",
  keywords: "도서관, 열람실, 좌석, 실시간, AI, 혼잡도, 추천, 공공데이터",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>

      </head>
      <body className="bg-slate-50 text-slate-900 antialiased">
        {/* 헤더 */}
        <Header />

        {/* 메인 콘텐츠 */}
        <main className="pb-20 md:pb-0">{children}</main>

        {/* 모바일 하단 네비게이션 */}
        <BottomNav />
      </body>
    </html>
  );
}

// ============================
// 헤더 컴포넌트
// ============================
function Header() {
  return (
    <header className="sticky top-0 z-40 glass">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* 로고 */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="font-bold text-lg gradient-text">좌석이음</span>
        </a>

        {/* 검색바 */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="도서관 이름 또는 지역을 검색하세요"
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/50 rounded-full border-0 focus:ring-2 focus:ring-blue-500 focus:bg-white transition backdrop-blur-sm"
            />
          </div>
        </div>

        {/* 우측 버튼 */}
        <div className="flex items-center gap-2 ml-auto">
          <button className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition hover:scale-110 duration-200" title="접근성 모드">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </button>
          <button className="hidden md:block px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full hover:shadow-lg hover:shadow-blue-500/30 transition transform hover:scale-105">
            로그인
          </button>
        </div>
      </div>
    </header>
  );
}

// ============================
// 모바일 하단 네비게이션
// ============================
function BottomNav() {
  const tabs = [
    { href: "/", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7", label: "홈" },
    { href: "/recommend", icon: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-.772.13c-1.065.178-2.158.26-3.25.243m-8.113 0a9.862 9.862 0 01-3.25-.243l-.772-.13c-1.717-.293-2.3-2.379-1.067-3.61L5 14.5", label: "AI추천" },
    { href: "/dashboard", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z", label: "대시보드" },
    { href: "/community", icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155", label: "커뮤니티" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 glass" />
      
      {/* Content */}
      <div className="relative flex justify-around items-center h-20 px-2 z-10">
        {tabs.map((tab, i) => (
          <a
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ${
              i === 0 
                ? "text-blue-600 bg-blue-50/80 backdrop-blur-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
            </svg>
            <span className="text-[10px] font-semibold">{tab.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
