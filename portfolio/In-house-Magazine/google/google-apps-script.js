/**
 * [2025-01-XX] 사내 매거진 댓글 시스템 - Google Apps Script
 *
 * 기능:
 * - 댓글 추가 (add)
 * - 댓글 조회 (get)
 * - 좋아요 토글 (like)
 * - 댓글 삭제 (delete)
 * - CORS 헤더 지원
 * - JSONP 지원
 * - 에러 처리
 * - 데이터 검증
 */

// 스프레드시트 ID (실제 스프레드시트 ID로 변경 필요)
// Google Sheets URL에서 찾을 수 있습니다: https://docs.google.com/spreadsheets/d/여기가_스프레드시트_ID/edit
// ⚠️ 중요: 실제 Google Sheets ID를 입력해야 합니다!
const SPREADSHEET_ID = "15drNF-KqgiezlVpEjf97GEqmbxLdn4iVrqG3LSnnVdE";
const SHEET_NAME = "Comments";

/**
 * OPTIONS 요청 처리 (CORS preflight)
 */
function doOptions(e) {
  return ContentService.createTextOutput("").setMimeType(
    ContentService.MimeType.TEXT,
  );
}

/**
 * GET 요청 처리 (JSONP 지원)
 */
function doGet(e) {
  try {
    // JSONP 콜백 함수명 확인
    const callback = e.parameter.callback;
    const isJSONP = callback && callback.length > 0;

    // 기본 테스트 응답
    let response = {
      status: "success",
      message: "API 서버가 정상 작동 중입니다.",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    };

    // 파라미터가 있는 경우 처리
    if (e && e.parameter) {
      const action = e.parameter.action;
      let data = {};

      if (e.parameter.data) {
        try {
          data = JSON.parse(e.parameter.data);
        } catch (error) {
          response = {
            status: "error",
            message: "잘못된 데이터 형식입니다.",
          };
        }
      }

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
      }
    }

    // JSONP 응답 형식
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
      message: "서버 오류가 발생했습니다.",
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
 * 댓글 추가
 */
function addComment(data) {
  try {
    // 데이터 검증
    if (!data.content || !data.content.trim()) {
      throw new Error("댓글 내용이 필요합니다.");
    }

    if (!data.author || !data.author.trim()) {
      throw new Error("작성자 정보가 필요합니다.");
    }

    // 입력 데이터 정리
    const content = data.content.trim();
    const author = data.author.trim();
    const isAnonymous = data.isAnonymous || false;

    // 길이 제한 검증
    if (content.length > 500) {
      throw new Error("댓글은 500자를 초과할 수 없습니다.");
    }

    if (author.length > 20) {
      throw new Error("이름은 20자를 초과할 수 없습니다.");
    }

    // 스프레드시트 가져오기
    const sheet = getSheet();

    // 새 댓글 데이터
    const commentId = generateId();
    const timestamp = new Date().toISOString();
    const likes = 0;

    // 스프레드시트에 추가
    const rowData = [commentId, author, content, timestamp, likes, isAnonymous];

    sheet.appendRow(rowData);
    SpreadsheetApp.flush(); // Force changes to be written before finishing

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
 * 댓글 조회
 */
function getComments() {
  try {
    const sheet = getSheet();
    SpreadsheetApp.flush(); // Ensure we read the latest data
    const data = sheet.getDataRange().getValues();

    // 헤더 제거 및 유효한 데이터 필터링
    const comments = data
      .slice(1)
      .filter((row) => row && row[0]) // ID가 있는 행만 필터링
      .map((row) => ({
        id: row[0],
        author: row[1],
        content: row[2],
        timestamp: row[3],
        likes: parseInt(row[4]) || 0,
        isAnonymous: row[5] === true,
      }));

    // 최신순으로 정렬
    comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return { comments: comments };
  } catch (error) {
    console.error("댓글 조회 오류:", error);
    throw error;
  }
}

/**
 * 좋아요 토글
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

    // 좋아요 수 업데이트
    sheet.getRange(rowIndex + 1, 5).setValue(newLikes);

    return { likes: newLikes };
  } catch (error) {
    console.error("좋아요 토글 오류:", error);
    throw error;
  }
}

/**
 * 댓글 삭제
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

    // 댓글 삭제
    sheet.deleteRow(rowIndex + 1);

    return { success: true };
  } catch (error) {
    console.error("댓글 삭제 오류:", error);
    throw error;
  }
}

/**
 * 스프레드시트 시트 가져오기
 */
function getSheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    // 시트가 없으면 생성
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      setupSheet(sheet);
    }

    return sheet;
  } catch (error) {
    console.error("스프레드시트 접근 오류:", error);
    throw new Error("스프레드시트에 접근할 수 없습니다.");
  }
}

/**
 * 시트 초기 설정
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
 * 고유 ID 생성
 */
function generateId() {
  return (
    "comment_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
  );
}

/**
 * 테스트 함수 (스크립트 편집기에서 실행)
 */
function testCommentSystem() {
  console.log("댓글 시스템 테스트 시작...");

  try {
    // 시트 초기화 테스트
    const sheet = getSheet();
    console.log("시트 접근 성공:", sheet.getName());

    // 댓글 추가 테스트
    const testData = {
      content: "테스트 댓글입니다.",
      author: "테스트 사용자",
      isAnonymous: false,
    };

    const addResult = addComment(testData);
    console.log("댓글 추가 성공:", addResult);

    // 댓글 조회 테스트
    const getResult = getComments();
    console.log("댓글 조회 성공:", getResult.comments.length + "개 댓글");

    // 좋아요 테스트
    if (getResult.comments.length > 0) {
      const likeResult = toggleLike({ commentId: getResult.comments[0].id });
      console.log("좋아요 성공:", likeResult);
    }

    console.log("모든 테스트 통과!");
  } catch (error) {
    console.error("테스트 실패:", error);
  }
}

/**
 * 데이터 백업 함수
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

    console.log("백업 완료:", backupSheetName);
  } catch (error) {
    console.error("백업 실패:", error);
  }
}

/**
 * 데이터 정리 함수 (30일 이상 된 댓글 삭제)
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

    console.log("정리 완료:", deletedCount + "개 댓글 삭제");
  } catch (error) {
    console.error("정리 실패:", error);
  }
}

/**
 * 스프레드시트 연결 테스트
 */
function testSpreadsheetConnection() {
  try {
    console.log("스프레드시트 연결 테스트 시작...");

    // 스프레드시트 접근 테스트
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    console.log("스프레드시트 접근 성공:", spreadsheet.getName());

    // 시트 접근 테스트
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      console.log("Comments 시트가 없어서 생성합니다...");
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      setupSheet(sheet);
    }
    console.log("시트 접근 성공:", sheet.getName());

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
    console.log("테스트 데이터 추가 성공");

    return {
      status: "success",
      message: "스프레드시트 연결 성공!",
      spreadsheetName: spreadsheet.getName(),
      sheetName: sheet.getName(),
    };
  } catch (error) {
    console.error("스프레드시트 연결 실패:", error);
    return {
      status: "error",
      message: "스프레드시트 연결 실패: " + error.message,
    };
  }
}

/**
 * JSONP 응답 테스트
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

    console.log("응답 MIME 타입:", mimeType);
    console.log("응답 내용:", content);

    return {
      status: "success",
      mimeType: mimeType,
      content: content,
    };
  } catch (error) {
    console.error("JSONP 테스트 실패:", error);
    return {
      status: "error",
      message: error.message,
    };
  }
}
