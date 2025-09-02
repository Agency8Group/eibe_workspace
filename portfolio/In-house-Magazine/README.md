# 사내 매거진 | In-House Magazine

## 📖 프로젝트 개요

사내 매거진 웹사이트로, 실시간 사내 소식, 프로젝트, 조직도, 팀 스케쥴러 등을 확인할 수 있는 플랫폼입니다.

## ✨ 주요 기능

### 🎯 핵심 기능

- **실시간 댓글 시스템** - Google Apps Script + Google Sheets 연동
- **다크모드 지원** - 사용자 선호도에 따른 테마 전환
- **반응형 디자인** - 모바일, 태블릿, 데스크톱 최적화
- **실시간 업데이트** - 30초마다 자동 새로고침

### 📱 섹션별 기능

1. **지금 살펴볼 포인트** - 주요 공지사항 및 이슈
2. **포토부스** - Swiper 캐러셀로 사내 행사 사진
3. **팀 스케쥴러** - 실시간 팀 일정 모니터링
4. **인사이트** - AI 포털, 피드백박스, 오피스 게임
5. **조직도** - 실시간 조직도 모니터링
6. **기업소개서** - PDF 뷰어로 기업 정보

### 💬 댓글 시스템 특징

- **실시간 연동** - Google Sheets 기반 데이터 저장
- **스크롤 뷰** - 최대 4개 댓글 표시, 스크롤로 나머지 확인
- **이름 입력** - 사용자 이름 입력 필드
- **익명 지원** - 익명 댓글 작성 가능
- **문자 수 제한** - 500자 제한, 실시간 카운터
- **좋아요 기능** - 댓글별 좋아요 토글
- **수동 새로고침** - 새로고침 버튼으로 즉시 업데이트

## 🛠 기술 스택

### Frontend

- **HTML5** - 시맨틱 마크업
- **CSS3** - Tailwind CSS, 커스텀 애니메이션
- **JavaScript** - ES6+, 모듈화된 구조
- **Swiper.js** - 터치 슬라이더
- **Lottie** - 애니메이션 효과

### Backend

- **Google Apps Script** - 서버리스 백엔드
- **Google Sheets** - 데이터베이스
- **RESTful API** - CRUD 작업

### 외부 서비스

- **Google Fonts** - Inter, Noto Sans KR
- **CDN** - Tailwind CSS, Swiper.js

## 🚀 설치 및 실행

### 1. 기본 실행

```bash
# 프로젝트 클론
git clone [repository-url]
cd In-house-Magazine

# 웹 서버 실행 (예: Live Server)
# 또는 직접 index.html 파일 열기
```

### 2. 댓글 시스템 설정

자세한 설정 방법은 [SETUP_GUIDE.md](./SETUP_GUIDE.md)를 참조하세요.

#### 빠른 설정:

1. Google Sheets 생성
2. Google Apps Script 프로젝트 생성
3. `google-apps-script.js` 코드 복사
4. 웹 앱 배포
5. `index.html`의 API URL 업데이트

## 📁 프로젝트 구조

```
In-house-Magazine/
├── index.html                 # 메인 HTML 파일
├── google-apps-script.js      # Google Apps Script 코드
├── SETUP_GUIDE.md            # 댓글 시스템 설정 가이드
├── README.md                 # 프로젝트 설명서
├── img/                      # 이미지 파일
│   └── eibe.jpg
├── pdf/                      # PDF 문서
│   └── 2025 EIBE integrated report.pdf
└── photobooth/              # 포토부스 이미지
    ├── 대표님스튜디오 프로필 촬영.jpg
    ├── 드리미 라이브방송.jpg
    └── 드리미 본사회의.jpg
```

## 🎨 디자인 시스템

### 색상 팔레트

- **Primary**: `#4957f3` (메인 블루)
- **Primary Dark**: `#2832a2` (다크 블루)
- **Accent**: `#17c684` (그린)
- **Surface**: `#f7f9fa` (배경)
- **Text Main**: `#23262f` (주 텍스트)
- **Text Sub**: `#798092` (보조 텍스트)

### 타이포그래피

- **Primary**: Inter (영문)
- **Secondary**: Noto Sans KR (한글)

### 애니메이션

- **Fade Up**: 섹션 진입 애니메이션
- **Slide In**: 카드 슬라이드 애니메이션
- **Wave Float**: 통계 카드 웨이브 애니메이션

## 🔧 커스터마이징

### 댓글 시스템 설정

```javascript
// API URL 변경
const GAS_API_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL";

// 새로고침 간격 조정 (밀리초)
setInterval(() => {
  loadComments();
}, 30000); // 30초
```

### 스타일 커스터마이징

```css
/* Tailwind 설정에서 색상 변경 */
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: "#YOUR_COLOR";
                // ...
            }
        }
    }
}
```

## 📊 성능 최적화

### 이미지 최적화

- Lazy loading 적용
- WebP 포맷 사용 권장
- 적절한 이미지 크기 설정

### JavaScript 최적화

- 이벤트 위임 사용
- 디바운싱 적용
- 불필요한 DOM 조작 최소화

### CSS 최적화

- Critical CSS 인라인
- 미사용 CSS 제거
- 애니메이션 최적화

## 🔒 보안 고려사항

### 댓글 시스템

- 입력 데이터 검증
- XSS 방지
- CORS 설정
- 요청 제한 고려

### 일반 보안

- HTTPS 사용 권장
- 민감한 정보 노출 방지
- 정기적인 보안 업데이트

## 🐛 문제 해결

### 일반적인 문제들

#### 1. 댓글이 표시되지 않음

- API URL 확인
- Google Apps Script 로그 확인
- 브라우저 개발자 도구에서 네트워크 오류 확인

#### 2. 다크모드가 작동하지 않음

- localStorage 권한 확인
- CSS 변수 설정 확인

#### 3. 이미지가 로드되지 않음

- 파일 경로 확인
- 이미지 파일 존재 여부 확인

### 디버깅 방법

1. **브라우저 개발자 도구** (F12)
2. **Google Apps Script 로그**
3. **Google Sheets 직접 확인**

## 📈 향후 계획

### 단기 계획

- [ ] 댓글 답글 기능
- [ ] 파일 첨부 기능
- [ ] 댓글 검색 기능
- [ ] 관리자 패널

### 장기 계획

- [ ] 사용자 인증 시스템
- [ ] 실시간 알림
- [ ] 다국어 지원
- [ ] PWA 지원

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

### 기술 지원

- **담당자**: 전략기획실 지윤환 사원
- **이메일**: jyh@eibe.co.kr
- **문의**: 사내 매거진 관련 모든 문의사항

### 문서

- [설정 가이드](./SETUP_GUIDE.md) - 댓글 시스템 설정
- [Google Apps Script 문서](https://developers.google.com/apps-script)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)

## 📄 라이선스

이 프로젝트는 EIBE 내부 사용을 위한 프로젝트입니다.

---

**개발**: 전략기획실  
**최종 업데이트**: 2025년 1월  
**버전**: v1.0
