function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("응답");
  
  try {
    const data = JSON.parse(e.postData.contents);
    Logger.log("파싱된 데이터:", data);

    // 각 답변을 개별 열에 저장
    sheet.appendRow([
      new Date(),        // A열: 타임스탬프
      data.emotion || '', // B열: 감정 선택
      data.q1 || '',     // C열: 누구랑 자주 일하는지
      data.q2 || '',     // D열: 회사에 바라는 점
      data.q3 || '',     // E열: 한 가지 바꿀 수 있다면
      data.q4 || '',     // F열: 한 단어로 회사 표현
      data.q5 || '',     // G열: 최근 좋았던 경험
      data.q6 || '',     // H열: 개선 제안
      data.q7 || ''      // I열: 함께 일하고 싶은 사람의 특성
    ]);

    // 헤더 추가 (아직 없는 경우)
    if (sheet.getRange("A1").getValue() === "") {
      sheet.getRange("A1:I1").setValues([[
        "제출시각",
        "감정",
        "함께 일하는 동료",
        "회사에 바라는 점",
        "바꾸고 싶은 것",
        "회사 한줄평",
        "좋았던 경험",
        "개선 제안",
        "선호하는 동료상"
      ]]);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ result: "success" })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log("에러 발생:", error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ result: "error", message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}