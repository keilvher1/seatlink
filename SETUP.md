# 좌석이음 (SeatLink) — 설치 및 실행 가이드

## 빠른 시작 (5분)

### 1단계: 의존성 설치
```bash
cd seatlink
npm install
```

### 2단계: 환경변수 설정
```bash
cp .env.local.example .env.local
```
`.env.local` 파일을 열고 API 키를 입력하세요:
```
DATA_GO_KR_API_KEY=공공데이터포털에서_복사한_Decoding_서비스키
NEXT_PUBLIC_KAKAO_MAP_KEY=카카오_JavaScript_키
```

### 3단계: 개발 서버 실행
```bash
npm run dev
```
브라우저에서 http://localhost:3000 접속

### 4단계: Vercel 배포
```bash
npm i -g vercel
vercel
```
환경변수를 Vercel 대시보드에서도 설정해주세요.

---

## API 키 발급 가이드

### 공공데이터포털 (data.go.kr)
1. 회원가입 및 로그인
2. 아래 4개 API 페이지에서 "활용신청" 클릭:
   - 공공도서관 열람실: https://www.data.go.kr/data/15142580/openapi.do
   - 공영자전거: https://www.data.go.kr/data/15126639/openapi.do
   - 초정밀버스: https://www.data.go.kr/data/15157601/openapi.do
   - 교통약자: https://www.data.go.kr/data/15140825/openapi.do
3. 마이페이지 → 활용신청 현황 → **Decoding 서비스키** 복사

### 카카오맵 (developers.kakao.com)
1. 카카오 개발자 사이트 로그인
2. 내 애플리케이션 → 앱 추가하기
3. 앱 키 → **JavaScript 키** 복사
4. 플랫폼 → Web → 사이트 도메인 추가:
   - http://localhost:3000
   - 배포 URL (예: https://seatlink.vercel.app)

---

## 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx              # 글로벌 레이아웃 (헤더, 하단 네비)
│   ├── page.tsx                # 메인 (지도 + 도서관 목록)
│   ├── globals.css             # 글로벌 스타일
│   ├── library/[id]/page.tsx   # 도서관 상세 (열람실, AI예측, 이동수단, 리뷰)
│   ├── recommend/page.tsx      # AI 추천
│   ├── dashboard/page.tsx      # 데이터 대시보드
│   ├── community/page.tsx      # 커뮤니티
│   └── api/
│       ├── libraries/route.ts  # 도서관 API (실시간 좌석)
│       ├── recommend/route.ts  # AI 추천 API
│       └── predict/route.ts    # 혼잡도 예측 API
├── lib/
│   ├── types.ts                # TypeScript 타입 정의
│   ├── mock-data.ts            # 목업 데이터
│   ├── api-client.ts           # 공공데이터 API 클라이언트
│   └── utils.ts                # 유틸리티 함수
```

## 활용 공공데이터 (4종 13개 엔드포인트)

| 데이터 | 엔드포인트 | 용도 |
|--------|-----------|------|
| 공공도서관 열람실 | 3종 | 핵심 — 좌석 현황 |
| 전국 공영자전거 | 3종 | 이동수단 연계 |
| 초정밀버스 위치 | 3종 | 이동수단 연계 |
| 교통약자 이동지원 | 4종 | 접근성 특화 |
