# 📝 Feedback Box

조직 개선을 위한 익명 피드백 수집 플랫폼입니다.

![Feedback Box Preview](https://img.shields.io/badge/Status-Live-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)

## ✨ 주요 기능

### 🎯 핵심 기능

-   **익명 피드백 수집**: 안전하고 신뢰할 수 있는 익명 피드백 시스템
-   **감정 기반 응답**: 이모티콘을 통한 직관적인 감정 표현
-   **구조화된 질문**: 조직 개선에 도움이 되는 체계적인 질문 설계
-   **실시간 제출**: Google Sheets 연동으로 즉시 데이터 저장

### 🎨 디자인 특징

-   **프리미엄 UI/UX**: 고급스러운 글래스모피즘 디자인
-   **반응형 디자인**: 모든 디바이스에서 최적화된 경험
-   **부드러운 애니메이션**: 세련된 전환 효과와 호버 애니메이션
-   **접근성 고려**: 직관적이고 사용하기 쉬운 인터페이스

## 🚀 기술 스택

### Frontend

-   **HTML5**: 시맨틱 마크업
-   **CSS3**:
    -   Tailwind CSS (유틸리티 클래스)
    -   CSS Grid & Flexbox
    -   CSS Variables (커스텀 프로퍼티)
    -   Glassmorphism 효과
    -   CSS Animations & Transitions
-   **JavaScript (ES6+)**:
    -   Fetch API
    -   DOM 조작
    -   이벤트 핸들링
    -   비동기 처리

### Backend & Storage

-   **Google Apps Script**: 서버리스 백엔드
-   **Google Sheets**: 데이터 저장소

### External Libraries

-   **Font Awesome**: 아이콘 라이브러리
-   **Google Fonts**: Noto Sans KR (한글 최적화)

## 📋 질문 구성

### 1. 감정 표현

-   😡 화남 / 😐 보통 / 🙂 좋음 / 😍 최고

### 2. 핵심 질문들

1. **업무 부담도**: 가장 부담되거나 피로한 지점
2. **긍정적 협업**: 긍정적인 인상을 받은 팀/부서
3. **개선 제안**: 가장 먼저 바꿔야 할 한 가지
4. **회사 이미지**: 회사를 한 단어로 표현
5. **긍정적 순간**: 최근 기분이 좋았던 업무 순간
6. **아이디어 제안**: 개선을 위한 제안이나 아이디어
7. **협업 선호도**: 함께 일하고 싶은 사람의 특성

## 🛠️ 설치 및 실행

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/feedback-box.git
cd feedback-box
```

### 2. 로컬 실행

```bash
# 간단한 HTTP 서버 실행 (Python 3)
python -m http.server 8000

# 또는 Node.js 사용
npx serve .

# 또는 Live Server (VS Code 확장)
```

### 3. 브라우저에서 확인

```
http://localhost:8000
```

## ⚙️ Google Sheets 연동 설정

### 1. Google Apps Script 설정

1. [Google Apps Script](https://script.google.com/) 접속
2. 새 프로젝트 생성
3. 다음 코드 입력:

```javascript
function doPost(e) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);

    const row = [
        new Date(),
        data.emotion,
        data.q1,
        data.q2,
        data.q3,
        data.q4,
        data.q5,
        data.q6,
        data.q7,
    ];

    sheet.appendRow(row);

    return ContentService.createTextOutput(
        JSON.stringify({ status: "success" })
    ).setMimeType(ContentService.MimeType.JSON);
}
```

### 2. 배포 설정

1. "배포" → "새 배포" 클릭
2. 유형: "웹 앱" 선택
3. 액세스 권한 설정
4. 배포 후 URL 복사

### 3. 코드 업데이트

`index.html`의 fetch URL을 새로 생성된 URL로 변경:

```javascript
const response = await fetch("YOUR_GOOGLE_APPS_SCRIPT_URL", {
    // ... 설정
});
```

## 📱 반응형 디자인

### 지원 디바이스

-   **데스크톱**: 1024px 이상
-   **태블릿**: 768px - 1023px
-   **모바일**: 767px 이하

### 주요 반응형 요소

-   유동적 레이아웃 (Flexbox/Grid)
-   적응형 폰트 크기
-   모바일 최적화된 터치 인터페이스
-   반응형 이미지 및 아이콘

## 🎨 디자인 시스템

### 색상 팔레트

```css
--primary-color: #0f172a; /* 다크 슬레이트 */
--accent-color: #6366f1; /* 인디고 */
--bg-light: #fafafa; /* 오프 화이트 */
--text-dark: #0f172a; /* 다크 텍스트 */
--text-subtle: #475569; /* 서브텍스트 */
```

### 그라데이션

-   **프리미엄**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
-   **골드**: `linear-gradient(135deg, #f093fb 0%, #f5576c 100%)`

### 애니메이션

-   **이징**: `cubic-bezier(0.4, 0, 0.2, 1)`
-   **지속시간**: 0.3s - 0.8s
-   **효과**: 페이드인, 스케일, 리프트

## 🔒 보안 및 개인정보

### 데이터 보호

-   **익명성 보장**: 개인 식별 정보 수집하지 않음
-   **안전한 전송**: HTTPS 통신
-   **데이터 암호화**: Google Sheets 보안 정책 준수
-   **접근 제한**: 관리자만 데이터 접근 가능

### 개인정보 처리방침

-   수집된 데이터는 조직 개선 목적으로만 사용
-   개인 식별이 불가능한 형태로 처리
-   필요시 데이터 삭제 가능

## 🤝 기여하기

### 기여 방법

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 개발 가이드라인

-   코드 스타일: Prettier + ESLint
-   커밋 메시지: Conventional Commits
-   브랜치 네이밍: `feature/`, `fix/`, `docs/`

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 문의

### 프로젝트 관련

-   **이슈 리포트**: [GitHub Issues](https://github.com/your-username/feedback-box/issues)
-   **기능 제안**: [GitHub Discussions](https://github.com/your-username/feedback-box/discussions)

### 개발팀

-   **전략기획실**: feedback@company.com
-   **기술 지원**: tech-support@company.com

## 🙏 감사의 말

-   [Tailwind CSS](https://tailwindcss.com/) - 유틸리티 CSS 프레임워크
-   [Font Awesome](https://fontawesome.com/) - 아이콘 라이브러리
-   [Google Fonts](https://fonts.google.com/) - 웹 폰트
-   [Google Apps Script](https://script.google.com/) - 서버리스 백엔드

---

<div align="center">

**Feedback Box** - 조직의 소통을 더욱 풍부하게 만들어주는 플랫폼

[![GitHub stars](https://img.shields.io/github/stars/your-username/feedback-box?style=social)](https://github.com/your-username/feedback-box/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/your-username/feedback-box?style=social)](https://github.com/your-username/feedback-box/network/members)

</div>
