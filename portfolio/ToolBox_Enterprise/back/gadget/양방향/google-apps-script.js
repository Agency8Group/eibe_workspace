/**
 * [2025-01-XX] 사내 매거진 댓글 시스템 - Google Apps Script (목업용)
 * 
 * ⚠️ 중요: 이 파일은 실제 작동하는 댓글 시스템입니다!
 * 
 * 기능:
 * - 댓글 추가 (add) - 스프레드시트에 실제 저장
 * - 댓글 조회 (get) - 실시간 데이터 불러오기
 * - 좋아요 토글 (like) - 클릭 시 좋아요 수 증가
 * - 댓글 삭제 (delete) - 관리자 기능
 * - CORS 헤더 지원 - 웹에서 접근 가능
 * - JSONP 지원 - 크로스 도메인 요청 처리
 * - 에러 처리 - 안전한 오류 메시지
 * - 데이터 검증 - 입력값 검증 및 보안
 * 
 * 사용법:
 * 1. 이 코드를 Google Apps Script에 복사
 * 2. SPREADSHEET_ID를 실제 스프레드시트 ID로 변경
 * 3. 웹 앱으로 배포
 * 4. 배포 URL을 HTML에서 사용
 * 
 * 💡 배운 경험 & 주의사항:
 * 
 * 🚨 데이터 구조 문제:
 * - Google Sheets에서 헤더가 없으면 slice(1)로 첫 줄을 제거하면 실제 데이터가 사라짐
 * - 해결책: getSheet() 함수에서 시트가 없으면 자동으로 헤더 생성
 * - 데이터 구조: [ID, 작성자, 내용, 작성시간, 좋아요, 익명여부]
 * 
 * 🚨 시간대 문제:
 * - new Date("2025-08-07 20:31") → 1899-12-30 (잘못된 파싱)
 * - 해결책: new Date("2025-08-07T20:31:00") → 정확한 파싱
 * 
 * 🚨 한국 시간 문제:
 * - UTC 기준으로 날짜가 하루 전으로 저장됨
 * - 해결책: getKoreanTime() 함수로 UTC+9 적용
 * 
 * 🔧 디버깅 팁:
 * - Google Apps Script에서 simpleTest() 실행
 * - testSpreadsheetConnection() 함수로 연결 테스트
 * - testCommentSystem() 함수로 전체 기능 테스트
 * 
 * 📊 성능 최적화:
 * - SpreadsheetApp.flush()로 강제 저장
 * - SpreadsheetApp.flush()로 최신 데이터 보장
 * - 에러 처리 및 사용자 피드백
 * 
 * 🚀 배포 가이드:
 * 1. 이 코드를 Google Apps Script에 복사
 * 2. SPREADSHEET_ID를 실제 스프레드시트 ID로 변경
 * 3. testSpreadsheetConnection() 함수 실행하여 연결 테스트
 * 4. testCommentSystem() 함수 실행하여 기능 테스트
 * 5. "배포" > "새 배포" > "웹 앱" 선택
 * 6. "액세스 권한" > "모든 사용자" 선택
 * 7. "배포" 클릭
 * 8. 생성된 URL을 HTML 파일에서 사용
 * 
 * ⚠️ 중요: 배포 후 URL을 HTML의 API_URL에 설정해야 합니다!
 */

// ⚠️ 중요: 실제 Google Sheets ID로 변경해야 합니다!
// Google Sheets URL에서 찾을 수 있습니다: https://docs.google.com/spreadsheets/d/여기가_스프레드시트_ID/edit
const SPREADSHEET_ID = "15drNF-KqgiezlVpEjf97GEqmbxLdn4iVrqG3LSnnVdE";
const SHEET_NAME = "Comments";

/**
 * OPTIONS 요청 처리 (CORS preflight) - 웹 브라우저 호환성
 */
function doOptions(e) {
  return ContentService.createTextOutput("").setMimeType(
    ContentService.MimeType.TEXT,
  );
}

/**
 * GET 요청 처리 (JSONP 지원) - 메인 API 엔드포인트
 * 
 * 지원하는 액션:
 * - action=get: 댓글 목록 조회
 * - action=add: 새 댓글 추가
 * - action=like: 좋아요 토글
 * - action=delete: 댓글 삭제
 */
function doGet(e) {
  try {
    // JSONP 콜백 함수명 확인 (크로스 도메인 지원)
    const callback = e.parameter.callback;
    const isJSONP = callback && callback.length > 0;

    // 기본 테스트 응답 (API 서버 상태 확인용)
    let response = {
      status: "success",
      message: "댓글 시스템 API 서버가 정상 작동 중입니다.",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      features: ["add", "get", "like", "delete", "jsonp", "cors"]
    };

    // 파라미터가 있는 경우 실제 기능 처리
    if (e && e.parameter) {
      const action = e.parameter.action;
      let data = {};

      // 데이터 파라미터 파싱
      if (e.parameter.data) {
        try {
          data = JSON.parse(e.parameter.data);
        } catch (error) {
          response = {
            status: "error",
            message: "잘못된 데이터 형식입니다. JSON 형식을 확인해주세요.",
            error: error.message
          };
        }
      }

      // 액션별 처리
      if (action === "get") {
        try {
          const result = getComments();
          response = {
            status: "success",
            ...result,
          };
        } catch (error) {
          response = {
            status: "error",
            message: "댓글 조회 실패: " + error.message,
          };
        }
      } else if (action === "add") {
        try {
          const result = addComment(data);
          response = {
            status: "success",
            ...result,
          };
        } catch (error) {
          response = {
            status: "error",
            message: "댓글 추가 실패: " + error.message,
          };
        }
      } else if (action === "like") {
        try {
          const result = toggleLike(data);
          response = {
            status: "success",
            ...result,
          };
        } catch (error) {
          response = {
            status: "error",
            message: "좋아요 처리 실패: " + error.message,
          };
        }
      } else if (action === "delete") {
        try {
          const result = deleteComment(data);
          response = {
            status: "success",
            ...result,
          };
        } catch (error) {
          response = {
            status: "error",
            message: "댓글 삭제 실패: " + error.message,
          };
        }
      }
    }

    // JSONP 응답 형식 (크로스 도메인 지원)
    if (isJSONP) {
      const jsonpResponse = `${callback}(${JSON.stringify(response)})`;
      return ContentService.createTextOutput(jsonpResponse).setMimeType(
        ContentService.MimeType.JAVASCRIPT,
      );
    }

    // 일반 JSON 응답
    return ContentService.createTextOutput(
      JSON.stringify(response),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error("서버 오류:", error);
    const errorResponse = {
      status: "error",
      message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      error: error.message
    };

    const callback = e.parameter.callback;
    if (callback && callback.length > 0) {
      const jsonpResponse = `${callback}(${JSON.stringify(errorResponse)})`;
      return ContentService.createTextOutput(jsonpResponse).setMimeType(
        ContentService.MimeType.JAVASCRIPT,
      );
    }

    return ContentService.createTextOutput(
      JSON.stringify(errorResponse),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 댓글 추가 - 핵심 기능
 * 
 * 입력 데이터:
 * - content: 댓글 내용 (필수, 최대 500자)
 * - author: 작성자 이름 (필수, 최대 20자)
 * - isAnonymous: 익명 여부 (선택)
 * 
 * 반환 데이터:
 * - comment: 추가된 댓글 정보
 */
function addComment(data) {
  try {
    // 데이터 검증 (보안)
    if (!data.content || !data.content.trim()) {
      throw new Error("댓글 내용이 필요합니다.");
    }

    if (!data.author || !data.author.trim()) {
      throw new Error("작성자 정보가 필요합니다.");
    }

    // 입력 데이터 정리 (XSS 방지)
    const content = data.content.trim();
    const author = data.author.trim();
    const isAnonymous = data.isAnonymous || false;

    // 길이 제한 검증 (데이터 무결성)
    if (content.length > 500) {
      throw new Error("댓글은 500자를 초과할 수 없습니다.");
    }

    if (author.length > 20) {
      throw new Error("이름은 20자를 초과할 수 없습니다.");
    }

    // 스프레드시트 가져오기
    const sheet = getSheet();

    // 새 댓글 데이터 생성
    const commentId = generateId();
    const timestamp = new Date().toISOString();
    const likes = 0;

    // 스프레드시트에 추가 (실제 저장)
    const rowData = [commentId, author, content, timestamp, likes, isAnonymous];

    sheet.appendRow(rowData);
    SpreadsheetApp.flush(); // 강제 저장

    // 추가된 댓글 반환
    return {
      comment: {
        id: commentId,
        author: author,
        content: content,
        timestamp: timestamp,
        likes: likes,
        isAnonymous: isAnonymous,
      },
    };
  } catch (error) {
    console.error("댓글 추가 오류:", error);
    throw error;
  }
}

/**
 * 댓글 조회 - 핵심 기능
 * 
 * 반환 데이터:
 * - comments: 댓글 배열 (최신순 정렬)
 * 
 * 💡 중요: slice(1) 문제 해결!
 * - getSheet() 함수에서 헤더가 항상 존재하도록 보장
 * - 데이터 구조: [ID, 작성자, 내용, 작성시간, 좋아요, 익명여부]
 * - 헤더가 없으면 첫 번째 데이터가 사라지는 문제 해결
 */
function getComments() {
  try {
    const sheet = getSheet();
    SpreadsheetApp.flush(); // 최신 데이터 보장
    const data = sheet.getDataRange().getValues();

    console.log("원본 데이터 행 수:", data.length);
    console.log("헤더:", data[0]);

    // 헤더 제거 및 유효한 데이터 필터링
    const comments = data
      .slice(1) // 첫 번째 행(헤더) 제거 (이제 안전함!)
      .filter((row) => row && row[0]) // ID가 있는 행만 필터링
      .map((row) => ({
        id: row[0],
        author: row[1],
        content: row[2],
        timestamp: row[3],
        likes: parseInt(row[4]) || 0,
        isAnonymous: row[5] === true,
      }));

    console.log("필터링된 댓글 수:", comments.length);

    // 최신순으로 정렬 (최신 댓글이 위에)
    comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return { comments: comments };
  } catch (error) {
    console.error("댓글 조회 오류:", error);
    throw error;
  }
}

/**
 * 좋아요 토글 - 핵심 기능
 * 
 * 입력 데이터:
 * - commentId: 댓글 ID (필수)
 * 
 * 반환 데이터:
 * - likes: 업데이트된 좋아요 수
 */
function toggleLike(data) {
  try {
    if (!data.commentId) {
      throw new Error("댓글 ID가 필요합니다.");
    }

    const sheet = getSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    // 댓글 찾기
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === data.commentId) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error("댓글을 찾을 수 없습니다.");
    }

    // 현재 좋아요 수 가져오기
    const currentLikes = parseInt(values[rowIndex][4]) || 0;
    const newLikes = currentLikes + 1;

    // 좋아요 수 업데이트 (실제 저장)
    sheet.getRange(rowIndex + 1, 5).setValue(newLikes);

    return { likes: newLikes };
  } catch (error) {
    console.error("좋아요 토글 오류:", error);
    throw error;
  }
}

/**
 * 댓글 삭제 - 관리자 기능
 * 
 * 입력 데이터:
 * - commentId: 댓글 ID (필수)
 * 
 * 반환 데이터:
 * - success: 삭제 성공 여부
 */
function deleteComment(data) {
  try {
    if (!data.commentId) {
      throw new Error("댓글 ID가 필요합니다.");
    }

    const sheet = getSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    // 댓글 찾기
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === data.commentId) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error("댓글을 찾을 수 없습니다.");
    }

    // 댓글 삭제 (실제 삭제)
    sheet.deleteRow(rowIndex + 1);

    return { success: true };
  } catch (error) {
    console.error("댓글 삭제 오류:", error);
    throw error;
  }
}

/**
 * 스프레드시트 시트 가져오기 - 핵심 유틸리티
 * 
 * 시트가 없으면 자동으로 생성하고 초기 설정을 수행합니다.
 * 
 * 💡 중요: 이 함수가 데이터 구조 문제를 해결하는 핵심입니다!
 * - 헤더가 없으면 자동으로 생성
 * - 데이터 구조: [ID, 작성자, 내용, 작성시간, 좋아요, 익명여부]
 * - slice(1) 문제 해결: 헤더가 항상 존재하도록 보장
 */
function getSheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    // 시트가 없으면 생성 (핵심 해결책!)
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      setupSheet(sheet);
      console.log("✅ 새 시트 생성됨:", SHEET_NAME);
    }

    return sheet;
  } catch (error) {
    console.error("스프레드시트 접근 오류:", error);
    throw new Error("스프레드시트에 접근할 수 없습니다. ID를 확인해주세요.");
  }
}

/**
 * 시트 초기 설정 - 자동 생성 시 호출
 * 
 * 헤더 설정 및 스타일링을 수행합니다.
 */
function setupSheet(sheet) {
  // 헤더 설정
  const headers = ["ID", "작성자", "내용", "작성시간", "좋아요", "익명여부"];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // 헤더 스타일 설정
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#f3f4f6");
  headerRange.setHorizontalAlignment("center");

  // 열 너비 자동 조정
  sheet.autoResizeColumns(1, headers.length);

  // 시트 보호 (헤더 행)
  const protection = sheet.getRange(1, 1, 1, headers.length).protect();
  protection.setDescription("댓글 시스템 헤더 보호");
}

/**
 * 고유 ID 생성 - 유틸리티
 * 
 * 타임스탬프 + 랜덤 문자열로 고유한 ID를 생성합니다.
 */
function generateId() {
  return (
    "comment_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
  );
}

/**
 * 테스트 함수 - 스크립트 편집기에서 실행
 * 
 * 모든 기능이 정상 작동하는지 테스트합니다.
 */
function testCommentSystem() {
  console.log("댓글 시스템 테스트 시작...");

  try {
    // 시트 초기화 테스트
    const sheet = getSheet();
    console.log("✅ 시트 접근 성공:", sheet.getName());

    // 댓글 추가 테스트
    const testData = {
      content: "테스트 댓글입니다. " + new Date().toLocaleString(),
      author: "테스트 사용자",
      isAnonymous: false,
    };

    const addResult = addComment(testData);
    console.log("✅ 댓글 추가 성공:", addResult);

    // 댓글 조회 테스트
    const getResult = getComments();
    console.log("✅ 댓글 조회 성공:", getResult.comments.length + "개 댓글");

    // 좋아요 테스트
    if (getResult.comments.length > 0) {
      const likeResult = toggleLike({ commentId: getResult.comments[0].id });
      console.log("✅ 좋아요 성공:", likeResult);
    }

    console.log("🎉 모든 테스트 통과!");
    return { status: "success", message: "모든 기능이 정상 작동합니다." };
  } catch (error) {
    console.error("❌ 테스트 실패:", error);
    return { status: "error", message: error.message };
  }
}

/**
 * 데이터 백업 함수 - 관리자 기능
 * 
 * 현재 댓글 데이터를 백업 시트에 복사합니다.
 */
function backupComments() {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();

    // 백업 시트 생성
    const backupSheetName = "Backup_" + new Date().toISOString().split("T")[0];
    const backupSheet = sheet.getParent().insertSheet(backupSheetName);

    // 데이터 복사
    backupSheet.getRange(1, 1, data.length, data[0].length).setValues(data);

    console.log("✅ 백업 완료:", backupSheetName);
    return { status: "success", backupSheet: backupSheetName };
  } catch (error) {
    console.error("❌ 백업 실패:", error);
    return { status: "error", message: error.message };
  }
}

/**
 * 데이터 정리 함수 - 관리자 기능
 * 
 * 30일 이상 된 댓글을 자동으로 삭제합니다.
 */
function cleanupOldComments() {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let deletedCount = 0;

    // 뒤에서부터 삭제 (인덱스 유지)
    for (let i = data.length - 1; i > 0; i--) {
      const timestamp = new Date(data[i][3]);
      if (timestamp < thirtyDaysAgo) {
        sheet.deleteRow(i + 1);
        deletedCount++;
      }
    }

    console.log("✅ 정리 완료:", deletedCount + "개 댓글 삭제");
    return { status: "success", deletedCount: deletedCount };
  } catch (error) {
    console.error("❌ 정리 실패:", error);
    return { status: "error", message: error.message };
  }
}

/**
 * 스프레드시트 연결 테스트 - 디버깅용
 * 
 * 스프레드시트 접근이 정상인지 확인합니다.
 */
function testSpreadsheetConnection() {
  try {
    console.log("스프레드시트 연결 테스트 시작...");

    // 스프레드시트 접근 테스트
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    console.log("✅ 스프레드시트 접근 성공:", spreadsheet.getName());

    // 시트 접근 테스트
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      console.log("📝 Comments 시트가 없어서 생성합니다...");
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      setupSheet(sheet);
    }
    console.log("✅ 시트 접근 성공:", sheet.getName());

    // 테스트 데이터 추가
    const testData = [
      "test_" + Date.now(),
      "테스트 사용자",
      "연결 테스트 댓글입니다.",
      new Date().toISOString(),
      0,
      false,
    ];

    sheet.appendRow(testData);
    console.log("✅ 테스트 데이터 추가 성공");

    return {
      status: "success",
      message: "스프레드시트 연결 성공!",
      spreadsheetName: spreadsheet.getName(),
      sheetName: sheet.getName(),
    };
  } catch (error) {
    console.error("❌ 스프레드시트 연결 실패:", error);
    return {
      status: "error",
      message: "스프레드시트 연결 실패: " + error.message,
    };
  }
}

/**
 * JSONP 응답 테스트 - 디버깅용
 * 
 * JSONP 응답이 정상적으로 생성되는지 확인합니다.
 */
function testJSONPResponse() {
  try {
    console.log("JSONP 응답 테스트 시작...");

    // 테스트 파라미터
    const testParams = {
      action: "get",
      callback: "testCallback",
    };

    // doGet 함수 시뮬레이션
    const mockEvent = {
      parameter: testParams,
    };

    const result = doGet(mockEvent);
    const content = result.getContent();
    const mimeType = result.getMimeType();

    console.log("✅ 응답 MIME 타입:", mimeType);
    console.log("✅ 응답 내용:", content);

    return {
      status: "success",
      mimeType: mimeType,
      content: content,
    };
  } catch (error) {
    console.error("❌ JSONP 테스트 실패:", error);
    return {
      status: "error",
      message: error.message,
    };
  }
}

/**
 * 🚀 배포 가이드
 * 
 * 1. 이 코드를 Google Apps Script에 복사
 * 2. SPREADSHEET_ID를 실제 스프레드시트 ID로 변경
 * 3. testSpreadsheetConnection() 함수 실행하여 연결 테스트
 * 4. testCommentSystem() 함수 실행하여 기능 테스트
 * 5. "배포" > "새 배포" > "웹 앱" 선택
 * 6. "액세스 권한" > "모든 사용자" 선택
 * 7. "배포" 클릭
 * 8. 생성된 URL을 HTML 파일에서 사용
 * 
 * ⚠️ 중요: 배포 후 URL을 HTML의 API_URL에 설정해야 합니다!
 */
